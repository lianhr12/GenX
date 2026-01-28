'use client';

import type { ToolPageConfig } from '@/config/tool-pages';
import { useLocaleRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { ImageGeneratorPanel, type ImageGeneratorData } from './image-generator-panel';
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

  // Poll for task status
  const pollTaskStatus = useCallback(
    async (taskId: string, prompt: string, model: string): Promise<GeneratedImage[]> => {
      const maxAttempts = 60; // Max 5 minutes (60 * 5 seconds)
      const pollInterval = 5000; // 5 seconds

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const response = await fetch(`/api/v1/image/status/${taskId}`);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to check task status');
        }

        const { status, images, error } = result.data;

        if (status === 'completed' && images) {
          return images.map((img: { url: string }, index: number) => ({
            id: `${taskId}-${index}`,
            url: img.url,
            prompt,
            model,
            createdAt: new Date(),
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
        const response = await fetch('/api/v1/image/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: data.prompt,
            model: data.model,
            aspectRatio: data.aspectRatio,
            quality: data.quality,
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

        const { taskId, status, images } = result.data;

        // If already completed (unlikely), use images directly
        if (status === 'completed' && images) {
          const newImages: GeneratedImage[] = images.map(
            (img: { url: string }, index: number) => ({
              id: `${taskId}-${index}`,
              url: img.url,
              prompt: data.prompt,
              model: data.model,
              createdAt: new Date(),
            })
          );
          setGeneratedImages((prev) => [...newImages, ...prev]);
        } else {
          // Poll for completion
          const newImages = await pollTaskStatus(taskId, data.prompt, data.model);
          setGeneratedImages((prev) => [...newImages, ...prev]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : tErrors('generateFailed')
        );
      } finally {
        setIsGenerating(false);
      }
    },
    [isLoggedIn, userCredits, router, tErrors, pollTaskStatus]
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
