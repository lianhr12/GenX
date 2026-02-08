'use server';

import type { User } from '@/lib/auth-types';
import { userActionClient } from '@/lib/safe-action';
import { imageService } from '@/services/image';
import { z } from 'zod';

// Generate image schema
const generateImageSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(2000),
  model: z.string().optional(),
  aspectRatio: z.enum(['1:1', '16:9', '9:16', '4:3', '3:4']).optional(),
  quality: z.enum(['high', 'medium', 'low']).optional(),
  numberOfImages: z.number().min(1).max(4).optional(),
  isPublic: z.boolean().optional(),
  hidePrompt: z.boolean().optional(),
});

// Model configurations
// Keys include both Evolink IDs (used by Creator UI) and short names (used by Tool pages)
const MODEL_CONFIGS: Record<
  string,
  {
    evolinkModel: string;
    defaultSize: string;
  }
> = {
  // GPT Image models (same ID in both formats)
  'gpt-image-1.5': {
    evolinkModel: 'gpt-image-1.5',
    defaultSize: '1024x1024',
  },
  'gpt-image-1.5-lite': {
    evolinkModel: 'gpt-image-1.5-lite',
    defaultSize: '1024x1024',
  },
  // Seedream models - short names (Tool page)
  'seedream-4.5': {
    evolinkModel: 'doubao-seedream-4.5',
    defaultSize: '2048x2048',
  },
  'seedream-4.0': {
    evolinkModel: 'doubao-seedream-4.0',
    defaultSize: '2048x2048',
  },
  // Seedream models - Evolink IDs (Creator UI)
  'doubao-seedream-4.5': {
    evolinkModel: 'doubao-seedream-4.5',
    defaultSize: '2048x2048',
  },
  'doubao-seedream-4.0': {
    evolinkModel: 'doubao-seedream-4.0',
    defaultSize: '2048x2048',
  },
  // Nanobanana Pro - short name (Tool page)
  'nanobanana-pro': {
    evolinkModel: 'gemini-3-pro-image-preview',
    defaultSize: '1024x1024',
  },
  // Nanobanana Pro - Evolink ID (Creator UI)
  'gemini-3-pro-image-preview': {
    evolinkModel: 'gemini-3-pro-image-preview',
    defaultSize: '1024x1024',
  },
  // Wan2.5 text-to-image - short name (Tool page)
  'wan2.5': {
    evolinkModel: 'wan2.5-text-to-image',
    defaultSize: '1280x1280',
  },
  // Wan2.5 text-to-image - Evolink ID (Creator UI)
  'wan2.5-text-to-image': {
    evolinkModel: 'wan2.5-text-to-image',
    defaultSize: '1280x1280',
  },
  // Nano Banana (Gemini 2.5 Flash)
  'gemini-2.5-flash-image': {
    evolinkModel: 'gemini-2.5-flash-image',
    defaultSize: '1024x1024',
  },
  // Nano Banana Pro Lite
  'nano-banana-2-lite': {
    evolinkModel: 'nano-banana-2-lite',
    defaultSize: '1024x1024',
  },
  // Z Image Turbo (Tongyi Lab)
  'z-image-turbo': {
    evolinkModel: 'z-image-turbo',
    defaultSize: '1024x1024',
  },
  // Wan2.5 image-to-image
  'wan2.5-image-to-image': {
    evolinkModel: 'wan2.5-image-to-image',
    defaultSize: '1280x1280',
  },
  // Qwen image editing models
  'qwen-image-edit': {
    evolinkModel: 'qwen-image-edit',
    defaultSize: '1024x1024',
  },
  'qwen-image-edit-plus': {
    evolinkModel: 'qwen-image-edit-plus',
    defaultSize: '1024x1024',
  },
};

// Aspect ratio fallback for GPT models
const ASPECT_RATIO_FALLBACK: Record<string, Record<string, string>> = {
  'gpt-limited': {
    '1:1': '1:1',
    '16:9': '3:2',
    '9:16': '2:3',
    '4:3': '3:2',
    '3:4': '2:3',
  },
  full: {
    '1:1': '1:1',
    '16:9': '16:9',
    '9:16': '9:16',
    '4:3': '4:3',
    '3:4': '3:4',
  },
};

/**
 * Generate image action
 */
export const generateImageAction = userActionClient
  .schema(generateImageSchema)
  .action(async ({ parsedInput, ctx }) => {
    const {
      prompt,
      model,
      aspectRatio,
      quality,
      numberOfImages,
      isPublic,
      hidePrompt,
    } = parsedInput;
    const currentUser = (ctx as { user: User }).user;

    try {
      // Get model config
      const modelKey = model || 'gpt-image-1.5-lite';
      const modelConfig =
        MODEL_CONFIGS[modelKey] || MODEL_CONFIGS['gpt-image-1.5-lite'];

      // Determine size
      const isGptModel = modelKey.startsWith('gpt-image');
      const fallbackMap = isGptModel
        ? ASPECT_RATIO_FALLBACK['gpt-limited']
        : ASPECT_RATIO_FALLBACK.full;

      const size = aspectRatio
        ? fallbackMap[aspectRatio] || aspectRatio
        : modelConfig.defaultSize;

      // Call image service
      const result = await imageService.generate({
        userId: currentUser.id,
        prompt,
        model: modelConfig.evolinkModel,
        aspectRatio,
        quality: quality || 'medium',
        numberOfImages: numberOfImages || 1,
        size,
        isPublic: isPublic ?? true,
        hidePrompt: hidePrompt ?? false,
      });

      return {
        success: true,
        data: {
          imageUuid: result.imageUuid,
          taskId: result.taskId,
          status: result.status,
          progress: result.progress,
        },
      };
    } catch (error) {
      console.error('Generate image error:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to generate image',
      };
    }
  });

// Refresh image status schema
const refreshStatusSchema = z.object({
  imageUuid: z.string().min(1),
});

/**
 * Refresh image status action
 */
export const refreshImageStatusAction = userActionClient
  .schema(refreshStatusSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { imageUuid } = parsedInput;
    const currentUser = (ctx as { user: User }).user;

    try {
      const result = await imageService.refreshStatus(
        imageUuid,
        currentUser.id
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Refresh image status error:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to refresh image status',
      };
    }
  });

// List images schema
const listImagesSchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  page: z.number().min(1).optional(),
  status: z.string().optional(),
  model: z.string().optional(),
  isFavorite: z.boolean().optional(),
  search: z.string().optional(),
});

/**
 * List user images action
 */
export const listImagesAction = userActionClient
  .schema(listImagesSchema)
  .action(async ({ parsedInput, ctx }) => {
    const currentUser = (ctx as { user: User }).user;

    try {
      const result = await imageService.listImages(currentUser.id, parsedInput);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('List images error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list images',
      };
    }
  });
