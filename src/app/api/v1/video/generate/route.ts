/**
 * Video Generation API
 * POST /api/v1/video/generate
 */

import { getAvailableModels } from '@/config/video-credits';
import { requireSession, unauthorizedResponse } from '@/lib/require-session';
import { videoService } from '@/services/video';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const availableModels = getAvailableModels();
const aspectRatioOptions = Array.from(
  new Set(availableModels.flatMap((model) => model.aspectRatios))
);
const qualityOptions = Array.from(
  new Set(availableModels.flatMap((model) => model.qualities ?? []))
);
const allQualityOptions = Array.from(
  new Set([...qualityOptions, 'standard', 'high'])
);

const generateSchema = z.object({
  prompt: z.string().min(1).max(5000),
  model: z.string().min(1),
  duration: z.number().min(1).max(30),
  aspectRatio: z.enum(aspectRatioOptions as [string, ...string[]]).optional(),
  quality: z.enum(allQualityOptions as [string, ...string[]]).optional(),
  imageUrl: z.string().url().optional(),
  isPublic: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (!session) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const data = generateSchema.parse(body);

    const result = await videoService.generate({
      userId: session.user.id,
      prompt: data.prompt,
      model: data.model,
      duration: data.duration,
      aspectRatio: data.aspectRatio as
        | '16:9'
        | '9:16'
        | '1:1'
        | '4:3'
        | '3:4'
        | '21:9'
        | undefined,
      quality: data.quality as
        | 'standard'
        | 'high'
        | '480P'
        | '720P'
        | '1080P'
        | undefined,
      imageUrl: data.imageUrl,
      isPublic: data.isPublic,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Video generate error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.issues },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
