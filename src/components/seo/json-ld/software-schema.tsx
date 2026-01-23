import { defaultMessages } from '@/i18n/messages';
import { getBaseUrl } from '@/lib/urls/urls';
import { JsonLdScript } from './json-ld-script';
import type { SoftwareApplicationSchema } from './types';

interface SoftwareSchemaProps {
  name: string;
  description: string;
  applicationCategory?:
    | 'MultimediaApplication'
    | 'DesignApplication'
    | 'BusinessApplication'
    | 'WebApplication';
  price?: number;
  currency?: string;
  features?: string[];
  screenshot?: string | string[];
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}

/**
 * SoftwareApplication Schema Component
 *
 * Provides structured data for software/web applications
 * Useful for tool pages and product pages
 */
export function SoftwareSchema({
  name,
  description,
  applicationCategory = 'MultimediaApplication',
  price,
  currency = 'USD',
  features,
  screenshot,
  aggregateRating,
}: SoftwareSchemaProps) {
  const baseUrl = getBaseUrl();

  const schema: SoftwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${name} | ${defaultMessages.Metadata.name}`,
    description,
    applicationCategory,
    operatingSystem: 'Web Browser',
    ...(price !== undefined && {
      offers: {
        '@type': 'Offer',
        price: price === 0 ? '0' : price / 100,
        priceCurrency: currency,
      },
    }),
    ...(features &&
      features.length > 0 && {
        featureList: features,
      }),
    ...(screenshot && {
      screenshot: Array.isArray(screenshot)
        ? screenshot.map((s) => (s.startsWith('http') ? s : `${baseUrl}${s}`))
        : screenshot.startsWith('http')
          ? screenshot
          : `${baseUrl}${screenshot}`,
    }),
    ...(aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: aggregateRating.ratingValue,
        reviewCount: aggregateRating.reviewCount,
      },
    }),
  };

  return <JsonLdScript data={schema as unknown as Record<string, unknown>} />;
}
