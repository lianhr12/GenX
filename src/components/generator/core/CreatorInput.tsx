'use client';

// src/components/generator/core/CreatorInput.tsx

import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { PlusIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getModeRequiresImage } from '../config/modes';
import { useCreatorState } from '../hooks/useCreatorState';
import { useNavigationOnInput } from '../hooks/useNavigationOnInput';
import type { GenerationParams } from '../types';

// 常量配置
const MAX_PROMPT_LENGTH = 2000;
const ALLOWED_IMAGE_DOMAINS = [
  'amazonaws.com',
  'cloudfront.net',
  'genx.art',
  'localhost',
];

interface CreatorInputProps {
  showImageUpload?: boolean;
  enableNavigation?: boolean;
  onBeforeNavigate?: (params: GenerationParams) => Promise<boolean>;
  onAfterNavigate?: (route: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * 验证图片 URL 是否安全
 */
function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // 只允许 https（开发环境允许 http://localhost）
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }
    if (parsed.protocol === 'http:' && parsed.hostname !== 'localhost') {
      return false;
    }
    // 检查域名白名单
    return ALLOWED_IMAGE_DOMAINS.some(
      (domain) =>
        parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

export function CreatorInput({
  showImageUpload = true,
  enableNavigation = false,
  onBeforeNavigate,
  onAfterNavigate,
  placeholder,
  className,
}: CreatorInputProps) {
  const t = useTranslations('Generator.input');
  const { prompt, setPrompt, isGenerating, sourceImage, setParam, mode } =
    useCreatorState();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 根据当前模式和 prop 决定是否显示图片上传
  const shouldShowImageUpload = useMemo(() => {
    // 如果 prop 禁用了图片上传，直接返回 false
    if (!showImageUpload) return false;
    // 根据当前模式的配置决定是否显示
    return getModeRequiresImage(mode);
  }, [showImageUpload, mode]);

  // 用于存储 Object URL，避免内存泄漏
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  const { handleInputComplete, isNavigating } = useNavigationOnInput({
    onBeforeNavigate,
    onAfterNavigate,
  });

  // 计算预览 URL，并管理 Object URL 生命周期
  const previewUrl = useMemo(() => {
    if (typeof sourceImage === 'string') {
      // 验证外部 URL 安全性
      return isValidImageUrl(sourceImage) ? sourceImage : null;
    }
    if (sourceImage instanceof File) {
      // 创建新的 Object URL
      const url = URL.createObjectURL(sourceImage);
      return url;
    }
    return null;
  }, [sourceImage]);

  // 管理 Object URL 的创建和释放
  useEffect(() => {
    if (sourceImage instanceof File && previewUrl) {
      setObjectUrl(previewUrl);
    } else {
      setObjectUrl(null);
    }

    // 清理旧的 Object URL
    return () => {
      if (objectUrl && sourceImage instanceof File) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [sourceImage, previewUrl]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, []);

  // 处理 prompt 变化，添加长度限制
  const handlePromptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      if (value.length <= MAX_PROMPT_LENGTH) {
        setPrompt(value);
      }
    },
    [setPrompt]
  );

  // 处理图片选择
  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setParam('sourceImage', file);
        // 自动切换到图生视频模式
        setParam('mode', 'image-to-video');
      }
    },
    [setParam]
  );

  // 处理图片上传按钮点击
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // 获取显示用的预览 URL
  const displayPreviewUrl = objectUrl || previewUrl;

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Input Area */}
      <div className="flex-1">
        <div className="flex h-full items-start gap-3">
          {/* Upload Image Button */}
          {shouldShowImageUpload && (
            <div className="block">
              <div className="group/image-upload relative z-10 flex w-14 shrink-0">
                <div className="flex flex-col items-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={isGenerating || isNavigating}
                  />
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    disabled={isGenerating || isNavigating}
                    className={cn(
                      'group/upload-card relative flex cursor-pointer items-center justify-center',
                      'h-[60px] w-[45px] rounded border border-dashed',
                      'border-border bg-muted/50 text-base',
                      'transition-transform duration-500 ease-out will-change-transform',
                      'hover:z-[2] hover:scale-110 hover:border-primary/50',
                      'disabled:cursor-not-allowed disabled:opacity-50'
                    )}
                    style={{
                      transform: sourceImage ? 'rotate(0deg)' : 'rotate(-5deg)',
                    }}
                  >
                    {displayPreviewUrl ? (
                      <img
                        src={displayPreviewUrl}
                        alt="Preview"
                        className="h-full w-full rounded object-cover"
                      />
                    ) : (
                      <PlusIcon className="size-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Text Input */}
          <div className="relative size-full">
            <div
              className="scrollbar h-full min-h-[24px] overflow-y-auto"
              style={{ height: '112px', maxHeight: '112px' }}
            >
              <div className="relative size-full">
                <div className="relative flex size-full min-h-28">
                  <Textarea
                    ref={inputRef}
                    value={prompt}
                    onChange={handlePromptChange}
                    placeholder={placeholder || t('placeholder')}
                    maxLength={MAX_PROMPT_LENGTH}
                    className={cn(
                      'max-w-none flex-1 resize-none text-start text-sm',
                      'h-full min-h-[24px] leading-relaxed outline-none',
                      'border-0 bg-transparent p-0',
                      'focus-visible:ring-0 focus-visible:ring-offset-0',
                      'placeholder:text-muted-foreground/60 dark:bg-input/0'
                    )}
                    disabled={isGenerating || isNavigating}
                  />
                </div>
              </div>
            </div>
            {/* 字符计数 */}
            <div className="absolute bottom-0 right-0 text-xs text-muted-foreground/50">
              {prompt.length}/{MAX_PROMPT_LENGTH}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
