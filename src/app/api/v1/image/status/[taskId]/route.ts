import { getEvolinkImageProvider } from '@/ai/image/providers/evolink';
import { requireSession, unauthorizedResponse } from '@/lib/require-session';
import { type NextRequest, NextResponse } from 'next/server';

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

    // Get provider and check task status
    const provider = getEvolinkImageProvider();
    const taskResponse = await provider.getTaskStatus(taskId);

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
    console.error('Image status check error:', error);
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
