/**
 * Creem Payment Provider Type Definitions
 *
 * This file contains type definitions for the Creem payment provider,
 * including webhook metadata, subscription statuses, and error types.
 *
 * @module creem-types
 * @see {@link ../creem-utils.ts} for utility functions using these types
 * @see {@link ../creem.ts} for the main provider implementation
 */

/**
 * Creem webhook metadata structure
 *
 * Used to validate and type-check metadata from webhook events.
 * This interface defines the expected structure of metadata passed
 * through Creem checkout sessions and webhook events.
 *
 * @example
 * ```typescript
 * const metadata: CreemWebhookMetadata = {
 *   userId: 'user_123',
 *   priceId: 'price_456',
 *   planId: 'plan_789',
 * };
 * ```
 */
export interface CreemWebhookMetadata {
  /** User ID who initiated the payment (required) */
  userId: string;
  /** Optional user display name */
  userName?: string;
  /** Plan ID for subscription payments */
  planId?: string;
  /** Price ID from the payment provider */
  priceId?: string;
  /** Package ID for credit purchases */
  packageId?: string;
  /** Number of credits as string (for credit purchases) */
  credits?: string;
  /** Type indicator for credit purchases */
  type?: 'credit_purchase';
}

/**
 * Creem subscription status enum
 *
 * Maps to all possible subscription statuses from Creem API.
 * These statuses are used to track the lifecycle of a subscription.
 *
 * @see {@link mapCreemStatusToPaymentStatus} for mapping to PaymentStatus
 *
 * @example
 * ```typescript
 * if (status === CreemSubscriptionStatus.ACTIVE) {
 *   // Handle active subscription
 * }
 * ```
 */
export enum CreemSubscriptionStatus {
  /** Subscription is active and in good standing */
  ACTIVE = 'active',
  /** Subscription has been canceled (may still be active until period end) */
  CANCELED = 'canceled',
  /** Subscription has expired and is no longer active */
  EXPIRED = 'expired',
  /** Payment is past due, subscription may be at risk */
  PAST_DUE = 'past_due',
  /** Subscription is in trial period */
  TRIALING = 'trialing',
  /** Subscription is temporarily paused */
  PAUSED = 'paused',
  /** Subscription setup is incomplete */
  INCOMPLETE = 'incomplete',
  /** Subscription has unpaid invoices */
  UNPAID = 'unpaid',
}

/**
 * Error types for categorization
 *
 * Used to classify errors for appropriate handling and HTTP status codes.
 * Each error type maps to a specific HTTP status code and retry behavior.
 *
 * | Error Type    | HTTP Status | Retryable |
 * |---------------|-------------|-----------|
 * | NETWORK       | 502         | Yes       |
 * | VALIDATION    | 400         | No        |
 * | CONFIGURATION | 500         | No        |
 * | WEBHOOK       | 400         | Depends   |
 * | DATABASE      | 500         | Yes       |
 *
 * @see {@link CreemError} for the error class using these types
 */
export enum CreemErrorType {
  /** Network-related errors (timeouts, connection failures) */
  NETWORK = 'NETWORK_ERROR',
  /** Validation errors (invalid input, missing fields) */
  VALIDATION = 'VALIDATION_ERROR',
  /** Configuration errors (missing API keys, invalid settings) */
  CONFIGURATION = 'CONFIGURATION_ERROR',
  /** Webhook processing errors (signature verification, event handling) */
  WEBHOOK = 'WEBHOOK_ERROR',
  /** Database operation errors (insert, update, query failures) */
  DATABASE = 'DATABASE_ERROR',
}

/**
 * Custom error class for Creem operations
 *
 * Provides structured error information with type classification.
 * This class extends the standard Error class with additional properties
 * for error categorization, HTTP status codes, and retry behavior.
 *
 * @extends Error
 *
 * @example
 * ```typescript
 * // Create a validation error
 * throw CreemError.validationError(
 *   'Invalid customer ID',
 *   undefined,
 *   { customerId: 'invalid' }
 * );
 *
 * // Create from unknown error
 * try {
 *   await someOperation();
 * } catch (error) {
 *   throw CreemError.fromError(error, CreemErrorType.DATABASE, 'Database operation failed');
 * }
 * ```
 */
export class CreemError extends Error {
  /** The type of error for categorization */
  public readonly type: CreemErrorType;
  /** The original error that caused this error, if any */
  public readonly originalError?: Error;
  /** Additional context information about the error */
  public readonly context?: Record<string, unknown>;

  /**
   * Create a new CreemError
   *
   * @param message - Human-readable error message
   * @param type - Error type for categorization
   * @param originalError - Original error that caused this error
   * @param context - Additional context information
   */
  constructor(
    message: string,
    type: CreemErrorType,
    originalError?: Error,
    context?: Record<string, unknown>
  ) {
    // Preserve original error message in the thrown error
    const fullMessage = originalError
      ? `${message}: ${originalError.message}`
      : message;

    super(fullMessage);
    this.name = 'CreemError';
    this.type = type;
    this.originalError = originalError;
    this.context = context;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CreemError);
    }
  }

  /**
   * Get the appropriate HTTP status code for this error type
   *
   * @returns HTTP status code (400, 500, or 502)
   */
  public getHttpStatusCode(): number {
    switch (this.type) {
      case CreemErrorType.NETWORK:
        return 502; // Bad Gateway - network errors
      case CreemErrorType.VALIDATION:
        return 400; // Bad Request - validation errors
      case CreemErrorType.CONFIGURATION:
        return 500; // Internal Server Error - configuration errors
      case CreemErrorType.WEBHOOK:
        return 400; // Bad Request - webhook processing errors
      case CreemErrorType.DATABASE:
        return 500; // Internal Server Error - database errors
      default:
        return 500;
    }
  }

  /**
   * Check if this error type should be retried
   *
   * @returns True if the operation should be retried, false otherwise
   */
  public isRetryable(): boolean {
    return (
      this.type === CreemErrorType.NETWORK ||
      this.type === CreemErrorType.DATABASE
    );
  }

  /**
   * Get a user-friendly error message based on error type
   *
   * @returns User-friendly error message suitable for display
   */
  public getUserMessage(): string {
    switch (this.type) {
      case CreemErrorType.NETWORK:
        return 'Payment service temporarily unavailable. Please try again later.';
      case CreemErrorType.VALIDATION:
        return 'Invalid request parameters. Please check your input.';
      case CreemErrorType.CONFIGURATION:
        return 'Payment system configuration error. Please contact support.';
      case CreemErrorType.WEBHOOK:
        return 'Webhook processing failed. Please try again.';
      case CreemErrorType.DATABASE:
        return 'Database operation failed. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Get the full error details including original error stack trace
   *
   * @returns Object containing all error details for logging
   */
  public getFullDetails(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      httpStatusCode: this.getHttpStatusCode(),
      isRetryable: this.isRetryable(),
      userMessage: this.getUserMessage(),
      context: this.context,
      originalError: this.originalError
        ? {
            name: this.originalError.name,
            message: this.originalError.message,
            stack: this.originalError.stack,
          }
        : undefined,
      stack: this.stack,
    };
  }

  /**
   * Create a CreemError from an unknown error
   *
   * Useful for wrapping errors in catch blocks where the error type is unknown.
   * If the error is already a CreemError, it is returned as-is.
   *
   * @param error - The unknown error to wrap
   * @param type - Error type for categorization
   * @param message - Optional custom error message
   * @param context - Optional additional context
   * @returns A CreemError instance
   */
  public static fromError(
    error: unknown,
    type: CreemErrorType,
    message?: string,
    context?: Record<string, unknown>
  ): CreemError {
    if (error instanceof CreemError) {
      return error;
    }

    const originalError =
      error instanceof Error ? error : new Error(String(error));
    const errorMessage = message || 'An error occurred';

    return new CreemError(errorMessage, type, originalError, context);
  }

  /**
   * Create a network error
   *
   * @param message - Error message
   * @param originalError - Original error that caused this
   * @param context - Additional context
   * @returns A CreemError with NETWORK type
   */
  public static networkError(
    message: string,
    originalError?: Error,
    context?: Record<string, unknown>
  ): CreemError {
    return new CreemError(
      message,
      CreemErrorType.NETWORK,
      originalError,
      context
    );
  }

  /**
   * Create a validation error
   *
   * @param message - Error message
   * @param originalError - Original error that caused this
   * @param context - Additional context
   * @returns A CreemError with VALIDATION type
   */
  public static validationError(
    message: string,
    originalError?: Error,
    context?: Record<string, unknown>
  ): CreemError {
    return new CreemError(
      message,
      CreemErrorType.VALIDATION,
      originalError,
      context
    );
  }

  /**
   * Create a configuration error
   *
   * @param message - Error message
   * @param originalError - Original error that caused this
   * @param context - Additional context
   * @returns A CreemError with CONFIGURATION type
   */
  public static configurationError(
    message: string,
    originalError?: Error,
    context?: Record<string, unknown>
  ): CreemError {
    return new CreemError(
      message,
      CreemErrorType.CONFIGURATION,
      originalError,
      context
    );
  }

  /**
   * Create a webhook error
   *
   * @param message - Error message
   * @param originalError - Original error that caused this
   * @param context - Additional context
   * @returns A CreemError with WEBHOOK type
   */
  public static webhookError(
    message: string,
    originalError?: Error,
    context?: Record<string, unknown>
  ): CreemError {
    return new CreemError(
      message,
      CreemErrorType.WEBHOOK,
      originalError,
      context
    );
  }

  /**
   * Create a database error
   *
   * @param message - Error message
   * @param originalError - Original error that caused this
   * @param context - Additional context
   * @returns A CreemError with DATABASE type
   */
  public static databaseError(
    message: string,
    originalError?: Error,
    context?: Record<string, unknown>
  ): CreemError {
    return new CreemError(
      message,
      CreemErrorType.DATABASE,
      originalError,
      context
    );
  }
}
