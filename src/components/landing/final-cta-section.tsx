'use client';

import { AnimatedGroup } from '@/components/tailark/motion/animated-group';
import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/navigation';
import { Check, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

const trustBadges = [{ id: 'thirtySeconds' }, { id: 'instantDownload' }];

export function FinalCTASection() {
  const t = useTranslations('Landing.finalCta');

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-purple-500/10" />

        {/* Animated Gradient Orbs */}
        <motion.div
          className="absolute left-1/4 top-1/4 h-[400px] w-[400px] rounded-full bg-primary/20 blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-purple-500/20 blur-[100px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Content */}
        <AnimatedGroup preset="blur-slide">
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            {t('headline')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {t('subheadline')}
          </p>
        </AnimatedGroup>

        {/* CTA Button */}
        <AnimatedGroup
          variants={{
            container: {
              visible: {
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.3,
                },
              },
            },
            item: {
              hidden: { opacity: 0, y: 20, scale: 0.95 },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { type: 'spring', bounce: 0.3, duration: 0.8 },
              },
            },
          }}
          className="mt-10"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Button
              asChild
              size="lg"
              className="rounded-xl px-10 py-6 text-lg font-semibold shadow-lg shadow-primary/30"
            >
              <LocaleLink href="/create">
                <Sparkles className="mr-2 h-5 w-5" />
                {t('cta')}
              </LocaleLink>
            </Button>
          </motion.div>
        </AnimatedGroup>

        {/* Trust Badges */}
        <div className="mt-10">
          <AnimatedGroup
            preset="fade"
            className="flex flex-wrap items-center justify-center gap-4 md:gap-6"
          >
            {trustBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Check className="h-4 w-4 text-green-500" />
                <span>{t(`trust.${badge.id}` as never)}</span>
              </div>
            ))}
          </AnimatedGroup>
        </div>
      </div>
    </section>
  );
}
