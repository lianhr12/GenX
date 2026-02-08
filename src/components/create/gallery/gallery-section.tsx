'use client';

import {
  CommunityGallery,
  type GalleryItemData,
} from '@/components/shared/community-gallery';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useGalleryFeatured } from '@/hooks/use-gallery';
import { Loader2Icon } from 'lucide-react';

export function GallerySection() {
  const user = useCurrentUser();
  const { data, isLoading, isError } = useGalleryFeatured({
    limit: 8,
    userId: user?.id,
  });

  const items: GalleryItemData[] = (data ?? []).map((item) => ({
    id: item.id,
    uuid: item.uuid,
    mediaType: (item.mediaType as 'video' | 'image') || 'video',
    videoUrl: item.videoUrl || '',
    thumbnailUrl: item.thumbnailUrl,
    imageUrls: item.imageUrls as string[] | undefined,
    aspectRatio:
      (item.aspectRatio as '16:9' | '9:16' | '1:1' | '4:3' | '3:4') ||
      undefined,
    prompt: item.prompt,
    artStyle: item.artStyle,
    likesCount: item.likesCount,
    viewsCount: item.viewsCount,
    creatorName: item.creatorName,
    creatorAvatar: item.creatorAvatar,
    isLiked: item.isLiked,
    hidePrompt: item.hidePrompt,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || items.length === 0) {
    return null;
  }

  return (
    <CommunityGallery
      items={items}
      showHeader={true}
      translationNamespace="CommunityGallery"
    />
  );
}
