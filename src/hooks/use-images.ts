'use client';

import type { Image } from '@/db';
import { useCallback, useEffect, useState } from 'react';

interface UseImagesOptions {
  initialLimit?: number;
  status?: string;
  model?: string;
  isFavorite?: boolean;
  search?: string;
  autoFetch?: boolean;
}

export function useImages(options: UseImagesOptions = {}) {
  const {
    initialLimit = 20,
    status,
    model,
    isFavorite,
    search,
    autoFetch = true,
  } = options;

  const [images, setImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Fetch images
  const fetchImages = useCallback(
    async (pageNum = 1, append = false) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set('limit', String(initialLimit));
        params.set('page', String(pageNum));
        if (status) params.set('status', status);
        if (model) params.set('model', model);
        if (isFavorite !== undefined)
          params.set('isFavorite', String(isFavorite));
        if (search) params.set('search', search);

        const response = await fetch(`/api/v1/image/list?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch images');
        }

        const result = await response.json();
        const data = result.data;

        if (append) {
          setImages((prev) => [...prev, ...data.images]);
        } else {
          setImages(data.images);
        }

        setPage(data.page);
        setTotalPages(data.totalPages);
        setTotal(data.total);
        setHasMore(data.page < data.totalPages);
      } catch (err) {
        const errMsg =
          err instanceof Error ? err.message : 'Failed to fetch images';
        setError(errMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [initialLimit, status, model, isFavorite, search]
  );

  // Load more images
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchImages(page + 1, true);
    }
  }, [isLoading, hasMore, page, fetchImages]);

  // Refresh images (reload from beginning)
  const refresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    fetchImages(1, false);
  }, [fetchImages]);

  // Delete image
  const deleteImage = useCallback(async (uuid: string) => {
    try {
      const response = await fetch(`/api/v1/image/${uuid}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      // Remove from local state
      setImages((prev) => prev.filter((img) => img.uuid !== uuid));
      setTotal((prev) => prev - 1);
      return true;
    } catch (err) {
      console.error('Failed to delete image:', err);
      return false;
    }
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback(async (uuid: string) => {
    try {
      const response = await fetch(`/api/v1/image/${uuid}/favorite`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle favorite');
      }

      const result = await response.json();
      const newFavoriteStatus = result.data.isFavorite;

      // Update local state
      setImages((prev) =>
        prev.map((img) =>
          img.uuid === uuid ? { ...img, isFavorite: newFavoriteStatus } : img
        )
      );

      return newFavoriteStatus;
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      return null;
    }
  }, []);

  // Update tags
  const updateTags = useCallback(async (uuid: string, tags: string[]) => {
    try {
      const response = await fetch(`/api/v1/image/${uuid}/tags`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags }),
      });

      if (!response.ok) {
        throw new Error('Failed to update tags');
      }

      const result = await response.json();
      const newTags = result.data.tags;

      // Update local state
      setImages((prev) =>
        prev.map((img) => (img.uuid === uuid ? { ...img, tags: newTags } : img))
      );

      return newTags;
    } catch (err) {
      console.error('Failed to update tags:', err);
      return null;
    }
  }, []);

  // Batch delete
  const batchDelete = useCallback(async (uuids: string[]) => {
    try {
      const response = await fetch('/api/v1/image/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'delete', uuids }),
      });

      if (!response.ok) {
        throw new Error('Failed to batch delete');
      }

      const result = await response.json();

      // Remove from local state
      setImages((prev) => prev.filter((img) => !uuids.includes(img.uuid)));
      setTotal((prev) => prev - result.data.affected);

      return result.data.affected;
    } catch (err) {
      console.error('Failed to batch delete:', err);
      return 0;
    }
  }, []);

  // Batch favorite
  const batchFavorite = useCallback(
    async (uuids: string[], isFavorite: boolean) => {
      try {
        const response = await fetch('/api/v1/image/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operation: 'favorite', uuids, isFavorite }),
        });

        if (!response.ok) {
          throw new Error('Failed to batch favorite');
        }

        const result = await response.json();

        // Update local state
        setImages((prev) =>
          prev.map((img) =>
            uuids.includes(img.uuid) ? { ...img, isFavorite } : img
          )
        );

        return result.data.affected;
      } catch (err) {
        console.error('Failed to batch favorite:', err);
        return 0;
      }
    },
    []
  );

  // Add image to list (for when a new image is generated)
  const addImage = useCallback((image: Image) => {
    setImages((prev) => [image, ...prev]);
    setTotal((prev) => prev + 1);
  }, []);

  // Update image in list
  const updateImage = useCallback((uuid: string, updates: Partial<Image>) => {
    setImages((prev) =>
      prev.map((img) => (img.uuid === uuid ? { ...img, ...updates } : img))
    );
  }, []);

  // Auto fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchImages();
    }
  }, [autoFetch, fetchImages]);

  return {
    images,
    isLoading,
    error,
    page,
    totalPages,
    total,
    hasMore,
    loadMore,
    refresh,
    deleteImage,
    toggleFavorite,
    updateTags,
    batchDelete,
    batchFavorite,
    addImage,
    updateImage,
  };
}
