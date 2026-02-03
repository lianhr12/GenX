'use client';

// src/components/generator/shared/AspectRatioSelector.tsx

import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { defaultAspectRatios } from '../config/defaults';

interface AspectRatioSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  options?: string[];
  disabled?: boolean;
  className?: string;
}

// 比例尺寸映射
const ratioSizes: Record<string, { width: string; height: string }> = {
  '16:9': { width: 'w-8', height: 'h-4' },
  '9:16': { width: 'w-4', height: 'h-8' },
  '1:1': { width: 'w-6', height: 'h-6' },
  '4:3': { width: 'w-6', height: 'h-4' },
  '3:4': { width: 'w-4', height: 'h-6' },
};

export function AspectRatioSelector({
  value = '16:9',
  onChange,
  options = defaultAspectRatios,
  disabled = false,
  className,
}: AspectRatioSelectorProps) {
  const t = useTranslations('Generator.aspectRatio');

  return (
    <div className={cn('flex gap-3', className)}>
      {options.map((ar) => {
        const sizes = ratioSizes[ar] || { width: 'w-6', height: 'h-4' };
        return (
          <button
            key={ar}
            type="button"
            onClick={() => onChange?.(ar)}
            disabled={disabled}
            className={cn(
              'flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all',
              value === ar
                ? 'bg-primary/20 text-primary border-2 border-primary'
                : 'bg-muted text-muted-foreground border-2 border-border hover:border-muted-foreground/50'
            )}
          >
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'border-2 rounded-sm',
                  value === ar
                    ? 'border-primary'
                    : 'border-muted-foreground/50',
                  sizes.width,
                  sizes.height
                )}
              />
              <span>{ar}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
