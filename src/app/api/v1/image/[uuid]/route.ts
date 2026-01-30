import { requireSession, unauthorizedResponse } from '@/lib/require-session';
import { imageService } from '@/services/image';
import { type NextRequest, NextResponse } from 'next/server';

// Validate image UUID format
const VALID_IMAGE_UUID_PATTERN = /^img_[a-zA-Z0-9_-]{21}$/;

interface RouteParams {
  params: Promise<{ uuid: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
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

    const image = await imageService.getImage(uuid, session.user.id);

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: image,
    });
  } catch (error) {
    console.error('[Image Get] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get image',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
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

    const deleted = await imageService.deleteImage(uuid, session.user.id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    console.error('[Image Delete] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to delete image',
      },
      { status: 500 }
    );
  }
}
