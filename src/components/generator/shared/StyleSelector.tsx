'use client';

// src/components/generator/shared/StyleSelector.tsx

import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { defaultStyles } from '../config/defaults';

interface StyleSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

// 风格图标映射
const styleIcons: Record<string, string> = {
  default: '✨',
  cyberpunk: '🌃',
  watercolor: '🎨',
  'oil-painting': '🖼️',
  anime: '🎌',
  'fluid-art': '🌊',
};

export function StyleSelector({
  value = 'default',
  onChange,
  disabled = false,
  className,
}: StyleSelectorProps) {
  const t = useTranslations('Generator.styles');

  const getStyleLabel = (style: string): string => {
    const labels: Record<string, string> = {
      default: t('default'),
      cyberpunk: t('cyberpunk'),
      watercolor: t('watercolor'),
      'oil-painting': t('oilPainting'),
      anime: t('anime'),
      'fluid-art': t('fluidArt'),
    };
    return labels[style] || style;
  };

  return (
    <div className={cn('grid grid-cols-3 gap-2', className)}>
      {defaultStyles.map((style) => (
        <button
          key={style}
          type="button"
          onClick={() => onChange?.(style)}
          disabled={disabled}
          className={cn(
            'flex flex-col items-center gap-1.5 p-3 rounded-lg transition-all',
            value === style
              ? 'bg-primary/20 text-primary border-2 border-primary'
              : 'bg-muted text-muted-foreground border-2 border-transparent hover:border-muted-foreground/30'
          )}
        >
          <span className="text-xl">{styleIcons[style] || '🎨'}</span>
          <span className="text-xs font-medium">{getStyleLabel(style)}</span>
        </button>
      ))}
    </div>
  );
}
