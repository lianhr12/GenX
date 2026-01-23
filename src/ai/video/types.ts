/**
 * AI Video Provider Types
 * Unified abstraction for multiple AI video generation providers
 */

// Unified video generation parameters
export interface VideoGenerationParams {
  prompt: string;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  duration?: number;
  quality?: 'standard' | 'high';
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
