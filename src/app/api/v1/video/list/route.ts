/**
 * Video List API
 * GET /api/v1/video/list
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSession, unauthorizedResponse } from '@/lib/require-session';
import { videoService } from '@/services/video';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (!session) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const cursor = searchParams.get('cursor') || undefined;
    const status = searchParams.get('status') || undefined;

    const result = await videoService.listVideos(session.user.id, {
      limit: Math.min(limit, 100),
      cursor,
      status,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Video list error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
