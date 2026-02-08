// src/components/generator/config/modes.ts

import type { CreatorMode, ModeConfig } from '../types';

export const modeConfigs: Record<CreatorMode, ModeConfig> = {
  'text-to-video': {
    id: 'text-to-video',
    label: 'Text to Video',
    labelKey: 'Generator.modes.textToVideo',
    icon: 'video',
    requiresImage: false,
    parameters: ['model', 'duration', 'aspectRatio', 'quality'],
    defaultModel: 'wan2.6-text-to-video',
    availableModels: [
      'wan2.6-text-to-video',
      'wan2.5-text-to-video',
      'kling-2',
      'sora-2-preview',
      'sora-2-pro',
      'veo-3.1-fast-generate-preview',
      'veo-3.1-pro',
      'doubao-seedance-1.0-pro-fast',
      'seedance-1.5-pro',
      'MiniMax-Hailuo-02',
      'MiniMax-Hailuo-2.3',
    ],
    creditsBase: 100,
  },
  'image-to-video': {
    id: 'image-to-video',
    label: 'Image to Video',
    labelKey: 'Generator.modes.imageToVideo',
    icon: 'image-video',
    requiresImage: true,
    parameters: ['model', 'duration', 'quality', 'sourceImage'],
    defaultModel: 'wan2.6-image-to-video',
    availableModels: [
      'wan2.6-image-to-video',
      'wan2.5-image-to-video',
      'kling-o1-image-to-video',
      'sora-2-pro',
      'veo-3.1-fast-generate-preview',
      'veo-3.1-pro',
      'doubao-seedance-1.0-pro-fast',
      'seedance-1.5-pro',
      'MiniMax-Hailuo-02',
      'MiniMax-Hailuo-2.3',
    ],
    creditsBase: 120,
  },
  'text-to-image': {
    id: 'text-to-image',
    label: 'Text to Image',
    labelKey: 'Generator.modes.textToImage',
    icon: 'image',
    requiresImage: false,
    parameters: ['model', 'aspectRatio', 'style', 'outputNumber'],
    defaultModel: 'gpt-image-1.5',
    availableModels: [
      'gpt-image-1.5',
      'gpt-image-1.5-lite',
      'doubao-seedream-4.5',
      'doubao-seedream-4.0',
      'gemini-3-pro-image-preview',
      'wan2.5-text-to-image',
    ],
    creditsBase: 8,
  },
  'image-to-image': {
    id: 'image-to-image',
    label: 'Image to Image',
    labelKey: 'Generator.modes.imageToImage',
    icon: 'image-edit',
    requiresImage: true,
    parameters: ['model', 'sourceImage', 'outputNumber'],
    defaultModel: 'qwen-image-edit-plus',
    availableModels: [
      'qwen-image-edit-plus',
      'qwen-image-edit',
      'wan2.5-image-to-image',
    ],
    creditsBase: 2,
  },
  'reference-to-video': {
    id: 'reference-to-video',
    label: 'Reference to Video',
    labelKey: 'Generator.modes.referenceToVideo',
    icon: 'reference',
    requiresImage: true,
    parameters: ['model', 'duration', 'quality', 'referenceImage'],
    defaultModel: 'wan2.6-reference-video',
    availableModels: ['wan2.6-reference-video', 'omnihuman-1.5'],
    creditsBase: 26,
  },
  audio: {
    id: 'audio',
    label: 'Audio Generation',
    labelKey: 'Generator.modes.audio',
    icon: 'audio',
    requiresImage: false,
    parameters: ['model', 'audioType'],
    defaultModel: 'audio-default',
    availableModels: ['audio-default'],
    creditsBase: 10,
  },
};

export function getModeConfig(mode: CreatorMode): ModeConfig {
  return modeConfigs[mode];
}

export function getDefaultModel(mode: CreatorMode): string {
  return modeConfigs[mode].defaultModel;
}

export function getAvailableModels(mode: CreatorMode): string[] {
  return modeConfigs[mode].availableModels;
}

export function getModeRequiresImage(mode: CreatorMode): boolean {
  return modeConfigs[mode].requiresImage;
}

export function getModeParameters(mode: CreatorMode): string[] {
  return modeConfigs[mode].parameters;
}

export function getModeCreditsBase(mode: CreatorMode): number {
  return modeConfigs[mode].creditsBase;
}

// 路由映射
export const modeRoutes: Record<CreatorMode, string> = {
  'text-to-video': '/create/text-to-video',
  'image-to-video': '/create/image-to-video',
  'text-to-image': '/create/text-to-image',
  'image-to-image': '/create/image-to-image',
  'reference-to-video': '/create/reference-to-video',
  audio: '/create/audio',
};

export function getRouteForMode(mode: CreatorMode): string {
  return modeRoutes[mode];
}

export function getModeFromRoute(route: string): CreatorMode | null {
  const entry = Object.entries(modeRoutes).find(([, r]) => r === route);
  return entry ? (entry[0] as CreatorMode) : null;
}
