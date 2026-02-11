'use client';

import { isDemoWebsite } from '@/lib/demo';
import { Routes } from '@/routes';
import type { NestedMenuItem } from '@/types';
import {
  BarChart3Icon,
  BellIcon,
  CircleUserRoundIcon,
  CoinsIcon,
  CreditCardIcon,
  FolderOpenIcon,
  GalleryHorizontalEndIcon,
  GiftIcon,
  ImageIcon,
  LayoutDashboardIcon,
  LockKeyholeIcon,
  Settings2Icon,
  SettingsIcon,
  UsersRoundIcon,
  VideoIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { websiteConfig } from './website';

/**
 * Get sidebar config with translations
 *
 * NOTICE: used in client components only
 *
 * @returns The sidebar config with translated titles and descriptions
 */
export function useSidebarLinks(): NestedMenuItem[] {
  const t = useTranslations('Dashboard');

  // if is demo website, allow user to access admin and user pages, but data is fake
  const isDemo = isDemoWebsite();

  return [
    {
      title: t('dashboard.title'),
      icon: <LayoutDashboardIcon className="size-4 shrink-0" />,
      href: Routes.Dashboard,
      external: false,
    },
    {
      title: t('creations.title'),
      icon: <FolderOpenIcon className="size-4 shrink-0" />,
      items: [
        {
          title: t('creations.videos.title'),
          icon: <VideoIcon className="size-4 shrink-0" />,
          href: Routes.MyVideos,
          external: false,
        },
        {
          title: t('creations.images.title'),
          icon: <ImageIcon className="size-4 shrink-0" />,
          href: Routes.MyImages,
          external: false,
        },
      ],
    },
    {
      title: t('admin.title'),
      icon: <SettingsIcon className="size-4 shrink-0" />,
      authorizeOnly: isDemo ? ['admin', 'user'] : ['admin'],
      items: [
        {
          title: t('admin.dashboard.title'),
          icon: <LayoutDashboardIcon className="size-4 shrink-0" />,
          href: Routes.AdminDashboard,
          external: false,
        },
        {
          title: t('admin.users.title'),
          icon: <UsersRoundIcon className="size-4 shrink-0" />,
          href: Routes.AdminUsers,
          external: false,
        },
        {
          title: t('admin.images.title'),
          icon: <ImageIcon className="size-4 shrink-0" />,
          href: Routes.AdminImages,
          external: false,
        },
        {
          title: t('admin.gallery.title'),
          icon: <GalleryHorizontalEndIcon className="size-4 shrink-0" />,
          href: Routes.AdminGallery,
          external: false,
        },
        {
          title: t('admin.analytics.title'),
          icon: <BarChart3Icon className="size-4 shrink-0" />,
          href: Routes.AdminAnalytics,
          external: false,
        },
        {
          title: t('admin.adminSettings.title'),
          icon: <Settings2Icon className="size-4 shrink-0" />,
          href: Routes.AdminSettings,
          external: false,
        },
      ],
    },
    {
      title: t('settings.title'),
      icon: <Settings2Icon className="size-4 shrink-0" />,
      items: [
        {
          title: t('settings.profile.title'),
          icon: <CircleUserRoundIcon className="size-4 shrink-0" />,
          href: Routes.SettingsProfile,
          external: false,
        },
        {
          title: t('settings.billing.title'),
          icon: <CreditCardIcon className="size-4 shrink-0" />,
          href: Routes.SettingsBilling,
          external: false,
        },
        ...(websiteConfig.credits.enableCredits
          ? [
              {
                title: t('settings.credits.title'),
                icon: <CoinsIcon className="size-4 shrink-0" />,
                href: Routes.SettingsCredits,
                external: false,
              },
            ]
          : []),
        {
          title: t('settings.security.title'),
          icon: <LockKeyholeIcon className="size-4 shrink-0" />,
          href: Routes.SettingsSecurity,
          external: false,
        },
        {
          title: t('settings.notification.title'),
          icon: <BellIcon className="size-4 shrink-0" />,
          href: Routes.SettingsNotifications,
          external: false,
        },
        {
          title: t('settings.referral.title'),
          icon: <GiftIcon className="size-4 shrink-0" />,
          href: Routes.SettingsReferral,
          external: false,
        },
      ],
    },
  ];
}
