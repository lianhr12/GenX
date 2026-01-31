'use server';

import { getDb } from '@/db';
import { GalleryStatus, galleryItems } from '@/db/schema';
import { adminActionClient } from '@/lib/safe-action';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const reviewGalleryItemSchema = z.object({
  id: z.number(),
  action: z.enum(['approve', 'reject']),
  rejectReason: z.string().optional(),
});

export const reviewGalleryItemAction = adminActionClient
  .schema(reviewGalleryItemSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { id, action, rejectReason } = parsedInput;
      const reviewerId = ctx.user.id;

      const db = await getDb();

      // Check if item exists and is pending
      const [item] = await db
        .select({ id: galleryItems.id, status: galleryItems.status })
        .from(galleryItems)
        .where(eq(galleryItems.id, id))
        .limit(1);

      if (!item) {
        return {
          success: false,
          error: 'Gallery item not found',
        };
      }

      if (item.status !== GalleryStatus.PENDING) {
        return {
          success: false,
          error: 'Gallery item has already been reviewed',
        };
      }

      const newStatus =
        action === 'approve' ? GalleryStatus.APPROVED : GalleryStatus.REJECTED;

      const [updatedItem] = await db
        .update(galleryItems)
        .set({
          status: newStatus,
          reviewedAt: new Date(),
          reviewedBy: reviewerId,
          rejectReason: action === 'reject' ? rejectReason : null,
          updatedAt: new Date(),
        })
        .where(eq(galleryItems.id, id))
        .returning();

      return {
        success: true,
        data: updatedItem,
      };
    } catch (error) {
      console.error('review gallery item error:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to review gallery item',
      };
    }
  });

const toggleFeaturedSchema = z.object({
  id: z.number(),
  isFeatured: z.boolean(),
});

export const toggleFeaturedAction = adminActionClient
  .schema(toggleFeaturedSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { id, isFeatured } = parsedInput;

      const db = await getDb();

      const [updatedItem] = await db
        .update(galleryItems)
        .set({
          isFeatured,
          updatedAt: new Date(),
        })
        .where(eq(galleryItems.id, id))
        .returning();

      if (!updatedItem) {
        return {
          success: false,
          error: 'Gallery item not found',
        };
      }

      return {
        success: true,
        data: updatedItem,
      };
    } catch (error) {
      console.error('toggle featured error:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to toggle featured status',
      };
    }
  });
