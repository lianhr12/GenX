import type { ModelPageConfig } from './types';

export const hailuoConfig: ModelPageConfig = {
  slug: 'hailuo',
  name: 'Hailuo AI',
  provider: 'MiniMax',
  category: 'video',
  seo: {
    titleKey: 'seo.title',
    descriptionKey: 'seo.description',
    keywords: [
      'hailuo ai',
      'minimax hailuo',
      'hailuo ai video generator',
      'hailuo ai free',
      'hailuo text to video',
      'hailuo image to video',
      'minimax ai video',
      'hailuo ai online',
      'ai video generator',
      'hailuo alternative',
    ],
  },
  descriptionKey: 'description',
  taglineKey: 'tagline',
  badges: ['popular'],
  ctaLink: '/create/text-to-video?model=MiniMax-Hailuo-2.3',
  supportedModes: ['text-to-video', 'image-to-video'],
  gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
  stats: [
    { labelKey: 'stats.speed', value: '<30s' },
    { labelKey: 'stats.modes', value: 'T2V+I2V' },
    { labelKey: 'stats.camera', value: 'Yes' },
    { labelKey: 'stats.credits', value: '18' },
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
      titleKey: 'features.speed.title',
      descriptionKey: 'features.speed.description',
    },
    {
      titleKey: 'features.i2v.title',
      descriptionKey: 'features.i2v.description',
    },
    {
      titleKey: 'features.t2v.title',
      descriptionKey: 'features.t2v.description',
    },
    {
      titleKey: 'features.camera.title',
      descriptionKey: 'features.camera.description',
    },
  ],
  variants: [
    {
      id: 'MiniMax-Hailuo-2.3',
      name: 'Hailuo 2.3',
      speed: '~55s',
      quality: 'Best',
      startingCredits: 18,
      features: ['text-to-video', 'image-to-video', 'camera-control'],
    },
    {
      id: 'MiniMax-Hailuo-02',
      name: 'Hailuo 02',
      speed: '~50s',
      quality: 'High',
      startingCredits: 18,
      features: ['text-to-video', 'image-to-video'],
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
      titleKey: 'useCases.education.title',
      descriptionKey: 'useCases.education.description',
    },
    {
      titleKey: 'useCases.marketing.title',
      descriptionKey: 'useCases.marketing.description',
    },
  ],
  faq: [
    {
      questionKey: 'faq.what.question',
      answerKey: 'faq.what.answer',
    },
    {
      questionKey: 'faq.how.question',
      answerKey: 'faq.how.answer',
    },
    {
      questionKey: 'faq.free.question',
      answerKey: 'faq.free.answer',
    },
    {
      questionKey: 'faq.resolution.question',
      answerKey: 'faq.resolution.answer',
    },
  ],
  relatedSlugs: ['veo-3', 'sora-2', 'kling', 'seedance'],
  i18nPrefix: 'ModelPage.hailuo',
};
