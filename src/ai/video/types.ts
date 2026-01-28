/**
 * AI Video Provider Types
 * Unified abstraction for multiple AI video generation providers
 */

// Unified video generation parameters
export interface VideoGenerationParams {
  model: string;
  prompt: string;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3' | '3:4' | '21:9';
  duration?: number;
  quality?: 'standard' | 'high' | '480P' | '720P' | '1080P';
  imageUrl?: string;
  removeWatermark?: boolean;
  callbackUrl?: string;
}

// Unified task response
export interface VideoTaskResponse {
  taskId: string;
  provider: 'evolink' | 'kie';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  estimatedTime?: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  error?: {
    code: string;
    message: string;
  };
  raw?: unknown;
}

// Provider interface
export interface AIVideoProvider {
  name: string;
  supportImageToVideo: boolean;
  createTask(params: VideoGenerationParams): Promise<VideoTaskResponse>;
  getTaskStatus(taskId: string): Promise<VideoTaskResponse>;
  parseCallback(payload: unknown): VideoTaskResponse;
}

// Provider types
export type ProviderType = 'evolink' | 'kie';
