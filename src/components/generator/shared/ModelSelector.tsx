'use client';

// src/components/generator/shared/ModelSelector.tsx

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { useAvailableModels } from '../hooks/useModeConfig';
import type { CreatorMode } from '../types';

interface ModelSelectorProps {
  mode: CreatorMode;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

// 模型显示名称映射
const modelDisplayNames: Record<string, string> = {
  'wan2.6-text-to-video': 'Wan 2.6',
  'wan2.5-text-to-video': 'Wan 2.5',
  'wan2.6-image-to-video': 'Wan 2.6 I2V',
  'wan2.5-image-to-video': 'Wan 2.5 I2V',
  'kling-2': 'Kling 2',
  'kling-o1-image-to-video': 'Kling O1 I2V',
  'sora-2-preview': 'Sora 2 Preview',
  'sora-2-pro': 'Sora 2 Pro',
  'veo3.1-fast': 'Veo 3.1 Fast',
  'veo3.1-pro': 'Veo 3.1 Pro',
  'doubao-seedance-1.0-pro-fast': 'Seedance 1.0 Fast',
  'seedance-1.5-pro': 'Seedance 1.5 Pro',
  'MiniMax-Hailuo-02': 'Hailuo 02',
  'MiniMax-Hailuo-2.3': 'Hailuo 2.3',
  'gpt-image-1.5': 'GPT Image 1.5',
  'gpt-image-1.5-lite': 'GPT Image Lite',
  'doubao-seedream-4.5': 'Seedream 4.5',
  'doubao-seedream-4.0': 'Seedream 4.0',
  'gemini-3-pro-image-preview': 'Gemini 3 Pro',
  'wan2.5-text-to-image': 'Wan 2.5 Image',
  'omnihuman-1.5': 'OmniHuman 1.5',
};

// 模型提供商映射
const modelProviders: Record<string, string> = {
  'wan2.6-text-to-video': 'Alibaba',
  'wan2.5-text-to-video': 'Alibaba',
  'wan2.6-image-to-video': 'Alibaba',
  'wan2.5-image-to-video': 'Alibaba',
  'kling-2': 'Kuaishou',
  'kling-o1-image-to-video': 'Kuaishou',
  'sora-2-preview': 'OpenAI',
  'sora-2-pro': 'OpenAI',
  'veo3.1-fast': 'Google',
  'veo3.1-pro': 'Google',
  'doubao-seedance-1.0-pro-fast': 'ByteDance',
  'seedance-1.5-pro': 'ByteDance',
  'MiniMax-Hailuo-02': 'MiniMax',
  'MiniMax-Hailuo-2.3': 'MiniMax',
  'gpt-image-1.5': 'OpenAI',
  'gpt-image-1.5-lite': 'OpenAI',
  'doubao-seedream-4.5': 'ByteDance',
  'doubao-seedream-4.0': 'ByteDance',
  'gemini-3-pro-image-preview': 'Google',
  'wan2.5-text-to-image': 'Alibaba',
  'omnihuman-1.5': 'ByteDance',
};

export function ModelSelector({
  mode,
  value,
  onChange,
  disabled = false,
  className,
}: ModelSelectorProps) {
  const t = useTranslations('Generator.model');
  const availableModels = useAvailableModels(mode);

  const currentModelName = useMemo(() => {
    if (!value) return t('selectModel');
    return modelDisplayNames[value] || value;
  }, [value, t]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-foreground font-medium">
            {currentModelName}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="bg-card border-border w-[300px] max-h-[320px] overflow-y-auto"
      >
        <DropdownMenuLabel className="text-muted-foreground text-xs uppercase tracking-wide">
          {t('availableModels')}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        {availableModels.map((modelId) => (
          <DropdownMenuItem
            key={modelId}
            onClick={() => onChange?.(modelId)}
            className="text-foreground hover:bg-muted py-3"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    value === modelId ? 'bg-primary' : 'bg-muted-foreground/50'
                  )}
                />
                <span className="font-medium">
                  {modelDisplayNames[modelId] || modelId}
                </span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1 ml-5">
              {modelProviders[modelId] || 'Unknown'}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
