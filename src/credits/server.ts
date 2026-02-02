/**
 * Server-side Credit Operations
 * Implements freeze-settle-release pattern for video/image generation
 */

import { randomUUID } from 'crypto';
import { websiteConfig } from '@/config/website';
import {
  CreditHoldStatus,
  creditHolds,
  creditTransaction,
  getDb,
  userCredit,
} from '@/db';
import { and, asc, eq, gt, isNull, or, sql } from 'drizzle-orm';
import type { CreditPackage } from './types';
import { CREDIT_TRANSACTION_TYPE } from './types';

// ============================================================================
// Credit Package Utilities
// ============================================================================

/**
 * Get all credit packages (server-side, without translations)
 * @returns All credit packages
 */
export function getAllCreditPackages(): CreditPackage[] {
  return Object.values(websiteConfig.credits.packages);
}

/**
 * Get credit package by id (server-side, without translations)
 * @param id - Credit package id
 * @returns Credit package or undefined if not found
 */
export function getCreditPackageById(id: string): CreditPackage | undefined {
  return websiteConfig.credits.packages[id];
}

// ============================================================================
// Types
// ============================================================================

interface PackageAllocation {
  transactionId: string;
  credits: number;
}

interface FreezeResult {
  success: boolean;
  holdId: number;
}

type MediaType = 'video' | 'image';

// ============================================================================
// Freeze Credits (Generic)
// ============================================================================

/**
 * Freeze credits for a media generation task (video or image)
 * Uses FIFO consumption order based on expiration date
 */
export async function freezeMediaCredits(params: {
  userId: string;
  credits: number;
  mediaUuid: string;
  mediaType: MediaType;
}): Promise<FreezeResult> {
  const { userId, credits, mediaUuid, mediaType } = params;
  const db = await getDb();

  // Check if hold already exists (idempotency)
  const [existingHold] = await db
    .select()
    .from(creditHolds)
    .where(eq(creditHolds.mediaUuid, mediaUuid))
    .limit(1);

  if (existingHold) {
    if (existingHold.status === CreditHoldStatus.HOLDING) {
      return { success: true, holdId: existingHold.id };
    }
    throw new Error(`Hold already processed for ${mediaType}: ${mediaUuid}`);
  }

  const now = new Date();

  // Get available credit transactions (FIFO by expiration)
  const transactions = await db
    .select()
    .from(creditTransaction)
    .where(
      and(
        eq(creditTransaction.userId, userId),
        gt(creditTransaction.remainingAmount, 0),
        or(
          isNull(creditTransaction.expirationDate),
          gt(creditTransaction.expirationDate, now)
        )
      )
    )
    .orderBy(
      sql`${creditTransaction.expirationDate} is null`,
      asc(creditTransaction.expirationDate),
      asc(creditTransaction.createdAt)
    );

  // Calculate available credits
  const availableCredits = transactions.reduce(
    (sum, t) => sum + (t.remainingAmount || 0),
    0
  );

  if (availableCredits < credits) {
    throw new Error(
      `Insufficient credits. Required: ${credits}, Available: ${availableCredits}`
    );
  }

  // Allocate credits from transactions (FIFO)
  const allocation: PackageAllocation[] = [];
  let remaining = credits;

  for (const transaction of transactions) {
    if (remaining <= 0) break;

    const toFreeze = Math.min(transaction.remainingAmount || 0, remaining);
    allocation.push({ transactionId: transaction.id, credits: toFreeze });

    // Deduct from transaction
    await db
      .update(creditTransaction)
      .set({
        remainingAmount: (transaction.remainingAmount || 0) - toFreeze,
        updatedAt: new Date(),
      })
      .where(eq(creditTransaction.id, transaction.id));

    remaining -= toFreeze;
  }

  // Update user credit balance
  const [userCreditRecord] = await db
    .select()
    .from(userCredit)
    .where(eq(userCredit.userId, userId))
    .limit(1);

  if (userCreditRecord) {
    await db
      .update(userCredit)
      .set({
        currentCredits: userCreditRecord.currentCredits - credits,
        updatedAt: new Date(),
      })
      .where(eq(userCredit.userId, userId));
  }

  // Create hold record with new mediaUuid field
  const [holdResult] = await db
    .insert(creditHolds)
    .values({
      userId,
      mediaUuid,
      mediaType,
      credits,
      status: CreditHoldStatus.HOLDING,
      packageAllocation: allocation,
    })
    .returning({ id: creditHolds.id });

  if (!holdResult) {
    throw new Error('Failed to create credit hold');
  }

  return { success: true, holdId: holdResult.id };
}

/**
 * Settle credits after successful media generation
 * Marks the hold as settled and records the transaction
 */
export async function settleMediaCredits(
  mediaUuid: string,
  mediaType: MediaType
): Promise<void> {
  const db = await getDb();

  const [hold] = await db
    .select()
    .from(creditHolds)
    .where(eq(creditHolds.mediaUuid, mediaUuid))
    .limit(1);

  if (!hold) {
    throw new Error(`Hold not found for ${mediaType}: ${mediaUuid}`);
  }

  if (hold.status === CreditHoldStatus.SETTLED) {
    return; // Already settled
  }

  if (hold.status !== CreditHoldStatus.HOLDING) {
    throw new Error(`Invalid hold status: ${hold.status}`);
  }

  // Mark hold as settled
  await db
    .update(creditHolds)
    .set({
      status: CreditHoldStatus.SETTLED,
      settledAt: new Date(),
    })
    .where(eq(creditHolds.mediaUuid, mediaUuid));

  // Record usage transaction
  const description =
    mediaType === 'video'
      ? `Video generation: ${mediaUuid}`
      : `Image generation: ${mediaUuid}`;

  await db.insert(creditTransaction).values({
    id: randomUUID(),
    userId: hold.userId,
    type: CREDIT_TRANSACTION_TYPE.USAGE,
    amount: -hold.credits,
    remainingAmount: null,
    description,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

/**
 * Release credits after failed media generation
 * Returns the frozen credits to the user
 */
export async function releaseMediaCredits(
  mediaUuid: string,
  mediaType: MediaType
): Promise<void> {
  const db = await getDb();

  const [hold] = await db
    .select()
    .from(creditHolds)
    .where(eq(creditHolds.mediaUuid, mediaUuid))
    .limit(1);

  if (!hold) {
    // No hold found, nothing to release
    console.warn(`No hold found for ${mediaType}: ${mediaUuid}`);
    return;
  }

  if (hold.status === CreditHoldStatus.RELEASED) {
    return; // Already released
  }

  if (hold.status !== CreditHoldStatus.HOLDING) {
    throw new Error(`Invalid hold status: ${hold.status}`);
  }

  const allocation = hold.packageAllocation as PackageAllocation[];

  // Return credits to original transactions
  for (const { transactionId, credits } of allocation) {
    const [transaction] = await db
      .select()
      .from(creditTransaction)
      .where(eq(creditTransaction.id, transactionId))
      .limit(1);

    if (transaction) {
      await db
        .update(creditTransaction)
        .set({
          remainingAmount: (transaction.remainingAmount || 0) + credits,
          updatedAt: new Date(),
        })
        .where(eq(creditTransaction.id, transactionId));
    }
  }

  // Restore user credit balance
  const [userCreditRecord] = await db
    .select()
    .from(userCredit)
    .where(eq(userCredit.userId, hold.userId))
    .limit(1);

  if (userCreditRecord) {
    await db
      .update(userCredit)
      .set({
        currentCredits: userCreditRecord.currentCredits + hold.credits,
        updatedAt: new Date(),
      })
      .where(eq(userCredit.userId, hold.userId));
  }

  // Mark hold as released
  await db
    .update(creditHolds)
    .set({
      status: CreditHoldStatus.RELEASED,
      settledAt: new Date(),
    })
    .where(eq(creditHolds.mediaUuid, mediaUuid));
}

// ============================================================================
// Image-specific Credit Functions
// ============================================================================

/**
 * Freeze credits for an image generation task
 */
export async function freezeImageCredits(params: {
  userId: string;
  credits: number;
  imageUuid: string;
}): Promise<FreezeResult> {
  return freezeMediaCredits({
    userId: params.userId,
    credits: params.credits,
    mediaUuid: params.imageUuid,
    mediaType: 'image',
  });
}

/**
 * Settle credits after successful image generation
 */
export async function settleImageCredits(imageUuid: string): Promise<void> {
  return settleMediaCredits(imageUuid, 'image');
}

/**
 * Release credits after failed image generation
 */
export async function releaseImageCredits(imageUuid: string): Promise<void> {
  return releaseMediaCredits(imageUuid, 'image');
}

// ============================================================================
// Video-specific Credit Functions (Legacy - for backward compatibility)
// ============================================================================

/**
 * Freeze credits for a video generation task
 * @deprecated Use freezeMediaCredits instead
 */
export async function freezeCredits(params: {
  userId: string;
  credits: number;
  videoUuid: string;
}): Promise<FreezeResult> {
  return freezeMediaCredits({
    userId: params.userId,
    credits: params.credits,
    mediaUuid: params.videoUuid,
    mediaType: 'video',
  });
}

/**
 * Settle credits after successful video generation
 * @deprecated Use settleMediaCredits instead
 */
export async function settleCredits(videoUuid: string): Promise<void> {
  return settleMediaCredits(videoUuid, 'video');
}

/**
 * Release credits after failed video generation
 * @deprecated Use releaseMediaCredits instead
 */
export async function releaseCredits(videoUuid: string): Promise<void> {
  return releaseMediaCredits(videoUuid, 'video');
}
