'use client';

/**
 * Image Generator Panel Component
 * Tool page generator panel for image generation
 */

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ToolPageConfig } from '@/config/tool-pages';
import { cn } from '@/lib/utils';
import { ChevronDown, Sparkles, Wand2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';

// ============================================================================
// Types
// ============================================================================

interface SectionLabelProps {
  children: React.ReactNode;
  required?: boolean;
}

function SectionLabel({ children, required }: SectionLabelProps) {
  return (
    <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2 block">
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </label>
  );
}

interface ImageGeneratorPanelProps {
  config: ToolPageConfig;
  isLoading?: boolean;
  isLoggedIn?: boolean;
  onSubmit?: (data: ImageGeneratorData) => void;
}

export interface ImageGeneratorData {
  model: string;
  prompt: string;
  aspectRatio: string;
  quality?: string;
  numberOfImages: number;
  estimatedCredits: number;
}

// Credit calculation for Evolink image models
const IMAGE_CREDITS: Record<string, number> = {
  'gpt-image-1.5': 8,
  'gpt-image-1.5-lite': 4,
  'seedream-4.5': 6,
  'seedream-4.0': 5,
  'nanobanana-pro': 10,
  'wan2.5': 5,
  default: 5,
};

export function ImageGeneratorPanel({
  config,
  isLoading = false,
  isLoggedIn = false,
  onSubmit,
}: ImageGeneratorPanelProps) {
  const t = useTranslations('ToolPage.generator');
  const tTitles = useTranslations('ToolPage.titles');

  const availableModels = config.generator.models.available;
  const defaultModel = config.generator.models.default || availableModels[0];

  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(defaultModel);
  const [aspectRatio, setAspectRatio] = useState(
    config.generator.defaults.aspectRatio || '1:1'
  );
  const [quality, setQuality] = useState('standard');
  const [numberOfImages, setNumberOfImages] = useState(
    config.generator.defaults.outputNumber || 1
  );

  const estimatedCredits = useMemo(() => {
    const baseCredits = IMAGE_CREDITS[selectedModel] || IMAGE_CREDITS.default;
    const qualityMultiplier = quality === 'hd' ? 1.5 : 1;
    return Math.ceil(baseCredits * qualityMultiplier * numberOfImages);
  }, [selectedModel, quality, numberOfImages]);

  const handleSubmit = useCallback(() => {
    if (!prompt.trim() || isLoading) return;

    const data: ImageGeneratorData = {
      model: selectedModel,
      prompt: prompt.trim(),
      aspectRatio,
      quality,
      numberOfImages,
      estimatedCredits,
    };

    onSubmit?.(data);
  }, [
    prompt,
    selectedModel,
    aspectRatio,
    quality,
    numberOfImages,
    estimatedCredits,
    isLoading,
    onSubmit,
  ]);

  const canSubmit = prompt.trim().length > 0 && !isLoading;

  return (
    <div className="h-full flex flex-col rounded-xl overflow-hidden">
      {/* Main Card */}
      <div className="flex-1 flex flex-col rounded-xl bg-card border border-border overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-3 bg-muted/50 border-b border-border shrink-0">
          <h2 className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
            {tTitles('aiImageGenerator')}
          </h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {/* Model Selection */}
          <div>
            <SectionLabel>{t('model')}</SectionLabel>
            <DropdownMenu>
              <DropdownMenuTrigger
                disabled={isLoading}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-foreground font-medium">
                    {selectedModel}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="bg-card border-border w-[300px]"
              >
                <DropdownMenuLabel className="text-muted-foreground text-xs uppercase tracking-wide">
                  {t('imageModels')}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                {availableModels.map((model) => (
                  <DropdownMenuItem
                    key={model}
                    onClick={() => setSelectedModel(model)}
                    className="text-foreground hover:bg-muted py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full',
                          selectedModel === model
                            ? 'bg-primary'
                            : 'bg-muted-foreground/50'
                        )}
                      />
                      <span className="font-medium">{model}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Prompt Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <SectionLabel required>{t('prompt')}</SectionLabel>
              <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Wand2 className="w-3 h-3" />
                <span>{t('enhance')}</span>
              </button>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={config.generator.promptPlaceholder || t('promptPlaceholder')}
              disabled={isLoading}
              className="w-full min-h-[120px] max-h-[200px] px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-primary transition-colors text-sm leading-relaxed"
              rows={5}
              maxLength={2000}
            />
          </div>

          {/* Settings Group */}
          <div className="space-y-5">
            {/* Aspect Ratio */}
            {config.generator.settings.showAspectRatio && (
              <div>
                <SectionLabel>{t('aspectRatio')}</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {(config.generator.settings.aspectRatios || ['1:1', '16:9', '9:16']).map(
                    (ar) => (
                      <button
                        key={ar}
                        type="button"
                        onClick={() => setAspectRatio(ar)}
                        disabled={isLoading}
                        className={cn(
                          'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                          aspectRatio === ar
                            ? 'bg-primary/20 text-primary border-2 border-primary'
                            : 'bg-muted text-muted-foreground border-2 border-border hover:border-muted-foreground/50'
                        )}
                      >
                        {ar}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Quality & Number of Images */}
            <div className="grid grid-cols-2 gap-3">
              {config.generator.settings.showQuality && (
                <div>
                  <SectionLabel>{t('quality')}</SectionLabel>
                  <div className="flex gap-2">
                    {(config.generator.settings.qualities || ['standard', 'hd']).map(
                      (q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setQuality(q)}
                          disabled={isLoading}
                          className={cn(
                            'flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all capitalize',
                            quality === q
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          )}
                        >
                          {q}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {config.generator.settings.showOutputNumber && (
                <div>
                  <SectionLabel>{t('numberOfImages')}</SectionLabel>
                  <div className="flex gap-2">
                    {(config.generator.settings.outputNumbers || [1, 2, 4]).map(
                      (n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setNumberOfImages(n)}
                          disabled={isLoading}
                          className={cn(
                            'flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                            numberOfImages === n
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          )}
                        >
                          {n}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section - Credits + Generate Button */}
        <div className="px-5 py-4 bg-muted/50 border-t border-border space-y-4 shrink-0">
          {/* Credits Display */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              {t('totalCredits')}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-foreground" />
              <span className="text-foreground font-medium">
                {t('credits', { count: estimatedCredits })}
              </span>
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all',
              canSubmit
                ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                {t('generating')}
              </>
            ) : !isLoggedIn ? (
              <>
                <Sparkles className="w-4 h-4" />
                {t('loginToGenerate')}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {t('generateImage')}
              </>
            )}
          </button>

          {/* Login hint for guests */}
          {!isLoggedIn && (
            <p className="text-xs text-muted-foreground text-center">
              {t('loginHint')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImageGeneratorPanel;
