'use client';

import { useState, useEffect } from 'react';
import { Play, Download, RefreshCw, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Video } from '@/db';
import { artStyles } from '@/config/art-styles';

// Sample style showcase for empty state
const styleShowcase = artStyles.slice(1).map((style) => ({
  id: style.id,
  name: style.name,
  icon: style.icon,
  description: style.description,
}));

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
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [activeStyleIndex, setActiveStyleIndex] = useState(0);

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
  }, [isGenerating, currentVideo]);

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
              <div className="text-5xl mb-4 animate-bounce">{activeStyle.icon}</div>
              <h4 className="text-lg font-semibold text-white mb-1">
                {activeStyle.name}
              </h4>
              <p className="text-sm text-zinc-400">{activeStyle.description}</p>

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
              Your creation will appear here
            </h3>
          </div>

          <p className="text-zinc-400 text-sm mb-6 max-w-sm mx-auto">
            Choose an art style, describe your video, and let AI transform your vision into stunning motion art.
          </p>

          {/* Feature highlights */}
          <div className="flex items-center justify-center gap-6 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              5 Art Styles
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              HD Quality
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
              30s Generation
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
            Generating your video...
          </h3>
          <p className="text-zinc-400 text-sm">
            This may take 2-5 minutes. You can leave this page and come back
            later.
          </p>
          {generatingProgress > 0 && (
            <div className="mt-4">
              <div className="w-48 h-2 mx-auto bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${generatingProgress}%` }}
                />
              </div>
              <p className="text-xs text-zinc-500 mt-2">{generatingProgress}%</p>
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
            Generation Failed
          </h3>
          <p className="text-zinc-400 text-sm mb-4">
            {currentVideo.errorMessage || 'Something went wrong. Please try again.'}
          </p>
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="flex items-center gap-2 px-4 py-2 mx-auto rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
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
              <span>Model: {currentVideo?.model || 'N/A'}</span>
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
                  Download
                </a>
              ) : (
                <span className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-zinc-800 text-zinc-500 cursor-not-allowed">
                  <Download className="h-4 w-4" />
                  Download
                </span>
              )}

              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-all"
                >
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
