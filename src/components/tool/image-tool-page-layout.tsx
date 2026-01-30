'use client';

import type { ToolPageConfig } from '@/config/tool-pages';
import type { Image } from '@/db';
import { useImages } from '@/hooks/use-images';
import { useLocaleRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import {
  type ImageGeneratorData,
  ImageGeneratorPanel,
} from './image-generator-panel';
import { ImageResultPanel } from './image-result-panel';

interface ImageToolPageLayoutProps {
  config: ToolPageConfig;
  isLoggedIn?: boolean;
  userCredits?: number;
}

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  model: string;
  createdAt: Date;
  uuid?: string;
  isFavorite?: boolean;
}

export function ImageToolPageLayout({
  config,
  isLoggedIn = false,
  userCredits = 0,
}: ImageToolPageLayoutProps) {
  const router = useLocaleRouter();
  const tErrors = useTranslations('ToolPage.errors');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Use the images hook to fetch history (only for logged in users)
  const {
    images: historyImages,
    refresh: refreshHistory,
    updateImage,
  } = useImages({
    initialLimit: 20,
    autoFetch: isLoggedIn,
    status: 'COMPLETED',
  });

  // Convert history images to GeneratedImage format and merge with current session
  useEffect(() => {
    if (historyImages.length > 0 && generatedImages.length === 0) {
      const converted: GeneratedImage[] = historyImages.flatMap((img) => {
        const urls = (img.imageUrls as string[]) || [];
        return urls.map((url, index) => ({
          id: `${img.uuid}-${index}`,
          url,
          prompt: img.prompt,
          model: img.model,
          createdAt: new Date(img.createdAt),
          uuid: img.uuid,
          isFavorite: img.isFavorite,
        }));
      });
      setGeneratedImages(converted);
    }
  }, [historyImages, generatedImages.length]);

  // Poll for task status using imageUuid
  const pollTaskStatus = useCallback(
    async (
      imageUuid: string,
      prompt: string,
      model: string
    ): Promise<GeneratedImage[]> => {
      const maxAttempts = 60; // Max 5 minutes (60 * 5 seconds)
      const pollInterval = 5000; // 5 seconds

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const response = await fetch(`/api/v1/image/status/${imageUuid}`);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to check task status');
        }

        const { status, images, error } = result.data;

        if (status === 'completed' && images) {
          return images.map((img: { url: string }, index: number) => ({
            id: `${imageUuid}-${index}`,
            url: img.url,
            prompt,
            model,
            createdAt: new Date(),
            uuid: imageUuid,
          }));
        }

        if (status === 'failed') {
          throw new Error(error?.message || 'Image generation failed');
        }

        // Wait before next poll
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      }

      throw new Error('Image generation timed out');
    },
    []
  );

  const handleSubmit = useCallback(
    async (data: ImageGeneratorData) => {
      if (!isLoggedIn) {
        router.push('/auth/login');
        return;
      }

      if (data.estimatedCredits > userCredits) {
        setError(tErrors('insufficientCredits'));
        return;
      }

      setIsGenerating(true);
      setError(null);

      try {
        // Create image generation task
        // Map frontend quality values to API values
        const qualityMap: Record<string, string> = {
          standard: 'medium',
          hd: 'high',
        };
        const apiQuality = qualityMap[data.quality || 'standard'] || 'medium';

        const response = await fetch('/api/v1/image/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: data.prompt,
            model: data.model,
            aspectRatio: data.aspectRatio,
            quality: apiQuality,
            numberOfImages: data.numberOfImages,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || tErrors('generateFailed'));
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || tErrors('generateFailed'));
        }

        // Use imageUuid for polling (new format)
        const { imageUuid, taskId, status, images } = result.data;
        const pollId = imageUuid || taskId;

        // If already completed (unlikely), use images directly
        if (status === 'completed' && images) {
          const newImages: GeneratedImage[] = images.map(
            (img: { url: string }, index: number) => ({
              id: `${pollId}-${index}`,
              url: img.url,
              prompt: data.prompt,
              model: data.model,
              createdAt: new Date(),
              uuid: imageUuid,
            })
          );
          setGeneratedImages((prev) => [...newImages, ...prev]);
        } else {
          // Poll for completion using imageUuid
          const newImages = await pollTaskStatus(
            pollId,
            data.prompt,
            data.model
          );
          setGeneratedImages((prev) => [...newImages, ...prev]);
        }

        // Refresh history to include the new image
        refreshHistory();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : tErrors('generateFailed')
        );
      } finally {
        setIsGenerating(false);
      }
    },
    [isLoggedIn, userCredits, router, tErrors, pollTaskStatus, refreshHistory]
  );

  const handleClearImages = useCallback(() => {
    setGeneratedImages([]);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Tool Guide for new users */}
      {/* Note: ToolGuide currently supports video tools only */}

      {/* Main Content - Two column layout */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left: Generator Panel */}
        <div className="w-[360px] shrink-0 p-4 overflow-hidden">
          <ImageGeneratorPanel
            config={config}
            isLoading={isGenerating}
            isLoggedIn={isLoggedIn}
            onSubmit={handleSubmit}
          />
        </div>

        {/* Right: Result Panel */}
        <div className="flex-1 p-4 overflow-hidden">
          <div className="h-full rounded-xl bg-card border border-border overflow-hidden">
            {/* Error Display */}
            {error && (
              <div className="m-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            {/* Result Panel */}
            <ImageResultPanel
              images={generatedImages}
              isGenerating={isGenerating}
              onClear={handleClearImages}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageToolPageLayout;
