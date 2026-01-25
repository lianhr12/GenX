import { randomUUID } from 'crypto';

import {
  Checkout,
  type FlatCheckoutCompleted,
  type FlatSubscriptionEvent,
  Portal,
  Webhook,
  type WebhookOptions,
} from '@creem_io/nextjs';
import { createCreem } from 'creem_io';
import { desc, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';

import { websiteConfig } from '@/config/website';
import { addCredits, addSubscriptionCredits } from '@/credits/credits';
import { getCreditPackageById } from '@/credits/server';
import { CREDIT_TRANSACTION_TYPE } from '@/credits/types';
import { getDb } from '@/db';
import { payment, user } from '@/db/schema';
import { findPlanByPlanId, findPriceInPlan } from '@/lib/price-plan';
import { sendNotification } from '@/notification/notification';

import {
  type CheckoutResult,
  type CreateCheckoutParams,
  type CreateCreditCheckoutParams,
  type CreatePortalParams,
  type PaymentProvider,
  PaymentScenes,
  type PaymentStatus,
  PaymentTypes,
  type PlanInterval,
  PlanIntervals,
  type PortalResult,
  type Subscription,
  type getSubscriptionsParams,
} from '../types';
import { CreemError, CreemErrorType } from './creem-types';
import {
  type DbTransaction,
  checkSubscriptionWebhookIdempotency,
  executeWithTransaction,
  getValidatedCreemConfig,
  logCreem,
  mapCreemStatusToPaymentStatus,
  validateCreditPurchaseMetadata,
  validateSubscriptionMetadata,
  validateWebhookMetadata,
} from './creem-utils';

/**
 * Creem payment provider implementation using @creem_io/nextjs SDK
 *
 * Implements the PaymentProvider interface for Creem payment processing.
 * Supports subscriptions, one-time payments, and credit package purchases.
 */
export class CreemProvider implements PaymentProvider {
  private creem: ReturnType<typeof createCreem>;
  private apiKey: string;
  private webhookSecret: string;
  private testMode: boolean;

  /**
   * Initialize Creem provider with API key and webhook secret
   *
   * @throws CreemError with CONFIGURATION type if required environment variables are not set
   */
  constructor() {
    const config = getValidatedCreemConfig();

    this.apiKey = config.apiKey;
    this.webhookSecret = config.webhookSecret;
    this.testMode = config.testMode;

    // Initialize the SDK for direct API calls
    this.creem = createCreem({
      apiKey: this.apiKey,
      testMode: this.testMode,
    });

    logCreem('info', 'CreemProvider initialized successfully', {
      testMode: this.testMode,
    });
  }

  /**
   * Get the checkout route handler for Next.js API routes
   */
  public getCheckoutHandler() {
    return Checkout({
      apiKey: this.apiKey,
      testMode: this.testMode,
      defaultSuccessUrl: '/success',
    });
  }

  /**
   * Get the portal route handler for Next.js API routes
   */
  public getPortalHandler() {
    return Portal({
      apiKey: this.apiKey,
      testMode: this.testMode,
    });
  }

  /**
   * Get the webhook route handler for Next.js API routes
   */
  public getWebhookHandler() {
    const options: WebhookOptions = {
      webhookSecret: this.webhookSecret,
      onCheckoutCompleted: async (data) => {
        try {
          await this.onCheckoutCompleted(data);
        } catch (error) {
          const creemError =
            error instanceof CreemError
              ? error
              : CreemError.webhookError(
                  'Failed to process checkout.completed webhook',
                  error instanceof Error ? error : new Error(String(error)),
                  { webhookId: data.webhookId }
                );
          logCreem(
            'error',
            'Webhook checkout.completed error',
            creemError.getFullDetails()
          );
          throw creemError;
        }
      },
      onSubscriptionActive: async (data) => {
        try {
          await this.onSubscriptionActive(data);
        } catch (error) {
          const creemError =
            error instanceof CreemError
              ? error
              : CreemError.webhookError(
                  'Failed to process subscription.active webhook',
                  error instanceof Error ? error : new Error(String(error)),
                  { subscriptionId: data.id, webhookId: data.webhookId }
                );
          logCreem(
            'error',
            'Webhook subscription.active error',
            creemError.getFullDetails()
          );
          throw creemError;
        }
      },
      onSubscriptionPaid: async (data) => {
        try {
          await this.onSubscriptionPaid(data);
        } catch (error) {
          const creemError =
            error instanceof CreemError
              ? error
              : CreemError.webhookError(
                  'Failed to process subscription.paid webhook',
                  error instanceof Error ? error : new Error(String(error)),
                  { subscriptionId: data.id, webhookId: data.webhookId }
                );
          logCreem(
            'error',
            'Webhook subscription.paid error',
            creemError.getFullDetails()
          );
          throw creemError;
        }
      },
      onSubscriptionCanceled: async (data) => {
        try {
          await this.onSubscriptionCanceled(data);
        } catch (error) {
          const creemError =
            error instanceof CreemError
              ? error
              : CreemError.webhookError(
                  'Failed to process subscription.canceled webhook',
                  error instanceof Error ? error : new Error(String(error)),
                  { subscriptionId: data.id, webhookId: data.webhookId }
                );
          logCreem(
            'error',
            'Webhook subscription.canceled error',
            creemError.getFullDetails()
          );
          throw creemError;
        }
      },
      onSubscriptionExpired: async (data) => {
        try {
          await this.onSubscriptionExpired(data);
        } catch (error) {
          const creemError =
            error instanceof CreemError
              ? error
              : CreemError.webhookError(
                  'Failed to process subscription.expired webhook',
                  error instanceof Error ? error : new Error(String(error)),
                  { subscriptionId: data.id, webhookId: data.webhookId }
                );
          logCreem(
            'error',
            'Webhook subscription.expired error',
            creemError.getFullDetails()
          );
          throw creemError;
        }
      },
    };
    return Webhook(options);
  }

  /**
   * Create a checkout session for a plan
   */
  public async createCheckout(
    params: CreateCheckoutParams
  ): Promise<CheckoutResult> {
    const { planId, priceId, customerEmail, successUrl, metadata } = params;

    try {
      const plan = findPlanByPlanId(planId);
      if (!plan) {
        throw CreemError.validationError(
          `Plan with ID ${planId} not found`,
          undefined,
          {
            planId,
          }
        );
      }

      const price = findPriceInPlan(planId, priceId);
      if (!price) {
        throw CreemError.validationError(
          `Price ID ${priceId} not found in plan ${planId}`,
          undefined,
          { planId, priceId }
        );
      }

      const creemProductId = price.creemProductId;
      if (!creemProductId) {
        throw CreemError.configurationError(
          `Creem product ID not configured for price ${priceId}`,
          undefined,
          { priceId }
        );
      }

      const customMetadata: Record<string, string> = {
        ...metadata,
        planId,
        priceId,
      };

      const checkout = await this.creem.checkouts.create({
        productId: creemProductId,
        customer: customerEmail ? { email: customerEmail } : undefined,
        successUrl: successUrl ?? '',
        metadata: customMetadata,
      });

      if (!checkout.checkoutUrl) {
        throw CreemError.validationError(
          'Creem checkout URL not returned',
          undefined,
          {
            checkoutId: checkout.id,
          }
        );
      }

      return {
        url: checkout.checkoutUrl,
        id: checkout.id,
      };
    } catch (error: unknown) {
      if (error instanceof CreemError) {
        logCreem(
          'error',
          'Creem create checkout error',
          error.getFullDetails()
        );
        throw error;
      }

      const originalError =
        error instanceof Error ? error : new Error(String(error));
      const errorMessage = originalError.message.toLowerCase();

      let creemError: CreemError;

      if (
        errorMessage.includes('network') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('econnrefused') ||
        errorMessage.includes('fetch failed')
      ) {
        creemError = CreemError.networkError(
          'Failed to create Creem checkout session',
          originalError,
          { planId, priceId }
        );
      } else {
        creemError = CreemError.validationError(
          'Failed to create Creem checkout session',
          originalError,
          { planId, priceId }
        );
      }

      logCreem(
        'error',
        'Creem create checkout error',
        creemError.getFullDetails()
      );
      throw creemError;
    }
  }

  /**
   * Create a checkout session for a credit package
   */
  public async createCreditCheckout(
    params: CreateCreditCheckoutParams
  ): Promise<CheckoutResult> {
    const { packageId, customerEmail, successUrl, metadata } = params;

    try {
      const creditPackage = getCreditPackageById(packageId);
      if (!creditPackage) {
        throw CreemError.validationError(
          `Credit package with ID ${packageId} not found`,
          undefined,
          { packageId }
        );
      }

      const creemProductId = creditPackage.price.creemProductId;
      if (!creemProductId) {
        throw CreemError.configurationError(
          `Creem product ID not configured for credit package ${packageId}`,
          undefined,
          { packageId }
        );
      }

      const customMetadata: Record<string, string> = {
        ...metadata,
        packageId,
        priceId: creditPackage.price.priceId,
        credits: String(creditPackage.amount),
        type: 'credit_purchase',
      };

      const checkout = await this.creem.checkouts.create({
        productId: creemProductId,
        customer: customerEmail ? { email: customerEmail } : undefined,
        successUrl: successUrl ?? '',
        metadata: customMetadata,
      });

      if (!checkout.checkoutUrl) {
        throw CreemError.validationError(
          'Creem checkout URL not returned',
          undefined,
          {
            checkoutId: checkout.id,
            packageId,
          }
        );
      }

      return {
        url: checkout.checkoutUrl,
        id: checkout.id,
      };
    } catch (error) {
      if (error instanceof CreemError) {
        logCreem(
          'error',
          'Creem create credit checkout error',
          error.getFullDetails()
        );
        throw error;
      }

      const originalError =
        error instanceof Error ? error : new Error(String(error));
      const errorMessage = originalError.message.toLowerCase();

      let creemError: CreemError;

      if (
        errorMessage.includes('network') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('econnrefused') ||
        errorMessage.includes('fetch failed')
      ) {
        creemError = CreemError.networkError(
          'Failed to create Creem credit checkout session',
          originalError,
          { packageId }
        );
      } else {
        creemError = CreemError.validationError(
          'Failed to create Creem credit checkout session',
          originalError,
          { packageId }
        );
      }

      logCreem(
        'error',
        'Creem create credit checkout error',
        creemError.getFullDetails()
      );
      throw creemError;
    }
  }

  /**
   * Create a customer portal session
   */
  public async createCustomerPortal(
    params: CreatePortalParams
  ): Promise<PortalResult> {
    const { customerId } = params;

    try {
      if (!customerId) {
        throw CreemError.validationError(
          'Customer ID is required for portal session',
          undefined,
          { customerId }
        );
      }

      const portalSession = await this.creem.customers.createPortal({
        customerId,
      });

      if (!portalSession.customerPortalLink) {
        throw CreemError.validationError(
          'Creem customer portal URL not returned',
          undefined,
          { customerId }
        );
      }

      return {
        url: portalSession.customerPortalLink,
      };
    } catch (error) {
      if (error instanceof CreemError) {
        logCreem(
          'error',
          'Creem create customer portal error',
          error.getFullDetails()
        );
        throw error;
      }

      const originalError =
        error instanceof Error ? error : new Error(String(error));
      const errorMessage = originalError.message.toLowerCase();

      let creemError: CreemError;

      if (
        errorMessage.includes('network') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('econnrefused') ||
        errorMessage.includes('fetch failed')
      ) {
        creemError = CreemError.networkError(
          'Failed to create Creem customer portal session due to network error',
          originalError,
          { customerId }
        );
      } else if (
        errorMessage.includes('api key') ||
        errorMessage.includes('unauthorized') ||
        errorMessage.includes('forbidden') ||
        errorMessage.includes('not configured')
      ) {
        creemError = CreemError.configurationError(
          'Failed to create Creem customer portal session due to configuration error',
          originalError,
          { customerId }
        );
      } else if (
        errorMessage.includes('not found') ||
        errorMessage.includes('invalid customer')
      ) {
        creemError = CreemError.validationError(
          'Customer not found or invalid customer ID',
          originalError,
          { customerId }
        );
      } else {
        creemError = CreemError.validationError(
          'Failed to create Creem customer portal session',
          originalError,
          { customerId }
        );
      }

      logCreem(
        'error',
        'Creem create customer portal error',
        creemError.getFullDetails()
      );
      throw creemError;
    }
  }

  /**
   * Get subscriptions for a user
   */
  public async getSubscriptions(
    params: getSubscriptionsParams
  ): Promise<Subscription[]> {
    const { userId } = params;

    try {
      const db = await getDb();
      const subscriptions = await db
        .select()
        .from(payment)
        .where(eq(payment.userId, userId))
        .orderBy(desc(payment.createdAt));

      return subscriptions.map((subscription) => ({
        id: subscription.subscriptionId || '',
        customerId: subscription.customerId,
        priceId: subscription.priceId,
        status: subscription.status as PaymentStatus,
        type: subscription.type as PaymentTypes,
        interval: subscription.interval as PlanInterval,
        currentPeriodStart: subscription.periodStart || undefined,
        currentPeriodEnd: subscription.periodEnd || undefined,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd || false,
        trialStartDate: subscription.trialStart || undefined,
        trialEndDate: subscription.trialEnd || undefined,
        createdAt: subscription.createdAt,
      }));
    } catch (error) {
      logCreem('error', 'Creem list customer subscriptions error', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Handle webhook event from Creem (legacy interface for PaymentProvider)
   *
   * @deprecated Use {@link getWebhookHandler} instead
   */
  public async handleWebhookEvent(
    payload: string,
    signature: string
  ): Promise<void> {
    logCreem(
      'warn',
      'handleWebhookEvent is deprecated, use getWebhookHandler() instead',
      {
        signatureProvided: !!signature,
      }
    );

    const request = new Request('http://localhost/api/webhooks/creem', {
      method: 'POST',
      headers: {
        'creem-signature': signature,
        'content-type': 'application/json',
      },
      body: payload,
    });

    try {
      const handler = this.getWebhookHandler();
      await handler(request as unknown as NextRequest);
    } catch (error) {
      if (error instanceof CreemError) {
        throw error;
      }
      throw CreemError.webhookError(
        'Failed to process webhook event',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Handle checkout.completed event
   */
  private async onCheckoutCompleted(
    data: FlatCheckoutCompleted
  ): Promise<void> {
    const checkoutId = data.order?.id || data.webhookId;
    const customerId = data.customer?.id;
    const rawMetadata = data.metadata;

    logCreem('info', 'Handle Creem checkout.completed event', {
      eventType: 'checkout.completed',
      checkoutId,
      customerId,
    });

    const validatedMetadata = validateWebhookMetadata(rawMetadata);

    if (!validatedMetadata) {
      logCreem(
        'error',
        'Invalid metadata in checkout.completed event - missing required userId',
        {
          eventType: 'checkout.completed',
          checkoutId,
          rawMetadata,
        }
      );
      return;
    }

    const userId = validatedMetadata.userId;

    if (!customerId) {
      logCreem('warn', 'No customerId found in checkout event', {
        eventType: 'checkout.completed',
        checkoutId,
        userId,
      });
      return;
    }

    try {
      const db = await getDb();

      // Check idempotency
      const existingPayment = await db
        .select({ id: payment.id })
        .from(payment)
        .where(eq(payment.sessionId, checkoutId))
        .limit(1);

      if (existingPayment.length > 0) {
        logCreem('info', 'Checkout already processed (idempotency check)', {
          eventType: 'checkout.completed',
          checkoutId,
          existingPaymentId: existingPayment[0].id,
        });
        return;
      }

      if (validatedMetadata.type === 'credit_purchase') {
        const creditValidation = validateCreditPurchaseMetadata(rawMetadata);
        if (!creditValidation.isValid || !creditValidation.metadata) {
          logCreem('error', 'Invalid metadata for credit purchase', {
            eventType: 'checkout.completed',
            checkoutId,
            error: creditValidation.error,
            missingFields: creditValidation.missingFields,
          });
          return;
        }

        await this.handleCreditPurchase(
          data,
          checkoutId,
          customerId,
          creditValidation.metadata.userId,
          creditValidation.metadata
        );
      } else {
        logCreem('warn', 'Unsupported checkout metadata type', {
          eventType: 'checkout.completed',
          checkoutId,
          type: validatedMetadata.type,
        });
        return;
      }
    } catch (error) {
      logCreem('error', 'onCheckoutCompleted error', {
        eventType: 'checkout.completed',
        checkoutId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  /**
   * Handle credit package purchase
   */
  private async handleCreditPurchase(
    data: FlatCheckoutCompleted,
    checkoutId: string,
    customerId: string,
    userId: string,
    metadata: import('./creem-types').CreemWebhookMetadata
  ): Promise<void> {
    logCreem('info', 'Handle Creem credit purchase', {
      checkoutId,
      userId,
      customerId,
    });

    const packageId = metadata.packageId;
    const credits = metadata.credits;
    const priceId = metadata.priceId;

    if (!packageId || !credits) {
      logCreem('error', 'Missing packageId or credits in validated metadata', {
        packageId,
        credits,
        checkoutId,
      });
      return;
    }

    const creditPackage = getCreditPackageById(packageId);
    if (!creditPackage) {
      logCreem('warn', 'Credit package not found', { packageId });
      return;
    }

    const amount = data.product?.price ? data.product.price / 100 : 0;
    const paymentId = randomUUID();

    await executeWithTransaction('credit_purchase', async (tx) => {
      const now = new Date();

      // Insert payment record with scene = CREDIT
      await tx.insert(payment).values({
        id: paymentId,
        priceId: priceId || '',
        type: PaymentTypes.ONE_TIME,
        scene: PaymentScenes.CREDIT,
        userId: userId,
        customerId: customerId,
        sessionId: checkoutId,
        status: 'completed',
        paid: true,
        periodStart: now,
        createdAt: now,
        updatedAt: now,
      });

      logCreem('info', 'Created payment record in transaction', {
        operation: 'insert',
        table: 'payment',
        paymentId,
        type: PaymentTypes.ONE_TIME,
        scene: PaymentScenes.CREDIT,
        userId,
        sessionId: checkoutId,
      });

      // Update user's customerId
      await tx
        .update(user)
        .set({
          customerId: customerId,
          updatedAt: now,
        })
        .where(eq(user.id, userId));

      logCreem('info', 'Updated user with customerId', {
        userId,
        customerId: customerId.substring(0, 8) + '...',
      });
    });

    // Allocate credits outside of transaction (GenX uses non-transactional credit operations)
    await addCredits({
      userId,
      amount: Number.parseInt(credits),
      type: CREDIT_TRANSACTION_TYPE.PURCHASE_PACKAGE,
      description: `+${credits} credits for package ${packageId} ($${amount.toLocaleString()})`,
      paymentId: checkoutId,
      expireDays: creditPackage.expireDays,
    });

    logCreem('info', 'Credit purchase completed', {
      userId,
      credits,
      packageId,
      paymentId,
    });
  }

  /**
   * Handle subscription.active event
   */
  private async onSubscriptionActive(
    data: FlatSubscriptionEvent<'subscription.active'>
  ): Promise<void> {
    const subscriptionId = data.id;
    const customerId = data.customer?.id;
    const rawMetadata = data.metadata;

    logCreem('info', 'Handle Creem subscription.active event', {
      subscriptionId,
      customerId,
    });

    const validationResult = validateSubscriptionMetadata(rawMetadata);

    if (!validationResult.isValid || !validationResult.metadata) {
      logCreem('error', 'Invalid metadata in subscription.active event', {
        subscriptionId,
        error: validationResult.error,
        missingFields: validationResult.missingFields,
      });
      return;
    }

    const metadata = validationResult.metadata;
    const userId = metadata.userId;
    const priceId = metadata.priceId;

    if (!customerId) {
      logCreem('warn', 'No customerId found in subscription event', {
        subscriptionId,
        userId,
      });
      return;
    }

    if (!priceId) {
      logCreem('error', 'No priceId found in validated subscription metadata', {
        subscriptionId,
        userId,
      });
      return;
    }

    try {
      const db = await getDb();

      // Check idempotency
      const existingPayment = await db
        .select({ id: payment.id })
        .from(payment)
        .where(eq(payment.subscriptionId, subscriptionId))
        .limit(1);

      if (existingPayment.length > 0) {
        logCreem('info', 'Subscription already exists, skipping', {
          subscriptionId,
        });
        return;
      }

      const periodStart = data.current_period_start_date
        ? new Date(data.current_period_start_date)
        : new Date();
      const periodEnd = data.current_period_end_date
        ? new Date(data.current_period_end_date)
        : undefined;

      const interval = this.mapCreemIntervalToPlanInterval(
        data.product?.billing_period
      );
      const paymentId = randomUUID();

      await executeWithTransaction('subscription_active', async (tx) => {
        const now = new Date();
        const mappedStatus = mapCreemStatusToPaymentStatus('active');

        // Insert payment record with scene = SUBSCRIPTION
        const result = await tx
          .insert(payment)
          .values({
            id: paymentId,
            priceId: priceId,
            type: PaymentTypes.SUBSCRIPTION,
            scene: PaymentScenes.SUBSCRIPTION,
            userId: userId,
            customerId: customerId,
            subscriptionId: subscriptionId,
            interval: interval,
            status: mappedStatus,
            paid: true,
            periodStart: periodStart,
            periodEnd: periodEnd,
            cancelAtPeriodEnd: false,
            createdAt: now,
            updatedAt: now,
          })
          .returning({ id: payment.id });

        if (result.length === 0) {
          throw new Error('Failed to create subscription record');
        }

        logCreem('info', 'Created subscription payment record in transaction', {
          operation: 'insert',
          table: 'payment',
          paymentId: result[0].id,
          type: PaymentTypes.SUBSCRIPTION,
          scene: PaymentScenes.SUBSCRIPTION,
          userId,
          subscriptionId,
          status: mappedStatus,
        });

        // Update user's customerId
        await tx
          .update(user)
          .set({
            customerId: customerId,
            updatedAt: now,
          })
          .where(eq(user.id, userId));

        logCreem('info', 'Updated user with customerId', {
          userId,
          customerId: customerId.substring(0, 8) + '...',
        });
      });

      // Allocate subscription credits outside of transaction
      if (websiteConfig.credits?.enableCredits) {
        await addSubscriptionCredits(userId, priceId);
        logCreem('info', 'Added subscription credits for user', {
          userId,
          priceId,
        });
      }

      logCreem('info', 'Subscription activated', {
        subscriptionId,
        userId,
        priceId,
        paymentId,
      });

      // Send notification outside of transaction (non-critical)
      const amount = data.product?.price ? data.product.price / 100 : 0;
      await this.sendNotificationSafely(
        subscriptionId,
        customerId,
        userId,
        amount,
        'subscription_active'
      );
    } catch (error) {
      logCreem('error', 'onSubscriptionActive error', {
        subscriptionId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  /**
   * Send notification safely with failure isolation
   */
  private async sendNotificationSafely(
    transactionId: string,
    customerId: string,
    userId: string,
    amount: number,
    eventType:
      | 'subscription_active'
      | 'subscription_renewal'
      | 'onetime_payment'
  ): Promise<void> {
    try {
      await sendNotification(transactionId, customerId, userId, amount);
      logCreem('info', 'Notification sent successfully', {
        eventType,
        transactionId,
        customerId: customerId.substring(0, 8) + '...',
        userId,
        amount,
      });
    } catch (error) {
      logCreem(
        'error',
        'Failed to send notification, continuing without notification',
        {
          eventType,
          transactionId,
          customerId: customerId.substring(0, 8) + '...',
          userId,
          amount,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        }
      );
    }
  }

  /**
   * Map Creem interval string to PlanInterval
   */
  private mapCreemIntervalToPlanInterval(interval?: string): PlanInterval {
    if (!interval) {
      logCreem('warn', 'No interval provided, defaulting to "month"', {
        originalInterval: interval,
        defaultValue: PlanIntervals.MONTH,
      });
      return PlanIntervals.MONTH;
    }

    const normalizedInterval = interval.toLowerCase();

    switch (normalizedInterval) {
      case 'month':
      case 'monthly':
        return PlanIntervals.MONTH;
      case 'year':
      case 'yearly':
      case 'annual':
      case 'annually':
        return PlanIntervals.YEAR;
      default:
        logCreem('warn', 'Unknown interval value, defaulting to "month"', {
          originalInterval: interval,
          normalizedInterval,
          defaultValue: PlanIntervals.MONTH,
        });
        return PlanIntervals.MONTH;
    }
  }

  /**
   * Handle subscription.paid event
   */
  private async onSubscriptionPaid(
    data: FlatSubscriptionEvent<'subscription.paid'>
  ): Promise<void> {
    const webhookId = data.webhookId || '';
    const subscriptionId = data.id;

    logCreem('info', 'Handle Creem subscription.paid event', {
      subscriptionId,
      webhookId,
    });

    try {
      const idempotencyResult = await checkSubscriptionWebhookIdempotency(
        subscriptionId,
        webhookId
      );

      if (idempotencyResult.isProcessed) {
        logCreem(
          'info',
          'Subscription.paid webhook already processed, skipping',
          {
            subscriptionId,
            webhookId,
          }
        );
        return;
      }

      const db = await getDb();

      const payments = await db
        .select({
          id: payment.id,
          userId: payment.userId,
          priceId: payment.priceId,
          customerId: payment.customerId,
          periodStart: payment.periodStart,
          periodEnd: payment.periodEnd,
        })
        .from(payment)
        .where(eq(payment.subscriptionId, subscriptionId))
        .limit(1);

      if (payments.length === 0) {
        logCreem('warn', 'No payment record found for subscription', {
          subscriptionId,
          webhookId,
        });
        return;
      }

      const currentPayment = payments[0];

      const newPeriodStart = data.current_period_start_date
        ? new Date(data.current_period_start_date)
        : undefined;
      const newPeriodEnd = data.current_period_end_date
        ? new Date(data.current_period_end_date)
        : undefined;

      const isRenewal =
        currentPayment.periodStart &&
        newPeriodStart &&
        currentPayment.periodStart.getTime() !== newPeriodStart.getTime();

      await executeWithTransaction('subscription_paid', async (tx) => {
        const now = new Date();
        const mappedStatus = mapCreemStatusToPaymentStatus('active');

        const result = await tx
          .update(payment)
          .set({
            status: mappedStatus,
            paid: true,
            periodStart: newPeriodStart,
            periodEnd: newPeriodEnd,
            updatedAt: now,
          })
          .where(eq(payment.subscriptionId, subscriptionId))
          .returning({ id: payment.id });

        if (result.length === 0) {
          throw new Error('No subscription record updated');
        }

        logCreem('info', 'Updated subscription record', {
          subscriptionId,
          webhookId,
          paymentId: result[0].id,
          isRenewal,
        });
      });

      // Allocate renewal credits outside of transaction
      if (isRenewal && websiteConfig.credits?.enableCredits) {
        await addSubscriptionCredits(
          currentPayment.userId,
          currentPayment.priceId
        );
        logCreem('info', 'Added subscription renewal credits for user', {
          userId: currentPayment.userId,
          priceId: currentPayment.priceId,
        });
      }

      // Send notification for renewals
      if (isRenewal) {
        const amount = data.product?.price ? data.product.price / 100 : 0;
        await this.sendNotificationSafely(
          subscriptionId,
          currentPayment.customerId,
          currentPayment.userId,
          amount,
          'subscription_renewal'
        );
      }
    } catch (error) {
      logCreem('error', 'onSubscriptionPaid error', {
        subscriptionId,
        webhookId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  /**
   * Handle subscription.canceled event
   */
  private async onSubscriptionCanceled(
    data: FlatSubscriptionEvent<'subscription.canceled'>
  ): Promise<void> {
    const webhookId = data.webhookId || '';
    const subscriptionId = data.id;

    logCreem('info', 'Handle Creem subscription.canceled event', {
      subscriptionId,
      webhookId,
    });

    try {
      const idempotencyResult = await checkSubscriptionWebhookIdempotency(
        subscriptionId,
        webhookId,
        'canceled'
      );

      if (idempotencyResult.isProcessed) {
        logCreem(
          'info',
          'Subscription.canceled webhook already processed or already canceled, skipping',
          {
            subscriptionId,
            webhookId,
            currentStatus: idempotencyResult.existingPayment?.status,
          }
        );
        return;
      }

      const db = await getDb();
      const now = new Date();

      const periodEndDate = data.current_period_end_date
        ? new Date(data.current_period_end_date)
        : null;

      const cancelAtPeriodEnd = periodEndDate !== null && periodEndDate > now;

      logCreem('info', 'Determining cancelAtPeriodEnd status', {
        subscriptionId,
        periodEndDate: periodEndDate?.toISOString(),
        now: now.toISOString(),
        cancelAtPeriodEnd,
      });

      const mappedStatus = mapCreemStatusToPaymentStatus('canceled');

      const result = await db
        .update(payment)
        .set({
          status: mappedStatus,
          cancelAtPeriodEnd: cancelAtPeriodEnd,
          updatedAt: now,
        })
        .where(eq(payment.subscriptionId, subscriptionId))
        .returning({ id: payment.id });

      if (result.length > 0) {
        logCreem('info', 'Marked subscription as canceled', {
          subscriptionId,
          webhookId,
          paymentId: result[0].id,
          cancelAtPeriodEnd,
          periodEndDate: periodEndDate?.toISOString(),
        });
      } else {
        logCreem('warn', 'No subscription record found to cancel', {
          subscriptionId,
          webhookId,
        });
      }
    } catch (error) {
      logCreem('error', 'onSubscriptionCanceled error', {
        subscriptionId,
        webhookId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  /**
   * Handle subscription.expired event
   */
  private async onSubscriptionExpired(
    data: FlatSubscriptionEvent<'subscription.expired'>
  ): Promise<void> {
    const webhookId = data.webhookId || '';
    const subscriptionId = data.id;

    logCreem('info', 'Handle Creem subscription.expired event', {
      subscriptionId,
      webhookId,
    });

    try {
      const idempotencyResult = await checkSubscriptionWebhookIdempotency(
        subscriptionId,
        webhookId,
        'incomplete_expired'
      );

      if (idempotencyResult.isProcessed) {
        logCreem(
          'info',
          'Subscription.expired webhook already processed or already expired, skipping',
          {
            subscriptionId,
            webhookId,
            currentStatus: idempotencyResult.existingPayment?.status,
          }
        );
        return;
      }

      const db = await getDb();
      const now = new Date();
      const mappedStatus = mapCreemStatusToPaymentStatus('expired');

      const result = await db
        .update(payment)
        .set({
          status: mappedStatus,
          updatedAt: now,
        })
        .where(eq(payment.subscriptionId, subscriptionId))
        .returning({ id: payment.id });

      if (result.length > 0) {
        logCreem('info', 'Marked subscription as expired', {
          subscriptionId,
          webhookId,
          paymentId: result[0].id,
        });
      } else {
        logCreem('warn', 'No subscription record found to expire', {
          subscriptionId,
          webhookId,
        });
      }
    } catch (error) {
      logCreem('error', 'onSubscriptionExpired error', {
        subscriptionId,
        webhookId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }
}

// Re-export components from @creem_io/nextjs for convenience
export { CreemCheckout, CreemPortal } from '@creem_io/nextjs';
