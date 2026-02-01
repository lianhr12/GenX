'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  ImageIcon,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  Video as VideoIcon,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import type { GalleryCategory } from './gallery-category-tabs';
import type { GalleryItemData } from './gallery-video-card';
import { MasonryGallery } from './masonry-gallery';

interface MediaPreviewModalProps {
  item: GalleryItemData | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: () => void;
  onToggleFavorite?: () => void;
  onDownload?: () => Promise<void>;
}

function MediaPreviewModal({
  item,
  isOpen,
  onClose,
  onDelete,
  onToggleFavorite,
  onDownload,
}: MediaPreviewModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  // Reset image index and download state when item changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setIsDownloading(false);
  }, [item?.id]);

  if (!item) return null;

  const isImage = item.mediaType === 'image';
  const imageUrls = item.imageUrls || [];
  const hasMultipleImages = imageUrls.length > 1;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? imageUrls.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === imageUrls.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none">
        <VisuallyHidden.Root>
          <DialogTitle>{item.prompt}</DialogTitle>
        </VisuallyHidden.Root>
        <div className="relative overflow-hidden rounded-2xl bg-card">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative aspect-video bg-black flex items-center justify-center">
            {isImage ? (
              // Image preview
              <>
                {imageUrls.length > 0 ? (
                  <img
                    src={imageUrls[currentImageIndex]}
                    alt={item.prompt}
                    className="max-w-full max-h-[60vh] object-contain"
                  />
                ) : item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.prompt}
                    className="max-w-full max-h-[60vh] object-contain"
                  />
                ) : (
                  <ImageIcon className="h-16 w-16 text-muted-foreground" />
                )}
                {/* Image navigation */}
                {hasMultipleImages && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {imageUrls.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setCurrentImageIndex(index)}
                          className={cn(
                            'w-2 h-2 rounded-full transition-colors',
                            index === currentImageIndex
                              ? 'bg-white'
                              : 'bg-white/50'
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              // Video preview
              <>
                {item.videoUrl ? (
                  <video
                    src={item.videoUrl}
                    controls
                    autoPlay
                    className="max-w-full max-h-[60vh] object-contain"
                  />
                ) : item.thumbnailUrl ? (
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url(${item.thumbnailUrl})`,
                      backgroundSize: 'contain',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    }}
                  />
                ) : (
                  <VideoIcon className="h-16 w-16 text-muted-foreground" />
                )}
              </>
            )}
          </div>

          <div className="p-4 border-t border-border">
            <p className="text-sm text-foreground mb-3 line-clamp-2">
              &ldquo;{item.prompt}&rdquo;
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {item.model && <span>Model: {item.model}</span>}
                {item.duration && <span>Duration: {item.duration}s</span>}
                {item.resolution && <span>Resolution: {item.resolution}</span>}
                {hasMultipleImages && (
                  <span>
                    {currentImageIndex + 1} / {imageUrls.length}
                  </span>
                )}
                {item.createdAt && (
                  <span>
                    Created: {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {onToggleFavorite && (
                  <button
                    type="button"
                    onClick={onToggleFavorite}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      item.isFavorite
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Heart
                      className={cn(
                        'h-4 w-4',
                        item.isFavorite && 'fill-current'
                      )}
                    />
                  </button>
                )}
                {onDownload && (item.videoUrl || imageUrls.length > 0) && (
                  <Button
                    onClick={async () => {
                      setIsDownloading(true);
                      try {
                        await onDownload();
                      } finally {
                        setIsDownloading(false);
                      }
                    }}
                    size="sm"
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {isDownloading ? 'Downloading...' : 'Download'}
                  </Button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={onDelete}
                    className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export interface VideoManagementGalleryProps {
  items: GalleryItemData[];
  categories?: GalleryCategory[];
  /** Media type for empty state display - 'video', 'image', or 'mixed' */
  mediaType?: 'video' | 'image' | 'mixed';
  showHeader?: boolean;
  title?: string;
  subtitle?: string;
  translationNamespace?: string;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  onDelete?: (item: GalleryItemData) => void;
  onBatchDelete?: (items: GalleryItemData[]) => void;
  onToggleFavorite?: (item: GalleryItemData) => void;
  onDownload?: (item: GalleryItemData) => Promise<void>;
  gap?: number;
  className?: string;
}

const defaultCategories: GalleryCategory[] = [
  { id: 'all', labelKey: 'all' },
  { id: 'COMPLETED', labelKey: 'completed' },
  { id: 'GENERATING', labelKey: 'generating' },
  { id: 'FAILED', labelKey: 'failed' },
  { id: 'favorites', labelKey: 'favorites' },
];

export function VideoManagementGallery({
  items,
  categories = defaultCategories,
  mediaType = 'video',
  showHeader = true,
  title,
  subtitle,
  translationNamespace = 'Dashboard.creations',
  activeCategory,
  onCategoryChange,
  searchQuery = '',
  onSearchChange,
  isLoading = false,
  isError = false,
  errorMessage,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  onRefresh,
  onDelete,
  onBatchDelete,
  onToggleFavorite,
  onDownload,
  gap = 16,
  className,
}: VideoManagementGalleryProps) {
  const t = useTranslations(translationNamespace as never);
  const [previewItem, setPreviewItem] = useState<GalleryItemData | null>(null);

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
    setPreviewItem(item);
  }, []);

  const handleDelete = useCallback(
    (item: GalleryItemData) => {
      onDelete?.(item);
    },
    [onDelete]
  );

  // Determine empty state key based on media type
  const emptyStateKey = mediaType === 'image' ? 'images' : 'videos';
  const EmptyIcon = mediaType === 'image' ? ImageIcon : VideoIcon;

  return (
    <section className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        {onSearchChange && (
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by prompt..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                activeCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {t(`filters.${category.labelKey}` as never)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && items.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-destructive text-sm">
            {errorMessage || 'An error occurred'}
          </p>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="mt-2 flex items-center gap-1.5 text-sm text-destructive hover:underline"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <EmptyIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">
            {t(`${emptyStateKey}.empty` as never)}
          </h3>
          <p className="text-muted-foreground text-sm">
            {t(`${emptyStateKey}.emptyHint` as never)}
          </p>
        </div>
      )}

      {/* Masonry Gallery */}
      {items.length > 0 && (
        <MasonryGallery items={items} gap={gap} onItemClick={handleItemClick} />
      )}

      {/* Load More */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Load More
          </Button>
        </div>
      )}

      {/* Preview Modal */}
      <MediaPreviewModal
        item={previewItem}
        isOpen={!!previewItem}
        onClose={() => setPreviewItem(null)}
        onDelete={
          onDelete && previewItem
            ? () => {
                handleDelete(previewItem);
                setPreviewItem(null);
              }
            : undefined
        }
        onToggleFavorite={
          onToggleFavorite && previewItem
            ? () => onToggleFavorite(previewItem)
            : undefined
        }
        onDownload={
          onDownload && previewItem ? () => onDownload(previewItem) : undefined
        }
      />
    </section>
  );
}
