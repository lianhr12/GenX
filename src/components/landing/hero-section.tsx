'use client';

import { AnimatedGroup } from '@/components/tailark/motion/animated-group';
import { TextEffect } from '@/components/tailark/motion/text-effect';
import { Button } from '@/components/ui/button';
import { NumberTicker } from '@/components/magicui/number-ticker';
import { LocaleLink } from '@/i18n/navigation';
import { Upload, Play, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      y: 12,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

// Art style video samples for background
// Using WebM as primary format for better compression, with MP4 fallback
const artStyleVideos = [
  {
    id: 'cyberpunk',
    webm: '/videos/demo/cyberpunk.webm',
    mp4: '/videos/demo/cyberpunk.mp4',
    poster: '/images/demo/cyberpunk-poster.jpg',
  },
  {
    id: 'watercolor',
    webm: '/videos/demo/watercolor.webm',
    mp4: '/videos/demo/watercolor.mp4',
    poster: '/images/demo/watercolor-poster.jpg',
  },
  {
    id: 'oil-painting',
    webm: '/videos/demo/oil-painting.webm',
    mp4: '/videos/demo/oil-painting.mp4',
    poster: '/images/demo/oil-painting-poster.jpg',
  },
  {
    id: 'anime',
    webm: '/videos/demo/anime.webm',
    mp4: '/videos/demo/anime.mp4',
    poster: '/images/demo/anime-poster.jpg',
  },
  {
    id: 'fluid-art',
    webm: '/videos/demo/fluid-art.webm',
    mp4: '/videos/demo/fluid-art.mp4',
    poster: '/images/demo/fluid-art-poster.jpg',
  },
];

export function HeroSection() {
  const t = useTranslations('Landing.hero');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentVideo = artStyleVideos[currentVideoIndex];
  const nextVideoIndex = (currentVideoIndex + 1) % artStyleVideos.length;
  const nextVideo = artStyleVideos[nextVideoIndex];

  // Handle video transition
  const handleVideoChange = useCallback((newIndex: number) => {
    if (newIndex === currentVideoIndex || isTransitioning) return;
    
    setIsTransitioning(true);
    setIsVideoLoaded(false);
    
    // Small delay for fade-out effect
    setTimeout(() => {
      setCurrentVideoIndex(newIndex);
      setIsTransitioning(false);
    }, 300);
  }, [currentVideoIndex, isTransitioning]);

  // Rotate through videos every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleVideoChange((currentVideoIndex + 1) % artStyleVideos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentVideoIndex, handleVideoChange]);

  // Preload next video
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'video';
    link.href = nextVideo.mp4;
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [nextVideo.mp4]);

  const handleVideoCanPlay = useCallback(() => {
    setIsVideoLoaded(true);
  }, []);

  const scrollToGallery = () => {
    document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        {/* Gradient Overlay for readability */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        
        {/* Poster Image as fallback and LCP optimization */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={currentVideo.poster}
            alt="Hero background"
            fill
            priority
            sizes="100vw"
            className={cn(
              'object-cover transition-opacity duration-500',
              isVideoLoaded ? 'opacity-0' : 'opacity-100'
            )}
          />
        </div>
        
        {/* Video Background - Only render current video */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            key={currentVideo.id}
            ref={videoRef}
            className={cn(
              'absolute inset-0 h-full w-full object-cover transition-opacity duration-500',
              isVideoLoaded && !isTransitioning ? 'opacity-100' : 'opacity-0'
            )}
            poster={currentVideo.poster}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onCanPlayThrough={handleVideoCanPlay}
          >
            {/* WebM for better compression (Chrome, Firefox, Edge) */}
            <source src={currentVideo.webm} type="video/webm" />
            {/* MP4 fallback (Safari, older browsers) */}
            <source src={currentVideo.mp4} type="video/mp4" />
          </video>
        </div>

        {/* Animated Gradient Decorations */}
        <div
          aria-hidden
          className="absolute inset-0 isolate opacity-50 contain-strict"
        >
          <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(270,80%,65%,.15)_0,hsla(270,60%,45%,.05)_50%,hsla(270,40%,35%,0)_80%)]" />
          <div className="h-320 absolute right-0 top-0 w-60 rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(180,80%,65%,.1)_0,hsla(180,60%,45%,.03)_80%,transparent_100%)] [translate:-5%_-50%]" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-20 flex min-h-screen flex-col items-center justify-center px-4 py-20">
        <div className="mx-auto max-w-5xl text-center">
          {/* Headline */}
          <TextEffect
            per="word"
            preset="fade-in-blur"
            speedSegment={0.3}
            as="h1"
            className="text-balance text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl xl:text-8xl"
          >
            {t('headline')}
          </TextEffect>

          {/* Subheadline */}
          <TextEffect
            per="line"
            preset="fade-in-blur"
            speedSegment={0.3}
            delay={0.5}
            as="p"
            className="mx-auto mt-6 max-w-3xl text-balance text-lg text-muted-foreground md:text-xl lg:text-2xl"
          >
            {t('subheadline')}
          </TextEffect>

          {/* CTA Buttons */}
          <AnimatedGroup
            variants={{
              container: {
                visible: {
                  transition: {
                    staggerChildren: 0.05,
                    delayChildren: 0.8,
                  },
                },
              },
              ...transitionVariants,
            }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            {/* Primary CTA */}
            <div className="rounded-[calc(var(--radius-xl)+0.125rem)] border bg-primary/10 p-0.5">
              <Button
                asChild
                size="lg"
                className="rounded-xl px-8 text-base font-semibold"
              >
                <LocaleLink href="/create/image-to-video">
                  <Upload className="mr-2 h-5 w-5" />
                  {t('cta.primary')}
                </LocaleLink>
              </Button>
            </div>

            {/* Secondary CTA */}
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl px-8 text-base"
              onClick={scrollToGallery}
            >
              <Play className="mr-2 h-5 w-5" />
              {t('cta.secondary')}
            </Button>
          </AnimatedGroup>

          {/* Social Proof Badge */}
          <AnimatedGroup
            variants={{
              container: {
                visible: {
                  transition: {
                    staggerChildren: 0.05,
                    delayChildren: 1.2,
                  },
                },
              },
              ...transitionVariants,
            }}
            className="mt-10"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                <NumberTicker
                  value={12847}
                  className="font-semibold text-foreground"
                />
                {' '}{t('socialProof')}
              </span>
            </div>
          </AnimatedGroup>

          {/* Video Style Indicators */}
          <AnimatedGroup
            variants={{
              container: {
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 1.5,
                  },
                },
              },
              ...transitionVariants,
            }}
            className="mt-8 flex items-center justify-center gap-2"
          >
            {artStyleVideos.map((video, index) => (
              <button
                key={video.id}
                type="button"
                onClick={() => handleVideoChange(index)}
                disabled={isTransitioning}
                className={cn(
                  'h-2 w-2 rounded-full transition-all duration-300',
                  index === currentVideoIndex
                    ? 'w-8 bg-primary'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50',
                  isTransitioning && 'cursor-not-allowed opacity-50'
                )}
                aria-label={t('switchStyle', { style: video.id })}
              />
            ))}
          </AnimatedGroup>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <span className="text-xs uppercase tracking-widest">{t('scrollHint')}</span>
          <div className="h-8 w-5 rounded-full border-2 border-muted-foreground/30 p-1">
            <div className="h-2 w-1.5 animate-bounce rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </section>
  );
}
