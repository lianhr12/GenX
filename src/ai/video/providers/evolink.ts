/**
 * Evolink AI Video Provider
 * Supports both text-to-video and image-to-video generation
 */

import type {
  AIVideoProvider,
  VideoGenerationParams,
  VideoTaskResponse,
} from '../types';

export class EvolinkProvider implements AIVideoProvider {
  name = 'evolink';
  supportImageToVideo = true;
  private apiKey: string;
  private baseUrl = 'https://api.evolink.ai/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createTask(params: VideoGenerationParams): Promise<VideoTaskResponse> {
    const response = await fetch(`${this.baseUrl}/videos/generations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: params.model,
        prompt: params.prompt,
        aspect_ratio: params.aspectRatio || '16:9',
        duration: params.duration || 10,
        ...(params.quality ? { quality: params.quality } : {}),
        image_urls: params.imageUrl ? [params.imageUrl] : undefined,
        remove_watermark: params.removeWatermark ?? true,
        callback_url: params.callbackUrl,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      this.logResponse('create-task-error', {
        status: response.status,
        body: errorBody,
      });
      const error = this.safeParseJson(errorBody);
      throw new Error(
        error?.message || errorBody || `API error: ${response.status}`
      );
    }

    const data = (await response.json()) as Record<string, unknown>;
    const taskId = this.extractTaskId(data);
    const status = this.extractStatus(data);

    if (!taskId) {
      throw new Error('Invalid Evolink response: missing task id');
    }

    return {
      taskId,
      provider: 'evolink',
      status: this.mapStatus(status || 'pending'),
      progress: this.extractProgress(data),
      estimatedTime: this.extractEstimatedTime(data),
      raw: data,
    };
  }

  async getTaskStatus(taskId: string): Promise<VideoTaskResponse> {
    const generationsUrl = `${this.baseUrl}/videos/generations/${taskId}`;
    const response = await fetch(generationsUrl, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      this.logResponse('status-error', {
        taskId,
        url: generationsUrl,
        status: response.status,
        body: errorBody,
      });
      if (
        this.shouldFallbackToTaskEndpoint(taskId, response.status, errorBody)
      ) {
        const fallbackUrl = `${this.baseUrl}/tasks/${taskId}`;
        const fallback = await fetch(fallbackUrl, {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        });
        if (!fallback.ok) {
          const fallbackBody = await fallback.text();
          this.logResponse('status-fallback-error', {
            taskId,
            url: fallbackUrl,
            status: fallback.status,
            body: fallbackBody,
          });
          throw new Error(
            `Failed to get task status (${fallback.status}): ${fallbackBody}`
          );
        }
        const data = (await fallback.json()) as Record<string, unknown>;
        return this.buildTaskStatusResponse(data, taskId, 'tasks');
      }

      throw new Error(
        `Failed to get task status (${response.status}): ${errorBody}`
      );
    }

    const data = (await response.json()) as Record<string, unknown>;
    return this.buildTaskStatusResponse(data, taskId, 'generations');
  }

  parseCallback(payload: unknown): VideoTaskResponse {
    const data = payload as Record<string, unknown>;
    const status = this.extractStatus(data);
    const progress = this.extractProgress(data);
    const { videoUrl, thumbnailUrl } = this.extractMedia(data);

    return {
      taskId: this.extractTaskId(data) || (data.id as string),
      provider: 'evolink',
      status: this.mapStatus(status || 'pending'),
      progress,
      videoUrl,
      thumbnailUrl,
      error: data.error as { code: string; message: string } | undefined,
      raw: payload,
    };
  }

  private extractTaskId(data: Record<string, unknown>): string | undefined {
    const inner = this.asRecord(data.data);
    return (
      this.coerceTaskId(data.task_id) ||
      this.coerceTaskId(data.taskId) ||
      this.coerceTaskId(inner?.task_id) ||
      this.coerceTaskId(inner?.taskId) ||
      this.coerceTaskId(data.id) ||
      this.coerceTaskId(inner?.id)
    );
  }

  private extractStatus(data: Record<string, unknown>): string | undefined {
    const inner = this.asRecord(data.data);
    return (
      (data.status as string | undefined) ||
      (inner?.status as string | undefined) ||
      (data.state as string | undefined) ||
      (inner?.state as string | undefined)
    );
  }

  private extractProgress(data: Record<string, unknown>): number | undefined {
    const inner = this.asRecord(data.data);
    return (
      (data.progress as number | undefined) ||
      (inner?.progress as number | undefined)
    );
  }

  private extractMedia(data: Record<string, unknown>): {
    videoUrl?: string;
    thumbnailUrl?: string;
  } {
    const inner = this.asRecord(data.data);
    const videoUrl =
      (inner?.video_url as string | undefined) ||
      (inner?.videoUrl as string | undefined) ||
      (data.video_url as string | undefined) ||
      (data.videoUrl as string | undefined);
    const thumbnailUrl =
      (inner?.thumbnail_url as string | undefined) ||
      (inner?.thumbnailUrl as string | undefined) ||
      (data.thumbnail_url as string | undefined) ||
      (data.thumbnailUrl as string | undefined);
    const results =
      (inner?.results as unknown[]) || (data.results as unknown[]);
    const resultItem = Array.isArray(results) ? results[0] : undefined;
    const resultRecord = this.asRecord(resultItem);
    const resultVideoUrl =
      (typeof resultItem === 'string' ? resultItem : undefined) ||
      (resultRecord?.url as string | undefined) ||
      (resultRecord?.video_url as string | undefined) ||
      (resultRecord?.videoUrl as string | undefined);
    const resultThumbnailUrl =
      (resultRecord?.thumbnail_url as string | undefined) ||
      (resultRecord?.thumbnailUrl as string | undefined);

    return {
      videoUrl: videoUrl || resultVideoUrl,
      thumbnailUrl: thumbnailUrl || resultThumbnailUrl,
    };
  }

  private extractEstimatedTime(
    data: Record<string, unknown>
  ): number | undefined {
    const taskInfo = this.asRecord(data.task_info);
    return taskInfo?.estimated_time as number | undefined;
  }

  private buildTaskStatusResponse(
    data: Record<string, unknown>,
    taskId: string,
    source: 'generations' | 'tasks'
  ): VideoTaskResponse {
    const status = this.extractStatus(data);
    const progress = this.extractProgress(data);
    const { videoUrl, thumbnailUrl } = this.extractMedia(data);
    const normalizedStatus = this.mapStatus(status || 'pending');

    if (!status) {
      this.logResponse('status-missing', { taskId, source, data });
    }

    if (normalizedStatus === 'completed' && !videoUrl) {
      this.logResponse('completed-missing-video', { taskId, source, data });
    }

    return {
      taskId: this.extractTaskId(data) || taskId,
      provider: 'evolink',
      status: normalizedStatus,
      progress,
      videoUrl,
      thumbnailUrl,
      error: data.error as { code: string; message: string } | undefined,
      raw: data,
    };
  }

  private shouldFallbackToTaskEndpoint(
    taskId: string,
    status: number,
    errorBody: string
  ): boolean {
    if (!taskId.startsWith('task-unified-')) return false;
    if (status !== 404) return false;
    return errorBody.includes('Invalid URL');
  }

  private asRecord(value: unknown): Record<string, unknown> | undefined {
    if (!value || typeof value !== 'object') return undefined;
    return value as Record<string, unknown>;
  }

  private coerceTaskId(value: unknown): string | undefined {
    if (typeof value === 'string' && value.length > 0) return value;
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
    return undefined;
  }

  private mapStatus(status: string): VideoTaskResponse['status'] {
    const normalized = status.toLowerCase();
    const map: Record<string, VideoTaskResponse['status']> = {
      pending: 'pending',
      queued: 'pending',
      waiting: 'pending',
      processing: 'processing',
      running: 'processing',
      completed: 'completed',
      success: 'completed',
      succeeded: 'completed',
      failed: 'failed',
      cancelled: 'failed',
    };
    return map[normalized] || 'pending';
  }

  private safeParseJson(text: string): { message?: string } | null {
    try {
      return JSON.parse(text) as { message?: string };
    } catch {
      return null;
    }
  }

  private logResponse(label: string, detail: Record<string, unknown>): void {
    console.warn(`[Evolink] ${label}`, detail);
  }
}
