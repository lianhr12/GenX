'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import {
  type GalleryCategory,
  GalleryCategoryTabs,
  type GallerySortOption,
} from './gallery-category-tabs';
import type { GalleryItemData } from './gallery-video-card';
import { MasonryGallery } from './masonry-gallery';

// Default categories
const defaultCategories: GalleryCategory[] = [
  { id: 'all', labelKey: 'all' },
  { id: 'realistic', labelKey: 'realistic' },
  { id: 'anime', labelKey: 'anime' },
  { id: 'cinematic', labelKey: 'cinematic' },
  { id: '3d', labelKey: '3d' },
  { id: 'fantasy', labelKey: 'fantasy' },
  { id: 'abstract', labelKey: 'abstract' },
];

// Default sort options
const defaultSortOptions: GallerySortOption[] = [
  { id: 'latest', labelKey: 'latest' },
  { id: 'popular', labelKey: 'popular' },
  { id: 'trending', labelKey: 'trending' },
];

export interface CommunityGalleryProps {
  /** Gallery items to display */
  items: GalleryItemData[];
  /** Custom categories (optional) */
  categories?: GalleryCategory[];
  /** Custom sort options (optional) */
  sortOptions?: GallerySortOption[];
  /** Show title and subtitle */
  showHeader?: boolean;
  /** Custom title */
  title?: string;
  /** Custom subtitle */
  subtitle?: string;
  /** Translation namespace for i18n */
  translationNamespace?: string;
  /** Callback when item is clicked */
  onItemClick?: (item: GalleryItemData) => void;
  /** Callback when category changes */
  onCategoryChange?: (category: string) => void;
  /** Callback when sort changes */
  onSortChange?: (sort: string) => void;
  /** Initial category */
  initialCategory?: string;
  /** Initial sort */
  initialSort?: string;
  /** Gap between items in pixels */
  gap?: number;
  /** Custom class name */
  className?: string;
}

export function CommunityGallery({
  items,
  categories = defaultCategories,
  sortOptions = defaultSortOptions,
  showHeader = true,
  title,
  subtitle,
  translationNamespace = 'CommunityGallery',
  onItemClick,
  onCategoryChange,
  onSortChange,
  initialCategory = 'all',
  initialSort = 'latest',
  gap = 16,
  className,
}: CommunityGalleryProps) {
  const t = useTranslations(translationNamespace as never);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeSortBy, setActiveSortBy] = useState(initialSort);

  // Filter items by category
  const filteredItems =
    activeCategory === 'all'
      ? items
      : items.filter(
          (item) =>
            item.category === activeCategory || item.artStyle === activeCategory
        );

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    const aLikes = a.likes ?? a.likesCount ?? 0;
    const bLikes = b.likes ?? b.likesCount ?? 0;
    const aViews = a.views ?? a.viewsCount ?? 0;
    const bViews = b.views ?? b.viewsCount ?? 0;

    switch (activeSortBy) {
      case 'popular':
        return bLikes - aLikes;
      case 'trending':
        return bViews - aViews;
      default:
        return 0; // Assume items are already sorted by date
    }
  });

  const handleCategoryChange = useCallback(
    (category: string) => {
      setActiveCategory(category);
      onCategoryChange?.(category);
    },
    [onCategoryChange]
  );

  const handleSortChange = useCallback(
    (sort: string) => {
      setActiveSortBy(sort);
      onSortChange?.(sort);
    },
    [onSortChange]
  );

  return (
    <section className={className}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {showHeader && (
          <div>
            <h2 className="text-lg font-semibold">
              {title || t('title' as never)}
            </h2>
            <p className="text-sm text-muted-foreground">
              {subtitle || t('subtitle' as never)}
            </p>
          </div>
        )}
        <GalleryCategoryTabs
          categories={categories}
          sortOptions={sortOptions}
          activeCategory={activeCategory}
          activeSortBy={activeSortBy}
          onCategoryChange={handleCategoryChange}
          onSortChange={handleSortChange}
          translationNamespace={translationNamespace}
        />
      </div>

      {/* Gallery */}
      <MasonryGallery items={sortedItems} gap={gap} onItemClick={onItemClick} />
    </section>
  );
}
