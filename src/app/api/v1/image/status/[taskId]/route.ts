import { getEvolinkImageProvider } from '@/ai/image/providers/evolink';
import { requireSession, unauthorizedResponse } from '@/lib/require-session';
import { type NextRequest, NextResponse } from 'next/server';

// Validate task ID format to prevent injection attacks
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
        { success: false, error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Validate task ID format
    if (!VALID_TASK_ID_PATTERN.test(taskId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid task ID format' },
        { status: 400 }
      );
    }

    // Get provider and check task status
    const provider = getEvolinkImageProvider();
    const taskResponse = await provider.getTaskStatus(taskId);

    // Log status check for audit
    console.log(
      `[Image Status] Check: taskId=${taskId}, userId=${session.user.id}, status=${taskResponse.status}`
    );

    // Return task status
    return NextResponse.json({
      success: true,
      data: {
        taskId: taskResponse.taskId,
        status: taskResponse.status,
        progress: taskResponse.progress,
        images: taskResponse.imageUrls?.map((url) => ({ url })),
        error: taskResponse.error,
      },
    });
  } catch (error) {
    console.error(
      `[Image Status] Error for userId=${session?.user?.id}, taskId=unknown:`,
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
