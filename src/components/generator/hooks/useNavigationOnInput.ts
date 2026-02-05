'use client';

// src/components/generator/hooks/useNavigationOnInput.ts

import { generateImageAction } from '@/actions/generate-image';
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
 * Flow: Submit generation task -> On success, navigate to tool page
 */
export function useNavigationOnInput(
  options: UseNavigationOnInputOptions = {}
): UseNavigationOnInputReturn {
  const { onBeforeNavigate, onAfterNavigate } = options;
  const router = useRouter();
  const state = useCreatorState();
  const {
    setPendingParams,
    setPendingTaskId,
    setIsUploading,
    setIsSubmitting,
    isUploading,
    isSubmitting,
  } = useCreatorNavigationStore();

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

      // 判断是图片还是视频模式
      const isImageMode =
        state.mode === 'text-to-image' || state.mode === 'image-to-image';

      if (isImageMode) {
        // 先提交生成任务
        setIsSubmitting(true);

        try {
          // 转换 quality 参数：视频质量 (720p/1080p) 不适用于图片
          // 图片质量应该是 high/medium/low，如果不是则使用默认值
          const imageQuality =
            params.quality === 'high' ||
            params.quality === 'medium' ||
            params.quality === 'low'
              ? params.quality
              : 'medium';

          const result = await generateImageAction({
            prompt: params.prompt,
            model: params.model,
            aspectRatio: params.aspectRatio as
              | '1:1'
              | '16:9'
              | '9:16'
              | '4:3'
              | '3:4'
              | undefined,
            quality: imageQuality,
            numberOfImages: params.outputNumber || 1,
            isPublic: params.isPublic,
          });

          console.log('[Navigation] generateImageAction result:', result);

          // next-safe-action 返回格式: { data: { success, data/error }, serverError }
          if (result?.serverError) {
            throw new Error(
              typeof result.serverError === 'string'
                ? result.serverError
                : 'Server error occurred'
            );
          }

          if (!result?.data?.success) {
            throw new Error(
              result?.data?.error || 'Failed to start generation'
            );
          }

          const data = result.data.data;

          // 保存任务 ID 和参数到 store
          setPendingParams(params);
          setPendingTaskId(data.imageUuid);

          // 获取目标路由并跳转
          const targetRoute = getRouteForMode(state.mode);
          const url = `${targetRoute}?taskId=${data.imageUuid}`;

          console.log(
            '[Navigation] Task created, navigating to:',
            url,
            'taskId:',
            data.imageUuid
          );
          router.push(url);

          // 调用 onAfterNavigate 回调
          onAfterNavigate?.(targetRoute);
        } catch (error) {
          console.error('Generation failed:', error);
          toast.error(
            error instanceof Error ? error.message : '生成任务创建失败，请重试'
          );
          // 失败时不跳转
          return;
        } finally {
          setIsSubmitting(false);
        }
      } else {
        // 视频模式 - 暂时只跳转，不创建任务
        setPendingParams(params);

        const targetRoute = getRouteForMode(state.mode);
        const searchParams = new URLSearchParams();
        if (params.prompt) {
          searchParams.set('prompt', params.prompt);
        }
        if (params.model) {
          searchParams.set('model', params.model);
        }

        const url = searchParams.toString()
          ? `${targetRoute}?${searchParams.toString()}`
          : targetRoute;

        console.log('[Navigation] Navigating to:', url, 'with params:', params);
        router.push(url);

        onAfterNavigate?.(targetRoute);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error('操作失败，请重试');
    }
  }, [
    state,
    router,
    setPendingParams,
    setPendingTaskId,
    setIsUploading,
    setIsSubmitting,
    onBeforeNavigate,
    onAfterNavigate,
  ]);

  return {
    handleInputComplete,
    isNavigating: isUploading || isSubmitting,
  };
}
