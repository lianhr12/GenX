'use client';

// src/components/generator/shared/CreditsDisplay.tsx

import { cn } from '@/lib/utils';
import { CoinsIcon } from 'lucide-react';

interface CreditsDisplayProps {
  credits: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CreditsDisplay({
  credits,
  showIcon = true,
  size = 'md',
  className,
}: CreditsDisplayProps) {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 'size-3',
    md: 'size-4',
    lg: 'size-5',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 text-muted-foreground',
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <CoinsIcon className={iconSizes[size]} />}
      <span>{credits} Credits</span>
    </div>
  );
}
