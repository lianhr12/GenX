import type { ModelPageConfig } from './types';

export const sora2Config: ModelPageConfig = {
  slug: 'sora-2',
  name: 'Sora 2',
  provider: 'OpenAI',
  category: 'video',
  seo: {
    titleKey: 'seo.title',
    descriptionKey: 'seo.description',
    keywords: [
      'sora 2',
      'openai sora 2',
      'sora 2 ai video generator',
      'sora 2 text to video',
      'sora 2 free',
      'sora 2 online',
      'openai video model',
      'sora 2 cinematic',
      'ai video generator',
      'text to video ai',
    ],
  },
  descriptionKey: 'description',
  taglineKey: 'tagline',
  badges: ['new', 'popular'],
  ctaLink: '/create/text-to-video?model=sora-2-preview',
  supportedModes: ['text-to-video', 'image-to-video'],
  gradient: 'from-violet-600 via-purple-500 to-fuchsia-400',
  stats: [
    { labelKey: 'stats.resolution', value: '1080p' },
    { labelKey: 'stats.physics', value: 'Realistic' },
    { labelKey: 'stats.speed', value: '~90s' },
    { labelKey: 'stats.credits', value: '45' },
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
      titleKey: 'features.physics.title',
      descriptionKey: 'features.physics.description',
    },
    {
      titleKey: 'features.audio.title',
      descriptionKey: 'features.audio.description',
    },
    {
      titleKey: 'features.consistency.title',
      descriptionKey: 'features.consistency.description',
    },
    {
      titleKey: 'features.cameo.title',
      descriptionKey: 'features.cameo.description',
    },
  ],
  variants: [
    {
      id: 'sora-2-preview',
      name: 'Sora 2 Preview',
      speed: '~90s',
      quality: 'Good',
      startingCredits: 45,
      features: ['text-to-video'],
    },
    {
      id: 'sora-2-pro',
      name: 'Sora 2 Pro',
      speed: '~120s',
      quality: 'Best',
      startingCredits: 69,
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
      titleKey: 'useCases.cinema.title',
      descriptionKey: 'useCases.cinema.description',
    },
    {
      titleKey: 'useCases.animation.title',
      descriptionKey: 'useCases.animation.description',
    },
    {
      titleKey: 'useCases.storytelling.title',
      descriptionKey: 'useCases.storytelling.description',
    },
  ],
  faq: [
    {
      questionKey: 'faq.what.question',
      answerKey: 'faq.what.answer',
    },
    {
      questionKey: 'faq.difference.question',
      answerKey: 'faq.difference.answer',
    },
    {
      questionKey: 'faq.free.question',
      answerKey: 'faq.free.answer',
    },
    {
      questionKey: 'faq.professional.question',
      answerKey: 'faq.professional.answer',
    },
  ],
  relatedSlugs: ['veo-3', 'seedance', 'kling', 'hailuo'],
  i18nPrefix: 'ModelPage.sora2',
};
