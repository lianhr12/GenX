'use client';

// src/components/generator/layouts/ToolPageLayout.tsx

import { cn } from '@/lib/utils';
import { useCreatorNavigationStore } from '@/stores/creator-navigation-store';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GenXCreator } from '../GenXCreator';
import type {
  CreatorMode,
  GenerationParams,
  GenerationResult,
  ToolPageLayoutProps,
} from '../types';
import { FloatingCreator } from './FloatingCreator';
import { HistorySection } from './HistorySection';
import { ResultSection } from './ResultSection';

export function ToolPageLayout({ mode, children }: ToolPageLayoutProps) {
  const [currentResult, setCurrentResult] = useState<GenerationResult | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFloating, setShowFloating] = useState(false);
  const creatorRef = useRef<HTMLDivElement>(null);

  const { consumePendingParams, clearPending } = useCreatorNavigationStore();
  const [initialParams, setInitialParams] =
    useState<Partial<GenerationParams> | null>(null);

  // 页面加载时，消费 pending 数据
  useEffect(() => {
    const pending = consumePendingParams();
    if (pending) {
      setInitialParams(pending);
    }

    // 清理
    return () => clearPending();
  }, [consumePendingParams, clearPending]);

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
          <GenXCreator
            mode={mode}
            modeSwitchBehavior="locked"
            defaultValue={initialParams ?? undefined}
            onGenerate={handleGenerate}
            showStyles
            showCredits
          />
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
