/**
 * Image Visibility Toggle API
 * PATCH /api/v1/image/[uuid]/visibility
 */

import { autoSubmitToGallery } from '@/actions/gallery/submit-to-gallery';
import { getDb } from '@/db';
import { GalleryStatus, galleryItems, images, user } from '@/db/schema';
import { requireSession, unauthorizedResponse } from '@/lib/require-session';
import { and, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const toggleVisibilitySchema = z.object({
  isPublic: z.boolean(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const session = await requireSession(request);
    if (!session) {
      return unauthorizedResponse();
    }

    const { uuid } = await params;
    const body = await request.json();
    const { isPublic } = toggleVisibilitySchema.parse(body);

    const db = await getDb();

    // Get image and verify ownership
    const [image] = await db
      .select()
      .from(images)
      .where(
        and(
          eq(images.uuid, uuid),
          eq(images.userId, session.user.id),
          eq(images.isDeleted, false)
        )
      )
      .limit(1);

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // If no change, return early
    if (image.isPublic === isPublic) {
      return NextResponse.json({
        success: true,
        data: { isPublic: image.isPublic },
      });
    }

    // Update image visibility
    await db
      .update(images)
      .set({ isPublic, updatedAt: new Date() })
      .where(eq(images.uuid, uuid));

    // Handle gallery submission/removal
    if (isPublic) {
      // Making public: auto-submit to gallery if image is completed
      // Note: submitToGallery will validate imageUrls
      if (image.status === 'COMPLETED') {
        try {
          const [userInfo] = await db
            .select({ name: user.name, image: user.image })
            .from(user)
            .where(eq(user.id, session.user.id))
            .limit(1);

          if (userInfo) {
            await autoSubmitToGallery({
              mediaType: 'image',
              mediaId: image.id,
              userId: session.user.id,
              userName: userInfo.name,
              userAvatar: userInfo.image,
            });
          }
        } catch (error) {
          console.error('Failed to auto-submit image to gallery:', error);
        }
      }
    } else {
      // Making private: mark gallery item as removed
      await db
        .update(galleryItems)
        .set({
          status: GalleryStatus.REMOVED,
          updatedAt: new Date(),
        })
        .where(eq(galleryItems.imageId, image.id));
    }

    return NextResponse.json({
      success: true,
      data: { isPublic },
    });
  } catch (error) {
    console.error('Toggle image visibility error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to toggle visibility' },
      { status: 500 }
    );
  }
}
