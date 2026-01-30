import { requireSession, unauthorizedResponse } from '@/lib/require-session';
import { imageService } from '@/services/image';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const listQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  page: z.coerce.number().min(1).optional().default(1),
  status: z.enum(['PENDING', 'GENERATING', 'COMPLETED', 'FAILED']).optional(),
  model: z.string().optional(),
  isFavorite: z.enum(['true', 'false']).optional(),
  search: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export async function GET(req: NextRequest) {
  const session = await requireSession(req);
  if (!session) {
    return unauthorizedResponse();
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

    const {
      limit,
      page,
      status,
      model,
      isFavorite,
      search,
      startDate,
      endDate,
    } = parseResult.data;

    const result = await imageService.listImages(session.user.id, {
      limit,
      page,
      status,
      model,
      isFavorite:
        isFavorite === 'true'
          ? true
          : isFavorite === 'false'
            ? false
            : undefined,
      search,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
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
    console.error('[Image List] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list images',
      },
      { status: 500 }
    );
  }
}
