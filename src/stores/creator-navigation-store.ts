// src/stores/creator-navigation-store.ts

import { modeRoutes } from '@/components/generator/config/modes';
import type {
  CreatorMode,
  GenerationParams,
} from '@/components/generator/types';
import { create } from 'zustand';

interface CreatorNavigationState {
  // 待传递的数据
  pendingParams: GenerationParams | null;

  // 上传中的图片
  uploadingImage: File | null;
  uploadedImageUrl: string | null;

  // 跳转目标
  targetRoute: string | null;

  // 是否正在上传
  isUploading: boolean;

  // Actions
  setPendingParams: (params: GenerationParams) => void;
  setUploadingImage: (file: File | null) => void;
  setUploadedImageUrl: (url: string | null) => void;
  setIsUploading: (isUploading: boolean) => void;
  navigateToTool: (mode: CreatorMode) => void;
  clearPending: () => void;
  consumePendingParams: () => GenerationParams | null;
}

export const useCreatorNavigationStore = create<CreatorNavigationState>(
  (set, get) => ({
    pendingParams: null,
    uploadingImage: null,
    uploadedImageUrl: null,
    targetRoute: null,
    isUploading: false,

    setPendingParams: (params) => set({ pendingParams: params }),

    setUploadingImage: (file) => set({ uploadingImage: file }),

    setUploadedImageUrl: (url) => set({ uploadedImageUrl: url }),

    setIsUploading: (isUploading) => set({ isUploading }),

    navigateToTool: (mode) => {
      set({ targetRoute: modeRoutes[mode] });
    },

    clearPending: () =>
      set({
        pendingParams: null,
        uploadingImage: null,
        uploadedImageUrl: null,
        targetRoute: null,
        isUploading: false,
      }),

    // 消费并清除 pending 数据
    consumePendingParams: () => {
      const params = get().pendingParams;
      set({ pendingParams: null });
      return params;
    },
  })
);
