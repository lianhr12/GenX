'use client';

// src/components/generator/core/CreatorParameterBar.tsx

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { getModelConfig } from '@/config/video-credits';
import { cn } from '@/lib/utils';
import { uploadFileFromBrowser } from '@/storage/client';
import {
  CheckIcon,
  ClockIcon,
  ImageIcon,
  ImagePlayIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  MusicIcon,
  TrashIcon,
  TypeIcon,
  UploadIcon,
  VideoIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isImageMode, isVideoMode } from '../config/credits';
import { defaultAspectRatios } from '../config/defaults';
import { getModelById } from '../config/models';
import { useCreatorState } from '../hooks/useCreatorState';
import { useHasParameter } from '../hooks/useModeConfig';
import { ModelSelector } from '../shared/ModelSelector';
import type { CreatorMode } from '../types';

interface CreatorParameterBarProps {
  allowedModes?: CreatorMode[];
  showModeSelector?: boolean;
  showAudio?: boolean;
  showMoreOptions?: boolean;
  className?: string;
}

export function CreatorParameterBar({
  allowedModes = [
    'text-to-video',
    'image-to-video',
    'text-to-image',
    'image-to-image',
  ],
  showModeSelector = true,
  showAudio = true,
  showMoreOptions = true,
  className,
}: CreatorParameterBarProps) {
  const t = useTranslations('Generator.parameters');
  const {
    mode,
    setMode,
    model,
    setModel,
    aspectRatio,
    setParam,
    duration,
    quality,
    generateAudio,
    audioUrl,
    isGenerating,
  } = useCreatorState();

  const [videoSettingsOpen, setVideoSettingsOpen] = useState(false);
  const [audioSettingsOpen, setAudioSettingsOpen] = useState(false);
  const [audioDialogOpen, setAudioDialogOpen] = useState(false);
  const [audioUploading, setAudioUploading] = useState(false);
  const [audioUploadError, setAudioUploadError] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleAudioFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setAudioUploadError(null);
      setAudioUploading(true);
      try {
        const result = await uploadFileFromBrowser(file, 'audio');
        setParam('audioUrl', result.url);
        setParam('generateAudio', false);
        setAudioFileName(file.name);
        setAudioDialogOpen(false);
      } catch (err) {
        setAudioUploadError(
          err instanceof Error ? err.message : t('audioUploadError')
        );
      } finally {
        setAudioUploading(false);
        if (audioInputRef.current) {
          audioInputRef.current.value = '';
        }
      }
    },
    [setParam, t]
  );

  const handleRemoveAudio = useCallback(() => {
    setParam('audioUrl', null);
    setAudioFileName(null);
  }, [setParam]);

  const hasAspectRatio = useHasParameter(mode, 'aspectRatio');
  const hasDuration = useHasParameter(mode, 'duration');
  const hasQuality = useHasParameter(mode, 'quality');

  // 获取当前模型的配置（用于视频参数）
  const modelConfig = useMemo(() => {
    return getModelConfig(model);
  }, [model]);

  // 获取当前模型信息（用于音频支持判断）
  const modelInfo = useMemo(() => {
    return getModelById(model);
  }, [model]);

  // 根据模型配置获取可用的参数选项
  const availableAspectRatios = useMemo(() => {
    if (modelConfig?.aspectRatios?.length) {
      return modelConfig.aspectRatios.filter(
        (ar) => ar !== 'auto' && ar !== 'adaptive'
      );
    }
    return defaultAspectRatios;
  }, [modelConfig]);

  const availableDurations = useMemo(() => {
    if (modelConfig?.durations?.length) {
      return modelConfig.durations;
    }
    return [5, 10, 15];
  }, [modelConfig]);

  const availableQualities = useMemo(() => {
    if (modelConfig?.qualities?.length) {
      return modelConfig.qualities;
    }
    return ['720p', '1080p'];
  }, [modelConfig]);

  // 当模型切换时，自动重置无效的参数值
  useEffect(() => {
    if (!isVideoMode(mode)) return;

    // 检查并重置 aspectRatio
    if (
      availableAspectRatios.length > 0 &&
      !availableAspectRatios.includes(aspectRatio)
    ) {
      setParam('aspectRatio', availableAspectRatios[0]);
    }

    // 检查并重置 duration
    if (
      availableDurations.length > 0 &&
      !availableDurations.includes(duration)
    ) {
      setParam('duration', availableDurations[0]);
    }

    // 检查并重置 quality
    if (
      availableQualities.length > 0 &&
      quality &&
      !availableQualities.includes(quality)
    ) {
      setParam('quality', availableQualities[0]);
    }

    // 如果模型不支持音频生成，重置 generateAudio 为 false
    if (!modelInfo?.supportsAudioGeneration && generateAudio) {
      setParam('generateAudio', false);
    }

    // 如果模型不支持音频 URL，重置 audioUrl
    if (!modelInfo?.supportsAudioUrl && audioUrl) {
      setParam('audioUrl', null);
      setAudioFileName(null);
    }
  }, [
    model,
    availableAspectRatios,
    availableDurations,
    availableQualities,
    aspectRatio,
    duration,
    quality,
    generateAudio,
    audioUrl,
    modelInfo?.supportsAudioGeneration,
    modelInfo?.supportsAudioUrl,
    setParam,
    mode,
  ]);

  // 是否为视频模式（需要显示聚合的视频设置面板）
  const showVideoSettings =
    isVideoMode(mode) && (hasAspectRatio || hasDuration || hasQuality);

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
      '21:9': '21/9',
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

  // 获取当前创作类型下的子模式
  const currentTypeSubModes = useMemo(() => {
    const currentType = availableCreativeTypes.find(
      (t) => t.value === currentCreativeType
    );
    return currentType?.modes || [];
  }, [availableCreativeTypes, currentCreativeType]);

  // 子模式标签映射
  const subModeLabels: Record<
    CreatorMode,
    { label: string; icon: React.ReactNode }
  > = {
    'text-to-video': {
      label: 'Text to Video',
      icon: <TypeIcon className="size-3.5" />,
    },
    'image-to-video': {
      label: 'Image to Video',
      icon: <ImagePlayIcon className="size-3.5" />,
    },
    'text-to-image': {
      label: 'Text to Image',
      icon: <TypeIcon className="size-3.5" />,
    },
    'image-to-image': {
      label: 'Image to Image',
      icon: <ImagePlayIcon className="size-3.5" />,
    },
    'reference-to-video': {
      label: 'Reference to Video',
      icon: <ImagePlayIcon className="size-3.5" />,
    },
    audio: { label: 'Audio', icon: <MusicIcon className="size-3.5" /> },
  };

  // 处理创作类型切换
  const handleCreativeTypeChange = (type: 'video' | 'image') => {
    const targetType = availableCreativeTypes.find((t) => t.value === type);
    if (targetType && targetType.modes.length > 0) {
      // 切换到该类型的第一个模式
      setMode(targetType.modes[0]);
    }
  };

  // 处理子模式切换
  const handleSubModeChange = (newMode: CreatorMode) => {
    setMode(newMode);
  };

  // 通用的 SelectTrigger 样式，移除焦点边框
  const selectTriggerNoRing =
    'focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-transparent';

  return (
    <div
      className={cn(
        'flex items-center justify-between',
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

        {/* Sub Mode Select (Text to Video / Image to Video) - 只在有多个子模式时显示 */}
        {showModeSelector && currentTypeSubModes.length > 1 && (
          <Select
            value={mode}
            onValueChange={(v) => handleSubModeChange(v as CreatorMode)}
            disabled={isGenerating}
          >
            <SelectTrigger
              className={cn(
                'h-9 gap-1.5 border-none bg-muted/50 px-3',
                selectTriggerNoRing
              )}
            >
              {subModeLabels[mode]?.icon}
              <span className="text-sm">
                {subModeLabels[mode]?.label || mode}
              </span>
            </SelectTrigger>
            <SelectContent>
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Generation Mode
              </div>
              {currentTypeSubModes.map((subMode) => (
                <SelectItem key={subMode} value={subMode}>
                  <div className="flex items-center gap-2">
                    {subModeLabels[subMode]?.icon}
                    <span>{subModeLabels[subMode]?.label || subMode}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* 当只有一个子模式时，显示静态标签 */}
        {showModeSelector && currentTypeSubModes.length === 1 && (
          <div
            className={cn(
              'flex h-9 items-center gap-1.5 rounded-md bg-muted/50 px-3 text-sm text-muted-foreground'
            )}
          >
            {subModeLabels[mode]?.icon}
            <span>{subModeLabels[mode]?.label || mode}</span>
          </div>
        )}

        {/* Model Select */}
        <ModelSelector
          mode={mode}
          value={model}
          onValueChange={setModel}
          disabled={isGenerating}
        />

        {/* Video Settings Popover (AI Video 模式下聚合 Aspect Ratio, Duration, Quality) */}
        {showVideoSettings && (
          <Popover open={videoSettingsOpen} onOpenChange={setVideoSettingsOpen}>
            <PopoverTrigger asChild disabled={isGenerating}>
              <button
                type="button"
                className={cn(
                  'flex h-9 items-center gap-3 rounded-lg bg-muted/50 px-3 text-sm transition-colors hover:bg-muted',
                  isGenerating && 'cursor-not-allowed opacity-50'
                )}
              >
                {/* Aspect Ratio Icon + Value */}
                {hasAspectRatio && availableAspectRatios.length > 0 && (
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
                )}
                {/* Duration */}
                {hasDuration && availableDurations.length > 0 && (
                  <div className="flex items-center gap-1">
                    <ClockIcon className="size-3.5" />
                    <span>{duration}s</span>
                  </div>
                )}
                {/* Quality */}
                {hasQuality && availableQualities.length > 0 && (
                  <span>{quality}</span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[360px] p-4"
              align="start"
              sideOffset={8}
            >
              <div className="space-y-5">
                {/* Aspect Ratio */}
                {hasAspectRatio && availableAspectRatios.length > 0 && (
                  <div>
                    <div className="mb-3 text-sm font-medium text-muted-foreground">
                      Aspect Ratio
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableAspectRatios.map((ar) => {
                        const ratioStyle: Record<string, string> = {
                          '16:9': '16/9',
                          '9:16': '9/16',
                          '1:1': '1/1',
                          '4:3': '4/3',
                          '3:4': '3/4',
                          '21:9': '21/9',
                        };
                        return (
                          <button
                            key={ar}
                            type="button"
                            onClick={() => setParam('aspectRatio', ar)}
                            className={cn(
                              'flex flex-col items-center gap-1.5 rounded-lg px-4 py-2.5 transition-colors',
                              aspectRatio === ar
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                            )}
                          >
                            <div
                              className={cn(
                                'border-[1.5px]',
                                aspectRatio === ar
                                  ? 'border-primary-foreground'
                                  : 'border-current'
                              )}
                              style={{
                                width: '20px',
                                aspectRatio: ratioStyle[ar] || '16/9',
                              }}
                            />
                            <span className="text-xs">{ar}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Video Length */}
                {hasDuration && availableDurations.length > 0 && (
                  <div>
                    <div className="mb-3 text-sm font-medium text-muted-foreground">
                      Video Length
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {availableDurations.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setParam('duration', d)}
                          className={cn(
                            'rounded-lg py-2 text-sm transition-colors',
                            duration === d
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                          )}
                        >
                          {d}s
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resolution */}
                {hasQuality && availableQualities.length > 0 && (
                  <div>
                    <div className="mb-3 text-sm font-medium text-muted-foreground">
                      Resolution
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {availableQualities.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setParam('quality', q)}
                          className={cn(
                            'rounded-lg py-2.5 text-sm transition-colors',
                            quality === q
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                          )}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Image Mode: Aspect Ratio (单独显示) */}
        {!showVideoSettings && hasAspectRatio && (
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

        {/* Audio Settings Popover (视频模式且模型支持音频生成或音频 URL 时显示) */}
        {showAudio &&
          isVideoMode(mode) &&
          (modelInfo?.supportsAudioGeneration ||
            modelInfo?.supportsAudioUrl) && (
            <>
              <Popover
                open={audioSettingsOpen}
                onOpenChange={setAudioSettingsOpen}
              >
                <PopoverTrigger asChild disabled={isGenerating}>
                  <button
                    type="button"
                    className={cn(
                      paramButtonClass,
                      'gap-1.5',
                      (generateAudio || audioUrl) &&
                        'border-primary/50 bg-primary/10',
                      isGenerating && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    <MusicIcon className="size-4" />
                    <span>{t('audio')}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[220px] p-3"
                  align="start"
                  sideOffset={8}
                >
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      {t('addAudio')}
                    </div>
                    <div className="space-y-1">
                      {/* 自动生成音频选项 */}
                      {modelInfo?.supportsAudioGeneration && (
                        <button
                          type="button"
                          onClick={() => {
                            setParam('generateAudio', true);
                            setParam('audioUrl', null);
                            setAudioFileName(null);
                          }}
                          className={cn(
                            'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                            generateAudio && !audioUrl
                              ? 'bg-muted'
                              : 'hover:bg-muted/50'
                          )}
                        >
                          <div
                            className={cn(
                              'flex size-4 items-center justify-center rounded-full border-2',
                              generateAudio && !audioUrl
                                ? 'border-primary bg-primary'
                                : 'border-muted-foreground'
                            )}
                          >
                            {generateAudio && !audioUrl && (
                              <div className="size-2 rounded-full bg-primary-foreground" />
                            )}
                          </div>
                          <span>{t('audioGenerate')}</span>
                        </button>
                      )}
                      {/* 上传音频选项 */}
                      {modelInfo?.supportsAudioUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setAudioSettingsOpen(false);
                            setAudioDialogOpen(true);
                          }}
                          className={cn(
                            'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                            audioUrl ? 'bg-muted' : 'hover:bg-muted/50'
                          )}
                        >
                          <div
                            className={cn(
                              'flex size-4 items-center justify-center rounded-full border-2',
                              audioUrl
                                ? 'border-primary bg-primary'
                                : 'border-muted-foreground'
                            )}
                          >
                            {audioUrl && (
                              <div className="size-2 rounded-full bg-primary-foreground" />
                            )}
                          </div>
                          <span>{t('audioUpload')}</span>
                        </button>
                      )}
                      {/* 无音频选项 */}
                      <button
                        type="button"
                        onClick={() => {
                          setParam('generateAudio', false);
                          setParam('audioUrl', null);
                          setAudioFileName(null);
                        }}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                          !generateAudio && !audioUrl
                            ? 'bg-muted'
                            : 'hover:bg-muted/50'
                        )}
                      >
                        <div
                          className={cn(
                            'flex size-4 items-center justify-center rounded-full border-2',
                            !generateAudio && !audioUrl
                              ? 'border-primary bg-primary'
                              : 'border-muted-foreground'
                          )}
                        >
                          {!generateAudio && !audioUrl && (
                            <div className="size-2 rounded-full bg-primary-foreground" />
                          )}
                        </div>
                        <span>{t('audioNone')}</span>
                      </button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* 音频上传 Dialog */}
              <Dialog open={audioDialogOpen} onOpenChange={setAudioDialogOpen}>
                <DialogContent
                  onInteractOutside={(e) => e.preventDefault()}
                  onEscapeKeyDown={(e) => {
                    if (audioUploading) e.preventDefault();
                  }}
                  className="sm:max-w-md"
                >
                  <DialogHeader>
                    <DialogTitle>{t('audioUpload')}</DialogTitle>
                    <DialogDescription>
                      {t('audioUploadHint')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* 已上传音频信息 */}
                    {audioUrl && (
                      <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
                        <div className="flex items-center gap-2 truncate">
                          <MusicIcon className="size-4 shrink-0 text-primary" />
                          <span className="truncate text-sm">
                            {audioFileName || t('audioUploaded')}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveAudio}
                          className="ml-2 shrink-0 rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <TrashIcon className="size-4" />
                        </button>
                      </div>
                    )}

                    {/* 上传区域 */}
                    <label
                      className={cn(
                        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary/50 hover:bg-muted/50',
                        audioUploading && 'pointer-events-none opacity-50'
                      )}
                    >
                      <input
                        ref={audioInputRef}
                        type="file"
                        accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/mp4,audio/aac"
                        className="hidden"
                        onChange={handleAudioFileSelect}
                        disabled={audioUploading}
                      />
                      {audioUploading ? (
                        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
                      ) : (
                        <UploadIcon className="size-6 text-muted-foreground" />
                      )}
                      <span className="text-sm text-muted-foreground">
                        {audioUploading
                          ? t('audioUploading')
                          : audioUrl
                            ? t('audioReplace')
                            : t('audioUploadAction')}
                      </span>
                    </label>

                    {/* 错误提示 */}
                    {audioUploadError && (
                      <p className="text-sm text-destructive">
                        {audioUploadError}
                      </p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </>
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
