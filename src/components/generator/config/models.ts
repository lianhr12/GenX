// src/components/generator/config/models.ts

import type { CreatorMode } from '../types';

/** 模型提供商/平台 */
export interface ModelProvider {
  id: string;
  name: string;
  icon?: string;
  isNew?: boolean;
}

/** 模型信息 */
export interface ModelInfo {
  id: string;
  name: string;
  providerId: string;
  description: string;
  /** 预估生成时间（秒） */
  estimatedTime?: number;
  /** 基础 Credits */
  baseCredits: number;
  /** 是否新模型 */
  isNew?: boolean;
  /** 支持的模式 */
  supportedModes: CreatorMode[];
  /** 是否支持自动生成音频 */
  supportsAudioGeneration?: boolean;
  /** 是否支持自定义音频 URL 输入 */
  supportsAudioUrl?: boolean;
}

/** 模型提供商列表 */
export const modelProviders: ModelProvider[] = [
  { id: 'openai', name: 'OpenAI', icon: '/images/models/openai.svg' },
  {
    id: 'google',
    name: 'Google',
    icon: '/images/models/google.svg',
    isNew: true,
  },
  { id: 'wan', name: 'Wan AI', icon: '/images/models/wan.svg', isNew: true },
  { id: 'bytedance', name: 'ByteDance', icon: '/images/models/seedance.svg' },
  { id: 'kling', name: 'Kling AI', icon: '/images/models/kling.svg' },
  { id: 'minimax', name: 'MiniMax', icon: '/images/models/minimax.svg' },
  { id: 'omnihuman', name: 'OmniHuman', icon: '/images/models/omnihuman.svg' },
  { id: 'qwen', name: 'Qwen', icon: '/images/models/qwen.svg' },
  { id: 'tongyi', name: 'Tongyi Lab', icon: '/images/models/wan.svg' },
];

/** 所有模型配置 */
export const modelConfigs: ModelInfo[] = [
  // === OpenAI 模型 ===
  {
    id: 'sora-2-pro',
    name: 'Sora 2 Pro',
    providerId: 'openai',
    description: 'OpenAI flagship video model with highest quality',
    estimatedTime: 120,
    baseCredits: 69,
    isNew: true,
    supportedModes: ['text-to-video', 'image-to-video'],
  },
  {
    id: 'sora-2-preview',
    name: 'Sora 2 Preview',
    providerId: 'openai',
    description: 'OpenAI video model preview version',
    estimatedTime: 90,
    baseCredits: 45,
    supportedModes: ['text-to-video'],
  },
  {
    id: 'gpt-image-1.5',
    name: 'GPT Image 1.5',
    providerId: 'openai',
    description: 'Advanced image generation with high quality',
    estimatedTime: 15,
    baseCredits: 8,
    isNew: true,
    supportedModes: ['text-to-image'],
  },
  {
    id: 'gpt-image-1.5-lite',
    name: 'GPT Image 1.5 Lite',
    providerId: 'openai',
    description: 'Fast and efficient image generation',
    estimatedTime: 8,
    baseCredits: 4,
    supportedModes: ['text-to-image'],
  },

  // === Google 模型 ===
  {
    id: 'veo-3.1-pro',
    name: 'Veo 3.1 Pro',
    providerId: 'google',
    description: 'Google professional video generation model',
    estimatedTime: 90,
    baseCredits: 50,
    isNew: true,
    supportedModes: ['text-to-video', 'image-to-video'],
    supportsAudioGeneration: true,
  },
  {
    id: 'veo-3.1-fast-generate-preview',
    name: 'Veo 3.1 Fast',
    providerId: 'google',
    description: 'Fast video generation with good quality',
    estimatedTime: 45,
    baseCredits: 6,
    isNew: true,
    supportedModes: ['text-to-video', 'image-to-video'],
    supportsAudioGeneration: true,
  },
  {
    id: 'gemini-3-pro-image-preview',
    name: 'Gemini 3 Pro Image',
    providerId: 'google',
    description: 'Google multimodal image generation',
    estimatedTime: 20,
    baseCredits: 10,
    isNew: true,
    supportedModes: ['text-to-image'],
  },
  {
    id: 'gemini-2.5-flash-image',
    name: 'Nano Banana',
    providerId: 'google',
    description: 'Fast image generation powered by Gemini 2.5 Flash',
    estimatedTime: 10,
    baseCredits: 5,
    supportedModes: ['text-to-image'],
  },
  {
    id: 'nano-banana-2-lite',
    name: 'Nano Banana Pro Lite',
    providerId: 'google',
    description: 'Cost-effective image generation with quality options',
    estimatedTime: 15,
    baseCredits: 8,
    supportedModes: ['text-to-image'],
  },

  // === Wan AI 模型 ===
  {
    id: 'wan2.6-text-to-video',
    name: 'Wan 2.6 Text to Video',
    providerId: 'wan',
    description: 'Latest Wan AI text-to-video model',
    estimatedTime: 60,
    baseCredits: 26,
    isNew: true,
    supportedModes: ['text-to-video'],
    supportsAudioUrl: true,
  },
  {
    id: 'wan2.5-text-to-video',
    name: 'Wan 2.5 Text to Video',
    providerId: 'wan',
    description: 'Stable text-to-video generation',
    estimatedTime: 50,
    baseCredits: 20,
    supportedModes: ['text-to-video'],
  },
  {
    id: 'wan2.6-image-to-video',
    name: 'Wan 2.6 Image to Video',
    providerId: 'wan',
    description: 'Transform images into dynamic videos with 15s support',
    estimatedTime: 60,
    baseCredits: 26,
    isNew: true,
    supportedModes: ['image-to-video'],
    supportsAudioUrl: true,
  },
  {
    id: 'wan2.5-image-to-video',
    name: 'Wan 2.5 Image to Video',
    providerId: 'wan',
    description: 'Reliable image-to-video conversion',
    estimatedTime: 50,
    baseCredits: 13,
    supportedModes: ['image-to-video'],
  },
  {
    id: 'wan2.6-reference-video',
    name: 'Wan 2.6 Reference Video',
    providerId: 'wan',
    description: 'Extract character appearance and voice from reference videos',
    estimatedTime: 120,
    baseCredits: 26,
    isNew: true,
    supportedModes: ['reference-to-video'],
  },
  {
    id: 'wan2.5-text-to-image',
    name: 'Wan 2.5 Text to Image',
    providerId: 'wan',
    description: 'High-quality image generation',
    estimatedTime: 15,
    baseCredits: 5,
    supportedModes: ['text-to-image'],
  },

  // === ByteDance 模型 ===
  {
    id: 'doubao-seedream-4.5',
    name: 'Seedream 4.5',
    providerId: 'bytedance',
    description: 'ByteDance advanced image model',
    estimatedTime: 12,
    baseCredits: 6,
    isNew: true,
    supportedModes: ['text-to-image'],
  },
  {
    id: 'doubao-seedream-4.0',
    name: 'Seedream 4.0',
    providerId: 'bytedance',
    description: 'Stable image generation model',
    estimatedTime: 10,
    baseCredits: 5,
    supportedModes: ['text-to-image'],
  },
  {
    id: 'seedance-1.5-pro',
    name: 'Seedance 1.5 Pro',
    providerId: 'bytedance',
    description: 'Professional video generation with audio support',
    estimatedTime: 80,
    baseCredits: 9,
    isNew: true,
    supportedModes: ['text-to-video', 'image-to-video'],
    supportsAudioGeneration: true,
  },
  {
    id: 'doubao-seedance-1.0-pro-fast',
    name: 'Seedance 1.0 Pro Fast',
    providerId: 'bytedance',
    description: 'Fast video generation model',
    estimatedTime: 45,
    baseCredits: 20,
    supportedModes: ['text-to-video', 'image-to-video'],
  },

  // === Kling AI 模型 ===
  {
    id: 'kling-2',
    name: 'Kling 2',
    providerId: 'kling',
    description: 'Kling AI latest video model',
    estimatedTime: 70,
    baseCredits: 30,
    isNew: true,
    supportedModes: ['text-to-video'],
  },
  {
    id: 'kling-o1-image-to-video',
    name: 'Kling O1 Image to Video',
    providerId: 'kling',
    description: 'Transform images to videos with first/last frame support',
    estimatedTime: 60,
    baseCredits: 40,
    supportedModes: ['image-to-video'],
  },

  // === MiniMax 模型 ===
  {
    id: 'MiniMax-Hailuo-2.3',
    name: 'Hailuo 2.3',
    providerId: 'minimax',
    description: 'MiniMax latest video generation with camera controls',
    estimatedTime: 55,
    baseCredits: 18,
    isNew: true,
    supportedModes: ['text-to-video', 'image-to-video'],
  },
  {
    id: 'MiniMax-Hailuo-02',
    name: 'Hailuo 02',
    providerId: 'minimax',
    description: 'Stable video generation model',
    estimatedTime: 50,
    baseCredits: 18,
    supportedModes: ['text-to-video', 'image-to-video'],
  },

  // === OmniHuman 模型 ===
  {
    id: 'omnihuman-1.5',
    name: 'OmniHuman 1.5',
    providerId: 'omnihuman',
    description: 'Audio-driven digital human video generation',
    estimatedTime: 120,
    baseCredits: 12,
    supportedModes: ['reference-to-video'],
    supportsAudioUrl: true,
  },

  // === Qwen 模型 ===
  {
    id: 'qwen-image-edit',
    name: 'Qwen Image Edit',
    providerId: 'qwen',
    description: 'Image editing and image-to-image generation',
    estimatedTime: 30,
    baseCredits: 2.3,
    supportedModes: ['image-to-image'],
  },
  {
    id: 'qwen-image-edit-plus',
    name: 'Qwen Image Edit Plus',
    providerId: 'qwen',
    description: 'Advanced image editing with more features',
    estimatedTime: 30,
    baseCredits: 1.5,
    isNew: true,
    supportedModes: ['image-to-image'],
  },

  // === Tongyi Lab 模型 ===
  {
    id: 'z-image-turbo',
    name: 'Z Image Turbo',
    providerId: 'tongyi',
    description: 'Ultra-fast image generation by Tongyi Lab',
    estimatedTime: 5,
    baseCredits: 1,
    isNew: true,
    supportedModes: ['text-to-image'],
  },

  // === Wan AI Image-to-Image 模型 ===
  {
    id: 'wan2.5-image-to-image',
    name: 'Wan 2.5 Image to Image',
    providerId: 'wan',
    description: 'Image editing and transformation',
    estimatedTime: 20,
    baseCredits: 1.5,
    supportedModes: ['image-to-image'],
  },
];

/** 根据模式获取可用的模型 */
export function getModelsForMode(mode: CreatorMode): ModelInfo[] {
  return modelConfigs.filter((model) => model.supportedModes.includes(mode));
}

/** 根据模式获取可用的提供商（有模型的） */
export function getProvidersForMode(mode: CreatorMode): ModelProvider[] {
  const availableModels = getModelsForMode(mode);
  const providerIds = new Set(availableModels.map((m) => m.providerId));
  return modelProviders.filter((p) => providerIds.has(p.id));
}

/** 根据提供商和模式获取模型 */
export function getModelsByProvider(
  providerId: string,
  mode: CreatorMode
): ModelInfo[] {
  return modelConfigs.filter(
    (model) =>
      model.providerId === providerId && model.supportedModes.includes(mode)
  );
}

/** 根据 ID 获取模型信息 */
export function getModelById(modelId: string): ModelInfo | undefined {
  return modelConfigs.find((model) => model.id === modelId);
}

/** 根据 ID 获取提供商信息 */
export function getProviderById(providerId: string): ModelProvider | undefined {
  return modelProviders.find((p) => p.id === providerId);
}
