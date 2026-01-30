import { requireSession, unauthorizedResponse } from '@/lib/require-session';
import { imageService } from '@/services/image';
import { type NextRequest, NextResponse } from 'next/server';

// Validate image UUID format
const VALID_IMAGE_UUID_PATTERN = /^img_[a-zA-Z0-9_-]{21}$/;
// Also support legacy taskId format for backwards compatibility
const VALID_TASK_ID_PATTERN = /^[a-zA-Z0-9_-]{10,100}$/;

interface RouteParams {
  params: Promise<{ taskId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  // Protected API route: validate session
  const session = await requireSession(req);
  if (!session) {
    return unauthorizedResponse();
  }

  try {
    const { taskId } = await params;

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: 'Task ID or Image UUID is required' },
        { status: 400 }
      );
    }

    // Check if this is an imageUuid (new format) or taskId (legacy format)
    const isImageUuid = VALID_IMAGE_UUID_PATTERN.test(taskId);
    const isTaskId = VALID_TASK_ID_PATTERN.test(taskId);

    if (!isImageUuid && !isTaskId) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    // Use ImageService to get status and update database
    const result = await imageService.refreshStatus(taskId, session.user.id);

    // Log status check for audit
    console.log(
      `[Image Status] Check: id=${taskId}, userId=${session.user.id}, status=${result.status}`
    );

    // Return status with images if completed
    return NextResponse.json({
      success: true,
      data: {
        imageUuid: isImageUuid ? taskId : undefined,
        taskId: isImageUuid ? undefined : taskId,
        status: result.status.toLowerCase(),
        progress: result.progress,
        images: result.imageUrls?.map((url) => ({ url })),
        error: result.error ? { message: result.error } : undefined,
      },
    });
  } catch (error) {
    console.error(
      `[Image Status] Error for userId=${session?.user?.id}:`,
      error
    );
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to check image status',
      },
      { status: 500 }
    );
  }
}
