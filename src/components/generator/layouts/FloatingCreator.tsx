'use client';

// src/components/generator/layouts/FloatingCreator.tsx

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowUpIcon, Loader2Icon, PlusIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { getDefaultModel } from '../config/modes';
import { useCreditsCalculation } from '../hooks/useCreditsCalculation';
import type {
  CreatorMode,
  FloatingCreatorProps,
  GenerationParams,
} from '../types';

export function FloatingCreator({ mode, onGenerate }: FloatingCreatorProps) {
  const t = useTranslations('Generator.floating');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const params: GenerationParams = {
    mode,
    prompt,
    model: getDefaultModel(mode),
  };

  const credits = useCreditsCalculation(params);

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim() || isGenerating) return;

    try {
      setIsGenerating(true);
      await onGenerate(params);
    } finally {
      setIsGenerating(false);
      setPrompt('');
    }
  }, [prompt, isGenerating, onGenerate, params]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const showImageUpload =
    mode === 'image-to-video' || mode === 'reference-to-video';

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <div className="flex items-center gap-2 rounded-full bg-card border border-border shadow-lg px-4 py-2">
        {/* Image Upload Button (for image-to-video mode) */}
        {showImageUpload && (
          <button
            type="button"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            <PlusIcon className="w-4 h-4 text-muted-foreground" />
          </button>
        )}

        {/* Input */}
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('placeholder')}
          disabled={isGenerating}
          className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
        />

        {/* Credits + Submit */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {credits} Credits
          </span>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={handleSubmit}
            disabled={!prompt.trim() || isGenerating}
            className={cn(
              '!size-8 rounded-full border-none',
              prompt.trim()
                ? 'bg-white text-black hover:bg-white/90'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {isGenerating ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <ArrowUpIcon className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
