import { requireSession, unauthorizedResponse } from '@/lib/require-session';
import { imageService } from '@/services/image';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validate image UUID format
const VALID_IMAGE_UUID_PATTERN = /^img_[a-zA-Z0-9_-]{21}$/;

const updateTagsSchema = z.object({
  tags: z.array(z.string().max(50)).max(20),
});

interface RouteParams {
  params: Promise<{ uuid: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await requireSession(req);
  if (!session) {
    return unauthorizedResponse();
  }

  try {
    const { uuid } = await params;

    if (!uuid || !VALID_IMAGE_UUID_PATTERN.test(uuid)) {
      return NextResponse.json(
        { success: false, error: 'Invalid image UUID' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parseResult = updateTagsSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
          details: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { tags } = parseResult.data;
    const newTags = await imageService.updateTags(uuid, session.user.id, tags);

    return NextResponse.json({
      success: true,
      data: { tags: newTags },
    });
  } catch (error) {
    console.error('[Image Tags] Error:', error);

    if (error instanceof Error && error.message === 'Image not found') {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update tags',
      },
      { status: 500 }
    );
  }
}
