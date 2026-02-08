import type { ModelPageConfig } from './types';

export const seedreamConfig: ModelPageConfig = {
  slug: 'seedream',
  name: 'Seedream',
  provider: 'ByteDance',
  category: 'image',
  seo: {
    titleKey: 'seo.title',
    descriptionKey: 'seo.description',
    keywords: [
      'seedream',
      'bytedance seedream',
      'seedream 4.5',
      'seedream ai',
      'ai image generator',
      'text to image ai',
      'seedream free',
      'seedream online',
      'bytedance ai art',
      'chinese ai image generator',
    ],
  },
  descriptionKey: 'description',
  taglineKey: 'tagline',
  badges: ['new'],
  ctaLink: '/create/image?model=seedream-4.5',
  supportedModes: ['text-to-image'],
  gradient: 'from-violet-600 via-purple-500 to-fuchsia-400',
  stats: [
    { labelKey: 'stats.resolution', value: '2048px' },
    { labelKey: 'stats.quality', value: 'Ultra' },
    { labelKey: 'stats.speed', value: '~10s' },
    { labelKey: 'stats.credits', value: '5' },
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
      titleKey: 'features.resolution.title',
      descriptionKey: 'features.resolution.description',
    },
    {
      titleKey: 'features.aesthetic.title',
      descriptionKey: 'features.aesthetic.description',
    },
    {
      titleKey: 'features.prompt.title',
      descriptionKey: 'features.prompt.description',
    },
    {
      titleKey: 'features.versatility.title',
      descriptionKey: 'features.versatility.description',
    },
  ],
  howToUse: [
    { titleKey: 'howToUse.0.title', descriptionKey: 'howToUse.0.description' },
    { titleKey: 'howToUse.1.title', descriptionKey: 'howToUse.1.description' },
    { titleKey: 'howToUse.2.title', descriptionKey: 'howToUse.2.description' },
  ],
  variants: [
    {
      id: 'seedream-4.5',
      name: 'Seedream 4.5',
      speed: '~10s',
      quality: 'Best',
      startingCredits: 6,
      features: ['text-to-image', '2048px', 'ultra-quality', 'multi-style'],
      recommended: true,
    },
    {
      id: 'seedream-4.0',
      name: 'Seedream 4.0',
      speed: '~8s',
      quality: 'High',
      startingCredits: 5,
      features: ['text-to-image', '2048px', 'high-quality', 'stable'],
    },
  ],
  useCases: [
    {
      titleKey: 'useCases.art.title',
      descriptionKey: 'useCases.art.description',
    },
    {
      titleKey: 'useCases.product.title',
      descriptionKey: 'useCases.product.description',
    },
    {
      titleKey: 'useCases.illustration.title',
      descriptionKey: 'useCases.illustration.description',
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
      questionKey: 'faq.quality.question',
      answerKey: 'faq.quality.answer',
    },
  ],
  relatedSlugs: ['gpt-image', 'nanobanana', 'wan-image'],
  i18nPrefix: 'ModelPage.seedreamImage',
};
