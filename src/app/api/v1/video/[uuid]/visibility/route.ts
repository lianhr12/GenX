/**
 * Video Visibility Toggle API
 * PATCH /api/v1/video/[uuid]/visibility
 */

import { autoSubmitToGallery } from '@/actions/gallery/submit-to-gallery';
import { getDb } from '@/db';
import { GalleryStatus, galleryItems, user, videos } from '@/db/schema';
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

    // Get video and verify ownership
    const [video] = await db
      .select()
      .from(videos)
      .where(
        and(
          eq(videos.uuid, uuid),
          eq(videos.userId, session.user.id),
          eq(videos.isDeleted, false)
        )
      )
      .limit(1);

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // If no change, return early
    if (video.isPublic === isPublic) {
      return NextResponse.json({
        success: true,
        data: { isPublic: video.isPublic },
      });
    }

    // Update video visibility
    await db
      .update(videos)
      .set({ isPublic, updatedAt: new Date() })
      .where(eq(videos.uuid, uuid));

    // Handle gallery submission/removal
    if (isPublic) {
      // Making public: auto-submit to gallery if video is completed
      // Note: submitToGallery will validate videoUrl and thumbnailUrl
      if (video.status === 'COMPLETED') {
        try {
          const [userInfo] = await db
            .select({ name: user.name, image: user.image })
            .from(user)
            .where(eq(user.id, session.user.id))
            .limit(1);

          if (userInfo) {
            await autoSubmitToGallery({
              mediaType: 'video',
              mediaId: video.id,
              userId: session.user.id,
              userName: userInfo.name,
              userAvatar: userInfo.image,
            });
          }
        } catch (error) {
          console.error('Failed to auto-submit video to gallery:', error);
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
        .where(eq(galleryItems.videoId, video.id));
    }

    return NextResponse.json({
      success: true,
      data: { isPublic },
    });
  } catch (error) {
    console.error('Toggle video visibility error:', error);

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
