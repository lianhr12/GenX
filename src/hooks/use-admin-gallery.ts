import {
  createGalleryItemAction,
  deleteGalleryItemAction,
  getAdminGalleryAction,
  reviewGalleryItemAction,
  toggleFeaturedAction,
  updateGalleryItemAction,
} from '@/actions/gallery';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { SortingState } from '@tanstack/react-table';

interface SimpleFilter {
  id: string;
  value: string;
}

export const adminGalleryKeys = {
  all: ['admin-gallery'] as const,
  lists: () => [...adminGalleryKeys.all, 'lists'] as const,
  list: (params: {
    pageIndex: number;
    pageSize: number;
    search: string;
    sorting: SortingState;
    filters: SimpleFilter[];
  }) => [...adminGalleryKeys.lists(), params] as const,
};

export function useAdminGallery(
  pageIndex: number,
  pageSize: number,
  search: string,
  sorting: SortingState,
  filters: SimpleFilter[]
) {
  return useQuery({
    queryKey: adminGalleryKeys.list({
      pageIndex,
      pageSize,
      search,
      sorting,
      filters,
    }),
    queryFn: async () => {
      const result = await getAdminGalleryAction({
        pageIndex,
        pageSize,
        search,
        sorting,
        filters,
      });

      if (!result?.data?.success) {
        throw new Error(result?.data?.error || 'Failed to fetch gallery items');
      }

      return {
        items: result.data.data?.items || [],
        total: result.data.data?.total || 0,
      };
    },
    placeholderData: keepPreviousData,
  });
}

export function useCreateGalleryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      videoUrl: string;
      thumbnailUrl: string;
      prompt: string;
      artStyle:
        | 'cyberpunk'
        | 'watercolor'
        | 'oilPainting'
        | 'anime'
        | 'fluidArt';
      sourceType?: 'official' | 'user';
      creatorName?: string;
      creatorAvatar?: string;
      isFeatured?: boolean;
      sortWeight?: number;
    }) => {
      const result = await createGalleryItemAction(data);

      if (!result?.data?.success) {
        throw new Error(result?.data?.error || 'Failed to create gallery item');
      }

      return result.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminGalleryKeys.all });
    },
  });
}

export function useUpdateGalleryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: number;
      videoUrl?: string;
      thumbnailUrl?: string;
      prompt?: string;
      artStyle?:
        | 'cyberpunk'
        | 'watercolor'
        | 'oilPainting'
        | 'anime'
        | 'fluidArt';
      creatorName?: string;
      isFeatured?: boolean;
      sortWeight?: number;
    }) => {
      const result = await updateGalleryItemAction(data);

      if (!result?.data?.success) {
        throw new Error(result?.data?.error || 'Failed to update gallery item');
      }

      return result.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminGalleryKeys.all });
    },
  });
}

export function useDeleteGalleryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const result = await deleteGalleryItemAction({ id });

      if (!result?.data?.success) {
        throw new Error(result?.data?.error || 'Failed to delete gallery item');
      }

      return result.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminGalleryKeys.all });
    },
  });
}

export function useReviewGalleryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: number;
      action: 'approve' | 'reject';
      rejectReason?: string;
    }) => {
      const result = await reviewGalleryItemAction(data);

      if (!result?.data?.success) {
        throw new Error(result?.data?.error || 'Failed to review gallery item');
      }

      return result.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminGalleryKeys.all });
    },
  });
}

export function useToggleFeatured() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: number; isFeatured: boolean }) => {
      const result = await toggleFeaturedAction(data);

      if (!result?.data?.success) {
        throw new Error(
          result?.data?.error || 'Failed to toggle featured status'
        );
      }

      return result.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminGalleryKeys.all });
    },
  });
}
