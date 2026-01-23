/**
 * Creem Payment Provider Utility Functions
 *
 * This file contains utility functions for the Creem payment provider,
 * including metadata validation, status mapping, idempotency checks, logging,
 * configuration validation, and transaction helpers.
 */

import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { getDb } from '@/db';
import { payment, user } from '@/db/schema';
import type * as schema from '@/db/schema';

import type { PaymentStatus } from '../types';
import {
  CreemError,
  CreemErrorType,
  CreemSubscriptionStatus,
  type CreemWebhookMetadata,
} from './creem-types';

/**
 * Database type alias for transaction context
 */
export type DbTransaction = Parameters<
  Parameters<NodePgDatabase<typeof schema>['transaction']>[0]
>[0];

/**
 * Log prefix for Creem provider
 */
const LOG_PREFIX = '[Creem]';

/**
 * Log levels for structured logging
 */
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

/**
 * Structured logging function for Creem operations
 * Provides consistent log format with prefix and optional context
 *
 * @param level - Log level (info, warn, error, debug)
 * @param message - Log message
 * @param context - Optional context object with additional information
 */
export function logCreem(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
): void {
  const timestamp = new Date().toISOString();
  const formattedMessage = `${LOG_PREFIX} ${message}`;

  const logData = context ? { timestamp, ...context } : { timestamp };

  switch (level) {
    case 'info':
      console.log(formattedMessage, logData);
      break;
    case 'warn':
      console.warn(formattedMessage, logData);
      break;
    case 'error':
      console.error(formattedMessage, logData);
      break;
    case 'debug':
      console.debug(formattedMessage, logData);
      break;
  }
}

// ============================================================================
// Configuration Validation
// ============================================================================

/**
 * Required environment variables for Creem provider
 */
export const CREEM_REQUIRED_ENV_VARS = [
  'CREEM_API_KEY',
  'CREEM_WEBHOOK_SECRET',
] as const;

/**
 * Type for Creem required environment variable names
 */
export type CreemRequiredEnvVar = (typeof CREEM_REQUIRED_ENV_VARS)[number];

/**
 * Result of configuration validation
 */
export interface CreemConfigValidationResult {
  /** Whether all required configuration is valid */
  isValid: boolean;
  /** List of missing environment variables */
  missingVars: string[];
  /** List of invalid environment variables (empty strings) */
  invalidVars: string[];
  /** Human-readable error message if validation failed */
  errorMessage?: string;
  /** Detailed error messages for each problematic variable */
  details: Record<string, string>;
}

/**
 * Validated Creem configuration
 */
export interface CreemConfig {
  /** Creem API key */
  apiKey: string;
  /** Creem webhook secret */
  webhookSecret: string;
  /** Whether running in test mode */
  testMode: boolean;
}

/**
 * Validate all required Creem environment variables
 *
 * This function checks that all required environment variables are set and non-empty.
 * It provides detailed error messages for each missing or invalid configuration item.
 *
 * @returns CreemConfigValidationResult with validation status and details
 */
export function validateCreemConfig(): CreemConfigValidationResult {
  const missingVars: string[] = [];
  const invalidVars: string[] = [];
  const details: Record<string, string> = {};

  for (const envVar of CREEM_REQUIRED_ENV_VARS) {
    const value = process.env[envVar];

    if (value === undefined || value === null) {
      missingVars.push(envVar);
      details[envVar] = `Environment variable ${envVar} is not set`;
    } else if (value.trim() === '') {
      invalidVars.push(envVar);
      details[envVar] = `Environment variable ${envVar} is set but empty`;
    }
  }

  const isValid = missingVars.length === 0 && invalidVars.length === 0;

  let errorMessage: string | undefined;
  if (!isValid) {
    const errorParts: string[] = [];

    if (missingVars.length > 0) {
      errorParts.push(
        `Missing required environment variables: ${missingVars.join(', ')}`
      );
    }

    if (invalidVars.length > 0) {
      errorParts.push(`Empty environment variables: ${invalidVars.join(', ')}`);
    }

    errorMessage = `Creem configuration error: ${errorParts.join('. ')}`;

    logCreem('error', 'Configuration validation failed', {
      missingVars,
      invalidVars,
      details,
    });
  }

  return {
    isValid,
    missingVars,
    invalidVars,
    errorMessage,
    details,
  };
}

/**
 * Get validated Creem configuration
 *
 * This function validates the configuration and returns the validated config object
 * if all required variables are set. Throws a CreemError if validation fails.
 *
 * @returns Validated CreemConfig object
 * @throws CreemError with CONFIGURATION type if validation fails
 */
export function getValidatedCreemConfig(): CreemConfig {
  const validation = validateCreemConfig();

  if (!validation.isValid) {
    throw new CreemError(
      validation.errorMessage || 'Creem configuration validation failed',
      CreemErrorType.CONFIGURATION,
      undefined,
      {
        missingVars: validation.missingVars,
        invalidVars: validation.invalidVars,
        details: validation.details,
      }
    );
  }

  return {
    apiKey: process.env.CREEM_API_KEY!,
    webhookSecret: process.env.CREEM_WEBHOOK_SECRET!,
    testMode: process.env.NODE_ENV !== 'production',
  };
}

/**
 * Check if Creem configuration is valid without throwing
 *
 * @returns True if configuration is valid, false otherwise
 */
export function isCreemConfigValid(): boolean {
  return validateCreemConfig().isValid;
}

// ============================================================================
// Metadata Validation
// ============================================================================

/**
 * Validation result for webhook metadata
 */
export interface MetadataValidationResult {
  /** Whether validation succeeded */
  isValid: boolean;
  /** Validated metadata if successful */
  metadata: CreemWebhookMetadata | null;
  /** Error message if validation failed */
  error?: string;
  /** Missing fields if validation failed */
  missingFields?: string[];
}

/**
 * Validate webhook metadata and return typed object or null
 *
 * @param metadata - Raw metadata from webhook event
 * @returns Validated CreemWebhookMetadata or null if validation fails
 */
export function validateWebhookMetadata(
  metadata: unknown
): CreemWebhookMetadata | null {
  // Check if metadata is an object
  if (!metadata || typeof metadata !== 'object') {
    logCreem('warn', 'Invalid metadata: not an object', { metadata });
    return null;
  }

  const meta = metadata as Record<string, unknown>;

  // userId is required
  if (typeof meta.userId !== 'string' || !meta.userId) {
    logCreem('warn', 'Invalid metadata: missing or invalid userId', {
      metadata,
    });
    return null;
  }

  // Build validated metadata object
  const validated: CreemWebhookMetadata = {
    userId: meta.userId,
  };

  // Optional fields
  if (typeof meta.userName === 'string') {
    validated.userName = meta.userName;
  }

  if (typeof meta.planId === 'string') {
    validated.planId = meta.planId;
  }

  if (typeof meta.priceId === 'string') {
    validated.priceId = meta.priceId;
  }

  if (typeof meta.packageId === 'string') {
    validated.packageId = meta.packageId;
  }

  if (typeof meta.credits === 'string') {
    validated.credits = meta.credits;
  }

  if (meta.type === 'credit_purchase') {
    validated.type = 'credit_purchase';
  }

  return validated;
}

/**
 * Validate webhook metadata with detailed result information
 *
 * @param metadata - Raw metadata from webhook event
 * @param requiredFields - Array of field names that must be present
 * @returns MetadataValidationResult with validation status and details
 */
export function validateWebhookMetadataWithDetails(
  metadata: unknown,
  requiredFields: (keyof CreemWebhookMetadata)[] = ['userId']
): MetadataValidationResult {
  // Check if metadata is an object
  if (!metadata || typeof metadata !== 'object') {
    return {
      isValid: false,
      metadata: null,
      error: 'Metadata is not an object',
    };
  }

  const meta = metadata as Record<string, unknown>;
  const missingFields: string[] = [];

  // Check required fields
  for (const field of requiredFields) {
    const value = meta[field];
    if (value === undefined || value === null || value === '') {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    logCreem('warn', 'Missing required metadata fields', {
      missingFields,
      metadata,
    });
    return {
      isValid: false,
      metadata: null,
      error: `Missing required fields: ${missingFields.join(', ')}`,
      missingFields,
    };
  }

  // Build validated metadata object
  const validated = validateWebhookMetadata(metadata);

  if (!validated) {
    return {
      isValid: false,
      metadata: null,
      error: 'Failed to validate metadata structure',
    };
  }

  return {
    isValid: true,
    metadata: validated,
  };
}

/**
 * Validate subscription metadata with required fields
 *
 * @param metadata - Raw metadata from webhook event
 * @returns MetadataValidationResult with validation status and details
 */
export function validateSubscriptionMetadata(
  metadata: unknown
): MetadataValidationResult {
  return validateWebhookMetadataWithDetails(metadata, [
    'userId',
    'priceId',
    'planId',
  ]);
}

/**
 * Validate credit purchase metadata with required fields
 *
 * @param metadata - Raw metadata from webhook event
 * @returns MetadataValidationResult with validation status and details
 */
export function validateCreditPurchaseMetadata(
  metadata: unknown
): MetadataValidationResult {
  return validateWebhookMetadataWithDetails(metadata, [
    'userId',
    'packageId',
    'credits',
    'priceId',
  ]);
}

// ============================================================================
// Status Mapping
// ============================================================================

/**
 * Map Creem subscription status to PaymentStatus
 *
 * @param creemStatus - Status from Creem API
 * @returns Corresponding PaymentStatus
 */
export function mapCreemStatusToPaymentStatus(
  creemStatus: string
): PaymentStatus {
  const statusMap: Record<string, PaymentStatus> = {
    [CreemSubscriptionStatus.ACTIVE]: 'active',
    [CreemSubscriptionStatus.CANCELED]: 'canceled',
    [CreemSubscriptionStatus.EXPIRED]: 'incomplete_expired',
    [CreemSubscriptionStatus.PAST_DUE]: 'past_due',
    [CreemSubscriptionStatus.TRIALING]: 'trialing',
    [CreemSubscriptionStatus.PAUSED]: 'paused',
    [CreemSubscriptionStatus.INCOMPLETE]: 'incomplete',
    [CreemSubscriptionStatus.UNPAID]: 'unpaid',
  };

  const normalizedStatus = creemStatus.toLowerCase();
  return statusMap[normalizedStatus] || 'failed';
}

// ============================================================================
// Idempotency Checks
// ============================================================================

/**
 * Result of idempotency check
 */
export interface IdempotencyCheckResult {
  /** Whether the webhook has already been processed */
  isProcessed: boolean;
  /** Existing payment record if found */
  existingPayment?: {
    id: string;
    status: string;
    webhookId?: string | null;
  };
}

/**
 * Check webhook idempotency for subscription events
 *
 * @param subscriptionId - Subscription ID to check
 * @param webhookId - Webhook ID for idempotency
 * @param expectedStatus - Optional expected status to check
 * @returns IdempotencyCheckResult indicating if already processed
 */
export async function checkSubscriptionWebhookIdempotency(
  subscriptionId: string,
  webhookId: string,
  expectedStatus?: string
): Promise<IdempotencyCheckResult> {
  try {
    const db = await getDb();

    const existingPayments = await db
      .select({
        id: payment.id,
        status: payment.status,
      })
      .from(payment)
      .where(eq(payment.subscriptionId, subscriptionId))
      .limit(1);

    if (existingPayments.length === 0) {
      return { isProcessed: false };
    }

    const existingPayment = existingPayments[0];

    // Check if already in expected status
    if (expectedStatus && existingPayment.status === expectedStatus) {
      logCreem('info', 'Payment already in expected status', {
        subscriptionId,
        status: existingPayment.status,
        expectedStatus,
      });
      return {
        isProcessed: true,
        existingPayment: {
          id: existingPayment.id,
          status: existingPayment.status,
        },
      };
    }

    return { isProcessed: false };
  } catch (error) {
    logCreem('error', 'Error checking webhook idempotency', {
      subscriptionId,
      webhookId,
      error: error instanceof Error ? error.message : String(error),
    });
    return { isProcessed: false };
  }
}

/**
 * Mark webhook as processed by updating webhookId (placeholder for future implementation)
 *
 * @param subscriptionId - Subscription ID
 * @param webhookId - Webhook ID to mark as processed
 */
export async function markWebhookAsProcessed(
  subscriptionId: string,
  webhookId: string
): Promise<void> {
  // Note: This is a placeholder. The actual implementation would require
  // adding a webhookId column to the payment table.
  logCreem('debug', 'Webhook marked as processed', {
    subscriptionId,
    webhookId,
  });
}

// ============================================================================
// Transaction Helpers
// ============================================================================

/**
 * Execute a function within a database transaction
 *
 * @param operationName - Name of the operation for logging
 * @param fn - Function to execute within the transaction
 */
export async function executeWithTransaction<T>(
  operationName: string,
  fn: (tx: DbTransaction) => Promise<T>
): Promise<T> {
  const db = await getDb();

  try {
    const result = await db.transaction(async (tx) => {
      return await fn(tx as unknown as DbTransaction);
    });

    logCreem('info', `Transaction completed: ${operationName}`);
    return result;
  } catch (error) {
    logCreem('error', `Transaction failed: ${operationName}`, {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// ============================================================================
// User Helpers
// ============================================================================

/**
 * Update user's customerId in a transaction
 *
 * @param tx - Database transaction
 * @param userId - User ID to update
 * @param customerId - Creem customer ID
 */
export async function updateUserCustomerIdInTransaction(
  tx: DbTransaction,
  userId: string,
  customerId: string
): Promise<void> {
  const now = new Date();

  await tx
    .update(user)
    .set({
      customerId: customerId,
      updatedAt: now,
    })
    .where(eq(user.id, userId));

  logCreem('info', 'Updated user with customerId in transaction', {
    userId,
    customerId: customerId.substring(0, 8) + '...',
  });
}
