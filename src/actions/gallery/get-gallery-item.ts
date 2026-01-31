'use server';

import { getDb } from '@/db';
import { GalleryStatus, galleryItems } from '@/db/schema';
import { actionClient } from '@/lib/safe-action';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

const getGalleryItemSchema = z.object({
  uuid: z.string(),
});

export const getGalleryItemAction = actionClient
  .schema(getGalleryItemSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { uuid } = parsedInput;

      const db = await getDb();

      const [item] = await db
        .select()
        .from(galleryItems)
        .where(
          and(
            eq(galleryItems.uuid, uuid),
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

      return {
        success: true,
        data: item,
      };
    } catch (error) {
      console.error('get gallery item error:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch gallery item',
      };
    }
  });
