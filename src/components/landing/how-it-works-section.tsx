'use client';

import { AnimatedGroup } from '@/components/tailark/motion/animated-group';
import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { ArrowRight, Download, Palette, Upload } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

const steps = [
  {
    id: 'upload',
    icon: Upload,
    gradientColor: 'from-blue-500 to-cyan-500',
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 'style',
    icon: Palette,
    gradientColor: 'from-purple-500 to-pink-500',
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    id: 'download',
    icon: Download,
    gradientColor: 'from-green-500 to-emerald-500',
    iconColor: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
];

export function HowItWorksSection() {
  const t = useTranslations('Landing.howItWorks');

  return (
    <section id="how-it-works" className="relative py-24 lg:py-32 bg-muted/30">
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

        {/* Steps */}
        <div className="mt-20">
          <AnimatedGroup preset="scale" className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="relative">
                  {/* Connector Line (hidden on mobile and last item) */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-1/2 top-16 hidden h-0.5 w-full md:block">
                      <div className="h-full w-full bg-gradient-to-r from-border via-primary/30 to-border" />
                      <ArrowRight className="absolute -right-3 -top-2.5 h-5 w-5 text-primary/50" />
                    </div>
                  )}

                  <motion.div
                    className="relative rounded-2xl border bg-background p-8 text-center shadow-sm transition-shadow hover:shadow-md"
                    whileHover={{ y: -4 }}
                  >
                    {/* Step Number */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white',
                          step.gradientColor
                        )}
                      >
                        {index + 1}
                      </div>
                    </div>

                    {/* Icon */}
                    <div
                      className={cn(
                        'mx-auto flex h-20 w-20 items-center justify-center rounded-2xl',
                        step.bgColor
                      )}
                    >
                      <Icon className={cn('h-10 w-10', step.iconColor)} />
                    </div>

                    {/* Content */}
                    <h3 className="mt-6 text-xl font-semibold">
                      {t(`steps.${step.id}.title`)}
                    </h3>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {t(`steps.${step.id}.description`)}
                    </p>

                    {/* Details */}
                    <div className="mt-4 rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">
                        {t(`steps.${step.id}.details`)}
                      </p>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </AnimatedGroup>
        </div>

        {/* Bottom Content */}
        <div className="mt-16 text-center">
          <AnimatedGroup preset="fade">
            <p className="text-lg text-muted-foreground">{t('bottomText')}</p>
            <div className="mt-6">
              <Button asChild size="lg" className="rounded-xl px-8">
                <LocaleLink href="/create/image-to-video">
                  {t('cta')}
                </LocaleLink>
              </Button>
            </div>
          </AnimatedGroup>
        </div>
      </div>
    </section>
  );
}
