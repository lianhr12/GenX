// Types for Create Page configuration

export type ProductTab = 'video' | 'image' | 'agent';

export interface StyleTag {
  id: string;
  labelKey: string;
  icon?: string;
  gradient?: string;
}

export interface FeatureBanner {
  id: string;
  titleKey: string;
  descriptionKey: string;
  image: string;
  href: string;
  gradient: string;
  badge?: string;
}

export interface VideoTool {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  href: string;
  gradient: string;
  badge?: string;
  isNew?: boolean;
  isPro?: boolean;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  descriptionKey: string;
  image: string;
  href: string;
  badge?: string;
  isNew?: boolean;
  isPro?: boolean;
  features?: string[];
}

export interface GalleryCategory {
  id: string;
  labelKey: string;
}

export interface GalleryItem {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  prompt: string;
  category: string;
  model: string;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3' | '3:4';
  likes: number;
  views: number;
  creatorName?: string;
  creatorAvatar?: string;
}

export type SortOption = 'latest' | 'popular' | 'trending';

export interface AspectRatioOption {
  id: string;
  label: string;
  value: string;
  width: number;
  height: number;
}

export interface DurationOption {
  id: string;
  label: string;
  seconds: number;
  credits: number;
}

export interface ResolutionOption {
  id: string;
  label: string;
  value: string;
  isPro?: boolean;
}
