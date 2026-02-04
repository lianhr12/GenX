'use client';

// src/components/generator/core/CreatorModeSelector.tsx

import { cn } from '@/lib/utils';
import {
  ImageIcon,
  ImagePlayIcon,
  MusicIcon,
  PencilIcon,
  UserIcon,
  VideoIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCreatorState } from '../hooks/useCreatorState';
import type { CreatorMode, ModeSwitchBehavior } from '../types';

interface CreatorModeSelectorProps {
  allowedModes?: CreatorMode[];
  behavior?: ModeSwitchBehavior;
  className?: string;
}

const modeIcons: Record<CreatorMode, React.ReactNode> = {
  'text-to-video': <VideoIcon className="size-4" />,
  'image-to-video': <ImagePlayIcon className="size-4" />,
  'text-to-image': <ImageIcon className="size-4" />,
  'image-to-image': <PencilIcon className="size-4" />,
  'reference-to-video': <UserIcon className="size-4" />,
  audio: <MusicIcon className="size-4" />,
};

export function CreatorModeSelector({
  allowedModes = ['text-to-video', 'image-to-video', 'text-to-image'],
  behavior = 'switchable',
  className,
}: CreatorModeSelectorProps) {
  const t = useTranslations('Generator.modes');
  const { mode, setMode, isGenerating } = useCreatorState();

  if (behavior === 'locked') {
    return null;
  }

  const getModeLabel = (m: CreatorMode): string => {
    const labels: Record<CreatorMode, string> = {
      'text-to-video': t('textToVideo'),
      'image-to-video': t('imageToVideo'),
      'text-to-image': t('textToImage'),
      'image-to-image': t('imageToImage'),
      'reference-to-video': t('referenceToVideo'),
      audio: t('audio'),
    };
    return labels[m];
  };

  if (behavior === 'tabs') {
    return (
      <div
        className={cn(
          'flex items-center gap-1 rounded-lg bg-muted/50 p-1',
          className
        )}
      >
        {allowedModes.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            disabled={isGenerating}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all',
              mode === m
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {modeIcons[m]}
            <span>{getModeLabel(m)}</span>
          </button>
        ))}
      </div>
    );
  }

  // Switchable mode - dropdown style
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {allowedModes.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => setMode(m)}
          disabled={isGenerating}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors',
            mode === m
              ? 'bg-primary/10 text-primary'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          {modeIcons[m]}
          <span>{getModeLabel(m)}</span>
        </button>
      ))}
    </div>
  );
}
