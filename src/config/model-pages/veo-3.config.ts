import type { ModelPageConfig } from './types';

export const veo3Config: ModelPageConfig = {
  slug: 'veo-3',
  name: 'Veo 3',
  provider: 'Google',
  category: 'video',
  seo: {
    titleKey: 'seo.title',
    descriptionKey: 'seo.description',
    keywords: [
      'veo 3',
      'google veo 3',
      'veo 3 ai video generator',
      'veo 3 text to video',
      'veo 3 free',
      'veo 3 online',
      'google ai video',
      'veo 3 audio generation',
      'ai video generator',
      'text to video ai',
    ],
  },
  descriptionKey: 'description',
  taglineKey: 'tagline',
  badges: ['new', 'popular'],
  ctaLink: '/create/text-to-video?model=veo-3.1-fast-generate-preview',
  supportedModes: ['text-to-video', 'image-to-video'],
  gradient: 'from-blue-600 via-cyan-500 to-teal-400',
  stats: [
    { labelKey: 'stats.resolution', value: '4K' },
    { labelKey: 'stats.audio', value: 'Native' },
    { labelKey: 'stats.speed', value: '~45s' },
    { labelKey: 'stats.credits', value: '6' },
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
      titleKey: 'features.audio.title',
      descriptionKey: 'features.audio.description',
    },
    {
      titleKey: 'features.prompt.title',
      descriptionKey: 'features.prompt.description',
    },
    {
      titleKey: 'features.camera.title',
      descriptionKey: 'features.camera.description',
    },
    {
      titleKey: 'features.flf.title',
      descriptionKey: 'features.flf.description',
    },
  ],
  variants: [
    {
      id: 'veo-3.1-fast-generate-preview',
      name: 'Veo 3.1 Fast',
      speed: '~45s',
      quality: 'Good',
      startingCredits: 6,
      features: ['text-to-video', 'image-to-video', 'audio', '4K', 'FLF'],
      recommended: true,
    },
    {
      id: 'veo-3.1-pro',
      name: 'Veo 3.1 Pro',
      speed: '~90s',
      quality: 'Best',
      startingCredits: 50,
      features: ['text-to-video', 'image-to-video', 'audio', '4K', 'FLF'],
    },
  ],
  howToUse: [
    { titleKey: 'howToUse.0.title', descriptionKey: 'howToUse.0.description' },
    { titleKey: 'howToUse.1.title', descriptionKey: 'howToUse.1.description' },
    { titleKey: 'howToUse.2.title', descriptionKey: 'howToUse.2.description' },
  ],
  useCases: [
    {
      titleKey: 'useCases.viral.title',
      descriptionKey: 'useCases.viral.description',
    },
    {
      titleKey: 'useCases.film.title',
      descriptionKey: 'useCases.film.description',
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
      questionKey: 'faq.difference.question',
      answerKey: 'faq.difference.answer',
    },
    {
      questionKey: 'faq.free.question',
      answerKey: 'faq.free.answer',
    },
    {
      questionKey: 'faq.audio.question',
      answerKey: 'faq.audio.answer',
    },
  ],
  relatedSlugs: ['sora-2', 'seedance', 'hailuo', 'kling'],
  i18nPrefix: 'ModelPage.veo3',
};
