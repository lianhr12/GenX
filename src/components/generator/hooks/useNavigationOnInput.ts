'use client';

// src/components/generator/hooks/useNavigationOnInput.ts

import { useCreatorNavigationStore } from '@/stores/creator-navigation-store';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { getRouteForMode } from '../config/modes';
import type { GenerationParams } from '../types';
import { useCreatorState } from './useCreatorState';

interface UseNavigationOnInputOptions {
  onBeforeNavigate?: (params: GenerationParams) => Promise<boolean>;
  onAfterNavigate?: (route: string) => void;
}

interface UseNavigationOnInputReturn {
  handleInputComplete: () => Promise<void>;
  isNavigating: boolean;
}

/**
 * Hook to handle navigation after input completion
 * Used in /create main page to navigate to tool pages
 */
export function useNavigationOnInput(
  options: UseNavigationOnInputOptions = {}
): UseNavigationOnInputReturn {
  const { onBeforeNavigate, onAfterNavigate } = options;
  const router = useRouter();
  const state = useCreatorState();
  const { setPendingParams, setIsUploading, isUploading } =
    useCreatorNavigationStore();

  const handleInputComplete = useCallback(async () => {
    // 检查是否有内容
    if (!state.prompt.trim() && !state.sourceImage && !state.referenceImage) {
      return;
    }

    const params: GenerationParams = {
      mode: state.mode,
      prompt: state.prompt,
      model: state.model,
      duration: state.duration,
      aspectRatio: state.aspectRatio,
      quality: state.quality,
      sourceImage: state.sourceImage,
      referenceImage: state.referenceImage,
      style: state.style,
      outputNumber: state.outputNumber,
      isPublic: state.isPublic,
    };

    // 调用 onBeforeNavigate 回调
    if (onBeforeNavigate) {
      const shouldContinue = await onBeforeNavigate(params);
      if (!shouldContinue) {
        return;
      }
    }

    try {
      // 如果有图片文件，需要先上传
      if (state.sourceImage instanceof File) {
        setIsUploading(true);
        try {
          // TODO: 实际的图片上传逻辑
          // const uploadedUrl = await uploadImage(state.sourceImage);
          // params.sourceImage = uploadedUrl;
          toast.info('图片上传功能待实现');
        } catch {
          toast.error('图片上传失败');
          return;
        } finally {
          setIsUploading(false);
        }
      }

      if (state.referenceImage instanceof File) {
        setIsUploading(true);
        try {
          // TODO: 实际的图片上传逻辑
          // const uploadedUrl = await uploadImage(state.referenceImage);
          // params.referenceImage = uploadedUrl;
          toast.info('图片上传功能待实现');
        } catch {
          toast.error('图片上传失败');
          return;
        } finally {
          setIsUploading(false);
        }
      }

      // 保存参数到全局 store
      setPendingParams(params);

      // 获取目标路由
      const targetRoute = getRouteForMode(state.mode);

      // 跳转
      router.push(targetRoute);

      // 调用 onAfterNavigate 回调
      onAfterNavigate?.(targetRoute);
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error('跳转失败，请重试');
    }
  }, [
    state,
    router,
    setPendingParams,
    setIsUploading,
    onBeforeNavigate,
    onAfterNavigate,
  ]);

  return {
    handleInputComplete,
    isNavigating: isUploading,
  };
}
