/**
 * Image Generation Service
 * Handles the complete image generation lifecycle including:
 * - Task creation and database persistence
 * - AI provider integration
 * - Status polling
 * - Image storage
 * - User management (favorites, tags, deletion)
 */

import { autoSubmitToGallery } from '@/actions/gallery/submit-to-gallery';
import {
  type ImageGenerationParams,
  type ImageTaskResponse,
  getEvolinkImageProvider,
} from '@/ai/image/providers/evolink';
import { generateSignedImageCallbackUrl } from '@/ai/image/utils/callback-signature';
import { type Image, ImageStatus, getDb, images, user } from '@/db';
import { getStorage } from '@/storage';
import { and, desc, eq, ilike, inArray, lt, or, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// ============================================================================
// Types
// ============================================================================

export interface GenerateImageParams {
  userId: string;
  prompt: string;
  model: string;
  aspectRatio?: string;
  quality?: string;
  numberOfImages?: number;
  size?: string;
  imageUrls?: string[];
  isPublic?: boolean;
}

export interface ImageGenerationResult {
  imageUuid: string;
  taskId: string;
  provider: string;
  status: string;
  progress?: number;
  creditsUsed: number;
}

export interface ListImagesOptions {
  limit?: number;
  page?: number;
  status?: string;
  model?: string;
  isFavorite?: boolean;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ListImagesResult {
  images: Image[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BatchOperationResult {
  success: boolean;
  affected: number;
  errors?: string[];
}

// ============================================================================
// Image Service Class
// ============================================================================

export class ImageService {
  private callbackBaseUrl: string;

  constructor() {
    this.callbackBaseUrl = process.env.AI_IMAGE_CALLBACK_URL || '';
  }

  /**
   * Create image generation task
   */
  async generate(params: GenerateImageParams): Promise<ImageGenerationResult> {
    const db = await getDb();
    const imageUuid = `img_${nanoid(21)}`;
    const startTime = Date.now();

    // Create image record
    const [imageResult] = await db
      .insert(images)
      .values({
        uuid: imageUuid,
        userId: params.userId,
        prompt: params.prompt,
        model: params.model,
        provider: 'evolink',
        parameters: {
          aspectRatio: params.aspectRatio,
          quality: params.quality,
          numberOfImages: params.numberOfImages || 1,
          size: params.size,
        },
        status: ImageStatus.PENDING,
        creditsUsed: 0, // Will be updated when credits system is integrated
        isPublic: params.isPublic ?? true,
        updatedAt: new Date(),
      })
      .returning({ uuid: images.uuid, id: images.id });

    if (!imageResult) {
      throw new Error('Failed to create image record');
    }

    // Call AI provider
    const provider = getEvolinkImageProvider();

    // Generate callback URL if configured
    const callbackUrl = this.callbackBaseUrl
      ? generateSignedImageCallbackUrl(
          `${this.callbackBaseUrl}/evolink`,
          imageResult.uuid
        )
      : undefined;

    try {
      const providerParams: ImageGenerationParams = {
        model: params.model,
        prompt: params.prompt,
        size: params.size || params.aspectRatio,
        quality: params.quality,
        n: params.numberOfImages || 1,
        imageUrls: params.imageUrls,
        callbackUrl,
      };

      const result = await provider.createTask(providerParams);

      await db
        .update(images)
        .set({
          status: ImageStatus.GENERATING,
          externalTaskId: result.taskId,
          updatedAt: new Date(),
        })
        .where(eq(images.uuid, imageResult.uuid));

      return {
        imageUuid: imageResult.uuid,
        taskId: result.taskId,
        provider: 'evolink',
        status: 'GENERATING',
        progress: result.progress,
        creditsUsed: 0,
      };
    } catch (error) {
      await db
        .update(images)
        .set({
          status: ImageStatus.FAILED,
          errorMessage: String(error),
          updatedAt: new Date(),
          generationTime: Date.now() - startTime,
        })
        .where(eq(images.uuid, imageResult.uuid));
      throw error;
    }
  }

  /**
   * Handle AI provider callback
   */
  async handleCallback(
    providerType: 'evolink',
    payload: unknown,
    imageUuid: string
  ): Promise<void> {
    const db = await getDb();
    const provider = getEvolinkImageProvider();
    const result = provider.parseCallback(payload);

    const [image] = await db
      .select()
      .from(images)
      .where(eq(images.uuid, imageUuid))
      .limit(1);

    if (!image) {
      console.error(`Image not found: ${imageUuid}`);
      return;
    }

    // Verify task ID matches (if we have one stored)
    if (image.externalTaskId && image.externalTaskId !== result.taskId) {
      console.error(
        `Task ID mismatch: expected ${image.externalTaskId}, got ${result.taskId}`
      );
      return;
    }

    // Process based on status
    if (result.status === 'completed' && result.imageUrls?.length) {
      await this.tryCompleteGeneration(image.uuid, result, image.createdAt);
    } else if (result.status === 'failed') {
      await this.tryFailGeneration(
        image.uuid,
        result.error?.message,
        image.createdAt
      );
    }
  }

  /**
   * Get task status and update database (for frontend polling)
   */
  async refreshStatus(
    imageUuid: string,
    userId: string
  ): Promise<{
    status: string;
    imageUrls?: string[];
    progress?: number;
    error?: string;
  }> {
    const db = await getDb();
    const [image] = await db
      .select()
      .from(images)
      .where(and(eq(images.uuid, imageUuid), eq(images.userId, userId)))
      .limit(1);

    if (!image) {
      throw new Error('Image not found');
    }

    // If already completed or failed, return current state
    if (
      image.status === ImageStatus.COMPLETED ||
      image.status === ImageStatus.FAILED
    ) {
      return {
        status: image.status,
        imageUrls: (image.imageUrls as string[]) || undefined,
        error: image.errorMessage || undefined,
      };
    }

    // Poll provider for status update
    if (image.externalTaskId) {
      try {
        const provider = getEvolinkImageProvider();
        const result = await provider.getTaskStatus(image.externalTaskId);

        if (result.status === 'completed' && result.imageUrls?.length) {
          const updated = await this.tryCompleteGeneration(
            image.uuid,
            result,
            image.createdAt
          );
          return {
            status: updated.status,
            imageUrls: updated.imageUrls || undefined,
          };
        }

        if (result.status === 'failed') {
          const updated = await this.tryFailGeneration(
            image.uuid,
            result.error?.message,
            image.createdAt
          );
          return {
            status: updated.status,
            error: updated.errorMessage || undefined,
          };
        }

        return {
          status: image.status,
          progress: result.progress,
        };
      } catch (error) {
        console.error('Failed to refresh status from provider:', error);
      }
    }

    return { status: image.status };
  }

  /**
   * Try to complete generation (with optimistic lock)
   */
  private async tryCompleteGeneration(
    imageUuid: string,
    result: ImageTaskResponse,
    createdAt: Date
  ): Promise<{ status: string; imageUrls?: string[] }> {
    const db = await getDb();

    const [image] = await db
      .select()
      .from(images)
      .where(eq(images.uuid, imageUuid))
      .limit(1);

    if (!image) {
      throw new Error('Image not found');
    }

    if (image.status === ImageStatus.COMPLETED) {
      return { status: image.status, imageUrls: image.imageUrls as string[] };
    }
    if (image.status === ImageStatus.FAILED) {
      return { status: image.status };
    }

    if (image.status !== ImageStatus.GENERATING) {
      return { status: image.status, imageUrls: image.imageUrls as string[] };
    }

    // Download and upload images to our storage
    const storage = getStorage();
    const uploadedUrls: string[] = [];

    for (let i = 0; i < (result.imageUrls?.length || 0); i++) {
      const sourceUrl = result.imageUrls![i];
      const ext = this.getExtensionFromUrl(sourceUrl);
      const key = `images/${imageUuid}/${i}.${ext}`;

      try {
        const uploaded = await storage.downloadAndUpload({
          sourceUrl,
          key,
          contentType: this.getContentType(ext),
        });
        uploadedUrls.push(uploaded.url);
      } catch (error) {
        console.error(`Failed to upload image ${i}:`, error);
        // Fallback to original URL
        uploadedUrls.push(sourceUrl);
      }
    }

    const generationTime = Date.now() - createdAt.getTime();

    // Mark as completed
    await db
      .update(images)
      .set({
        status: ImageStatus.COMPLETED,
        imageUrls: uploadedUrls,
        thumbnailUrl: uploadedUrls[0] || null,
        completedAt: new Date(),
        updatedAt: new Date(),
        generationTime,
      })
      .where(eq(images.uuid, imageUuid));

    // Auto-submit to gallery if isPublic is true
    if (image.isPublic) {
      try {
        // Get user info for gallery submission
        const [userInfo] = await db
          .select({ name: user.name, image: user.image })
          .from(user)
          .where(eq(user.id, image.userId))
          .limit(1);

        if (userInfo) {
          await autoSubmitToGallery({
            mediaType: 'image',
            mediaId: image.id,
            userId: image.userId,
            userName: userInfo.name,
            userAvatar: userInfo.image,
          });
        }
      } catch (error) {
        // Log but don't fail the completion
        console.error('Failed to auto-submit image to gallery:', error);
      }
    }

    return { status: ImageStatus.COMPLETED, imageUrls: uploadedUrls };
  }

  /**
   * Try to mark as failed (with optimistic lock)
   */
  private async tryFailGeneration(
    imageUuid: string,
    errorMessage?: string,
    createdAt?: Date
  ): Promise<{ status: string; errorMessage?: string | null }> {
    const db = await getDb();

    const [image] = await db
      .select()
      .from(images)
      .where(eq(images.uuid, imageUuid))
      .limit(1);

    if (!image) {
      throw new Error('Image not found');
    }

    if (
      image.status === ImageStatus.COMPLETED ||
      image.status === ImageStatus.FAILED
    ) {
      return { status: image.status, errorMessage: image.errorMessage };
    }

    const generationTime = createdAt
      ? Date.now() - createdAt.getTime()
      : undefined;

    // Mark as failed
    await db
      .update(images)
      .set({
        status: ImageStatus.FAILED,
        errorMessage: errorMessage || 'Generation failed',
        updatedAt: new Date(),
        generationTime,
      })
      .where(eq(images.uuid, imageUuid));

    return {
      status: ImageStatus.FAILED,
      errorMessage: errorMessage || 'Generation failed',
    };
  }

  /**
   * Get image details
   */
  async getImage(uuid: string, userId: string): Promise<Image | null> {
    const db = await getDb();
    const [image] = await db
      .select()
      .from(images)
      .where(
        and(
          eq(images.uuid, uuid),
          eq(images.userId, userId),
          eq(images.isDeleted, false)
        )
      )
      .limit(1);
    return image ?? null;
  }

  /**
   * Get user image list with pagination and filters
   */
  async listImages(
    userId: string,
    options?: ListImagesOptions
  ): Promise<ListImagesResult> {
    const db = await getDb();
    const limit = options?.limit || 20;
    const page = options?.page || 1;
    const offset = (page - 1) * limit;

    const conditions = [eq(images.userId, userId), eq(images.isDeleted, false)];

    if (options?.status) {
      conditions.push(
        eq(
          images.status,
          options.status as (typeof ImageStatus)[keyof typeof ImageStatus]
        )
      );
    }

    if (options?.model) {
      conditions.push(eq(images.model, options.model));
    }

    if (options?.isFavorite !== undefined) {
      conditions.push(eq(images.isFavorite, options.isFavorite));
    }

    if (options?.search) {
      conditions.push(ilike(images.prompt, `%${options.search}%`));
    }

    if (options?.startDate) {
      conditions.push(sql`${images.createdAt} >= ${options.startDate}`);
    }

    if (options?.endDate) {
      conditions.push(sql`${images.createdAt} <= ${options.endDate}`);
    }

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(images)
      .where(and(...conditions));

    const total = Number(countResult?.count || 0);

    // Get images
    const list = await db
      .select()
      .from(images)
      .where(and(...conditions))
      .orderBy(desc(images.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      images: list,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Delete image (soft delete)
   */
  async deleteImage(uuid: string, userId: string): Promise<boolean> {
    const db = await getDb();
    const result = await db
      .update(images)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(and(eq(images.uuid, uuid), eq(images.userId, userId)))
      .returning({ uuid: images.uuid });

    return result.length > 0;
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(uuid: string, userId: string): Promise<boolean> {
    const db = await getDb();

    const [image] = await db
      .select({ isFavorite: images.isFavorite })
      .from(images)
      .where(
        and(
          eq(images.uuid, uuid),
          eq(images.userId, userId),
          eq(images.isDeleted, false)
        )
      )
      .limit(1);

    if (!image) {
      throw new Error('Image not found');
    }

    const newFavoriteStatus = !image.isFavorite;

    await db
      .update(images)
      .set({ isFavorite: newFavoriteStatus, updatedAt: new Date() })
      .where(and(eq(images.uuid, uuid), eq(images.userId, userId)));

    return newFavoriteStatus;
  }

  /**
   * Update tags
   */
  async updateTags(
    uuid: string,
    userId: string,
    tags: string[]
  ): Promise<string[]> {
    const db = await getDb();

    const result = await db
      .update(images)
      .set({ tags, updatedAt: new Date() })
      .where(
        and(
          eq(images.uuid, uuid),
          eq(images.userId, userId),
          eq(images.isDeleted, false)
        )
      )
      .returning({ tags: images.tags });

    if (result.length === 0) {
      throw new Error('Image not found');
    }

    return (result[0].tags as string[]) || [];
  }

  /**
   * Batch delete images
   */
  async batchDelete(
    uuids: string[],
    userId: string
  ): Promise<BatchOperationResult> {
    const db = await getDb();

    const result = await db
      .update(images)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(and(inArray(images.uuid, uuids), eq(images.userId, userId)))
      .returning({ uuid: images.uuid });

    return {
      success: true,
      affected: result.length,
    };
  }

  /**
   * Batch toggle favorite
   */
  async batchFavorite(
    uuids: string[],
    userId: string,
    isFavorite: boolean
  ): Promise<BatchOperationResult> {
    const db = await getDb();

    const result = await db
      .update(images)
      .set({ isFavorite, updatedAt: new Date() })
      .where(
        and(
          inArray(images.uuid, uuids),
          eq(images.userId, userId),
          eq(images.isDeleted, false)
        )
      )
      .returning({ uuid: images.uuid });

    return {
      success: true,
      affected: result.length,
    };
  }

  // ============================================================================
  // Admin Methods
  // ============================================================================

  /**
   * Get all images (admin only)
   */
  async adminListImages(options?: {
    limit?: number;
    page?: number;
    userId?: string;
    status?: string;
    model?: string;
    search?: string;
  }): Promise<ListImagesResult> {
    const db = await getDb();
    const limit = options?.limit || 20;
    const page = options?.page || 1;
    const offset = (page - 1) * limit;

    const conditions = [eq(images.isDeleted, false)];

    if (options?.userId) {
      conditions.push(eq(images.userId, options.userId));
    }

    if (options?.status) {
      conditions.push(
        eq(
          images.status,
          options.status as (typeof ImageStatus)[keyof typeof ImageStatus]
        )
      );
    }

    if (options?.model) {
      conditions.push(eq(images.model, options.model));
    }

    if (options?.search) {
      conditions.push(ilike(images.prompt, `%${options.search}%`));
    }

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(images)
      .where(and(...conditions));

    const total = Number(countResult?.count || 0);

    // Get images
    const list = await db
      .select()
      .from(images)
      .where(and(...conditions))
      .orderBy(desc(images.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      images: list,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Admin delete image (hard delete option)
   */
  async adminDeleteImage(uuid: string, hardDelete = false): Promise<boolean> {
    const db = await getDb();

    if (hardDelete) {
      const result = await db
        .delete(images)
        .where(eq(images.uuid, uuid))
        .returning({ uuid: images.uuid });
      return result.length > 0;
    }

    const result = await db
      .update(images)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(eq(images.uuid, uuid))
      .returning({ uuid: images.uuid });

    return result.length > 0;
  }

  /**
   * Get image statistics (admin only)
   */
  async getStats(): Promise<{
    total: number;
    completed: number;
    failed: number;
    generating: number;
    byModel: Record<string, number>;
    todayCount: number;
  }> {
    const db = await getDb();

    // Total count
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(images)
      .where(eq(images.isDeleted, false));

    // Status counts
    const statusCounts = await db
      .select({
        status: images.status,
        count: sql<number>`count(*)`,
      })
      .from(images)
      .where(eq(images.isDeleted, false))
      .groupBy(images.status);

    // Model counts
    const modelCounts = await db
      .select({
        model: images.model,
        count: sql<number>`count(*)`,
      })
      .from(images)
      .where(eq(images.isDeleted, false))
      .groupBy(images.model);

    // Today's count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [todayResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(images)
      .where(
        and(eq(images.isDeleted, false), sql`${images.createdAt} >= ${today}`)
      );

    const statusMap: Record<string, number> = {};
    for (const row of statusCounts) {
      statusMap[row.status] = Number(row.count);
    }

    const byModel: Record<string, number> = {};
    for (const row of modelCounts) {
      byModel[row.model] = Number(row.count);
    }

    return {
      total: Number(totalResult?.count || 0),
      completed: statusMap[ImageStatus.COMPLETED] || 0,
      failed: statusMap[ImageStatus.FAILED] || 0,
      generating:
        (statusMap[ImageStatus.GENERATING] || 0) +
        (statusMap[ImageStatus.PENDING] || 0),
      byModel,
      todayCount: Number(todayResult?.count || 0),
    };
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private getExtensionFromUrl(url: string): string {
    try {
      const pathname = new URL(url).pathname;
      const ext = pathname.split('.').pop()?.toLowerCase();
      if (ext && ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
        return ext;
      }
    } catch {
      // ignore
    }
    return 'png';
  }

  private getContentType(ext: string): string {
    const types: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
    };
    return types[ext] || 'image/png';
  }
}

// Export singleton instance
export const imageService = new ImageService();
