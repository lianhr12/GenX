/**
 * Video Batch Operations API
 * POST /api/v1/video/batch
 */

import { requireSession, unauthorizedResponse } from '@/lib/require-session';
import { videoService } from '@/services/video';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const batchSchema = z.object({
  action: z.enum(['delete', 'favorite', 'unfavorite']),
  uuids: z.array(z.string()).min(1).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (!session) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { action, uuids } = batchSchema.parse(body);

    let result: { success: boolean; affected: number };

    switch (action) {
      case 'delete': {
        const deleteCount = await videoService.batchDelete(
          uuids,
          session.user.id
        );
        result = { success: true, affected: deleteCount };
        break;
      }
      case 'favorite': {
        const favCount = await videoService.batchFavorite(
          uuids,
          session.user.id,
          true
        );
        result = { success: true, affected: favCount };
        break;
      }
      case 'unfavorite': {
        const unfavCount = await videoService.batchFavorite(
          uuids,
          session.user.id,
          false
        );
        result = { success: true, affected: unfavCount };
        break;
      }
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Video batch error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 }
      );
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
