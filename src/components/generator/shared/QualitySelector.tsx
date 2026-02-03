'use client';

// src/components/generator/shared/QualitySelector.tsx

import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { defaultQualities } from '../config/defaults';

interface QualitySelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  options?: string[];
  disabled?: boolean;
  className?: string;
}

export function QualitySelector({
  value = '720p',
  onChange,
  options = defaultQualities,
  disabled = false,
  className,
}: QualitySelectorProps) {
  const t = useTranslations('Generator.quality');

  return (
    <div className={cn('flex gap-2', className)}>
      {options.map((q) => (
        <button
          key={q}
          type="button"
          onClick={() => onChange?.(q)}
          disabled={disabled}
          className={cn(
            'flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all capitalize',
            value === q
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          {q}
        </button>
      ))}
    </div>
  );
}
