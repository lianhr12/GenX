'use client';

import { GenXCreator } from '@/components/generator/GenXCreator';
import { TextEffect } from '@/components/tailark/motion/text-effect';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

// Art style video samples for background
// 统一使用 Cloudflare R2 的 MP4 视频
const artStyleVideos = [
  {
    id: 'cyberpunk',
    mp4: 'https://asset.genx.art/home/video/_04d086227554f06685353417a38f9e89_70fadb6e-314e-4494-857a-6004a7bbb6aa.mp4',
    poster:
      'https://asset.genx.art/home/video/_04d086227554f06685353417a38f9e89_70fadb6e-314e-4494-857a-6004a7bbb6aa_01.png',
  },
  {
    id: 'watercolor',
    mp4: 'https://asset.genx.art/home/video/_89a6fc273b0d504687862aa2999382aa_39c5be85-1261-4792-9d4d-aa27363043e4.mp4',
    poster:
      'https://asset.genx.art/home/video/_89a6fc273b0d504687862aa2999382aa_39c5be85-1261-4792-9d4d-aa27363043e4_01.png',
  },
  {
    id: 'oil-painting',
    mp4: 'https://asset.genx.art/home/video/_ddf6d58cce8fe6f57c3ee514db06da23_e475bcb5-91dc-4180-8862-bcd5089de28f.mp4',
    poster:
      'https://asset.genx.art/home/video/_ddf6d58cce8fe6f57c3ee514db06da23_e475bcb5-91dc-4180-8862-bcd5089de28f_01.png',
  },
  {
    id: 'anime',
    mp4: 'https://asset.genx.art/home/video/_4bc4c70ea2304da776542666be0df089_5eefa457-e760-4ac8-9665-babec92bea0e.mp4',
    poster:
      'https://asset.genx.art/home/video/_4bc4c70ea2304da776542666be0df089_5eefa457-e760-4ac8-9665-babec92bea0e_01.png',
  },
  {
    id: 'fluid-art',
    mp4: 'https://asset.genx.art/home/video/_b3e26e0f6f3d6ce75e88fc50ae986c59_cf27cf03-03d9-46f4-9448-0fa2b9507984.mp4',
    poster:
      'https://asset.genx.art/home/video/_b3e26e0f6f3d6ce75e88fc50ae986c59_cf27cf03-03d9-46f4-9448-0fa2b9507984_01.png',
  },
];

export function HeroSection() {
  const t = useTranslations('Landing.hero');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [displayedVideoIndex, setDisplayedVideoIndex] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadedPosters, setLoadedPosters] = useState<Set<string>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentVideo = artStyleVideos[currentVideoIndex];
  const displayedVideo = artStyleVideos[displayedVideoIndex];
  const nextVideoIndex = (currentVideoIndex + 1) % artStyleVideos.length;
  const nextVideo = artStyleVideos[nextVideoIndex];

  // Preload all poster images on mount
  useEffect(() => {
    artStyleVideos.forEach((video) => {
      const img = new window.Image();
      img.onload = () => {
        setLoadedPosters((prev) => new Set(prev).add(video.poster));
      };
      img.src = video.poster;
    });
  }, []);

  // Update displayed video index only when poster is ready
  useEffect(() => {
    if (loadedPosters.has(currentVideo.poster)) {
      setDisplayedVideoIndex(currentVideoIndex);
    }
  }, [currentVideoIndex, currentVideo.poster, loadedPosters]);

  // Handle video transition
  const handleVideoChange = useCallback(
    (newIndex: number) => {
      if (newIndex === currentVideoIndex || isTransitioning) return;

      setIsTransitioning(true);
      setIsVideoLoaded(false);

      // Small delay for fade-out effect
      setTimeout(() => {
        setCurrentVideoIndex(newIndex);
        setIsTransitioning(false);
      }, 300);
    },
    [currentVideoIndex, isTransitioning]
  );

  // Rotate through videos every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleVideoChange((currentVideoIndex + 1) % artStyleVideos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentVideoIndex, handleVideoChange]);

  // Preload next video
  useEffect(() => {
    if (nextVideo.mp4 === currentVideo.mp4) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'video';
    link.href = nextVideo.mp4;
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [currentVideo.mp4, nextVideo.mp4]);

  const handleVideoCanPlay = useCallback(() => {
    setIsVideoLoaded(true);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        {/* Gradient Overlay for readability */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-background/50 to-background" />

        {/* Poster Image as fallback - use native img to avoid Next.js private IP restrictions */}
        <div className="absolute inset-0 overflow-hidden">
          {!isVideoLoaded && (
            <img
              key={displayedVideo.id}
              src={displayedVideo.poster}
              alt=""
              className={cn(
                'absolute inset-0 h-full w-full object-cover transition-opacity duration-500',
                isTransitioning || !loadedPosters.has(displayedVideo.poster)
                  ? 'opacity-50'
                  : 'opacity-100'
              )}
            />
          )}
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
            preload="metadata"
            onCanPlayThrough={handleVideoCanPlay}
          >
            {/* MP4 source (Cloudflare R2) */}
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
      <div className="relative z-20 flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 py-20">
        <div className="mx-auto w-full max-w-5xl text-center">
          {/* Headline */}
          <TextEffect
            per="word"
            preset="fade-in-blur"
            speedSegment={0.3}
            as="h1"
            className="text-balance text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
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
            className="mx-auto mt-4 max-w-3xl text-balance text-base text-muted-foreground sm:mt-6 sm:text-lg md:text-xl lg:text-2xl"
          >
            {t('subheadline')}
          </TextEffect>

          {/* GenXCreator - Embedded */}
          <div className="mt-6 w-full max-w-4xl mx-auto sm:mt-10 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-700 fill-mode-both">
            <GenXCreator
              compact
              enableNavigation
              showCredits={false}
            />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <span className="text-xs uppercase tracking-widest">
            {t('scrollHint')}
          </span>
          <div className="h-8 w-5 rounded-full border-2 border-muted-foreground/30 p-1">
            <div className="h-2 w-1.5 animate-bounce rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </section>
  );
}
