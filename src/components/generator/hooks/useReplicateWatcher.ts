'use client';

import { getTargetMode } from '@/components/shared/replicate-button';
import { useCreatorNavigationStore } from '@/stores/creator-navigation-store';
import { useEffect } from 'react';
import type { CreatorState } from '../types';
import { useCreatorState } from './useCreatorState';

/**
 * 监听 navigation store 中的 replicateData，
 * 当检测到新数据时自动填充到当前 GenXCreator 的状态中。
 */
export function useReplicateWatcher() {
  const { setMode, setState } = useCreatorState();
  const replicateData = useCreatorNavigationStore((s) => s.replicateData);
  const consumeReplicateData = useCreatorNavigationStore(
    (s) => s.consumeReplicateData
  );

  useEffect(() => {
    if (!replicateData) return;

    const data = consumeReplicateData();
    if (!data) return;

    // 确定目标模式
    const targetMode = data.targetMode ?? getTargetMode(data);
    if (targetMode) {
      setMode(targetMode);
    }

    // 构建需要更新的字段
    const updates: Partial<CreatorState> = {};
    if (data.prompt) updates.prompt = data.prompt;
    if (data.artStyle) updates.style = data.artStyle;
    if (data.aspectRatio) updates.aspectRatio = data.aspectRatio;
    if (data.model) updates.model = data.model;

    if (Object.keys(updates).length > 0) {
      // 使用 requestAnimationFrame 确保 SET_MODE 先完成
      requestAnimationFrame(() => {
        setState(updates);
      });
    }
  }, [replicateData, consumeReplicateData, setMode, setState]);
}
