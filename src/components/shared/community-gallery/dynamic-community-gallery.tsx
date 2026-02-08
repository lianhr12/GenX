'use client';

import { ReplicateButton } from '@/components/shared/replicate-button';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { ReplicateData } from '@/stores/creator-navigation-store';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Eye, Loader2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import {
  type GalleryCategory,
  GalleryCategoryTabs,
  type GallerySortOption,
} from './gallery-category-tabs';
import type { GalleryItemData } from './gallery-video-card';
import { MasonryGallery } from './masonry-gallery';

interface GalleryModalProps {
  item: GalleryItemData | null;
  isOpen: boolean;
  onClose: () => void;
  onView?: (item: GalleryItemData) => void;
  likeButton?: React.ReactNode;
  favoriteButton?: React.ReactNode;
  translationNamespace?: string;
  onReplicate?: (data: ReplicateData) => void;
}

function GalleryModal({
  item,
  isOpen,
  onClose,
  onView,
  likeButton,
  favoriteButton,
  translationNamespace = 'GalleryPage',
  onReplicate,
}: GalleryModalProps) {
  const t = useTranslations(translationNamespace as never);

  useEffect(() => {
    if (isOpen && item && onView) {
      onView(item);
    }
  }, [isOpen, item, onView]);

  if (!item) return null;

  // Determine if this is an image based on mediaType or presence of imageUrls
  const imageUrls = item.imageUrls || [];
  const isImage =
    item.mediaType === 'image' || (imageUrls.length > 0 && !item.videoUrl);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl border border-border bg-card p-0 shadow-2xl">
        <VisuallyHidden.Root>
          <DialogTitle>{item.prompt}</DialogTitle>
        </VisuallyHidden.Root>
        <div className="relative overflow-hidden rounded-lg">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Media content */}
          <div className="bg-black">
            {isImage ? (
              <div className="flex items-center justify-center min-h-[300px] max-h-[60vh]">
                <img
                  src={imageUrls[0] || item.thumbnailUrl}
                  alt={item.prompt}
                  className="max-w-full max-h-[60vh] object-contain"
                />
              </div>
            ) : (
              <div className="aspect-video">
                <video
                  src={item.videoUrl}
                  poster={item.thumbnailUrl}
                  controls
                  autoPlay
                  className="h-full w-full"
                />
              </div>
            )}
          </div>

          {/* Info section */}
          <div className="p-6 bg-card">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {item.artStyle || item.category || item.model}
              </span>
              <div className="flex items-center gap-3">
                {likeButton}
                {favoriteButton}
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">
                    {item.viewsCount ?? item.views ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {item.creatorName && (
              <p className="mt-2 text-sm text-muted-foreground">
                {t('card.by' as never, { name: item.creatorName } as never)}
              </p>
            )}

            {!item.hidePrompt && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  {t('modal.prompt' as never)}
                </p>
                <p className="mt-1 text-foreground">{item.prompt}</p>
              </div>
            )}

            <div className="mt-6">
              <ReplicateButton
                data={{
                  prompt: item.hidePrompt ? '' : item.prompt,
                  artStyle: item.artStyle,
                  aspectRatio: item.aspectRatio,
                  model: item.model,
                  mediaType: item.mediaType || (isImage ? 'image' : 'video'),
                }}
                variant="button"
                size="md"
                className="w-full sm:w-auto"
                onReplicate={onReplicate}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export interface DynamicCommunityGalleryProps {
  items: GalleryItemData[];
  categories?: GalleryCategory[];
  sortOptions?: GallerySortOption[];
  showHeader?: boolean;
  title?: string;
  subtitle?: string;
  translationNamespace?: string;
  activeCategory: string;
  activeSort: string;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
  isLoading?: boolean;
  isError?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  onItemView?: (item: GalleryItemData) => void;
  renderLikeButton?: (item: GalleryItemData) => React.ReactNode;
  renderFavoriteButton?: (item: GalleryItemData) => React.ReactNode;
  gap?: number;
  className?: string;
  onReplicate?: (data: ReplicateData) => void;
}

const defaultCategories: GalleryCategory[] = [
  { id: 'all', labelKey: 'all' },
  { id: 'cyberpunk', labelKey: 'cyberpunk' },
  { id: 'watercolor', labelKey: 'watercolor' },
  { id: 'oilPainting', labelKey: 'oilPainting' },
  { id: 'anime', labelKey: 'anime' },
  { id: 'fluidArt', labelKey: 'fluidArt' },
];

const defaultSortOptions: GallerySortOption[] = [
  { id: 'latest', labelKey: 'latest' },
  { id: 'popular', labelKey: 'popular' },
];

export function DynamicCommunityGallery({
  items,
  categories = defaultCategories,
  sortOptions = defaultSortOptions,
  showHeader = true,
  title,
  subtitle,
  translationNamespace = 'GalleryPage',
  activeCategory,
  activeSort,
  onCategoryChange,
  onSortChange,
  isLoading = false,
  isError = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  onItemView,
  renderLikeButton,
  renderFavoriteButton,
  gap = 16,
  className,
  onReplicate,
}: DynamicCommunityGalleryProps) {
  const t = useTranslations(translationNamespace as never);
  const [selectedItem, setSelectedItem] = useState<GalleryItemData | null>(
    null
  );

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && onLoadMore) {
      onLoadMore();
    }
  }, [inView, hasNextPage, isFetchingNextPage, onLoadMore]);

  const handleItemClick = useCallback((item: GalleryItemData) => {
    setSelectedItem(item);
  }, []);

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
          activeSortBy={activeSort}
          onCategoryChange={onCategoryChange}
          onSortChange={onSortChange}
          translationNamespace={translationNamespace}
        />
      </div>

      {/* Gallery */}
      <div className="mt-8">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-video rounded-xl bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('empty' as never)}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg font-medium">{t('empty' as never)}</p>
            <p className="text-muted-foreground mt-2">
              {t('emptyDescription' as never)}
            </p>
          </div>
        ) : (
          <MasonryGallery
            items={items}
            gap={gap}
            onItemClick={handleItemClick}
            onReplicate={onReplicate}
          />
        )}
      </div>

      {/* Load More Trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="mt-8 flex justify-center">
          {isFetchingNextPage ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t('loading' as never)}</span>
            </div>
          ) : (
            <Button variant="outline" onClick={onLoadMore}>
              {t('loadMore' as never)}
            </Button>
          )}
        </div>
      )}

      {!hasNextPage && items.length > 0 && (
        <div className="mt-8 text-center text-muted-foreground">
          {t('noMore' as never)}
        </div>
      )}

      {/* Modal */}
      <GalleryModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onView={onItemView}
        likeButton={
          selectedItem && renderLikeButton
            ? renderLikeButton(selectedItem)
            : null
        }
        favoriteButton={
          selectedItem && renderFavoriteButton
            ? renderFavoriteButton(selectedItem)
            : null
        }
        translationNamespace={translationNamespace}
        onReplicate={
          onReplicate
            ? (data: ReplicateData) => {
                setSelectedItem(null);
                onReplicate(data);
              }
            : undefined
        }
      />
    </section>
  );
}
