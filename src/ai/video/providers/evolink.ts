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
        model: 'sora-2',
        prompt: params.prompt,
        aspect_ratio: params.aspectRatio || '16:9',
        duration: params.duration || 10,
        image_urls: params.imageUrl ? [params.imageUrl] : undefined,
        remove_watermark: params.removeWatermark ?? true,
        callback_url: params.callbackUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      taskId: data.id,
      provider: 'evolink',
      status: this.mapStatus(data.status),
      progress: data.progress,
      estimatedTime: data.task_info?.estimated_time,
      raw: data,
    };
  }

  async getTaskStatus(taskId: string): Promise<VideoTaskResponse> {
    const response = await fetch(
      `${this.baseUrl}/videos/generations/${taskId}`,
      {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      }
    );

    if (!response.ok) throw new Error('Failed to get task status');

    const data = await response.json();

    return {
      taskId: data.id,
      provider: 'evolink',
      status: this.mapStatus(data.status),
      progress: data.progress,
      videoUrl: data.data?.video_url,
      thumbnailUrl: data.data?.thumbnail_url,
      error: data.error,
      raw: data,
    };
  }

  parseCallback(payload: unknown): VideoTaskResponse {
    const data = payload as Record<string, unknown>;
    const innerData = data.data as Record<string, unknown> | undefined;

    return {
      taskId: data.id as string,
      provider: 'evolink',
      status: this.mapStatus(data.status as string),
      progress: data.progress as number | undefined,
      videoUrl: innerData?.video_url as string | undefined,
      thumbnailUrl: innerData?.thumbnail_url as string | undefined,
      error: data.error as { code: string; message: string } | undefined,
      raw: payload,
    };
  }

  private mapStatus(status: string): VideoTaskResponse['status'] {
    const map: Record<string, VideoTaskResponse['status']> = {
      pending: 'pending',
      processing: 'processing',
      completed: 'completed',
      failed: 'failed',
      cancelled: 'failed',
    };
    return map[status] || 'pending';
  }
}
