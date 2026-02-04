'use client';

// src/components/generator/shared/ModelSelector.tsx

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  CoinsIcon,
  SparklesIcon,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import {
  type ModelInfo,
  type ModelProvider,
  getModelById,
  getModelsForMode,
  getProvidersForMode,
} from '../config/models';
import type { CreatorMode } from '../types';

interface ModelSelectorProps {
  mode: CreatorMode;
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ModelSelector({
  mode,
  value,
  onValueChange,
  disabled = false,
  className,
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    null
  );

  // 获取当前模式可用的提供商和模型
  const availableProviders = useMemo(() => getProvidersForMode(mode), [mode]);
  const availableModels = useMemo(() => getModelsForMode(mode), [mode]);

  // 当前选中的模型信息
  const selectedModel = useMemo(() => getModelById(value), [value]);

  // 当前显示的提供商（默认选中第一个有模型的提供商，或者当前模型的提供商）
  const activeProviderId = useMemo(() => {
    if (selectedProviderId) return selectedProviderId;
    if (selectedModel) return selectedModel.providerId;
    return availableProviders[0]?.id || null;
  }, [selectedProviderId, selectedModel, availableProviders]);

  // 当前提供商下的模型
  const providerModels = useMemo(() => {
    if (!activeProviderId) return [];
    return availableModels.filter((m) => m.providerId === activeProviderId);
  }, [activeProviderId, availableModels]);

  // 处理提供商选择
  const handleProviderSelect = useCallback((providerId: string) => {
    setSelectedProviderId(providerId);
  }, []);

  // 处理模型选择
  const handleModelSelect = useCallback(
    (modelId: string) => {
      onValueChange(modelId);
      setOpen(false);
    },
    [onValueChange]
  );

  // 重置选中的提供商当 popover 关闭时
  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSelectedProviderId(null);
    }
  }, []);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'h-9 justify-between gap-1.5 border-none bg-muted/50 px-3 hover:bg-muted',
            'focus-visible:ring-0 focus-visible:ring-offset-0',
            className
          )}
        >
          {/* Provider Icon Placeholder */}
          <div className="flex size-5 items-center justify-center rounded bg-muted">
            <SparklesIcon className="size-3 text-muted-foreground" />
          </div>
          <span className="max-w-[140px] truncate">
            {selectedModel?.name || 'Select Model'}
          </span>
          <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[520px] p-0" align="start" sideOffset={4}>
        <div className="flex h-[360px]">
          {/* Left Panel - Providers */}
          <div className="w-[180px] border-r border-border">
            <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
              Models
            </div>
            <ScrollArea className="h-[320px]">
              <div className="space-y-0.5 px-1">
                {availableProviders.map((provider) => (
                  <ProviderItem
                    key={provider.id}
                    provider={provider}
                    isActive={activeProviderId === provider.id}
                    onClick={() => handleProviderSelect(provider.id)}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel - Models */}
          <div className="flex-1">
            <ScrollArea className="h-[360px]">
              <div className="space-y-1 p-2">
                {providerModels.map((model) => (
                  <ModelItem
                    key={model.id}
                    model={model}
                    isSelected={value === model.id}
                    onClick={() => handleModelSelect(model.id)}
                  />
                ))}
                {providerModels.length === 0 && (
                  <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                    No models available
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** 提供商列表项 */
function ProviderItem({
  provider,
  isActive,
  onClick,
}: {
  provider: ModelProvider;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors',
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'hover:bg-accent/50 text-foreground'
      )}
    >
      {/* Provider Icon Placeholder */}
      <div className="flex size-6 items-center justify-center rounded bg-muted">
        <SparklesIcon className="size-3.5 text-muted-foreground" />
      </div>
      <span className="flex-1 text-left">{provider.name}</span>
      {provider.isNew && (
        <Badge
          variant="secondary"
          className="h-5 bg-green-500/20 px-1.5 text-[10px] text-green-500"
        >
          New
        </Badge>
      )}
    </button>
  );
}

/** 模型列表项 */
function ModelItem({
  model,
  isSelected,
  onClick,
}: {
  model: ModelInfo;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full flex-col gap-1 rounded-lg p-3 text-left transition-colors',
        isSelected ? 'bg-accent' : 'hover:bg-accent/50'
      )}
    >
      {/* Header: Icon + Name + New Badge */}
      <div className="flex items-center gap-2">
        {/* Model Icon Placeholder */}
        <div className="flex size-6 items-center justify-center rounded bg-muted">
          <SparklesIcon className="size-3.5 text-muted-foreground" />
        </div>
        <span className="font-medium">{model.name}</span>
        {model.isNew && (
          <Badge
            variant="secondary"
            className="h-5 bg-green-500/20 px-1.5 text-[10px] text-green-500"
          >
            New
          </Badge>
        )}
        {isSelected && <CheckIcon className="ml-auto size-4 text-primary" />}
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground line-clamp-1 pl-8">
        {model.description}
      </p>

      {/* Footer: Time + Credits */}
      <div className="flex items-center gap-3 pl-8 text-xs text-muted-foreground">
        {model.estimatedTime && (
          <span className="flex items-center gap-1">
            <ClockIcon className="size-3" />
            {model.estimatedTime}s
          </span>
        )}
        <span className="flex items-center gap-1">
          <CoinsIcon className="size-3" />
          {model.baseCredits}+ credits
        </span>
      </div>
    </button>
  );
}
