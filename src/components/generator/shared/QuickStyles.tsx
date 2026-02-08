'use client';

// src/components/generator/shared/QuickStyles.tsx

import { cn } from '@/lib/utils';
import { RefreshCwIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { useCreatorState } from '../hooks/useCreatorState';
import type { QuickStyleItem } from '../types';

interface QuickStylesProps {
  items: QuickStyleItem[];
  /** 单次展示的标签数量 */
  visibleCount?: number;
  className?: string;
}

export function QuickStyles({
  items,
  visibleCount = 4,
  className,
}: QuickStylesProps) {
  const t = useTranslations('Generator.quickStyles');
  const { mode, setPrompt } = useCreatorState();
  const [startIndex, setStartIndex] = useState(0);

  // 根据当前 mode 过滤适用的 quick styles
  const filteredItems = useMemo(
    () => items.filter((item) => !item.modes || item.modes.includes(mode)),
    [items, mode]
  );

  // 当前展示的标签
  const visibleItems = useMemo(() => {
    if (filteredItems.length <= visibleCount) return filteredItems;
    const result: QuickStyleItem[] = [];
    for (let i = 0; i < visibleCount; i++) {
      result.push(filteredItems[(startIndex + i) % filteredItems.length]);
    }
    return result;
  }, [filteredItems, startIndex, visibleCount]);

  const handleShuffle = useCallback(() => {
    setStartIndex((prev) => (prev + visibleCount) % filteredItems.length);
  }, [filteredItems.length, visibleCount]);

  if (filteredItems.length === 0) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-2 overflow-hidden',
        className
      )}
    >
      {/* 刷新按钮 */}
      {filteredItems.length > visibleCount && (
        <button
          type="button"
          onClick={handleShuffle}
          className="shrink-0 p-1.5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
          aria-label={t('title')}
        >
          <RefreshCwIcon className="size-3.5" />
        </button>
      )}

      {/* 标签列表 */}
      <div className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPrompt(item.promptText)}
            className={cn(
              'shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap',
              'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            {t(`tags.${item.labelKey}` as never)}
          </button>
        ))}
      </div>
    </div>
  );
}
