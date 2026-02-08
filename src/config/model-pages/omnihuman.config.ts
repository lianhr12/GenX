import type { ModelPageConfig } from './types';

export const omnihumanConfig: ModelPageConfig = {
  slug: 'omnihuman',
  name: 'OmniHuman',
  provider: 'ByteDance',
  category: 'digital-human',
  seo: {
    titleKey: 'seo.title',
    descriptionKey: 'seo.description',
    keywords: [
      'omnihuman',
      'omnihuman 1.5',
      'bytedance omnihuman',
      'digital human ai',
      'ai avatar generator',
      'audio driven video',
      'omnihuman free',
      'omnihuman online',
      'ai digital human',
      'talking avatar ai',
    ],
  },
  descriptionKey: 'description',
  taglineKey: 'tagline',
  badges: ['new'],
  ctaLink: '/create/reference-to-video?model=omnihuman-1.5',
  supportedModes: ['reference-to-video'],
  gradient: 'from-indigo-500 via-blue-500 to-sky-500',
  stats: [
    { labelKey: 'stats.input', value: 'Audio' },
    { labelKey: 'stats.lipSync', value: 'Yes' },
    { labelKey: 'stats.speed', value: '~120s' },
    { labelKey: 'stats.credits', value: '12' },
  ],
  showcase: [
    { titleKey: 'showcase.0.title', descriptionKey: 'showcase.0.description' },
    { titleKey: 'showcase.1.title', descriptionKey: 'showcase.1.description' },
    { titleKey: 'showcase.2.title', descriptionKey: 'showcase.2.description' },
    { titleKey: 'showcase.3.title', descriptionKey: 'showcase.3.description' },
  ],
  features: [
    {
      titleKey: 'features.audioDriven.title',
      descriptionKey: 'features.audioDriven.description',
    },
    {
      titleKey: 'features.realistic.title',
      descriptionKey: 'features.realistic.description',
    },
    {
      titleKey: 'features.flexible.title',
      descriptionKey: 'features.flexible.description',
    },
    {
      titleKey: 'features.multiLanguage.title',
      descriptionKey: 'features.multiLanguage.description',
    },
  ],
  variants: [
    {
      id: 'omnihuman-1.5',
      name: 'OmniHuman 1.5',
      speed: '~120s',
      quality: 'High',
      startingCredits: 12,
      features: ['reference-to-video', 'audio-url'],
    },
  ],
  howToUse: [
    { titleKey: 'howToUse.0.title', descriptionKey: 'howToUse.0.description' },
    { titleKey: 'howToUse.1.title', descriptionKey: 'howToUse.1.description' },
    { titleKey: 'howToUse.2.title', descriptionKey: 'howToUse.2.description' },
  ],
  useCases: [
    {
      titleKey: 'useCases.presentation.title',
      descriptionKey: 'useCases.presentation.description',
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
      questionKey: 'faq.languages.question',
      answerKey: 'faq.languages.answer',
    },
  ],
  relatedSlugs: ['sora-2', 'veo-3', 'kling', 'wan'],
  i18nPrefix: 'ModelPage.omnihuman',
};
