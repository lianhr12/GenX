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

  // Map model ID to provider and model
  const getProviderAndModel = (modelId: string): { provider: string; modelId: string } => {
    const modelMap: Record<string, { provider: string; modelId: string }> = {
      'dall-e-3': { provider: 'openai', modelId: 'dall-e-3' },
      'flux-1-1-pro': { provider: 'fal', modelId: 'fal-ai/flux-pro/v1.1' },
      'stable-diffusion-3': { provider: 'fal', modelId: 'fal-ai/stable-diffusion-v3-medium' },
    };
    return modelMap[modelId] || { provider: 'openai', modelId: 'dall-e-3' };
  };

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
        const { provider, modelId } = getProviderAndModel(data.model);
        
        // Generate images (one at a time for now)
        const newImages: GeneratedImage[] = [];
        
        for (let i = 0; i < data.numberOfImages; i++) {
          const response = await fetch('/api/generate-images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: data.prompt,
              provider,
              modelId,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || tErrors('generateFailed'));
          }

          const result = await response.json();
          
          if (result.image) {
            newImages.push({
              id: `${Date.now()}-${i}`,
              url: `data:image/png;base64,${result.image}`,
              prompt: data.prompt,
              model: data.model,
              createdAt: new Date(),
            });
          }
        }
        
        setGeneratedImages((prev) => [...newImages, ...prev]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : tErrors('generateFailed')
        );
      } finally {
        setIsGenerating(false);
      }
    },
    [isLoggedIn, userCredits, router, tErrors]
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
