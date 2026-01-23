'use client';

/**
 * Art Style Selector Component
 * Grid-based selector for choosing art styles
 */

import { cn } from '@/lib/utils';
import { artStyles, type ArtStyle } from '@/config/art-styles';
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
          ? 'bg-purple-600/20 border-purple-500 text-purple-400'
          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {/* Icon */}
      <span className="text-xl mb-1">{style.icon}</span>

      {/* Name */}
      <span className="text-xs font-medium truncate w-full">
        {t(`${translationKey}.name`)}
      </span>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-500" />
      )}
    </button>
  );
}

export default ArtStyleSelector;
