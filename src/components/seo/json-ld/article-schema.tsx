import { websiteConfig } from '@/config/website';
import { defaultMessages } from '@/i18n/messages';
import { getBaseUrl, getImageUrl } from '@/lib/urls/urls';
import { JsonLdScript } from './json-ld-script';
import type { ArticleSchema as ArticleSchemaType } from './types';

interface ArticleSchemaProps {
  title: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  authorUrl?: string;
  url: string;
  keywords?: string[];
}

/**
 * Article Schema Component
 *
 * Provides structured data for blog posts and articles
 * Helps with rich snippets in search results
 */
export function ArticleSchema({
  title,
  description,
  image,
  datePublished,
  dateModified,
  authorName,
  authorUrl,
  url,
  keywords,
}: ArticleSchemaProps) {
  const baseUrl = getBaseUrl();

  const schema: ArticleSchemaType = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    image: image ? getImageUrl(image) : undefined,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: authorName,
      url: authorUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: defaultMessages.Metadata.name,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}${websiteConfig.metadata.images?.logoLight || '/logo.png'}`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}${url}`,
    },
    keywords: keywords && keywords.length > 0 ? keywords : undefined,
  };

  return <JsonLdScript data={schema as unknown as Record<string, unknown>} />;
}
