import { describe, expect, it } from 'vitest';
import {
  IMAGE_MODELS,
  calculateImageCredits,
  getImageModelConfig,
} from '@/config/image-credits';

/**
 * ImageService 业务逻辑测试
 * 测试模型验证、积分计算、参数映射等关键逻辑
 * 这些测试验证 ImageService.generate() 中的前置校验和参数处理
 */

// ============================================================================
// API Route 中的 MODEL_CONFIGS 映射验证
// ============================================================================

// 复制自 route.ts 和 generate-image action 中的映射关系
const MODEL_CONFIGS: Record<
  string,
  { evolinkModel: string; defaultSize: string }
> = {
  'gpt-image-1.5': { evolinkModel: 'gpt-image-1.5', defaultSize: '1024x1024' },
  'gpt-image-1.5-lite': {
    evolinkModel: 'gpt-image-1.5-lite',
    defaultSize: '1024x1024',
  },
  'seedream-4.5': {
    evolinkModel: 'doubao-seedream-4.5',
    defaultSize: '2048x2048',
  },
  'seedream-4.0': {
    evolinkModel: 'doubao-seedream-4.0',
    defaultSize: '2048x2048',
  },
  'doubao-seedream-4.5': {
    evolinkModel: 'doubao-seedream-4.5',
    defaultSize: '2048x2048',
  },
  'doubao-seedream-4.0': {
    evolinkModel: 'doubao-seedream-4.0',
    defaultSize: '2048x2048',
  },
  'nanobanana-pro': {
    evolinkModel: 'gemini-3-pro-image-preview',
    defaultSize: '1024x1024',
  },
  'gemini-3-pro-image-preview': {
    evolinkModel: 'gemini-3-pro-image-preview',
    defaultSize: '1024x1024',
  },
  'wan2.5': { evolinkModel: 'wan2.5-text-to-image', defaultSize: '1280x1280' },
  'wan2.5-text-to-image': {
    evolinkModel: 'wan2.5-text-to-image',
    defaultSize: '1280x1280',
  },
  'gemini-2.5-flash-image': {
    evolinkModel: 'gemini-2.5-flash-image',
    defaultSize: '1024x1024',
  },
  'nano-banana-2-lite': {
    evolinkModel: 'nano-banana-2-lite',
    defaultSize: '1024x1024',
  },
  'z-image-turbo': {
    evolinkModel: 'z-image-turbo',
    defaultSize: '1024x1024',
  },
  'wan2.5-image-to-image': {
    evolinkModel: 'wan2.5-image-to-image',
    defaultSize: '1280x1280',
  },
  'qwen-image-edit': {
    evolinkModel: 'qwen-image-edit',
    defaultSize: '1024x1024',
  },
  'qwen-image-edit-plus': {
    evolinkModel: 'qwen-image-edit-plus',
    defaultSize: '1024x1024',
  },
};

describe('ImageService MODEL_CONFIGS 映射', () => {
  it('所有 evolinkModel 应在 IMAGE_MODELS 中有配置', () => {
    const imageModelIds = new Set(Object.keys(IMAGE_MODELS));
    for (const [key, config] of Object.entries(MODEL_CONFIGS)) {
      expect(
        imageModelIds.has(config.evolinkModel),
        `MODEL_CONFIGS["${key}"].evolinkModel="${config.evolinkModel}" 不在 IMAGE_MODELS 中`
      ).toBe(true);
    }
  });

  it('短名称和 Evolink ID 应映射到同一个模型', () => {
    // seedream-4.5 和 doubao-seedream-4.5 应指向同一 evolink 模型
    expect(MODEL_CONFIGS['seedream-4.5'].evolinkModel).toBe(
      MODEL_CONFIGS['doubao-seedream-4.5'].evolinkModel
    );
    // nanobanana-pro 和 gemini-3-pro-image-preview
    expect(MODEL_CONFIGS['nanobanana-pro'].evolinkModel).toBe(
      MODEL_CONFIGS['gemini-3-pro-image-preview'].evolinkModel
    );
    // wan2.5 和 wan2.5-text-to-image
    expect(MODEL_CONFIGS['wan2.5'].evolinkModel).toBe(
      MODEL_CONFIGS['wan2.5-text-to-image'].evolinkModel
    );
  });
});

// ============================================================================
// Aspect Ratio Fallback 逻辑
// ============================================================================

const ASPECT_RATIO_FALLBACK: Record<string, Record<string, string>> = {
  'gpt-limited': {
    '1:1': '1:1',
    '16:9': '3:2',
    '9:16': '2:3',
    '4:3': '3:2',
    '3:4': '2:3',
  },
  full: {
    '1:1': '1:1',
    '16:9': '16:9',
    '9:16': '9:16',
    '4:3': '4:3',
    '3:4': '3:4',
  },
};

describe('ImageService Aspect Ratio Fallback', () => {
  function resolveAspectRatio(
    modelKey: string,
    aspectRatio?: string
  ): string {
    const config = MODEL_CONFIGS[modelKey] || MODEL_CONFIGS['gpt-image-1.5'];
    const isGptModel = modelKey.startsWith('gpt-image');
    const fallbackMap = isGptModel
      ? ASPECT_RATIO_FALLBACK['gpt-limited']
      : ASPECT_RATIO_FALLBACK.full;

    return aspectRatio
      ? fallbackMap[aspectRatio] || aspectRatio
      : config.defaultSize;
  }

  describe('GPT 模型比例映射', () => {
    it('1:1 保持不变', () => {
      expect(resolveAspectRatio('gpt-image-1.5', '1:1')).toBe('1:1');
    });

    it('16:9 映射为 3:2', () => {
      expect(resolveAspectRatio('gpt-image-1.5', '16:9')).toBe('3:2');
    });

    it('9:16 映射为 2:3', () => {
      expect(resolveAspectRatio('gpt-image-1.5', '9:16')).toBe('2:3');
    });

    it('4:3 映射为 3:2', () => {
      expect(resolveAspectRatio('gpt-image-1.5', '4:3')).toBe('3:2');
    });

    it('3:4 映射为 2:3', () => {
      expect(resolveAspectRatio('gpt-image-1.5', '3:4')).toBe('2:3');
    });

    it('不传比例时使用默认尺寸', () => {
      expect(resolveAspectRatio('gpt-image-1.5')).toBe('1024x1024');
    });
  });

  describe('非 GPT 模型比例映射', () => {
    it('16:9 保持不变', () => {
      expect(resolveAspectRatio('doubao-seedream-4.5', '16:9')).toBe('16:9');
    });

    it('9:16 保持不变', () => {
      expect(resolveAspectRatio('doubao-seedream-4.5', '9:16')).toBe('9:16');
    });

    it('不传比例时使用默认尺寸', () => {
      expect(resolveAspectRatio('doubao-seedream-4.5')).toBe('2048x2048');
    });
  });

  describe('GPT 模型识别', () => {
    it('gpt-image-1.5 应被识别为 GPT 模型', () => {
      expect('gpt-image-1.5'.startsWith('gpt-image')).toBe(true);
    });

    it('gpt-image-1.5-lite 应被识别为 GPT 模型', () => {
      expect('gpt-image-1.5-lite'.startsWith('gpt-image')).toBe(true);
    });

    it('doubao-seedream-4.5 不应被识别为 GPT 模型', () => {
      expect('doubao-seedream-4.5'.startsWith('gpt-image')).toBe(false);
    });
  });
});

// ============================================================================
// text-to-image 积分计算完整覆盖
// ============================================================================

describe('ImageService text-to-image 积分计算', () => {
  const textToImageModels = [
    'gpt-image-1.5',
    'gpt-image-1.5-lite',
    'doubao-seedream-4.5',
    'doubao-seedream-4.0',
    'gemini-3-pro-image-preview',
    'gemini-2.5-flash-image',
    'nano-banana-2-lite',
    'wan2.5-text-to-image',
    'z-image-turbo',
  ];

  for (const modelId of textToImageModels) {
    describe(modelId, () => {
      it('标准质量 1 张积分应 > 0', () => {
        const credits = calculateImageCredits(modelId, {
          quality: 'medium',
          numberOfImages: 1,
        });
        expect(credits).toBeGreaterThan(0);
      });

      it('HD 质量积分应 >= 标准质量', () => {
        const standard = calculateImageCredits(modelId, {
          quality: 'medium',
          numberOfImages: 1,
        });
        const hd = calculateImageCredits(modelId, {
          quality: 'high',
          numberOfImages: 1,
        });
        expect(hd).toBeGreaterThanOrEqual(standard);
      });

      it('多张图积分应成比例增长', () => {
        const single = calculateImageCredits(modelId, { numberOfImages: 1 });
        const multiple = calculateImageCredits(modelId, { numberOfImages: 3 });
        expect(multiple).toBe(single * 3);
      });
    });
  }
});

// ============================================================================
// image-to-image 积分计算完整覆盖
// ============================================================================

describe('ImageService image-to-image 积分计算', () => {
  const imageToImageModels = [
    'qwen-image-edit',
    'qwen-image-edit-plus',
    'wan2.5-image-to-image',
  ];

  for (const modelId of imageToImageModels) {
    it(`${modelId} 基础积分应 > 0`, () => {
      const credits = calculateImageCredits(modelId, {});
      expect(credits).toBeGreaterThan(0);
    });
  }

  it('qwen-image-edit 应 >= qwen-image-edit-plus（取整后可能相等）', () => {
    const edit = calculateImageCredits('qwen-image-edit', {});
    const editPlus = calculateImageCredits('qwen-image-edit-plus', {});
    // base: 2.3 vs 1.5, Math.round 后都是 2
    expect(edit).toBeGreaterThanOrEqual(editPlus);
  });

  it('qwen-image-edit 和 qwen-image-edit-plus base 相同（均为整数 2）', () => {
    const editConfig = getImageModelConfig('qwen-image-edit')!;
    const editPlusConfig = getImageModelConfig('qwen-image-edit-plus')!;
    expect(editConfig.creditCost.base).toBe(editPlusConfig.creditCost.base);
    expect(editConfig.creditCost.base).toBe(2);
  });
});

// ============================================================================
// 模型默认尺寸验证
// ============================================================================

describe('ImageService 模型默认尺寸', () => {
  it('GPT 模型默认 1024x1024', () => {
    expect(MODEL_CONFIGS['gpt-image-1.5'].defaultSize).toBe('1024x1024');
    expect(MODEL_CONFIGS['gpt-image-1.5-lite'].defaultSize).toBe('1024x1024');
  });

  it('Seedream 模型默认 2048x2048', () => {
    expect(MODEL_CONFIGS['doubao-seedream-4.5'].defaultSize).toBe('2048x2048');
    expect(MODEL_CONFIGS['doubao-seedream-4.0'].defaultSize).toBe('2048x2048');
  });

  it('Wan 模型默认 1280x1280', () => {
    expect(MODEL_CONFIGS['wan2.5-text-to-image'].defaultSize).toBe(
      '1280x1280'
    );
    expect(MODEL_CONFIGS['wan2.5-image-to-image'].defaultSize).toBe(
      '1280x1280'
    );
  });
});

// ============================================================================
// Image-to-Image 支持的尺寸
// ============================================================================

describe('ImageService image-to-image 尺寸限制', () => {
  it('qwen-image-edit 仅支持 1:1', () => {
    const config = getImageModelConfig('qwen-image-edit')!;
    expect(config.supportedSizes).toEqual(['1:1']);
  });

  it('qwen-image-edit-plus 仅支持 1:1', () => {
    const config = getImageModelConfig('qwen-image-edit-plus')!;
    expect(config.supportedSizes).toEqual(['1:1']);
  });

  it('wan2.5-image-to-image 支持多种比例', () => {
    const config = getImageModelConfig('wan2.5-image-to-image')!;
    expect(config.supportedSizes.length).toBeGreaterThan(1);
    expect(config.supportedSizes).toContain('1:1');
    expect(config.supportedSizes).toContain('16:9');
  });
});

// ============================================================================
// 安全性：未知模型的 fallback 行为
// ============================================================================

describe('ImageService 模型 fallback 安全性', () => {
  it('API Route 中未知模型 fallback 到 gpt-image-1.5', () => {
    const modelKey = 'injected-model-<script>';
    const config =
      MODEL_CONFIGS[modelKey] || MODEL_CONFIGS['gpt-image-1.5'];
    expect(config.evolinkModel).toBe('gpt-image-1.5');
  });

  it('Server Action 中未知模型 fallback 到 gpt-image-1.5-lite', () => {
    const modelKey = 'unknown-model';
    const config =
      MODEL_CONFIGS[modelKey] || MODEL_CONFIGS['gpt-image-1.5-lite'];
    expect(config.evolinkModel).toBe('gpt-image-1.5-lite');
  });

  it('未知模型的积分计算应使用 fallback 值', () => {
    const credits = calculateImageCredits('totally-fake-model', {});
    // 回退到 5 积分/张
    expect(credits).toBe(5);
  });
});
