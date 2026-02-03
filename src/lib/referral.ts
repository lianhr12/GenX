import { randomUUID } from 'crypto';
import { addCredits } from '@/credits/credits';
import { CREDIT_TRANSACTION_TYPE } from '@/credits/types';
import { getDb } from '@/db';
import { ReferralStatus, referralCodes, referrals, user } from '@/db/schema';
import { and, count, eq, gte, sql } from 'drizzle-orm';
import { customAlphabet } from 'nanoid';
import {
  REFERRAL_CONFIG,
  extractEmailDomain,
  isTemporaryEmail,
  isWhitelistedDomain,
} from './referral-config';

// Generate referral code using nanoid with custom charset
const generateCode = customAlphabet(
  REFERRAL_CONFIG.codeCharset,
  REFERRAL_CONFIG.codeLength
);

/**
 * Generate a unique referral code for a user
 * Uses database transaction to prevent race conditions
 */
export async function generateReferralCode(userId: string): Promise<string> {
  const db = await getDb();

  // Use transaction to prevent race conditions
  return await db.transaction(async (tx) => {
    // Check if user already has a referral code (with row lock via transaction)
    const existing = await tx
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      return existing[0].code;
    }

    // Generate a unique code with retry logic
    let code: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      code = generateCode();
      const existingCode = await tx
        .select()
        .from(referralCodes)
        .where(eq(referralCodes.code, code))
        .limit(1);

      if (existingCode.length === 0) {
        break;
      }
      attempts++;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique referral code');
    }

    // Insert the code within the transaction
    await tx.insert(referralCodes).values({
      id: randomUUID(),
      userId,
      code,
      createdAt: new Date(),
    });

    return code;
  });
}

/**
 * Get user's referral code (creates one if not exists)
 * Optimized to avoid N+1 query by using transaction in generateReferralCode
 */
export async function getReferralCode(userId: string): Promise<string> {
  // generateReferralCode already handles the "check if exists" logic
  // within a transaction, so we can call it directly
  return generateReferralCode(userId);
}

/**
 * Validate a referral code and return the referrer's user ID
 */
export async function validateReferralCode(
  code: string
): Promise<{ valid: boolean; referrerId?: string; error?: string }> {
  if (!code || code.length !== REFERRAL_CONFIG.codeLength) {
    return { valid: false, error: 'Invalid referral code format' };
  }

  const db = await getDb();

  const result = await db
    .select({
      userId: referralCodes.userId,
      banned: user.banned,
      createdAt: user.createdAt,
    })
    .from(referralCodes)
    .innerJoin(user, eq(referralCodes.userId, user.id))
    .where(eq(referralCodes.code, code.toUpperCase()))
    .limit(1);

  if (result.length === 0) {
    return { valid: false, error: 'Referral code not found' };
  }

  const referrer = result[0];

  // Check if referrer is banned
  if (referrer.banned) {
    return { valid: false, error: 'Referrer account is not active' };
  }

  // Check cooldown period (referrer must have account for at least 24 hours)
  const cooldownMs = REFERRAL_CONFIG.cooldownHours * 60 * 60 * 1000;
  const accountAge = Date.now() - new Date(referrer.createdAt).getTime();

  if (accountAge < cooldownMs) {
    return { valid: false, error: 'Referrer account is too new' };
  }

  return { valid: true, referrerId: referrer.userId };
}

/**
 * Check anti-abuse rules
 * Uses UTC time for consistent behavior across timezones
 */
export async function checkAntiAbuse(
  ip: string | null,
  emailDomain: string
): Promise<{ allowed: boolean; reason?: string }> {
  // Check for temporary email
  if (isTemporaryEmail(emailDomain)) {
    return {
      allowed: false,
      reason: 'Temporary email addresses are not allowed',
    };
  }

  const db = await getDb();
  // Use UTC time for consistent behavior across timezones
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Check IP limit (if IP is provided)
  if (ip) {
    const ipCount = await db
      .select({ count: count() })
      .from(referrals)
      .where(
        and(eq(referrals.referredIp, ip), gte(referrals.createdAt, today))
      );

    if (ipCount[0].count >= REFERRAL_CONFIG.dailyIpLimit) {
      return {
        allowed: false,
        reason: 'Too many referrals from this IP today',
      };
    }
  }

  // Check domain limit (only for non-whitelisted domains)
  if (!isWhitelistedDomain(emailDomain)) {
    const domainCount = await db
      .select({ count: count() })
      .from(referrals)
      .where(
        and(
          eq(referrals.referredEmailDomain, emailDomain),
          gte(referrals.createdAt, today)
        )
      );

    if (domainCount[0].count >= REFERRAL_CONFIG.dailyDomainLimit) {
      return {
        allowed: false,
        reason: 'Too many referrals from this email domain today',
      };
    }
  }

  return { allowed: true };
}

/**
 * Check if a user can refer others (must have account for 24+ hours)
 */
export async function canUserRefer(userId: string): Promise<boolean> {
  const db = await getDb();

  const result = await db
    .select({ createdAt: user.createdAt })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (result.length === 0) {
    return false;
  }

  const cooldownMs = REFERRAL_CONFIG.cooldownHours * 60 * 60 * 1000;
  const accountAge = Date.now() - new Date(result[0].createdAt).getTime();

  return accountAge >= cooldownMs;
}

/**
 * Create a referral relationship
 */
export async function createReferral(
  referrerId: string,
  referredId: string,
  ip: string | null,
  email: string
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  const emailDomain = extractEmailDomain(email);

  // Check if referred user already has a referrer
  const existingReferral = await db
    .select()
    .from(referrals)
    .where(eq(referrals.referredId, referredId))
    .limit(1);

  if (existingReferral.length > 0) {
    return { success: false, error: 'User already has a referrer' };
  }

  // Prevent self-referral
  if (referrerId === referredId) {
    return { success: false, error: 'Cannot refer yourself' };
  }

  // Check anti-abuse rules
  const antiAbuseCheck = await checkAntiAbuse(ip, emailDomain);
  if (!antiAbuseCheck.allowed) {
    console.log(`Referral blocked by anti-abuse: ${antiAbuseCheck.reason}`);
    return { success: false, error: antiAbuseCheck.reason };
  }

  // Create the referral record
  await db.insert(referrals).values({
    id: randomUUID(),
    referrerId,
    referredId,
    status: ReferralStatus.PENDING,
    referredIp: ip,
    referredEmailDomain: emailDomain,
    createdAt: new Date(),
  });

  console.log(`Referral created: ${referrerId} -> ${referredId}`);
  return { success: true };
}

/**
 * Pay registration reward to referrer when referred user verifies email
 * Uses database transaction to prevent double payment race conditions
 */
export async function payRegistrationReward(
  referredId: string
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();

  try {
    return await db.transaction(async (tx) => {
      // Find and lock the referral record that hasn't been paid yet
      // Using conditional update to prevent race conditions
      const updateResult = await tx
        .update(referrals)
        .set({
          status: ReferralStatus.REGISTERED,
          registrationRewardPaid: true,
          registeredAt: new Date(),
        })
        .where(
          and(
            eq(referrals.referredId, referredId),
            eq(referrals.registrationRewardPaid, false)
          )
        )
        .returning({
          id: referrals.id,
          referrerId: referrals.referrerId,
        });

      // If no rows updated, either no referral exists or already paid
      if (updateResult.length === 0) {
        // Check if referral exists to provide better error message
        const existingReferral = await tx
          .select({ registrationRewardPaid: referrals.registrationRewardPaid })
          .from(referrals)
          .where(eq(referrals.referredId, referredId))
          .limit(1);

        if (existingReferral.length === 0) {
          return { success: false, error: 'No referral found' };
        }
        if (existingReferral[0].registrationRewardPaid) {
          return { success: false, error: 'Registration reward already paid' };
        }
        return { success: false, error: 'Failed to update referral' };
      }

      const record = updateResult[0];

      // Check if referrer is still active
      const referrer = await tx
        .select({ banned: user.banned })
        .from(user)
        .where(eq(user.id, record.referrerId))
        .limit(1);

      if (referrer.length === 0 || referrer[0].banned) {
        // Rollback the update by throwing an error (transaction will rollback)
        throw new Error('Referrer account is not active');
      }

      // Pay the reward (this is outside transaction but that's OK -
      // worst case is we mark as paid but credits fail, which is better than double payment)
      await addCredits({
        userId: record.referrerId,
        amount: REFERRAL_CONFIG.registrationReward,
        type: CREDIT_TRANSACTION_TYPE.REFERRAL_REGISTRATION,
        description: `Referral registration reward: ${REFERRAL_CONFIG.registrationReward} credits`,
      });

      console.log(
        `Registration reward paid: ${REFERRAL_CONFIG.registrationReward} credits to ${record.referrerId}`
      );
      return { success: true };
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'Referrer account is not active'
    ) {
      return { success: false, error: error.message };
    }
    console.error('payRegistrationReward error:', error);
    return { success: false, error: 'Failed to pay registration reward' };
  }
}

/**
 * Pay purchase reward to referrer when referred user makes first purchase
 * Uses database transaction to prevent double payment race conditions
 */
export async function payPurchaseReward(
  referredId: string
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();

  try {
    return await db.transaction(async (tx) => {
      // Find and lock the referral record that hasn't been paid yet
      // Using conditional update to prevent race conditions
      const updateResult = await tx
        .update(referrals)
        .set({
          status: ReferralStatus.PURCHASED,
          purchaseRewardPaid: true,
          purchasedAt: new Date(),
        })
        .where(
          and(
            eq(referrals.referredId, referredId),
            eq(referrals.purchaseRewardPaid, false)
          )
        )
        .returning({
          id: referrals.id,
          referrerId: referrals.referrerId,
        });

      // If no rows updated, either no referral exists or already paid
      if (updateResult.length === 0) {
        // Check if referral exists to provide better error message
        const existingReferral = await tx
          .select({ purchaseRewardPaid: referrals.purchaseRewardPaid })
          .from(referrals)
          .where(eq(referrals.referredId, referredId))
          .limit(1);

        if (existingReferral.length === 0) {
          return { success: false, error: 'No referral found' };
        }
        if (existingReferral[0].purchaseRewardPaid) {
          return { success: false, error: 'Purchase reward already paid' };
        }
        return { success: false, error: 'Failed to update referral' };
      }

      const record = updateResult[0];

      // Check if referrer is still active
      const referrer = await tx
        .select({ banned: user.banned })
        .from(user)
        .where(eq(user.id, record.referrerId))
        .limit(1);

      if (referrer.length === 0 || referrer[0].banned) {
        // Rollback the update by throwing an error (transaction will rollback)
        throw new Error('Referrer account is not active');
      }

      // Pay the reward
      await addCredits({
        userId: record.referrerId,
        amount: REFERRAL_CONFIG.purchaseReward,
        type: CREDIT_TRANSACTION_TYPE.REFERRAL_PURCHASE,
        description: `Referral purchase reward: ${REFERRAL_CONFIG.purchaseReward} credits`,
      });

      console.log(
        `Purchase reward paid: ${REFERRAL_CONFIG.purchaseReward} credits to ${record.referrerId}`
      );
      return { success: true };
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'Referrer account is not active'
    ) {
      return { success: false, error: error.message };
    }
    console.error('payPurchaseReward error:', error);
    return { success: false, error: 'Failed to pay purchase reward' };
  }
}

/**
 * Get referral statistics for a user
 */
export async function getReferralStats(userId: string): Promise<{
  totalReferrals: number;
  registeredReferrals: number;
  purchasedReferrals: number;
  totalCreditsEarned: number;
}> {
  const db = await getDb();

  // Get referral counts by status
  const stats = await db
    .select({
      total: count(),
      registered: sql<number>`COUNT(CASE WHEN ${referrals.registrationRewardPaid} = true THEN 1 END)`,
      purchased: sql<number>`COUNT(CASE WHEN ${referrals.purchaseRewardPaid} = true THEN 1 END)`,
    })
    .from(referrals)
    .where(eq(referrals.referrerId, userId));

  const result = stats[0];

  // Calculate total credits earned
  const registrationCredits =
    Number(result.registered) * REFERRAL_CONFIG.registrationReward;
  const purchaseCredits =
    Number(result.purchased) * REFERRAL_CONFIG.purchaseReward;

  return {
    totalReferrals: result.total,
    registeredReferrals: Number(result.registered),
    purchasedReferrals: Number(result.purchased),
    totalCreditsEarned: registrationCredits + purchaseCredits,
  };
}

/**
 * Get referral history for a user
 */
export async function getReferralHistory(
  userId: string,
  limit = 50,
  offset = 0
): Promise<
  Array<{
    id: string;
    referredEmail: string;
    status: string;
    registrationRewardPaid: boolean;
    purchaseRewardPaid: boolean;
    createdAt: Date;
    registeredAt: Date | null;
    purchasedAt: Date | null;
  }>
> {
  const db = await getDb();

  const history = await db
    .select({
      id: referrals.id,
      referredEmail: user.email,
      status: referrals.status,
      registrationRewardPaid: referrals.registrationRewardPaid,
      purchaseRewardPaid: referrals.purchaseRewardPaid,
      createdAt: referrals.createdAt,
      registeredAt: referrals.registeredAt,
      purchasedAt: referrals.purchasedAt,
    })
    .from(referrals)
    .innerJoin(user, eq(referrals.referredId, user.id))
    .where(eq(referrals.referrerId, userId))
    .orderBy(sql`${referrals.createdAt} DESC`)
    .limit(limit)
    .offset(offset);

  // Mask email addresses for privacy
  return history.map((item) => ({
    ...item,
    referredEmail: maskEmail(item.referredEmail),
    registrationRewardPaid: item.registrationRewardPaid ?? false,
    purchaseRewardPaid: item.purchaseRewardPaid ?? false,
  }));
}

/**
 * Mask email address for privacy (e.g., "john@example.com" -> "j***@example.com")
 */
function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return '***@***';

  const maskedLocal =
    localPart.length > 2
      ? `${localPart[0]}${'*'.repeat(localPart.length - 1)}`
      : `${localPart[0]}*`;

  return `${maskedLocal}@${domain}`;
}

/**
 * Get referrer ID for a user (if they were referred)
 */
export async function getReferrerId(
  referredId: string
): Promise<string | null> {
  const db = await getDb();

  const result = await db
    .select({ referrerId: referrals.referrerId })
    .from(referrals)
    .where(eq(referrals.referredId, referredId))
    .limit(1);

  return result.length > 0 ? result[0].referrerId : null;
}

/**
 * Check if a user has a referrer
 */
export async function hasReferrer(referredId: string): Promise<boolean> {
  const referrerId = await getReferrerId(referredId);
  return referrerId !== null;
}
