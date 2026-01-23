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
  maxDuration: number;
  durations: number[];
  aspectRatios: string[];
  qualities?: string[];
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
  'sora-2': {
    id: 'sora-2',
    name: 'Sora 2',
    provider: 'evolink',
    description: 'OpenAI Sora 2 - High quality video generation',
    supportImageToVideo: true,
    maxDuration: 15,
    durations: [10, 15],
    aspectRatios: ['16:9', '9:16'],
    creditCost: {
      base: 7,
      perExtraSecond: 1,
    },
  },
  'wan-2-6': {
    id: 'wan-2-6',
    name: 'Wan 2.6',
    provider: 'evolink',
    description: 'Alibaba Wan 2.6 - Fast and efficient',
    supportImageToVideo: true,
    maxDuration: 15,
    durations: [5, 10, 15],
    aspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
    creditCost: {
      base: 5,
      perExtraSecond: 0.5,
    },
  },
  'veo-3-1': {
    id: 'veo-3-1',
    name: 'Veo 3.1',
    provider: 'evolink',
    description: 'Google Veo 3.1 - Cinematic quality',
    supportImageToVideo: true,
    maxDuration: 8,
    durations: [4, 6, 8],
    aspectRatios: ['16:9', '9:16'],
    creditCost: {
      base: 10,
      perExtraSecond: 2,
    },
  },
  'seedance-1-5': {
    id: 'seedance-1-5',
    name: 'Seedance 1.5',
    provider: 'evolink',
    description: 'ByteDance Seedance - Creative animations',
    supportImageToVideo: true,
    maxDuration: 12,
    durations: [4, 5, 6, 8, 10, 12],
    aspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9'],
    qualities: ['480P', '720P', '1080P'],
    creditCost: {
      base: 6,
      perExtraSecond: 0.8,
      highQualityMultiplier: 1.5,
    },
  },
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
      base: 4,
      perExtraSecond: 0.5,
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
    amount: 50,
    expireDays: 30,
  },

  // Credit expiration settings
  expiration: {
    subscriptionDays: 30,
    purchaseDays: 365,
    warnBeforeDays: 7,
  },
};
