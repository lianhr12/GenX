'use server';

import { getDb } from '@/db';
import { galleryItems, images, videos } from '@/db/schema';
import { adminActionClient } from '@/lib/safe-action';
import { eq, isNull } from 'drizzle-orm';

/**
 * Sync aspectRatio from videos/images to gallery items
 * This is a one-time migration action for existing data
 */
export const syncGalleryAspectRatioAction = adminActionClient.action(
  async () => {
    try {
      const db = await getDb();

      // Get all gallery items without aspectRatio
      const itemsToUpdate = await db
        .select({
          id: galleryItems.id,
          videoId: galleryItems.videoId,
          imageId: galleryItems.imageId,
          mediaType: galleryItems.mediaType,
        })
        .from(galleryItems)
        .where(isNull(galleryItems.aspectRatio));

      let updatedCount = 0;

      for (const item of itemsToUpdate) {
        let aspectRatio: string | null = null;

        if (item.videoId) {
          // Get aspectRatio from video
          const [video] = await db
            .select({ aspectRatio: videos.aspectRatio })
            .from(videos)
            .where(eq(videos.id, item.videoId))
            .limit(1);

          aspectRatio = video?.aspectRatio || '16:9';
        } else if (item.imageId) {
          // Get aspectRatio from image parameters
          const [image] = await db
            .select({ parameters: images.parameters })
            .from(images)
            .where(eq(images.id, item.imageId))
            .limit(1);

          const params = image?.parameters as { aspectRatio?: string } | null;
          aspectRatio = params?.aspectRatio || '1:1';
        } else {
          // Default based on media type
          aspectRatio = item.mediaType === 'video' ? '16:9' : '1:1';
        }

        if (aspectRatio) {
          await db
            .update(galleryItems)
            .set({ aspectRatio })
            .where(eq(galleryItems.id, item.id));
          updatedCount++;
        }
      }

      return {
        success: true,
        data: {
          totalItems: itemsToUpdate.length,
          updatedCount,
        },
      };
    } catch (error) {
      console.error('sync gallery aspect ratio error:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to sync aspect ratios',
      };
    }
  }
);
