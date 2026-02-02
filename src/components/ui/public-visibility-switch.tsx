'use client';

import { cn } from '@/lib/utils';
import { Globe, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Switch } from './switch';

interface PublicVisibilitySwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  showHint?: boolean;
}

export function PublicVisibilitySwitch({
  checked,
  onCheckedChange,
  disabled = false,
  className,
  showHint = true,
}: PublicVisibilitySwitchProps) {
  const t = useTranslations('ToolPage.generator');

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {checked ? (
            <Globe className="w-3.5 h-3.5 text-primary" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-muted-foreground" />
          )}
          <span className="text-sm font-medium text-foreground">
            {t('publicVisibility')}
          </span>
        </div>
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
        />
      </div>
      {showHint && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t('publicVisibilityHint')}
        </p>
      )}
    </div>
  );
}
