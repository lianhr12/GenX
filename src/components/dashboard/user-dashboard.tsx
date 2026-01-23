'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Video } from '@/db';
import { LocaleLink } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import {
  CoinsIcon,
  FilmIcon,
  ImageIcon,
  PlayCircleIcon,
  PlusIcon,
  SparklesIcon,
  VideoIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

interface UserDashboardProps {
  initialCredits: number;
}

interface VideoStats {
  total: number;
  completed: number;
  pending: number;
}

export function UserDashboard({ initialCredits }: UserDashboardProps) {
  const t = useTranslations('UserDashboard');
  const [credits, setCredits] = useState(initialCredits);
  const [videos, setVideos] = useState<Video[]>([]);
  const [stats, setStats] = useState<VideoStats>({
    total: 0,
    completed: 0,
    pending: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      // Fetch videos
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

  const quickActions = [
    {
      id: 'image-to-video',
      href: '/create/image-to-video',
      icon: FilmIcon,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      id: 'text-to-video',
      href: '/create/text-to-video',
      icon: VideoIcon,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'reference-to-video',
      href: '/create/reference-to-video',
      icon: SparklesIcon,
      gradient: 'from-orange-500 to-yellow-500',
    },
    {
      id: 'image',
      href: '/create/image',
      icon: ImageIcon,
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 py-6 px-4 lg:px-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Credits Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>{t('stats.credits')}</CardDescription>
            <CoinsIcon className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{credits}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('stats.creditsHint')}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild className="w-full">
              <LocaleLink href="/settings/credits">
                {t('stats.buyCredits')}
              </LocaleLink>
            </Button>
          </CardFooter>
        </Card>

        {/* Videos Created Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>{t('stats.videosCreated')}</CardDescription>
            <VideoIcon className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <div className="text-3xl font-bold">{stats.total}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {t('stats.allTime')}
            </p>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            {stats.pending > 0 && (
              <Badge variant="secondary" className="mr-2">
                {stats.pending} {t('stats.inProgress')}
              </Badge>
            )}
          </CardFooter>
        </Card>

        {/* Quick Start Card */}
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardDescription>{t('quickStart.title')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" size="lg">
              <LocaleLink href="/create/image-to-video">
                <PlusIcon className="mr-2 h-5 w-5" />
                {t('quickStart.createVideo')}
              </LocaleLink>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          {t('quickActions.title')}
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <LocaleLink
                key={action.id}
                href={action.href}
                className="group flex flex-col items-center gap-3 p-4 rounded-xl border bg-card hover:border-primary/50 hover:shadow-md transition-all"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient}`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-medium text-center">
                  {t(`quickActions.${action.id}`)}
                </span>
              </LocaleLink>
            );
          })}
        </div>
      </div>

      {/* Recent Creations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {t('recentCreations.title')}
          </h3>
          {videos.length > 0 && (
            <Button variant="ghost" size="sm" asChild>
              <LocaleLink href="/create/image-to-video">
                {t('recentCreations.viewAll')}
              </LocaleLink>
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="aspect-video rounded-lg" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <VideoIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="font-semibold mb-2">
              {t('recentCreations.empty.title')}
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              {t('recentCreations.empty.description')}
            </p>
            <Button asChild>
              <LocaleLink href="/create/image-to-video">
                <PlusIcon className="mr-2 h-4 w-4" />
                {t('recentCreations.empty.cta')}
              </LocaleLink>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {videos.map((video) => (
              <div
                key={video.uuid}
                className="group relative aspect-video overflow-hidden rounded-lg border bg-muted cursor-pointer hover:border-primary/50 transition-colors"
              >
                {video.thumbnailUrl ? (
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.prompt || 'Video thumbnail'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <VideoIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}

                {/* Status overlay */}
                {video.status !== 'COMPLETED' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Badge
                      variant={
                        video.status === 'FAILED' ? 'destructive' : 'secondary'
                      }
                    >
                      {video.status === 'GENERATING'
                        ? t('recentCreations.status.generating')
                        : video.status === 'PENDING'
                          ? t('recentCreations.status.pending')
                          : t('recentCreations.status.failed')}
                    </Badge>
                  </div>
                )}

                {/* Play icon on hover */}
                {video.status === 'COMPLETED' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                    <PlayCircleIcon className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
