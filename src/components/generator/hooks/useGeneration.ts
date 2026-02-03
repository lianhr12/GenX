'use client';

// src/components/generator/hooks/useGeneration.ts

import { useCallback, useState } from 'react';
import type { GenerationParams, GenerationResult } from '../types';
import { useCreatorState } from './useCreatorState';

interface UseGenerationOptions {
  onSuccess?: (result: GenerationResult) => void;
  onError?: (error: Error) => void;
  onStart?: () => void;
  onComplete?: () => void;
}

interface UseGenerationReturn {
  generate: (
    params?: Partial<GenerationParams>
  ) => Promise<GenerationResult | null>;
  isGenerating: boolean;
  progress: number;
  error: Error | null;
  result: GenerationResult | null;
}

/**
 * Hook to handle generation logic
 */
export function useGeneration(
  options: UseGenerationOptions = {}
): UseGenerationReturn {
  const { onSuccess, onError, onStart, onComplete } = options;
  const state = useCreatorState();
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const generate = useCallback(
    async (
      overrideParams?: Partial<GenerationParams>
    ): Promise<GenerationResult | null> => {
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
        ...overrideParams,
      };

      try {
        setError(null);
        state.setGenerating(true);
        state.setProgress(0);
        onStart?.();

        // TODO: 实际的生成 API 调用
        // 这里需要根据 mode 调用不同的 API
        // const result = await generateContent(params);

        // 模拟生成过程
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const mockResult: GenerationResult = {
          id: `gen-${Date.now()}`,
          type: params.mode.includes('video')
            ? 'video'
            : params.mode === 'audio'
              ? 'audio'
              : 'image',
          url: '',
          prompt: params.prompt,
          model: params.model,
          duration: params.duration,
          aspectRatio: params.aspectRatio,
          quality: params.quality,
          creditsUsed: 0,
          createdAt: new Date(),
          status: 'completed',
        };

        setResult(mockResult);
        onSuccess?.(mockResult);
        return mockResult;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Generation failed');
        setError(error);
        onError?.(error);
        return null;
      } finally {
        state.setGenerating(false);
        state.setProgress(100);
        onComplete?.();
      }
    },
    [state, onSuccess, onError, onStart, onComplete]
  );

  return {
    generate,
    isGenerating: state.isGenerating,
    progress: state.generationProgress,
    error,
    result,
  };
}
