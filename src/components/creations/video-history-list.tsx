'use client';

import {
  type GalleryItemData,
  VideoManagementGallery,
} from '@/components/shared/community-gallery';
import { useVideos } from '@/hooks/use-videos';
import { useCallback, useState } from 'react';

type FilterStatus = 'all' | 'COMPLETED' | 'GENERATING' | 'FAILED' | 'favorites';

const categories = [
  { id: 'all', labelKey: 'all' },
  { id: 'COMPLETED', labelKey: 'completed' },
  { id: 'GENERATING', labelKey: 'generating' },
  { id: 'FAILED', labelKey: 'failed' },
  { id: 'favorites', labelKey: 'favorites' },
];

export function VideoHistoryList() {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    videos,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
    deleteVideo,
    toggleFavorite,
    batchDelete,
  } = useVideos({
    initialLimit: 20,
    status: filter === 'all' || filter === 'favorites' ? undefined : filter,
    isFavorite: filter === 'favorites' ? true : undefined,
    search: searchQuery || undefined,
    autoFetch: true,
  });

  // Convert Video to GalleryItemData
  const items: GalleryItemData[] = videos.map((video) => ({
    id: video.id,
    uuid: video.uuid,
    videoUrl: video.videoUrl || '',
    thumbnailUrl: video.thumbnailUrl || video.startImageUrl || '',
    prompt: video.prompt,
    model: video.model,
    status: video.status as GalleryItemData['status'],
    duration: video.duration ?? undefined,
    resolution: video.resolution ?? undefined,
    isFavorite: video.isFavorite,
    createdAt: video.createdAt,
    aspectRatio: '16:9',
  }));

  const handleDelete = useCallback(
    async (item: GalleryItemData) => {
      if (item.uuid) {
        await deleteVideo(item.uuid);
      }
    },
    [deleteVideo]
  );

  const handleBatchDelete = useCallback(
    async (selectedItems: GalleryItemData[]) => {
      const uuids = selectedItems
        .map((item) => item.uuid)
        .filter((uuid): uuid is string => !!uuid);
      if (uuids.length > 0) {
        await batchDelete(uuids);
      }
    },
    [batchDelete]
  );

  const handleToggleFavorite = useCallback(
    async (item: GalleryItemData) => {
      if (item.uuid) {
        await toggleFavorite(item.uuid);
      }
    },
    [toggleFavorite]
  );

  const handleDownload = useCallback((item: GalleryItemData) => {
    if (item.videoUrl) {
      const link = document.createElement('a');
      link.href = item.videoUrl;
      link.download = `${item.uuid || item.id}.mp4`;
      link.click();
    }
  }, []);

  return (
    <VideoManagementGallery
      items={items}
      categories={categories}
      translationNamespace="Dashboard.creations"
      activeCategory={filter}
      onCategoryChange={(category) => setFilter(category as FilterStatus)}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      isLoading={isLoading}
      isError={!!error}
      errorMessage={error || undefined}
      hasNextPage={hasMore}
      onLoadMore={loadMore}
      onRefresh={refresh}
      onDelete={handleDelete}
      onBatchDelete={handleBatchDelete}
      onToggleFavorite={handleToggleFavorite}
      onDownload={handleDownload}
    />
  );
}
