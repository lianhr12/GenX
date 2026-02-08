'use client';

import { ReplicateButton } from '@/components/shared/replicate-button';
import type { ReplicateData } from '@/stores/creator-navigation-store';
import { AnimatedGroup } from '@/components/tailark/motion/animated-group';
import { Button } from '@/components/ui/button';
import { type ArtStyleUI, artStylesUI } from '@/config/art-styles-ui';
import { LocaleLink } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';

interface StyleCardProps {
  style: ArtStyleUI;
  isActive: boolean;
  onHover: () => void;
  onLeave: () => void;
  index: number;
  onReplicate?: (data: ReplicateData) => void;
}

function StyleCard({
  style,
  isActive,
  onHover,
  onLeave,
  index,
  onReplicate,
}: StyleCardProps) {
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
        'group relative overflow-hidden rounded-2xl border transition-all duration-300',
        style.borderColor,
        style.hoverBorderColor,
        isActive ? 'scale-[1.02] shadow-xl' : ''
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{
        y: -8,
        transition: { duration: 0.2, ease: 'easeOut' },
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Video/Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden">
        {/* Poster Image - Using Next.js Image with fallback */}
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-500',
            isActive ? 'opacity-0' : 'opacity-100'
          )}
        >
          <Image
            src={style.poster}
            alt={t(`styles.${style.id}.title` as never)}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw"
            className="object-cover"
            loading={index === 0 ? 'eager' : 'lazy'}
            priority={index === 0}
            unoptimized={true}
            onError={(e) => {
              // Fallback to gradient background if image fails to load
              const target = e.target as HTMLImageElement;
              const parent = target.parentElement;
              if (parent) {
                parent.style.background = `linear-gradient(to bottom right, 
                  ${
                    style.id === 'cyberpunk'
                      ? '#06b6d4, #a855f7, #ec4899'
                      : style.id === 'watercolor'
                        ? '#60a5fa, #14b8a6, #06b6d4'
                        : style.id === 'oilPainting'
                          ? '#f59e0b, #f97316, #ef4444'
                          : style.id === 'anime'
                            ? '#ec4899, #f43f5e, #a855f7'
                            : '#8b5cf6, #d946ef, #a855f7'
                  })`;
                target.style.display = 'none';
              }
            }}
          />

          {/* Fallback gradient overlay (hidden by default) */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-br hidden',
              style.id === 'cyberpunk' &&
                'from-cyan-600 via-purple-600 to-pink-600',
              style.id === 'watercolor' &&
                'from-blue-400 via-teal-400 to-cyan-400',
              style.id === 'oilPainting' &&
                'from-amber-500 via-orange-500 to-red-500',
              style.id === 'anime' &&
                'from-pink-400 via-rose-400 to-purple-400',
              style.id === 'fluidArt' &&
                'from-violet-500 via-fuchsia-500 to-purple-500'
            )}
          />
        </div>

        {/* Video (shown on hover) - loaded lazily */}
        <video
          ref={videoRef}
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
      <div className="relative p-4">
        {/* 复制按钮悬浮在右上角 */}
        <div className="absolute top-2 right-2 opacity-0 transition-all group-hover:opacity-100">
          <ReplicateButton
            data={{
              artStyle: style.id,
              mediaType: 'video',
              targetMode: 'image-to-video',
              prompt: style.id === 'cyberpunk' 
                ? 'A futuristic cityscape at night with flying cars'
                : style.id === 'watercolor'
                ? 'A peaceful landscape with mountains and a lake'
                : style.id === 'oilPainting'
                ? 'A portrait of a woman in renaissance style'
                : style.id === 'anime'
                ? 'A girl with flowing hair under cherry blossoms'
                : 'Abstract colors flowing and mixing together',
            }}
            variant="icon"
            size="sm"
            onReplicate={onReplicate}
          />
        </div>
        
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
        <div className="mt-3 opacity-0 transition-all group-hover:opacity-100">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className={cn(
              'w-full bg-gradient-to-r',
              style.gradientColor,
              'text-white hover:text-white',
            )}
          >
            <LocaleLink href={`/create/image-to-video?style=${style.id}`}>
              {t('createWith')}
            </LocaleLink>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export function ArtStylesSection() {
  const t = useTranslations('Landing.artStyles');
  const [activeStyle, setActiveStyle] = useState<string | null>(null);

  const handleReplicate = useCallback((_data: ReplicateData) => {
    const creator = document.querySelector('.genx-creator');
    if (creator) {
      creator.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  return (
    <section id="styles" className="relative py-24 lg:py-32">
      {/* Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-0 top-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary"
          >
            {t('badge')}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
          >
            {t('headline')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground"
          >
            {t('subheadline')}
          </motion.p>
        </motion.div>

        {/* Styles Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {artStylesUI.map((style, index) => (
            <motion.div
              key={style.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }}
            >
              <StyleCard
                style={style}
                isActive={activeStyle === style.id}
                onHover={() => setActiveStyle(style.id)}
                onLeave={() => setActiveStyle(null)}
                index={index}
                onReplicate={handleReplicate}
              />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Button asChild variant="outline" size="lg" className="rounded-xl">
              <LocaleLink href="/styles">{t('exploreAll')}</LocaleLink>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
