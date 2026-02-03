'use server';

import { auth } from '@/lib/auth';
import {
  createReferral,
  getReferralCode,
  getReferralHistory,
  getReferralStats,
  hasReferrer,
  payRegistrationReward,
  validateReferralCode,
} from '@/lib/referral';
import { REFERRAL_CONFIG } from '@/lib/referral-config';
import { cookies, headers } from 'next/headers';

/**
 * Process referral for the current user
 * Called after user registration/login to check for referral cookie
 */
export async function processReferralAction() {
  try {
    // Get current user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    // Check if user already has a referrer
    const alreadyReferred = await hasReferrer(userId);
    if (alreadyReferred) {
      return { success: false, error: 'Already referred' };
    }

    // Get referral code from cookie
    const cookieStore = await cookies();
    const referralCode = cookieStore.get(REFERRAL_CONFIG.cookieName)?.value;

    if (!referralCode) {
      return { success: false, error: 'No referral code' };
    }

    // Validate the referral code
    const validation = await validateReferralCode(referralCode);
    if (!validation.valid || !validation.referrerId) {
      // Clear invalid cookie
      cookieStore.delete(REFERRAL_CONFIG.cookieName);
      return {
        success: false,
        error: validation.error || 'Invalid referral code',
      };
    }

    // Prevent self-referral
    if (validation.referrerId === userId) {
      cookieStore.delete(REFERRAL_CONFIG.cookieName);
      return { success: false, error: 'Cannot refer yourself' };
    }

    // Get IP address from headers
    // NOTE: x-forwarded-for can be spoofed. For production, ensure:
    // 1. Your CDN/proxy (Cloudflare, Vercel, etc.) is configured to set trusted headers
    // 2. Consider using cf-connecting-ip (Cloudflare) or x-real-ip from trusted proxies
    // 3. The IP check is one layer of defense; email verification is the primary protection
    const headersList = await headers();
    const ip =
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headersList.get('x-real-ip') ||
      null;

    // Create the referral relationship
    const result = await createReferral(
      validation.referrerId,
      userId,
      ip,
      userEmail
    );

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Clear the referral cookie after successful processing
    cookieStore.delete(REFERRAL_CONFIG.cookieName);

    // If user's email is already verified, pay the registration reward immediately
    if (session.user.emailVerified) {
      await payRegistrationReward(userId);
    }

    return { success: true };
  } catch (error) {
    console.error('processReferralAction error:', error);
    return { success: false, error: 'Failed to process referral' };
  }
}

/**
 * Pay registration reward when user verifies email
 * Called after email verification
 */
export async function payReferralRegistrationRewardAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }

    if (!session.user.emailVerified) {
      return { success: false, error: 'Email not verified' };
    }

    const result = await payRegistrationReward(session.user.id);
    return result;
  } catch (error) {
    console.error('payReferralRegistrationRewardAction error:', error);
    return { success: false, error: 'Failed to pay reward' };
  }
}

/**
 * Get current user's referral code
 */
export async function getReferralCodeAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const code = await getReferralCode(session.user.id);
    return { success: true, code };
  } catch (error) {
    console.error('getReferralCodeAction error:', error);
    return { success: false, error: 'Failed to get referral code' };
  }
}

/**
 * Get current user's referral statistics
 */
export async function getReferralStatsAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const stats = await getReferralStats(session.user.id);
    return { success: true, stats };
  } catch (error) {
    console.error('getReferralStatsAction error:', error);
    return { success: false, error: 'Failed to get referral stats' };
  }
}

/**
 * Get current user's referral history
 * @param limit - Maximum number of records to return (1-100, default 50)
 * @param offset - Number of records to skip (min 0, default 0)
 */
export async function getReferralHistoryAction(limit = 50, offset = 0) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Validate and sanitize parameters to prevent abuse
    const safeLimit = Math.min(Math.max(1, Number(limit) || 50), 100);
    const safeOffset = Math.max(0, Number(offset) || 0);

    const history = await getReferralHistory(
      session.user.id,
      safeLimit,
      safeOffset
    );
    return { success: true, history };
  } catch (error) {
    console.error('getReferralHistoryAction error:', error);
    return { success: false, error: 'Failed to get referral history' };
  }
}
