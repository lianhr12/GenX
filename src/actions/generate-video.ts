'use server';

import type { User } from '@/lib/auth-types';
import { userActionClient } from '@/lib/safe-action';
import { videoService } from '@/services/video';
import { z } from 'zod';

// Generate video schema
const generateVideoSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(5000),
  model: z.string().min(1),
  duration: z.number().min(1).max(30),
  aspectRatio: z.string().optional(),
  quality: z.string().optional(),
  imageUrl: z.string().url().optional(),
  generateAudio: z.boolean().optional(),
  audioUrl: z.string().url().optional(),
  isPublic: z.boolean().optional(),
  hidePrompt: z.boolean().optional(),
});

/**
 * Generate video action
 */
export const generateVideoAction = userActionClient
  .schema(generateVideoSchema)
  .action(async ({ parsedInput, ctx }) => {
    const currentUser = (ctx as { user: User }).user;

    try {
      const result = await videoService.generate({
        userId: currentUser.id,
        prompt: parsedInput.prompt,
        model: parsedInput.model,
        duration: parsedInput.duration,
        aspectRatio: parsedInput.aspectRatio as
          | '16:9'
          | '9:16'
          | '1:1'
          | '4:3'
          | '3:4'
          | '21:9'
          | undefined,
        quality: parsedInput.quality as
          | 'standard'
          | 'high'
          | '480P'
          | '720P'
          | '1080P'
          | undefined,
        imageUrl: parsedInput.imageUrl,
        audioUrl: parsedInput.audioUrl,
        generateAudio: parsedInput.generateAudio,
        isPublic: parsedInput.isPublic ?? true,
        hidePrompt: parsedInput.hidePrompt ?? false,
      });

      return {
        success: true,
        data: {
          videoUuid: result.videoUuid,
          taskId: result.taskId,
          provider: result.provider,
          status: result.status,
          estimatedTime: result.estimatedTime,
          creditsUsed: result.creditsUsed,
        },
      };
    } catch (error) {
      console.error('Generate video error:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to generate video',
      };
    }
  });

// Refresh video status schema
const refreshStatusSchema = z.object({
  videoUuid: z.string().min(1),
});

/**
 * Refresh video status action
 */
export const refreshVideoStatusAction = userActionClient
  .schema(refreshStatusSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { videoUuid } = parsedInput;
    const currentUser = (ctx as { user: User }).user;

    try {
      const result = await videoService.refreshStatus(
        videoUuid,
        currentUser.id
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Refresh video status error:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to refresh video status',
      };
    }
  });
