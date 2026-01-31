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

export const adminImagesKeys = {
  all: ['admin-images'] as const,
  lists: () => [...adminImagesKeys.all, 'lists'] as const,
  list: (params: {
    pageIndex: number;
    pageSize: number;
    search: string;
    sorting: SortingState;
    filters: SimpleFilter[];
  }) => [...adminImagesKeys.lists(), params] as const,
  stats: () => [...adminImagesKeys.all, 'stats'] as const,
};

interface AdminImagesResponse {
  success: boolean;
  data?: {
    images: Array<{
      id: number;
      uuid: string;
      userId: string;
      prompt: string;
      model: string;
      provider: string | null;
      status: string;
      errorMessage: string | null;
      imageUrls: string[] | null;
      thumbnailUrl: string | null;
      creditsUsed: number;
      isFavorite: boolean;
      createdAt: string;
      completedAt: string | null;
    }>;
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  error?: string;
}

interface AdminImagesStatsResponse {
  success: boolean;
  data?: {
    total: number;
    completed: number;
    failed: number;
    generating: number;
    byModel: Record<string, number>;
    todayCount: number;
  };
  error?: string;
}

export function useAdminImages(
  pageIndex: number,
  pageSize: number,
  search: string,
  sorting: SortingState,
  filters: SimpleFilter[]
) {
  return useQuery({
    queryKey: adminImagesKeys.list({
      pageIndex,
      pageSize,
      search,
      sorting,
      filters,
    }),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(pageIndex + 1),
        limit: String(pageSize),
      });

      if (search) {
        params.set('search', search);
      }

      for (const filter of filters) {
        if (filter.value) {
          params.set(filter.id, filter.value);
        }
      }

      const response = await fetch(`/api/v1/admin/images?${params.toString()}`);
      const result: AdminImagesResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch images');
      }

      return {
        items: result.data?.images || [],
        total: result.data?.total || 0,
      };
    },
    placeholderData: keepPreviousData,
  });
}

export function useAdminImagesStats() {
  return useQuery({
    queryKey: adminImagesKeys.stats(),
    queryFn: async () => {
      const response = await fetch('/api/v1/admin/images/stats');
      const result: AdminImagesStatsResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch stats');
      }

      return result.data;
    },
  });
}

export function useDeleteAdminImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uuid: string) => {
      const response = await fetch(`/api/v1/admin/images/${uuid}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete image');
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminImagesKeys.all });
    },
  });
}
