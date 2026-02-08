'use server';

import { consumeCredits } from '@/credits/credits';
import type { User } from '@/lib/auth-types';
import { userActionClient } from '@/lib/safe-action';
import { z } from 'zod';

// consume credits schema
const consumeSchema = z.object({
  amount: z.number().min(1),
  description: z.string().optional(),
});

/**
 * Consume credits
 * WARNING: This action is restricted to development/test environment only.
 * In production, credits should only be consumed through the freeze-settle pattern
 * in image/video generation services.
 */
export const consumeCreditsAction = userActionClient
  .schema(consumeSchema)
  .action(async ({ parsedInput, ctx }) => {
    // Block in production to prevent abuse - credits should only be consumed via freeze-settle
    if (process.env.NODE_ENV === 'production') {
      console.error('consumeCreditsAction is disabled in production');
      return {
        success: false,
        error: 'This action is not available in production',
      };
    }

    const { amount, description } = parsedInput;
    const currentUser = (ctx as { user: User }).user;

    try {
      await consumeCredits({
        userId: currentUser.id,
        amount,
        description: description || `Consume credits: ${amount}`,
      });
      return { success: true };
    } catch (error) {
      console.error('consume credits error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Something went wrong',
      };
    }
  });
