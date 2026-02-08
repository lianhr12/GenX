import { describe, expect, it } from 'vitest';
import type { CreatorMode } from '../../types';
import {
  defaultAspectRatios,
  defaultCreatorState,
  defaultDurations,
  defaultOutputNumbers,
  defaultQualities,
  defaultStyles,
  getDefaultStateForMode,
} from '../defaults';
import { getDefaultModel } from '../modes';

// ============================================================================
// defaultCreatorState
// ============================================================================

describe('defaultCreatorState', () => {
  it('应有合理的默认值', () => {
    expect(defaultCreatorState.mode).toBe('text-to-video');
    expect(defaultCreatorState.prompt).toBe('');
    expect(defaultCreatorState.model).toBe('wan2.6-text-to-video');
    expect(defaultCreatorState.duration).toBe(5);
    expect(defaultCreatorState.aspectRatio).toBe('16:9');
    expect(defaultCreatorState.quality).toBe('720p');
    expect(defaultCreatorState.sourceImage).toBeNull();
    expect(defaultCreatorState.referenceImage).toBeNull();
    expect(defaultCreatorState.outputNumber).toBe(1);
    expect(defaultCreatorState.isPublic).toBe(true);
    expect(defaultCreatorState.hidePrompt).toBe(false);
    expect(defaultCreatorState.isGenerating).toBe(false);
    expect(defaultCreatorState.generationProgress).toBe(0);
    expect(defaultCreatorState.generateAudio).toBe(false);
    expect(defaultCreatorState.audioUrl).toBeNull();
  });
});

// ============================================================================
// getDefaultStateForMode
// ============================================================================

describe('getDefaultStateForMode', () => {
  const modes: CreatorMode[] = [
    'text-to-video',
    'image-to-video',
    'text-to-image',
    'image-to-image',
    'reference-to-video',
    'audio',
  ];

  for (const mode of modes) {
    it(`${mode} 应包含 mode 和 model 字段`, () => {
      const state = getDefaultStateForMode(mode);
      expect(state.mode).toBe(mode);
      expect(state.model).toBe(getDefaultModel(mode));
    });

    it(`${mode} isGenerating 应为 false`, () => {
      const state = getDefaultStateForMode(mode);
      expect(state.isGenerating).toBe(false);
    });

    it(`${mode} generationProgress 应为 0`, () => {
      const state = getDefaultStateForMode(mode);
      expect(state.generationProgress).toBe(0);
    });
  }

  it('text-to-video 应设置 duration, aspectRatio, quality', () => {
    const state = getDefaultStateForMode('text-to-video');
    expect(state.duration).toBe(5);
    expect(state.aspectRatio).toBe('16:9');
    expect(state.quality).toBe('720p');
  });

  it('image-to-video 应设置 duration, quality, sourceImage=null', () => {
    const state = getDefaultStateForMode('image-to-video');
    expect(state.duration).toBe(5);
    expect(state.quality).toBe('720p');
    expect(state.sourceImage).toBeNull();
  });

  it('text-to-image 应设置 aspectRatio, style, outputNumber', () => {
    const state = getDefaultStateForMode('text-to-image');
    expect(state.aspectRatio).toBe('1:1');
    expect(state.style).toBe('default');
    expect(state.outputNumber).toBe(1);
  });

  it('reference-to-video 应设置 duration, quality, referenceImage=null', () => {
    const state = getDefaultStateForMode('reference-to-video');
    expect(state.duration).toBe(10);
    expect(state.quality).toBe('720p');
    expect(state.referenceImage).toBeNull();
  });

  it('切换模式不应该设置 prompt（保留用户输入）', () => {
    for (const mode of modes) {
      const state = getDefaultStateForMode(mode);
      expect(state).not.toHaveProperty('prompt');
    }
  });
});

// ============================================================================
// 默认选项列表
// ============================================================================

describe('默认选项列表', () => {
  it('defaultAspectRatios 应包含常见比例', () => {
    expect(defaultAspectRatios).toContain('16:9');
    expect(defaultAspectRatios).toContain('9:16');
    expect(defaultAspectRatios).toContain('1:1');
    expect(defaultAspectRatios.length).toBeGreaterThanOrEqual(3);
  });

  it('defaultDurations 应按升序排列', () => {
    for (let i = 1; i < defaultDurations.length; i++) {
      expect(defaultDurations[i]).toBeGreaterThan(defaultDurations[i - 1]);
    }
  });

  it('defaultQualities 应包含 720p 和 1080p', () => {
    expect(defaultQualities).toContain('720p');
    expect(defaultQualities).toContain('1080p');
  });

  it('defaultOutputNumbers 应包含 1', () => {
    expect(defaultOutputNumbers).toContain(1);
    for (const n of defaultOutputNumbers) {
      expect(n).toBeGreaterThan(0);
    }
  });

  it('defaultStyles 应包含 default', () => {
    expect(defaultStyles).toContain('default');
    expect(defaultStyles.length).toBeGreaterThan(1);
  });
});
