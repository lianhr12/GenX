/**
 * Video Generation Service
 * Handles the complete video generation lifecycle including:
 * - Task creation and credit freezing
 * - AI provider integration
 * - Callback handling
 * - Status polling
 * - Video storage and credit settlement
 */

import {
  type ProviderType,
  type VideoGenerationParams,
  type VideoTaskResponse,
  getProvider,
} from '@/ai/video';
import { generateSignedCallbackUrl } from '@/ai/video/utils/callback-signature';
import { calculateModelCredits, getModelConfig } from '@/config/video-credits';
import { freezeCredits, releaseCredits, settleCredits } from '@/credits/server';
import { type Video, VideoStatus, creditHolds, getDb, videos } from '@/db';
import { getStorage } from '@/storage';
import { and, desc, eq, ilike, inArray, lt } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// ============================================================================
// Types
// ============================================================================

export interface GenerateVideoParams extends VideoGenerationParams {
  userId: string;
  duration: number;
}

export interface VideoGenerationResult {
  videoUuid: string;
  taskId: string;
  provider: ProviderType;
  status: string;
  estimatedTime?: number;
  creditsUsed: number;
}

// ============================================================================
// Video Service Class
// ============================================================================

export class VideoService {
  private callbackBaseUrl: string;

  constructor() {
    this.callbackBaseUrl = process.env.AI_CALLBACK_URL || '';
  }

  /**
   * Create video generation task
   */
  async generate(params: GenerateVideoParams): Promise<VideoGenerationResult> {
    const db = await getDb();
    const modelConfig = getModelConfig(params.model);

    if (!modelConfig) {
      throw new Error(`Unsupported model: ${params.model}`);
    }

    // Validate duration against model's supported durations
    if (!modelConfig.durations.includes(params.duration)) {
      throw new Error(
        `Model ${params.model} only supports duration: ${modelConfig.durations.join(', ')} seconds. Got: ${params.duration}s`
      );
    }

    const creditsRequired = calculateModelCredits(params.model, {
      duration: params.duration,
      quality: params.quality,
    });

    if (params.imageUrl && !modelConfig.supportImageToVideo) {
      throw new Error(`Model ${params.model} does not support image-to-video`);
    }

    // Check image requirements for models with strict dimension requirements
    if (params.imageUrl && modelConfig.imageRequirements?.exactDimensions) {
      const aspectRatio = params.aspectRatio || '16:9';
      const requiredDimensions =
        modelConfig.imageRequirements.dimensions?.[aspectRatio];
      if (requiredDimensions) {
        throw new Error(
          `Image dimensions must match the requested video size. For ${params.model}: ` +
            `aspect_ratio=${aspectRatio} requires image size ${requiredDimensions.width}x${requiredDimensions.height}. ` +
            `Please resize your image to match the selected aspect_ratio.`
        );
      }
    }

    const videoUuid = `vid_${nanoid(21)}`;

    // Create video record
    const [videoResult] = await db
      .insert(videos)
      .values({
        uuid: videoUuid,
        userId: params.userId,
        prompt: params.prompt,
        model: params.model,
        parameters: {
          duration: params.duration,
          aspectRatio: params.aspectRatio,
          quality: params.quality,
        },
        status: VideoStatus.PENDING,
        startImageUrl: params.imageUrl || null,
        creditsUsed: creditsRequired,
        duration: params.duration,
        aspectRatio: params.aspectRatio || null,
        provider: modelConfig.provider,
        updatedAt: new Date(),
      })
      .returning({ uuid: videos.uuid, id: videos.id });

    if (!videoResult) {
      throw new Error('Failed to create video record');
    }

    // Freeze credits
    let freezeResult: { success: boolean; holdId: number };
    try {
      freezeResult = await freezeCredits({
        userId: params.userId,
        credits: creditsRequired,
        videoUuid: videoResult.uuid,
      });
    } catch (error) {
      await db
        .update(videos)
        .set({
          status: VideoStatus.FAILED,
          errorMessage: String(error),
          updatedAt: new Date(),
        })
        .where(eq(videos.uuid, videoResult.uuid));
      throw error;
    }

    if (!freezeResult.success) {
      await db
        .update(videos)
        .set({
          status: VideoStatus.FAILED,
          errorMessage: `Insufficient credits. Required: ${creditsRequired}`,
          updatedAt: new Date(),
        })
        .where(eq(videos.uuid, videoResult.uuid));
      throw new Error(`Insufficient credits. Required: ${creditsRequired}`);
    }

    // Call AI provider
    const provider = getProvider(modelConfig.provider);

    const callbackUrl = this.callbackBaseUrl
      ? generateSignedCallbackUrl(
          `${this.callbackBaseUrl}/${modelConfig.provider}`,
          videoResult.uuid
        )
      : undefined;

    try {
      const result = await provider.createTask({
        model: params.model,
        prompt: params.prompt,
        duration: params.duration,
        aspectRatio: params.aspectRatio,
        quality: params.quality,
        imageUrl: params.imageUrl,
        callbackUrl,
      });

      await db
        .update(videos)
        .set({
          status: VideoStatus.GENERATING,
          externalTaskId: result.taskId,
          updatedAt: new Date(),
        })
        .where(eq(videos.uuid, videoResult.uuid));

      return {
        videoUuid: videoResult.uuid,
        taskId: result.taskId,
        provider: modelConfig.provider,
        status: 'GENERATING',
        estimatedTime: result.estimatedTime,
        creditsUsed: creditsRequired,
      };
    } catch (error) {
      // Release credits on failure
      await releaseCredits(videoResult.uuid);

      await db
        .update(videos)
        .set({
          status: VideoStatus.FAILED,
          errorMessage: String(error),
          updatedAt: new Date(),
        })
        .where(eq(videos.uuid, videoResult.uuid));
      throw error;
    }
  }

  /**
   * Handle AI provider callback
   */
  async handleCallback(
    providerType: ProviderType,
    payload: unknown,
    videoUuid: string
  ): Promise<void> {
    const db = await getDb();
    const provider = getProvider(providerType);
    const result = provider.parseCallback(payload);

    const [video] = await db
      .select()
      .from(videos)
      .where(eq(videos.uuid, videoUuid))
      .limit(1);

    if (!video) {
      console.error(`Video not found: ${videoUuid}`);
      return;
    }

    if (video.externalTaskId && video.externalTaskId !== result.taskId) {
      console.error(
        `Task ID mismatch: expected ${video.externalTaskId}, got ${result.taskId}`
      );
      return;
    }

    if (result.status === 'completed' && result.videoUrl) {
      await this.tryCompleteGeneration(video.uuid, result);
    } else if (result.status === 'failed') {
      await this.tryFailGeneration(video.uuid, result.error?.message);
    }
  }

  /**
   * Get task status (for frontend polling)
   */
  async refreshStatus(
    videoUuid: string,
    userId: string
  ): Promise<{
    status: string;
    videoUrl?: string;
    error?: string;
  }> {
    const db = await getDb();
    const [video] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.uuid, videoUuid), eq(videos.userId, userId)))
      .limit(1);

    if (!video) {
      throw new Error('Video not found');
    }

    if (
      video.status === VideoStatus.COMPLETED ||
      video.status === VideoStatus.FAILED
    ) {
      return {
        status: video.status,
        videoUrl: video.videoUrl || undefined,
        error: video.errorMessage || undefined,
      };
    }

    // Poll provider for status update
    if (video.externalTaskId && video.provider) {
      try {
        const provider = getProvider(video.provider as ProviderType);
        const result = await provider.getTaskStatus(video.externalTaskId);

        if (result.status === 'completed' && result.videoUrl) {
          const updated = await this.tryCompleteGeneration(video.uuid, result);
          return {
            status: updated.status,
            videoUrl: updated.videoUrl || undefined,
          };
        }

        if (result.status === 'failed') {
          const updated = await this.tryFailGeneration(
            video.uuid,
            result.error?.message
          );
          return {
            status: updated.status,
            error: updated.errorMessage || undefined,
          };
        }
      } catch (error) {
        console.error('Failed to refresh status from provider:', error);
      }
    }

    return { status: video.status };
  }

  /**
   * Try to complete generation (transaction + optimistic lock)
   */
  private async tryCompleteGeneration(
    videoUuid: string,
    result: VideoTaskResponse
  ): Promise<{ status: string; videoUrl?: string | null }> {
    const db = await getDb();

    const [video] = await db
      .select()
      .from(videos)
      .where(eq(videos.uuid, videoUuid))
      .limit(1);

    if (!video) {
      throw new Error('Video not found');
    }

    if (video.status === VideoStatus.COMPLETED) {
      return { status: video.status, videoUrl: video.videoUrl };
    }
    if (video.status === VideoStatus.FAILED) {
      return { status: video.status, videoUrl: null };
    }

    if (
      video.status !== VideoStatus.GENERATING &&
      video.status !== VideoStatus.UPLOADING
    ) {
      return { status: video.status, videoUrl: video.videoUrl };
    }

    // Mark as uploading
    await db
      .update(videos)
      .set({
        status: VideoStatus.UPLOADING,
        originalVideoUrl: result.videoUrl,
        updatedAt: new Date(),
      })
      .where(eq(videos.uuid, videoUuid));

    // Download and upload to storage
    const storage = getStorage();
    const key = `videos/${videoUuid}/${Date.now()}.mp4`;
    const uploaded = await storage.downloadAndUpload({
      sourceUrl: result.videoUrl!,
      key,
      contentType: 'video/mp4',
    });

    // Settle credits
    await settleCredits(videoUuid);

    // Mark as completed
    await db
      .update(videos)
      .set({
        status: VideoStatus.COMPLETED,
        videoUrl: uploaded.url,
        thumbnailUrl: result.thumbnailUrl || null,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(videos.uuid, videoUuid));

    return { status: VideoStatus.COMPLETED, videoUrl: uploaded.url };
  }

  /**
   * Try to mark as failed (transaction + optimistic lock)
   */
  private async tryFailGeneration(
    videoUuid: string,
    errorMessage?: string
  ): Promise<{ status: string; errorMessage?: string | null }> {
    const db = await getDb();

    const [video] = await db
      .select()
      .from(videos)
      .where(eq(videos.uuid, videoUuid))
      .limit(1);

    if (!video) {
      throw new Error('Video not found');
    }

    if (
      video.status === VideoStatus.COMPLETED ||
      video.status === VideoStatus.FAILED
    ) {
      return { status: video.status, errorMessage: video.errorMessage };
    }

    // Release credits
    await releaseCredits(videoUuid);

    // Mark as failed
    await db
      .update(videos)
      .set({
        status: VideoStatus.FAILED,
        errorMessage: errorMessage || 'Generation failed',
        updatedAt: new Date(),
      })
      .where(eq(videos.uuid, videoUuid));

    return {
      status: VideoStatus.FAILED,
      errorMessage: errorMessage || 'Generation failed',
    };
  }

  /**
   * Get video details
   */
  async getVideo(uuid: string, userId: string): Promise<Video | null> {
    const db = await getDb();
    const [video] = await db
      .select()
      .from(videos)
      .where(
        and(
          eq(videos.uuid, uuid),
          eq(videos.userId, userId),
          eq(videos.isDeleted, false)
        )
      )
      .limit(1);
    return video ?? null;
  }

  /**
   * Get user video list
   */
  async listVideos(
    userId: string,
    options?: {
      limit?: number;
      cursor?: string;
      status?: string;
      isFavorite?: boolean;
      search?: string;
    }
  ): Promise<{ videos: Video[]; nextCursor?: string }> {
    const db = await getDb();
    const limit = options?.limit || 20;

    const conditions = [eq(videos.userId, userId), eq(videos.isDeleted, false)];

    if (options?.status) {
      conditions.push(
        eq(
          videos.status,
          options.status as (typeof VideoStatus)[keyof typeof VideoStatus]
        )
      );
    }

    if (options?.isFavorite !== undefined) {
      conditions.push(eq(videos.isFavorite, options.isFavorite));
    }

    if (options?.search) {
      conditions.push(ilike(videos.prompt, `%${options.search}%`));
    }

    if (options?.cursor) {
      const [cursorVideo] = await db
        .select({ createdAt: videos.createdAt })
        .from(videos)
        .where(eq(videos.uuid, options.cursor))
        .limit(1);

      if (cursorVideo) {
        conditions.push(lt(videos.createdAt, cursorVideo.createdAt));
      }
    }

    const list = await db
      .select()
      .from(videos)
      .where(and(...conditions))
      .orderBy(desc(videos.createdAt))
      .limit(limit + 1);

    const hasMore = list.length > limit;
    if (hasMore) list.pop();

    return {
      videos: list,
      nextCursor: hasMore ? list[list.length - 1]?.uuid : undefined,
    };
  }

  /**
   * Delete video (soft delete)
   */
  async deleteVideo(uuid: string, userId: string): Promise<void> {
    const db = await getDb();
    await db
      .update(videos)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(and(eq(videos.uuid, uuid), eq(videos.userId, userId)));
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(uuid: string, userId: string): Promise<boolean> {
    const db = await getDb();
    const [video] = await db
      .select({ isFavorite: videos.isFavorite })
      .from(videos)
      .where(
        and(
          eq(videos.uuid, uuid),
          eq(videos.userId, userId),
          eq(videos.isDeleted, false)
        )
      )
      .limit(1);

    if (!video) {
      throw new Error('Video not found');
    }

    const newValue = !video.isFavorite;
    await db
      .update(videos)
      .set({ isFavorite: newValue, updatedAt: new Date() })
      .where(and(eq(videos.uuid, uuid), eq(videos.userId, userId)));

    return newValue;
  }

  /**
   * Batch delete videos
   */
  async batchDelete(uuids: string[], userId: string): Promise<number> {
    if (uuids.length === 0) return 0;

    const db = await getDb();
    const result = await db
      .update(videos)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(
        and(
          inArray(videos.uuid, uuids),
          eq(videos.userId, userId),
          eq(videos.isDeleted, false)
        )
      )
      .returning({ uuid: videos.uuid });

    return result.length;
  }

  /**
   * Batch toggle favorite
   */
  async batchFavorite(
    uuids: string[],
    userId: string,
    isFavorite: boolean
  ): Promise<number> {
    if (uuids.length === 0) return 0;

    const db = await getDb();
    const result = await db
      .update(videos)
      .set({ isFavorite, updatedAt: new Date() })
      .where(
        and(
          inArray(videos.uuid, uuids),
          eq(videos.userId, userId),
          eq(videos.isDeleted, false)
        )
      )
      .returning({ uuid: videos.uuid });

    return result.length;
  }
}

// Export singleton instance
export const videoService = new VideoService();
