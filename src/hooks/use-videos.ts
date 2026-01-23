'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Video } from '@/db';

interface UseVideosOptions {
  initialLimit?: number;
  status?: string;
  autoFetch?: boolean;
}

export function useVideos(options: UseVideosOptions = {}) {
  const { initialLimit = 20, status, autoFetch = true } = options;

  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Fetch videos
  const fetchVideos = useCallback(
    async (cursor?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set('limit', String(initialLimit));
        if (cursor) params.set('cursor', cursor);
        if (status) params.set('status', status);

        const response = await fetch(`/api/v1/video/list?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }

        const result = await response.json();
        const data = result.data;

        if (cursor) {
          // Append to existing videos
          setVideos((prev) => [...prev, ...data.videos]);
        } else {
          // Replace videos
          setVideos(data.videos);
        }

        setNextCursor(data.nextCursor || null);
        setHasMore(!!data.nextCursor);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Failed to fetch videos';
        setError(errMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [initialLimit, status]
  );

  // Load more videos
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore && nextCursor) {
      fetchVideos(nextCursor);
    }
  }, [isLoading, hasMore, nextCursor, fetchVideos]);

  // Refresh videos (reload from beginning)
  const refresh = useCallback(() => {
    setNextCursor(null);
    setHasMore(true);
    fetchVideos();
  }, [fetchVideos]);

  // Delete video
  const deleteVideo = useCallback(async (uuid: string) => {
    try {
      const response = await fetch(`/api/v1/video/${uuid}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete video');
      }

      // Remove from local state
      setVideos((prev) => prev.filter((v) => v.uuid !== uuid));
      return true;
    } catch (err) {
      console.error('Failed to delete video:', err);
      return false;
    }
  }, []);

  // Add video to list (for when a new video is generated)
  const addVideo = useCallback((video: Video) => {
    setVideos((prev) => [video, ...prev]);
  }, []);

  // Update video in list
  const updateVideo = useCallback((uuid: string, updates: Partial<Video>) => {
    setVideos((prev) =>
      prev.map((v) => (v.uuid === uuid ? { ...v, ...updates } : v))
    );
  }, []);

  // Auto fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchVideos();
    }
  }, [autoFetch, fetchVideos]);

  return {
    videos,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
    deleteVideo,
    addVideo,
    updateVideo,
  };
}
