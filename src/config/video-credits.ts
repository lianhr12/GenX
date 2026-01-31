/**
 * Video Generation Credits Configuration
 * Defines AI models, pricing, and credit calculation rules
 */

import type { ProviderType } from '@/ai/video/types';

// ============================================================================
// Types
// ============================================================================

export interface ModelConfig {
  id: string;
  name: string;
  provider: ProviderType;
  description: string;
  supportImageToVideo: boolean;
  supportFirstLastFrame?: boolean; // FLF mode support
  maxDuration: number;
  durations: number[];
  aspectRatios: string[];
  qualities?: string[];
  cameraMotions?: string[]; // Hailuo series specific
  imageRequirements?: {
    exactDimensions?: boolean; // Image must match exact pixel dimensions
    dimensions?: Record<string, { width: number; height: number }>; // aspect_ratio -> dimensions
    noRealPerson?: boolean; // Real person images not supported
  };
  creditCost: {
    base: number;
    perExtraSecond?: number;
    highQualityMultiplier?: number;
  };
}

// ============================================================================
// Model Configurations
// ============================================================================

export const VIDEO_MODELS: Record<string, ModelConfig> = {
  // ============================================================================
  // Sora Series (OpenAI)
  // ============================================================================
  'sora-2-preview': {
    id: 'sora-2-preview',
    name: 'Sora 2 Preview',
    provider: 'evolink',
    description: 'OpenAI Sora 2 Preview - Fast and affordable video generation',
    supportImageToVideo: true,
    maxDuration: 12,
    durations: [4, 8, 12],
    aspectRatios: ['16:9', '9:16'],
    imageRequirements: {
      exactDimensions: true,
      dimensions: {
        '16:9': { width: 1280, height: 720 },
        '9:16': { width: 720, height: 1280 },
        '1280x720': { width: 1280, height: 720 },
        '720x1280': { width: 720, height: 1280 },
      },
      noRealPerson: true,
    },
    creditCost: {
      base: 5,
      perExtraSecond: 0.5,
    },
  },
  'sora-2-pro': {
    id: 'sora-2-pro',
    name: 'Sora 2 Pro',
    provider: 'evolink',
    description:
      'OpenAI Sora 2 Pro - High quality video generation with strict content moderation',
    supportImageToVideo: true,
    maxDuration: 25,
    durations: [15, 25],
    aspectRatios: ['16:9', '9:16'],
    qualities: ['standard', 'high'],
    imageRequirements: {
      noRealPerson: true,
    },
    creditCost: {
      base: 35,
      perExtraSecond: 3,
    },
  },

  // ============================================================================
  // Veo Series (Google)
  // ============================================================================
  'veo3.1-fast': {
    id: 'veo3.1-fast',
    name: 'Veo 3.1 Fast',
    provider: 'evolink',
    description: 'Google Veo 3.1 Fast - Quick cinematic quality generation',
    supportImageToVideo: true,
    supportFirstLastFrame: true,
    maxDuration: 8,
    durations: [8],
    aspectRatios: ['auto', '16:9', '9:16'],
    qualities: ['720p', '1080p', '4k'],
    creditCost: {
      base: 15,
      perExtraSecond: 2,
    },
  },
  'veo3.1-generate-preview': {
    id: 'veo3.1-generate-preview',
    name: 'Veo 3.1 Preview',
    provider: 'evolink',
    description: 'Google Veo 3.1 Preview - Multiple resolution support',
    supportImageToVideo: true,
    supportFirstLastFrame: true,
    maxDuration: 8,
    durations: [8],
    aspectRatios: ['auto', '16:9', '9:16'],
    qualities: ['720p', '1080p', '4k'],
    creditCost: {
      base: 18,
      perExtraSecond: 2.5,
    },
  },
  'veo3.1-pro': {
    id: 'veo3.1-pro',
    name: 'Veo 3.1 Pro',
    provider: 'evolink',
    description: 'Google Veo 3.1 Pro - Professional version with FLF support',
    supportImageToVideo: true,
    supportFirstLastFrame: true,
    maxDuration: 8,
    durations: [8],
    aspectRatios: ['auto', '16:9', '9:16'],
    qualities: ['720p', '1080p', '4k'],
    creditCost: {
      base: 25,
      perExtraSecond: 3,
    },
  },

  // ============================================================================
  // Wan Series (Alibaba)
  // ============================================================================
  'wan2.5-text-to-video': {
    id: 'wan2.5-text-to-video',
    name: 'Wan 2.5 T2V',
    provider: 'evolink',
    description: 'Alibaba Wan 2.5 - Text to video generation',
    supportImageToVideo: false,
    maxDuration: 10,
    durations: [5, 10],
    aspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
    qualities: ['480p', '720p', '1080p'],
    creditCost: {
      base: 40,
      perExtraSecond: 4,
    },
  },
  'wan2.5-image-to-video': {
    id: 'wan2.5-image-to-video',
    name: 'Wan 2.5 I2V',
    provider: 'evolink',
    description: 'Alibaba Wan 2.5 - First frame image to video',
    supportImageToVideo: true,
    maxDuration: 10,
    durations: [5, 10],
    aspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
    qualities: ['480p', '720p', '1080p'],
    creditCost: {
      base: 45,
      perExtraSecond: 4.5,
    },
  },
  'wan2.6-text-to-video': {
    id: 'wan2.6-text-to-video',
    name: 'Wan 2.6 T2V',
    provider: 'evolink',
    description: 'Alibaba Wan 2.6 - Text to video generation',
    supportImageToVideo: false,
    maxDuration: 15,
    durations: [5, 10, 15],
    aspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
    qualities: ['720p', '1080p'],
    creditCost: {
      base: 55,
      perExtraSecond: 5,
    },
  },
  'wan2.6-image-to-video': {
    id: 'wan2.6-image-to-video',
    name: 'Wan 2.6 I2V',
    provider: 'evolink',
    description: 'Alibaba Wan 2.6 - First frame image to video',
    supportImageToVideo: true,
    maxDuration: 15,
    durations: [5, 10, 15],
    aspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
    qualities: ['720p', '1080p'],
    creditCost: {
      base: 60,
      perExtraSecond: 5.5,
    },
  },

  // ============================================================================
  // Seedance Series (ByteDance)
  // ============================================================================
  'doubao-seedance-1.0-pro-fast': {
    id: 'doubao-seedance-1.0-pro-fast',
    name: 'Seedance 1.0 Pro Fast',
    provider: 'evolink',
    description: 'ByteDance Seedance 1.0 - Fast generation with 2-12s duration',
    supportImageToVideo: true,
    maxDuration: 12,
    durations: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    aspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9'],
    qualities: ['480p', '720p', '1080p'],
    creditCost: {
      base: 15,
      perExtraSecond: 1.5,
      highQualityMultiplier: 1.5,
    },
  },
  'seedance-1.5-pro': {
    id: 'seedance-1.5-pro',
    name: 'Seedance 1.5 Pro',
    provider: 'evolink',
    description: 'ByteDance Seedance 1.5 Pro - T2V + I2V + FLF support',
    supportImageToVideo: true,
    supportFirstLastFrame: true,
    maxDuration: 12,
    durations: [4, 5, 6, 7, 8, 9, 10, 11, 12],
    aspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9', 'adaptive'],
    qualities: ['480p', '720p', '1080p'],
    creditCost: {
      base: 20,
      perExtraSecond: 2,
      highQualityMultiplier: 1.8,
    },
  },

  // ============================================================================
  // Hailuo Series (MiniMax)
  // ============================================================================
  'MiniMax-Hailuo-02': {
    id: 'MiniMax-Hailuo-02',
    name: 'Hailuo 02',
    provider: 'evolink',
    description:
      'MiniMax Hailuo 02 - Full featured with 15 camera motion instructions',
    supportImageToVideo: true,
    supportFirstLastFrame: true,
    maxDuration: 10,
    durations: [6, 10],
    aspectRatios: ['16:9', '9:16', '1:1'],
    qualities: ['512p', '768p', '1080P'],
    cameraMotions: [
      'Truck left',
      'Truck right',
      'Pan left',
      'Pan right',
      'Push in',
      'Pull out',
      'Pedestal up',
      'Pedestal down',
      'Tilt up',
      'Tilt down',
      'Zoom in',
      'Zoom out',
      'Shake',
      'Tracking shot',
      'Static shot',
    ],
    creditCost: {
      base: 25,
      perExtraSecond: 2.5,
      highQualityMultiplier: 1.6,
    },
  },
  'MiniMax-Hailuo-2.3': {
    id: 'MiniMax-Hailuo-2.3',
    name: 'Hailuo 2.3',
    provider: 'evolink',
    description:
      'MiniMax Hailuo 2.3 - SOTA instruction following with high quality output',
    supportImageToVideo: true,
    maxDuration: 10,
    durations: [6, 10],
    aspectRatios: ['16:9', '9:16', '1:1'],
    qualities: ['768p', '1080P'],
    cameraMotions: [
      'Truck left',
      'Truck right',
      'Pan left',
      'Pan right',
      'Push in',
      'Pull out',
      'Pedestal up',
      'Pedestal down',
      'Tilt up',
      'Tilt down',
      'Zoom in',
      'Zoom out',
      'Shake',
      'Tracking shot',
      'Static shot',
    ],
    creditCost: {
      base: 30,
      perExtraSecond: 3,
      highQualityMultiplier: 1.5,
    },
  },
  'MiniMax-Hailuo-2.3-Fast': {
    id: 'MiniMax-Hailuo-2.3-Fast',
    name: 'Hailuo 2.3 Fast',
    provider: 'evolink',
    description:
      'MiniMax Hailuo 2.3 Fast - Fastest generation with extreme physics effects',
    supportImageToVideo: true,
    maxDuration: 10,
    durations: [6, 10],
    aspectRatios: ['16:9', '9:16', '1:1'],
    qualities: ['768p', '1080P'],
    creditCost: {
      base: 20,
      perExtraSecond: 2,
    },
  },

  // ============================================================================
  // Kling Series (Kuaishou)
  // ============================================================================
  'kling-2': {
    id: 'kling-2',
    name: 'Kling 2',
    provider: 'kie',
    description: 'Kuaishou Kling 2 - Text to video specialist',
    supportImageToVideo: false,
    maxDuration: 10,
    durations: [5, 10],
    aspectRatios: ['16:9', '9:16'],
    creditCost: {
      base: 45,
      perExtraSecond: 4,
    },
  },
  'kling-o1-image-to-video': {
    id: 'kling-o1-image-to-video',
    name: 'Kling O1 I2V',
    provider: 'evolink',
    description: 'Kuaishou Kling O1 - Specialized image to video generation',
    supportImageToVideo: true,
    maxDuration: 10,
    durations: [5, 10],
    aspectRatios: ['16:9', '9:16', '1:1'],
    creditCost: {
      base: 40,
      perExtraSecond: 4,
    },
  },
  'kling-o1-video-edit': {
    id: 'kling-o1-video-edit',
    name: 'Kling O1 Video Edit',
    provider: 'evolink',
    description: 'Kuaishou Kling O1 - Video editing capabilities',
    supportImageToVideo: false,
    maxDuration: 10,
    durations: [5, 10],
    aspectRatios: ['16:9', '9:16'],
    creditCost: {
      base: 50,
      perExtraSecond: 5,
    },
  },
  'kling-o1-video-edit-fast': {
    id: 'kling-o1-video-edit-fast',
    name: 'Kling O1 Video Edit Fast',
    provider: 'evolink',
    description: 'Kuaishou Kling O1 - Fast video editing',
    supportImageToVideo: false,
    maxDuration: 10,
    durations: [5, 10],
    aspectRatios: ['16:9', '9:16'],
    creditCost: {
      base: 35,
      perExtraSecond: 3.5,
    },
  },

  // ============================================================================
  // OmniHuman Series (Digital Human)
  // ============================================================================
  'omnihuman-1.5': {
    id: 'omnihuman-1.5',
    name: 'OmniHuman 1.5',
    provider: 'evolink',
    description: 'Audio-driven digital human video generation (max 35s audio)',
    supportImageToVideo: false,
    maxDuration: 35,
    durations: [10, 20, 30, 35],
    aspectRatios: ['16:9', '9:16', '1:1'],
    qualities: ['720P', '1080P'],
    creditCost: {
      base: 60,
      perExtraSecond: 2,
      highQualityMultiplier: 1.5,
    },
  },
};

// ============================================================================
// Credit Calculation
// ============================================================================

/**
 * Get model configuration by ID
 */
export function getModelConfig(modelId: string): ModelConfig | null {
  return VIDEO_MODELS[modelId] || null;
}

/**
 * Get all available models
 */
export function getAvailableModels(): ModelConfig[] {
  return Object.values(VIDEO_MODELS);
}

/**
 * Get models that support image-to-video
 */
export function getImageToVideoModels(): ModelConfig[] {
  return Object.values(VIDEO_MODELS).filter((m) => m.supportImageToVideo);
}

/**
 * Get models that support first-last-frame (FLF) mode
 */
export function getFirstLastFrameModels(): ModelConfig[] {
  return Object.values(VIDEO_MODELS).filter((m) => m.supportFirstLastFrame);
}

/**
 * Get models that support camera motion instructions
 */
export function getCameraMotionModels(): ModelConfig[] {
  return Object.values(VIDEO_MODELS).filter((m) => m.cameraMotions?.length);
}

/**
 * Calculate credits required for video generation
 */
export function calculateModelCredits(
  modelId: string,
  params: { duration: number; quality?: string }
): number {
  const config = getModelConfig(modelId);
  if (!config) return 0;

  const {
    base,
    perExtraSecond = 0,
    highQualityMultiplier = 1,
  } = config.creditCost;
  const baseDuration = 10; // Base duration for credit calculation
  const extraSeconds = Math.max(0, params.duration - baseDuration);

  let credits = base + extraSeconds * perExtraSecond;

  // Apply quality multiplier if applicable
  if (params.quality === 'high' || params.quality === '1080P') {
    credits = Math.round(credits * highQualityMultiplier);
  }

  return Math.round(credits);
}

// ============================================================================
// Credit System Configuration
// ============================================================================

export const CREDITS_CONFIG = {
  // New user gift credits
  registerGift: {
    enabled: true,
    amount: 15,
    expireDays: 30,
  },

  // Credit expiration settings
  expiration: {
    subscriptionDays: 30,
    purchaseDays: 365,
    warnBeforeDays: 7,
  },
};
