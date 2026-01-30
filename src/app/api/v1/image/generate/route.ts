import {
  type ImageGenerationParams,
  getEvolinkImageProvider,
} from '@/ai/image/providers/evolink';
import { requireSession, unauthorizedResponse } from '@/lib/require-session';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Constants for input validation
const MAX_PROMPT_LENGTH = 2000;
const MAX_IMAGES_PER_REQUEST = 4;
const MIN_IMAGES_PER_REQUEST = 1;

// Zod schema for request validation
const generateImageSchema = z.object({
  prompt: z
    .string()
    .min(1, 'Prompt is required')
    .max(
      MAX_PROMPT_LENGTH,
      `Prompt must be ${MAX_PROMPT_LENGTH} characters or less`
    ),
  model: z.string().optional(),
  aspectRatio: z.enum(['1:1', '16:9', '9:16', '4:3', '3:4']).optional(),
  quality: z.enum(['high', 'medium', 'low']).optional(),
  numberOfImages: z
    .number()
    .min(MIN_IMAGES_PER_REQUEST)
    .max(MAX_IMAGES_PER_REQUEST)
    .optional(),
  imageUrls: z.array(z.string().url()).max(5).optional(),
});

// Supported models and their mappings based on Evolink API documentation
const MODEL_CONFIGS: Record<
  string,
  { evolinkModel: string; defaultSize: string }
> = {
  // GPT Image models
  'gpt-image-1.5': {
    evolinkModel: 'gpt-image-1.5',
    defaultSize: '1024x1024',
  },
  'gpt-image-1.5-lite': {
    evolinkModel: 'gpt-image-1.5-lite',
    defaultSize: '1024x1024',
  },
  // Seedream models
  'seedream-4.5': {
    evolinkModel: 'doubao-seedream-4.5',
    defaultSize: '2048x2048',
  },
  'seedream-4.0': {
    evolinkModel: 'doubao-seedream-4.0',
    defaultSize: '2048x2048',
  },
  // Nanobanana models (using Gemini backend)
  'nanobanana-pro': {
    evolinkModel: 'gemini-3-pro-image-preview',
    defaultSize: '1024x1024',
  },
  // Wan2.5 text-to-image
  'wan2.5': {
    evolinkModel: 'wan2.5-text-to-image',
    defaultSize: '1280x1280',
  },
};

// Map aspect ratio to API-compatible format
// Evolink API accepts ratio strings directly (e.g., "1:1", "2:3")
// For ratios not directly supported, map to closest supported ratio
const ASPECT_RATIO_MAP: Record<string, string> = {
  '1:1': '1:1',
  '16:9': '16:9',
  '9:16': '9:16',
  '4:3': '4:3',
  '3:4': '3:4',
};

export async function POST(req: NextRequest) {
  // Protected API route: validate session
  const session = await requireSession(req);
  if (!session) {
    return unauthorizedResponse();
  }

  try {
    const body = await req.json();

    // Validate input with Zod
    const parseResult = generateImageSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request parameters',
          details: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { prompt, model, aspectRatio, quality, numberOfImages, imageUrls } =
      parseResult.data;

    // Get model config
    const modelKey = model || 'gpt-image-1.5';
    const modelConfig =
      MODEL_CONFIGS[modelKey] || MODEL_CONFIGS['gpt-image-1.5'];

    // Determine size - use aspect ratio string directly if provided
    // Evolink API accepts ratio strings like "1:1", "2:3", etc.
    const size = aspectRatio
      ? ASPECT_RATIO_MAP[aspectRatio] || aspectRatio
      : modelConfig.defaultSize;

    // Create task params
    const params: ImageGenerationParams = {
      model: modelConfig.evolinkModel,
      prompt,
      size,
      quality: quality || 'medium',
      n: numberOfImages || 1,
      imageUrls,
    };

    // Get provider and create task
    const provider = getEvolinkImageProvider();
    const taskResponse = await provider.createTask(params);

    // Log task creation for audit
    console.log(
      `[Image Generation] Task created: taskId=${taskResponse.taskId}, userId=${session.user.id}, model=${params.model}`
    );

    // If task is already completed (unlikely but possible), return images
    if (taskResponse.status === 'completed' && taskResponse.imageUrls) {
      return NextResponse.json({
        success: true,
        data: {
          taskId: taskResponse.taskId,
          status: taskResponse.status,
          images: taskResponse.imageUrls.map((url) => ({ url })),
        },
      });
    }

    // Return task info for polling
    return NextResponse.json({
      success: true,
      data: {
        taskId: taskResponse.taskId,
        status: taskResponse.status,
        progress: taskResponse.progress,
      },
    });
  } catch (error) {
    console.error(
      `[Image Generation] Error for userId=${session?.user?.id}:`,
      error
    );
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to generate image',
      },
      { status: 500 }
    );
  }
}
