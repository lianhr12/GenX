import { describe, expect, it } from 'vitest';
import {
  VIDEO_MODELS,
  calculateModelCredits,
  getAvailableModels,
  getCameraMotionModels,
  getFirstLastFrameModels,
  getImageToVideoModels,
  getModelConfig,
} from '../video-credits';

// ============================================================================
// getModelConfig
// ============================================================================

describe('getModelConfig', () => {
  it('应该返回已知模型的配置', () => {
    const config = getModelConfig('wan2.6-text-to-video');
    expect(config).not.toBeNull();
    expect(config!.id).toBe('wan2.6-text-to-video');
  });

  it('应该对未知模型返回 null', () => {
    expect(getModelConfig('non-existent')).toBeNull();
    expect(getModelConfig('')).toBeNull();
  });

  it('返回的配置应包含完整属性', () => {
    const config = getModelConfig('wan2.6-text-to-video');
    expect(config).toHaveProperty('id');
    expect(config).toHaveProperty('name');
    expect(config).toHaveProperty('provider');
    expect(config).toHaveProperty('supportImageToVideo');
    expect(config).toHaveProperty('maxDuration');
    expect(config).toHaveProperty('durations');
    expect(config).toHaveProperty('aspectRatios');
    expect(config).toHaveProperty('creditCost');
  });
});

// ============================================================================
// getAvailableModels
// ============================================================================

describe('getAvailableModels', () => {
  it('应该返回所有模型', () => {
    const models = getAvailableModels();
    expect(models.length).toBe(Object.keys(VIDEO_MODELS).length);
    expect(models.length).toBeGreaterThan(0);
  });

  it('每个模型应包含必要字段', () => {
    const models = getAvailableModels();
    for (const model of models) {
      expect(model.id).toBeTruthy();
      expect(model.name).toBeTruthy();
      expect(model.provider).toBeTruthy();
      expect(model.durations.length).toBeGreaterThan(0);
      expect(model.aspectRatios.length).toBeGreaterThan(0);
      expect(model.creditCost.base).toBeGreaterThan(0);
    }
  });
});

// ============================================================================
// Filter functions
// ============================================================================

describe('getImageToVideoModels', () => {
  it('应该只返回支持 I2V 的模型', () => {
    const models = getImageToVideoModels();
    expect(models.length).toBeGreaterThan(0);
    for (const model of models) {
      expect(model.supportImageToVideo).toBe(true);
    }
  });

  it('不应该包含不支持 I2V 的模型', () => {
    const i2vModels = getImageToVideoModels();
    const i2vIds = new Set(i2vModels.map((m) => m.id));
    // kling-2 不支持 I2V
    expect(i2vIds.has('kling-2')).toBe(false);
  });
});

describe('getFirstLastFrameModels', () => {
  it('应该只返回支持 FLF 的模型', () => {
    const models = getFirstLastFrameModels();
    expect(models.length).toBeGreaterThan(0);
    for (const model of models) {
      expect(model.supportFirstLastFrame).toBe(true);
    }
  });
});

describe('getCameraMotionModels', () => {
  it('应该只返回支持相机运动的模型', () => {
    const models = getCameraMotionModels();
    expect(models.length).toBeGreaterThan(0);
    for (const model of models) {
      expect(model.cameraMotions).toBeDefined();
      expect(model.cameraMotions!.length).toBeGreaterThan(0);
    }
  });
});

// ============================================================================
// calculateModelCredits
// ============================================================================

describe('calculateModelCredits', () => {
  // --- 基础积分计算 ---

  describe('基础积分（最短时长）', () => {
    it('wan2.6-text-to-video 基础时长 5s 应为 133 积分', () => {
      const credits = calculateModelCredits('wan2.6-text-to-video', {
        duration: 5,
      });
      expect(credits).toBe(133);
    });

    it('kling-2 基础时长 5s 应为 160 积分', () => {
      const credits = calculateModelCredits('kling-2', { duration: 5 });
      expect(credits).toBe(160);
    });

    it('doubao-seedance-1.0-pro-fast 基础时长 2s 应为 36 积分', () => {
      const credits = calculateModelCredits('doubao-seedance-1.0-pro-fast', {
        duration: 2,
      });
      expect(credits).toBe(36);
    });
  });

  // --- 额外时长积分 ---

  describe('额外时长积分', () => {
    it('wan2.6-text-to-video 10s = base + 5 * perExtraSecond', () => {
      const config = getModelConfig('wan2.6-text-to-video')!;
      const credits = calculateModelCredits('wan2.6-text-to-video', {
        duration: 10,
      });
      const expected =
        config.creditCost.base +
        (10 - config.durations[0]) * (config.creditCost.perExtraSecond || 0);
      expect(credits).toBe(Math.round(expected));
    });

    it('kling-2 10s = 160 + 5 * 32 = 320', () => {
      const credits = calculateModelCredits('kling-2', { duration: 10 });
      expect(credits).toBe(320);
    });

    it('sora-2-preview 基础时长 4s 额外 4s 应为 base + 4*23', () => {
      const credits = calculateModelCredits('sora-2-preview', { duration: 8 });
      expect(credits).toBe(92 + 4 * 23);
    });
  });

  // --- 高质量乘数 ---

  describe('高质量乘数', () => {
    it('1080p 应该应用 highQualityMultiplier', () => {
      const normal = calculateModelCredits('wan2.6-text-to-video', {
        duration: 5,
      });
      const hq = calculateModelCredits('wan2.6-text-to-video', {
        duration: 5,
        quality: '1080p',
      });
      expect(hq).toBe(Math.round(normal * 1.7));
    });

    it('1080P（大写P）也应该生效', () => {
      const hq1 = calculateModelCredits('wan2.6-text-to-video', {
        duration: 5,
        quality: '1080p',
      });
      const hq2 = calculateModelCredits('wan2.6-text-to-video', {
        duration: 5,
        quality: '1080P',
      });
      expect(hq1).toBe(hq2);
    });

    it('4k 质量应该应用乘数', () => {
      const normal = calculateModelCredits('veo3.1-fast', { duration: 8 });
      const hq = calculateModelCredits('veo3.1-fast', {
        duration: 8,
        quality: '4k',
      });
      expect(hq).toBe(Math.round(normal * 2.3));
    });

    it('high 质量应该应用乘数（仅对有 highQualityMultiplier > 1 的模型）', () => {
      // sora-2-pro 的 highQualityMultiplier 默认为 1，所以 high 不改变积分
      // 使用 veo3.1-pro 测试，其 highQualityMultiplier = 1.5
      const normal = calculateModelCredits('veo3.1-pro', { duration: 8 });
      const hq = calculateModelCredits('veo3.1-pro', {
        duration: 8,
        quality: 'high',
      });
      expect(hq).toBeGreaterThan(normal);
    });

    it('720p 不应该应用高质量乘数', () => {
      const normal = calculateModelCredits('wan2.6-text-to-video', {
        duration: 5,
      });
      const q720 = calculateModelCredits('wan2.6-text-to-video', {
        duration: 5,
        quality: '720p',
      });
      expect(q720).toBe(normal);
    });

    it('480p 不应该应用高质量乘数', () => {
      const normal = calculateModelCredits('wan2.5-text-to-video', {
        duration: 5,
      });
      const q480 = calculateModelCredits('wan2.5-text-to-video', {
        duration: 5,
        quality: '480p',
      });
      expect(q480).toBe(normal);
    });
  });

  // --- 未知模型 ---

  describe('未知模型', () => {
    it('未知模型应该返回 0', () => {
      const credits = calculateModelCredits('unknown-model', { duration: 5 });
      expect(credits).toBe(0);
    });
  });

  // --- 所有模型积分有效性 ---

  describe('所有模型积分有效性', () => {
    const allModelIds = Object.keys(VIDEO_MODELS);

    for (const modelId of allModelIds) {
      const config = VIDEO_MODELS[modelId];
      it(`${modelId} 最短时长积分应 > 0 且为整数`, () => {
        const credits = calculateModelCredits(modelId, {
          duration: config.durations[0],
        });
        expect(credits).toBeGreaterThan(0);
        expect(Number.isInteger(credits)).toBe(true);
      });

      it(`${modelId} 最长时长积分应 >= 基础积分`, () => {
        const base = calculateModelCredits(modelId, {
          duration: config.durations[0],
        });
        const max = calculateModelCredits(modelId, {
          duration: config.durations[config.durations.length - 1],
        });
        expect(max).toBeGreaterThanOrEqual(base);
      });
    }
  });

  // --- 时长积分应单调递增 ---

  describe('时长积分单调递增', () => {
    const modelsWithMultipleDurations = Object.entries(VIDEO_MODELS).filter(
      ([, config]) => config.durations.length > 1
    );

    for (const [modelId, config] of modelsWithMultipleDurations) {
      it(`${modelId} 积分应随时长递增`, () => {
        let prevCredits = 0;
        for (const duration of config.durations) {
          const credits = calculateModelCredits(modelId, { duration });
          expect(credits).toBeGreaterThanOrEqual(prevCredits);
          prevCredits = credits;
        }
      });
    }
  });

  // --- 安全性：边界值 ---

  describe('边界值', () => {
    it('duration 小于基础时长不应产生负的额外积分', () => {
      // wan2.6-text-to-video 基础时长 5s，传 1s
      const credits = calculateModelCredits('wan2.6-text-to-video', {
        duration: 1,
      });
      // extraSeconds = Math.max(0, 1-5) = 0, so credits = base = 133
      expect(credits).toBe(133);
    });

    it('duration 为 0 不应产生负积分', () => {
      const credits = calculateModelCredits('wan2.6-text-to-video', {
        duration: 0,
      });
      expect(credits).toBeGreaterThanOrEqual(0);
    });

    it('duration 为负数不应产生负积分', () => {
      const credits = calculateModelCredits('wan2.6-text-to-video', {
        duration: -5,
      });
      expect(credits).toBeGreaterThanOrEqual(0);
    });
  });

  // --- 高质量 + 额外时长组合 ---

  describe('高质量 + 额外时长组合', () => {
    it('wan2.6-text-to-video 1080p 15s 应正确叠加质量和时长', () => {
      const config = getModelConfig('wan2.6-text-to-video')!;
      const baseDuration = config.durations[0];
      const extraSeconds = 15 - baseDuration;
      const baseCredits =
        config.creditCost.base +
        extraSeconds * (config.creditCost.perExtraSecond || 0);
      const expected = Math.round(
        baseCredits * (config.creditCost.highQualityMultiplier || 1)
      );
      const actual = calculateModelCredits('wan2.6-text-to-video', {
        duration: 15,
        quality: '1080p',
      });
      expect(actual).toBe(expected);
    });

    it('veo3.1-fast 4K 8s 应应用 4K 乘数', () => {
      const normal = calculateModelCredits('veo3.1-fast', { duration: 8 });
      const hq = calculateModelCredits('veo3.1-fast', {
        duration: 8,
        quality: '4K',
      });
      expect(hq).toBe(Math.round(normal * 2.3));
    });
  });

  // --- 质量标识全覆盖 ---

  describe('质量标识全覆盖', () => {
    it('512p 不应应用高质量乘数', () => {
      const normal = calculateModelCredits('MiniMax-Hailuo-02', {
        duration: 6,
      });
      const q512 = calculateModelCredits('MiniMax-Hailuo-02', {
        duration: 6,
        quality: '512p',
      });
      expect(q512).toBe(normal);
    });

    it('768p 不应应用高质量乘数', () => {
      const normal = calculateModelCredits('MiniMax-Hailuo-02', {
        duration: 6,
      });
      const q768 = calculateModelCredits('MiniMax-Hailuo-02', {
        duration: 6,
        quality: '768p',
      });
      expect(q768).toBe(normal);
    });

    it('standard 质量不应应用乘数', () => {
      const normal = calculateModelCredits('sora-2-pro', { duration: 15 });
      const std = calculateModelCredits('sora-2-pro', {
        duration: 15,
        quality: 'standard',
      });
      expect(std).toBe(normal);
    });

    it('4k 和 4K 应产生相同积分', () => {
      const hq1 = calculateModelCredits('veo3.1-fast', {
        duration: 8,
        quality: '4k',
      });
      const hq2 = calculateModelCredits('veo3.1-fast', {
        duration: 8,
        quality: '4K',
      });
      expect(hq1).toBe(hq2);
    });
  });

  // --- 特殊模型积分验证 ---

  describe('特殊模型积分验证', () => {
    it('omnihuman-1.5 1080P 应应用高质量乘数', () => {
      const normal = calculateModelCredits('omnihuman-1.5', { duration: 10 });
      const hq = calculateModelCredits('omnihuman-1.5', {
        duration: 10,
        quality: '1080P',
      });
      expect(hq).toBe(Math.round(normal * 1.5));
    });

    it('omnihuman-1.5 35s 最长时长积分应正确', () => {
      const config = getModelConfig('omnihuman-1.5')!;
      const extraSeconds = 35 - config.durations[0];
      const expected =
        config.creditCost.base +
        extraSeconds * (config.creditCost.perExtraSecond || 0);
      const actual = calculateModelCredits('omnihuman-1.5', { duration: 35 });
      expect(actual).toBe(Math.round(expected));
    });

    it('所有模型积分应 > 0 且为整数（最短+最高质量）', () => {
      const allModels = Object.entries(VIDEO_MODELS);
      for (const [modelId, config] of allModels) {
        const highQualities = ['1080p', '1080P', '4k', '4K', 'high'];
        for (const q of highQualities) {
          const credits = calculateModelCredits(modelId, {
            duration: config.durations[0],
            quality: q,
          });
          expect(credits).toBeGreaterThan(0);
          expect(Number.isInteger(credits)).toBe(true);
        }
      }
    });
  });
});

// ============================================================================
// Model Configuration Integrity
// ============================================================================

describe('模型配置完整性', () => {
  const allModels = Object.values(VIDEO_MODELS);

  it('所有模型的 maxDuration 应 >= 最长可选时长', () => {
    for (const model of allModels) {
      const maxSelectable = Math.max(...model.durations);
      expect(model.maxDuration).toBeGreaterThanOrEqual(maxSelectable);
    }
  });

  it('所有模型的 durations 应该是升序排列', () => {
    for (const model of allModels) {
      for (let i = 1; i < model.durations.length; i++) {
        expect(model.durations[i]).toBeGreaterThan(model.durations[i - 1]);
      }
    }
  });

  it('所有 provider 应该是有效值', () => {
    const validProviders = ['evolink', 'kie'];
    for (const model of allModels) {
      expect(validProviders).toContain(model.provider);
    }
  });
});
