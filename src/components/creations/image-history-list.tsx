'use client';

import type { Image } from '@/db';
import { useImages } from '@/hooks/use-images';
import { cn } from '@/lib/utils';
import {
  Download,
  Heart,
  ImageIcon,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash2,
  X,
  ZoomIn,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

type FilterStatus = 'all' | 'COMPLETED' | 'GENERATING' | 'FAILED' | 'favorites';

export function ImageHistoryList() {
  const t = useTranslations('Dashboard.creations');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [previewImage, setPreviewImage] = useState<Image | null>(null);

  const {
    images,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
    deleteImage,
    toggleFavorite,
    batchDelete,
  } = useImages({
    initialLimit: 20,
    status: filter === 'all' || filter === 'favorites' ? undefined : filter,
    isFavorite: filter === 'favorites' ? true : undefined,
    search: searchQuery || undefined,
    autoFetch: true,
  });

  const handleToggleSelect = useCallback((uuid: string) => {
    setSelectedImages((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) {
        next.delete(uuid);
      } else {
        next.add(uuid);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedImages.size === images.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(images.map((img) => img.uuid)));
    }
  }, [images, selectedImages.size]);

  const handleBatchDelete = useCallback(async () => {
    if (selectedImages.size === 0) return;
    const uuids = Array.from(selectedImages);
    await batchDelete(uuids);
    setSelectedImages(new Set());
  }, [selectedImages, batchDelete]);

  const handleDelete = useCallback(
    async (uuid: string) => {
      await deleteImage(uuid);
      setSelectedImages((prev) => {
        const next = new Set(prev);
        next.delete(uuid);
        return next;
      });
    },
    [deleteImage]
  );

  const handleDownload = useCallback((image: Image) => {
    const urls = (image.imageUrls as string[]) || [];
    urls.forEach((url, index) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${image.uuid}-${index}.png`;
      link.click();
    });
  }, []);

  const filters: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: t('filters.all') },
    { key: 'COMPLETED', label: t('filters.completed') },
    { key: 'GENERATING', label: t('filters.generating') },
    { key: 'FAILED', label: t('filters.failed') },
    { key: 'favorites', label: t('filters.favorites') },
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by prompt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                filter === f.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Batch Actions */}
      {selectedImages.size > 0 && (
        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted">
          <span className="text-sm font-medium">
            {t('batch.selected', { count: selectedImages.size })}
          </span>
          <button
            type="button"
            onClick={handleBatchDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <Trash2 className="h-4 w-4" />
            {t('batch.deleteSelected')}
          </button>
          <button
            type="button"
            onClick={() => setSelectedImages(new Set())}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && images.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-destructive text-sm">{error}</p>
          <button
            type="button"
            onClick={refresh}
            className="mt-2 flex items-center gap-1.5 text-sm text-destructive hover:underline"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && images.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">{t('images.empty')}</h3>
          <p className="text-muted-foreground text-sm">
            {t('images.emptyHint')}
          </p>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {images.map((image) => (
            <ImageCard
              key={image.uuid}
              image={image}
              isSelected={selectedImages.has(image.uuid)}
              onToggleSelect={() => handleToggleSelect(image.uuid)}
              onPreview={() => setPreviewImage(image)}
              onDelete={() => handleDelete(image.uuid)}
              onToggleFavorite={() => toggleFavorite(image.uuid)}
              onDownload={() => handleDownload(image)}
              t={t}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={loadMore}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}

      {/* Preview Modal */}
      {previewImage && (
        <ImagePreviewModal
          image={previewImage}
          onClose={() => setPreviewImage(null)}
          onDelete={() => {
            handleDelete(previewImage.uuid);
            setPreviewImage(null);
          }}
          onToggleFavorite={() => toggleFavorite(previewImage.uuid)}
          onDownload={() => handleDownload(previewImage)}
          t={t}
        />
      )}
    </div>
  );
}

interface ImageCardProps {
  image: Image;
  isSelected: boolean;
  onToggleSelect: () => void;
  onPreview: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onDownload: () => void;
  t: ReturnType<typeof useTranslations<'Dashboard.creations'>>;
}

function ImageCard({
  image,
  isSelected,
  onToggleSelect,
  onPreview,
  onDelete,
  onToggleFavorite,
  onDownload,
  t,
}: ImageCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const urls = (image.imageUrls as string[]) || [];
  const thumbnailUrl = image.thumbnailUrl || urls[0];

  const statusColors: Record<string, string> = {
    COMPLETED: 'bg-green-500',
    GENERATING: 'bg-yellow-500',
    PENDING: 'bg-yellow-500',
    FAILED: 'bg-red-500',
  };

  return (
    <div
      className={cn(
        'group relative aspect-square rounded-lg overflow-hidden border bg-muted transition-all',
        isSelected ? 'border-primary ring-2 ring-primary' : 'border-border'
      )}
    >
      {/* Checkbox */}
      <div className="absolute top-2 left-2 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="w-4 h-4 rounded border-border bg-background/80 backdrop-blur-sm"
        />
      </div>

      {/* Favorite Badge */}
      {image.isFavorite && (
        <div className="absolute top-2 right-2 z-10">
          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
        </div>
      )}

      {/* Image */}
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={image.prompt}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}

      {/* Status Badge */}
      {image.status !== 'COMPLETED' && (
        <div className="absolute bottom-2 left-2">
          <span
            className={cn(
              'px-2 py-0.5 rounded text-xs font-medium text-white',
              statusColors[image.status] || 'bg-gray-500'
            )}
          >
            {image.status}
          </span>
        </div>
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={onPreview}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          title={t('actions.viewDetails')}
        >
          <ZoomIn className="h-5 w-5 text-white" />
        </button>
        <button
          type="button"
          onClick={onDownload}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          title={t('actions.download')}
        >
          <Download className="h-5 w-5 text-white" />
        </button>
        <button
          type="button"
          onClick={onToggleFavorite}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          title={
            image.isFavorite ? t('actions.unfavorite') : t('actions.favorite')
          }
        >
          <Heart
            className={cn(
              'h-5 w-5',
              image.isFavorite ? 'fill-red-500 text-red-500' : 'text-white'
            )}
          />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          title={t('actions.delete')}
        >
          <Trash2 className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Model Badge */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="px-2 py-0.5 rounded bg-black/60 text-white text-xs">
          {image.model}
        </span>
      </div>
    </div>
  );
}

interface ImagePreviewModalProps {
  image: Image;
  onClose: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onDownload: () => void;
  t: ReturnType<typeof useTranslations<'Dashboard.creations'>>;
}

function ImagePreviewModal({
  image,
  onClose,
  onDelete,
  onToggleFavorite,
  onDownload,
  t,
}: ImagePreviewModalProps) {
  const urls = (image.imageUrls as string[]) || [];
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full max-h-[90vh] bg-card rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Image */}
        <div className="relative aspect-video bg-black flex items-center justify-center">
          {urls[currentIndex] ? (
            <img
              src={urls[currentIndex]}
              alt={image.prompt}
              className="max-w-full max-h-[60vh] object-contain"
            />
          ) : (
            <ImageIcon className="h-16 w-16 text-muted-foreground" />
          )}

          {/* Image Navigation */}
          {urls.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {urls.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-colors',
                    index === currentIndex ? 'bg-white' : 'bg-white/50'
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 border-t border-border">
          <p className="text-sm text-foreground mb-3 line-clamp-2">
            &ldquo;{image.prompt}&rdquo;
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Model: {image.model}</span>
              <span>
                Created: {new Date(image.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleFavorite}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  image.isFavorite
                    ? 'bg-red-500/10 text-red-500'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                <Heart
                  className={cn('h-4 w-4', image.isFavorite && 'fill-current')}
                />
              </button>
              <button
                type="button"
                onClick={onDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Download className="h-4 w-4" />
                {t('actions.download')}
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
