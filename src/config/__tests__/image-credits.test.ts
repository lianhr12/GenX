import { describe, expect, it } from 'vitest';
import {
  IMAGE_MODELS,
  calculateImageCredits,
  getAvailableImageModels,
  getImageModelConfig,
} from '../image-credits';

// ============================================================================
// getImageModelConfig
// ============================================================================

describe('getImageModelConfig', () => {
  it('应该返回已知模型的配置', () => {
    const config = getImageModelConfig('gpt-image-1.5');
    expect(config).not.toBeNull();
    expect(config!.id).toBe('gpt-image-1.5');
    expect(config!.name).toBe('GPT Image 1.5');
  });

  it('应该对未知模型返回 null', () => {
    expect(getImageModelConfig('non-existent-model')).toBeNull();
    expect(getImageModelConfig('')).toBeNull();
  });

  it('应该返回包含完整属性的配置', () => {
    const config = getImageModelConfig('gpt-image-1.5');
    expect(config).toHaveProperty('id');
    expect(config).toHaveProperty('name');
    expect(config).toHaveProperty('description');
    expect(config).toHaveProperty('supportedSizes');
    expect(config).toHaveProperty('defaultSize');
    expect(config).toHaveProperty('creditCost');
    expect(config!.creditCost).toHaveProperty('base');
  });
});

// ============================================================================
// getAvailableImageModels
// ============================================================================

describe('getAvailableImageModels', () => {
  it('应该返回所有模型列表', () => {
    const models = getAvailableImageModels();
    expect(models.length).toBe(Object.keys(IMAGE_MODELS).length);
    expect(models.length).toBeGreaterThan(0);
  });

  it('每个模型应该有必要的字段', () => {
    const models = getAvailableImageModels();
    for (const model of models) {
      expect(model.id).toBeTruthy();
      expect(model.name).toBeTruthy();
      expect(model.creditCost.base).toBeGreaterThan(0);
      expect(model.supportedSizes.length).toBeGreaterThan(0);
    }
  });
});

// ============================================================================
// calculateImageCredits
// ============================================================================

describe('calculateImageCredits', () => {
  // --- 基础积分计算 ---

  describe('基础积分计算', () => {
    it('GPT Image 1.5 基础积分应为 8', () => {
      const credits = calculateImageCredits('gpt-image-1.5', {});
      expect(credits).toBe(8);
    });

    it('GPT Image 1.5 Lite 基础积分应为 4', () => {
      const credits = calculateImageCredits('gpt-image-1.5-lite', {});
      expect(credits).toBe(4);
    });

    it('Seedream 4.5 基础积分应为 6', () => {
      const credits = calculateImageCredits('doubao-seedream-4.5', {});
      expect(credits).toBe(6);
    });

    it('Z Image Turbo 基础积分应为 1', () => {
      const credits = calculateImageCredits('z-image-turbo', {});
      expect(credits).toBe(1);
    });

    it('Qwen Image Edit Plus 基础积分应为 2', () => {
      const credits = calculateImageCredits('qwen-image-edit-plus', {});
      expect(credits).toBe(2);
    });
  });

  // --- 多图积分计算 ---

  describe('多图积分计算', () => {
    it('生成 2 张图应该翻倍', () => {
      const single = calculateImageCredits('gpt-image-1.5', {
        numberOfImages: 1,
      });
      const double = calculateImageCredits('gpt-image-1.5', {
        numberOfImages: 2,
      });
      expect(double).toBe(single * 2);
    });

    it('生成 4 张图应该 ×4', () => {
      const single = calculateImageCredits('gpt-image-1.5', {
        numberOfImages: 1,
      });
      const quad = calculateImageCredits('gpt-image-1.5', {
        numberOfImages: 4,
      });
      expect(quad).toBe(single * 4);
    });

    it('numberOfImages 为 undefined 时默认 1 张', () => {
      const credits = calculateImageCredits('gpt-image-1.5', {});
      const creditsExplicit = calculateImageCredits('gpt-image-1.5', {
        numberOfImages: 1,
      });
      expect(credits).toBe(creditsExplicit);
    });
  });

  // --- HD 质量乘数 ---

  describe('HD 质量乘数', () => {
    it('GPT Image 1.5 HD 质量应用 1.5x 乘数', () => {
      const normal = calculateImageCredits('gpt-image-1.5', {});
      const hd = calculateImageCredits('gpt-image-1.5', { quality: 'high' });
      expect(hd).toBe(Math.round(normal * 1.5));
    });

    it('quality=hd 也应该应用 HD 乘数', () => {
      const hd1 = calculateImageCredits('gpt-image-1.5', { quality: 'high' });
      const hd2 = calculateImageCredits('gpt-image-1.5', { quality: 'hd' });
      expect(hd1).toBe(hd2);
    });

    it('medium 质量不应该应用乘数', () => {
      const normal = calculateImageCredits('gpt-image-1.5', {});
      const medium = calculateImageCredits('gpt-image-1.5', {
        quality: 'medium',
      });
      expect(medium).toBe(normal);
    });

    it('无 hdMultiplier 的模型 HD 质量不应改变积分', () => {
      // z-image-turbo 没有 hdMultiplier
      const normal = calculateImageCredits('z-image-turbo', {});
      const hd = calculateImageCredits('z-image-turbo', { quality: 'high' });
      expect(hd).toBe(normal);
    });

    it('HD + 多图应该正确叠加', () => {
      const base = calculateImageCredits('gpt-image-1.5', {});
      const hdMulti = calculateImageCredits('gpt-image-1.5', {
        quality: 'high',
        numberOfImages: 3,
      });
      expect(hdMulti).toBe(Math.round(base * 1.5) * 3);
    });
  });

  // --- 未知模型 fallback ---

  describe('未知模型 fallback', () => {
    it('未知模型应该回退到默认 5 积分/张', () => {
      const credits = calculateImageCredits('unknown-model', {});
      expect(credits).toBe(5);
    });

    it('未知模型多图也应该正确计算', () => {
      const credits = calculateImageCredits('unknown-model', {
        numberOfImages: 3,
      });
      expect(credits).toBe(15);
    });
  });

  // --- 每个模型都应该返回正整数积分 ---

  describe('所有模型积分有效性', () => {
    const allModelIds = Object.keys(IMAGE_MODELS);

    for (const modelId of allModelIds) {
      it(`${modelId} 基础积分应该 > 0 且为整数`, () => {
        const credits = calculateImageCredits(modelId, {});
        expect(credits).toBeGreaterThan(0);
        expect(Number.isInteger(credits)).toBe(true);
      });
    }
  });

  // --- 安全性：边界值 ---

  describe('边界值和安全性', () => {
    it('numberOfImages 为 0 时因 fallback 到 1 应返回基础积分', () => {
      // 代码中 `params.numberOfImages || 1` 会将 0 fallback 到 1
      const credits = calculateImageCredits('gpt-image-1.5', {
        numberOfImages: 0,
      });
      expect(credits).toBe(8); // 等同于 numberOfImages=1
    });

    it('负数 numberOfImages 应该返回负数（由调用者验证）', () => {
      const credits = calculateImageCredits('gpt-image-1.5', {
        numberOfImages: -1,
      });
      expect(credits).toBeLessThan(0);
    });

    it('整数 base 应得到精确积分（无舍入误差）', () => {
      // qwen-image-edit-plus base=2, wan2.5-image-to-image base=2
      const credits1 = calculateImageCredits('qwen-image-edit-plus', {});
      expect(Number.isInteger(credits1)).toBe(true);
      expect(credits1).toBe(2);

      const credits2 = calculateImageCredits('wan2.5-image-to-image', {});
      expect(Number.isInteger(credits2)).toBe(true);
      expect(credits2).toBe(2);
    });

    it('整数 base 乘以多图应精确计算（无舍入损失）', () => {
      // base=2, numberOfImages=3 → 2 * 3 = 6（精确）
      const credits = calculateImageCredits('qwen-image-edit-plus', {
        numberOfImages: 3,
      });
      expect(Number.isInteger(credits)).toBe(true);
      expect(credits).toBe(6); // 2 * 3 = 6
    });

    it('qwen-image-edit base=2 应返回 2', () => {
      const credits = calculateImageCredits('qwen-image-edit', {});
      expect(Number.isInteger(credits)).toBe(true);
      expect(credits).toBe(2);
    });

    it('非常大的 numberOfImages 应该正确计算', () => {
      const credits = calculateImageCredits('z-image-turbo', {
        numberOfImages: 1000,
      });
      expect(credits).toBe(1000);
    });
  });

  // --- HD 乘数一致性 ---

  describe('HD 乘数一致性', () => {
    const allModelIds = Object.keys(IMAGE_MODELS);

    for (const modelId of allModelIds) {
      const config = IMAGE_MODELS[modelId];
      if (config.creditCost.hdMultiplier && config.creditCost.hdMultiplier > 1) {
        it(`${modelId} HD 积分应大于普通积分`, () => {
          const normal = calculateImageCredits(modelId, {});
          const hd = calculateImageCredits(modelId, { quality: 'high' });
          expect(hd).toBeGreaterThan(normal);
        });

        it(`${modelId} quality=high 与 quality=hd 应一致`, () => {
          const hd1 = calculateImageCredits(modelId, { quality: 'high' });
          const hd2 = calculateImageCredits(modelId, { quality: 'hd' });
          expect(hd1).toBe(hd2);
        });
      }
    }
  });

  // --- 前后端一致性 ---

  describe('前后端积分计算一致性', () => {
    it('所有模型基础积分 >= 1（不应有 0 积分模型）', () => {
      const allModelIds = Object.keys(IMAGE_MODELS);
      for (const modelId of allModelIds) {
        const credits = calculateImageCredits(modelId, {});
        expect(credits).toBeGreaterThanOrEqual(1);
      }
    });
  });
});
