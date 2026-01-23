'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GeneratorPanel, type GeneratorData } from './generator-panel';
import { ResultPanelWrapper } from './result-panel-wrapper';
import type { Video } from '@/db';
import { uploadFile } from '@/storage';

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
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [currentVideoUuid, setCurrentVideoUuid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (data: GeneratorData) => {
      if (!isLoggedIn) {
        // Redirect to sign in
        router.push('/sign-in');
        return;
      }

      if (data.estimatedCredits > userCredits) {
        setError('Insufficient credits. Please purchase more credits to continue.');
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

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            imageUrl = uploadResult.url;
          }
        }

        // Generate video
        const response = await fetch('/api/v1/video/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: data.prompt,
            model: data.model,
            duration: data.duration,
            aspectRatio: data.aspectRatio,
            quality: data.quality,
            imageUrl,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate video');
        }

        const result = await response.json();
        setCurrentVideoUuid(result.data.videoUuid);
      } catch (err) {
        setIsGenerating(false);
        setError(err instanceof Error ? err.message : 'Failed to generate video');
      }
    },
    [isLoggedIn, userCredits, router]
  );

  const handleVideoComplete = useCallback((video: Video) => {
    setIsGenerating(false);
    setCurrentVideo(video);
    setCurrentVideoUuid(null);
  }, []);

  const handleGenerationFailed = useCallback((errorMsg?: string) => {
    setIsGenerating(false);
    setError(errorMsg || 'Video generation failed');
    setCurrentVideoUuid(null);
  }, []);

  const handleRegenerate = useCallback(() => {
    setCurrentVideo(null);
    setCurrentVideoUuid(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Main Content */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Generator Panel */}
        <div className="w-[400px] shrink-0 p-4 overflow-hidden">
          <GeneratorPanel
            toolType={toolType}
            isLoading={isGenerating}
            onSubmit={handleSubmit}
          />
        </div>

        {/* Result Panel */}
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
      </div>
    </div>
  );
}
