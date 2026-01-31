'use client';

import { GalleryLikeButton } from '@/components/gallery/gallery-like-button';
import { AnimatedGroup } from '@/components/tailark/motion/animated-group';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useCurrentUser } from '@/hooks/use-current-user';
import {
  type GalleryItem,
  useGalleryFeatured,
  useGalleryView,
} from '@/hooks/use-gallery';
import { LocaleLink } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Eye, Heart, Loader2, Play, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState } from 'react';

// Fallback demo gallery items - used when database is empty
const fallbackGalleryItems = [
  {
    id: 1,
    uuid: 'demo-1',
    style: 'cyberpunk',
    thumbnail: '/images/demo/gallery/cyberpunk-1.jpg',
    video: '/videos/demo/gallery/cyberpunk-1.mp4',
    likes: 234,
    views: 1250,
    prompt: '',
  },
  {
    id: 2,
    uuid: 'demo-2',
    style: 'watercolor',
    thumbnail: '/images/demo/gallery/watercolor-1.jpg',
    video: '/videos/demo/gallery/watercolor-1.mp4',
    likes: 189,
    views: 980,
    prompt: '',
  },
  {
    id: 3,
    uuid: 'demo-3',
    style: 'oilPainting',
    thumbnail: '/images/demo/gallery/oil-1.jpg',
    video: '/videos/demo/gallery/oil-1.mp4',
    likes: 312,
    views: 1560,
    prompt: '',
  },
  {
    id: 4,
    uuid: 'demo-4',
    style: 'anime',
    thumbnail: '/images/demo/gallery/anime-1.jpg',
    video: '/videos/demo/gallery/anime-1.mp4',
    likes: 456,
    views: 2340,
    prompt: '',
  },
  {
    id: 5,
    uuid: 'demo-5',
    style: 'fluidArt',
    thumbnail: '/images/demo/gallery/fluid-1.jpg',
    video: '/videos/demo/gallery/fluid-1.mp4',
    likes: 278,
    views: 1120,
    prompt: '',
  },
  {
    id: 6,
    uuid: 'demo-6',
    style: 'cyberpunk',
    thumbnail: '/images/demo/gallery/cyberpunk-2.jpg',
    video: '/videos/demo/gallery/cyberpunk-2.mp4',
    likes: 345,
    views: 1780,
    prompt: '',
  },
];

const styleFilters = [
  { id: 'all', color: 'bg-primary' },
  { id: 'cyberpunk', color: 'bg-cyan-500', emoji: '🌃' },
  { id: 'watercolor', color: 'bg-blue-400', emoji: '🎨' },
  { id: 'oilPainting', color: 'bg-amber-500', emoji: '🖼️' },
  { id: 'anime', color: 'bg-pink-500', emoji: '✨' },
  { id: 'fluidArt', color: 'bg-violet-500', emoji: '🌊' },
];

// Unified item type for both dynamic and fallback data
interface DisplayItem {
  id: number;
  uuid: string;
  style: string;
  thumbnail: string;
  video: string;
  likes: number;
  views: number;
  prompt: string;
  isLiked: boolean;
  isDynamic: boolean;
}

interface GalleryItemProps {
  item: DisplayItem;
  onClick: () => void;
}

function GalleryItemCard({ item, onClick }: GalleryItemProps) {
  const t = useTranslations('Landing.gallery');
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="group relative aspect-video cursor-pointer overflow-hidden rounded-xl border bg-muted"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
    >
      {/* Thumbnail - Using Next.js Image for optimization */}
      <Image
        src={item.thumbnail}
        alt={
          item.prompt || t(`items.${item.id}.prompt` as never) || 'Gallery item'
        }
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover"
        loading="lazy"
      />

      {/* Hover Overlay */}
      <div
        className={cn(
          'absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 transition-opacity duration-300',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Play Button */}
        <div className="flex flex-1 items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform group-hover:scale-110">
            <Play className="h-6 w-6 text-white" fill="white" />
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2">
          {/* Style Badge */}
          <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {t(`styles.${item.style}` as never)}
          </span>

          {/* Stats */}
          <div className="flex items-center gap-3">
            {item.isDynamic ? (
              <GalleryLikeButton
                galleryItemId={item.id}
                initialLikesCount={item.likes}
                initialIsLiked={item.isLiked}
                className="text-white/80 hover:text-red-400"
                size="sm"
              />
            ) : (
              <div className="flex items-center gap-1 text-white/80">
                <Heart className="h-4 w-4" />
                <span className="text-sm">{item.likes}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-white/80">
              <Eye className="h-3.5 w-3.5" />
              <span className="text-xs">{item.views}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface GalleryModalProps {
  item: DisplayItem | null;
  isOpen: boolean;
  onClose: () => void;
}

function GalleryModal({ item, isOpen, onClose }: GalleryModalProps) {
  const t = useTranslations('Landing.gallery');
  const { mutate: incrementView } = useGalleryView();

  // Increment view when modal opens for dynamic items
  useEffect(() => {
    if (isOpen && item && item.isDynamic) {
      incrementView(item.id);
    }
  }, [isOpen, item, incrementView]);

  if (!item) return null;

  const displayPrompt =
    item.prompt || t(`items.${item.id}.prompt` as never) || '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none">
        <VisuallyHidden.Root>
          <DialogTitle>
            {t('videoTitle', { style: t(`styles.${item.style}` as never) })}
          </DialogTitle>
        </VisuallyHidden.Root>
        <div className="relative overflow-hidden rounded-2xl bg-background">
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Video */}
          <div className="aspect-video">
            <video
              src={item.video}
              poster={item.thumbnail}
              controls
              autoPlay
              className="h-full w-full"
            />
          </div>

          {/* Info */}
          <div className="p-6">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {t(`styles.${item.style}` as never)}
              </span>
              {item.isDynamic ? (
                <GalleryLikeButton
                  galleryItemId={item.id}
                  initialLikesCount={item.likes}
                  initialIsLiked={item.isLiked}
                />
              ) : (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">{item.likes}</span>
                </div>
              )}
            </div>

            {displayPrompt && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  {t('promptLabel')}
                </p>
                <p className="mt-1 text-foreground">{displayPrompt}</p>
              </div>
            )}

            <div className="mt-6">
              <Button asChild className="w-full sm:w-auto">
                <LocaleLink href="/create/image-to-video">
                  {t('createSimilar')}
                </LocaleLink>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Loading skeleton
function GallerySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="aspect-video rounded-xl bg-muted animate-pulse"
        />
      ))}
    </div>
  );
}

export function GallerySection() {
  const t = useTranslations('Landing.gallery');
  const user = useCurrentUser();
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<DisplayItem | null>(null);

  // Fetch dynamic gallery items
  const {
    data: dynamicItems,
    isLoading,
    isError,
  } = useGalleryFeatured({
    limit: 6,
    userId: user?.id,
  });

  // Convert dynamic items to display format
  const displayItems: DisplayItem[] =
    dynamicItems && dynamicItems.length > 0
      ? dynamicItems.map((item) => ({
          id: item.id,
          uuid: item.uuid,
          style: item.artStyle,
          thumbnail: item.thumbnailUrl,
          video: item.videoUrl,
          likes: item.likesCount,
          views: item.viewsCount,
          prompt: item.prompt,
          isLiked: item.isLiked,
          isDynamic: true,
        }))
      : fallbackGalleryItems.map((item) => ({
          ...item,
          isLiked: false,
          isDynamic: false,
        }));

  const filteredItems =
    activeFilter === 'all'
      ? displayItems
      : displayItems.filter((item) => item.style === activeFilter);

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

        {/* Filters */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
          <AnimatedGroup
            preset="scale"
            className="flex flex-wrap items-center justify-center gap-2"
          >
            {styleFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-all',
                  activeFilter === filter.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                )}
              >
                {filter.emoji && <span className="mr-1.5">{filter.emoji}</span>}
                {t(`styles.${filter.id}` as never)}
              </button>
            ))}
          </AnimatedGroup>
        </div>

        {/* Gallery Grid */}
        <div className="mt-12">
          {isLoading ? (
            <GallerySkeleton />
          ) : (
            <AnimatedGroup
              preset="scale"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredItems.map((item) => (
                <GalleryItemCard
                  key={item.uuid}
                  item={item}
                  onClick={() => setSelectedItem(item)}
                />
              ))}
            </AnimatedGroup>
          )}
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

      {/* Modal */}
      <GalleryModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </section>
  );
}
