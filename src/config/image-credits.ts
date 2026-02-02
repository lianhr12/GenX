/**
 * Image Generation Credits Configuration
 * Defines AI models, pricing, and credit calculation rules
 */

// ============================================================================
// Types
// ============================================================================

export interface ImageModelConfig {
  id: string;
  name: string;
  description: string;
  supportedSizes: string[];
  defaultSize: string;
  creditCost: {
    base: number;
    hdMultiplier?: number;
  };
}

// ============================================================================
// Model Configurations
// ============================================================================

export const IMAGE_MODELS: Record<string, ImageModelConfig> = {
  // GPT Image models
  'gpt-image-1.5': {
    id: 'gpt-image-1.5',
    name: 'GPT Image 1.5',
    description: 'OpenAI GPT Image 1.5 - High quality image generation',
    supportedSizes: [
      '1024x1024',
      '1024x1536',
      '1536x1024',
      '1:1',
      '2:3',
      '3:2',
    ],
    defaultSize: '1024x1024',
    creditCost: {
      base: 8,
      hdMultiplier: 1.5,
    },
  },
  'gpt-image-1.5-lite': {
    id: 'gpt-image-1.5-lite',
    name: 'GPT Image 1.5 Lite',
    description: 'OpenAI GPT Image 1.5 Lite - Fast and affordable',
    supportedSizes: [
      '1024x1024',
      '1024x1536',
      '1536x1024',
      '1:1',
      '2:3',
      '3:2',
    ],
    defaultSize: '1024x1024',
    creditCost: {
      base: 4,
      hdMultiplier: 1.5,
    },
  },
  // Seedream models (ByteDance)
  'doubao-seedream-4.5': {
    id: 'doubao-seedream-4.5',
    name: 'Seedream 4.5',
    description: 'ByteDance Seedream 4.5 - Latest generation',
    supportedSizes: ['1:1', '16:9', '9:16', '4:3', '3:4', '2:3', '3:2'],
    defaultSize: '2048x2048',
    creditCost: {
      base: 6,
      hdMultiplier: 1.5,
    },
  },
  'doubao-seedream-4.0': {
    id: 'doubao-seedream-4.0',
    name: 'Seedream 4.0',
    description: 'ByteDance Seedream 4.0 - Stable and reliable',
    supportedSizes: ['1:1', '16:9', '9:16', '4:3', '3:4', '2:3', '3:2'],
    defaultSize: '2048x2048',
    creditCost: {
      base: 5,
      hdMultiplier: 1.5,
    },
  },
  // Nanobanana (Gemini backend)
  'gemini-3-pro-image-preview': {
    id: 'gemini-3-pro-image-preview',
    name: 'Nanobanana Pro',
    description: 'Google Gemini 3 Pro - Premium image generation',
    supportedSizes: ['1:1', '16:9', '9:16', '4:3', '3:4', '2:3', '3:2'],
    defaultSize: '1024x1024',
    creditCost: {
      base: 10,
      hdMultiplier: 1.5,
    },
  },
  // Wan2.5 text-to-image (Alibaba)
  'wan2.5-text-to-image': {
    id: 'wan2.5-text-to-image',
    name: 'Wan 2.5',
    description: 'Alibaba Wan 2.5 - Text to image generation',
    supportedSizes: ['1:1', '16:9', '9:16', '4:3', '3:4', '2:3', '3:2'],
    defaultSize: '1280x1280',
    creditCost: {
      base: 5,
      hdMultiplier: 1.5,
    },
  },
};

// ============================================================================
// Credit Calculation
// ============================================================================

/**
 * Get model configuration by ID
 */
export function getImageModelConfig(modelId: string): ImageModelConfig | null {
  return IMAGE_MODELS[modelId] || null;
}

/**
 * Get all available image models
 */
export function getAvailableImageModels(): ImageModelConfig[] {
  return Object.values(IMAGE_MODELS);
}

/**
 * Calculate credits required for image generation
 */
export function calculateImageCredits(
  modelId: string,
  params: { quality?: string; numberOfImages?: number }
): number {
  const config = getImageModelConfig(modelId);
  if (!config) {
    // Default fallback for unknown models
    return 5 * (params.numberOfImages || 1);
  }

  const { base, hdMultiplier = 1 } = config.creditCost;
  const numberOfImages = params.numberOfImages || 1;

  let credits = base;

  // Apply quality multiplier if applicable
  if (params.quality === 'high' || params.quality === 'hd') {
    credits = Math.round(credits * hdMultiplier);
  }

  // Multiply by number of images
  credits = credits * numberOfImages;

  return Math.round(credits);
}
