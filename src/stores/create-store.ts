import type { GalleryItem, ProductTab, SortOption } from '@/config/create';
import { create } from 'zustand';

interface CreateState {
  // Product tab state
  activeTab: ProductTab;
  setActiveTab: (tab: ProductTab) => void;

  // Prompt input state
  prompt: string;
  setPrompt: (prompt: string) => void;

  // Selected style tags
  selectedStyles: string[];
  toggleStyle: (styleId: string) => void;
  clearStyles: () => void;

  // Parameter state
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
  duration: string;
  setDuration: (duration: string) => void;
  resolution: string;
  setResolution: (resolution: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;

  // Gallery state
  galleryCategory: string;
  setGalleryCategory: (category: string) => void;
  gallerySortBy: SortOption;
  setGallerySortBy: (sort: SortOption) => void;
  galleryItems: GalleryItem[];
  setGalleryItems: (items: GalleryItem[]) => void;
  appendGalleryItems: (items: GalleryItem[]) => void;
  galleryPage: number;
  setGalleryPage: (page: number) => void;
  hasMoreGallery: boolean;
  setHasMoreGallery: (hasMore: boolean) => void;

  // Generation state
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  generationProgress: number;
  setGenerationProgress: (progress: number) => void;

  // Floating input visibility
  showFloatingInput: boolean;
  setShowFloatingInput: (show: boolean) => void;

  // Reset all state
  reset: () => void;
}

const initialState = {
  activeTab: 'video' as ProductTab,
  prompt: '',
  selectedStyles: [],
  aspectRatio: '16:9',
  duration: '5s',
  resolution: '720p',
  selectedModel: 'kling-1.6',
  galleryCategory: 'all',
  gallerySortBy: 'latest' as SortOption,
  galleryItems: [],
  galleryPage: 1,
  hasMoreGallery: true,
  isGenerating: false,
  generationProgress: 0,
  showFloatingInput: false,
};

export const useCreateStore = create<CreateState>((set) => ({
  ...initialState,

  setActiveTab: (tab) => set({ activeTab: tab }),

  setPrompt: (prompt) => set({ prompt }),

  toggleStyle: (styleId) =>
    set((state) => ({
      selectedStyles: state.selectedStyles.includes(styleId)
        ? state.selectedStyles.filter((id) => id !== styleId)
        : [...state.selectedStyles, styleId],
    })),

  clearStyles: () => set({ selectedStyles: [] }),

  setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
  setDuration: (duration) => set({ duration }),
  setResolution: (resolution) => set({ resolution }),
  setSelectedModel: (model) => set({ selectedModel: model }),

  setGalleryCategory: (category) =>
    set({ galleryCategory: category, galleryPage: 1, galleryItems: [] }),
  setGallerySortBy: (sort) =>
    set({ gallerySortBy: sort, galleryPage: 1, galleryItems: [] }),
  setGalleryItems: (items) => set({ galleryItems: items }),
  appendGalleryItems: (items) =>
    set((state) => ({ galleryItems: [...state.galleryItems, ...items] })),
  setGalleryPage: (page) => set({ galleryPage: page }),
  setHasMoreGallery: (hasMore) => set({ hasMoreGallery: hasMore }),

  setIsGenerating: (generating) => set({ isGenerating: generating }),
  setGenerationProgress: (progress) => set({ generationProgress: progress }),

  setShowFloatingInput: (show) => set({ showFloatingInput: show }),

  reset: () => set(initialState),
}));
