'use client';

import {
  DynamicCommunityGallery,
  type GalleryItemData,
} from '@/components/shared/community-gallery';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useGalleryList, useGalleryView } from '@/hooks/use-gallery';
import { useCallback, useState } from 'react';
import { GalleryLikeButton } from './gallery-like-button';

const categories = [
  { id: 'all', labelKey: 'all' },
  { id: 'cyberpunk', labelKey: 'cyberpunk' },
  { id: 'watercolor', labelKey: 'watercolor' },
  { id: 'oilPainting', labelKey: 'oilPainting' },
  { id: 'anime', labelKey: 'anime' },
  { id: 'fluidArt', labelKey: 'fluidArt' },
];

const sortOptions = [
  { id: 'latest', labelKey: 'latest' },
  { id: 'popular', labelKey: 'popular' },
];

export function GalleryPageClient() {
  const user = useCurrentUser();
  const [activeStyle, setActiveStyle] = useState('all');
  const [activeSort, setActiveSort] = useState<'latest' | 'popular'>('latest');
  const { mutate: incrementView } = useGalleryView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useGalleryList({
    artStyle: activeStyle === 'all' ? undefined : activeStyle,
    sort: activeSort,
    userId: user?.id,
  });

  const allItems: GalleryItemData[] =
    data?.pages.flatMap((page) =>
      page.items.map((item) => ({
        id: item.id,
        uuid: item.uuid,
        videoUrl: item.videoUrl,
        thumbnailUrl: item.thumbnailUrl,
        prompt: item.prompt,
        artStyle: item.artStyle,
        likesCount: item.likesCount,
        viewsCount: item.viewsCount,
        creatorName: item.creatorName,
        creatorAvatar: item.creatorAvatar,
        isLiked: item.isLiked,
        createdAt: item.createdAt,
      }))
    ) || [];

  const handleStyleChange = useCallback((style: string) => {
    setActiveStyle(style);
  }, []);

  const handleSortChange = useCallback((sort: string) => {
    setActiveSort(sort as 'latest' | 'popular');
  }, []);

  const handleItemView = useCallback(
    (item: GalleryItemData) => {
      if (typeof item.id === 'number') {
        incrementView(item.id);
      }
    },
    [incrementView]
  );

  const renderLikeButton = useCallback((item: GalleryItemData) => {
    if (typeof item.id !== 'number') return null;
    return (
      <GalleryLikeButton
        galleryItemId={item.id}
        initialLikesCount={item.likesCount ?? 0}
        initialIsLiked={item.isLiked ?? false}
      />
    );
  }, []);

  return (
    <DynamicCommunityGallery
      items={allItems}
      categories={categories}
      sortOptions={sortOptions}
      showHeader={false}
      translationNamespace="GalleryPage"
      activeCategory={activeStyle}
      activeSort={activeSort}
      onCategoryChange={handleStyleChange}
      onSortChange={handleSortChange}
      isLoading={isLoading}
      isError={isError}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onLoadMore={fetchNextPage}
      onItemView={handleItemView}
      renderLikeButton={renderLikeButton}
    />
  );
}
