'use server';

import { getDb } from '@/db';
import { GalleryStatus, galleryFavorites, galleryItems } from '@/db/schema';
import { userActionClient } from '@/lib/safe-action';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

const toggleFavoriteSchema = z.object({
  galleryItemId: z.number(),
});

export const toggleFavoriteAction = userActionClient
  .schema(toggleFavoriteSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { galleryItemId } = parsedInput;
      const userId = ctx.user.id;

      const db = await getDb();

      // Check if gallery item exists and is approved
      const [item] = await db
        .select({ id: galleryItems.id })
        .from(galleryItems)
        .where(
          and(
            eq(galleryItems.id, galleryItemId),
            eq(galleryItems.status, GalleryStatus.APPROVED)
          )
        )
        .limit(1);

      if (!item) {
        return {
          success: false,
          error: 'Gallery item not found',
        };
      }

      // Check if user already favorited
      const [existingFavorite] = await db
        .select({ id: galleryFavorites.id })
        .from(galleryFavorites)
        .where(
          and(
            eq(galleryFavorites.galleryItemId, galleryItemId),
            eq(galleryFavorites.userId, userId)
          )
        )
        .limit(1);

      if (existingFavorite) {
        // Unfavorite: remove favorite
        await db
          .delete(galleryFavorites)
          .where(eq(galleryFavorites.id, existingFavorite.id));

        return {
          success: true,
          data: {
            isFavorite: false,
          },
        };
      }

      // Favorite: add favorite
      await db.insert(galleryFavorites).values({
        galleryItemId,
        userId,
      });

      return {
        success: true,
        data: {
          isFavorite: true,
        },
      };
    } catch (error) {
      console.error('toggle favorite error:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to toggle favorite',
      };
    }
  });
