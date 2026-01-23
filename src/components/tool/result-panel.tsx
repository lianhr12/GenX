'use client';

import { artStyles } from '@/config/art-styles';
import type { Video } from '@/db';
import { cn } from '@/lib/utils';
import { Download, Loader2, Play, RefreshCw, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

// Style IDs for showcase (excluding default)
const styleShowcaseIds = [
  'cyberpunk',
  'watercolor',
  'oil-painting',
  'anime',
  'fluid-art',
];

// Map style id to translation key
const styleIdToKey: Record<string, string> = {
  cyberpunk: 'cyberpunk',
  watercolor: 'watercolor',
  'oil-painting': 'oilPainting',
  anime: 'anime',
  'fluid-art': 'fluidArt',
};

interface ResultPanelProps {
  currentVideo?: Video | null;
  isGenerating?: boolean;
  generatingProgress?: number;
  onRegenerate?: () => void;
}

export function ResultPanel({
  currentVideo,
  isGenerating = false,
  generatingProgress = 0,
  onRegenerate,
}: ResultPanelProps) {
  const t = useTranslations('ToolPage.result');
  const tStyles = useTranslations('ToolPage.artStyles');
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [activeStyleIndex, setActiveStyleIndex] = useState(0);

  // Get style showcase with icons from config
  const styleShowcase = styleShowcaseIds.map((id) => {
    const style = artStyles.find((s) => s.id === id);
    return {
      id,
      icon: style?.icon || '✨',
      translationKey: styleIdToKey[id],
    };
  });

  useEffect(() => {
    // Clear videoSrc when video changes or is null
    if (currentVideo?.videoUrl) {
      setVideoSrc(currentVideo.videoUrl);
    } else {
      setVideoSrc(null);
    }
  }, [currentVideo]);

  // Auto-cycle through styles in empty state
  useEffect(() => {
    if (!isGenerating && !currentVideo) {
      const interval = setInterval(() => {
        setActiveStyleIndex((prev) => (prev + 1) % styleShowcase.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isGenerating, currentVideo, styleShowcase.length]);

  // Empty state with style showcase
  if (!isGenerating && !currentVideo) {
    const activeStyle = styleShowcase[activeStyleIndex];

    return (
      <div className="h-full flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-lg">
          {/* Style showcase animation */}
          <div className="relative mb-8">
            {/* Background glow */}
            <div className="absolute inset-0 bg-purple-500/10 rounded-2xl blur-3xl" />

            {/* Style card */}
            <div className="relative bg-zinc-900/80 border border-zinc-700 rounded-2xl p-8 backdrop-blur-sm">
              <div className="text-5xl mb-4 animate-bounce">
                {activeStyle.icon}
              </div>
              <h4 className="text-lg font-semibold text-white mb-1">
                {tStyles(`${activeStyle.translationKey}.name` as never)}
              </h4>
              <p className="text-sm text-zinc-400">
                {tStyles(`${activeStyle.translationKey}.description` as never)}
              </p>

              {/* Style dots indicator */}
              <div className="flex items-center justify-center gap-2 mt-6">
                {styleShowcase.map((style, index) => (
                  <button
                    key={style.id}
                    onClick={() => setActiveStyleIndex(index)}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all',
                      index === activeStyleIndex
                        ? 'bg-purple-500 w-4'
                        : 'bg-zinc-600 hover:bg-zinc-500'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Main text */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <h3 className="text-xl font-semibold text-white">
              {t('emptyTitle')}
            </h3>
          </div>

          <p className="text-zinc-400 text-sm mb-6 max-w-sm mx-auto">
            {t('emptyDescription')}
          </p>

          {/* Feature highlights */}
          <div className="flex items-center justify-center gap-6 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {t('featureStyles')}
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {t('featureHD')}
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
              {t('featureSpeed')}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Generating state
  if (isGenerating) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
            <div
              className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"
              style={{
                transform: `rotate(${generatingProgress * 3.6}deg)`,
              }}
            />
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {t('generatingTitle')}
          </h3>
          <p className="text-zinc-400 text-sm">{t('generatingDescription')}</p>
          {generatingProgress > 0 && (
            <div className="mt-4">
              <div className="w-48 h-2 mx-auto bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${generatingProgress}%` }}
                />
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                {generatingProgress}%
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Failed state
  if (currentVideo?.status === 'FAILED') {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <span className="text-2xl">😢</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {t('failedTitle')}
          </h3>
          <p className="text-zinc-400 text-sm mb-4">
            {currentVideo.errorMessage || t('failedDescription')}
          </p>
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="flex items-center gap-2 px-4 py-2 mx-auto rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              {t('tryAgain')}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Completed state
  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-4">
        {/* Video Player */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          {videoSrc ? (
            <video
              src={videoSrc}
              controls
              className="w-full h-full object-contain"
              poster={currentVideo?.thumbnailUrl || undefined}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="h-12 w-12 text-zinc-500" />
            </div>
          )}
        </div>

        {/* Video Info */}
        {currentVideo && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span>
                {t('model')}: {currentVideo?.model || t('notAvailable')}
              </span>
              <span>•</span>
              <span>{currentVideo?.duration || 0}s</span>
              {currentVideo?.aspectRatio && (
                <>
                  <span>•</span>
                  <span>{currentVideo.aspectRatio}</span>
                </>
              )}
            </div>

            <p className="text-sm text-zinc-300 line-clamp-2">
              &ldquo;{currentVideo?.prompt || ''}&rdquo;
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              {videoSrc ? (
                <a
                  href={videoSrc}
                  download
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all bg-purple-600 text-white hover:bg-purple-700"
                >
                  <Download className="h-4 w-4" />
                  {t('download')}
                </a>
              ) : (
                <span className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-zinc-800 text-zinc-500 cursor-not-allowed">
                  <Download className="h-4 w-4" />
                  {t('download')}
                </span>
              )}

              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-all"
                >
                  <RefreshCw className="h-4 w-4" />
                  {t('regenerate')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
