'use server';

import { getDb } from '@/db';
import { GalleryStatus, galleryItems, images, videos } from '@/db/schema';
import { userActionClient } from '@/lib/safe-action';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

const removeFromGallerySchema = z.object({
  galleryItemId: z.number(),
});

/**
 * User action to remove their own content from gallery
 * This will mark the gallery item as removed and set the original media's isPublic to false
 */
export const removeFromGalleryAction = userActionClient
  .schema(removeFromGallerySchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { galleryItemId } = parsedInput;
      const userId = ctx.user.id;

      const db = await getDb();

      // Get the gallery item and verify ownership
      const [galleryItem] = await db
        .select()
        .from(galleryItems)
        .where(
          and(
            eq(galleryItems.id, galleryItemId),
            eq(galleryItems.creatorId, userId)
          )
        )
        .limit(1);

      if (!galleryItem) {
        return {
          success: false,
          error:
            'Gallery item not found or you do not have permission to remove it',
        };
      }

      // Check if already removed
      if (galleryItem.status === GalleryStatus.REMOVED) {
        return {
          success: false,
          error: 'This item has already been removed from the gallery',
        };
      }

      // Mark gallery item as removed
      await db
        .update(galleryItems)
        .set({
          status: GalleryStatus.REMOVED,
          updatedAt: new Date(),
        })
        .where(eq(galleryItems.id, galleryItemId));

      // Update the original media's isPublic to false
      if (galleryItem.videoId) {
        await db
          .update(videos)
          .set({ isPublic: false, updatedAt: new Date() })
          .where(eq(videos.id, galleryItem.videoId));
      }

      if (galleryItem.imageId) {
        await db
          .update(images)
          .set({ isPublic: false, updatedAt: new Date() })
          .where(eq(images.id, galleryItem.imageId));
      }

      return {
        success: true,
        data: {
          id: galleryItemId,
          status: GalleryStatus.REMOVED,
        },
      };
    } catch (error) {
      console.error('Remove from gallery error:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to remove from gallery',
      };
    }
  });
