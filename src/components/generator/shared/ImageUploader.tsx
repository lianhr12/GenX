'use client';

// src/components/generator/shared/ImageUploader.tsx

import { cn } from '@/lib/utils';
import { ImageIcon, Loader2Icon, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { ImageUploaderProps } from '../types';

// 常量配置
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_DIMENSION = 4096;
const ALLOWED_IMAGE_DOMAINS = [
  'amazonaws.com',
  'cloudfront.net',
  'genx.art',
  'localhost',
];

/**
 * 验证图片 URL 是否安全
 */
function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }
    if (parsed.protocol === 'http:' && parsed.hostname !== 'localhost') {
      return false;
    }
    return ALLOWED_IMAGE_DOMAINS.some(
      (domain) =>
        parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

/**
 * 验证图片尺寸
 */
async function validateImageDimensions(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img.width <= MAX_DIMENSION && img.height <= MAX_DIMENSION);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(false);
    };

    img.src = objectUrl;
  });
}

export function ImageUploader({
  value,
  onChange,
  onUploadStart,
  onUploadComplete,
  onUploadError,
  accept = 'image/jpeg,image/png,image/webp',
  maxSize = 10 * 1024 * 1024, // 10MB
  disabled = false,
  compact = false,
  className,
}: ImageUploaderProps) {
  const t = useTranslations('Generator.imageUpload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  // 清理 Object URL
  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  // 获取预览 URL
  const getPreviewUrl = useCallback(() => {
    if (objectUrl) return objectUrl;
    if (typeof value === 'string') {
      return isValidImageUrl(value) ? value : null;
    }
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setObjectUrl(url);
      return url;
    }
    return null;
  }, [value, objectUrl]);

  const handleFileSelect = useCallback(
    async (file: File) => {
      // 验证文件类型
      if (!ALLOWED_TYPES.includes(file.type)) {
        const error = new Error(t('invalidFileType'));
        onUploadError?.(error);
        toast.error(t('invalidFileType'));
        return;
      }

      // 验证文件大小
      if (file.size > maxSize) {
        const error = new Error(t('fileTooLarge'));
        onUploadError?.(error);
        toast.error(t('fileTooLarge'));
        return;
      }

      // 验证图片尺寸
      const isValidSize = await validateImageDimensions(file);
      if (!isValidSize) {
        const error = new Error(t('imageTooLarge'));
        onUploadError?.(error);
        toast.error(t('imageTooLarge'));
        return;
      }

      setIsUploading(true);
      onUploadStart?.();

      try {
        // 清理旧的 Object URL
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
          setObjectUrl(null);
        }

        // 创建新的预览 URL
        const newObjectUrl = URL.createObjectURL(file);
        setObjectUrl(newObjectUrl);

        // 更新值
        onChange?.(file);

        // TODO: 实际上传逻辑
        // const uploadedUrl = await uploadImageToS3(file);
        // onChange?.(uploadedUrl);
        // onUploadComplete?.(uploadedUrl);
      } catch (error) {
        onUploadError?.(error as Error);
        toast.error(t('uploadFailed'));
      } finally {
        setIsUploading(false);
      }
    },
    [
      maxSize,
      onChange,
      onUploadStart,
      onUploadComplete,
      onUploadError,
      t,
      objectUrl,
    ]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
      // 重置 input 以允许选择相同文件
      e.target.value = '';
    },
    [handleFileSelect]
  );

  const handleRemove = useCallback(() => {
    // 清理 Object URL
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      setObjectUrl(null);
    }
    onChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onChange, objectUrl]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const preview = getPreviewUrl();

  if (compact) {
    return (
      <div className={cn('relative', className)}>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled || isUploading}
          className={cn(
            'flex items-center justify-center',
            'h-[60px] w-[45px] rounded border border-dashed',
            'border-border bg-muted/50',
            'transition-transform duration-300',
            'hover:scale-105 hover:border-primary/50',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          {isUploading ? (
            <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
          ) : preview ? (
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full rounded object-cover"
            />
          ) : (
            <ImageIcon className="size-4 text-muted-foreground" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />
      {preview ? (
        <div className="relative group aspect-video rounded-lg overflow-hidden border-2 border-border">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-muted hover:bg-muted/80 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3.5 h-3.5 text-foreground" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled || isUploading}
          className="flex flex-col items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors group"
        >
          {isUploading ? (
            <Loader2Icon className="w-8 h-8 animate-spin text-muted-foreground" />
          ) : (
            <>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-muted group-hover:bg-muted/80 transition-colors">
                <ImageIcon className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                {t('uploadImage')}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                {t('uploadHint')}
              </p>
            </>
          )}
        </button>
      )}
    </div>
  );
}
