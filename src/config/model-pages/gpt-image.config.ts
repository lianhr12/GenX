import type { ModelPageConfig } from './types';

export const gptImageConfig: ModelPageConfig = {
  slug: 'gpt-image',
  name: 'GPT Image',
  provider: 'OpenAI',
  category: 'image',
  seo: {
    titleKey: 'seo.title',
    descriptionKey: 'seo.description',
    keywords: [
      'gpt image',
      'openai image generator',
      'gpt image 1.5',
      'ai image generator',
      'text to image ai',
      'openai dall-e alternative',
      'gpt image free',
      'gpt image online',
      'ai art generator',
      'image generation ai',
    ],
  },
  descriptionKey: 'description',
  taglineKey: 'tagline',
  badges: ['new', 'popular'],
  ctaLink: '/create/text-to-image?model=gpt-image-1.5',
  supportedModes: ['text-to-image', 'image-editing'],
  gradient: 'from-emerald-600 via-teal-500 to-cyan-400',
  stats: [
    { labelKey: 'stats.resolution', value: '1536px' },
    { labelKey: 'stats.quality', value: 'HD' },
    { labelKey: 'stats.speed', value: '~8s' },
    { labelKey: 'stats.credits', value: '4' },
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
      titleKey: 'features.understanding.title',
      descriptionKey: 'features.understanding.description',
    },
    {
      titleKey: 'features.text.title',
      descriptionKey: 'features.text.description',
    },
    {
      titleKey: 'features.editing.title',
      descriptionKey: 'features.editing.description',
    },
    {
      titleKey: 'features.styles.title',
      descriptionKey: 'features.styles.description',
    },
  ],
  howToUse: [
    { titleKey: 'howToUse.0.title', descriptionKey: 'howToUse.0.description' },
    { titleKey: 'howToUse.1.title', descriptionKey: 'howToUse.1.description' },
    { titleKey: 'howToUse.2.title', descriptionKey: 'howToUse.2.description' },
  ],
  variants: [
    {
      id: 'gpt-image-1.5',
      name: 'GPT Image 1.5',
      speed: '~8s',
      quality: 'Best',
      startingCredits: 8,
      features: ['text-to-image', 'image-editing', 'HD', 'text-rendering'],
      recommended: true,
    },
    {
      id: 'gpt-image-1.5-lite',
      name: 'GPT Image 1.5 Lite',
      speed: '~5s',
      quality: 'Good',
      startingCredits: 4,
      features: ['text-to-image', 'image-editing', 'fast'],
    },
  ],
  useCases: [
    {
      titleKey: 'useCases.marketing.title',
      descriptionKey: 'useCases.marketing.description',
    },
    {
      titleKey: 'useCases.social.title',
      descriptionKey: 'useCases.social.description',
    },
    {
      titleKey: 'useCases.design.title',
      descriptionKey: 'useCases.design.description',
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
      questionKey: 'faq.text.question',
      answerKey: 'faq.text.answer',
    },
  ],
  relatedSlugs: ['seedream', 'nanobanana', 'wan-image'],
  i18nPrefix: 'ModelPage.gptImage',
};
