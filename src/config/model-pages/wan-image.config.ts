import type { ModelPageConfig } from './types';

export const wanImageConfig: ModelPageConfig = {
  slug: 'wan-image',
  name: 'Wan 2.5 Image',
  provider: 'Alibaba',
  category: 'image',
  seo: {
    titleKey: 'seo.title',
    descriptionKey: 'seo.description',
    keywords: [
      'wan 2.5 image',
      'alibaba wan image',
      'wan ai image generator',
      'ai image generator',
      'text to image ai',
      'wan 2.5 free',
      'wan image online',
      'alibaba ai art',
      'chinese ai image',
      'wan text to image',
    ],
  },
  descriptionKey: 'description',
  taglineKey: 'tagline',
  badges: ['new'],
  ctaLink: '/create/text-to-image?model=wan2.5-text-to-image',
  supportedModes: ['text-to-image'],
  gradient: 'from-orange-600 via-amber-500 to-yellow-400',
  stats: [
    { labelKey: 'stats.resolution', value: '1280px' },
    { labelKey: 'stats.quality', value: 'High' },
    { labelKey: 'stats.speed', value: '~6s' },
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
      titleKey: 'features.bilingual.title',
      descriptionKey: 'features.bilingual.description',
    },
    {
      titleKey: 'features.diversity.title',
      descriptionKey: 'features.diversity.description',
    },
    {
      titleKey: 'features.ratio.title',
      descriptionKey: 'features.ratio.description',
    },
    {
      titleKey: 'features.efficiency.title',
      descriptionKey: 'features.efficiency.description',
    },
  ],
  howToUse: [
    { titleKey: 'howToUse.0.title', descriptionKey: 'howToUse.0.description' },
    { titleKey: 'howToUse.1.title', descriptionKey: 'howToUse.1.description' },
    { titleKey: 'howToUse.2.title', descriptionKey: 'howToUse.2.description' },
  ],
  variants: [
    {
      id: 'wan2.5',
      name: 'Wan 2.5',
      speed: '~6s',
      quality: 'High',
      startingCredits: 5,
      features: ['text-to-image', '1280px', 'bilingual', 'multi-ratio'],
      recommended: true,
    },
  ],
  useCases: [
    {
      titleKey: 'useCases.creative.title',
      descriptionKey: 'useCases.creative.description',
    },
    {
      titleKey: 'useCases.ecommerce.title',
      descriptionKey: 'useCases.ecommerce.description',
    },
    {
      titleKey: 'useCases.social.title',
      descriptionKey: 'useCases.social.description',
    },
  ],
  faq: [
    {
      questionKey: 'faq.what.question',
      answerKey: 'faq.what.answer',
    },
    {
      questionKey: 'faq.bilingual.question',
      answerKey: 'faq.bilingual.answer',
    },
    {
      questionKey: 'faq.free.question',
      answerKey: 'faq.free.answer',
    },
    {
      questionKey: 'faq.video.question',
      answerKey: 'faq.video.answer',
    },
  ],
  relatedSlugs: ['gpt-image', 'seedream', 'nanobanana'],
  i18nPrefix: 'ModelPage.wanImage',
};
