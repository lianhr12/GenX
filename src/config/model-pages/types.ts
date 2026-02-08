/**
 * Model detail page configuration types
 */

/** Model category */
export type ModelCategory = 'video' | 'image' | 'digital-human';

/** Model variant for comparison table */
export interface ModelVariant {
  id: string;
  name: string;
  speed: string;
  quality: string;
  startingCredits: number;
  features: string[];
  recommended?: boolean;
}

/** Model feature card — supports alternating image+text layout */
export interface ModelFeature {
  titleKey: string;
  descriptionKey: string;
  icon?: string;
}

/** Model FAQ item */
export interface ModelFAQ {
  questionKey: string;
  answerKey: string;
}

/** Model use case */
export interface ModelUseCase {
  titleKey: string;
  descriptionKey: string;
  icon?: string;
}

/** Hero statistics item */
export interface ModelStat {
  labelKey: string;
  value: string;
}

/** Showcase gallery item */
export interface ModelShowcase {
  titleKey: string;
  descriptionKey: string;
}

/** How-to step */
export interface ModelHowToStep {
  titleKey: string;
  descriptionKey: string;
}

/** Model page SEO config */
export interface ModelPageSEO {
  titleKey: string;
  descriptionKey: string;
  keywords: string[];
}

/** Model page configuration */
export interface ModelPageConfig {
  slug: string;
  name: string;
  provider: string;
  category: ModelCategory;
  seo: ModelPageSEO;
  descriptionKey: string;
  taglineKey: string;
  badges: ('new' | 'popular' | 'pro')[];
  ctaLink: string;
  supportedModes: string[];
  /** Hero area gradient colors (tailwind classes) */
  gradient: string;
  /** Key stats shown in hero area */
  stats: ModelStat[];
  /** Showcase gallery items */
  showcase: ModelShowcase[];
  features: ModelFeature[];
  /** Step-by-step usage guide */
  howToUse: ModelHowToStep[];
  variants: ModelVariant[];
  useCases: ModelUseCase[];
  faq: ModelFAQ[];
  relatedSlugs: string[];
  i18nPrefix: string;
}
