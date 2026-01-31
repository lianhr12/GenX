import type { ToolPageConfig } from './types';

/**
 * Text to Video Tool Page Config
 */
export const textToVideoConfig: ToolPageConfig = {
  // SEO config
  seo: {
    title: 'Text to Video - Create Videos from Text with AI',
    description:
      'Transform your text descriptions into stunning videos using AI. Simply describe what you want, and watch Sora 2, Veo 3.1, and other AI models bring your vision to life.',
    keywords: [
      'text to video',
      'ai video generator',
      'video from text',
      'ai video creation',
      'sora 2',
      'veo 3.1',
      'text to video ai',
    ],
    ogImage: '/og-text-to-video.jpg',
  },

  // Generator config
  generator: {
    mode: 'text-to-video',
    uiMode: 'compact',

    defaults: {
      model: 'seedance-1.5-pro',
      duration: 5,
      aspectRatio: '16:9',
      outputNumber: 1,
    },

    models: {
      available: [
        'seedance-1.5-pro',
        'doubao-seedance-1.0-pro-fast',
        'sora-2-preview',
        'sora-2-pro',
        'veo3.1-fast',
        'veo3.1-generate-preview',
        'veo3.1-pro',
        'wan2.6-text-to-video',
        'wan2.5-text-to-video',
        'MiniMax-Hailuo-02',
        'MiniMax-Hailuo-2.3',
        'kling-2',
      ],
      default: 'seedance-1.5-pro',
    },

    features: {
      showImageUpload: false,
      showPromptInput: true,
      showModeSelector: false,
    },

    promptPlaceholder:
      "Describe the video you want to create... e.g., 'A serene mountain landscape at sunset with birds flying'",

    settings: {
      showDuration: true,
      showAspectRatio: true,
      showQuality: true,
      showOutputNumber: false,
      showAudioGeneration: true,

      durations: [4, 5, 6, 8, 10, 12, 15],
      aspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9'],
      qualities: ['480p', '720p', '1080p'],
    },
  },

  // Landing page config
  landing: {
    hero: {
      title: 'Create Stunning Videos from Text',
      description:
        'Describe your vision in plain text and let AI bring it to life. From cinematic scenes to product showcases, the possibilities are endless.',
      ctaText: 'Start Creating',
      ctaSubtext: '15 free credits to try',
    },

    examples: [
      {
        thumbnail:
          'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
        title: 'Cinematic Mountain Scene',
        prompt:
          'A majestic mountain range at golden hour, camera slowly flying through valleys',
      },
      {
        thumbnail:
          'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&q=80',
        title: 'Urban City Timelapse',
        prompt:
          'New York City timelapse at night, cars leaving light trails, buildings glowing',
      },
      {
        thumbnail:
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
        title: 'Ocean Sunset',
        prompt:
          'Calm ocean waves at sunset, camera slowly zooming out, peaceful atmosphere',
      },
    ],

    features: [
      'Simply describe what you want to see',
      'Access to cutting-edge AI models (Sora 2, Veo 3.1, etc.)',
      'Cinematic quality up to 1080p',
      'Generate audio and sound effects automatically',
      'Multiple aspect ratios for any platform',
    ],

    supportedModels: [
      { name: 'Sora 2 Pro', provider: 'OpenAI', color: '#000000' },
      { name: 'Sora 2 Preview', provider: 'OpenAI', color: '#333333' },
      { name: 'Veo 3.1 Fast', provider: 'Google', color: '#4285f4' },
      { name: 'Veo 3.1 Pro', provider: 'Google', color: '#1a73e8' },
      { name: 'Wan 2.6', provider: 'Alibaba', color: '#8b5cf6' },
      { name: 'Wan 2.5', provider: 'Alibaba', color: '#a78bfa' },
      { name: 'Seedance 1.5 Pro', provider: 'ByteDance', color: '#ec4899' },
      { name: 'Hailuo 02', provider: 'MiniMax', color: '#f97316' },
      { name: 'Hailuo 2.3', provider: 'MiniMax', color: '#fb923c' },
      { name: 'Kling 2', provider: 'Kuaishou', color: '#f59e0b' },
    ],

    stats: {
      videosGenerated: '1M+',
      usersCount: '100K+',
      avgRating: 4.9,
    },
  },

  // i18n key prefix
  i18nPrefix: 'ToolPage.TextToVideo',
};
