import { requireSession, unauthorizedResponse } from '@/lib/require-session';
import { imageService } from '@/services/image';
import { type NextRequest, NextResponse } from 'next/server';

// Validate image UUID format
const VALID_IMAGE_UUID_PATTERN = /^img_[a-zA-Z0-9_-]{21}$/;

interface RouteParams {
  params: Promise<{ uuid: string }>;
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const session = await requireSession(req);
  if (!session) {
    return unauthorizedResponse();
  }

  // Check if user is admin
  if (session.user.role !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Forbidden: Admin access required' },
      { status: 403 }
    );
  }

  try {
    const { uuid } = await params;

    if (!uuid || !VALID_IMAGE_UUID_PATTERN.test(uuid)) {
      return NextResponse.json(
        { success: false, error: 'Invalid image UUID' },
        { status: 400 }
      );
    }

    // Check for hard delete query param
    const { searchParams } = new URL(req.url);
    const hardDelete = searchParams.get('hard') === 'true';

    const deleted = await imageService.adminDeleteImage(uuid, hardDelete);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    console.log(
      `[Admin Images] Deleted image: uuid=${uuid}, hardDelete=${hardDelete}, by=${session.user.id}`
    );

    return NextResponse.json({
      success: true,
      data: { deleted: true, hardDelete },
    });
  } catch (error) {
    console.error('[Admin Images Delete] Error:', error);
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
