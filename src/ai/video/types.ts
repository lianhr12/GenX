/**
 * AI Video Provider Types
 * Unified abstraction for multiple AI video generation providers
 */

// Camera motion instructions (Hailuo series specific)
export type CameraMotion =
  | 'Truck left'
  | 'Truck right'
  | 'Pan left'
  | 'Pan right'
  | 'Push in'
  | 'Pull out'
  | 'Pedestal up'
  | 'Pedestal down'
  | 'Tilt up'
  | 'Tilt down'
  | 'Zoom in'
  | 'Zoom out'
  | 'Shake'
  | 'Tracking shot'
  | 'Static shot';

// Model-specific parameters
export interface ModelParams {
  prompt_optimizer?: boolean;
  fast_pretreatment?: boolean;
}

// Unified video generation parameters
export interface VideoGenerationParams {
  model: string;
  prompt: string;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3' | '3:4' | '21:9';
  duration?: number;
  quality?: 'standard' | 'high' | '480P' | '720P' | '1080P' | '512p' | '768p';
  imageUrl?: string;
  imageUrls?: string[]; // For FLF mode (first-last-frame) - supports 2 images
  removeWatermark?: boolean;
  callbackUrl?: string;
  modelParams?: ModelParams;
  cameraMotion?: CameraMotion; // Hailuo series specific
  audioUrl?: string; // Custom audio URL for audio-driven generation
  generateAudio?: boolean; // Auto generate audio
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
