'use client';

// src/components/generator/core/CreatorParameterBar.tsx

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  ClockIcon,
  ImageIcon,
  MoreHorizontalIcon,
  MusicIcon,
  VideoIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { isImageMode, isVideoMode } from '../config/credits';
import {
  defaultAspectRatios,
  defaultDurations,
  defaultQualities,
} from '../config/defaults';
import { useCreatorState } from '../hooks/useCreatorState';
import { useHasParameter, useModeConfig } from '../hooks/useModeConfig';
import type { CreatorMode } from '../types';

interface CreatorParameterBarProps {
  allowedModes?: CreatorMode[];
  showModeSelector?: boolean;
  showAudio?: boolean;
  showMoreOptions?: boolean;
  className?: string;
}

export function CreatorParameterBar({
  allowedModes = ['text-to-video', 'image-to-video', 'text-to-image'],
  showModeSelector = true,
  showAudio = true,
  showMoreOptions = true,
  className,
}: CreatorParameterBarProps) {
  const t = useTranslations('Generator.parameters');
  const modesT = useTranslations('Generator.modes');
  const {
    mode,
    setMode,
    model,
    setModel,
    aspectRatio,
    setParam,
    duration,
    quality,
    isGenerating,
  } = useCreatorState();

  const modeConfig = useModeConfig(mode);
  const hasAspectRatio = useHasParameter(mode, 'aspectRatio');
  const hasDuration = useHasParameter(mode, 'duration');
  const hasQuality = useHasParameter(mode, 'quality');

  const paramButtonClass = cn(
    'flex h-9 cursor-pointer items-center rounded-lg px-3 py-2 text-sm transition-colors duration-300',
    'bg-muted/50 hover:bg-muted'
  );

  // 获取当前比例的显示样式
  const aspectRatioStyle = useMemo(() => {
    const ratioMap: Record<string, string> = {
      '16:9': '16/9',
      '9:16': '9/16',
      '1:1': '1/1',
      '4:3': '4/3',
      '3:4': '3/4',
    };
    return ratioMap[aspectRatio] || '16/9';
  }, [aspectRatio]);

  // 计算当前创作类型（AI Video 或 AI Image）
  const currentCreativeType = useMemo(() => {
    return isVideoMode(mode) ? 'video' : 'image';
  }, [mode]);

  // 获取可用的创作类型
  const availableCreativeTypes = useMemo(() => {
    const types: {
      value: 'video' | 'image';
      label: string;
      icon: React.ReactNode;
      modes: CreatorMode[];
    }[] = [];

    const videoModes = allowedModes.filter((m) => isVideoMode(m));
    const imageModes = allowedModes.filter((m) => isImageMode(m));

    if (videoModes.length > 0) {
      types.push({
        value: 'video',
        label: 'AI Video',
        icon: <VideoIcon className="size-4" />,
        modes: videoModes,
      });
    }

    if (imageModes.length > 0) {
      types.push({
        value: 'image',
        label: 'AI Image',
        icon: <ImageIcon className="size-4" />,
        modes: imageModes,
      });
    }

    return types;
  }, [allowedModes]);

  // 处理创作类型切换
  const handleCreativeTypeChange = (type: 'video' | 'image') => {
    const targetType = availableCreativeTypes.find((t) => t.value === type);
    if (targetType && targetType.modes.length > 0) {
      // 切换到该类型的第一个模式
      setMode(targetType.modes[0]);
    }
  };

  // 通用的 SelectTrigger 样式，移除焦点边框
  const selectTriggerNoRing =
    'focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-transparent';

  return (
    <div
      className={cn(
        'flex items-center justify-between overflow-hidden',
        className
      )}
    >
      {/* Left side - Parameters */}
      <div className="flex h-9 origin-top items-center gap-1 transition-all duration-300 ease-in-out">
        {/* Creative Type Select (AI Video / AI Image) */}
        {showModeSelector && availableCreativeTypes.length > 1 && (
          <Select
            value={currentCreativeType}
            onValueChange={handleCreativeTypeChange}
            disabled={isGenerating}
          >
            <SelectTrigger
              className={cn(
                'h-9 gap-1.5 border-none bg-muted/50 px-3',
                selectTriggerNoRing
              )}
            >
              {currentCreativeType === 'video' ? (
                <VideoIcon className="size-4 text-[#FF8F34]" />
              ) : (
                <ImageIcon className="size-4 text-[#FF34AA]" />
              )}
              <span className="bg-gradient-to-r from-[#FF8F34] via-[#FF5F62] to-[#FF34AA] bg-clip-text text-transparent">
                {currentCreativeType === 'video' ? 'AI Video' : 'AI Image'}
              </span>
            </SelectTrigger>
            <SelectContent>
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Creative Types
              </div>
              {availableCreativeTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    {type.icon}
                    <span>{type.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Model Select */}
        <Select value={model} onValueChange={setModel} disabled={isGenerating}>
          <SelectTrigger
            className={cn(
              'h-9 min-w-16 gap-1 border-none bg-muted/50 px-3',
              selectTriggerNoRing
            )}
          >
            <SelectValue placeholder={t('selectModel')} />
          </SelectTrigger>
          <SelectContent>
            {modeConfig.availableModels.map((m) => (
              <SelectItem key={m} value={m}>
                {m.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Aspect Ratio */}
        {hasAspectRatio && (
          <Select
            value={aspectRatio}
            onValueChange={(v) => setParam('aspectRatio', v)}
            disabled={isGenerating}
          >
            <SelectTrigger
              className={cn(
                'h-9 gap-1 border-none bg-muted/50 px-3',
                selectTriggerNoRing
              )}
            >
              <div className="flex items-center gap-1">
                <div
                  className="border-[1.5px] border-current"
                  style={{
                    width: '12px',
                    aspectRatio: aspectRatioStyle,
                  }}
                />
                <span>{aspectRatio}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              {defaultAspectRatios.map((ar) => (
                <SelectItem key={ar} value={ar}>
                  {ar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Duration */}
        {hasDuration && (
          <Select
            value={String(duration)}
            onValueChange={(v) => setParam('duration', Number(v))}
            disabled={isGenerating}
          >
            <SelectTrigger
              className={cn(
                'h-9 gap-1 border-none bg-muted/50 px-3',
                selectTriggerNoRing
              )}
            >
              <div className="flex items-center gap-1">
                <ClockIcon className="size-4" />
                <span>{duration}s</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              {defaultDurations.map((d) => (
                <SelectItem key={d} value={String(d)}>
                  {d}s
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Quality */}
        {hasQuality && (
          <Select
            value={quality}
            onValueChange={(v) => setParam('quality', v)}
            disabled={isGenerating}
          >
            <SelectTrigger
              className={cn(
                'h-9 border-none bg-muted/50 px-3',
                selectTriggerNoRing
              )}
            >
              <span>{quality}</span>
            </SelectTrigger>
            <SelectContent>
              {defaultQualities.map((q) => (
                <SelectItem key={q} value={q}>
                  {q}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Audio */}
        {showAudio && (
          <div className={cn(paramButtonClass, 'gap-1.5')}>
            <MusicIcon className="size-4" />
            <span>{t('audio')}</span>
          </div>
        )}

        {/* More Options */}
        {showMoreOptions && (
          <button type="button" className={cn(paramButtonClass, 'p-2.5')}>
            <MoreHorizontalIcon className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
