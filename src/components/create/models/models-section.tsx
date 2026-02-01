'use client';

import { aiModels } from '@/config/create';
import { LocaleLink } from '@/i18n/navigation';
import { ChevronRightIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ModelCard } from './model-card';

export function ModelsSection() {
  const t = useTranslations('CreatePageNew.models');

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        <LocaleLink
          href="/models"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t('viewAll')}
          <ChevronRightIcon className="size-4" />
        </LocaleLink>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {aiModels.slice(0, 6).map((model) => (
          <ModelCard key={model.id} model={model} />
        ))}
      </div>
    </section>
  );
}
