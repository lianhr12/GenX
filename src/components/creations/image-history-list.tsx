'use client';

import {
  type GalleryItemData,
  VideoManagementGallery,
} from '@/components/shared/community-gallery';
import { useImages } from '@/hooks/use-images';
import { downloadImages } from '@/lib/download';
import { useCallback, useState } from 'react';

type FilterStatus = 'all' | 'COMPLETED' | 'GENERATING' | 'FAILED' | 'favorites';

const categories = [
  { id: 'all', labelKey: 'all' },
  { id: 'COMPLETED', labelKey: 'completed' },
  { id: 'GENERATING', labelKey: 'generating' },
  { id: 'FAILED', labelKey: 'failed' },
  { id: 'favorites', labelKey: 'favorites' },
];

export function ImageHistoryList() {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    images,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
    deleteImage,
    toggleFavorite,
    batchDelete,
  } = useImages({
    initialLimit: 20,
    status: filter === 'all' || filter === 'favorites' ? undefined : filter,
    isFavorite: filter === 'favorites' ? true : undefined,
    search: searchQuery || undefined,
    autoFetch: true,
  });

  // Convert Image to GalleryItemData
  const items: GalleryItemData[] = images.map((image) => {
    const imageUrls = (image.imageUrls as string[]) || [];
    const imageParams = image.parameters as { aspectRatio?: string } | null;
    return {
      id: image.id,
      uuid: image.uuid,
      mediaType: 'image' as const,
      videoUrl: '', // Not applicable for images
      thumbnailUrl: image.thumbnailUrl || imageUrls[0] || '',
      imageUrls: imageUrls,
      prompt: image.prompt,
      model: image.model,
      status: image.status as GalleryItemData['status'],
      isFavorite: image.isFavorite,
      createdAt: image.createdAt,
      aspectRatio:
        (imageParams?.aspectRatio as '16:9' | '9:16' | '1:1' | '4:3' | '3:4') ||
        '1:1',
    };
  });

  const handleDelete = useCallback(
    async (item: GalleryItemData) => {
      if (item.uuid) {
        await deleteImage(item.uuid);
      }
    },
    [deleteImage]
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

  const handleDownload = useCallback(async (item: GalleryItemData) => {
    const urls = item.imageUrls || [];
    if (urls.length > 0) {
      await downloadImages(urls, String(item.uuid || item.id));
    }
  }, []);

  return (
    <VideoManagementGallery
      items={items}
      categories={categories}
      mediaType="image"
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
