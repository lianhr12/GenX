// src/stores/creator-navigation-store.ts

import { modeRoutes } from '@/components/generator/config/modes';
import type {
  CreatorMode,
  GenerationParams,
} from '@/components/generator/types';
import { create } from 'zustand';

export interface ReplicateData {
  prompt?: string;
  artStyle?: string;
  aspectRatio?: string;
  model?: string;
  mediaType?: 'video' | 'image';
  targetMode?: import('@/components/generator/types').CreatorMode;
}

interface CreatorNavigationState {
  // 待传递的数据
  pendingParams: GenerationParams | null;

  // 已创建的生成任务信息
  pendingTaskId: string | null; // imageUuid 或 videoUuid

  // 上传中的图片
  uploadingImage: File | null;
  uploadedImageUrl: string | null;

  // 跳转目标
  targetRoute: string | null;

  // 是否正在上传
  isUploading: boolean;

  // 是否正在提交任务
  isSubmitting: boolean;

  // 复刻效果数据
  replicateData: ReplicateData | null;

  // Actions
  setPendingParams: (params: GenerationParams) => void;
  setPendingTaskId: (taskId: string) => void;
  setUploadingImage: (file: File | null) => void;
  setUploadedImageUrl: (url: string | null) => void;
  setIsUploading: (isUploading: boolean) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  navigateToTool: (mode: CreatorMode) => void;
  setReplicateData: (data: ReplicateData) => void;
  consumeReplicateData: () => ReplicateData | null;
  clearPending: () => void;
  consumePendingData: () => {
    params: GenerationParams | null;
    taskId: string | null;
  };
}

export const useCreatorNavigationStore = create<CreatorNavigationState>(
  (set, get) => ({
    pendingParams: null,
    pendingTaskId: null,
    uploadingImage: null,
    uploadedImageUrl: null,
    targetRoute: null,
    isUploading: false,
    isSubmitting: false,
    replicateData: null,

    setPendingParams: (params) => set({ pendingParams: params }),

    setPendingTaskId: (taskId) => set({ pendingTaskId: taskId }),

    setUploadingImage: (file) => set({ uploadingImage: file }),

    setUploadedImageUrl: (url) => set({ uploadedImageUrl: url }),

    setIsUploading: (isUploading) => set({ isUploading }),

    setIsSubmitting: (isSubmitting) => set({ isSubmitting }),

    navigateToTool: (mode) => {
      set({ targetRoute: modeRoutes[mode] });
    },

    setReplicateData: (data) => set({ replicateData: data }),

    consumeReplicateData: () => {
      const data = get().replicateData;
      set({ replicateData: null });
      return data;
    },

    clearPending: () =>
      set({
        pendingParams: null,
        pendingTaskId: null,
        uploadingImage: null,
        uploadedImageUrl: null,
        targetRoute: null,
        isUploading: false,
        isSubmitting: false,
        replicateData: null,
      }),

    // 消费并清除 pending 数据
    consumePendingData: () => {
      const params = get().pendingParams;
      const taskId = get().pendingTaskId;
      set({ pendingParams: null, pendingTaskId: null });
      return { params, taskId };
    },
  })
);
