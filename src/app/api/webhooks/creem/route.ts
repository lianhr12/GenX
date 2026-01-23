import type { NextRequest, NextResponse } from 'next/server';

import { getPaymentProvider } from '@/payment';
import { CreemProvider } from '@/payment/provider/creem';
import { CreemError } from '@/payment/provider/creem-types';

/**
 * Creem webhook handler using @creem_io/nextjs SDK
 *
 * Handles the following event types:
 * - checkout.completed: One-time payments and credit purchases
 * - subscription.active: New subscription created
 * - subscription.paid: Subscription renewal
 * - subscription.canceled: Subscription canceled
 * - subscription.expired: Subscription expired
 *
 * HTTP Status Codes:
 * - Validation errors: 400
 * - Server errors: 500
 * - Network errors: 502
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const provider = getPaymentProvider();

  // Use the SDK's built-in webhook handler if using Creem
  if (provider instanceof CreemProvider) {
    try {
      const handler = provider.getWebhookHandler();
      return handler(req);
    } catch (error) {
      // Handle CreemError with appropriate HTTP status codes
      if (error instanceof CreemError) {
        const statusCode = error.getHttpStatusCode();
        const response = {
          error: error.getUserMessage(),
          type: error.type,
          retryable: error.isRetryable(),
        };

        console.error('[Creem Webhook] Error:', error.getFullDetails());

        return new Response(JSON.stringify(response), {
          status: statusCode,
          headers: { 'Content-Type': 'application/json' },
        }) as unknown as NextResponse;
      }

      // Handle unknown errors as 500
      console.error('[Creem Webhook] Unknown error:', error);
      return new Response(
        JSON.stringify({
          error: 'Internal server error',
          retryable: true,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      ) as unknown as NextResponse;
    }
  }

  // Fallback for other providers (shouldn't happen for this route)
  return new Response('Invalid provider', {
    status: 400,
  }) as unknown as NextResponse;
}
