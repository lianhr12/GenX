'use client';

import {
  type ModelPageConfig,
  getModelPagesByCategory,
} from '@/config/model-pages';
import { LocaleLink } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { ArrowRightIcon, SparklesIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

function ModelCard({ config }: { config: ModelPageConfig }) {
  const t = useTranslations(config.i18nPrefix as never);

  return (
    <LocaleLink
      href={`/models/${config.slug}`}
      className="group block rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/30"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
            {config.name}
          </h3>
          <p className="text-sm text-muted-foreground">{config.provider}</p>
        </div>
        <div className="flex gap-1.5">
          {config.badges.map((badge) => (
            <span
              key={badge}
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                badge === 'new' &&
                  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                badge === 'popular' &&
                  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                badge === 'pro' &&
                  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
              )}
            >
              {badge.toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {t('tagline' as never)}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {config.supportedModes.slice(0, 3).map((mode) => (
          <span
            key={mode}
            className="px-2 py-0.5 rounded-md bg-muted text-xs text-muted-foreground"
          >
            {mode}
          </span>
        ))}
      </div>

      <div className="flex items-center text-sm text-primary font-medium">
        <span>{t('learnMore' as never)}</span>
        <ArrowRightIcon className="size-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </LocaleLink>
  );
}

function ModelSection({
  titleKey,
  models,
}: {
  titleKey: string;
  models: ModelPageConfig[];
}) {
  const t = useTranslations('ModelPage.list');

  if (models.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">{t(titleKey as never)}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map((config) => (
          <ModelCard key={config.slug} config={config} />
        ))}
      </div>
    </section>
  );
}

export function ModelListPage() {
  const t = useTranslations('ModelPage.list');
  const videoModels = getModelPagesByCategory('video');
  const imageModels = getModelPagesByCategory('image');
  const digitalHumanModels = getModelPagesByCategory('digital-human');

  return (
    <div className="container mx-auto max-w-6xl py-16 px-4">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <SparklesIcon className="size-4" />
          {t('badge')}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          {t('title')}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('description')}
        </p>
      </div>

      <ModelSection titleKey="videoModels" models={videoModels} />
      <ModelSection titleKey="imageModels" models={imageModels} />
      <ModelSection titleKey="digitalHumanModels" models={digitalHumanModels} />
    </div>
  );
}
