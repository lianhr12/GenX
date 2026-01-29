import type { ToolPageConfig } from './types';

/**
 * Image Generation Tool Page Config
 */
export const imageConfig: ToolPageConfig = {
  // SEO config
  seo: {
    title: 'AI Image Generator - Create Stunning Images with AI',
    description:
      'Generate beautiful images from text descriptions using multiple AI models. Compare results from OpenAI, Replicate, Fal, and more.',
    keywords: [
      'ai image generator',
      'text to image',
      'ai art generator',
      'dall-e',
      'stable diffusion',
      'midjourney alternative',
      'ai image creation',
    ],
    ogImage: '/og-image-generator.jpg',
  },

  // Generator config
  generator: {
    mode: 'image-to-image',
    uiMode: 'compact',

    defaults: {
      model: 'gpt-image-1.5',
      aspectRatio: '1:1',
      outputNumber: 1,
    },

    models: {
      available: [
        'gpt-image-1.5',
        'gpt-image-1.5-lite',
        'seedream-4.5',
        'nanobanana-pro',
        'wan2.5',
      ],
      default: 'gpt-image-1.5',
    },

    features: {
      showImageUpload: false,
      showPromptInput: true,
      showModeSelector: true,
    },

    promptPlaceholder:
      "Describe the image you want to create... e.g., 'A futuristic city at sunset with flying cars'",

    settings: {
      showDuration: false,
      showAspectRatio: true,
      showQuality: true,
      showOutputNumber: true,

      aspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4'],
      qualities: ['standard', 'hd'],
      outputNumbers: [1, 2, 4],
    },
  },

  // Landing page config
  landing: {
    hero: {
      title: 'Create Stunning Images with AI',
      description:
        'Transform your ideas into beautiful images using cutting-edge AI models. Simply describe what you want and watch AI bring it to life.',
      ctaText: 'Start Creating',
      ctaSubtext: '15 free credits to try',
    },

    examples: [
      {
        thumbnail:
          'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80',
        title: 'Fantasy Landscape',
        prompt:
          'A mystical forest with glowing mushrooms and floating lanterns',
      },
      {
        thumbnail:
          'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
        title: 'Tech Abstract',
        prompt:
          'Abstract digital art with flowing circuits and holographic elements',
      },
      {
        thumbnail:
          'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80',
        title: 'Portrait Art',
        prompt:
          'Cinematic portrait with dramatic lighting and bokeh background',
      },
    ],

    features: [
      'Generate images from text descriptions',
      'Multiple AI models to choose from',
      'Compare results side by side',
      'High resolution output up to 4K',
      'Various aspect ratios supported',
    ],

    supportedModels: [
      { name: 'DALL-E 3', provider: 'OpenAI', color: '#000000' },
      { name: 'Flux 1.1 Pro', provider: 'Black Forest', color: '#8b5cf6' },
      { name: 'SD 3', provider: 'Stability AI', color: '#ec4899' },
      { name: 'Ideogram', provider: 'Ideogram', color: '#f59e0b' },
    ],

    stats: {
      videosGenerated: '500K+',
      usersCount: '50K+',
      avgRating: 4.8,
    },
  },

  // i18n key prefix
  i18nPrefix: 'ToolPage.Image',
};
