'use client';

// src/components/generator/shared/PromptSuggestions.tsx

import { cn } from '@/lib/utils';
import { DicesIcon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { HOME_PROMPTS } from '../config/home-prompts';
import { useCreatorState } from '../hooks/useCreatorState';

interface PromptSuggestionsProps {
  className?: string;
}

export function PromptSuggestions({ className }: PromptSuggestionsProps) {
  const { prompt, setPrompt, mode } = useCreatorState();

  const filteredPrompts = useMemo(() => {
    const isImageMode = mode === 'text-to-image' || mode === 'image-to-image';
    const category = isImageMode ? 'image' : 'video';
    return HOME_PROMPTS.filter((p) => p.category === category);
  }, [mode]);

  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.floor(Math.random() * HOME_PROMPTS.length)
  );

  const currentPrompt = useMemo(() => {
    if (filteredPrompts.length === 0) return HOME_PROMPTS[0];
    return filteredPrompts[currentIndex % filteredPrompts.length];
  }, [currentIndex, filteredPrompts]);

  const handleShuffle = useCallback(() => {
    const len = filteredPrompts.length || 1;
    setCurrentIndex((prev) => {
      let next: number;
      do {
        next = Math.floor(Math.random() * len);
      } while (next === prev && len > 1);
      return next;
    });
  }, [filteredPrompts.length]);

  const handleApply = useCallback(() => {
    setPrompt(currentPrompt.prompt);
  }, [currentPrompt, setPrompt]);

  if (prompt.length > 0) return null;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        type="button"
        onClick={handleShuffle}
        className="shrink-0 p-1.5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Shuffle prompt"
      >
        <DicesIcon className="size-3.5" />
      </button>

      <button
        type="button"
        onClick={handleApply}
        className={cn(
          'min-w-0 flex-1 text-left truncate',
          'text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors',
          'cursor-pointer'
        )}
      >
        <span className="font-medium text-muted-foreground">
          {currentPrompt.title}
        </span>
        <span className="mx-1.5">·</span>
        <span className="truncate">{currentPrompt.prompt.slice(0, 80)}…</span>
      </button>
    </div>
  );
}
