'use client';

import { useTranslations } from 'next-intl';
import { ProductSchema } from './json-ld';

/**
 * Pricing Page Schema Component
 *
 * Provides Product structured data for the pricing page
 * Helps display pricing information in search results
 */
export function PricingPageSchema() {
  const t = useTranslations('PricePlans');

  const offers = [
    {
      name: t('free.name'),
      description: t('free.description'),
      price: 0,
      currency: 'USD',
    },
    {
      name: t('pro.name'),
      description: t('pro.description'),
      price: 990, // $9.90/month in cents
      currency: 'USD',
    },
  ];

  return (
    <ProductSchema
      name="GenX.art AI Video Generator"
      description="AI-powered image to video generator with multiple art styles. Transform photos into stunning cinematic art videos."
      image="/og.png"
      offers={offers}
      aggregateRating={{
        ratingValue: 4.8,
        reviewCount: 1250,
      }}
    />
  );
}
