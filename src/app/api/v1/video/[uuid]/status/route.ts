/**
 * Video Status API
 * GET /api/v1/video/[uuid]/status - Poll video generation status
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSession, unauthorizedResponse } from '@/lib/require-session';
import { videoService } from '@/services/video';

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
    const status = await videoService.refreshStatus(uuid, session.user.id);

    return NextResponse.json({ success: true, data: status });
  } catch (error) {
    console.error('Video status error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message === 'Video not found') {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
