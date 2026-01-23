'use client';

import { AnimatedGroup } from '@/components/tailark/motion/animated-group';
import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { Smartphone, ShoppingBag, Palette, BookOpen, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

const useCases = [
  {
    id: 'social',
    icon: Smartphone,
    color: 'from-blue-500 to-purple-500',
    bgColor: 'bg-blue-500/10',
    video: '/videos/demo/use-case-social.mp4',
    image: '/images/demo/use-case-social.jpg',
  },
  {
    id: 'product',
    icon: ShoppingBag,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-500/10',
    video: '/videos/demo/use-case-product.mp4',
    image: '/images/demo/use-case-product.jpg',
  },
  {
    id: 'art',
    icon: Palette,
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500/10',
    video: '/videos/demo/use-case-art.mp4',
    image: '/images/demo/use-case-art.jpg',
  },
  {
    id: 'content',
    icon: BookOpen,
    color: 'from-green-500 to-teal-500',
    bgColor: 'bg-green-500/10',
    video: '/videos/demo/use-case-content.mp4',
    image: '/images/demo/use-case-content.jpg',
  },
];

export function UseCasesSection() {
  const t = useTranslations('Landing.useCases');
  const [activeCase, setActiveCase] = useState(useCases[0].id);

  const currentCase = useCases.find((c) => c.id === activeCase) || useCases[0];
  const Icon = currentCase.icon;

  return (
    <section id="use-cases" className="relative py-24 lg:py-32 bg-muted/30">
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
          </AnimatedGroup>
        </div>

        {/* Content */}
        <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Left: Tabs */}
          <div className="space-y-4">
            <AnimatedGroup preset="slide" className="space-y-4">
              {useCases.map((useCase) => {
                const CaseIcon = useCase.icon;
                const isActive = activeCase === useCase.id;
                
                return (
                  <button
                    key={useCase.id}
                    type="button"
                    onClick={() => setActiveCase(useCase.id)}
                    className={cn(
                      'w-full rounded-xl border p-5 text-left transition-all',
                      isActive
                        ? 'border-primary/30 bg-primary/5 shadow-md'
                        : 'border-transparent bg-background hover:border-border hover:bg-muted/50'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors',
                        isActive ? useCase.bgColor : 'bg-muted'
                      )}>
                        <CaseIcon className={cn(
                          'h-6 w-6 transition-colors',
                          isActive ? 'text-primary' : 'text-muted-foreground'
                        )} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className={cn(
                            'font-semibold transition-colors',
                            isActive ? 'text-foreground' : 'text-muted-foreground'
                          )}>
                            {t(`cases.${useCase.id}.title`)}
                          </h3>
                          <ArrowRight className={cn(
                            'h-4 w-4 transition-all',
                            isActive ? 'translate-x-0 opacity-100 text-primary' : '-translate-x-2 opacity-0'
                          )} />
                        </div>
                        <p className={cn(
                          'mt-1 text-sm transition-colors',
                          isActive ? 'text-muted-foreground' : 'text-muted-foreground/70'
                        )}>
                          {t(`cases.${useCase.id}.description`)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </AnimatedGroup>
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
                <div className="relative aspect-video">
                  <Image
                    src={currentCase.image}
                    alt={t(`cases.${currentCase.id}.title`)}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    loading="lazy"
                  />
                  {/* Play Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                      <div className="ml-1 h-0 w-0 border-y-8 border-l-[12px] border-y-transparent border-l-white" />
                    </div>
                  </div>
                </div>

                {/* Info Panel */}
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', currentCase.bgColor)}>
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{t(`cases.${currentCase.id}.title`)}</h4>
                      <p className="text-sm text-muted-foreground">{t(`cases.${currentCase.id}.example`)}</p>
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
