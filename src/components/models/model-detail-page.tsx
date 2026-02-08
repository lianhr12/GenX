'use client';

import { getModelPageBySlug, modelPageConfigs } from '@/config/model-pages';
import type { ModelPageConfig } from '@/config/model-pages/types';
import { LocaleLink } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronRightIcon,
  ImageIcon,
  PlayIcon,
  SparklesIcon,
  StarIcon,
  ZapIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { notFound, useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';

export function ModelDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const config = getModelPageBySlug(slug);
  if (!config) {
    notFound();
  }

  return (
    <div className="-mt-16">
      <HeroSection config={config} />
      <ShowcaseSection config={config} />
      <FeaturesSection config={config} />
      <HowToUseSection config={config} />
      <VariantsSection config={config} />
      <UseCasesSection config={config} />
      <FAQSection config={config} />
      <RelatedModelsSection config={config} />
      <CTASection config={config} />
    </div>
  );
}

/* ─── Hero with gradient banner ─── */
function HeroSection({ config }: { config: ModelPageConfig }) {
  const t = useTranslations(config.i18nPrefix as never);
  const mt = useTranslations('ModelPage');

  return (
    <section className="relative overflow-hidden">
      {/* Gradient background */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-10 dark:opacity-20',
          config.gradient,
        )}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_20%,var(--background)_80%)]" />

      <div className="relative pt-24 pb-16 mx-auto max-w-6xl px-4">
        {/* Back link */}
        <LocaleLink
          href="/models"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeftIcon className="size-4" />
          {mt('backToModels')}
        </LocaleLink>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-muted-foreground font-medium">
                {config.provider}
              </span>
              <div className="flex gap-1.5">
                {config.badges.map((badge) => (
                  <span
                    key={badge}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide',
                      badge === 'new' &&
                        'bg-green-500/10 text-green-500 border border-green-500/20',
                      badge === 'popular' &&
                        'bg-orange-500/10 text-orange-500 border border-orange-500/20',
                      badge === 'pro' &&
                        'bg-purple-500/10 text-purple-500 border border-purple-500/20',
                    )}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              {config.name}
            </h1>

            <p className="text-xl text-muted-foreground mb-4 leading-relaxed">
              {t('tagline' as never)}
            </p>

            <p className="text-muted-foreground mb-8 leading-relaxed">
              {t('description' as never)}
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {config.supportedModes.map((mode) => (
                <span
                  key={mode}
                  className="px-3 py-1.5 rounded-full bg-muted/80 text-sm text-muted-foreground border border-border/50"
                >
                  {mode}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="gap-2 text-base px-8 h-12">
                <LocaleLink href={config.ctaLink}>
                  <SparklesIcon className="size-5" />
                  {t('cta' as never)}
                </LocaleLink>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="gap-2 text-base h-12"
              >
                <a href="#features">
                  {t('learnMore' as never)}
                  <ArrowRightIcon className="size-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Right: Stats cards */}
          <div className="grid grid-cols-2 gap-4">
            {config.stats.map((stat, index) => (
              <div
                key={index}
                className={cn(
                  'relative overflow-hidden rounded-2xl border p-6 transition-all hover:shadow-lg',
                  'bg-card/50 backdrop-blur-sm',
                )}
              >
                <div
                  className={cn(
                    'absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20',
                    config.gradient,
                  )}
                />
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">
                  {t(stat.labelKey as never)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Showcase Gallery ─── */
function ShowcaseSection({ config }: { config: ModelPageConfig }) {
  const t = useTranslations(config.i18nPrefix as never);
  const mt = useTranslations('ModelPage');

  if (config.showcase.length === 0) return null;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">{mt('sections.showcase')}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {mt('sections.showcaseDesc', { model: config.name })}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {config.showcase.map((item, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-xl hover:border-primary/30"
          >
            {/* Placeholder visual */}
            <div
              className={cn(
                'aspect-video bg-gradient-to-br flex items-center justify-center',
                config.gradient,
                'opacity-20',
              )}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center border group-hover:scale-110 transition-transform">
                  <PlayIcon className="size-6 text-primary ml-0.5" />
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-sm mb-1">
                {t(item.titleKey as never)}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {t(item.descriptionKey as never)}
              </p>
            </div>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}

/* ─── Features — alternating layout ─── */
function FeaturesSection({ config }: { config: ModelPageConfig }) {
  const t = useTranslations(config.i18nPrefix as never);
  const mt = useTranslations('ModelPage');

  const featureIcons = [ZapIcon, StarIcon, ImageIcon, SparklesIcon];

  return (
    <section id="features" className="py-16 border-t">
      <div className="mx-auto max-w-6xl px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4">{mt('sections.features')}</h2>
      </div>
      <div className="space-y-24">
        {config.features.map((feature, index) => {
          const Icon = featureIcons[index % featureIcons.length];
          const isReversed = index % 2 === 1;
          return (
            <div
              key={index}
              className={cn(
                'grid grid-cols-1 lg:grid-cols-2 gap-12 items-center',
                isReversed && 'lg:[direction:rtl]',
              )}
            >
              {/* Visual side */}
              <div className="lg:[direction:ltr] relative">
                <div
                  className={cn(
                    'aspect-[4/3] rounded-2xl overflow-hidden border',
                    'bg-gradient-to-br',
                    config.gradient,
                    'opacity-15 dark:opacity-25',
                  )}
                />
                <div className="absolute inset-0 rounded-2xl flex items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-background/80 backdrop-blur-sm border flex items-center justify-center">
                    <Icon className="size-10 text-primary" />
                  </div>
                </div>
              </div>

              {/* Text side */}
              <div className="lg:[direction:ltr]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-primary uppercase tracking-wider">
                    {mt('sections.feature')} {index + 1}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  {t(feature.titleKey as never)}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {t(feature.descriptionKey as never)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </section>
  );
}

/* ─── How to Use — 3-step guide ─── */
function HowToUseSection({ config }: { config: ModelPageConfig }) {
  const t = useTranslations(config.i18nPrefix as never);
  const mt = useTranslations('ModelPage');

  if (config.howToUse.length === 0) return null;

  return (
    <section className="py-16 border-t">
      <div className="mx-auto max-w-6xl px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">
          {mt('sections.howToUse', { model: config.name })}
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {config.howToUse.map((step, index) => (
          <div key={index} className="relative">
            {/* Connector line */}
            {index < config.howToUse.length - 1 && (
              <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px border-t border-dashed border-border" />
            )}
            <div className="text-center">
              {/* Step number */}
              <div
                className={cn(
                  'inline-flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold mb-6',
                  'bg-gradient-to-br text-white',
                  config.gradient,
                )}
              >
                {index + 1}
              </div>
              <h3 className="text-lg font-semibold mb-3">
                {t(step.titleKey as never)}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t(step.descriptionKey as never)}
              </p>
            </div>
          </div>
        ))}
      </div>
      {/* CTA after steps */}
      <div className="text-center mt-12">
        <Button asChild size="lg" className="gap-2 text-base px-8 h-12">
          <LocaleLink href={config.ctaLink}>
            <SparklesIcon className="size-5" />
            {t('cta' as never)}
          </LocaleLink>
        </Button>
      </div>
      </div>
    </section>
  );
}

/* ─── Model Variants Comparison ─── */
function VariantsSection({ config }: { config: ModelPageConfig }) {
  const mt = useTranslations('ModelPage');

  if (config.variants.length <= 1) return null;

  return (
    <section className="py-16 border-t">
      <div className="mx-auto max-w-6xl px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">{mt('sections.variants')}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {config.variants.map((variant) => (
          <div
            key={variant.id}
            className={cn(
              'relative rounded-2xl border p-6 transition-all hover:shadow-lg',
              variant.recommended &&
                'border-primary shadow-md ring-1 ring-primary/20',
            )}
          >
            {variant.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  {mt('table.recommended')}
                </span>
              </div>
            )}
            <h3 className="text-xl font-bold mb-4">{variant.name}</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {mt('table.speed')}
                </span>
                <span className="font-medium">{variant.speed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {mt('table.quality')}
                </span>
                <span
                  className={cn(
                    'px-2.5 py-0.5 rounded-full text-xs font-semibold',
                    variant.quality === 'Best' &&
                      'bg-green-500/10 text-green-500',
                    variant.quality === 'High' &&
                      'bg-blue-500/10 text-blue-500',
                    variant.quality === 'Good' &&
                      'bg-yellow-500/10 text-yellow-500',
                  )}
                >
                  {variant.quality}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {mt('table.credits')}
                </span>
                <span className="font-bold text-lg">
                  {variant.startingCredits}
                </span>
              </div>
            </div>
            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                {mt('table.capabilities')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {variant.features.map((feat) => (
                  <span
                    key={feat}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-xs text-muted-foreground"
                  >
                    <CheckIcon className="size-3" />
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </section>
  );
}

/* ─── Use Cases ─── */
function UseCasesSection({ config }: { config: ModelPageConfig }) {
  const t = useTranslations(config.i18nPrefix as never);
  const mt = useTranslations('ModelPage');

  const caseIcons = [SparklesIcon, ImageIcon, ZapIcon];

  return (
    <section className="py-16 border-t">
      <div className="mx-auto max-w-6xl px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">{mt('sections.useCases')}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {config.useCases.map((useCase, index) => {
          const Icon = caseIcons[index % caseIcons.length];
          return (
            <div
              key={index}
              className="group p-8 rounded-2xl border bg-card/50 transition-all hover:shadow-xl hover:border-primary/30"
            >
              <div
                className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-2xl mb-6',
                  'bg-gradient-to-br text-white',
                  config.gradient,
                )}
              >
                <Icon className="size-7" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {t(useCase.titleKey as never)}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t(useCase.descriptionKey as never)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
    </section>
  );
}

/* ─── FAQ with JSON-LD ─── */
function FAQSection({ config }: { config: ModelPageConfig }) {
  const t = useTranslations(config.i18nPrefix as never);
  const mt = useTranslations('ModelPage');

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: config.faq.map((item) => ({
      '@type': 'Question',
      name: t(item.questionKey as never),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(item.answerKey as never),
      },
    })),
  };

  return (
    <section className="py-16 border-t">
      <div className="mx-auto max-w-6xl px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">{mt('sections.faq')}</h2>
      </div>
      <div className="max-w-3xl mx-auto space-y-4">
        {config.faq.map((item, index) => (
          <details
            key={index}
            className="group rounded-2xl border bg-card/50 transition-all hover:shadow-sm"
          >
            <summary className="flex cursor-pointer items-center justify-between p-6 font-semibold list-none">
              <span className="pr-4">{t(item.questionKey as never)}</span>
              <ChevronRightIcon className="size-5 text-muted-foreground shrink-0 transition-transform group-open:rotate-90" />
            </summary>
            <div className="px-6 pb-6 -mt-2">
              <p className="text-muted-foreground leading-relaxed">
                {t(item.answerKey as never)}
              </p>
            </div>
          </details>
        ))}
      </div>
    </div>
    </section>
  );
}

/* ─── Related Models ─── */
function RelatedModelsSection({ config }: { config: ModelPageConfig }) {
  const mt = useTranslations('ModelPage');

  const relatedConfigs = config.relatedSlugs
    .map((slug) => modelPageConfigs.find((c) => c.slug === slug))
    .filter(Boolean) as ModelPageConfig[];

  if (relatedConfigs.length === 0) return null;

  return (
    <section className="py-16 border-t">
      <div className="mx-auto max-w-6xl px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">{mt('sections.related')}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {relatedConfigs.map((related) => (
          <LocaleLink
            key={related.slug}
            href={`/models/${related.slug}`}
            className="group relative overflow-hidden rounded-2xl border bg-card/50 p-6 transition-all hover:shadow-xl hover:border-primary/30"
          >
            <div
              className={cn(
                'absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10',
                related.gradient,
              )}
            />
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
              {related.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {related.provider}
            </p>
            <div className="flex items-center text-sm text-primary font-medium">
              <span>{mt('viewModel')}</span>
              <ArrowRightIcon className="size-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </LocaleLink>
        ))}
      </div>
    </div>
    </section>
  );
}

/* ─── Bottom CTA ─── */
function CTASection({ config }: { config: ModelPageConfig }) {
  const t = useTranslations(config.i18nPrefix as never);
  const mt = useTranslations('ModelPage');

  return (
    <section className="py-16 border-t">
      <div className="mx-auto max-w-6xl px-4">
        <div
          className={cn(
            'relative overflow-hidden text-center p-16 rounded-3xl',
          )}
        >
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-br opacity-10 dark:opacity-20',
              config.gradient,
            )}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,var(--background)_100%)]" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {mt('cta.title', { model: config.name })}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
              {mt('cta.description')}
            </p>
            <Button asChild size="lg" className="gap-2 text-base px-8 h-12">
              <LocaleLink href={config.ctaLink}>
                <SparklesIcon className="size-5" />
                {t('cta' as never)}
              </LocaleLink>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
