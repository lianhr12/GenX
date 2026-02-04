// src/components/generator/config/credits.ts

import {
  calculateImageCredits,
  getImageModelConfig,
} from '@/config/image-credits';
import {
  calculateModelCredits as calculateVideoCredits,
  getModelConfig,
} from '@/config/video-credits';
import type { CreatorMode, GenerationParams } from '../types';
import { getModeCreditsBase } from './modes';

/**
 * 计算生成所需的 credits
 * 复用现有的 video-credits 和 image-credits 计算逻辑
 */
export function calculateCredits(params: GenerationParams): number {
  // 视频模式 - 使用 video-credits 计算
  if (isVideoMode(params.mode)) {
    const modelConfig = getModelConfig(params.model);
    if (modelConfig) {
      return calculateVideoCredits(params.model, {
        duration: params.duration ?? modelConfig.durations[0] ?? 5,
        quality: params.quality,
      });
    }
    // 模型不存在时使用基础值
    return getModeCreditsBase(params.mode);
  }

  // 图片模式 - 使用 image-credits 计算
  if (isImageMode(params.mode)) {
    const modelConfig = getImageModelConfig(params.model);
    if (modelConfig) {
      return calculateImageCredits(params.model, {
        quality: params.quality,
        numberOfImages: params.outputNumber ?? 1,
      });
    }
    // 模型不存在时使用基础值
    return getModeCreditsBase(params.mode) * (params.outputNumber ?? 1);
  }

  // 音频模式 - 暂时使用基础值
  if (isAudioMode(params.mode)) {
    return getModeCreditsBase(params.mode);
  }

  return 0;
}

/**
 * 检查是否为视频模式
 */
export function isVideoMode(mode: CreatorMode): boolean {
  return ['text-to-video', 'image-to-video', 'reference-to-video'].includes(
    mode
  );
}

/**
 * 检查是否为图片模式
 */
export function isImageMode(mode: CreatorMode): boolean {
  return ['text-to-image', 'image-to-image'].includes(mode);
}

/**
 * 检查是否为音频模式
 */
export function isAudioMode(mode: CreatorMode): boolean {
  return mode === 'audio';
}

/**
 * 获取模式的 credits 范围描述
 */
export function getCreditsRange(mode: CreatorMode): {
  min: number;
  max: number;
} {
  const base = getModeCreditsBase(mode);

  if (isVideoMode(mode)) {
    return {
      min: base,
      max: Math.ceil(base * 3 * 2.5), // 最长时长 * 最高质量
    };
  }

  if (isImageMode(mode)) {
    return {
      min: base,
      max: Math.ceil(base * 4 * 1.5), // 最多输出 * HD 质量
    };
  }

  return { min: base, max: base };
}
