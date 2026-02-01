'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { galleryCategories, sortOptions } from '@/config/create';
import { cn } from '@/lib/utils';
import { useCreateStore } from '@/stores/create-store';
import { ArrowUpDownIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function CategoryTabs() {
  const t = useTranslations('CreatePageNew.gallery');
  const {
    galleryCategory,
    setGalleryCategory,
    gallerySortBy,
    setGallerySortBy,
  } = useCreateStore();

  return (
    <div className="flex items-center gap-3">
      {/* Category tabs */}
      <div className="flex items-center gap-1 overflow-x-auto">
        {galleryCategories.map((category) => (
          <button
            type="button"
            key={category.id}
            onClick={() => setGalleryCategory(category.id)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              galleryCategory === category.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
            )}
          >
            {t(`categories.${category.labelKey}` as never)}
          </button>
        ))}
      </div>

      {/* Sort dropdown */}
      <Select
        value={gallerySortBy}
        onValueChange={(v) => setGallerySortBy(v as typeof gallerySortBy)}
      >
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
    </div>
  );
}
