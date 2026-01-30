/**
 * Evolink AI Image Provider
 * Supports text-to-image generation using Evolink API
 */

export interface ImageGenerationParams {
  model: string;
  prompt: string;
  size?: string;
  quality?: string;
  n?: number;
  imageUrls?: string[];
  callbackUrl?: string;
}

export interface ImageTaskResponse {
  taskId: string;
  provider: 'evolink';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  imageUrls?: string[];
  error?: { code: string; message: string };
  raw?: unknown;
}

export class EvolinkImageProvider {
  name = 'evolink';
  private apiKey: string;
  private baseUrl = 'https://api.evolink.ai/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createTask(params: ImageGenerationParams): Promise<ImageTaskResponse> {
    const response = await fetch(`${this.baseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: params.model,
        prompt: params.prompt,
        size: params.size || '1024x1024',
        quality: params.quality || 'medium',
        n: params.n || 1,
        image_urls: params.imageUrls,
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
      raw: data,
    };
  }

  async getTaskStatus(taskId: string): Promise<ImageTaskResponse> {
    // Try generations endpoint first
    const generationsUrl = `${this.baseUrl}/images/generations/${taskId}`;
    let response = await fetch(generationsUrl, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });

    // Fallback to tasks endpoint if needed
    if (!response.ok && taskId.startsWith('task-unified-')) {
      const tasksUrl = `${this.baseUrl}/tasks/${taskId}`;
      response = await fetch(tasksUrl, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
    }

    if (!response.ok) {
      const errorBody = await response.text();
      this.logResponse('status-error', {
        taskId,
        status: response.status,
        body: errorBody,
      });
      throw new Error(
        `Failed to get task status (${response.status}): ${errorBody}`
      );
    }

    const data = (await response.json()) as Record<string, unknown>;
    return this.buildTaskStatusResponse(data, taskId);
  }

  /**
   * Parse callback payload from AI provider webhook
   */
  parseCallback(payload: unknown): ImageTaskResponse {
    const data = payload as Record<string, unknown>;
    const status = this.extractStatus(data);
    const progress = this.extractProgress(data);
    const imageUrls = this.extractImageUrls(data);

    return {
      taskId: this.extractTaskId(data) || (data.id as string),
      provider: 'evolink',
      status: this.mapStatus(status || 'pending'),
      progress,
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
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

  private extractImageUrls(data: Record<string, unknown>): string[] {
    const inner = this.asRecord(data.data);
    const urls: string[] = [];

    // Try to get from results array
    const results =
      (inner?.results as unknown[]) || (data.results as unknown[]);
    if (Array.isArray(results)) {
      for (const item of results) {
        if (typeof item === 'string') {
          urls.push(item);
        } else if (typeof item === 'object' && item !== null) {
          const record = item as Record<string, unknown>;
          const url =
            (record.url as string) ||
            (record.image_url as string) ||
            (record.imageUrl as string);
          if (url) urls.push(url);
        }
      }
    }

    // Try to get single image URL
    const singleUrl =
      (inner?.image_url as string) ||
      (inner?.imageUrl as string) ||
      (data.image_url as string) ||
      (data.imageUrl as string);
    if (singleUrl && urls.length === 0) {
      urls.push(singleUrl);
    }

    return urls;
  }

  private buildTaskStatusResponse(
    data: Record<string, unknown>,
    taskId: string
  ): ImageTaskResponse {
    const status = this.extractStatus(data);
    const progress = this.extractProgress(data);
    const imageUrls = this.extractImageUrls(data);
    const normalizedStatus = this.mapStatus(status || 'pending');

    return {
      taskId: this.extractTaskId(data) || taskId,
      provider: 'evolink',
      status: normalizedStatus,
      progress,
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      error: data.error as { code: string; message: string } | undefined,
      raw: data,
    };
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

  private mapStatus(status: string): ImageTaskResponse['status'] {
    const normalized = status.toLowerCase();
    const map: Record<string, ImageTaskResponse['status']> = {
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
    console.warn(`[Evolink Image] ${label}`, detail);
  }
}

// Export singleton factory
let instance: EvolinkImageProvider | null = null;

export function getEvolinkImageProvider(): EvolinkImageProvider {
  if (!instance) {
    const apiKey = process.env.EVOLINK_API_KEY;
    if (!apiKey) {
      throw new Error('EVOLINK_API_KEY environment variable is not set');
    }
    instance = new EvolinkImageProvider(apiKey);
  }
  return instance;
}
