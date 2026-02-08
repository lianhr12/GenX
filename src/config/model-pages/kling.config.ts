import type { ModelPageConfig } from './types';

export const klingConfig: ModelPageConfig = {
  slug: 'kling',
  name: 'Kling AI',
  provider: 'Kuaishou',
  category: 'video',
  seo: {
    titleKey: 'seo.title',
    descriptionKey: 'seo.description',
    keywords: [
      'kling ai',
      'kling ai video generator',
      'kling 2',
      'kling ai free',
      'kling ai online',
      'kling text to video',
      'kling image to video',
      'kling ai alternative',
      'ai video generator',
      'kuaishou ai',
    ],
  },
  descriptionKey: 'description',
  taglineKey: 'tagline',
  badges: ['popular'],
  ctaLink: '/create/text-to-video?model=kling-2',
  supportedModes: ['text-to-video', 'image-to-video'],
  gradient: 'from-orange-500 via-red-500 to-pink-500',
  stats: [
    { labelKey: 'stats.resolution', value: '1080p' },
    { labelKey: 'stats.fps', value: '30fps' },
    { labelKey: 'stats.speed', value: '~70s' },
    { labelKey: 'stats.credits', value: '30' },
  ],
  showcase: [
    { titleKey: 'showcase.0.title', descriptionKey: 'showcase.0.description' },
    { titleKey: 'showcase.1.title', descriptionKey: 'showcase.1.description' },
    { titleKey: 'showcase.2.title', descriptionKey: 'showcase.2.description' },
    { titleKey: 'showcase.3.title', descriptionKey: 'showcase.3.description' },
    { titleKey: 'showcase.4.title', descriptionKey: 'showcase.4.description' },
    { titleKey: 'showcase.5.title', descriptionKey: 'showcase.5.description' },
  ],
  features: [
    {
      titleKey: 'features.cinematic.title',
      descriptionKey: 'features.cinematic.description',
    },
    {
      titleKey: 'features.lipSync.title',
      descriptionKey: 'features.lipSync.description',
    },
    {
      titleKey: 'features.motionBrush.title',
      descriptionKey: 'features.motionBrush.description',
    },
    {
      titleKey: 'features.startEndFrame.title',
      descriptionKey: 'features.startEndFrame.description',
    },
  ],
  variants: [
    {
      id: 'kling-2',
      name: 'Kling 2',
      speed: '~70s',
      quality: 'Best',
      startingCredits: 30,
      features: ['text-to-video'],
    },
    {
      id: 'kling-o1-image-to-video',
      name: 'Kling O1 I2V',
      speed: '~60s',
      quality: 'High',
      startingCredits: 40,
      features: ['image-to-video', 'FLF'],
    },
  ],
  howToUse: [
    { titleKey: 'howToUse.0.title', descriptionKey: 'howToUse.0.description' },
    { titleKey: 'howToUse.1.title', descriptionKey: 'howToUse.1.description' },
    { titleKey: 'howToUse.2.title', descriptionKey: 'howToUse.2.description' },
  ],
  useCases: [
    {
      titleKey: 'useCases.social.title',
      descriptionKey: 'useCases.social.description',
    },
    {
      titleKey: 'useCases.marketing.title',
      descriptionKey: 'useCases.marketing.description',
    },
    {
      titleKey: 'useCases.creative.title',
      descriptionKey: 'useCases.creative.description',
    },
  ],
  faq: [
    {
      questionKey: 'faq.what.question',
      answerKey: 'faq.what.answer',
    },
    {
      questionKey: 'faq.free.question',
      answerKey: 'faq.free.answer',
    },
    {
      questionKey: 'faq.types.question',
      answerKey: 'faq.types.answer',
    },
    {
      questionKey: 'faq.speed.question',
      answerKey: 'faq.speed.answer',
    },
  ],
  relatedSlugs: ['veo-3', 'sora-2', 'hailuo', 'seedance'],
  i18nPrefix: 'ModelPage.kling',
};
