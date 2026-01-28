import {
  getEvolinkImageProvider,
  type ImageGenerationParams,
} from '@/ai/image/providers/evolink';
import { requireSession, unauthorizedResponse } from '@/lib/require-session';
import { type NextRequest, NextResponse } from 'next/server';

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

// Map aspect ratio to size
const ASPECT_RATIO_TO_SIZE: Record<string, string> = {
  '1:1': '1024x1024',
  '16:9': '1792x1024',
  '9:16': '1024x1792',
  '4:3': '1024x768',
  '3:4': '768x1024',
};

interface GenerateImageRequest {
  prompt: string;
  model?: string;
  aspectRatio?: string;
  quality?: string;
  numberOfImages?: number;
  imageUrls?: string[];
}

export async function POST(req: NextRequest) {
  // Protected API route: validate session
  const session = await requireSession(req);
  if (!session) {
    return unauthorizedResponse();
  }

  try {
    const body = (await req.json()) as GenerateImageRequest;
    const { prompt, model, aspectRatio, quality, numberOfImages, imageUrls } =
      body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Get model config
    const modelKey = model || 'gpt-image-1.5';
    const modelConfig = MODEL_CONFIGS[modelKey] || MODEL_CONFIGS['gpt-image-1.5'];

    // Determine size from aspect ratio
    const size = aspectRatio
      ? ASPECT_RATIO_TO_SIZE[aspectRatio] || modelConfig.defaultSize
      : modelConfig.defaultSize;

    // Create task params
    const params: ImageGenerationParams = {
      model: modelConfig.evolinkModel,
      prompt,
      size,
      quality: quality || 'auto',
      n: numberOfImages || 1,
      imageUrls,
    };

    // Get provider and create task
    const provider = getEvolinkImageProvider();
    const taskResponse = await provider.createTask(params);

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
    console.error('Image generation error:', error);
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
