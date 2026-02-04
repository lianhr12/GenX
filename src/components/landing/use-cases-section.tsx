'use client';

import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  BookOpen,
  Palette,
  ShoppingBag,
  Smartphone,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

const useCases = [
  {
    id: 'social',
    icon: Smartphone,
    color: 'from-blue-500 to-purple-500',
    bgColor: 'bg-blue-500/10',
    video: 'https://asset.genx.art/home/video/1769839322049.mp4',
    image: 'https://asset.genx.art/home/video/1769839322049_01.png',
  },
  {
    id: 'product',
    icon: ShoppingBag,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-500/10',
    video: 'https://asset.genx.art/home/video/1769838755648.mp4',
    image: 'https://asset.genx.art/home/video/1769838755648_1.png',
  },
  {
    id: 'art',
    icon: Palette,
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500/10',
    video:
      'https://asset.genx.art/home/video/_ce536aaac781eda12e5ab55346d2f965_9b55ee0f-3630-4cd3-a72c-841c2194f53f.mp4',
    image:
      'https://asset.genx.art/home/video/_ce536aaac781eda12e5ab55346d2f965_9b55ee0f-3630-4cd3-a72c-841c2194f53f_1.png',
  },
  {
    id: 'content',
    icon: BookOpen,
    color: 'from-green-500 to-teal-500',
    bgColor: 'bg-green-500/10',
    video:
      'https://asset.genx.art/home/video/video_697d92ddf6348190afae5b0c80470ece.mp4',
    image:
      'https://asset.genx.art/home/video/video_697d92ddf6348190afae5b0c80470ece_1.png',
  },
];

export function UseCasesSection() {
  const t = useTranslations('Landing.useCases');
  const [activeCase, setActiveCase] = useState(useCases[0].id);
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentCase = useCases.find((c) => c.id === activeCase) || useCases[0];
  const Icon = currentCase.icon;

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  const handleTouchStart = useCallback(() => {
    setIsHovering(true);
  }, []);

  useEffect(() => {
    if (isHovering && videoRef.current) {
      videoRef.current.play().catch(() => {});
    } else if (!isHovering && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovering]);

  const handleCaseChange = (caseId: string) => {
    setActiveCase(caseId);
    setIsHovering(false);
  };

  return (
    <section id="use-cases" className="relative py-24 lg:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <span className="inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            {t('badge')}
          </span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            {t('headline')}
          </h2>
        </div>

        {/* Content */}
        <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Left: Tabs */}
          <div className="space-y-4">
            <div className="space-y-4">
              {useCases.map((useCase) => {
                const CaseIcon = useCase.icon;
                const isActive = activeCase === useCase.id;

                return (
                  <button
                    key={useCase.id}
                    type="button"
                    onClick={() => handleCaseChange(useCase.id)}
                    className={cn(
                      'w-full rounded-xl border p-5 text-left transition-all',
                      isActive
                        ? 'border-primary/30 bg-primary/5 shadow-md'
                        : 'border-transparent bg-background hover:border-border hover:bg-muted/50'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors',
                          isActive ? useCase.bgColor : 'bg-muted'
                        )}
                      >
                        <CaseIcon
                          className={cn(
                            'h-6 w-6 transition-colors',
                            isActive ? 'text-primary' : 'text-muted-foreground'
                          )}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3
                            className={cn(
                              'font-semibold transition-colors',
                              isActive
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                            )}
                          >
                            {t(`cases.${useCase.id}.title` as never)}
                          </h3>
                          <ArrowRight
                            className={cn(
                              'h-4 w-4 transition-all',
                              isActive
                                ? 'translate-x-0 opacity-100 text-primary'
                                : '-translate-x-2 opacity-0'
                            )}
                          />
                        </div>
                        <p
                          className={cn(
                            'mt-1 text-sm transition-colors',
                            isActive
                              ? 'text-muted-foreground'
                              : 'text-muted-foreground/70'
                          )}
                        >
                          {t(`cases.${useCase.id}.description` as never)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Preview */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="relative overflow-hidden rounded-2xl border bg-background shadow-xl"
              >
                {/* Video/Image */}
                <div
                  ref={containerRef}
                  className="relative aspect-video cursor-pointer"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onTouchStart={handleTouchStart}
                >
                  <Image
                    src={currentCase.image}
                    alt={t(`cases.${currentCase.id}.title` as never)}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className={cn(
                      'object-cover transition-opacity duration-300',
                      isHovering ? 'opacity-0' : 'opacity-100'
                    )}
                    loading="lazy"
                  />
                  <video
                    ref={videoRef}
                    src={currentCase.video}
                    className={cn(
                      'absolute inset-0 h-full w-full object-cover transition-opacity duration-300',
                      isHovering ? 'opacity-100' : 'opacity-0'
                    )}
                    loop
                    muted
                    playsInline
                    preload="metadata"
                  />
                  {/* Play Icon Overlay - shows when not hovering */}
                  <div
                    className={cn(
                      'absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300',
                      isHovering
                        ? 'opacity-0 pointer-events-none'
                        : 'opacity-100'
                    )}
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                      <div className="ml-1 h-0 w-0 border-y-8 border-l-[12px] border-y-transparent border-l-white" />
                    </div>
                  </div>
                </div>

                {/* Info Panel */}
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg',
                        currentCase.bgColor
                      )}
                    >
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        {t(`cases.${currentCase.id}.title` as never)}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {t(`cases.${currentCase.id}.example` as never)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button asChild className="w-full">
                      <LocaleLink href="/create/image-to-video">
                        {t('cta')}
                      </LocaleLink>
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
