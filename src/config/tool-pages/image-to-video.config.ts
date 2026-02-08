import type { ToolPageConfig } from './types';

/**
 * Image to Video Tool Page Config
 */
export const imageToVideoConfig: ToolPageConfig = {
  // SEO config
  seo: {
    title: 'Image to Video - Transform Photos into AI Videos',
    description:
      'Convert your images into stunning videos using AI. Upload any photo and watch it come to life with smooth, realistic motion powered by Sora 2, Veo 3.1, and more.',
    keywords: [
      'image to video',
      'photo animation',
      'ai video generator',
      'picture to video',
      'image animation',
      'sora 2',
      'veo 3.1',
    ],
    ogImage: '/og-image-to-video.jpg',
  },

  // Generator config
  generator: {
    mode: 'image-to-video',
    uiMode: 'compact',

    defaults: {
      model: 'wan2.6-image-to-video',
      duration: 5,
      aspectRatio: '16:9',
      outputNumber: 1,
    },

    models: {
      available: [
        'wan2.6-image-to-video',
        'wan2.5-image-to-video',
        'seedance-1.5-pro',
        'doubao-seedance-1.0-pro-fast',
        'sora-2-preview',
        'sora-2-pro',
        'veo-3.1-fast-generate-preview',
        'veo-3.1-generate-preview',
        'veo-3.1-pro',
        'MiniMax-Hailuo-02',
        'MiniMax-Hailuo-2.3',
        'MiniMax-Hailuo-2.3-Fast',
        'kling-o1-image-to-video',
      ],
      default: 'wan2.6-image-to-video',
    },

    features: {
      showImageUpload: true,
      showPromptInput: true,
      showModeSelector: false,
    },

    promptPlaceholder:
      'Describe the video you want to create from this image...',

    settings: {
      showDuration: true,
      showAspectRatio: true,
      showQuality: true,
      showOutputNumber: false,
      showAudioGeneration: false,

      durations: [5, 6, 8, 10, 12, 15],
      aspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9'],
      qualities: ['480p', '720p', '1080p'],
    },
  },

  // Landing page config
  landing: {
    hero: {
      title: 'Transform Your Images into Stunning Videos',
      description:
        'Upload any photo and watch AI bring it to life with smooth, realistic motion. Perfect for social media, marketing, and creative projects.',
      ctaText: 'Get Started Free',
      ctaSubtext: '15 free credits to try',
    },

    examples: [
      {
        thumbnail:
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
        title: 'Photo to Living Scene',
        prompt:
          'A girl walking on the beach, hair flowing in the wind, golden sunset',
      },
      {
        thumbnail:
          'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80',
        title: 'Product Animation',
        prompt:
          'Smartphone rotating on white background with floating particles',
      },
      {
        thumbnail:
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80',
        title: 'Abstract Art Animation',
        prompt:
          'Swirling colors and shapes morphing smoothly, psychedelic style',
      },
    ],

    features: [
      'Upload any photo (JPG, PNG, WEBP up to 10MB)',
      'Multiple AI models for different animation styles',
      'Full HD output up to 1080p resolution',
      'Fast generation in 2-5 minutes',
      'Commercial use rights included',
    ],

    supportedModels: [
      { name: 'Wan 2.6', provider: 'Alibaba', color: '#8b5cf6' },
      { name: 'Wan 2.5 I2V', provider: 'Alibaba', color: '#a78bfa' },
      { name: 'Seedance 1.5 Pro', provider: 'ByteDance', color: '#ec4899' },
      { name: 'Sora 2 Pro', provider: 'OpenAI', color: '#000000' },
      { name: 'Veo 3.1 Fast', provider: 'Google', color: '#4285f4' },
      { name: 'Veo 3.1 Pro', provider: 'Google', color: '#1a73e8' },
      { name: 'Hailuo 02', provider: 'MiniMax', color: '#f97316' },
      { name: 'Hailuo 2.3', provider: 'MiniMax', color: '#fb923c' },
      { name: 'Hailuo 2.3 Fast', provider: 'MiniMax', color: '#fdba74' },
      { name: 'Kling O1 I2V', provider: 'Kuaishou', color: '#f59e0b' },
    ],

    stats: {
      videosGenerated: '500K+',
      usersCount: '50K+',
      avgRating: 4.8,
    },
  },

  // i18n key prefix
  i18nPrefix: 'ToolPage.ImageToVideo',
};
