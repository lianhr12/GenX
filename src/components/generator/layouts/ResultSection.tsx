'use client';

// src/components/generator/layouts/ResultSection.tsx

import { Button } from '@/components/ui/button';
import { downloadFile, downloadVideo } from '@/lib/download';
import { cn } from '@/lib/utils';
import {
  CheckIcon,
  DownloadIcon,
  HeartIcon,
  ImageIcon,
  Loader2Icon,
  ShareIcon,
  VideoIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { CreatorMode, GenerationResult } from '../types';

interface ResultSectionProps {
  result: GenerationResult | null;
  mode: CreatorMode;
  isLoading?: boolean;
  className?: string;
  onDownload?: (result: GenerationResult) => void;
  onShare?: (result: GenerationResult) => void;
  onFavorite?: (result: GenerationResult) => void;
}

function EmptyState({ mode }: { mode: CreatorMode }) {
  const t = useTranslations('Generator.result');
  const isVideo = mode.includes('video');

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        {isVideo ? (
          <VideoIcon className="w-8 h-8 text-muted-foreground" />
        ) : (
          <ImageIcon className="w-8 h-8 text-muted-foreground" />
        )}
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        {t('emptyTitle')}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        {t('emptyDescription')}
      </p>
    </div>
  );
}

function LoadingState() {
  const t = useTranslations('Generator.result');

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Loader2Icon className="w-12 h-12 animate-spin text-primary mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">
        {t('generatingTitle')}
      </h3>
      <p className="text-sm text-muted-foreground">
        {t('generatingDescription')}
      </p>
    </div>
  );
}

interface ResultActionsProps {
  result: GenerationResult;
  onDownload?: (result: GenerationResult) => void;
  onShare?: (result: GenerationResult) => void;
  onFavorite?: (result: GenerationResult) => void;
}

function ResultActions({
  result,
  onDownload,
  onShare,
  onFavorite,
}: ResultActionsProps) {
  const t = useTranslations('Generator.result.actions');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Reset states when result changes
  useEffect(() => {
    setIsFavorited(false);
    setShareSuccess(false);
    setIsDownloading(false);
  }, [result.id]);

  const handleDownload = useCallback(async () => {
    if (!result.url || isDownloading) return;
    setIsDownloading(true);
    try {
      if (onDownload) {
        onDownload(result);
      } else {
        const isVideo = result.type === 'video';
        if (isVideo) {
          await downloadVideo(result.url, result.id);
        } else {
          await downloadFile(result.url, `${result.id}.png`);
        }
        toast.success(t('downloadSuccess'));
      }
    } catch {
      toast.error(t('downloadFailed'));
    } finally {
      setIsDownloading(false);
    }
  }, [result, isDownloading, onDownload, t]);

  const handleShare = useCallback(async () => {
    if (onShare) {
      onShare(result);
      return;
    }
    try {
      const shareUrl = result.url || window.location.href;
      if (navigator.share) {
        await navigator.share({
          title: result.prompt,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShareSuccess(true);
        toast.success(t('linkCopied'));
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch {
      // User cancelled share or error
    }
  }, [result, onShare, t]);

  const handleFavorite = useCallback(async () => {
    if (onFavorite) {
      onFavorite(result);
      return;
    }
    try {
      const isImage = result.type === 'image';
      const endpoint = isImage
        ? `/api/v1/image/${result.id}/favorite`
        : `/api/v1/video/${result.id}/favorite`;
      const response = await fetch(endpoint, { method: 'PATCH' });
      if (!response.ok) throw new Error('Failed to toggle favorite');
      const data = await response.json();
      setIsFavorited(data.data?.isFavorite ?? !isFavorited);
      toast.success(data.data?.isFavorite ? t('favorited') : t('unfavorited'));
    } catch {
      toast.error(t('favoriteFailed'));
    }
  }, [result, onFavorite, isFavorited, t]);

  return (
    <div className="flex items-center gap-2 mt-4">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={handleDownload}
        disabled={!result.url || isDownloading}
      >
        {isDownloading ? (
          <Loader2Icon className="w-4 h-4 animate-spin" />
        ) : (
          <DownloadIcon className="w-4 h-4" />
        )}
        {t('download')}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={handleShare}
        disabled={!result.url}
      >
        {shareSuccess ? (
          <CheckIcon className="w-4 h-4" />
        ) : (
          <ShareIcon className="w-4 h-4" />
        )}
        {t('share')}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={handleFavorite}
        disabled={!result.url}
      >
        <HeartIcon
          className={cn('w-4 h-4', isFavorited && 'fill-current text-red-500')}
        />
        {t('favorite')}
      </Button>
    </div>
  );
}

function VideoPreview({ result }: { result: GenerationResult }) {
  if (!result.url) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <VideoIcon className="w-12 h-12 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      <video
        src={result.url}
        controls
        className="w-full h-full object-contain"
        poster={result.thumbnailUrl}
      />
    </div>
  );
}

function ImagePreview({ result }: { result: GenerationResult }) {
  if (!result.url) {
    return (
      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
        <ImageIcon className="w-12 h-12 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="aspect-square bg-muted rounded-lg overflow-hidden">
      <img
        src={result.url}
        alt={result.prompt}
        className="w-full h-full object-contain"
      />
    </div>
  );
}

export function ResultSection({
  result,
  mode,
  isLoading = false,
  className,
  onDownload,
  onShare,
  onFavorite,
}: ResultSectionProps) {
  if (isLoading) {
    return (
      <div
        className={cn('rounded-xl bg-card border border-border p-6', className)}
      >
        <LoadingState />
      </div>
    );
  }

  if (!result) {
    return (
      <div
        className={cn('rounded-xl bg-card border border-border p-6', className)}
      >
        <EmptyState mode={mode} />
      </div>
    );
  }

  const isVideo = result.type === 'video';

  return (
    <div
      className={cn('rounded-xl bg-card border border-border p-6', className)}
    >
      {/* Preview */}
      {isVideo ? (
        <VideoPreview result={result} />
      ) : (
        <ImagePreview result={result} />
      )}

      {/* Info */}
      <div className="mt-4">
        <p className="text-sm text-foreground line-clamp-2">{result.prompt}</p>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span>{result.model}</span>
          {result.duration && <span>{result.duration}s</span>}
          {result.aspectRatio && <span>{result.aspectRatio}</span>}
          <span>{result.creditsUsed} Credits</span>
        </div>
      </div>

      {/* Actions */}
      <ResultActions
        result={result}
        onDownload={onDownload}
        onShare={onShare}
        onFavorite={onFavorite}
      />
    </div>
  );
}
