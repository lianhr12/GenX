import { requireSession, unauthorizedResponse } from '@/lib/require-session';
import { imageService } from '@/services/image';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validate image UUID format
const VALID_IMAGE_UUID_PATTERN = /^img_[a-zA-Z0-9_-]{21}$/;

const batchOperationSchema = z.object({
  operation: z.enum(['delete', 'favorite']),
  uuids: z.array(z.string()).min(1).max(100),
  isFavorite: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const session = await requireSession(req);
  if (!session) {
    return unauthorizedResponse();
  }

  try {
    const body = await req.json();
    const parseResult = batchOperationSchema.safeParse(body);

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

    const { operation, uuids, isFavorite } = parseResult.data;

    // Validate all UUIDs
    const invalidUuids = uuids.filter(
      (uuid) => !VALID_IMAGE_UUID_PATTERN.test(uuid)
    );
    if (invalidUuids.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid image UUIDs',
          details: invalidUuids,
        },
        { status: 400 }
      );
    }

    let result: { success: boolean; affected: number };

    switch (operation) {
      case 'delete':
        result = await imageService.batchDelete(uuids, session.user.id);
        break;
      case 'favorite':
        if (isFavorite === undefined) {
          return NextResponse.json(
            {
              success: false,
              error: 'isFavorite is required for favorite operation',
            },
            { status: 400 }
          );
        }
        result = await imageService.batchFavorite(
          uuids,
          session.user.id,
          isFavorite
        );
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Unknown operation' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        operation,
        affected: result.affected,
      },
    });
  } catch (error) {
    console.error('[Image Batch] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to perform batch operation',
      },
      { status: 500 }
    );
  }
}
