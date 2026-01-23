import { constructMetadata } from '@/lib/metadata';
import Container from '@/components/layout/container';
import { LocaleLink } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import {
  GalleryHorizontalEndIcon,
  FilterIcon,
  PlayCircleIcon,
  HeartIcon,
  SparklesIcon,
} from 'lucide-react';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return constructMetadata({
    title: 'Creator Gallery - Art Videos | ' + t('title'),
    description:
      'Explore stunning art videos created by our community. Get inspired by Cyberpunk, Watercolor, Oil Painting, Anime, and Fluid Art styles.',
    locale,
    pathname: '/gallery',
  });
}

// Filter categories
const filters = [
  { id: 'all', icon: null },
  { id: 'cyberpunk', icon: '🌃' },
  { id: 'watercolor', icon: '🎨' },
  { id: 'oil-painting', icon: '🖼️' },
  { id: 'anime', icon: '✨' },
  { id: 'fluid-art', icon: '🌊' },
];

// Sample gallery items (in production, this would come from a database)
const galleryItems = [
  { id: 1, style: 'cyberpunk', likes: 234, aspectRatio: 'aspect-video' },
  { id: 2, style: 'watercolor', likes: 189, aspectRatio: 'aspect-square' },
  { id: 3, style: 'anime', likes: 456, aspectRatio: 'aspect-video' },
  { id: 4, style: 'oil-painting', likes: 167, aspectRatio: 'aspect-[4/5]' },
  { id: 5, style: 'fluid-art', likes: 298, aspectRatio: 'aspect-video' },
  { id: 6, style: 'cyberpunk', likes: 321, aspectRatio: 'aspect-square' },
  { id: 7, style: 'watercolor', likes: 145, aspectRatio: 'aspect-video' },
  { id: 8, style: 'anime', likes: 512, aspectRatio: 'aspect-[4/5]' },
  { id: 9, style: 'oil-painting', likes: 203, aspectRatio: 'aspect-video' },
  { id: 10, style: 'fluid-art', likes: 178, aspectRatio: 'aspect-square' },
  { id: 11, style: 'cyberpunk', likes: 267, aspectRatio: 'aspect-[4/5]' },
  { id: 12, style: 'watercolor', likes: 134, aspectRatio: 'aspect-video' },
];

// Style colors for backgrounds
const styleColors: Record<string, string> = {
  cyberpunk: 'bg-purple-950',
  watercolor: 'bg-blue-950',
  'oil-painting': 'bg-amber-950',
  anime: 'bg-pink-950',
  'fluid-art': 'bg-indigo-950',
};

export default async function GalleryPage() {
  const t = await getTranslations('GalleryPage');

  return (
    <Container className="py-16 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <GalleryHorizontalEndIcon className="size-4" />
            {t('badge')}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          <FilterIcon className="size-4 text-muted-foreground mr-2" />
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={filter.id === 'all' ? 'default' : 'outline'}
              size="sm"
              className="rounded-full"
            >
              {filter.icon && <span className="mr-1">{filter.icon}</span>}
              {t(`filters.${filter.id}`)}
            </Button>
          ))}
        </div>

        {/* Masonry Gallery Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className="break-inside-avoid group relative overflow-hidden rounded-xl border bg-card cursor-pointer hover:shadow-xl transition-all duration-300"
            >
              {/* Video Preview */}
              <div
                className={`${item.aspectRatio} ${styleColors[item.style]} flex items-center justify-center relative`}
              >
                <PlayCircleIcon className="size-12 text-white/40 group-hover:text-white/80 group-hover:scale-110 transition-all duration-300" />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>

              {/* Info Bar */}
              <div className="p-3 flex items-center justify-between">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted">
                  {t(`filters.${item.style}`)}
                </span>
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <HeartIcon className="size-3.5" />
                  <span>{item.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-12 text-center">
          <Button variant="outline" size="lg">
            {t('loadMore')}
          </Button>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="inline-flex flex-col items-center p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 border">
            <SparklesIcon className="size-12 text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t('cta.title')}</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              {t('cta.description')}
            </p>
            <Button asChild size="lg">
              <LocaleLink href="/create/image-to-video">
                {t('cta.button')}
              </LocaleLink>
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
