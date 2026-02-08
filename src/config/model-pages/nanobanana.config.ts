import type { ModelPageConfig } from './types';

export const nanobananaConfig: ModelPageConfig = {
  slug: 'nanobanana',
  name: 'Nanobanana Pro',
  provider: 'Google',
  category: 'image',
  seo: {
    titleKey: 'seo.title',
    descriptionKey: 'seo.description',
    keywords: [
      'nanobanana pro',
      'google gemini image',
      'gemini image generator',
      'ai image generator',
      'text to image ai',
      'nanobanana free',
      'nanobanana online',
      'google ai art',
      'gemini 3 pro image',
      'premium ai image',
    ],
  },
  descriptionKey: 'description',
  taglineKey: 'tagline',
  badges: ['new', 'pro'],
  ctaLink: '/create/text-to-image?model=nanobanana-pro',
  supportedModes: ['text-to-image'],
  gradient: 'from-blue-600 via-indigo-500 to-violet-400',
  stats: [
    { labelKey: 'stats.resolution', value: '1024px' },
    { labelKey: 'stats.quality', value: 'Premium' },
    { labelKey: 'stats.speed', value: '~12s' },
    { labelKey: 'stats.credits', value: '10' },
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
      titleKey: 'features.multimodal.title',
      descriptionKey: 'features.multimodal.description',
    },
    {
      titleKey: 'features.photorealism.title',
      descriptionKey: 'features.photorealism.description',
    },
    {
      titleKey: 'features.reasoning.title',
      descriptionKey: 'features.reasoning.description',
    },
    {
      titleKey: 'features.safety.title',
      descriptionKey: 'features.safety.description',
    },
  ],
  howToUse: [
    { titleKey: 'howToUse.0.title', descriptionKey: 'howToUse.0.description' },
    { titleKey: 'howToUse.1.title', descriptionKey: 'howToUse.1.description' },
    { titleKey: 'howToUse.2.title', descriptionKey: 'howToUse.2.description' },
  ],
  variants: [
    {
      id: 'nanobanana-pro',
      name: 'Nanobanana Pro',
      speed: '~12s',
      quality: 'Best',
      startingCredits: 10,
      features: [
        'text-to-image',
        'premium-quality',
        'photorealistic',
        'multi-style',
      ],
      recommended: true,
    },
  ],
  useCases: [
    {
      titleKey: 'useCases.creative.title',
      descriptionKey: 'useCases.creative.description',
    },
    {
      titleKey: 'useCases.professional.title',
      descriptionKey: 'useCases.professional.description',
    },
    {
      titleKey: 'useCases.content.title',
      descriptionKey: 'useCases.content.description',
    },
  ],
  faq: [
    {
      questionKey: 'faq.what.question',
      answerKey: 'faq.what.answer',
    },
    {
      questionKey: 'faq.gemini.question',
      answerKey: 'faq.gemini.answer',
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
  relatedSlugs: ['gpt-image', 'seedream', 'wan-image'],
  i18nPrefix: 'ModelPage.nanobanana',
};
