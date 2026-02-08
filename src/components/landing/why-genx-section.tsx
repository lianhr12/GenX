'use client';

import { AnimatedGroup } from '@/components/tailark/motion/animated-group';
import { cn } from '@/lib/utils';
import { Check, Gift, Globe, Palette, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

const features = [
  {
    id: 'quality',
    icon: Palette,
    glowColor: 'bg-gradient-to-br from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
  {
    id: 'speed',
    icon: Zap,
    glowColor: 'bg-gradient-to-br from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
  },
  {
    id: 'free',
    icon: Gift,
    glowColor: 'bg-gradient-to-br from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
  },
  {
    id: 'anywhere',
    icon: Globe,
    glowColor: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
];

const trustBadges = [{ id: 'noWatermark' }];

export function WhyGenXSection() {
  const t = useTranslations('Landing.whyGenx');

  return (
    <section id="why-genx" className="relative py-24 lg:py-32">
      {/* Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-0 top-1/3 h-[400px] w-[400px] rounded-full bg-purple-500/5 blur-[100px]" />
        <div className="absolute bottom-1/3 right-0 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[100px]" />
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
          </AnimatedGroup>
        </div>

        {/* Features Grid */}
        <div className="mt-16">
          <AnimatedGroup
            preset="scale"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.id}
                  className={cn(
                    'group relative overflow-hidden rounded-2xl border p-6 transition-all hover:shadow-lg',
                    feature.borderColor
                  )}
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                  {/* Glow Effect */}
                  <div
                    className={cn(
                      'absolute -inset-px -z-10 rounded-2xl opacity-0 blur-xl transition-opacity group-hover:opacity-50',
                      feature.glowColor
                    )}
                  />

                  {/* Icon */}
                  <div
                    className={cn(
                      'flex h-14 w-14 items-center justify-center rounded-xl',
                      feature.bgColor
                    )}
                  >
                    <Icon className="h-7 w-7 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="mt-5 text-lg font-semibold">
                    {t(`features.${feature.id}.title` as never)}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t(`features.${feature.id}.description` as never)}
                  </p>
                </motion.div>
              );
            })}
          </AnimatedGroup>
        </div>

        {/* Trust Badges */}
        <div className="mt-16">
          <AnimatedGroup
            preset="fade"
            className="flex flex-wrap items-center justify-center gap-6"
          >
            {trustBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm"
              >
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">
                  {t(`trust.${badge.id}` as never)}
                </span>
              </div>
            ))}
          </AnimatedGroup>
        </div>
      </div>
    </section>
  );
}
