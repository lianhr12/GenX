'use client';

import { AnimatedGroup } from '@/components/tailark/motion/animated-group';
import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { Brush, Film, Palette, Sparkles, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRef, useState } from 'react';

const artStyles = [
  {
    id: 'cyberpunk',
    icon: Zap,
    gradientColor: 'from-cyan-500 to-purple-500',
    iconColor: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    hoverBorderColor: 'hover:border-cyan-500/50',
    video: '/videos/demo/cyberpunk.mp4',
    poster: '/images/demo/cyberpunk-poster.jpg',
  },
  {
    id: 'watercolor',
    icon: Brush,
    gradientColor: 'from-blue-400 to-teal-400',
    iconColor: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/20',
    hoverBorderColor: 'hover:border-blue-400/50',
    video: '/videos/demo/watercolor.mp4',
    poster: '/images/demo/watercolor-poster.jpg',
  },
  {
    id: 'oilPainting',
    icon: Palette,
    gradientColor: 'from-amber-500 to-orange-500',
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    hoverBorderColor: 'hover:border-amber-500/50',
    video: '/videos/demo/oil-painting.mp4',
    poster: '/images/demo/oil-painting-poster.jpg',
  },
  {
    id: 'anime',
    icon: Sparkles,
    gradientColor: 'from-pink-500 to-rose-500',
    iconColor: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
    hoverBorderColor: 'hover:border-pink-500/50',
    video: '/videos/demo/anime.mp4',
    poster: '/images/demo/anime-poster.jpg',
  },
  {
    id: 'fluidArt',
    icon: Film,
    gradientColor: 'from-violet-500 to-fuchsia-500',
    iconColor: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
    hoverBorderColor: 'hover:border-violet-500/50',
    video: '/videos/demo/fluid-art.mp4',
    poster: '/images/demo/fluid-art-poster.jpg',
  },
];

interface StyleCardProps {
  style: (typeof artStyles)[0];
  isActive: boolean;
  onHover: () => void;
  onLeave: () => void;
}

function StyleCard({ style, isActive, onHover, onLeave }: StyleCardProps) {
  const t = useTranslations('Landing.artStyles');
  const videoRef = useRef<HTMLVideoElement>(null);
  const Icon = style.icon;

  const handleMouseEnter = () => {
    onHover();
    videoRef.current?.play();
  };

  const handleMouseLeave = () => {
    onLeave();
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <motion.div
      className={cn(
        'group relative overflow-hidden rounded-2xl border transition-all duration-500',
        style.borderColor,
        style.hoverBorderColor,
        isActive ? 'scale-[1.02] shadow-xl' : ''
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -4 }}
    >
      {/* Video/Image Container */}
      <div className="relative aspect-video overflow-hidden">
        {/* Poster Image - Using Next.js Image for optimization */}
        <Image
          src={style.poster}
          alt={t(`styles.${style.id}.title` as never)}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw"
          className={cn(
            'object-cover transition-opacity duration-500',
            isActive ? 'opacity-0' : 'opacity-100'
          )}
          loading="lazy"
        />

        {/* Video (shown on hover) - loaded lazily */}
        <video
          ref={videoRef}
          poster={style.poster}
          muted
          loop
          playsInline
          preload="none"
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-500',
            isActive ? 'opacity-100' : 'opacity-0'
          )}
        >
          <source
            src={style.video.replace('.mp4', '.webm')}
            type="video/webm"
          />
          <source src={style.video} type="video/mp4" />
        </video>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

        {/* Style Badge */}
        <div
          className={cn(
            'absolute left-4 top-4 flex items-center gap-2 rounded-full px-3 py-1.5 backdrop-blur-md',
            style.bgColor
          )}
        >
          <Icon className={cn('h-4 w-4', style.iconColor)} />
          <span className="text-xs font-medium">
            {t(`styles.${style.id}.title` as never)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-semibold">
          {t(`styles.${style.id}.title` as never)}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {t(`styles.${style.id}.description` as never)}
        </p>
        <p className="mt-2 text-xs text-muted-foreground/70">
          {t(`styles.${style.id}.bestFor` as never)}
        </p>

        {/* CTA */}
        <Button
          asChild
          variant="ghost"
          size="sm"
          className={cn(
            'mt-4 w-full bg-gradient-to-r opacity-0 transition-all group-hover:opacity-100',
            style.gradientColor,
            'text-white hover:text-white'
          )}
        >
          <LocaleLink href={`/create/image-to-video?style=${style.id}`}>
            {t('createWith')}
          </LocaleLink>
        </Button>
      </div>
    </motion.div>
  );
}

export function ArtStylesSection() {
  const t = useTranslations('Landing.artStyles');
  const [activeStyle, setActiveStyle] = useState<string | null>(null);

  return (
    <section id="styles" className="relative py-24 lg:py-32">
      {/* Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-0 top-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-[100px]" />
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

        {/* Styles Grid */}
        <div className="mt-16">
          <AnimatedGroup
            preset="scale"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          >
            {artStyles.map((style) => (
              <StyleCard
                key={style.id}
                style={style}
                isActive={activeStyle === style.id}
                onHover={() => setActiveStyle(style.id)}
                onLeave={() => setActiveStyle(null)}
              />
            ))}
          </AnimatedGroup>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <AnimatedGroup preset="fade">
            <Button asChild variant="outline" size="lg" className="rounded-xl">
              <LocaleLink href="/styles">{t('exploreAll')}</LocaleLink>
            </Button>
          </AnimatedGroup>
        </div>
      </div>
    </section>
  );
}
