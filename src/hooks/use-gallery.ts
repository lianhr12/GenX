import {
  getFeaturedGalleryAction,
  getGalleryListAction,
  incrementViewAction,
  submitToGalleryAction,
  toggleFavoriteAction,
  toggleLikeAction,
} from '@/actions/gallery';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

// Query keys
export const galleryKeys = {
  all: ['gallery'] as const,
  lists: () => [...galleryKeys.all, 'lists'] as const,
  list: (params: { artStyle?: string; sort?: string; userId?: string }) =>
    [...galleryKeys.lists(), params] as const,
  featured: (params: { limit?: number; userId?: string }) =>
    [...galleryKeys.all, 'featured', params] as const,
  item: (uuid: string) => [...galleryKeys.all, 'item', uuid] as const,
};

// Types
export interface GalleryItem {
  id: number;
  uuid: string;
  videoUrl: string;
  thumbnailUrl: string;
  prompt: string;
  artStyle: string;
  creatorName: string | null;
  creatorAvatar: string | null;
  likesCount: number;
  viewsCount: number;
  createdAt: Date;
  isLiked: boolean;
  isFavorite: boolean;
}

// Hook to fetch featured gallery items (for homepage)
export function useGalleryFeatured(
  options: { limit?: number; userId?: string } = {}
) {
  const { limit = 6, userId } = options;

  return useQuery({
    queryKey: galleryKeys.featured({ limit, userId }),
    queryFn: async () => {
      const result = await getFeaturedGalleryAction({ limit, userId });

      if (!result?.data?.success) {
        throw new Error(
          result?.data?.error || 'Failed to fetch featured gallery'
        );
      }

      return result.data.data?.items || [];
    },
  });
}

// Hook to fetch gallery list with infinite scroll
export function useGalleryList(
  options: {
    artStyle?: string;
    sort?: 'latest' | 'popular';
    userId?: string;
    pageSize?: number;
  } = {}
) {
  const { artStyle, sort = 'latest', userId, pageSize = 12 } = options;

  return useInfiniteQuery({
    queryKey: galleryKeys.list({ artStyle, sort, userId }),
    queryFn: async ({ pageParam = 0 }) => {
      const result = await getGalleryListAction({
        pageIndex: pageParam,
        pageSize,
        artStyle,
        sort,
        userId,
      });

      if (!result?.data?.success) {
        throw new Error(result?.data?.error || 'Failed to fetch gallery');
      }

      return {
        items: result.data.data?.items || [],
        total: result.data.data?.total || 0,
        hasMore: result.data.data?.hasMore || false,
        pageIndex: pageParam,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined;
      return lastPage.pageIndex + 1;
    },
  });
}

// Hook to toggle like on a gallery item
export function useGalleryLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (galleryItemId: number) => {
      const result = await toggleLikeAction({ galleryItemId });

      if (!result?.data?.success) {
        throw new Error(result?.data?.error || 'Failed to toggle like');
      }

      return result.data.data;
    },
    onSuccess: () => {
      // Invalidate all gallery queries to refresh like status
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
    },
  });
}

// Hook to toggle favorite on a gallery item
export function useGalleryFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (galleryItemId: number) => {
      const result = await toggleFavoriteAction({ galleryItemId });

      if (!result?.data?.success) {
        throw new Error(result?.data?.error || 'Failed to toggle favorite');
      }

      return result.data.data;
    },
    onSuccess: () => {
      // Invalidate all gallery queries to refresh favorite status
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
    },
  });
}

// Hook to increment view count
export function useGalleryView() {
  return useMutation({
    mutationFn: async (galleryItemId: number) => {
      const result = await incrementViewAction({ galleryItemId });

      if (!result?.data?.success) {
        throw new Error(result?.data?.error || 'Failed to increment view');
      }

      return result.data.data;
    },
  });
}

// Hook to submit a video to gallery
export function useGallerySubmit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: number) => {
      const result = await submitToGalleryAction({ videoId });

      if (!result?.data?.success) {
        throw new Error(result?.data?.error || 'Failed to submit to gallery');
      }

      return result.data.data;
    },
    onSuccess: () => {
      // Invalidate gallery queries
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
    },
  });
}
