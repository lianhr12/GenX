'use client';

import { AnimatedGroup } from '@/components/tailark/motion/animated-group';
import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { Check, CreditCard, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

const plans = [
  {
    id: 'free',
    price: 0,
    popular: false,
  },
  {
    id: 'pro',
    price: 9.9,
    yearlyPrice: 99,
    popular: true,
  },
  {
    id: 'lifetime',
    price: 199,
    isLifetime: true,
    popular: false,
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
        <div className="mt-16">
          <AnimatedGroup preset="scale" className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const isLifetime = 'isLifetime' in plan && plan.isLifetime;
              return (
                <motion.div
                  key={plan.id}
                  className={cn(
                    'relative overflow-hidden rounded-2xl border p-6',
                    plan.popular
                      ? 'border-primary/30 bg-gradient-to-br from-primary/5 via-background to-purple-500/5 shadow-xl'
                      : isLifetime
                        ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-background to-orange-500/5'
                        : 'border-border bg-background'
                  )}
                  whileHover={{ y: -4 }}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -right-10 top-5 rotate-45 bg-primary px-10 py-1 text-xs font-medium text-primary-foreground">
                      {t('popular')}
                    </div>
                  )}

                  {/* Lifetime Badge */}
                  {isLifetime && (
                    <div className="absolute -right-10 top-5 rotate-45 bg-amber-500 px-10 py-1 text-xs font-medium text-white">
                      {t('bestValue')}
                    </div>
                  )}

                  {/* Plan Header */}
                  <div>
                    <h3 className="text-lg font-semibold">
                      {t(`plans.${plan.id}.name` as never)}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {t(`plans.${plan.id}.description` as never)}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mt-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      {plan.price > 0 && !isLifetime && (
                        <span className="text-sm text-muted-foreground">
                          {t('perMonth')}
                        </span>
                      )}
                      {isLifetime && (
                        <span className="text-sm text-muted-foreground">
                          {t('oneTime')}
                        </span>
                      )}
                    </div>
                    {'yearlyPrice' in plan && plan.yearlyPrice && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t('yearlyOption', {
                          price: plan.yearlyPrice,
                          discount: 17,
                        })}
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="mt-4 space-y-2">
                    {['feature1', 'feature2', 'feature3', 'feature4'].map(
                      (feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500 shrink-0" />
                          <span className="text-sm">
                            {t(`plans.${plan.id}.${feature}` as never)}
                          </span>
                        </div>
                      )
                    )}

                    {/* Limitations for free plan */}
                    {plan.id === 'free' && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <X className="h-4 w-4 shrink-0" />
                        <span className="text-sm">{t('plans.free.limit')}</span>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="mt-6">
                    <Button
                      asChild
                      className={cn(
                        'w-full',
                        plan.popular || isLifetime
                          ? ''
                          : 'bg-muted text-foreground hover:bg-muted/80'
                      )}
                      variant={
                        plan.popular
                          ? 'default'
                          : isLifetime
                            ? 'default'
                            : 'secondary'
                      }
                    >
                      <LocaleLink href="/pricing">
                        {t(`plans.${plan.id}.cta` as never)}
                      </LocaleLink>
                    </Button>
                  </div>
                </motion.div>
              );
            })}
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
              <img
                src="/images/payment/visa.svg"
                alt="Visa"
                className="h-8 opacity-50"
              />
              <img
                src="/images/payment/mastercard.svg"
                alt="Mastercard"
                className="h-8 opacity-50"
              />
              <img
                src="/images/payment/paypal.svg"
                alt="PayPal"
                className="h-8 opacity-50"
              />
              <img
                src="/images/payment/stripe.svg"
                alt="Stripe"
                className="h-8 opacity-50"
              />
            </div>
          </AnimatedGroup>
        </div>

        {/* See Full Pricing */}
        <div className="mt-8 text-center">
          <Button asChild variant="link">
            <LocaleLink href="/pricing">{t('seeFullPricing')} →</LocaleLink>
          </Button>
        </div>
      </div>
    </section>
  );
}
