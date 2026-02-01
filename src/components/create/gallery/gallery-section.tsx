'use client';

import { CommunityGallery } from '@/components/shared/community-gallery';
import { mockGalleryItems } from '@/config/create';

export function GallerySection() {
  return (
    <CommunityGallery
      items={mockGalleryItems}
      showHeader={true}
      translationNamespace="CommunityGallery"
    />
  );
}
