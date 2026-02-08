'use client';

import { modeRoutes } from '@/components/generator/config/modes';
import type { CreatorMode } from '@/components/generator/types';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useLocaleRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import type { ReplicateData } from '@/stores/creator-navigation-store';
import { useCreatorNavigationStore } from '@/stores/creator-navigation-store';
import { Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';

interface ReplicateButtonProps {
  data: ReplicateData;
  className?: string;
  size?: 'sm' | 'md';
  variant?: 'icon' | 'button';
}

function resolveTargetRoute(data: ReplicateData): string {
  const { mediaType, model, targetMode } = data;

  if (targetMode) {
    return modeRoutes[targetMode];
  }

  if (mediaType === 'image') {
    return modeRoutes['text-to-image'];
  }

  if (mediaType === 'video') {
    if (model) {
      const lowerModel = model.toLowerCase();
      if (
        lowerModel.includes('image-to-video') ||
        lowerModel.includes('i2v')
      ) {
        return modeRoutes['image-to-video'];
      }
      if (
        lowerModel.includes('reference') ||
        lowerModel.includes('omnihuman')
      ) {
        return modeRoutes['reference-to-video'];
      }
    }
    return modeRoutes['text-to-video'];
  }

  return '/create';
}

export function getTargetMode(data: ReplicateData): CreatorMode | null {
  const { mediaType, model } = data;

  if (mediaType === 'image') return 'text-to-image';

  if (mediaType === 'video') {
    if (model) {
      const lowerModel = model.toLowerCase();
      if (
        lowerModel.includes('image-to-video') ||
        lowerModel.includes('i2v')
      ) {
        return 'image-to-video';
      }
      if (
        lowerModel.includes('reference') ||
        lowerModel.includes('omnihuman')
      ) {
        return 'reference-to-video';
      }
    }
    return 'text-to-video';
  }

  return null;
}

export function ReplicateButton({
  data,
  className,
  size = 'sm',
  variant = 'icon',
}: ReplicateButtonProps) {
  const t = useTranslations('Common');
  const router = useLocaleRouter();
  const setReplicateData = useCreatorNavigationStore(
    (s) => s.setReplicateData,
  );

  const handleReplicate = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setReplicateData(data);
      const route = resolveTargetRoute(data);
      router.push(route);
    },
    [data, setReplicateData, router],
  );

  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const btnSize =
    size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';

  if (variant === 'icon') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleReplicate}
            className={cn(
              'flex items-center justify-center rounded-full',
              'bg-black/50 text-white backdrop-blur-sm',
              'hover:bg-primary hover:text-white',
              'transition-all duration-200',
              btnSize,
              className,
            )}
            aria-label={t('replicate' as Parameters<typeof t>[0])}
          >
            <Copy className={iconSize} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {t('replicate' as Parameters<typeof t>[0])}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <button
      type="button"
      onClick={handleReplicate}
      className={cn(
        'inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg px-3 py-1.5',
        'bg-black/50 text-white text-sm backdrop-blur-sm',
        'hover:bg-primary hover:text-white',
        'transition-all duration-200',
        className,
      )}
    >
      <Copy className={iconSize} />
      <span>{t('replicate' as Parameters<typeof t>[0])}</span>
    </button>
  );
}
