import type { ModelPageConfig } from './types';

export const seedanceConfig: ModelPageConfig = {
  slug: 'seedance',
  name: 'Seedance',
  provider: 'ByteDance',
  category: 'video',
  seo: {
    titleKey: 'seo.title',
    descriptionKey: 'seo.description',
    keywords: [
      'seedance',
      'bytedance seedance',
      'seedance ai video generator',
      'seedance text to video',
      'seedance free',
      'seedance online',
      'bytedance ai video',
      'seedance 1.5',
      'ai video generator',
      'seedance alternative',
    ],
  },
  descriptionKey: 'description',
  taglineKey: 'tagline',
  badges: ['new'],
  ctaLink: '/create/text-to-video?model=seedance-1.5-pro',
  supportedModes: ['text-to-video', 'image-to-video'],
  gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
  stats: [
    { labelKey: 'stats.styles', value: '10+' },
    { labelKey: 'stats.audio', value: 'Yes' },
    { labelKey: 'stats.speed', value: '~80s' },
    { labelKey: 'stats.credits', value: '9' },
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
      titleKey: 'features.semantic.title',
      descriptionKey: 'features.semantic.description',
    },
    {
      titleKey: 'features.camera.title',
      descriptionKey: 'features.camera.description',
    },
    {
      titleKey: 'features.multiShot.title',
      descriptionKey: 'features.multiShot.description',
    },
    {
      titleKey: 'features.styles.title',
      descriptionKey: 'features.styles.description',
    },
  ],
  variants: [
    {
      id: 'seedance-1.5-pro',
      name: 'Seedance 1.5 Pro',
      speed: '~80s',
      quality: 'Best',
      startingCredits: 9,
      features: ['text-to-video', 'image-to-video', 'audio'],
    },
    {
      id: 'doubao-seedance-1.0-pro-fast',
      name: 'Seedance 1.0 Pro Fast',
      speed: '~45s',
      quality: 'Good',
      startingCredits: 20,
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
      titleKey: 'useCases.shortFilm.title',
      descriptionKey: 'useCases.shortFilm.description',
    },
    {
      titleKey: 'useCases.social.title',
      descriptionKey: 'useCases.social.description',
    },
    {
      titleKey: 'useCases.animation.title',
      descriptionKey: 'useCases.animation.description',
    },
  ],
  faq: [
    {
      questionKey: 'faq.what.question',
      answerKey: 'faq.what.answer',
    },
    {
      questionKey: 'faq.modes.question',
      answerKey: 'faq.modes.answer',
    },
    {
      questionKey: 'faq.multiCamera.question',
      answerKey: 'faq.multiCamera.answer',
    },
    {
      questionKey: 'faq.professional.question',
      answerKey: 'faq.professional.answer',
    },
  ],
  relatedSlugs: ['veo-3', 'sora-2', 'kling', 'hailuo'],
  i18nPrefix: 'ModelPage.seedance',
};
