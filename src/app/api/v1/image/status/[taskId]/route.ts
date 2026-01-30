import { getEvolinkImageProvider } from '@/ai/image/providers/evolink';
import { requireSession, unauthorizedResponse } from '@/lib/require-session';
import { getStorage } from '@/storage';
import { nanoid } from 'nanoid';
import { type NextRequest, NextResponse } from 'next/server';

// Validate task ID format to prevent injection attacks
const VALID_TASK_ID_PATTERN = /^[a-zA-Z0-9_-]{10,100}$/;

/**
 * Get file extension from URL
 */
function getExtensionFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const ext = pathname.split('.').pop()?.toLowerCase();
    if (ext && ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
      return ext;
    }
  } catch {
    // ignore
  }
  return 'png';
}

/**
 * Get content type from extension
 */
function getContentType(ext: string): string {
  const types: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
  };
  return types[ext] || 'image/png';
}

/**
 * Download image from source URL and upload to our storage
 */
async function transferImageToStorage(
  sourceUrl: string,
  taskId: string
): Promise<string> {
  const storage = getStorage();
  const ext = getExtensionFromUrl(sourceUrl);
  const key = `images/${taskId}/${nanoid(10)}.${ext}`;

  const result = await storage.downloadAndUpload({
    sourceUrl,
    key,
    contentType: getContentType(ext),
  });

  return result.url;
}

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

    // If completed, transfer images to our storage
    let images: { url: string }[] | undefined;
    if (taskResponse.status === 'completed' && taskResponse.imageUrls?.length) {
      try {
        const transferredUrls = await Promise.all(
          taskResponse.imageUrls.map((url) =>
            transferImageToStorage(url, taskId)
          )
        );
        images = transferredUrls.map((url) => ({ url }));
        console.log(
          `[Image Status] Transferred ${images.length} images to storage for taskId=${taskId}`
        );
      } catch (transferError) {
        console.error(
          '[Image Status] Failed to transfer images to storage:',
          transferError
        );
        // Fallback to original URLs if transfer fails
        images = taskResponse.imageUrls.map((url) => ({ url }));
      }
    } else if (taskResponse.imageUrls?.length) {
      images = taskResponse.imageUrls.map((url) => ({ url }));
    }

    // Return task status
    return NextResponse.json({
      success: true,
      data: {
        taskId: taskResponse.taskId,
        status: taskResponse.status,
        progress: taskResponse.progress,
        images,
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
