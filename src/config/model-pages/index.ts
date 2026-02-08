import { hailuoConfig } from './hailuo.config';
import { klingConfig } from './kling.config';
import { omnihumanConfig } from './omnihuman.config';
import { seedanceConfig } from './seedance.config';
import { sora2Config } from './sora-2.config';
import type { ModelCategory, ModelPageConfig } from './types';
import { veo3Config } from './veo-3.config';
import { wanConfig } from './wan.config';

/** All model page configs */
export const modelPageConfigs: ModelPageConfig[] = [
  veo3Config,
  sora2Config,
  klingConfig,
  hailuoConfig,
  seedanceConfig,
  wanConfig,
  omnihumanConfig,
];

/** Map from slug to config */
const modelPageMap = new Map<string, ModelPageConfig>(
  modelPageConfigs.map((config) => [config.slug, config]),
);

/** All valid model slugs */
export const validModelSlugs = modelPageConfigs.map((c) => c.slug);

/** Get model page config by slug */
export function getModelPageBySlug(
  slug: string,
): ModelPageConfig | undefined {
  return modelPageMap.get(slug);
}

/** Get model page configs by category */
export function getModelPagesByCategory(
  category: ModelCategory,
): ModelPageConfig[] {
  return modelPageConfigs.filter((c) => c.category === category);
}

/** Get video model configs */
export function getVideoModelPages(): ModelPageConfig[] {
  return getModelPagesByCategory('video');
}

/** Get image model configs */
export function getImageModelPages(): ModelPageConfig[] {
  return getModelPagesByCategory('image');
}

export type { ModelCategory, ModelPageConfig } from './types';
