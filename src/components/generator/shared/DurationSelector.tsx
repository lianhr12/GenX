'use client';

// src/components/generator/shared/DurationSelector.tsx

import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { defaultDurations } from '../config/defaults';

interface DurationSelectorProps {
  value?: number;
  onChange?: (value: number) => void;
  options?: number[];
  disabled?: boolean;
  className?: string;
}

export function DurationSelector({
  value = 5,
  onChange,
  options = defaultDurations,
  disabled = false,
  className,
}: DurationSelectorProps) {
  const t = useTranslations('Generator.duration');

  return (
    <div className={cn('flex gap-2', className)}>
      {options.map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => onChange?.(d)}
          disabled={disabled}
          className={cn(
            'flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
            value === d
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          {d}s
        </button>
      ))}
    </div>
  );
}
