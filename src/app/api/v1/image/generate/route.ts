import { requireSession, unauthorizedResponse } from '@/lib/require-session';
import { imageService } from '@/services/image';
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
  isPublic: z.boolean().default(true),
  hidePrompt: z.boolean().default(false),
});

// Supported models and their mappings based on Evolink API documentation
// Keys include both Evolink IDs (used by Creator UI) and short names (used by Tool pages)
const MODEL_CONFIGS: Record<
  string,
  {
    evolinkModel: string;
    defaultSize: string;
    supportedSizes: string[];
  }
> = {
  // GPT Image models (same ID in both formats)
  'gpt-image-1.5': {
    evolinkModel: 'gpt-image-1.5',
    defaultSize: '1024x1024',
    supportedSizes: [
      '1024x1024',
      '1024x1536',
      '1536x1024',
      '1:1',
      '2:3',
      '3:2',
    ],
  },
  'gpt-image-1.5-lite': {
    evolinkModel: 'gpt-image-1.5-lite',
    defaultSize: '1024x1024',
    supportedSizes: [
      '1024x1024',
      '1024x1536',
      '1536x1024',
      '1:1',
      '2:3',
      '3:2',
    ],
  },
  // Seedream models - short names (Tool page)
  'seedream-4.5': {
    evolinkModel: 'doubao-seedream-4.5',
    defaultSize: '2048x2048',
    supportedSizes: ['1:1', '16:9', '9:16', '4:3', '3:4', '2:3', '3:2'],
  },
  'seedream-4.0': {
    evolinkModel: 'doubao-seedream-4.0',
    defaultSize: '2048x2048',
    supportedSizes: ['1:1', '16:9', '9:16', '4:3', '3:4', '2:3', '3:2'],
  },
  // Seedream models - Evolink IDs (Creator UI)
  'doubao-seedream-4.5': {
    evolinkModel: 'doubao-seedream-4.5',
    defaultSize: '2048x2048',
    supportedSizes: ['1:1', '16:9', '9:16', '4:3', '3:4', '2:3', '3:2'],
  },
  'doubao-seedream-4.0': {
    evolinkModel: 'doubao-seedream-4.0',
    defaultSize: '2048x2048',
    supportedSizes: ['1:1', '16:9', '9:16', '4:3', '3:4', '2:3', '3:2'],
  },
  // Nanobanana Pro - short name (Tool page)
  'nanobanana-pro': {
    evolinkModel: 'gemini-3-pro-image-preview',
    defaultSize: '1024x1024',
    supportedSizes: ['1:1', '16:9', '9:16', '4:3', '3:4', '2:3', '3:2'],
  },
  // Nanobanana Pro - Evolink ID (Creator UI)
  'gemini-3-pro-image-preview': {
    evolinkModel: 'gemini-3-pro-image-preview',
    defaultSize: '1024x1024',
    supportedSizes: ['1:1', '16:9', '9:16', '4:3', '3:4', '2:3', '3:2'],
  },
  // Wan2.5 text-to-image - short name (Tool page)
  'wan2.5': {
    evolinkModel: 'wan2.5-text-to-image',
    defaultSize: '1280x1280',
    supportedSizes: ['1:1', '16:9', '9:16', '4:3', '3:4', '2:3', '3:2'],
  },
  // Wan2.5 text-to-image - Evolink ID (Creator UI)
  'wan2.5-text-to-image': {
    evolinkModel: 'wan2.5-text-to-image',
    defaultSize: '1280x1280',
    supportedSizes: ['1:1', '16:9', '9:16', '4:3', '3:4', '2:3', '3:2'],
  },
  // Nano Banana (Gemini 2.5 Flash)
  'gemini-2.5-flash-image': {
    evolinkModel: 'gemini-2.5-flash-image',
    defaultSize: '1024x1024',
    supportedSizes: ['1:1', '2:3', '3:2', '4:3', '3:4', '16:9', '9:16'],
  },
  // Nano Banana Pro Lite
  'nano-banana-2-lite': {
    evolinkModel: 'nano-banana-2-lite',
    defaultSize: '1024x1024',
    supportedSizes: [
      '1:1',
      '2:3',
      '3:2',
      '3:4',
      '4:3',
      '4:5',
      '5:4',
      '9:16',
      '16:9',
      '21:9',
    ],
  },
  // Z Image Turbo (Tongyi Lab)
  'z-image-turbo': {
    evolinkModel: 'z-image-turbo',
    defaultSize: '1024x1024',
    supportedSizes: [
      '1:1',
      '2:3',
      '3:2',
      '3:4',
      '4:3',
      '9:16',
      '16:9',
      '1:2',
      '2:1',
    ],
  },
  // Wan2.5 image-to-image
  'wan2.5-image-to-image': {
    evolinkModel: 'wan2.5-image-to-image',
    defaultSize: '1280x1280',
    supportedSizes: ['1:1', '16:9', '9:16', '4:3', '3:4', '2:3', '3:2'],
  },
  // Qwen image editing models
  'qwen-image-edit': {
    evolinkModel: 'qwen-image-edit',
    defaultSize: '1024x1024',
    supportedSizes: ['1:1'],
  },
  'qwen-image-edit-plus': {
    evolinkModel: 'qwen-image-edit-plus',
    defaultSize: '1024x1024',
    supportedSizes: ['1:1'],
  },
};

// Map aspect ratio to closest supported ratio for models with limited support
// GPT models: only support 1:1, 2:3, 3:2
// Other models: support wider range including 16:9, 9:16, 4:3, 3:4
const ASPECT_RATIO_FALLBACK: Record<string, Record<string, string>> = {
  // For GPT models with limited size support
  'gpt-limited': {
    '1:1': '1:1',
    '16:9': '3:2', // Map 16:9 to closest supported 3:2
    '9:16': '2:3', // Map 9:16 to closest supported 2:3
    '4:3': '3:2', // Map 4:3 to closest supported 3:2
    '3:4': '2:3', // Map 3:4 to closest supported 2:3
  },
  // For models with full support
  full: {
    '1:1': '1:1',
    '16:9': '16:9',
    '9:16': '9:16',
    '4:3': '4:3',
    '3:4': '3:4',
  },
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

    const {
      prompt,
      model,
      aspectRatio,
      quality,
      numberOfImages,
      imageUrls,
      isPublic,
      hidePrompt,
    } = parseResult.data;

    // Get model config
    const modelKey = model || 'gpt-image-1.5';
    const modelConfig =
      MODEL_CONFIGS[modelKey] || MODEL_CONFIGS['gpt-image-1.5'];

    // Determine size - use aspect ratio with model-specific mapping
    // GPT models have limited size support, so we need to map unsupported ratios
    const isGptModel = modelKey.startsWith('gpt-image');
    const fallbackMap = isGptModel
      ? ASPECT_RATIO_FALLBACK['gpt-limited']
      : ASPECT_RATIO_FALLBACK.full;

    const size = aspectRatio
      ? fallbackMap[aspectRatio] || aspectRatio
      : modelConfig.defaultSize;

    // Use ImageService to create task and persist to database
    const result = await imageService.generate({
      userId: session.user.id,
      prompt,
      model: modelConfig.evolinkModel,
      aspectRatio,
      quality: quality || 'medium',
      numberOfImages: numberOfImages || 1,
      size,
      imageUrls,
      isPublic,
      hidePrompt,
    });

    // Log task creation for audit
    console.log(
      `[Image Generation] Task created: imageUuid=${result.imageUuid}, taskId=${result.taskId}, userId=${session.user.id}, model=${modelConfig.evolinkModel}`
    );

    // Return task info for polling (use imageUuid for status checks)
    return NextResponse.json({
      success: true,
      data: {
        imageUuid: result.imageUuid,
        taskId: result.taskId,
        status: result.status,
        progress: result.progress,
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
