'use client';

import { Badge } from '@/components/ui/badge';
import type { VideoTool } from '@/config/create';
import { LocaleLink } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import {
  Eraser,
  Film,
  type LucideIcon,
  Maximize2,
  Mic,
  Sparkles,
  Type,
  Wand2,
  ZoomIn,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

const iconMap: Record<string, LucideIcon> = {
  Film,
  Type,
  Sparkles,
  Maximize2,
  ZoomIn,
  Mic,
  Wand2,
  Eraser,
};

interface ToolCardProps {
  tool: VideoTool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const t = useTranslations('CreatePageNew.tools');
  const Icon = iconMap[tool.icon] || Sparkles;

  return (
    <LocaleLink
      href={tool.href}
      className="group flex-shrink-0 w-[160px] md:w-[180px]"
    >
      <div className="relative overflow-hidden rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:border-primary/50">
        {/* Icon with gradient background */}
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
            'bg-gradient-to-br',
            tool.gradient
          )}
        >
          <Icon className="size-5 text-white" />
        </div>

        {/* Title and badges */}
        <div className="flex items-start gap-1.5 mb-1">
          <h3 className="font-medium text-sm line-clamp-1">
            {t(`items.${tool.titleKey}` as never)}
          </h3>
          {tool.isNew && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1 py-0 bg-green-500/10 text-green-600 border-0"
            >
              NEW
            </Badge>
          )}
          {tool.isPro && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1 py-0 bg-amber-500/10 text-amber-600 border-0"
            >
              PRO
            </Badge>
          )}
          {tool.badge === 'hot' && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1 py-0 bg-red-500/10 text-red-600 border-0"
            >
              HOT
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2">
          {t(`items.${tool.descriptionKey}` as never)}
        </p>

        {/* Hover gradient overlay */}
        <div
          className={cn(
            'absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity',
            'bg-gradient-to-br',
            tool.gradient
          )}
        />
      </div>
    </LocaleLink>
  );
}
