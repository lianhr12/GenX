'use client';

import { useState, useEffect } from 'react';
import { Play, Download, RefreshCw, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Video } from '@/db';

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

  useEffect(() => {
    if (currentVideo?.videoUrl) {
      setVideoSrc(currentVideo.videoUrl);
    }
  }, [currentVideo]);

  // Empty state
  if (!isGenerating && !currentVideo) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-zinc-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Your creation will appear here
          </h3>
          <p className="text-zinc-400 text-sm">
            Configure the settings on the left and click Generate to create your
            video.
          </p>
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
              <a
                href={videoSrc || '#'}
                download
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  videoSrc
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                )}
              >
                <Download className="h-4 w-4" />
                Download
              </a>

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
