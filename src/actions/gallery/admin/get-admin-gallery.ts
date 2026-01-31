'use server';

import { getDb } from '@/db';
import { galleryItems } from '@/db/schema';
import { adminActionClient } from '@/lib/safe-action';
import { and, asc, count as countFn, desc, eq, ilike, or } from 'drizzle-orm';
import { z } from 'zod';

const getAdminGallerySchema = z.object({
  pageIndex: z.number().min(0).default(0),
  pageSize: z.number().min(1).max(100).default(10),
  search: z.string().optional().default(''),
  sorting: z
    .array(
      z.object({
        id: z.string(),
        desc: z.boolean(),
      })
    )
    .optional()
    .default([]),
  filters: z
    .array(
      z.object({
        id: z.string(),
        value: z.string(),
      })
    )
    .optional()
    .default([]),
});

// Define sort field mapping
const sortFieldMap = {
  prompt: galleryItems.prompt,
  artStyle: galleryItems.artStyle,
  sourceType: galleryItems.sourceType,
  status: galleryItems.status,
  isFeatured: galleryItems.isFeatured,
  likesCount: galleryItems.likesCount,
  viewsCount: galleryItems.viewsCount,
  creatorName: galleryItems.creatorName,
  createdAt: galleryItems.createdAt,
  sortWeight: galleryItems.sortWeight,
} as const;

export const getAdminGalleryAction = adminActionClient
  .schema(getAdminGallerySchema)
  .action(async ({ parsedInput }) => {
    try {
      const { pageIndex, pageSize, search, sorting, filters } = parsedInput;
      const offset = pageIndex * pageSize;

      const db = await getDb();

      // Build where conditions
      const conditions = [];

      // Search condition
      if (search) {
        conditions.push(
          or(
            ilike(galleryItems.prompt, `%${search}%`),
            ilike(galleryItems.creatorName, `%${search}%`)
          )
        );
      }

      // Filter conditions
      for (const filter of filters) {
        switch (filter.id) {
          case 'status':
            if (filter.value) {
              conditions.push(eq(galleryItems.status, filter.value));
            }
            break;
          case 'sourceType':
            if (filter.value) {
              conditions.push(eq(galleryItems.sourceType, filter.value));
            }
            break;
          case 'artStyle':
            if (filter.value) {
              conditions.push(eq(galleryItems.artStyle, filter.value));
            }
            break;
          case 'isFeatured':
            if (filter.value === 'true') {
              conditions.push(eq(galleryItems.isFeatured, true));
            } else if (filter.value === 'false') {
              conditions.push(eq(galleryItems.isFeatured, false));
            }
            break;
        }
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      // Get the sort configuration
      const sortConfig = sorting[0];
      const sortField = sortConfig?.id
        ? sortFieldMap[sortConfig.id as keyof typeof sortFieldMap]
        : galleryItems.createdAt;
      const sortDirection = sortConfig?.desc ? desc : asc;

      const [items, [{ count }]] = await Promise.all([
        db
          .select()
          .from(galleryItems)
          .where(where)
          .orderBy(sortDirection(sortField))
          .limit(pageSize)
          .offset(offset),
        db.select({ count: countFn() }).from(galleryItems).where(where),
      ]);

      return {
        success: true,
        data: {
          items,
          total: Number(count),
        },
      };
    } catch (error) {
      console.error('get admin gallery error:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch gallery items',
      };
    }
  });
