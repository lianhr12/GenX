'use client';

import { AnimatedGroup } from '@/components/tailark/motion/animated-group';
import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { Check, Sparkles, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      x: -20,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        bounce: 0.3,
        duration: 0.8,
      },
    },
  },
};

const painPoints = [{ id: 'learning' }, { id: 'cost' }, { id: 'generic' }];

export function PainPointsSection() {
  const t = useTranslations('Landing.painPoints');

  return (
    <section className="relative py-24 lg:py-32">
      {/* Background Decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <AnimatedGroup preset="blur-slide">
            <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              {t('headline')}
            </h2>
          </AnimatedGroup>
        </div>

        {/* Two Column Layout */}
        <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Pain Points Column */}
          <div className="space-y-6">
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.15,
                      delayChildren: 0.2,
                    },
                  },
                },
                ...transitionVariants,
              }}
              className="space-y-4"
            >
              {painPoints.map((point) => (
                <div
                  key={point.id}
                  className="group flex items-start gap-4 rounded-xl border border-destructive/10 bg-destructive/5 p-5 transition-all hover:border-destructive/20 hover:bg-destructive/10"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                    <X className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground line-through decoration-destructive/50">
                      {t(`items.${point.id}.title` as never)}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t(`items.${point.id}.description` as never)}
                    </p>
                  </div>
                </div>
              ))}
            </AnimatedGroup>
          </div>

          {/* Solution Column */}
          <div className="flex flex-col justify-center">
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.5,
                    },
                  },
                },
                item: {
                  hidden: { opacity: 0, x: 20 },
                  visible: {
                    opacity: 1,
                    x: 0,
                    transition: { type: 'spring', bounce: 0.3, duration: 0.8 },
                  },
                },
              }}
            >
              {/* Solution Card */}
              <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-purple-500/10 p-8">
                {/* Glow Effect */}
                <div className="absolute -inset-px -z-10 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 blur-xl" />

                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">{t('solution.title')}</h3>
                </div>

                <p className="mt-4 text-lg text-muted-foreground">
                  {t('solution.description')}
                </p>

                {/* Benefits */}
                <div className="mt-6 space-y-3">
                  {['benefit1', 'benefit2', 'benefit3'].map((benefit) => (
                    <div key={benefit} className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">
                        {t(`solution.${benefit}` as never)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-8">
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <LocaleLink href="/create">{t('cta')}</LocaleLink>
                  </Button>
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </div>
      </div>
    </section>
  );
}
