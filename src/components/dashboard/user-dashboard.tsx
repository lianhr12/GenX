'use client';

import type { GalleryItemData } from '@/components/shared/community-gallery/gallery-video-card';
import { MasonryGallery } from '@/components/shared/community-gallery/masonry-gallery';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import type { Video } from '@/db';
import { LocaleLink } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import {
  ArrowRightIcon,
  CoinsIcon,
  Film,
  Maximize2,
  Mic,
  PlusIcon,
  Sparkles,
  Type,
  VideoIcon,
  ZoomIn,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface UserDashboardProps {
  initialCredits: number;
}

interface VideoStats {
  total: number;
  completed: number;
  pending: number;
}

// Dashboard quick tools configuration
const dashboardTools = [
  {
    id: 'image-to-video',
    titleKey: 'imageToVideo',
    descriptionKey: 'imageToVideoDesc',
    icon: Film,
    href: '/create/image-to-video',
    gradient: 'from-purple-500 to-pink-500',
    badge: 'hot' as const,
  },
  {
    id: 'text-to-video',
    titleKey: 'textToVideo',
    descriptionKey: 'textToVideoDesc',
    icon: Type,
    href: '/create/text-to-video',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'reference-to-video',
    titleKey: 'referenceToVideo',
    descriptionKey: 'referenceToVideoDesc',
    icon: Sparkles,
    href: '/create/reference-to-video',
    gradient: 'from-orange-500 to-yellow-500',
    isNew: true,
  },
  {
    id: 'video-extend',
    titleKey: 'videoExtend',
    descriptionKey: 'videoExtendDesc',
    icon: Maximize2,
    href: '/create/extend',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    id: 'video-upscale',
    titleKey: 'videoUpscale',
    descriptionKey: 'videoUpscaleDesc',
    icon: ZoomIn,
    href: '/create/upscale',
    gradient: 'from-indigo-500 to-purple-500',
    isPro: true,
  },
  {
    id: 'lip-sync',
    titleKey: 'lipSync',
    descriptionKey: 'lipSyncDesc',
    icon: Mic,
    href: '/create/lip-sync',
    gradient: 'from-rose-500 to-pink-500',
    isNew: true,
  },
];

// Feature banners for dashboard
const dashboardBanners = [
  {
    id: 'image-to-video',
    titleKey: 'imageToVideo.title',
    descriptionKey: 'imageToVideo.description',
    href: '/create/image-to-video',
    gradient: 'from-purple-600 via-pink-500 to-red-500',
    badge: 'hot',
  },
  {
    id: 'text-to-video',
    titleKey: 'textToVideo.title',
    descriptionKey: 'textToVideo.description',
    href: '/create/text-to-video',
    gradient: 'from-blue-600 via-cyan-500 to-teal-500',
    badge: 'new',
  },
  {
    id: 'ai-effects',
    titleKey: 'aiEffects.title',
    descriptionKey: 'aiEffects.description',
    href: '/create/effects',
    gradient: 'from-orange-600 via-amber-500 to-yellow-500',
  },
];

export function UserDashboard({ initialCredits }: UserDashboardProps) {
  const t = useTranslations('UserDashboard');
  const tTools = useTranslations('CreatePageNew.tools');
  const tBanners = useTranslations('CreatePageNew.banners');
  const [credits, setCredits] = useState(initialCredits);
  const [videos, setVideos] = useState<Video[]>([]);
  const [stats, setStats] = useState<VideoStats>({
    total: 0,
    completed: 0,
    pending: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Convert videos to GalleryItemData format for MasonryGallery
  const galleryItems: GalleryItemData[] = useMemo(() => {
    return videos.map((video) => ({
      id: video.uuid,
      uuid: video.uuid,
      videoUrl: video.videoUrl || '',
      thumbnailUrl: video.thumbnailUrl || video.startImageUrl || '',
      prompt: video.prompt || '',
      model: video.model || undefined,
      aspectRatio:
        (video.aspectRatio as GalleryItemData['aspectRatio']) || '16:9',
      status: video.status as GalleryItemData['status'],
      duration: video.duration || undefined,
      createdAt: video.createdAt ? new Date(video.createdAt) : undefined,
    }));
  }, [videos]);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/video/list?limit=6');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setVideos(result.data.videos || []);
          setStats({
            total: result.data.total || 0,
            completed:
              result.data.videos?.filter((v: Video) => v.status === 'COMPLETED')
                .length || 0,
            pending:
              result.data.videos?.filter(
                (v: Video) =>
                  v.status === 'PENDING' || v.status === 'GENERATING'
              ).length || 0,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="flex flex-1 flex-col gap-8 py-6 px-4 lg:px-6">
      {/* Hero Stats Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Credits Card - Gradient Style */}
        <LocaleLink
          href="/settings/credits"
          className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-violet-600 via-purple-500 to-fuchsia-500 text-white transition-all hover:shadow-xl hover:shadow-purple-500/25 hover:scale-[1.02]"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-white/80">
                {t('stats.credits')}
              </span>
              <CoinsIcon className="h-5 w-5 text-white/80" />
            </div>
            <div className="text-4xl font-bold mb-2">{credits}</div>
            <p className="text-sm text-white/70">{t('stats.creditsHint')}</p>
            <div className="mt-4 flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all">
              <span>{t('stats.buyCredits')}</span>
              <ArrowRightIcon className="size-4" />
            </div>
          </div>
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        </LocaleLink>

        {/* Videos Created Card */}
        <div className="relative overflow-hidden rounded-2xl p-6 border bg-card">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">
                {t('stats.videosCreated')}
              </span>
              <VideoIcon className="h-5 w-5 text-primary" />
            </div>
            {isLoading ? (
              <Skeleton className="h-10 w-20 mb-2" />
            ) : (
              <div className="text-4xl font-bold mb-2">{stats.total}</div>
            )}
            <p className="text-sm text-muted-foreground">
              {t('stats.allTime')}
            </p>
            {stats.pending > 0 && (
              <Badge variant="secondary" className="mt-4">
                {stats.pending} {t('stats.inProgress')}
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Start Card - CTA Style */}
        <LocaleLink
          href="/create/image-to-video"
          className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 text-white transition-all hover:shadow-xl hover:shadow-teal-500/25 hover:scale-[1.02]"
        >
          <div className="relative z-10">
            <div className="mb-4">
              <span className="text-sm font-medium text-white/80">
                {t('quickStart.title')}
              </span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <PlusIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">
                {t('quickStart.createVideo')}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all">
              <span>Start Creating</span>
              <ArrowRightIcon className="size-4" />
            </div>
          </div>
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        </LocaleLink>
      </div>

      {/* Feature Banners */}
      <section className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{tBanners('title')}</h2>
          <LocaleLink
            href="/create"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View All
            <ArrowRightIcon className="size-4" />
          </LocaleLink>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {dashboardBanners.map((banner) => (
            <LocaleLink
              key={banner.id}
              href={banner.href}
              className="group relative block overflow-hidden rounded-xl aspect-[16/9]"
            >
              <div
                className={cn(
                  'absolute inset-0 bg-gradient-to-br opacity-90',
                  banner.gradient
                )}
              />
              <div className="relative h-full flex flex-col justify-between p-4 text-white">
                <div>
                  {banner.badge && (
                    <Badge
                      variant="secondary"
                      className="mb-2 bg-white/20 text-white border-0 backdrop-blur-sm"
                    >
                      {tBanners(`badges.${banner.badge}` as never)}
                    </Badge>
                  )}
                  <h3 className="text-lg font-bold mb-1">
                    {tBanners(banner.titleKey as never)}
                  </h3>
                  <p className="text-sm text-white/80 line-clamp-2">
                    {tBanners(banner.descriptionKey as never)}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all">
                  <span>{tBanners('tryNow')}</span>
                  <ArrowRightIcon className="size-4" />
                </div>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </LocaleLink>
          ))}
        </div>
      </section>

      {/* AI Tools Section */}
      <section className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t('quickActions.title')}</h2>
          <LocaleLink
            href="/create"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {tTools('viewAll')}
            <ArrowRightIcon className="size-4" />
          </LocaleLink>
        </div>

        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-4 pb-4">
            {dashboardTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <LocaleLink
                  key={tool.id}
                  href={tool.href}
                  className="group flex-shrink-0 w-[160px] md:w-[180px]"
                >
                  <div className="relative overflow-hidden rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:border-primary/50">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
                        'bg-gradient-to-br',
                        tool.gradient
                      )}
                    >
                      <Icon className="size-5 text-white" />
                    </div>
                    <div className="flex items-start gap-1.5 mb-1">
                      <h3 className="font-medium text-sm line-clamp-1">
                        {tTools(`items.${tool.titleKey}` as never)}
                      </h3>
                      {tool.isNew && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1 py-0 bg-green-500/10 text-green-600 border-0"
                        >
                          NEW
                        </Badge>
                      )}
                      {tool.isPro && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1 py-0 bg-amber-500/10 text-amber-600 border-0"
                        >
                          PRO
                        </Badge>
                      )}
                      {tool.badge === 'hot' && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1 py-0 bg-red-500/10 text-red-600 border-0"
                        >
                          HOT
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {tTools(`items.${tool.descriptionKey}` as never)}
                    </p>
                    <div
                      className={cn(
                        'absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity',
                        'bg-gradient-to-br',
                        tool.gradient
                      )}
                    />
                  </div>
                </LocaleLink>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>

      {/* Recent Creations */}
      <section className="w-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">
              {t('recentCreations.title')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('recentCreations.subtitle')}
            </p>
          </div>
          {videos.length > 0 && (
            <LocaleLink
              href="/dashboard/creations/videos"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('recentCreations.viewAll')}
              <ArrowRightIcon className="size-4" />
            </LocaleLink>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="aspect-video rounded-xl" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="relative overflow-hidden rounded-2xl border bg-card p-8 text-center">
            <div className="relative z-10">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <VideoIcon className="h-8 w-8 text-purple-500" />
              </div>
              <h4 className="font-semibold mb-2">
                {t('recentCreations.empty.title')}
              </h4>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                {t('recentCreations.empty.description')}
              </p>
              <Button
                asChild
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <LocaleLink href="/create/image-to-video">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  {t('recentCreations.empty.cta')}
                </LocaleLink>
              </Button>
            </div>
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-purple-500/5 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-pink-500/5 blur-3xl" />
          </div>
        ) : (
          <MasonryGallery items={galleryItems} gap={16} />
        )}
      </section>
    </div>
  );
}
