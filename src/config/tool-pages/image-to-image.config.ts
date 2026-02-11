import type { ToolPageConfig } from './types';

/**
 * Image to Image Tool Page Config
 */
export const imageToImageConfig: ToolPageConfig = {
  // SEO config
  seo: {
    title: 'AI Image Editor - Transform Images with AI',
    description:
      'Edit and transform your images using AI. Upload an image and describe the changes you want to make.',
    keywords: [
      'ai image editor',
      'image to image',
      'ai image transformation',
      'image editing ai',
      'ai photo editor',
      'image modification',
    ],
    ogImage: '/og-image-to-image.jpg',
  },

  // Generator config
  generator: {
    mode: 'image-to-image',
    uiMode: 'compact',

    defaults: {
      model: 'qwen-image-edit-plus',
      outputNumber: 1,
    },

    models: {
      available: [
        'qwen-image-edit-plus',
        'qwen-image-edit',
        'wan2.5-image-to-image',
      ],
      default: 'qwen-image-edit-plus',
    },

    features: {
      showImageUpload: true,
      showPromptInput: true,
      showModeSelector: false,
    },

    promptPlaceholder:
      "Describe the changes you want to make... e.g., 'Change the background to a beach sunset'",

    settings: {
      showDuration: false,
      showAspectRatio: false,
      showQuality: false,
      showOutputNumber: true,

      outputNumbers: [1, 2, 4],
    },
  },

  // Landing page config
  landing: {
    hero: {
      title: 'Transform Images with AI',
      description:
        'Upload any image and describe the changes you want. Our AI will transform your image while preserving its essence.',
      ctaText: 'Start Editing',
      ctaSubtext: '5 free credits to try',
    },

    examples: [
      {
        thumbnail:
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
        title: 'Pet Magazine',
        prompt:
          'A luxurious magazine-style portrait featuring the subject lounging confidently in an elegant vintage armchair. The subject is styled with spa-like accessories such as a white bathrobe, towel turban, or sunglasses, giving a humorous yet refined celebrity aesthetic. Warm studio lighting creates soft shadows and golden highlights. Background remains minimal and classy, emphasizing premium lifestyle photography.',
      },
      {
        thumbnail:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80',
        title: 'Album Cover',
        prompt:
          "Transform the image into a retro-style cassette album set displayed on a full wooden tabletop. The scene must include three key objects arranged naturally: Cassette tape case featuring the subject's portrait, a transparent cassette tape deck/player with visible reels, and wired earphones casually placed on the wooden table. Use realistic lighting and shadows, warm tones, and a nostalgic analogue mood.",
      },
      {
        thumbnail:
          'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
        title: 'CCD Christmas Mood',
        prompt:
          'A vertical two-panel indoor Christmas portrait with CCD film grain texture and candid photography style, soft lighting with gentle glow effect. Person near Christmas tree, smiling and relaxed, background featuring lit Christmas tree with red bows and warm yellow string lights. Fuji film color tone with subtle cool-warm Winter Christmas atmosphere.',
      },
    ],

    features: [
      'Upload and edit any image',
      'AI-powered transformations',
      'Preserve original image quality',
      'Multiple editing styles',
      'Fast processing time',
    ],

    supportedModels: [
      { name: 'Qwen Image Edit Plus', provider: 'Alibaba', color: '#ff6a00' },
      { name: 'Qwen Image Edit', provider: 'Alibaba', color: '#ff6a00' },
      { name: 'Wan 2.5 I2I', provider: 'Alibaba', color: '#8b5cf6' },
    ],

    stats: {
      videosGenerated: '100K+',
      usersCount: '20K+',
      avgRating: 4.7,
    },
  },

  // i18n key prefix
  i18nPrefix: 'ToolPage.ImageToImage',
};
