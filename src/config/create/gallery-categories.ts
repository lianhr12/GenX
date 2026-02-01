import type {
  AspectRatioOption,
  DurationOption,
  GalleryCategory,
  GalleryItem,
  ResolutionOption,
  SortOption,
} from './types';

export const galleryCategories: GalleryCategory[] = [
  { id: 'all', labelKey: 'all' },
  { id: 'realistic', labelKey: 'realistic' },
  { id: 'anime', labelKey: 'anime' },
  { id: 'cinematic', labelKey: 'cinematic' },
  { id: '3d', labelKey: '3d' },
  { id: 'fantasy', labelKey: 'fantasy' },
  { id: 'abstract', labelKey: 'abstract' },
];

export const sortOptions: { id: SortOption; labelKey: string }[] = [
  { id: 'latest', labelKey: 'latest' },
  { id: 'popular', labelKey: 'popular' },
  { id: 'trending', labelKey: 'trending' },
];

export const aspectRatioOptions: AspectRatioOption[] = [
  { id: '16:9', label: '16:9', value: '16:9', width: 16, height: 9 },
  { id: '9:16', label: '9:16', value: '9:16', width: 9, height: 16 },
  { id: '1:1', label: '1:1', value: '1:1', width: 1, height: 1 },
  { id: '4:3', label: '4:3', value: '4:3', width: 4, height: 3 },
  { id: '3:4', label: '3:4', value: '3:4', width: 3, height: 4 },
];

export const durationOptions: DurationOption[] = [
  { id: '5s', label: '5s', seconds: 5, credits: 10 },
  { id: '10s', label: '10s', seconds: 10, credits: 20 },
];

export const resolutionOptions: ResolutionOption[] = [
  { id: '720p', label: '720p', value: '720p' },
  { id: '1080p', label: '1080p', value: '1080p', isPro: true },
];

// Mock gallery items for demonstration
export const mockGalleryItems: GalleryItem[] = [
  {
    id: '1',
    videoUrl:
      'https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4',
    thumbnailUrl:
      'https://images.pexels.com/videos/3571264/free-video-3571264.jpg',
    prompt: 'A serene mountain landscape at sunset with golden light',
    category: 'realistic',
    model: 'kling-1.6',
    aspectRatio: '16:9',
    likes: 1234,
    views: 5678,
    creatorName: 'Alex Chen',
  },
  {
    id: '2',
    videoUrl:
      'https://videos.pexels.com/video-files/4763824/4763824-uhd_2560_1440_24fps.mp4',
    thumbnailUrl:
      'https://images.pexels.com/videos/4763824/pexels-photo-4763824.jpeg',
    prompt: 'Anime girl with flowing hair in cherry blossom garden',
    category: 'anime',
    model: 'minimax',
    aspectRatio: '9:16',
    likes: 2345,
    views: 8901,
    creatorName: 'Sakura',
  },
  {
    id: '3',
    videoUrl:
      'https://videos.pexels.com/video-files/5752729/5752729-uhd_2560_1440_30fps.mp4',
    thumbnailUrl:
      'https://images.pexels.com/videos/5752729/pexels-photo-5752729.jpeg',
    prompt: 'Cinematic drone shot of a futuristic city at night',
    category: 'cinematic',
    model: 'runway-gen3',
    aspectRatio: '16:9',
    likes: 3456,
    views: 12345,
    creatorName: 'FilmMaker Pro',
  },
  {
    id: '4',
    videoUrl:
      'https://videos.pexels.com/video-files/6394054/6394054-uhd_2560_1440_25fps.mp4',
    thumbnailUrl:
      'https://images.pexels.com/videos/6394054/pexels-photo-6394054.jpeg',
    prompt: '3D rendered abstract geometric shapes floating in space',
    category: '3d',
    model: 'luma-dream',
    aspectRatio: '1:1',
    likes: 987,
    views: 4321,
    creatorName: '3D Artist',
  },
  {
    id: '5',
    videoUrl:
      'https://videos.pexels.com/video-files/4434242/4434242-uhd_2560_1440_24fps.mp4',
    thumbnailUrl:
      'https://images.pexels.com/videos/4434242/pexels-photo-4434242.jpeg',
    prompt: 'Fantasy dragon flying through mystical clouds',
    category: 'fantasy',
    model: 'pika-1.5',
    aspectRatio: '16:9',
    likes: 4567,
    views: 15678,
    creatorName: 'Dragon Master',
  },
  {
    id: '6',
    videoUrl:
      'https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4',
    thumbnailUrl:
      'https://images.pexels.com/videos/3129671/free-video-3129671.jpg',
    prompt: 'Abstract fluid art with vibrant colors mixing',
    category: 'abstract',
    model: 'cogvideox',
    aspectRatio: '1:1',
    likes: 2109,
    views: 7654,
    creatorName: 'Abstract Art',
  },
  {
    id: '7',
    videoUrl:
      'https://videos.pexels.com/video-files/5377684/5377684-uhd_2560_1440_25fps.mp4',
    thumbnailUrl:
      'https://images.pexels.com/videos/5377684/pexels-photo-5377684.jpeg',
    prompt: 'Realistic ocean waves crashing on rocky shore',
    category: 'realistic',
    model: 'stable-video',
    aspectRatio: '16:9',
    likes: 3210,
    views: 9876,
    creatorName: 'Nature Lover',
  },
  {
    id: '8',
    videoUrl:
      'https://videos.pexels.com/video-files/4812203/4812203-uhd_2560_1440_25fps.mp4',
    thumbnailUrl:
      'https://images.pexels.com/videos/4812203/pexels-photo-4812203.jpeg',
    prompt: 'Anime style cyberpunk city with neon lights',
    category: 'anime',
    model: 'hailuo',
    aspectRatio: '9:16',
    likes: 5432,
    views: 18765,
    creatorName: 'Cyber Anime',
  },
];
