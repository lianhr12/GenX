/**
 * Video Favorite API
 * PATCH /api/v1/video/[uuid]/favorite
 */

import { requireSession, unauthorizedResponse } from '@/lib/require-session';
import { videoService } from '@/services/video';
import { type NextRequest, NextResponse } from 'next/server';

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
    const isFavorite = await videoService.toggleFavorite(uuid, session.user.id);

    return NextResponse.json({
      success: true,
      data: { isFavorite },
    });
  } catch (error) {
    console.error('Video favorite error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
