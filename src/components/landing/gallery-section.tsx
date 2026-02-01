'use client';

import { GalleryLikeButton } from '@/components/gallery/gallery-like-button';
import {
  DynamicCommunityGallery,
  type GalleryItemData,
} from '@/components/shared/community-gallery';
import { AnimatedGroup } from '@/components/tailark/motion/animated-group';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useGalleryFeatured, useGalleryView } from '@/hooks/use-gallery';
import { LocaleLink } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

// Fallback demo gallery items - used when database is empty
const fallbackGalleryItems: GalleryItemData[] = [
  {
    id: 'demo-1',
    uuid: 'demo-1',
    videoUrl: '/videos/demo/gallery/cyberpunk-1.mp4',
    thumbnailUrl: '/images/demo/gallery/cyberpunk-1.jpg',
    prompt: '',
    artStyle: 'cyberpunk',
    likesCount: 234,
    viewsCount: 1250,
    aspectRatio: '16:9',
  },
  {
    id: 'demo-2',
    uuid: 'demo-2',
    videoUrl: '/videos/demo/gallery/watercolor-1.mp4',
    thumbnailUrl: '/images/demo/gallery/watercolor-1.jpg',
    prompt: '',
    artStyle: 'watercolor',
    likesCount: 189,
    viewsCount: 980,
    aspectRatio: '16:9',
  },
  {
    id: 'demo-3',
    uuid: 'demo-3',
    videoUrl: '/videos/demo/gallery/oil-1.mp4',
    thumbnailUrl: '/images/demo/gallery/oil-1.jpg',
    prompt: '',
    artStyle: 'oilPainting',
    likesCount: 312,
    viewsCount: 1560,
    aspectRatio: '16:9',
  },
  {
    id: 'demo-4',
    uuid: 'demo-4',
    videoUrl: '/videos/demo/gallery/anime-1.mp4',
    thumbnailUrl: '/images/demo/gallery/anime-1.jpg',
    prompt: '',
    artStyle: 'anime',
    likesCount: 456,
    viewsCount: 2340,
    aspectRatio: '16:9',
  },
  {
    id: 'demo-5',
    uuid: 'demo-5',
    videoUrl: '/videos/demo/gallery/fluid-1.mp4',
    thumbnailUrl: '/images/demo/gallery/fluid-1.jpg',
    prompt: '',
    artStyle: 'fluidArt',
    likesCount: 278,
    viewsCount: 1120,
    aspectRatio: '16:9',
  },
  {
    id: 'demo-6',
    uuid: 'demo-6',
    videoUrl: '/videos/demo/gallery/cyberpunk-2.mp4',
    thumbnailUrl: '/images/demo/gallery/cyberpunk-2.jpg',
    prompt: '',
    artStyle: 'cyberpunk',
    likesCount: 345,
    viewsCount: 1780,
    aspectRatio: '16:9',
  },
];

const categories = [
  { id: 'all', labelKey: 'all' },
  { id: 'cyberpunk', labelKey: 'cyberpunk' },
  { id: 'watercolor', labelKey: 'watercolor' },
  { id: 'oilPainting', labelKey: 'oilPainting' },
  { id: 'anime', labelKey: 'anime' },
  { id: 'fluidArt', labelKey: 'fluidArt' },
];

export function GallerySection() {
  const t = useTranslations('Landing.gallery');
  const user = useCurrentUser();
  const [activeFilter, setActiveFilter] = useState('all');
  const { mutate: incrementView } = useGalleryView();

  // Fetch dynamic gallery items
  const {
    data: dynamicItems,
    isLoading,
    isError,
  } = useGalleryFeatured({
    limit: 6,
    userId: user?.id,
  });

  // Convert dynamic items to GalleryItemData format or use fallback
  const displayItems: GalleryItemData[] =
    dynamicItems && dynamicItems.length > 0
      ? dynamicItems.map((item) => ({
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
          aspectRatio: '16:9',
        }))
      : fallbackGalleryItems;

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
    <section id="gallery" className="relative py-24 lg:py-32">
      {/* Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/3 top-0 h-[600px] w-[600px] rounded-full bg-primary/3 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <AnimatedGroup preset="blur-slide">
            <span className="inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              {t('badge')}
            </span>
            <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              {t('headline')}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              {t('subheadline')}
            </p>
          </AnimatedGroup>
        </div>

        {/* Gallery with filters */}
        <div className="mt-12">
          <DynamicCommunityGallery
            items={displayItems}
            categories={categories}
            sortOptions={[]}
            showHeader={false}
            translationNamespace="GalleryPage"
            activeCategory={activeFilter}
            activeSort="latest"
            onCategoryChange={setActiveFilter}
            onSortChange={() => {}}
            isLoading={isLoading}
            isError={isError}
            hasNextPage={false}
            onItemView={handleItemView}
            renderLikeButton={renderLikeButton}
          />
        </div>

        {/* Load More & CTA */}
        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <AnimatedGroup
            preset="fade"
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button asChild variant="outline" size="lg" className="rounded-xl">
              <LocaleLink href="/gallery">{t('loadMore')}</LocaleLink>
            </Button>
            <Button asChild size="lg" className="rounded-xl">
              <LocaleLink href="/create/image-to-video">
                {t('createOwn')}
              </LocaleLink>
            </Button>
          </AnimatedGroup>
        </div>
      </div>
    </section>
  );
}
