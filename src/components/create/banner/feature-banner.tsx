'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { featureBanners } from '@/config/create';
import { useTranslations } from 'next-intl';
import { BannerCard } from './banner-card';

export function FeatureBanner() {
  const t = useTranslations('CreatePageNew.banners');

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{t('title')}</h2>
      </div>

      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {featureBanners.map((banner) => (
            <CarouselItem
              key={banner.id}
              className="pl-4 md:basis-1/2 lg:basis-1/3"
            >
              <BannerCard banner={banner} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex -left-4" />
        <CarouselNext className="hidden md:flex -right-4" />
      </Carousel>
    </section>
  );
}
