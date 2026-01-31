'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useCurrentUser } from '@/hooks/use-current-user';
import {
  type GalleryItem,
  useGalleryList,
  useGalleryView,
} from '@/hooks/use-gallery';
import { LocaleLink } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Eye, Heart, Loader2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { GalleryCard, GalleryCardSkeleton } from './gallery-card';
import { GalleryFilters } from './gallery-filters';
import { GalleryLikeButton } from './gallery-like-button';

interface GalleryModalProps {
  item: GalleryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

function GalleryModal({ item, isOpen, onClose }: GalleryModalProps) {
  const t = useTranslations('GalleryPage');
  const { mutate: incrementView } = useGalleryView();

  // Increment view when modal opens
  useEffect(() => {
    if (isOpen && item) {
      incrementView(item.id);
    }
  }, [isOpen, item, incrementView]);

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none">
        <VisuallyHidden.Root>
          <DialogTitle>{item.prompt}</DialogTitle>
        </VisuallyHidden.Root>
        <div className="relative overflow-hidden rounded-2xl bg-background">
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Video */}
          <div className="aspect-video">
            <video
              src={item.videoUrl}
              poster={item.thumbnailUrl}
              controls
              autoPlay
              className="h-full w-full"
            />
          </div>

          {/* Info */}
          <div className="p-6">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {item.artStyle}
              </span>
              <div className="flex items-center gap-3">
                <GalleryLikeButton
                  galleryItemId={item.id}
                  initialLikesCount={item.likesCount}
                  initialIsLiked={item.isLiked}
                />
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">{item.viewsCount}</span>
                </div>
              </div>
            </div>

            {item.creatorName && (
              <p className="mt-2 text-sm text-muted-foreground">
                {t('card.by', { name: item.creatorName })}
              </p>
            )}

            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                {t('modal.prompt')}
              </p>
              <p className="mt-1 text-foreground">{item.prompt}</p>
            </div>

            <div className="mt-6">
              <Button asChild className="w-full sm:w-auto">
                <LocaleLink href="/create/image-to-video">
                  {t('modal.createSimilar')}
                </LocaleLink>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function GalleryPageClient() {
  const t = useTranslations('GalleryPage');
  const user = useCurrentUser();
  const [activeStyle, setActiveStyle] = useState('all');
  const [activeSort, setActiveSort] = useState<'latest' | 'popular'>('latest');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useGalleryList({
    artStyle: activeStyle === 'all' ? undefined : activeStyle,
    sort: activeSort,
    userId: user?.id,
  });

  // Infinite scroll trigger
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allItems = data?.pages.flatMap((page) => page.items) || [];

  const handleStyleChange = useCallback((style: string) => {
    setActiveStyle(style);
  }, []);

  const handleSortChange = useCallback((sort: 'latest' | 'popular') => {
    setActiveSort(sort);
  }, []);

  return (
    <>
      {/* Filters */}
      <GalleryFilters
        activeStyle={activeStyle}
        activeSort={activeSort}
        onStyleChange={handleStyleChange}
        onSortChange={handleSortChange}
      />

      {/* Gallery Grid */}
      <div className="mt-12">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <GalleryCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('empty')}</p>
          </div>
        ) : allItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg font-medium">{t('empty')}</p>
            <p className="text-muted-foreground mt-2">
              {t('emptyDescription')}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {allItems.map((item) => (
              <GalleryCard
                key={item.uuid}
                item={item}
                onClick={() => setSelectedItem(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Load More Trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="mt-8 flex justify-center">
          {isFetchingNextPage ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t('loading')}</span>
            </div>
          ) : (
            <Button variant="outline" onClick={() => fetchNextPage()}>
              {t('loadMore')}
            </Button>
          )}
        </div>
      )}

      {!hasNextPage && allItems.length > 0 && (
        <div className="mt-8 text-center text-muted-foreground">
          {t('noMore')}
        </div>
      )}

      {/* Modal */}
      <GalleryModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
}
