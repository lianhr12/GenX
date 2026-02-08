import type { ModelPageConfig } from './types';

export const wanConfig: ModelPageConfig = {
  slug: 'wan',
  name: 'Wan AI',
  provider: 'Alibaba',
  category: 'video',
  seo: {
    titleKey: 'seo.title',
    descriptionKey: 'seo.description',
    keywords: [
      'wan ai',
      'wan ai video generator',
      'wan 2.6',
      'wan ai free',
      'wan ai online',
      'alibaba wan ai',
      'wan text to video',
      'wan image to video',
      'ai video generator',
      'wan ai alternative',
    ],
  },
  descriptionKey: 'description',
  taglineKey: 'tagline',
  badges: ['new'],
  ctaLink: '/create/text-to-video?model=wan2.6-text-to-video',
  supportedModes: [
    'text-to-video',
    'image-to-video',
    'text-to-image',
    'image-to-image',
    'reference-to-video',
  ],
  gradient: 'from-amber-500 via-orange-500 to-red-500',
  stats: [
    { labelKey: 'stats.params', value: '14B' },
    { labelKey: 'stats.styles', value: '100+' },
    { labelKey: 'stats.speed', value: '~60s' },
    { labelKey: 'stats.credits', value: '26' },
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
      titleKey: 'features.generation.title',
      descriptionKey: 'features.generation.description',
    },
    {
      titleKey: 'features.styles.title',
      descriptionKey: 'features.styles.description',
    },
    {
      titleKey: 'features.multiObject.title',
      descriptionKey: 'features.multiObject.description',
    },
    {
      titleKey: 'features.openSource.title',
      descriptionKey: 'features.openSource.description',
    },
  ],
  variants: [
    {
      id: 'wan2.6-text-to-video',
      name: 'Wan 2.6 T2V',
      speed: '~60s',
      quality: 'Best',
      startingCredits: 26,
      features: ['text-to-video', 'audio-url'],
    },
    {
      id: 'wan2.6-image-to-video',
      name: 'Wan 2.6 I2V',
      speed: '~60s',
      quality: 'Best',
      startingCredits: 26,
      features: ['image-to-video', 'audio-url'],
    },
    {
      id: 'wan2.5-text-to-video',
      name: 'Wan 2.5 T2V',
      speed: '~50s',
      quality: 'Good',
      startingCredits: 20,
      features: ['text-to-video'],
    },
    {
      id: 'wan2.5-image-to-video',
      name: 'Wan 2.5 I2V',
      speed: '~50s',
      quality: 'Good',
      startingCredits: 13,
      features: ['image-to-video'],
    },
  ],
  howToUse: [
    { titleKey: 'howToUse.0.title', descriptionKey: 'howToUse.0.description' },
    { titleKey: 'howToUse.1.title', descriptionKey: 'howToUse.1.description' },
    { titleKey: 'howToUse.2.title', descriptionKey: 'howToUse.2.description' },
  ],
  useCases: [
    {
      titleKey: 'useCases.creative.title',
      descriptionKey: 'useCases.creative.description',
    },
    {
      titleKey: 'useCases.social.title',
      descriptionKey: 'useCases.social.description',
    },
    {
      titleKey: 'useCases.education.title',
      descriptionKey: 'useCases.education.description',
    },
  ],
  faq: [
    {
      questionKey: 'faq.what.question',
      answerKey: 'faq.what.answer',
    },
    {
      questionKey: 'faq.unique.question',
      answerKey: 'faq.unique.answer',
    },
    {
      questionKey: 'faq.free.question',
      answerKey: 'faq.free.answer',
    },
    {
      questionKey: 'faq.speed.question',
      answerKey: 'faq.speed.answer',
    },
  ],
  relatedSlugs: ['veo-3', 'sora-2', 'seedance', 'kling'],
  i18nPrefix: 'ModelPage.wan',
};
