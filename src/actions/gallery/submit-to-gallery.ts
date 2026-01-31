'use server';

import { getDb } from '@/db';
import {
  GallerySourceType,
  GalleryStatus,
  galleryItems,
  videos,
} from '@/db/schema';
import { userActionClient } from '@/lib/safe-action';
import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';

const submitToGallerySchema = z.object({
  videoId: z.number(),
});

export const submitToGalleryAction = userActionClient
  .schema(submitToGallerySchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { videoId } = parsedInput;
      const userId = ctx.user.id;

      const db = await getDb();

      // Get the video and verify ownership
      const [video] = await db
        .select()
        .from(videos)
        .where(
          and(
            eq(videos.id, videoId),
            eq(videos.userId, userId),
            eq(videos.status, 'COMPLETED'),
            eq(videos.isDeleted, false)
          )
        )
        .limit(1);

      if (!video) {
        return {
          success: false,
          error: 'Video not found or not eligible for submission',
        };
      }

      if (!video.videoUrl || !video.thumbnailUrl) {
        return {
          success: false,
          error: 'Video must have both video URL and thumbnail',
        };
      }

      // Check if video is already submitted
      const [existingSubmission] = await db
        .select({ id: galleryItems.id })
        .from(galleryItems)
        .where(eq(galleryItems.videoId, videoId))
        .limit(1);

      if (existingSubmission) {
        return {
          success: false,
          error: 'This video has already been submitted to the gallery',
        };
      }

      // Create gallery item
      const [newItem] = await db
        .insert(galleryItems)
        .values({
          uuid: nanoid(),
          videoId: video.id,
          videoUrl: video.videoUrl,
          thumbnailUrl: video.thumbnailUrl,
          prompt: video.prompt,
          artStyle:
            (video.parameters as { artStyle?: string })?.artStyle || 'default',
          creatorId: userId,
          creatorName: ctx.user.name,
          creatorAvatar: ctx.user.image || null,
          sourceType: GallerySourceType.USER,
          status: GalleryStatus.PENDING,
          isFeatured: false,
          sortWeight: 0,
        })
        .returning({ id: galleryItems.id, uuid: galleryItems.uuid });

      return {
        success: true,
        data: {
          id: newItem.id,
          uuid: newItem.uuid,
        },
      };
    } catch (error) {
      console.error('submit to gallery error:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to submit to gallery',
      };
    }
  });
