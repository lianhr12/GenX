'use client';

/**
 * Art Style Selector Component
 * Grid-based selector for choosing art styles
 */

import { cn } from '@/lib/utils';
import { artStyles, type ArtStyle } from '@/config/art-styles';

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
  return (
    <div className={cn('grid grid-cols-3 gap-2', className)}>
      {artStyles.map((style) => (
        <ArtStyleCard
          key={style.id}
          style={style}
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
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function ArtStyleCard({
  style,
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
      <span className="text-xs font-medium truncate w-full">{style.name}</span>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-500" />
      )}
    </button>
  );
}

export default ArtStyleSelector;
