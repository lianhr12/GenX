// src/components/generator/config/defaults.ts

import type { CreatorMode, CreatorState } from '../types';
import { getDefaultModel } from './modes';

export const defaultCreatorState: CreatorState = {
  mode: 'text-to-video',
  prompt: '',
  model: 'wan2.6-text-to-video',
  duration: 5,
  aspectRatio: '16:9',
  quality: '720p',
  sourceImage: null,
  referenceImage: null,
  style: 'default',
  outputNumber: 1,
  isPublic: true,
  hidePrompt: false,
  generateAudio: false,
  audioUrl: null,
  isGenerating: false,
  generationProgress: 0,
};

export function getDefaultStateForMode(
  mode: CreatorMode
): Partial<CreatorState> {
  const baseState: Partial<CreatorState> = {
    mode,
    model: getDefaultModel(mode),
    // 注意：不要在这里设置 prompt，因为切换模式时应该保留用户输入的提示词
    generateAudio: false,
    audioUrl: null,
    isGenerating: false,
    generationProgress: 0,
  };

  switch (mode) {
    case 'text-to-video':
      return {
        ...baseState,
        duration: 5,
        aspectRatio: '16:9',
        quality: '720p',
      };
    case 'image-to-video':
      return {
        ...baseState,
        duration: 5,
        quality: '720p',
        sourceImage: null,
      };
    case 'text-to-image':
      return {
        ...baseState,
        aspectRatio: '1:1',
        style: 'default',
        outputNumber: 1,
      };
    case 'reference-to-video':
      return {
        ...baseState,
        duration: 10,
        quality: '720p',
        referenceImage: null,
      };
    case 'audio':
      return {
        ...baseState,
      };
    default:
      return baseState;
  }
}

// 默认宽高比选项
export const defaultAspectRatios = ['16:9', '9:16', '1:1', '4:3', '3:4'];

// 默认时长选项（秒）
export const defaultDurations = [5, 10, 15];

// 默认质量选项
export const defaultQualities = ['720p', '1080p'];

// 默认输出数量选项
export const defaultOutputNumbers = [1, 2, 4];

// 默认风格选项
export const defaultStyles = [
  'default',
  'cyberpunk',
  'watercolor',
  'oil-painting',
  'anime',
  'fluid-art',
];
