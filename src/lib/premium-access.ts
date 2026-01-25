import { getDb } from '@/db';
import { payment } from '@/db/schema';
import { PaymentTypes } from '@/payment/types';
import { and, desc, eq, or } from 'drizzle-orm';

/**
 * Check premium access for a specific user ID
 */
export async function checkPremiumAccess(userId: string): Promise<boolean> {
  try {
    const db = await getDb();

    // Single optimized query to check active subscriptions
    const result = await db
      .select({
        id: payment.id,
        priceId: payment.priceId,
        type: payment.type,
        status: payment.status,
      })
      .from(payment)
      .where(
        and(
          eq(payment.paid, true),
          eq(payment.userId, userId),
          and(
            eq(payment.type, PaymentTypes.SUBSCRIPTION),
            or(eq(payment.status, 'active'), eq(payment.status, 'trialing'))
          )
        )
      )
      .orderBy(desc(payment.createdAt));

    if (!result || result.length === 0) {
      console.log('Check premium access, not payments for user:', userId);
      return false;
    }

    const hasActiveSubscription = result.some(
      (paymentRecord) =>
        paymentRecord.type === PaymentTypes.SUBSCRIPTION &&
        (paymentRecord.status === 'active' ||
          paymentRecord.status === 'trialing')
    );

    if (hasActiveSubscription) {
      console.log('Check premium access, subscription is active/trialing');
      return true;
    }

    console.log('Check premium access, free plan');
    return false;
  } catch (error) {
    console.error('Check premium access error:', error);
    return false;
  }
}
