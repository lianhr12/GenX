import { requireSession, unauthorizedResponse } from '@/lib/require-session';
import { imageService } from '@/services/image';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const listQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  page: z.coerce.number().min(1).optional().default(1),
  userId: z.string().optional(),
  status: z.enum(['PENDING', 'GENERATING', 'COMPLETED', 'FAILED']).optional(),
  model: z.string().optional(),
  search: z.string().optional(),
});

export async function GET(req: NextRequest) {
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
    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const parseResult = listQuerySchema.safeParse(queryParams);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { limit, page, userId, status, model, search } = parseResult.data;

    const result = await imageService.adminListImages({
      limit,
      page,
      userId,
      status,
      model,
      search,
    });

    return NextResponse.json({
      success: true,
      data: {
        images: result.images,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    console.error('[Admin Images List] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list images',
      },
      { status: 500 }
    );
  }
}
