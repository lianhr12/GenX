/**
 * Video Detail API
 * GET /api/v1/video/[uuid] - Get video details
 * DELETE /api/v1/video/[uuid] - Delete video
 */

import { requireSession, unauthorizedResponse } from '@/lib/require-session';
import { videoService } from '@/services/video';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const session = await requireSession(request);
    if (!session) {
      return unauthorizedResponse();
    }

    const { uuid } = await params;
    const video = await videoService.getVideo(uuid, session.user.id);

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: video });
  } catch (error) {
    console.error('Video get error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const session = await requireSession(request);
    if (!session) {
      return unauthorizedResponse();
    }

    const { uuid } = await params;
    await videoService.deleteVideo(uuid, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Video delete error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
