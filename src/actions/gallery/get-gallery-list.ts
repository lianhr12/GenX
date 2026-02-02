'use server';

import { getDb } from '@/db';
import {
  GalleryStatus,
  galleryFavorites,
  galleryItems,
  galleryLikes,
} from '@/db/schema';
import { actionClient } from '@/lib/safe-action';
import { and, count as countFn, desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';

const getGalleryListSchema = z.object({
  pageIndex: z.number().min(0).default(0),
  pageSize: z.number().min(1).max(50).default(12),
  artStyle: z.string().optional(),
  sort: z.enum(['latest', 'popular']).default('latest'),
  userId: z.string().optional(), // For checking if user has liked/favorited
});

export const getGalleryListAction = actionClient
  .schema(getGalleryListSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { pageIndex, pageSize, artStyle, sort, userId } = parsedInput;
      const offset = pageIndex * pageSize;

      const db = await getDb();

      // Build where conditions - only show approved items
      const conditions = [eq(galleryItems.status, GalleryStatus.APPROVED)];

      if (artStyle && artStyle !== 'all') {
        conditions.push(eq(galleryItems.artStyle, artStyle));
      }

      const where = and(...conditions);

      // Determine sort order
      const orderBy =
        sort === 'popular'
          ? [desc(galleryItems.likesCount), desc(galleryItems.createdAt)]
          : [desc(galleryItems.createdAt)];

      // Get items
      const items = await db
        .select({
          id: galleryItems.id,
          uuid: galleryItems.uuid,
          mediaType: galleryItems.mediaType,
          videoUrl: galleryItems.videoUrl,
          thumbnailUrl: galleryItems.thumbnailUrl,
          imageUrls: galleryItems.imageUrls,
          aspectRatio: galleryItems.aspectRatio,
          prompt: galleryItems.prompt,
          artStyle: galleryItems.artStyle,
          creatorName: galleryItems.creatorName,
          creatorAvatar: galleryItems.creatorAvatar,
          likesCount: galleryItems.likesCount,
          viewsCount: galleryItems.viewsCount,
          createdAt: galleryItems.createdAt,
        })
        .from(galleryItems)
        .where(where)
        .orderBy(...orderBy)
        .limit(pageSize)
        .offset(offset);

      // Get total count
      const [{ count }] = await db
        .select({ count: countFn() })
        .from(galleryItems)
        .where(where);

      // If userId provided, check which items user has liked and favorited
      let likedItemIds: number[] = [];
      let favoritedItemIds: number[] = [];
      if (userId && items.length > 0) {
        const itemIds = items.map((item) => item.id);
        const itemIdsCondition = sql`${sql.join(
          itemIds.map((id) => sql`${id}`),
          sql`, `
        )}`;

        // Get likes
        const likes = await db
          .select({ galleryItemId: galleryLikes.galleryItemId })
          .from(galleryLikes)
          .where(
            and(
              eq(galleryLikes.userId, userId),
              sql`${galleryLikes.galleryItemId} IN (${itemIdsCondition})`
            )
          );
        likedItemIds = likes.map((like) => like.galleryItemId);

        // Get favorites
        const favorites = await db
          .select({ galleryItemId: galleryFavorites.galleryItemId })
          .from(galleryFavorites)
          .where(
            and(
              eq(galleryFavorites.userId, userId),
              sql`${galleryFavorites.galleryItemId} IN (${itemIdsCondition})`
            )
          );
        favoritedItemIds = favorites.map((fav) => fav.galleryItemId);
      }

      // Add isLiked and isFavorite flags to items
      const itemsWithStatus = items.map((item) => ({
        ...item,
        isLiked: likedItemIds.includes(item.id),
        isFavorite: favoritedItemIds.includes(item.id),
      }));

      return {
        success: true,
        data: {
          items: itemsWithStatus,
          total: Number(count),
          hasMore: offset + items.length < Number(count),
        },
      };
    } catch (error) {
      console.error('get gallery list error:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch gallery',
      };
    }
  });
