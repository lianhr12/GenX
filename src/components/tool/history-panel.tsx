'use client';

/**
 * History Panel Component
 * Displays recent video creations in a collapsible sidebar
 */

import type { Video } from '@/db';
import { LocaleLink } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { Locale } from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  History,
  Loader2,
  Play,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

// Map locale to date-fns locale
const dateLocales: Record<string, Locale> = {
  en: enUS,
  zh: zhCN,
};

interface HistoryPanelProps {
  isExpanded: boolean;
  onToggle: () => void;
  videos: Video[];
  isLoading?: boolean;
  onSelectVideo: (video: Video) => void;
  currentVideoId?: string;
  className?: string;
}

export function HistoryPanel({
  isExpanded,
  onToggle,
  videos,
  isLoading = false,
  onSelectVideo,
  currentVideoId,
  className,
}: HistoryPanelProps) {
  const t = useTranslations('ToolPage.history');
  const locale = useLocale();
  const dateLocale = dateLocales[locale] || enUS;

  // Filter to show only completed videos
  const completedVideos = videos.filter(
    (v) => v.status === 'COMPLETED' && v.videoUrl
  );

  return (
    <div
      className={cn(
        'flex flex-col bg-card border-l border-border transition-all duration-300',
        isExpanded ? 'w-[280px]' : 'w-[48px]',
        className
      )}
    >
      {/* Toggle Button Area */}
      <button
        onClick={onToggle}
        className={cn(
          'flex items-center gap-2 px-3 py-3 border-b border-border hover:bg-muted/50 transition-colors',
          isExpanded ? 'justify-between' : 'justify-center'
        )}
      >
        {isExpanded ? (
          <>
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground font-medium">
                {t('title')}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </>
        ) : (
          <div className="relative">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            {completedVideos.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-bold bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                {completedVideos.length > 9 ? '9+' : completedVideos.length}
              </span>
            )}
          </div>
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <>
          {/* Video List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
              </div>
            ) : completedVideos.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{t('noVideos')}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {t('noVideosHint')}
                </p>
              </div>
            ) : (
              completedVideos
                .slice(0, 10)
                .map((video) => (
                  <VideoHistoryCard
                    key={video.uuid}
                    video={video}
                    isSelected={currentVideoId === video.uuid}
                    onClick={() => onSelectVideo(video)}
                    dateLocale={dateLocale}
                    untitledText={t('untitled')}
                  />
                ))
            )}
          </div>

          {/* View All Link */}
          {completedVideos.length > 0 && (
            <div className="p-3 border-t border-border">
              <LocaleLink
                href="/dashboard"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <span>{t('viewAll')}</span>
                <ExternalLink className="w-3 h-3" />
              </LocaleLink>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface VideoHistoryCardProps {
  video: Video;
  isSelected: boolean;
  onClick: () => void;
  dateLocale: Locale;
  untitledText: string;
}

function VideoHistoryCard({
  video,
  isSelected,
  onClick,
  dateLocale,
  untitledText,
}: VideoHistoryCardProps) {
  const timeAgo = video.createdAt
    ? formatDistanceToNow(new Date(video.createdAt), {
        addSuffix: true,
        locale: dateLocale,
      })
    : '';

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-lg overflow-hidden transition-all group',
        'border-2',
        isSelected
          ? 'border-primary bg-primary/10'
          : 'border-border bg-muted hover:border-muted-foreground/50 hover:bg-muted/80'
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted">
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-6 h-6 text-muted-foreground/50" />
          </div>
        )}

        {/* Play overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="w-8 h-8 text-white" fill="white" />
        </div>

        {/* Duration badge */}
        {video.duration && (
          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-[10px] font-medium bg-black/70 text-white rounded">
            {video.duration}s
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-2">
        <p className="text-xs text-foreground line-clamp-2 leading-relaxed">
          {video.prompt || untitledText}
        </p>
        <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-muted-foreground">
          {video.aspectRatio && <span>{video.aspectRatio}</span>}
          {video.aspectRatio && timeAgo && <span>•</span>}
          {timeAgo && <span>{timeAgo}</span>}
        </div>
      </div>
    </button>
  );
}

export default HistoryPanel;
