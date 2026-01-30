import { requireSession, unauthorizedResponse } from '@/lib/require-session';
import { imageService } from '@/services/image';
import { type NextRequest, NextResponse } from 'next/server';

// Validate image UUID format
const VALID_IMAGE_UUID_PATTERN = /^img_[a-zA-Z0-9_-]{21}$/;

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

    const newFavoriteStatus = await imageService.toggleFavorite(
      uuid,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: { isFavorite: newFavoriteStatus },
    });
  } catch (error) {
    console.error('[Image Favorite] Error:', error);

    if (error instanceof Error && error.message === 'Image not found') {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to toggle favorite',
      },
      { status: 500 }
    );
  }
}
