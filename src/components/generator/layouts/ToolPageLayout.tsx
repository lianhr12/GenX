'use client';

// src/components/generator/layouts/ToolPageLayout.tsx

import { useCreatorNavigationStore } from '@/stores/creator-navigation-store';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { GenXCreator } from '../GenXCreator';
import type {
  GenerationParams,
  GenerationResult,
  ToolPageLayoutProps,
} from '../types';
import { FloatingCreator } from './FloatingCreator';
import { HistorySection } from './HistorySection';
import { ResultSection } from './ResultSection';

// 内部组件，处理 searchParams
function ToolPageLayoutInner({ mode, children }: ToolPageLayoutProps) {
  const [currentResult, setCurrentResult] = useState<GenerationResult | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFloating, setShowFloating] = useState(false);
  const creatorRef = useRef<HTMLDivElement>(null);
  const [isParamsReady, setIsParamsReady] = useState(false);
  const hasInitialized = useRef(false);

  const searchParams = useSearchParams();
  const consumePendingParams = useCreatorNavigationStore(
    (state) => state.consumePendingParams
  );
  const clearPending = useCreatorNavigationStore((state) => state.clearPending);
  const [initialParams, setInitialParams] =
    useState<Partial<GenerationParams> | null>(null);

  // 页面加载时，优先从 store 读取，否则从 URL 参数读取
  useEffect(() => {
    // 防止重复初始化
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;

    const pending = consumePendingParams();
    console.log('[ToolPageLayout] Consumed pending params:', pending);

    if (pending) {
      setInitialParams(pending);
      setIsParamsReady(true);
      return;
    }

    // 从 URL 参数恢复
    const prompt = searchParams.get('prompt');
    const model = searchParams.get('model');
    const style = searchParams.get('style');
    const sourceImage = searchParams.get('sourceImage');
    const referenceImage = searchParams.get('referenceImage');

    console.log('[ToolPageLayout] URL params:', {
      prompt,
      model,
      style,
      sourceImage,
      referenceImage,
    });

    if (prompt || sourceImage || referenceImage) {
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
  }, [searchParams, consumePendingParams, mode]);

  // 组件卸载时清理
  useEffect(() => {
    return () => clearPending();
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

      try {
        // TODO: 调用实际的生成 API
        // const result = await generateContent(params);

        // 模拟生成
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const mockResult: GenerationResult = {
          id: `gen-${Date.now()}`,
          type: mode.includes('video')
            ? 'video'
            : mode === 'audio'
              ? 'audio'
              : 'image',
          url: '',
          prompt: params.prompt,
          model: params.model,
          duration: params.duration,
          aspectRatio: params.aspectRatio,
          quality: params.quality,
          creditsUsed: 100,
          createdAt: new Date(),
          status: 'completed',
        };

        setCurrentResult(mockResult);
      } catch (error) {
        console.error('Generation failed:', error);
      } finally {
        setIsGenerating(false);
      }
    },
    [mode]
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
        <HistorySection mode={mode} />

        {/* GenXCreator 输入区 */}
        <div ref={creatorRef}>
          {isParamsReady && (
            <GenXCreator
              key={initialParams ? JSON.stringify(initialParams) : 'no-params'}
              mode={mode}
              modeSwitchBehavior="locked"
              defaultValue={initialParams ?? undefined}
              onGenerate={handleGenerate}
              showStyles
              showCredits
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
