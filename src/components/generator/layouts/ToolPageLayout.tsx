'use client';

// src/components/generator/layouts/ToolPageLayout.tsx

import {
  generateImageAction,
  refreshImageStatusAction,
} from '@/actions/generate-image';
import {
  generateVideoAction,
  refreshVideoStatusAction,
} from '@/actions/generate-video';
import { useCreatorNavigationStore } from '@/stores/creator-navigation-store';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { GenXCreator } from '../GenXCreator';
import type {
  GenerationParams,
  GenerationResult,
  ToolPageLayoutProps,
} from '../types';
import { FloatingCreator } from './FloatingCreator';
import { HistorySection } from './HistorySection';
import { ResultSection } from './ResultSection';

// Polling interval for status check (ms)
const POLL_INTERVAL = 2000;
const MAX_POLL_ATTEMPTS = 150; // 5 minutes max

// 内部组件，处理 searchParams
function ToolPageLayoutInner({ mode, children }: ToolPageLayoutProps) {
  const [currentResult, setCurrentResult] = useState<GenerationResult | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFloating, setShowFloating] = useState(false);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const creatorRef = useRef<HTMLDivElement>(null);
  const [isParamsReady, setIsParamsReady] = useState(false);
  const hasInitialized = useRef(false);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchParams = useSearchParams();
  const consumePendingData = useCreatorNavigationStore(
    (state) => state.consumePendingData
  );
  const consumeReplicateData = useCreatorNavigationStore(
    (state) => state.consumeReplicateData
  );
  const clearPending = useCreatorNavigationStore((state) => state.clearPending);
  const [initialParams, setInitialParams] =
    useState<Partial<GenerationParams> | null>(null);

  // Poll for image status
  const pollImageStatus = useCallback(
    async (imageUuid: string, attempt = 0) => {
      if (attempt >= MAX_POLL_ATTEMPTS) {
        setIsGenerating(false);
        toast.error('生成超时，请稍后重试');
        return;
      }

      try {
        const result = await refreshImageStatusAction({ imageUuid });

        // Handle server error
        if (result?.serverError) {
          throw new Error(
            typeof result.serverError === 'string'
              ? result.serverError
              : 'Server error occurred'
          );
        }

        if (!result?.data?.success) {
          throw new Error(result?.data?.error || 'Failed to get status');
        }

        const status = result.data.data;

        if (!status) {
          throw new Error('No status data returned');
        }

        if (status.status === 'COMPLETED' && status.imageUrls?.length) {
          setCurrentResult((prev) => ({
            ...prev!,
            status: 'completed',
            url: status.imageUrls![0],
            thumbnailUrl: status.imageUrls![0],
          }));
          setIsGenerating(false);
          setHistoryRefreshKey((k) => k + 1);
          toast.success('图片生成完成！');
          return;
        }

        if (status.status === 'FAILED') {
          setCurrentResult((prev) => ({
            ...prev!,
            status: 'failed',
            errorMessage: status.error,
          }));
          setIsGenerating(false);
          toast.error(status.error || '生成失败');
          return;
        }

        // Continue polling
        pollTimeoutRef.current = setTimeout(() => {
          pollImageStatus(imageUuid, attempt + 1);
        }, POLL_INTERVAL);
      } catch (error) {
        console.error('Poll status error:', error);
        // Continue polling on error
        pollTimeoutRef.current = setTimeout(() => {
          pollImageStatus(imageUuid, attempt + 1);
        }, POLL_INTERVAL);
      }
    },
    []
  );

  // Poll for video status
  const pollVideoStatus = useCallback(
    async (videoUuid: string, attempt = 0) => {
      if (attempt >= MAX_POLL_ATTEMPTS) {
        setIsGenerating(false);
        toast.error('生成超时，请稍后重试');
        return;
      }

      try {
        const result = await refreshVideoStatusAction({ videoUuid });

        // Handle server error
        if (result?.serverError) {
          throw new Error(
            typeof result.serverError === 'string'
              ? result.serverError
              : 'Server error occurred'
          );
        }

        if (!result?.data?.success) {
          throw new Error(result?.data?.error || 'Failed to get status');
        }

        const status = result.data.data;

        if (!status) {
          throw new Error('No status data returned');
        }

        if (status.status === 'COMPLETED' && status.videoUrl) {
          setCurrentResult((prev) => ({
            ...prev!,
            status: 'completed',
            url: status.videoUrl!,
            thumbnailUrl: status.videoUrl,
          }));
          setIsGenerating(false);
          setHistoryRefreshKey((k) => k + 1);
          toast.success('视频生成完成！');
          return;
        }

        if (status.status === 'FAILED') {
          setCurrentResult((prev) => ({
            ...prev!,
            status: 'failed',
            errorMessage: status.error,
          }));
          setIsGenerating(false);
          toast.error(status.error || '生成失败');
          return;
        }

        // Continue polling
        pollTimeoutRef.current = setTimeout(() => {
          pollVideoStatus(videoUuid, attempt + 1);
        }, POLL_INTERVAL);
      } catch (error) {
        console.error('Poll video status error:', error);
        // Continue polling on error
        pollTimeoutRef.current = setTimeout(() => {
          pollVideoStatus(videoUuid, attempt + 1);
        }, POLL_INTERVAL);
      }
    },
    []
  );

  // 页面加载时，优先从 store 读取，否则从 URL 参数读取
  useEffect(() => {
    // 防止重复初始化
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;

    // 判断是图片还是视频模式
    const isImageMode = mode === 'text-to-image' || mode === 'image-to-image';
    const resultType = isImageMode ? 'image' : 'video';

    // 优先检查 replicateData（从复刻按钮传入）
    const replicateData = consumeReplicateData();
    if (replicateData) {
      console.log('[ToolPageLayout] Consumed replicate data:', replicateData);
      setInitialParams({
        mode,
        prompt: replicateData.prompt || '',
        model: replicateData.model || undefined,
        style: replicateData.artStyle || undefined,
        aspectRatio: replicateData.aspectRatio || undefined,
      });
      setIsParamsReady(true);
      return;
    }

    const { params: pending, taskId } = consumePendingData();
    console.log(
      '[ToolPageLayout] Consumed pending data:',
      pending,
      'taskId:',
      taskId,
      'mode:',
      mode
    );

    // 如果有 taskId，说明任务已经创建，开始轮询
    if (taskId && pending) {
      setInitialParams(pending);
      setIsParamsReady(true);
      setIsGenerating(true);

      // 设置初始结果状态
      const initialResult: GenerationResult = {
        id: taskId,
        type: resultType,
        url: '',
        prompt: pending.prompt || '',
        model: pending.model || '',
        aspectRatio: pending.aspectRatio,
        quality: pending.quality,
        creditsUsed: 0,
        createdAt: new Date(),
        status: 'processing',
      };
      setCurrentResult(initialResult);

      // 根据模式开始轮询状态
      if (isImageMode) {
        pollImageStatus(taskId);
      } else {
        pollVideoStatus(taskId);
      }
      return;
    }

    // 从 URL 参数恢复（用于页面刷新或直接访问）
    const taskIdFromUrl = searchParams.get('taskId');
    const prompt = searchParams.get('prompt');
    const model = searchParams.get('model');
    const style = searchParams.get('style');
    const sourceImage = searchParams.get('sourceImage');
    const referenceImage = searchParams.get('referenceImage');

    console.log('[ToolPageLayout] URL params:', {
      taskIdFromUrl,
      prompt,
      model,
      style,
      sourceImage,
      referenceImage,
    });

    // 如果 URL 中有 taskId，开始轮询
    if (taskIdFromUrl) {
      setIsGenerating(true);
      const initialResult: GenerationResult = {
        id: taskIdFromUrl,
        type: resultType,
        url: '',
        prompt: prompt || '',
        model: model || '',
        creditsUsed: 0,
        createdAt: new Date(),
        status: 'processing',
      };
      setCurrentResult(initialResult);

      // 根据模式开始轮询状态
      if (isImageMode) {
        pollImageStatus(taskIdFromUrl);
      } else {
        pollVideoStatus(taskIdFromUrl);
      }
    }

    if (prompt || model || style || sourceImage || referenceImage) {
      setInitialParams({
        mode,
        prompt: prompt || '',
        model: model || undefined,
        style: style || undefined,
        sourceImage: sourceImage || undefined,
        referenceImage: referenceImage || undefined,
      });
    }

    // 标记参数已准备好
    setIsParamsReady(true);
  }, [
    searchParams,
    consumePendingData,
    consumeReplicateData,
    mode,
    pollImageStatus,
    pollVideoStatus,
  ]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      clearPending();
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [clearPending]);

  // 监听 GenXCreator 是否在视图内
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowFloating(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (creatorRef.current) {
      observer.observe(creatorRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const handleGenerate = useCallback(
    async (params: GenerationParams) => {
      setIsGenerating(true);

      // Clear any existing poll
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }

      try {
        // Determine if this is an image or video generation
        const isImageMode =
          mode === 'text-to-image' || mode === 'image-to-image';

        if (isImageMode) {
          // 转换 quality 参数：视频质量 (720p/1080p) 不适用于图片
          // 图片质量应该是 high/medium/low，如果不是则使用默认值
          const imageQuality =
            params.quality === 'high' ||
            params.quality === 'medium' ||
            params.quality === 'low'
              ? params.quality
              : 'medium';

          // Call image generation API
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

          // Handle server error
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

          if (!data) {
            throw new Error('No data returned from server');
          }

          // Set initial result
          const initialResult: GenerationResult = {
            id: data.imageUuid,
            type: 'image',
            url: '',
            prompt: params.prompt,
            model: params.model,
            aspectRatio: params.aspectRatio,
            quality: params.quality,
            creditsUsed: 0,
            createdAt: new Date(),
            status: 'processing',
          };

          setCurrentResult(initialResult);
          toast.info('图片生成中...');

          // Start polling for status
          pollImageStatus(data.imageUuid);
        } else {
          // Video generation
          const result = await generateVideoAction({
            prompt: params.prompt,
            model: params.model,
            duration: params.duration || 5,
            aspectRatio: params.aspectRatio,
            quality: params.quality,
            generateAudio: params.generateAudio,
            audioUrl: params.audioUrl ?? undefined,
            isPublic: params.isPublic,
          });

          // Handle server error
          if (result?.serverError) {
            throw new Error(
              typeof result.serverError === 'string'
                ? result.serverError
                : 'Server error occurred'
            );
          }

          if (!result?.data?.success) {
            throw new Error(
              result?.data?.error || 'Failed to start video generation'
            );
          }

          const data = result.data.data;

          if (!data) {
            throw new Error('No data returned from server');
          }

          // Set initial result
          const initialResult: GenerationResult = {
            id: data.videoUuid,
            type: 'video',
            url: '',
            prompt: params.prompt,
            model: params.model,
            aspectRatio: params.aspectRatio,
            quality: params.quality,
            creditsUsed: data.creditsUsed,
            createdAt: new Date(),
            status: 'processing',
          };

          setCurrentResult(initialResult);
          toast.info('视频生成中...');

          // Start polling for status
          pollVideoStatus(data.videoUuid);
        }
      } catch (error) {
        console.error('Generation failed:', error);
        setIsGenerating(false);
        toast.error(
          error instanceof Error ? error.message : '生成失败，请重试'
        );
      }
    },
    [mode, pollImageStatus, pollVideoStatus]
  );

  const handleSelectHistoryItem = useCallback(
    (item: GenerationResult) => {
      setCurrentResult(item);
      setIsGenerating(false);
      // Scroll to top to show the selected result
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    []
  );

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* 结果展示区 */}
        <ResultSection
          result={currentResult}
          mode={mode}
          isLoading={isGenerating}
        />

        {/* 历史记录区 */}
        <HistorySection
          mode={mode}
          onSelectItem={handleSelectHistoryItem}
          refreshKey={historyRefreshKey}
        />

        {/* GenXCreator 输入区 - 使用 compact 模式 */}
        <div ref={creatorRef}>
          {isParamsReady && (
            <GenXCreator
              key={initialParams ? JSON.stringify(initialParams) : 'no-params'}
              mode={mode}
              modeSwitchBehavior="locked"
              defaultValue={initialParams ?? undefined}
              onGenerate={handleGenerate}
              showCredits
              compact
            />
          )}
        </div>

        {/* 额外内容 */}
        {children}
      </div>

      {/* 浮动输入栏 */}
      {showFloating && (
        <FloatingCreator mode={mode} onGenerate={handleGenerate} />
      )}
    </div>
  );
}

// 导出的组件，包裹 Suspense
export function ToolPageLayout({ mode, children }: ToolPageLayoutProps) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ToolPageLayoutInner mode={mode}>{children}</ToolPageLayoutInner>
    </Suspense>
  );
}
