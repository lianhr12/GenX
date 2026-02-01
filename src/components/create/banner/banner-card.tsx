'use client';

import { Badge } from '@/components/ui/badge';
import type { FeatureBanner } from '@/config/create';
import { LocaleLink } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { ArrowRightIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface BannerCardProps {
  banner: FeatureBanner;
}

export function BannerCard({ banner }: BannerCardProps) {
  const t = useTranslations('CreatePageNew.banners');

  return (
    <LocaleLink
      href={banner.href}
      className="group relative block overflow-hidden rounded-xl aspect-[16/9]"
    >
      {/* Gradient Background */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-90',
          banner.gradient
        )}
      />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-4 text-white">
        <div>
          {banner.badge && (
            <Badge
              variant="secondary"
              className="mb-2 bg-white/20 text-white border-0 backdrop-blur-sm"
            >
              {t(`badges.${banner.badge}` as never)}
            </Badge>
          )}
          <h3 className="text-lg font-bold mb-1">
            {t(banner.titleKey as never)}
          </h3>
          <p className="text-sm text-white/80 line-clamp-2">
            {t(banner.descriptionKey as never)}
          </p>
        </div>

        <div className="flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all">
          <span>{t('tryNow')}</span>
          <ArrowRightIcon className="size-4" />
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
    </LocaleLink>
  );
}
