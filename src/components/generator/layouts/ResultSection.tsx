'use client';

// src/components/generator/layouts/ResultSection.tsx

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DownloadIcon,
  HeartIcon,
  ImageIcon,
  Loader2Icon,
  ShareIcon,
  VideoIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { CreatorMode, GenerationResult } from '../types';

interface ResultSectionProps {
  result: GenerationResult | null;
  mode: CreatorMode;
  isLoading?: boolean;
  className?: string;
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

function ResultActions({ result }: { result: GenerationResult }) {
  const t = useTranslations('Generator.result.actions');

  return (
    <div className="flex items-center gap-2 mt-4">
      <Button variant="outline" size="sm" className="gap-2">
        <DownloadIcon className="w-4 h-4" />
        {t('download')}
      </Button>
      <Button variant="outline" size="sm" className="gap-2">
        <ShareIcon className="w-4 h-4" />
        {t('share')}
      </Button>
      <Button variant="outline" size="sm" className="gap-2">
        <HeartIcon className="w-4 h-4" />
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
      <ResultActions result={result} />
    </div>
  );
}
