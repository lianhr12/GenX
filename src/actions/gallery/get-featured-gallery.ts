'use server';

import { getDb } from '@/db';
import { GalleryStatus, galleryItems, galleryLikes } from '@/db/schema';
import { actionClient } from '@/lib/safe-action';
import { and, desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';

const getFeaturedGallerySchema = z.object({
  limit: z.number().min(1).max(20).default(6),
  userId: z.string().optional(), // For checking if user has liked
});

export const getFeaturedGalleryAction = actionClient
  .schema(getFeaturedGallerySchema)
  .action(async ({ parsedInput }) => {
    try {
      const { limit, userId } = parsedInput;

      const db = await getDb();

      // Get featured items that are approved
      const items = await db
        .select({
          id: galleryItems.id,
          uuid: galleryItems.uuid,
          videoUrl: galleryItems.videoUrl,
          thumbnailUrl: galleryItems.thumbnailUrl,
          prompt: galleryItems.prompt,
          artStyle: galleryItems.artStyle,
          creatorName: galleryItems.creatorName,
          creatorAvatar: galleryItems.creatorAvatar,
          likesCount: galleryItems.likesCount,
          viewsCount: galleryItems.viewsCount,
          createdAt: galleryItems.createdAt,
        })
        .from(galleryItems)
        .where(
          and(
            eq(galleryItems.status, GalleryStatus.APPROVED),
            eq(galleryItems.isFeatured, true)
          )
        )
        .orderBy(desc(galleryItems.sortWeight), desc(galleryItems.createdAt))
        .limit(limit);

      // If userId provided, check which items user has liked
      let likedItemIds: number[] = [];
      if (userId && items.length > 0) {
        const itemIds = items.map((item) => item.id);
        const likes = await db
          .select({ galleryItemId: galleryLikes.galleryItemId })
          .from(galleryLikes)
          .where(
            and(
              eq(galleryLikes.userId, userId),
              sql`${galleryLikes.galleryItemId} IN (${sql.join(
                itemIds.map((id) => sql`${id}`),
                sql`, `
              )})`
            )
          );
        likedItemIds = likes.map((like) => like.galleryItemId);
      }

      // Add isLiked flag to items
      const itemsWithLikeStatus = items.map((item) => ({
        ...item,
        isLiked: likedItemIds.includes(item.id),
      }));

      return {
        success: true,
        data: {
          items: itemsWithLikeStatus,
        },
      };
    } catch (error) {
      console.error('get featured gallery error:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch featured gallery',
      };
    }
  });
