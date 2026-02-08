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
        'gemini-2.5-flash-image',
        'nano-banana-2-lite',
        'wan2.5',
        'z-image-turbo',
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
        title: 'Vibe Siren',
        prompt:
          'A glamorous young woman striking a confident, flirtatious pose, stylish high-fashion outfit, soft cinematic lighting, flawless skin and hair details, subtle sensuality, dreamy blurred background, photorealistic, 8K, highly detailed, editorial fashion photography vibe',
      },
      {
        thumbnail:
          'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
        title: 'Neon Phone Clash',
        prompt:
          'A bold young woman leaning out of a public phone booth, thrusting a classic green telephone receiver toward the camera, extreme ultra-wide fisheye perspective from a low angle, dynamic motion and intense depth distortion, rainy urban night with glowing red and blue neon signs reflecting on wet pavement, cold fluorescent booth lighting contrasting with vibrant city lights, stylish winter outfit with chunky boots, gritty lo-fi cinematic vibe, high contrast, film grain, moody atmosphere, photorealistic, ultra-detailed textures, editorial street photography style, 8K.',
      },
      {
        thumbnail:
          'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80',
        title: 'Into the Wild',
        prompt:
          'A lush Western forest landscape in cool teal-green tones, panoramic wide view, dense evergreen trees, misty air, clear streams and mossy rocks, soft diffused daylight, calm and refreshing atmosphere, rich cyan and emerald greens, cinematic composition, ultra-realistic textures, 8K resolution, perfect for desktop wallpaper.',
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
