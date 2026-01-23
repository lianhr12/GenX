'use client';

import { useState, useCallback, useEffect } from 'react';
import { useLocaleRouter } from '@/i18n/navigation';
import { GeneratorPanel, type GeneratorData } from './generator-panel';
import { ResultPanelWrapper } from './result-panel-wrapper';
import { HistoryPanel } from './history-panel';
import type { Video } from '@/db';
import { applyArtStyleToPrompt } from '@/config/art-styles';
import { useTranslations } from 'next-intl';

interface ToolPageLayoutProps {
  toolType: 'image-to-video' | 'text-to-video' | 'reference-to-video';
  isLoggedIn?: boolean;
  userCredits?: number;
}

export function ToolPageLayout({
  toolType,
  isLoggedIn = false,
  userCredits = 0,
}: ToolPageLayoutProps) {
  const router = useLocaleRouter();
  const tErrors = useTranslations('ToolPage.errors');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [currentVideoUuid, setCurrentVideoUuid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // History panel state
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);
  const [historyVideos, setHistoryVideos] = useState<Video[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Fetch user's video history
  const fetchHistory = useCallback(async () => {
    if (!isLoggedIn) return;

    setIsLoadingHistory(true);
    try {
      const response = await fetch('/api/v1/video/list?limit=10');
      if (response.ok) {
        const result = await response.json();
        // API returns { success: true, data: { videos, total, hasMore } }
        if (result.success && result.data) {
          setHistoryVideos(result.data.videos || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch video history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [isLoggedIn]);

  // Load history on mount and when login status changes
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Handle selecting a video from history
  const handleSelectHistoryVideo = useCallback((video: Video) => {
    setCurrentVideo(video);
    setCurrentVideoUuid(null);
    setError(null);
    setIsGenerating(false);
  }, []);

  const handleSubmit = useCallback(
    async (data: GeneratorData) => {
      if (!isLoggedIn) {
        // Redirect to login page
        router.push('/auth/login');
        return;
      }

      if (data.estimatedCredits > userCredits) {
        setError(tErrors('insufficientCredits'));
        return;
      }

      setIsGenerating(true);
      setError(null);
      setCurrentVideo(null);

      try {
        let imageUrl: string | undefined;

        // Upload image if provided
        if (data.imageFile) {
          const formData = new FormData();
          formData.append('file', data.imageFile);

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!uploadResponse.ok) {
            throw new Error(tErrors('uploadFailed'));
          }

          const uploadResult = await uploadResponse.json();
          imageUrl = uploadResult.url;

          if (!imageUrl) {
            throw new Error(tErrors('uploadNoUrl'));
          }
        }

        // Apply art style to prompt if provided
        const finalPrompt = data.artStyle
          ? applyArtStyleToPrompt(data.prompt, data.artStyle)
          : data.prompt;

        // Generate video
        const response = await fetch('/api/v1/video/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: finalPrompt,
            model: data.model,
            duration: data.duration,
            aspectRatio: data.aspectRatio,
            quality: data.quality,
            imageUrl,
            artStyle: data.artStyle,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || tErrors('generateFailed'));
        }

        const result = await response.json();
        const videoUuid = result?.data?.videoUuid;
        if (!videoUuid) {
          throw new Error(tErrors('noTrackingId'));
        }
        setCurrentVideoUuid(videoUuid);
      } catch (err) {
        setIsGenerating(false);
        setError(err instanceof Error ? err.message : tErrors('generateFailed'));
      }
    },
    [isLoggedIn, userCredits, router, tErrors]
  );

  const handleVideoComplete = useCallback((video: Video) => {
    setIsGenerating(false);
    setCurrentVideo(video);
    setCurrentVideoUuid(null);
    // Refresh history to include the new video
    fetchHistory();
  }, [fetchHistory]);

  const handleGenerationFailed = useCallback((errorMsg?: string) => {
    setIsGenerating(false);
    setError(errorMsg || tErrors('generationFailed'));
    setCurrentVideoUuid(null);
  }, [tErrors]);

  const handleRegenerate = useCallback(() => {
    setCurrentVideo(null);
    setCurrentVideoUuid(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Main Content - Three column layout */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left: Generator Panel */}
        <div className="w-[360px] shrink-0 p-4 overflow-hidden">
          <GeneratorPanel
            toolType={toolType}
            isLoading={isGenerating}
            onSubmit={handleSubmit}
          />
        </div>

        {/* Center: Result Panel */}
        <div className="flex-1 p-4 overflow-hidden">
          <div className="h-full rounded-xl bg-[#1A1A1A] border border-zinc-800 overflow-hidden">
            {/* Error Display */}
            {error && (
              <div className="m-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Result Panel Wrapper */}
            <ResultPanelWrapper
              currentVideo={currentVideo}
              isGenerating={isGenerating}
              videoUuid={currentVideoUuid}
              onVideoComplete={handleVideoComplete}
              onGenerationFailed={handleGenerationFailed}
              onRegenerate={handleRegenerate}
            />
          </div>
        </div>

        {/* Right: History Panel (only show when logged in) */}
        {isLoggedIn && (
          <HistoryPanel
            isExpanded={isHistoryExpanded}
            onToggle={() => setIsHistoryExpanded(!isHistoryExpanded)}
            videos={historyVideos}
            isLoading={isLoadingHistory}
            onSelectVideo={handleSelectHistoryVideo}
            currentVideoId={currentVideo?.uuid}
          />
        )}
      </div>
    </div>
  );
}
