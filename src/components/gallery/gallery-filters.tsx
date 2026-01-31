'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FilterIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

const artStyles = [
  { id: 'all', emoji: null },
  { id: 'cyberpunk', emoji: '🌃' },
  { id: 'watercolor', emoji: '🎨' },
  { id: 'oilPainting', emoji: '🖼️' },
  { id: 'anime', emoji: '✨' },
  { id: 'fluidArt', emoji: '🌊' },
];

const sortOptions = [{ id: 'latest' }, { id: 'popular' }];

interface GalleryFiltersProps {
  activeStyle: string;
  activeSort: 'latest' | 'popular';
  onStyleChange: (style: string) => void;
  onSortChange: (sort: 'latest' | 'popular') => void;
}

export function GalleryFilters({
  activeStyle,
  activeSort,
  onStyleChange,
  onSortChange,
}: GalleryFiltersProps) {
  const t = useTranslations('GalleryPage');

  return (
    <div className="space-y-4">
      {/* Style Filters */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <FilterIcon className="size-4 text-muted-foreground mr-2" />
        {artStyles.map((style) => (
          <Button
            key={style.id}
            variant={activeStyle === style.id ? 'default' : 'outline'}
            size="sm"
            className="rounded-full"
            onClick={() => onStyleChange(style.id)}
          >
            {style.emoji && <span className="mr-1">{style.emoji}</span>}
            {t(`filters.${style.id}` as never)}
          </Button>
        ))}
      </div>

      {/* Sort Options */}
      <div className="flex items-center justify-center gap-2">
        {sortOptions.map((option) => (
          <Button
            key={option.id}
            variant={activeSort === option.id ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onSortChange(option.id as 'latest' | 'popular')}
          >
            {t(`sort.${option.id}` as never)}
          </Button>
        ))}
      </div>
    </div>
  );
}
