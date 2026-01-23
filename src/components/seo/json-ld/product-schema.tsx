import { defaultMessages } from '@/i18n/messages';
import { getBaseUrl } from '@/lib/urls/urls';
import { JsonLdScript } from './json-ld-script';
import type { ProductSchema as ProductSchemaType } from './types';

interface PricingOffer {
  name: string;
  description?: string;
  price: number;
  currency?: string;
}

interface ProductSchemaProps {
  name: string;
  description: string;
  image?: string;
  offers: PricingOffer[];
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}

/**
 * Product Schema Component
 *
 * Provides structured data for products/pricing plans
 * Helps display pricing information in search results
 */
export function ProductSchema({
  name,
  description,
  image,
  offers,
  aggregateRating,
}: ProductSchemaProps) {
  const baseUrl = getBaseUrl();

  const schema: ProductSchemaType = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: image ? `${baseUrl}${image}` : undefined,
    brand: {
      '@type': 'Brand',
      name: defaultMessages.Metadata.name,
    },
    offers: offers.map((offer) => ({
      '@type': 'Offer' as const,
      name: offer.name,
      description: offer.description,
      price: offer.price / 100, // Convert cents to dollars
      priceCurrency: offer.currency || 'USD',
      availability: 'https://schema.org/InStock',
    })),
    ...(aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: aggregateRating.ratingValue,
        reviewCount: aggregateRating.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  return <JsonLdScript data={schema} />;
}
