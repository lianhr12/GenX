'use client';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { videoTools } from '@/config/create';
import { LocaleLink } from '@/i18n/navigation';
import { ChevronRightIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ToolCard } from './tool-card';

export function VideoToolsSection() {
  const t = useTranslations('CreatePageNew.tools');

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        <LocaleLink
          href="/create"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t('viewAll')}
          <ChevronRightIcon className="size-4" />
        </LocaleLink>
      </div>

      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 pb-4">
          {videoTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
