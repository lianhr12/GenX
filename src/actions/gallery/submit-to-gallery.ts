'use server';

import { getDb } from '@/db';
import {
  GalleryMediaType,
  GallerySourceType,
  GalleryStatus,
  galleryItems,
  images,
  videos,
} from '@/db/schema';
import { userActionClient } from '@/lib/safe-action';
import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';

const submitToGallerySchema = z
  .object({
    videoId: z.number().optional(),
    imageId: z.number().optional(),
    mediaType: z.enum(['video', 'image']).default('video'),
  })
  .refine((data) => data.videoId !== undefined || data.imageId !== undefined, {
    message: 'Either videoId or imageId must be provided',
  });

export const submitToGalleryAction = userActionClient
  .schema(submitToGallerySchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { videoId, imageId, mediaType } = parsedInput;
      const userId = ctx.user.id;

      const db = await getDb();

      if (mediaType === 'video' && videoId) {
        return await submitVideoToGallery(db, videoId, userId, ctx.user);
      }

      if (mediaType === 'image' && imageId) {
        return await submitImageToGallery(db, imageId, userId, ctx.user);
      }

      return {
        success: false,
        error: 'Invalid media type or missing ID',
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

async function submitVideoToGallery(
  db: Awaited<ReturnType<typeof getDb>>,
  videoId: number,
  userId: string,
  user: { name: string; image?: string | null }
) {
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

  // Check if video is already submitted (excluding removed items that can be re-submitted)
  const [existingSubmission] = await db
    .select({ id: galleryItems.id, status: galleryItems.status })
    .from(galleryItems)
    .where(eq(galleryItems.videoId, videoId))
    .limit(1);

  if (existingSubmission) {
    // If previously removed, update to pending instead of creating new
    if (existingSubmission.status === GalleryStatus.REMOVED) {
      await db
        .update(galleryItems)
        .set({
          status: GalleryStatus.PENDING,
          updatedAt: new Date(),
        })
        .where(eq(galleryItems.id, existingSubmission.id));
      return {
        success: true,
        data: {
          id: existingSubmission.id,
          uuid: '',
          reactivated: true,
        },
      };
    }
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
      mediaType: GalleryMediaType.VIDEO,
      videoId: video.id,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      aspectRatio: video.aspectRatio || '16:9',
      prompt: video.prompt,
      artStyle:
        (video.parameters as { artStyle?: string })?.artStyle || 'default',
      creatorId: userId,
      creatorName: user.name,
      creatorAvatar: user.image || null,
      sourceType: GallerySourceType.USER,
      status: GalleryStatus.PENDING,
      isFeatured: false,
      sortWeight: 0,
      hidePrompt: video.hidePrompt ?? false,
    })
    .returning({ id: galleryItems.id, uuid: galleryItems.uuid });

  return {
    success: true,
    data: {
      id: newItem.id,
      uuid: newItem.uuid,
    },
  };
}

async function submitImageToGallery(
  db: Awaited<ReturnType<typeof getDb>>,
  imageId: number,
  userId: string,
  user: { name: string; image?: string | null }
) {
  // Get the image and verify ownership
  const [image] = await db
    .select()
    .from(images)
    .where(
      and(
        eq(images.id, imageId),
        eq(images.userId, userId),
        eq(images.status, 'COMPLETED'),
        eq(images.isDeleted, false)
      )
    )
    .limit(1);

  if (!image) {
    return {
      success: false,
      error: 'Image not found or not eligible for submission',
    };
  }

  const imageUrls = image.imageUrls as string[] | null;
  if (!imageUrls || imageUrls.length === 0) {
    return {
      success: false,
      error: 'Image must have at least one image URL',
    };
  }

  // Check if image is already submitted (excluding removed items that can be re-submitted)
  const [existingSubmission] = await db
    .select({ id: galleryItems.id, status: galleryItems.status })
    .from(galleryItems)
    .where(eq(galleryItems.imageId, imageId))
    .limit(1);

  if (existingSubmission) {
    // If previously removed, update to pending instead of creating new
    if (existingSubmission.status === GalleryStatus.REMOVED) {
      await db
        .update(galleryItems)
        .set({
          status: GalleryStatus.PENDING,
          updatedAt: new Date(),
        })
        .where(eq(galleryItems.id, existingSubmission.id));
      return {
        success: true,
        data: {
          id: existingSubmission.id,
          uuid: '',
          reactivated: true,
        },
      };
    }
    return {
      success: false,
      error: 'This image has already been submitted to the gallery',
    };
  }

  // Create gallery item
  const imageParams = image.parameters as { aspectRatio?: string } | null;
  const [newItem] = await db
    .insert(galleryItems)
    .values({
      uuid: nanoid(),
      mediaType: GalleryMediaType.IMAGE,
      imageId: image.id,
      thumbnailUrl: image.thumbnailUrl || imageUrls[0],
      imageUrls: imageUrls,
      aspectRatio: imageParams?.aspectRatio || '1:1',
      prompt: image.prompt,
      artStyle: 'default',
      creatorId: userId,
      creatorName: user.name,
      creatorAvatar: user.image || null,
      sourceType: GallerySourceType.USER,
      status: GalleryStatus.PENDING,
      isFeatured: false,
      sortWeight: 0,
      hidePrompt: image.hidePrompt ?? false,
    })
    .returning({ id: galleryItems.id, uuid: galleryItems.uuid });

  return {
    success: true,
    data: {
      id: newItem.id,
      uuid: newItem.uuid,
    },
  };
}

/**
 * Auto-submit to gallery when generation completes
 * Called from video/image service when isPublic=true
 */
export async function autoSubmitToGallery(params: {
  mediaType: 'video' | 'image';
  mediaId: number;
  userId: string;
  userName: string;
  userAvatar?: string | null;
}): Promise<{ success: boolean; galleryItemId?: number }> {
  try {
    const db = await getDb();

    if (params.mediaType === 'video') {
      const result = await submitVideoToGallery(
        db,
        params.mediaId,
        params.userId,
        { name: params.userName, image: params.userAvatar }
      );
      return {
        success: result.success,
        galleryItemId: result.data?.id,
      };
    }

    if (params.mediaType === 'image') {
      const result = await submitImageToGallery(
        db,
        params.mediaId,
        params.userId,
        { name: params.userName, image: params.userAvatar }
      );
      return {
        success: result.success,
        galleryItemId: result.data?.id,
      };
    }

    return { success: false };
  } catch (error) {
    console.error('Auto-submit to gallery error:', error);
    return { success: false };
  }
}
