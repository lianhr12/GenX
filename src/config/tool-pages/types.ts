/**
 * Tool Page Configuration Types
 */

// ============================================================================
// Page SEO Config
// ============================================================================

export interface PageSEOConfig {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
}

// ============================================================================
// Generator Config
// ============================================================================

export interface GeneratorConfig {
  // Generation mode
  mode: 'text-to-video' | 'image-to-video' | 'reference-to-video' | 'image-to-image';

  // UI mode
  uiMode: 'full' | 'compact';

  // Default values
  defaults: {
    model?: string;
    duration?: number;
    aspectRatio?: string;
    outputNumber?: number;
  };

  // Model configuration
  models: {
    available: string[];
    default?: string;
  };

  // Feature display control
  features: {
    showImageUpload: boolean;
    showPromptInput: boolean;
    showModeSelector?: boolean;
  };

  // Prompt placeholder
  promptPlaceholder?: string;

  // Parameter settings control
  settings: {
    showDuration: boolean;
    showAspectRatio: boolean;
    showQuality: boolean;
    showOutputNumber: boolean;
    showAudioGeneration?: boolean;

    // Available options
    durations?: number[];
    aspectRatios?: string[];
    qualities?: string[];
    outputNumbers?: number[];
  };
}

// ============================================================================
// Landing Page Config
// ============================================================================

export interface ToolLandingConfig {
  // Hero section
  hero: {
    title: string;
    description: string;
    ctaText: string;
    ctaSubtext?: string;
  };

  // Example videos
  examples: Array<{
    thumbnail: string;
    title: string;
    prompt: string;
    videoUrl?: string;
  }>;

  // Features list
  features: string[];

  // Supported models display
  supportedModels: Array<{
    name: string;
    provider: string;
    color: string;
  }>;

  // Statistics (optional)
  stats?: {
    videosGenerated?: string;
    usersCount?: string;
    avgRating?: number;
  };
}

// ============================================================================
// Complete Tool Page Config
// ============================================================================

export interface ToolPageConfig {
  // Page SEO info
  seo: PageSEOConfig;

  // Generator config
  generator: GeneratorConfig;

  // Landing page config (shown when not logged in)
  landing: ToolLandingConfig;

  // i18n key prefix
  i18nPrefix: string;
}

// ============================================================================
// Model Preset Config (for extension)
// ============================================================================

export interface ModelPresetConfig {
  id: string;
  name: string;
  provider: string;
  creditCost: number;

  // Supported features
  supports: {
    textToVideo: boolean;
    imageToVideo: boolean;
    referenceVideo: boolean;
  };

  // Parameter limits
  limits: {
    maxDuration?: number;
    maxResolution?: string;
    minImages?: number;
    maxImages?: number;
  };

  // Available parameters
  available: {
    durations?: number[];
    aspectRatios?: string[];
    qualities?: string[];
  };
}
