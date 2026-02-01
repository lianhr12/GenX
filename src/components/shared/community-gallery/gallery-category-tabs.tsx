'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ArrowUpDownIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface GalleryCategory {
  id: string;
  labelKey: string;
}

export interface GallerySortOption {
  id: string;
  labelKey: string;
}

interface GalleryCategoryTabsProps {
  categories: GalleryCategory[];
  sortOptions: GallerySortOption[];
  activeCategory: string;
  activeSortBy: string;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
  translationNamespace?: string;
  categoryPrefix?: string;
}

export function GalleryCategoryTabs({
  categories,
  sortOptions,
  activeCategory,
  activeSortBy,
  onCategoryChange,
  onSortChange,
  translationNamespace = 'CommunityGallery',
  categoryPrefix,
}: GalleryCategoryTabsProps) {
  const t = useTranslations(translationNamespace as never);

  // Determine category translation prefix based on namespace
  const catPrefix =
    categoryPrefix ||
    (translationNamespace === 'GalleryPage' ? 'filters' : 'categories');

  return (
    <div className="flex items-center gap-3">
      {/* Category tabs */}
      <div className="flex items-center gap-1 overflow-x-auto">
        {categories.map((category) => (
          <button
            type="button"
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              activeCategory === category.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
            )}
          >
            {t(`${catPrefix}.${category.labelKey}` as never)}
          </button>
        ))}
      </div>

      {/* Sort dropdown - only show if sortOptions provided */}
      {sortOptions.length > 0 && (
        <Select value={activeSortBy} onValueChange={onSortChange}>
          <SelectTrigger className="h-8 w-[120px]">
            <ArrowUpDownIcon className="size-3.5 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {t(`sort.${option.labelKey}` as never)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
