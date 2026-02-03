'use client';

// src/components/generator/hooks/useCreditsCalculation.ts

import { useMemo } from 'react';
import { calculateCredits } from '../config/credits';
import type { CreditsConfig, GenerationParams } from '../types';

/**
 * Hook to calculate credits for generation
 */
export function useCreditsCalculation(
  params: GenerationParams,
  customConfig?: CreditsConfig
): number {
  return useMemo(() => {
    // 优先使用自定义计算函数
    if (customConfig?.calculate) {
      return customConfig.calculate(params);
    }

    // 使用默认计算逻辑
    return calculateCredits(params);
  }, [params, customConfig]);
}
