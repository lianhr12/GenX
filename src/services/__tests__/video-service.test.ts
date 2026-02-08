import { describe, expect, it } from 'vitest';
import {
  VIDEO_MODELS,
  calculateModelCredits,
  getModelConfig,
} from '@/config/video-credits';

/**
 * VideoService 业务逻辑测试
 * 测试模型验证、时长验证、积分计算、I2V支持等关键逻辑
 * 这些测试验证 VideoService.generate() 中的前置校验逻辑
 */

// ============================================================================
// 模型验证逻辑
// ============================================================================

describe('VideoService 模型验证', () => {
  it('有效模型应该返回配置', () => {
    for (const modelId of Object.keys(VIDEO_MODELS)) {
      const config = getModelConfig(modelId);
      expect(config).not.toBeNull();
    }
  });

  it('无效模型应该返回 null（service 应抛出 Unsupported model）', () => {
    expect(getModelConfig('fake-model')).toBeNull();
    expect(getModelConfig('')).toBeNull();
    expect(getModelConfig('undefined')).toBeNull();
  });
});

// ============================================================================
// 时长验证逻辑
// ============================================================================

describe('VideoService 时长验证', () => {
  describe('各模型支持的时长', () => {
    it('wan2.6-text-to-video 支持 5, 10, 15s', () => {
      const config = getModelConfig('wan2.6-text-to-video')!;
      expect(config.durations).toEqual([5, 10, 15]);
    });

    it('kling-2 支持 5, 10s', () => {
      const config = getModelConfig('kling-2')!;
      expect(config.durations).toEqual([5, 10]);
    });

    it('veo3.1-fast 仅支持 8s', () => {
      const config = getModelConfig('veo3.1-fast')!;
      expect(config.durations).toEqual([8]);
    });

    it('omnihuman-1.5 支持 10, 20, 30, 35s', () => {
      const config = getModelConfig('omnihuman-1.5')!;
      expect(config.durations).toEqual([10, 20, 30, 35]);
    });
  });

  describe('时长验证逻辑模拟', () => {
    // 模拟 VideoService.generate 中的时长验证
    function validateDuration(modelId: string, duration: number): boolean {
      const config = getModelConfig(modelId);
      if (!config) return false;
      return config.durations.includes(duration);
    }

    it('有效时长应通过验证', () => {
      expect(validateDuration('wan2.6-text-to-video', 5)).toBe(true);
      expect(validateDuration('wan2.6-text-to-video', 10)).toBe(true);
      expect(validateDuration('wan2.6-text-to-video', 15)).toBe(true);
    });

    it('无效时长应不通过验证', () => {
      expect(validateDuration('wan2.6-text-to-video', 3)).toBe(false);
      expect(validateDuration('wan2.6-text-to-video', 7)).toBe(false);
      expect(validateDuration('wan2.6-text-to-video', 20)).toBe(false);
    });

    it('0 秒时长应不通过', () => {
      expect(validateDuration('wan2.6-text-to-video', 0)).toBe(false);
    });

    it('负数时长应不通过', () => {
      expect(validateDuration('wan2.6-text-to-video', -5)).toBe(false);
    });
  });
});

// ============================================================================
// Image-to-Video 支持验证
// ============================================================================

describe('VideoService I2V 支持验证', () => {
  // 模拟 VideoService.generate 中的 I2V 验证
  function validateI2V(
    modelId: string,
    hasImageUrl: boolean
  ): { valid: boolean; error?: string } {
    const config = getModelConfig(modelId);
    if (!config) return { valid: false, error: 'Unsupported model' };
    if (hasImageUrl && !config.supportImageToVideo) {
      return {
        valid: false,
        error: `Model ${modelId} does not support image-to-video`,
      };
    }
    return { valid: true };
  }

  it('支持 I2V 的模型传入 imageUrl 应通过', () => {
    const i2vModels = [
      'wan2.6-image-to-video',
      'wan2.5-image-to-video',
      'sora-2-pro',
      'kling-o1-image-to-video',
      'doubao-seedance-1.0-pro-fast',
      'MiniMax-Hailuo-02',
    ];
    for (const modelId of i2vModels) {
      const result = validateI2V(modelId, true);
      expect(result.valid).toBe(true);
    }
  });

  it('不支持 I2V 的模型传入 imageUrl 应失败', () => {
    const t2vOnlyModels = ['wan2.6-text-to-video', 'kling-2'];
    for (const modelId of t2vOnlyModels) {
      const result = validateI2V(modelId, true);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('does not support image-to-video');
    }
  });

  it('不传 imageUrl 时任何模型都应通过', () => {
    for (const modelId of Object.keys(VIDEO_MODELS)) {
      const result = validateI2V(modelId, false);
      expect(result.valid).toBe(true);
    }
  });
});

// ============================================================================
// 图像尺寸需求验证
// ============================================================================

describe('VideoService 图像尺寸验证', () => {
  it('sora-2-preview 应要求精确尺寸', () => {
    const config = getModelConfig('sora-2-preview')!;
    expect(config.imageRequirements?.exactDimensions).toBe(true);
  });

  it('sora-2-preview 16:9 要求 1280x720', () => {
    const config = getModelConfig('sora-2-preview')!;
    const dims = config.imageRequirements?.dimensions?.['16:9'];
    expect(dims).toEqual({ width: 1280, height: 720 });
  });

  it('sora-2-preview 9:16 要求 720x1280', () => {
    const config = getModelConfig('sora-2-preview')!;
    const dims = config.imageRequirements?.dimensions?.['9:16'];
    expect(dims).toEqual({ width: 720, height: 1280 });
  });

  it('sora-2-preview 应标注 noRealPerson', () => {
    const config = getModelConfig('sora-2-preview')!;
    expect(config.imageRequirements?.noRealPerson).toBe(true);
  });

  it('wan 系列不要求精确尺寸', () => {
    const config = getModelConfig('wan2.6-image-to-video')!;
    expect(config.imageRequirements?.exactDimensions).toBeUndefined();
  });
});

// ============================================================================
// 积分计算一致性
// ============================================================================

describe('VideoService 积分计算一致性', () => {
  describe('text-to-video 各模型各时长积分', () => {
    const testCases = [
      { model: 'wan2.6-text-to-video', duration: 5, quality: '720p' },
      { model: 'wan2.6-text-to-video', duration: 10, quality: '720p' },
      { model: 'wan2.6-text-to-video', duration: 15, quality: '720p' },
      { model: 'wan2.6-text-to-video', duration: 5, quality: '1080p' },
      { model: 'kling-2', duration: 5 },
      { model: 'kling-2', duration: 10 },
      { model: 'sora-2-preview', duration: 4 },
      { model: 'sora-2-preview', duration: 8 },
      { model: 'sora-2-preview', duration: 12 },
    ];

    for (const tc of testCases) {
      it(`${tc.model} ${tc.duration}s ${tc.quality || 'default'} 应返回正整数`, () => {
        const credits = calculateModelCredits(tc.model, {
          duration: tc.duration,
          quality: tc.quality,
        });
        expect(credits).toBeGreaterThan(0);
        expect(Number.isInteger(credits)).toBe(true);
      });
    }
  });

  describe('image-to-video 各模型积分', () => {
    const i2vTestCases = [
      { model: 'wan2.6-image-to-video', duration: 5, quality: '720p' },
      { model: 'wan2.6-image-to-video', duration: 10, quality: '1080p' },
      { model: 'kling-o1-image-to-video', duration: 5 },
      { model: 'doubao-seedance-1.0-pro-fast', duration: 5, quality: '720p' },
    ];

    for (const tc of i2vTestCases) {
      it(`${tc.model} ${tc.duration}s ${tc.quality || 'default'} 应返回正整数`, () => {
        const credits = calculateModelCredits(tc.model, {
          duration: tc.duration,
          quality: tc.quality,
        });
        expect(credits).toBeGreaterThan(0);
        expect(Number.isInteger(credits)).toBe(true);
      });
    }
  });

  describe('reference-to-video 积分', () => {
    it('omnihuman-1.5 10s 720P 应返回正整数', () => {
      const credits = calculateModelCredits('omnihuman-1.5', {
        duration: 10,
        quality: '720P',
      });
      expect(credits).toBeGreaterThan(0);
      expect(Number.isInteger(credits)).toBe(true);
    });

    it('omnihuman-1.5 1080P 应高于 720P', () => {
      const q720 = calculateModelCredits('omnihuman-1.5', {
        duration: 10,
        quality: '720P',
      });
      const q1080 = calculateModelCredits('omnihuman-1.5', {
        duration: 10,
        quality: '1080P',
      });
      expect(q1080).toBeGreaterThan(q720);
    });

    it('omnihuman-1.5 更长时长应更贵', () => {
      const short = calculateModelCredits('omnihuman-1.5', { duration: 10 });
      const long = calculateModelCredits('omnihuman-1.5', { duration: 30 });
      expect(long).toBeGreaterThan(short);
    });
  });
});

// ============================================================================
// 音频支持验证
// ============================================================================

describe('VideoService 音频支持', () => {
  it('支持 generateAudio 的模型', () => {
    const audioModels = ['veo3.1-fast', 'veo3.1-pro', 'seedance-1.5-pro'];
    for (const modelId of audioModels) {
      const config = getModelConfig(modelId)!;
      expect(config.supportsAudioGeneration).toBe(true);
    }
  });

  it('支持 audioUrl 的模型', () => {
    const audioUrlModels = [
      'wan2.6-text-to-video',
      'wan2.6-image-to-video',
      'omnihuman-1.5',
    ];
    for (const modelId of audioUrlModels) {
      const config = getModelConfig(modelId)!;
      expect(config.supportsAudioUrl).toBe(true);
    }
  });

  it('不支持音频的模型不应有 supportsAudioGeneration', () => {
    const noAudioModels = ['kling-2', 'wan2.5-text-to-video'];
    for (const modelId of noAudioModels) {
      const config = getModelConfig(modelId)!;
      expect(config.supportsAudioGeneration).toBeUndefined();
    }
  });
});

// ============================================================================
// Provider 配置正确性
// ============================================================================

describe('VideoService Provider 配置', () => {
  it('kling-2 应使用 kie provider', () => {
    const config = getModelConfig('kling-2')!;
    expect(config.provider).toBe('kie');
  });

  it('其他模型大多使用 evolink provider', () => {
    const evolinkModels = [
      'sora-2-preview',
      'sora-2-pro',
      'wan2.6-text-to-video',
      'wan2.6-image-to-video',
      'doubao-seedance-1.0-pro-fast',
      'MiniMax-Hailuo-02',
      'omnihuman-1.5',
    ];
    for (const modelId of evolinkModels) {
      const config = getModelConfig(modelId)!;
      expect(config.provider).toBe('evolink');
    }
  });
});
