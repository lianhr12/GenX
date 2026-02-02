'use server';

import { getDb } from '@/db';
import {
  ArtStyle,
  GallerySourceType,
  GalleryStatus,
  galleryItems,
  images,
  videos,
} from '@/db/schema';
import { adminActionClient } from '@/lib/safe-action';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';

const createGalleryItemSchema = z.object({
  videoUrl: z.string().url(),
  thumbnailUrl: z.string().url(),
  prompt: z.string().min(1),
  artStyle: z.enum([
    ArtStyle.CYBERPUNK,
    ArtStyle.WATERCOLOR,
    ArtStyle.OIL_PAINTING,
    ArtStyle.ANIME,
    ArtStyle.FLUID_ART,
  ]),
  sourceType: z
    .enum([GallerySourceType.OFFICIAL, GallerySourceType.USER])
    .default(GallerySourceType.OFFICIAL),
  creatorName: z.string().optional(),
  creatorAvatar: z.string().url().optional(),
  isFeatured: z.boolean().default(false),
  sortWeight: z.number().default(0),
});

export const createGalleryItemAction = adminActionClient
  .schema(createGalleryItemSchema)
  .action(async ({ parsedInput }) => {
    try {
      const db = await getDb();

      const [newItem] = await db
        .insert(galleryItems)
        .values({
          uuid: nanoid(),
          videoUrl: parsedInput.videoUrl,
          thumbnailUrl: parsedInput.thumbnailUrl,
          prompt: parsedInput.prompt,
          artStyle: parsedInput.artStyle,
          sourceType: parsedInput.sourceType,
          creatorName: parsedInput.creatorName || null,
          creatorAvatar: parsedInput.creatorAvatar || null,
          isFeatured: parsedInput.isFeatured,
          sortWeight: parsedInput.sortWeight,
          // Official items are auto-approved
          status:
            parsedInput.sourceType === GallerySourceType.OFFICIAL
              ? GalleryStatus.APPROVED
              : GalleryStatus.PENDING,
        })
        .returning();

      return {
        success: true,
        data: newItem,
      };
    } catch (error) {
      console.error('create gallery item error:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create gallery item',
      };
    }
  });

const updateGalleryItemSchema = z.object({
  id: z.number(),
  videoUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  prompt: z.string().min(1).optional(),
  artStyle: z
    .enum([
      ArtStyle.CYBERPUNK,
      ArtStyle.WATERCOLOR,
      ArtStyle.OIL_PAINTING,
      ArtStyle.ANIME,
      ArtStyle.FLUID_ART,
    ])
    .optional(),
  creatorName: z.string().optional(),
  isFeatured: z.boolean().optional(),
  sortWeight: z.number().optional(),
});

export const updateGalleryItemAction = adminActionClient
  .schema(updateGalleryItemSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { id, ...updateData } = parsedInput;

      const db = await getDb();

      // Build update object, only include defined fields
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (updateData.videoUrl !== undefined)
        updates.videoUrl = updateData.videoUrl;
      if (updateData.thumbnailUrl !== undefined)
        updates.thumbnailUrl = updateData.thumbnailUrl;
      if (updateData.prompt !== undefined) updates.prompt = updateData.prompt;
      if (updateData.artStyle !== undefined)
        updates.artStyle = updateData.artStyle;
      if (updateData.creatorName !== undefined)
        updates.creatorName = updateData.creatorName;
      if (updateData.isFeatured !== undefined)
        updates.isFeatured = updateData.isFeatured;
      if (updateData.sortWeight !== undefined)
        updates.sortWeight = updateData.sortWeight;

      const [updatedItem] = await db
        .update(galleryItems)
        .set(updates)
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
      console.error('update gallery item error:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update gallery item',
      };
    }
  });

const deleteGalleryItemSchema = z.object({
  id: z.number(),
});

export const deleteGalleryItemAction = adminActionClient
  .schema(deleteGalleryItemSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { id } = parsedInput;

      const db = await getDb();

      const [deletedItem] = await db
        .delete(galleryItems)
        .where(eq(galleryItems.id, id))
        .returning({ id: galleryItems.id });

      if (!deletedItem) {
        return {
          success: false,
          error: 'Gallery item not found',
        };
      }

      return {
        success: true,
        data: { id: deletedItem.id },
      };
    } catch (error) {
      console.error('delete gallery item error:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete gallery item',
      };
    }
  });

const removeGalleryItemSchema = z.object({
  id: z.number(),
  reason: z.string().optional(),
});

/**
 * Admin action to remove (soft delete) a gallery item
 * This marks the item as removed and sets the original media's isPublic to false
 */
export const removeGalleryItemAction = adminActionClient
  .schema(removeGalleryItemSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { id, reason } = parsedInput;

      const db = await getDb();

      // Get the gallery item
      const [galleryItem] = await db
        .select()
        .from(galleryItems)
        .where(eq(galleryItems.id, id))
        .limit(1);

      if (!galleryItem) {
        return {
          success: false,
          error: 'Gallery item not found',
        };
      }

      // Mark gallery item as removed
      await db
        .update(galleryItems)
        .set({
          status: GalleryStatus.REMOVED,
          rejectReason: reason || 'Removed by admin',
          updatedAt: new Date(),
        })
        .where(eq(galleryItems.id, id));

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
          id,
          status: GalleryStatus.REMOVED,
        },
      };
    } catch (error) {
      console.error('remove gallery item error:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to remove gallery item',
      };
    }
  });
