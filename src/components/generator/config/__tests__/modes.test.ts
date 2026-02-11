import { describe, expect, it } from 'vitest';
import type { CreatorMode } from '../../types';
import {
  getAvailableModels,
  getDefaultModel,
  getModeConfig,
  getModeCreditsBase,
  getModeFromRoute,
  getModeParameters,
  getModeRequiresImage,
  getRouteForMode,
  modeConfigs,
  modeRoutes,
} from '../modes';

// ============================================================================
// 所有模式列表
// ============================================================================

const ALL_MODES: CreatorMode[] = [
  'text-to-video',
  'image-to-video',
  'text-to-image',
  'image-to-image',
  'reference-to-video',
  'audio',
];

// ============================================================================
// getModeConfig
// ============================================================================

describe('getModeConfig', () => {
  it('每个模式都应该有配置', () => {
    for (const mode of ALL_MODES) {
      const config = getModeConfig(mode);
      expect(config).toBeDefined();
      expect(config.id).toBe(mode);
    }
  });

  it('配置应包含完整属性', () => {
    for (const mode of ALL_MODES) {
      const config = getModeConfig(mode);
      expect(config).toHaveProperty('id');
      expect(config).toHaveProperty('label');
      expect(config).toHaveProperty('labelKey');
      expect(config).toHaveProperty('icon');
      expect(config).toHaveProperty('requiresImage');
      expect(config).toHaveProperty('parameters');
      expect(config).toHaveProperty('defaultModel');
      expect(config).toHaveProperty('availableModels');
      expect(config).toHaveProperty('creditsBase');
    }
  });
});

// ============================================================================
// getDefaultModel
// ============================================================================

describe('getDefaultModel', () => {
  it('text-to-video 默认模型应为 wan2.6-text-to-video', () => {
    expect(getDefaultModel('text-to-video')).toBe('wan2.6-text-to-video');
  });

  it('image-to-video 默认模型应为 wan2.6-image-to-video', () => {
    expect(getDefaultModel('image-to-video')).toBe('wan2.6-image-to-video');
  });

  it('text-to-image 默认模型应为 gpt-image-1.5', () => {
    expect(getDefaultModel('text-to-image')).toBe('gpt-image-1.5');
  });

  it('image-to-image 默认模型应为 qwen-image-edit-plus', () => {
    expect(getDefaultModel('image-to-image')).toBe('qwen-image-edit-plus');
  });

  it('reference-to-video 默认模型应为 wan2.6-reference-video', () => {
    expect(getDefaultModel('reference-to-video')).toBe(
      'wan2.6-reference-video'
    );
  });

  it('默认模型应在可用模型列表中', () => {
    for (const mode of ALL_MODES) {
      const defaultModel = getDefaultModel(mode);
      const available = getAvailableModels(mode);
      expect(available).toContain(defaultModel);
    }
  });
});

// ============================================================================
// getAvailableModels
// ============================================================================

describe('getAvailableModels', () => {
  it('每个模式至少有一个可用模型', () => {
    for (const mode of ALL_MODES) {
      const models = getAvailableModels(mode);
      expect(models.length).toBeGreaterThan(0);
    }
  });

  it('模型 ID 不应有重复', () => {
    for (const mode of ALL_MODES) {
      const models = getAvailableModels(mode);
      const unique = new Set(models);
      expect(unique.size).toBe(models.length);
    }
  });
});

// ============================================================================
// getModeRequiresImage
// ============================================================================

describe('getModeRequiresImage', () => {
  it('text-to-video 不需要图片', () => {
    expect(getModeRequiresImage('text-to-video')).toBe(false);
  });

  it('image-to-video 需要图片', () => {
    expect(getModeRequiresImage('image-to-video')).toBe(true);
  });

  it('text-to-image 不需要图片', () => {
    expect(getModeRequiresImage('text-to-image')).toBe(false);
  });

  it('image-to-image 需要图片', () => {
    expect(getModeRequiresImage('image-to-image')).toBe(true);
  });

  it('reference-to-video 需要图片', () => {
    expect(getModeRequiresImage('reference-to-video')).toBe(true);
  });
});

// ============================================================================
// getModeParameters
// ============================================================================

describe('getModeParameters', () => {
  it('text-to-video 应包含 model, duration, aspectRatio, quality', () => {
    const params = getModeParameters('text-to-video');
    expect(params).toContain('model');
    expect(params).toContain('duration');
    expect(params).toContain('aspectRatio');
    expect(params).toContain('quality');
  });

  it('image-to-video 应包含 model, duration, quality, sourceImage', () => {
    const params = getModeParameters('image-to-video');
    expect(params).toContain('model');
    expect(params).toContain('duration');
    expect(params).toContain('quality');
    expect(params).toContain('sourceImage');
  });

  it('text-to-image 应包含 model, aspectRatio, style, outputNumber', () => {
    const params = getModeParameters('text-to-image');
    expect(params).toContain('model');
    expect(params).toContain('aspectRatio');
    expect(params).toContain('style');
    expect(params).toContain('outputNumber');
  });

  it('image-to-image 应包含 model, sourceImage, outputNumber', () => {
    const params = getModeParameters('image-to-image');
    expect(params).toContain('model');
    expect(params).toContain('sourceImage');
    expect(params).toContain('outputNumber');
  });

  it('reference-to-video 应包含 model, duration, quality, referenceImage', () => {
    const params = getModeParameters('reference-to-video');
    expect(params).toContain('model');
    expect(params).toContain('duration');
    expect(params).toContain('quality');
    expect(params).toContain('referenceImage');
  });
});

// ============================================================================
// getModeCreditsBase
// ============================================================================

describe('getModeCreditsBase', () => {
  it('所有模式的基础积分应 > 0', () => {
    for (const mode of ALL_MODES) {
      expect(getModeCreditsBase(mode)).toBeGreaterThan(0);
    }
  });

  it('视频模式的基础积分应 > 图片模式', () => {
    const t2v = getModeCreditsBase('text-to-video');
    const t2i = getModeCreditsBase('text-to-image');
    expect(t2v).toBeGreaterThan(t2i);
  });
});

// ============================================================================
// Route mapping
// ============================================================================

describe('路由映射', () => {
  it('每个模式都有对应路由', () => {
    for (const mode of ALL_MODES) {
      const route = getRouteForMode(mode);
      expect(route).toBeTruthy();
      expect(route).toMatch(/^\/create\//);
    }
  });

  it('getModeFromRoute 应该能反向解析路由', () => {
    for (const mode of ALL_MODES) {
      const route = getRouteForMode(mode);
      const resolved = getModeFromRoute(route);
      expect(resolved).toBe(mode);
    }
  });

  it('无效路由应返回 null', () => {
    expect(getModeFromRoute('/invalid/path')).toBeNull();
    expect(getModeFromRoute('')).toBeNull();
    expect(getModeFromRoute('/create/non-existent')).toBeNull();
  });

  it('路由数量应与模式数量一致', () => {
    expect(Object.keys(modeRoutes).length).toBe(ALL_MODES.length);
  });
});

// ============================================================================
// 积分一致性：modeConfigs.creditsBase 和 video/image-credits 之间
// ============================================================================

describe('积分一致性检查', () => {
  it('text-to-video creditsBase 应为 100', () => {
    expect(modeConfigs['text-to-video'].creditsBase).toBe(100);
  });

  it('image-to-video creditsBase 应为 120', () => {
    expect(modeConfigs['image-to-video'].creditsBase).toBe(120);
  });

  it('text-to-image creditsBase 应为 8', () => {
    expect(modeConfigs['text-to-image'].creditsBase).toBe(8);
  });

  it('image-to-image creditsBase 应为 2', () => {
    expect(modeConfigs['image-to-image'].creditsBase).toBe(2);
  });

  it('reference-to-video creditsBase 应为 26', () => {
    expect(modeConfigs['reference-to-video'].creditsBase).toBe(26);
  });
});
