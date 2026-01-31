'use server';

import { getDb } from '@/db';
import { GalleryStatus, galleryItems, galleryLikes } from '@/db/schema';
import { userActionClient } from '@/lib/safe-action';
import { and, eq, sql } from 'drizzle-orm';
import { z } from 'zod';

const toggleLikeSchema = z.object({
  galleryItemId: z.number(),
});

export const toggleLikeAction = userActionClient
  .schema(toggleLikeSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { galleryItemId } = parsedInput;
      const userId = ctx.user.id;

      const db = await getDb();

      // Check if gallery item exists and is approved
      const [item] = await db
        .select({ id: galleryItems.id, likesCount: galleryItems.likesCount })
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

      // Check if user already liked
      const [existingLike] = await db
        .select({ id: galleryLikes.id })
        .from(galleryLikes)
        .where(
          and(
            eq(galleryLikes.galleryItemId, galleryItemId),
            eq(galleryLikes.userId, userId)
          )
        )
        .limit(1);

      if (existingLike) {
        // Unlike: remove like and decrement count
        await db
          .delete(galleryLikes)
          .where(eq(galleryLikes.id, existingLike.id));
        await db
          .update(galleryItems)
          .set({
            likesCount: sql`GREATEST(${galleryItems.likesCount} - 1, 0)`,
            updatedAt: new Date(),
          })
          .where(eq(galleryItems.id, galleryItemId));

        return {
          success: true,
          data: {
            isLiked: false,
            likesCount: Math.max(item.likesCount - 1, 0),
          },
        };
      }

      // Like: add like and increment count
      await db.insert(galleryLikes).values({
        galleryItemId,
        userId,
      });
      await db
        .update(galleryItems)
        .set({
          likesCount: sql`${galleryItems.likesCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(galleryItems.id, galleryItemId));

      return {
        success: true,
        data: {
          isLiked: true,
          likesCount: item.likesCount + 1,
        },
      };
    } catch (error) {
      console.error('toggle like error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to toggle like',
      };
    }
  });
