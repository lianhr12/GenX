'use client';

import { Button } from '@/components/ui/button';
import { artStylesUI } from '@/config/art-styles-ui';
import { LocaleLink } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { ArrowRightIcon, PaletteIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRef, useState } from 'react';

interface StyleCardProps {
  style: (typeof artStylesUI)[number];
  index: number;
}

function StyleCard({ style, index }: StyleCardProps) {
  const t = useTranslations('StylesPage');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const Icon = style.icon;

  const handleMouseEnter = () => {
    setIsHovered(true);
    videoRef.current?.play();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <LocaleLink
      href={`/styles/${style.slug}`}
      className={cn(
        'group relative overflow-hidden rounded-2xl border bg-card aspect-[4/5] transition-all duration-300 hover:shadow-xl',
        style.borderColor,
        style.hoverBorderColor
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Poster Image */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-500',
          isHovered ? 'opacity-0' : 'opacity-100'
        )}
      >
        <Image
          src={style.poster}
          alt={t(`styles.${style.slug}.title` as never)}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          className="object-cover"
          loading={index < 3 ? 'eager' : 'lazy'}
          priority={index < 3}
          unoptimized={true}
        />
      </div>

      {/* Video (shown on hover) */}
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        className={cn(
          'absolute inset-0 h-full w-full object-cover transition-opacity duration-500',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}
      >
        <source src={style.video.replace('.mp4', '.webm')} type="video/webm" />
        <source src={style.video} type="video/mp4" />
      </video>

      {/* Style Badge */}
      <div
        className={cn(
          'absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full px-3 py-1.5 backdrop-blur-md',
          style.bgColor
        )}
      >
        <Icon className={cn('h-4 w-4', style.iconColor)} />
        <span className="text-xs font-medium">
          {t(`styles.${style.slug}.title` as never)}
        </span>
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <h2 className="text-2xl font-bold text-white mb-2">
          {t(`styles.${style.slug}.title` as never)}
        </h2>
        <p className="text-white/80 text-sm mb-4 line-clamp-2">
          {t(`styles.${style.slug}.description` as never)}
        </p>
        <div className="flex items-center gap-2 text-white/60 text-sm group-hover:text-white transition-colors">
          <span>{t('viewStyle')}</span>
          <ArrowRightIcon className="size-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </LocaleLink>
  );
}

export default function StylesPage() {
  const t = useTranslations('StylesPage');

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <PaletteIcon className="size-4" />
          {t('badge')}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          {t('title')}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('description')}
        </p>
      </div>

      {/* Styles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artStylesUI.map((style, index) => (
          <StyleCard key={style.id} style={style} index={index} />
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 text-center">
        <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-muted/50 border">
          <div className="text-center sm:text-left">
            <h3 className="font-semibold mb-1">{t('cta.title')}</h3>
            <p className="text-muted-foreground text-sm">
              {t('cta.description')}
            </p>
          </div>
          <Button asChild size="lg" className="whitespace-nowrap">
            <LocaleLink href="/create/image-to-video">
              {t('cta.button')}
            </LocaleLink>
          </Button>
        </div>
      </div>
    </div>
  );
}
