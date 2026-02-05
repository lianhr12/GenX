'use client';

// src/components/generator/layouts/HistorySection.tsx

import { listImagesAction } from '@/actions/generate-image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ImageIcon, Loader2Icon, VideoIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import type { CreatorMode, GenerationResult } from '../types';

interface HistorySectionProps {
  mode: CreatorMode;
  className?: string;
}

interface HistoryCardProps {
  item: GenerationResult;
  onClick?: () => void;
}

function HistoryCard({ item, onClick }: HistoryCardProps) {
  const isVideo = item.type === 'video';

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative aspect-video rounded-lg overflow-hidden bg-muted hover:ring-2 hover:ring-primary transition-all"
    >
      {item.thumbnailUrl ? (
        <img
          src={item.thumbnailUrl}
          alt={item.prompt}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          {isVideo ? (
            <VideoIcon className="w-8 h-8 text-muted-foreground" />
          ) : (
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
        <p className="text-xs text-white line-clamp-2">{item.prompt}</p>
      </div>

      {/* Status Badge */}
      {item.status === 'processing' && (
        <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <Loader2Icon className="w-3 h-3 animate-spin" />
          Processing
        </div>
      )}
    </button>
  );
}

export function HistorySection({ mode, className }: HistorySectionProps) {
  const t = useTranslations('Generator.history');
  const [items, setItems] = useState<GenerationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Determine if this is an image or video mode
  const isImageMode = mode === 'text-to-image' || mode === 'image-to-image';

  // Fetch history
  const fetchHistory = useCallback(
    async (pageNum: number, append = false) => {
      if (!isImageMode) {
        // Video history - TODO: implement
        setIsLoading(false);
        return;
      }

      try {
        const result = await listImagesAction({
          page: pageNum,
          limit: 12,
          status: 'COMPLETED',
        });

        if (result?.data?.success && result.data.data) {
          const data = result.data.data;

          // Transform to GenerationResult format
          const newItems: GenerationResult[] = data.images.map((img) => ({
            id: img.uuid,
            type: 'image' as const,
            url: (img.imageUrls as string[])?.[0] || '',
            thumbnailUrl: img.thumbnailUrl || (img.imageUrls as string[])?.[0],
            prompt: img.prompt,
            model: img.model,
            creditsUsed: img.creditsUsed,
            createdAt: new Date(img.createdAt),
            status:
              img.status === 'COMPLETED'
                ? ('completed' as const)
                : img.status === 'FAILED'
                  ? ('failed' as const)
                  : img.status === 'GENERATING'
                    ? ('processing' as const)
                    : ('pending' as const),
          }));

          if (append) {
            setItems((prev) => [...prev, ...newItems]);
          } else {
            setItems(newItems);
          }

          setHasNextPage(data.page < data.totalPages);
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [isImageMode]
  );

  // Initial fetch
  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || !hasNextPage) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchHistory(nextPage, true);
  }, [isLoadingMore, hasNextPage, page, fetchHistory]);

  if (items.length === 0 && !isLoading) {
    return (
      <div
        className={cn('rounded-xl bg-card border border-border p-6', className)}
      >
        <h3 className="text-sm font-medium text-foreground mb-4">
          {t('title')}
        </h3>
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('rounded-xl bg-card border border-border p-6', className)}
    >
      <h3 className="text-sm font-medium text-foreground mb-4">{t('title')}</h3>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2Icon className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {items.map((item) => (
              <HistoryCard key={item.id} item={item} />
            ))}
          </div>

          {hasNextPage && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <Loader2Icon className="w-4 h-4 animate-spin mr-2" />
                    {t('loading')}
                  </>
                ) : (
                  t('loadMore')
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
