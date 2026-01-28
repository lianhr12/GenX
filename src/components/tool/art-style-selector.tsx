'use client';

/**
 * Art Style Selector Component
 * Grid-based selector for choosing art styles
 */

import { type ArtStyle, artStyles } from '@/config/art-styles';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

// Map style id to translation key
const styleIdToKey: Record<string, string> = {
  default: 'default',
  cyberpunk: 'cyberpunk',
  watercolor: 'watercolor',
  'oil-painting': 'oilPainting',
  anime: 'anime',
  'fluid-art': 'fluidArt',
};

interface ArtStyleSelectorProps {
  value: string;
  onChange: (styleId: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ArtStyleSelector({
  value,
  onChange,
  disabled = false,
  className,
}: ArtStyleSelectorProps) {
  const t = useTranslations('ToolPage.artStyles');

  return (
    <div className={cn('grid grid-cols-3 gap-2', className)}>
      {artStyles.map((style) => (
        <ArtStyleCard
          key={style.id}
          style={style}
          translationKey={styleIdToKey[style.id] || 'default'}
          t={t}
          isSelected={value === style.id}
          onClick={() => onChange(style.id)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

interface ArtStyleCardProps {
  style: ArtStyle;
  translationKey: string;
  t: ReturnType<typeof useTranslations>;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function ArtStyleCard({
  style,
  translationKey,
  t,
  isSelected,
  onClick,
  disabled,
}: ArtStyleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative flex flex-col items-center justify-center p-3 rounded-lg transition-all',
        'border-2 text-center',
        isSelected
          ? 'bg-primary/20 border-primary text-primary'
          : 'bg-muted border-border text-muted-foreground hover:border-muted-foreground/50 hover:bg-muted/80',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {/* Icon */}
      <span className="text-xl mb-1">{style.icon}</span>

      {/* Name */}
      <span className="text-xs font-medium truncate w-full">
        {t(`${translationKey}.name` as never)}
      </span>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
      )}
    </button>
  );
}

export default ArtStyleSelector;
