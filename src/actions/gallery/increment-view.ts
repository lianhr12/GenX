'use server';

import { getDb } from '@/db';
import { GalleryStatus, galleryItems } from '@/db/schema';
import { actionClient } from '@/lib/safe-action';
import { and, eq, sql } from 'drizzle-orm';
import { z } from 'zod';

const incrementViewSchema = z.object({
  galleryItemId: z.number(),
});

export const incrementViewAction = actionClient
  .schema(incrementViewSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { galleryItemId } = parsedInput;

      const db = await getDb();

      // Increment view count for approved items only
      const result = await db
        .update(galleryItems)
        .set({
          viewsCount: sql`${galleryItems.viewsCount} + 1`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(galleryItems.id, galleryItemId),
            eq(galleryItems.status, GalleryStatus.APPROVED)
          )
        )
        .returning({ viewsCount: galleryItems.viewsCount });

      if (result.length === 0) {
        return {
          success: false,
          error: 'Gallery item not found',
        };
      }

      return {
        success: true,
        data: {
          viewsCount: result[0].viewsCount,
        },
      };
    } catch (error) {
      console.error('increment view error:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to increment view',
      };
    }
  });
