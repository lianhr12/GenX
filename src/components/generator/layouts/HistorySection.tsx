'use client';

// src/components/generator/layouts/HistorySection.tsx

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ImageIcon, Loader2Icon, VideoIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
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

  // TODO: 使用 React Query 获取历史记录
  // const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery({
  //   queryKey: ['generation-history', mode],
  //   queryFn: ({ pageParam }) => fetchHistory({ mode, cursor: pageParam }),
  //   getNextPageParam: (lastPage) => lastPage.nextCursor,
  // });

  // 模拟数据
  const items: GenerationResult[] = [];
  const hasNextPage = false;
  const isLoading = false;

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
            // onClick={() => fetchNextPage()}
            disabled={isLoading}
          >
            {isLoading ? (
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
    </div>
  );
}
