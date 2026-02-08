'use client';

import { Badge } from '@/components/ui/badge';
import type { AIModel } from '@/config/create';
import { LocaleLink } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface ModelCardProps {
  model: AIModel;
}

export function ModelCard({ model }: ModelCardProps) {
  const t = useTranslations('CreatePageNew.models');

  return (
    <LocaleLink href={model.href} className="group block">
      <div className="relative overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md hover:border-primary/50">
        {/* Model Image */}
        <div className="aspect-square relative overflow-hidden bg-muted">
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={model.image}
              alt={model.name}
              className="size-12 opacity-60 group-hover:opacity-80 transition-opacity"
            />
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {model.badge === 'popular' && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0.5 bg-primary text-primary-foreground border-0"
              >
                {t('badges.popular')}
              </Badge>
            )}
            {model.isNew && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0.5 bg-green-500 text-white border-0"
              >
                NEW
              </Badge>
            )}
            {model.isPro && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0.5 bg-amber-500 text-white border-0"
              >
                PRO
              </Badge>
            )}
          </div>
        </div>

        {/* Model Info */}
        <div className="p-3">
          <h3 className="font-medium text-sm truncate">{model.name}</h3>
          <p className="text-xs text-muted-foreground truncate">
            {model.provider}
          </p>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors" />
      </div>
    </LocaleLink>
  );
}
