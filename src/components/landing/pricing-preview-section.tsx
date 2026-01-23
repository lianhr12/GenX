'use client';

import { AnimatedGroup } from '@/components/tailark/motion/animated-group';
import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { Check, X, CreditCard } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';

const plans = [
  {
    id: 'free',
    price: 0,
    popular: false,
  },
  {
    id: 'pro',
    price: 19,
    yearlyPrice: 190,
    popular: true,
  },
];

export function PricingPreviewSection() {
  const t = useTranslations('Landing.pricing');

  return (
    <section id="pricing" className="relative py-24 lg:py-32">
      {/* Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
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

        {/* Pricing Cards */}
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <AnimatedGroup preset="scale" className="grid gap-8 md:grid-cols-2 md:col-span-2">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                className={cn(
                  'relative overflow-hidden rounded-2xl border p-8',
                  plan.popular
                    ? 'border-primary/30 bg-gradient-to-br from-primary/5 via-background to-purple-500/5 shadow-xl'
                    : 'border-border bg-background'
                )}
                whileHover={{ y: -4 }}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -right-12 top-6 rotate-45 bg-primary px-12 py-1 text-xs font-medium text-primary-foreground">
                    {t('popular')}
                  </div>
                )}

                {/* Plan Header */}
                <div>
                  <h3 className="text-xl font-semibold">{t(`plans.${plan.id}.name`)}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t(`plans.${plan.id}.description`)}
                  </p>
                </div>

                {/* Price */}
                <div className="mt-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    {plan.price > 0 && (
                      <span className="text-muted-foreground">{t('perMonth')}</span>
                    )}
                  </div>
                  {plan.yearlyPrice && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t('yearlyOption', { price: plan.yearlyPrice, discount: 17 })}
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="mt-6 space-y-3">
                  {['feature1', 'feature2', 'feature3', 'feature4'].map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{t(`plans.${plan.id}.${feature}`)}</span>
                    </div>
                  ))}
                  
                  {/* Limitations for free plan */}
                  {plan.id === 'free' && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <X className="h-4 w-4" />
                      <span className="text-sm">{t('plans.free.limit')}</span>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div className="mt-8">
                  <Button
                    asChild
                    className={cn(
                      'w-full',
                      plan.popular ? '' : 'bg-muted text-foreground hover:bg-muted/80'
                    )}
                    variant={plan.popular ? 'default' : 'secondary'}
                  >
                    <LocaleLink href={plan.popular ? '/pricing' : '/ai/image-to-video'}>
                      {t(`plans.${plan.id}.cta`)}
                    </LocaleLink>
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatedGroup>
        </div>

        {/* Payment Methods */}
        <div className="mt-12 text-center">
          <AnimatedGroup preset="fade">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              <span>{t('paymentNote')}</span>
            </div>
            <div className="mt-4 flex items-center justify-center gap-4">
              <img src="/images/payment/visa.svg" alt="Visa" className="h-8 opacity-50" />
              <img src="/images/payment/mastercard.svg" alt="Mastercard" className="h-8 opacity-50" />
              <img src="/images/payment/paypal.svg" alt="PayPal" className="h-8 opacity-50" />
              <img src="/images/payment/stripe.svg" alt="Stripe" className="h-8 opacity-50" />
            </div>
          </AnimatedGroup>
        </div>

        {/* See Full Pricing */}
        <div className="mt-8 text-center">
          <Button asChild variant="link">
            <LocaleLink href="/pricing">
              {t('seeFullPricing')} →
            </LocaleLink>
          </Button>
        </div>
      </div>
    </section>
  );
}
