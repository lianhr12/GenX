'use client';

import { styleTags } from '@/config/create';
import { cn } from '@/lib/utils';
import { useCreateStore } from '@/stores/create-store';
import { XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function StyleTags() {
  const t = useTranslations('CreatePageNew.styles');
  const { selectedStyles, toggleStyle, clearStyles } = useCreateStore();

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          {t('title')}
        </h3>
        {selectedStyles.length > 0 && (
          <button
            type="button"
            onClick={clearStyles}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <XIcon className="size-3" />
            {t('clear')}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {styleTags.map((tag) => {
          const isSelected = selectedStyles.includes(tag.id);

          return (
            <button
              type="button"
              key={tag.id}
              onClick={() => toggleStyle(tag.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                'border hover:border-primary/50',
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {t(`tags.${tag.labelKey}` as never)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
