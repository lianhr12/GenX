'use client';

import { Routes } from '@/routes';
import type { NestedMenuItem } from '@/types';
import { useTranslations } from 'next-intl';
import { websiteConfig } from './website';

/**
 * Get footer config with translations
 *
 * NOTICE: used in client components only
 *
 * @returns The footer config with translated titles
 */
export function useFooterLinks(): NestedMenuItem[] {
  const t = useTranslations('Marketing.footer');

  return [
    {
      title: t('videoModels.title'),
      items: [
        {
          title: t('videoModels.items.veo3'),
          href: '/models/veo-3',
          external: false,
        },
        {
          title: t('videoModels.items.sora2'),
          href: '/models/sora-2',
          external: false,
        },
        {
          title: t('videoModels.items.kling'),
          href: '/models/kling',
          external: false,
        },
        {
          title: t('videoModels.items.hailuo'),
          href: '/models/hailuo',
          external: false,
        },
        {
          title: t('videoModels.items.seedance'),
          href: '/models/seedance',
          external: false,
        },
        {
          title: t('videoModels.items.wan'),
          href: '/models/wan',
          external: false,
        },
        {
          title: t('videoModels.items.omnihuman'),
          href: '/models/omnihuman',
          external: false,
        },
        {
          title: t('videoModels.items.moreModels'),
          href: Routes.Models,
          external: false,
        },
      ],
    },
    {
      title: t('imageModels.title'),
      items: [
        {
          title: t('imageModels.items.gptImage'),
          href: '/models/gpt-image',
          external: false,
        },
        {
          title: t('imageModels.items.seedream'),
          href: '/models/seedream',
          external: false,
        },
        {
          title: t('imageModels.items.nanobanana'),
          href: '/models/nanobanana',
          external: false,
        },
        {
          title: t('imageModels.items.wanImage'),
          href: '/models/wan-image',
          external: false,
        },
        {
          title: t('imageModels.items.moreModels'),
          href: Routes.Models,
          external: false,
        },
      ],
    },
    {
      title: t('product.title'),
      items: [
        {
          title: t('product.items.features'),
          href: Routes.Features,
          external: false,
        },
        {
          title: t('product.items.styles'),
          href: Routes.Styles,
          external: false,
        },
        {
          title: t('product.items.gallery'),
          href: Routes.Gallery,
          external: false,
        },
        {
          title: t('product.items.pricing'),
          href: Routes.Pricing,
          external: false,
        },
        {
          title: t('product.items.faq'),
          href: Routes.FAQ,
          external: false,
        },
      ],
    },
    {
      title: t('resources.title'),
      items: [
        ...(websiteConfig.blog.enable
          ? [
              {
                title: t('resources.items.blog'),
                href: Routes.Blog,
                external: false,
              },
            ]
          : []),
        ...(websiteConfig.docs.enable
          ? [
              {
                title: t('resources.items.docs'),
                href: Routes.Docs,
                external: false,
              },
            ]
          : []),
        {
          title: t('resources.items.help'),
          href: Routes.Help,
          external: false,
        },
        {
          title: t('resources.items.changelog'),
          href: Routes.Changelog,
          external: false,
        },
        {
          title: t('resources.items.roadmap'),
          href: Routes.Roadmap,
          external: false,
        },
      ],
    },
    {
      title: t('companyAndLegal.title'),
      items: [
        {
          title: t('companyAndLegal.items.about'),
          href: Routes.About,
          external: false,
        },
        {
          title: t('companyAndLegal.items.contact'),
          href: Routes.Contact,
          external: false,
        },
        {
          title: t('companyAndLegal.items.waitlist'),
          href: Routes.Waitlist,
          external: false,
        },
        {
          title: t('companyAndLegal.items.privacyPolicy'),
          href: Routes.PrivacyPolicy,
          external: false,
        },
        {
          title: t('companyAndLegal.items.termsOfService'),
          href: Routes.TermsOfService,
          external: false,
        },
      ],
    },
  ];
}
