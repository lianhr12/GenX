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
  supportsAudioGeneration?: boolean; // Auto audio generation support
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
  // API成本: 4s=23.04, 8s=46.08, 12s=69.12 credits
  // 目标75%利润率: 售价 = 成本 × 4
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
      // 4s: 23.04 × 4 = 92, 8s: 46.08 × 4 = 184, 12s: 69.12 × 4 = 276
      base: 92,
      perExtraSecond: 23,
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
      // API成本: 15s=69, 25s=115 (HD更高)
      // 15s: 69 × 4 = 276, 25s: 115 × 4 = 460
      base: 276,
      perExtraSecond: 18,
    },
  },

  // ============================================================================
  // Veo Series (Google)
  // API成本: 720p/1080p无音频=5.76-11.52, 有音频=8.64-23.04, 4K无音频=17.28-23.04, 4K有音频=20.22-34.56
  // 目标75%利润率: 售价 = 成本 × 4
  // ============================================================================
  'veo3.1-fast': {
    id: 'veo3.1-fast',
    name: 'Veo 3.1 Fast',
    provider: 'evolink',
    description: 'Google Veo 3.1 Fast - Quick cinematic quality generation',
    supportImageToVideo: true,
    supportFirstLastFrame: true,
    supportsAudioGeneration: true,
    maxDuration: 8,
    durations: [8],
    aspectRatios: ['auto', '16:9', '9:16'],
    qualities: ['720p', '1080p', '4k'],
    creditCost: {
      // 720p/1080p无音频: 5.76 × 4 = 23, 有音频: 8.64 × 4 = 35
      // 4K无音频: 17.28 × 4 = 69, 4K有音频: 20.22 × 4 = 81
      base: 35,
      perExtraSecond: 4,
      highQualityMultiplier: 2.3, // 4K multiplier: 81/35 ≈ 2.3
    },
  },
  'veo3.1-generate-preview': {
    id: 'veo3.1-generate-preview',
    name: 'Veo 3.1 Preview',
    provider: 'evolink',
    description: 'Google Veo 3.1 Preview - Multiple resolution support',
    supportImageToVideo: true,
    supportFirstLastFrame: true,
    supportsAudioGeneration: true,
    maxDuration: 8,
    durations: [8],
    aspectRatios: ['auto', '16:9', '9:16'],
    qualities: ['720p', '1080p', '4k'],
    creditCost: {
      // 介于Fast和Pro之间
      base: 50,
      perExtraSecond: 5,
      highQualityMultiplier: 2.0,
    },
  },
  'veo3.1-pro': {
    id: 'veo3.1-pro',
    name: 'Veo 3.1 Pro',
    provider: 'evolink',
    description: 'Google Veo 3.1 Pro - Professional version with FLF support',
    supportImageToVideo: true,
    supportFirstLastFrame: true,
    supportsAudioGeneration: true,
    maxDuration: 8,
    durations: [8],
    aspectRatios: ['auto', '16:9', '9:16'],
    qualities: ['720p', '1080p', '4k'],
    creditCost: {
      // 720p/1080p无音频: 11.52 × 4 = 46, 有音频: 23.04 × 4 = 92
      // 4K无音频: 23.04 × 4 = 92, 4K有音频: 34.56 × 4 = 138
      base: 92,
      perExtraSecond: 10,
      highQualityMultiplier: 1.5, // 4K multiplier
    },
  },

  // ============================================================================
  // Wan Series (Alibaba)
  // API成本(按秒): 480p=2.55/s, 720p=5.1/s, 1080p=8.517/s
  // 5s: 480p=12.75, 720p=25.5, 1080p=42.585
  // 10s: 480p=25.5, 720p=51, 1080p=85.17
  // 目标75%利润率: 售价 = 成本 × 4
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
      // 480p 5s: 12.75 × 4 = 51, 10s: 25.5 × 4 = 102
      // 720p 5s: 25.5 × 4 = 102, 10s: 51 × 4 = 204
      // 1080p 5s: 42.585 × 4 = 170, 10s: 85.17 × 4 = 341
      base: 102, // 基于720p 5s
      perExtraSecond: 20,
      highQualityMultiplier: 1.7, // 1080p multiplier
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
      // I2V通常比T2V贵10%
      base: 112,
      perExtraSecond: 22,
      highQualityMultiplier: 1.7,
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
      // Wan 2.6比2.5贵约30%
      base: 133,
      perExtraSecond: 26,
      highQualityMultiplier: 1.7,
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
      base: 146,
      perExtraSecond: 29,
      highQualityMultiplier: 1.7,
    },
  },

  // ============================================================================
  // Seedance Series (ByteDance)
  // API成本(按秒): 1.0 Pro Fast: 480p=0.405/s, 720p=0.9/s, 1080p=1.98/s
  // 1.5 Pro: 480p=0.818/s, 720p=1.778/s, 1080p=3.966/s
  // 目标75%利润率: 售价 = 成本 × 4
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
      // 480p 10s: 4.05 × 4 = 16, 720p 10s: 9 × 4 = 36, 1080p 10s: 19.8 × 4 = 79
      base: 36, // 基于720p 10s
      perExtraSecond: 4,
      highQualityMultiplier: 2.2, // 1080p: 79/36 ≈ 2.2
    },
  },
  'seedance-1.5-pro': {
    id: 'seedance-1.5-pro',
    name: 'Seedance 1.5 Pro',
    provider: 'evolink',
    description: 'ByteDance Seedance 1.5 Pro - T2V + I2V + FLF support',
    supportImageToVideo: true,
    supportFirstLastFrame: true,
    supportsAudioGeneration: true,
    maxDuration: 12,
    durations: [4, 5, 6, 7, 8, 9, 10, 11, 12],
    aspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9', 'adaptive'],
    qualities: ['480p', '720p', '1080p'],
    creditCost: {
      // 480p 10s: 8.18 × 4 = 33, 720p 10s: 17.78 × 4 = 71, 1080p 10s: 39.66 × 4 = 159
      base: 71, // 基于720p 10s
      perExtraSecond: 7,
      highQualityMultiplier: 2.2, // 1080p: 159/71 ≈ 2.2
    },
  },

  // ============================================================================
  // Hailuo Series (MiniMax)
  // API成本: Hailuo 02: 768p 6s=12, 10s=18.84; 1080p 6s=22.32
  // Hailuo 2.3: 768p 6s=18, 10s=36; 1080p 6s=36
  // Hailuo 2.3 Fast: 768p 6s=12, 10s=18.84; 1080p 6s=22.32
  // 目标75%利润率: 售价 = 成本 × 4
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
      // 768p 6s: 12 × 4 = 48, 10s: 18.84 × 4 = 75
      // 1080p 6s: 22.32 × 4 = 89
      base: 48,
      perExtraSecond: 7,
      highQualityMultiplier: 1.9, // 1080p: 89/48 ≈ 1.9
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
      // 768p 6s: 18 × 4 = 72, 10s: 36 × 4 = 144
      // 1080p 6s: 36 × 4 = 144
      base: 72,
      perExtraSecond: 18,
      highQualityMultiplier: 2.0, // 1080p: 144/72 = 2.0
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
      // 768p 6s: 12 × 4 = 48, 10s: 18.84 × 4 = 75
      // 1080p 6s: 22.32 × 4 = 89
      base: 48,
      perExtraSecond: 7,
      highQualityMultiplier: 1.9,
    },
  },

  // ============================================================================
  // Kling Series (Kuaishou)
  // API成本: Kling 2 T2V: 5s=40, 10s=80
  // Kling O1 I2V: 5s=40, 10s=80
  // Kling O1 Video Edit: 5s=50, 10s=100
  // 目标75%利润率: 售价 = 成本 × 4
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
      // 5s: 40 × 4 = 160, 10s: 80 × 4 = 320
      base: 160,
      perExtraSecond: 32,
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
      // 5s: 40 × 4 = 160, 10s: 80 × 4 = 320
      base: 160,
      perExtraSecond: 32,
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
      // 5s: 50 × 4 = 200, 10s: 100 × 4 = 400
      base: 200,
      perExtraSecond: 40,
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
      // Fast版本约为标准版的70%
      base: 140,
      perExtraSecond: 28,
    },
  },

  // ============================================================================
  // OmniHuman Series (Digital Human)
  // API成本(按秒): 12 credits/秒
  // 10s: 120, 20s: 240, 30s: 360, 35s: 420
  // 目标75%利润率: 售价 = 成本 × 4
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
      // 10s: 120 × 4 = 480, 20s: 240 × 4 = 960, 30s: 360 × 4 = 1440
      base: 480,
      perExtraSecond: 48,
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
 * 基于75%利润率目标计算积分
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

  // 获取模型的最小时长作为基础时长
  const baseDuration = config.durations[0] || 5;
  const extraSeconds = Math.max(0, params.duration - baseDuration);

  let credits = base + extraSeconds * perExtraSecond;

  // Apply quality multiplier for high quality options
  // 支持多种高质量标识: 1080p, 1080P, 4k, 4K, high
  const highQualityOptions = ['1080p', '1080P', '4k', '4K', 'high'];
  if (params.quality && highQualityOptions.includes(params.quality)) {
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
