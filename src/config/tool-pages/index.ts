/**
 * Tool Page Configuration Export
 *
 * Provides unified config access interface with route-based lookup
 */

import { imageToImageConfig } from './image-to-image.config';
import { imageToVideoConfig } from './image-to-video.config';
import { imageConfig } from './image.config';
import { referenceToVideoConfig } from './reference-to-video.config';
import { textToVideoConfig } from './text-to-video.config';
import type {
  GeneratorConfig,
  PageSEOConfig,
  ToolLandingConfig,
  ToolPageConfig,
} from './types';

// Export types
export type {
  ToolPageConfig,
  ToolLandingConfig,
  GeneratorConfig,
  PageSEOConfig,
} from './types';

// Export configs
export { imageConfig } from './image.config';
export { imageToImageConfig } from './image-to-image.config';
export { imageToVideoConfig } from './image-to-video.config';
export { textToVideoConfig } from './text-to-video.config';
export { referenceToVideoConfig } from './reference-to-video.config';

// ============================================================================
// Route to Config Mapping
// ============================================================================

const toolPageConfigs = {
  image: imageConfig,
  'image-to-image': imageToImageConfig,
  'image-to-video': imageToVideoConfig,
  'text-to-video': textToVideoConfig,
  'reference-to-video': referenceToVideoConfig,
} as const;

export type ToolPageRoute = keyof typeof toolPageConfigs;

/**
 * Get tool page config by route
 *
 * @param route - Tool page route
 * @returns Tool page config, throws error if not found
 *
 * @example
 * ```ts
 * const config = getToolPageConfig("image-to-video");
 * console.log(config.seo.title);
 * ```
 */
export function getToolPageConfig(route: ToolPageRoute): ToolPageConfig {
  const config = toolPageConfigs[route];
  if (!config) {
    throw new Error(`Unknown tool route: ${route}`);
  }
  return config;
}

/**
 * Get all tool page routes
 */
export function getToolPageRoutes(): ToolPageRoute[] {
  return Object.keys(toolPageConfigs) as ToolPageRoute[];
}

/**
 * Check if route is a valid tool page
 */
export function isValidToolRoute(route: string): route is ToolPageRoute {
  return route in toolPageConfigs;
}
