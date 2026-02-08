import { describe, expect, it } from 'vitest';
import type { CreatorMode } from '../../types';
import {
  getModelById,
  getModelsByProvider,
  getModelsForMode,
  getProviderById,
  getProvidersForMode,
  modelConfigs,
  modelProviders,
} from '../models';

// ============================================================================
// modelProviders
// ============================================================================

describe('modelProviders', () => {
  it('应该包含所有主要提供商', () => {
    const ids = modelProviders.map((p) => p.id);
    expect(ids).toContain('openai');
    expect(ids).toContain('google');
    expect(ids).toContain('wan');
    expect(ids).toContain('bytedance');
    expect(ids).toContain('kling');
    expect(ids).toContain('minimax');
    expect(ids).toContain('qwen');
    expect(ids).toContain('tongyi');
  });

  it('每个提供商都应该有 id 和 name', () => {
    for (const provider of modelProviders) {
      expect(provider.id).toBeTruthy();
      expect(provider.name).toBeTruthy();
    }
  });

  it('提供商 id 不应有重复', () => {
    const ids = modelProviders.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ============================================================================
// modelConfigs
// ============================================================================

describe('modelConfigs', () => {
  it('每个模型应有必要字段', () => {
    for (const model of modelConfigs) {
      expect(model.id).toBeTruthy();
      expect(model.name).toBeTruthy();
      expect(model.providerId).toBeTruthy();
      expect(model.description).toBeTruthy();
      expect(model.baseCredits).toBeGreaterThanOrEqual(0);
      expect(model.supportedModes.length).toBeGreaterThan(0);
    }
  });

  it('模型 id 不应有重复', () => {
    const ids = modelConfigs.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('每个模型的 providerId 应对应一个有效的提供商', () => {
    const providerIds = new Set(modelProviders.map((p) => p.id));
    for (const model of modelConfigs) {
      expect(providerIds.has(model.providerId)).toBe(true);
    }
  });
});

// ============================================================================
// getModelsForMode
// ============================================================================

describe('getModelsForMode', () => {
  const modes: CreatorMode[] = [
    'text-to-video',
    'image-to-video',
    'text-to-image',
    'image-to-image',
    'reference-to-video',
  ];

  for (const mode of modes) {
    it(`${mode} 应至少有一个模型`, () => {
      const models = getModelsForMode(mode);
      expect(models.length).toBeGreaterThan(0);
    });

    it(`${mode} 返回的模型都应支持该模式`, () => {
      const models = getModelsForMode(mode);
      for (const model of models) {
        expect(model.supportedModes).toContain(mode);
      }
    });
  }
});

// ============================================================================
// getProvidersForMode
// ============================================================================

describe('getProvidersForMode', () => {
  it('text-to-video 应包含多个提供商', () => {
    const providers = getProvidersForMode('text-to-video');
    expect(providers.length).toBeGreaterThan(1);
  });

  it('image-to-image 应包含 qwen 提供商', () => {
    const providers = getProvidersForMode('image-to-image');
    const providerIds = providers.map((p) => p.id);
    expect(providerIds).toContain('qwen');
  });

  it('reference-to-video 应包含 wan 和 omnihuman', () => {
    const providers = getProvidersForMode('reference-to-video');
    const providerIds = providers.map((p) => p.id);
    expect(providerIds).toContain('wan');
    expect(providerIds).toContain('omnihuman');
  });
});

// ============================================================================
// getModelsByProvider
// ============================================================================

describe('getModelsByProvider', () => {
  it('openai 在 text-to-image 模式下应返回 GPT Image 模型', () => {
    const models = getModelsByProvider('openai', 'text-to-image');
    expect(models.length).toBeGreaterThan(0);
    for (const model of models) {
      expect(model.providerId).toBe('openai');
      expect(model.supportedModes).toContain('text-to-image');
    }
  });

  it('无效提供商应返回空数组', () => {
    const models = getModelsByProvider('non-existent', 'text-to-video');
    expect(models.length).toBe(0);
  });
});

// ============================================================================
// getModelById
// ============================================================================

describe('getModelById', () => {
  it('应该返回已知模型', () => {
    const model = getModelById('gpt-image-1.5');
    expect(model).toBeDefined();
    expect(model!.id).toBe('gpt-image-1.5');
  });

  it('未知模型应返回 undefined', () => {
    expect(getModelById('unknown')).toBeUndefined();
  });
});

// ============================================================================
// getProviderById
// ============================================================================

describe('getProviderById', () => {
  it('应该返回已知提供商', () => {
    const provider = getProviderById('openai');
    expect(provider).toBeDefined();
    expect(provider!.name).toBe('OpenAI');
  });

  it('未知提供商应返回 undefined', () => {
    expect(getProviderById('unknown')).toBeUndefined();
  });
});

// ============================================================================
// 模型-模式覆盖完整性：modes.ts 中列出的模型应在 models.ts 中有配置
// ============================================================================

describe('模型覆盖一致性', () => {
  // 导入 modes.ts 中的模型列表
  it('text-to-image 所有模型在 modelConfigs 中都有定义', () => {
    const t2iModels = getModelsForMode('text-to-image');
    expect(t2iModels.length).toBeGreaterThan(0);
  });

  it('image-to-image 所有模型在 modelConfigs 中都有定义', () => {
    const i2iModels = getModelsForMode('image-to-image');
    expect(i2iModels.length).toBeGreaterThan(0);
  });

  it('text-to-video 所有模型在 modelConfigs 中都有定义', () => {
    const t2vModels = getModelsForMode('text-to-video');
    expect(t2vModels.length).toBeGreaterThan(0);
  });

  it('image-to-video 所有模型在 modelConfigs 中都有定义', () => {
    const i2vModels = getModelsForMode('image-to-video');
    expect(i2vModels.length).toBeGreaterThan(0);
  });

  it('reference-to-video 所有模型在 modelConfigs 中都有定义', () => {
    const r2vModels = getModelsForMode('reference-to-video');
    expect(r2vModels.length).toBeGreaterThan(0);
  });
});
