import { websiteConfig } from '@/config/website';
import { defaultMessages } from '@/i18n/messages';
import { getBaseUrl } from '@/lib/urls/urls';
import { JsonLdScript } from './json-ld-script';
import type { VideoObjectSchema } from './types';

interface VideoSchemaProps {
  name: string;
  description: string;
  thumbnailUrl: string | string[];
  uploadDate?: string;
  duration?: string; // ISO 8601 format (e.g., "PT30S" for 30 seconds)
  contentUrl?: string;
  embedUrl?: string;
}

/**
 * VideoObject Schema Component
 *
 * Provides structured data for video content
 * Helps videos appear in Google Video search results
 */
export function VideoSchema({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  duration,
  contentUrl,
  embedUrl,
}: VideoSchemaProps) {
  const baseUrl = getBaseUrl();

  // Convert relative URLs to absolute
  const absoluteThumbnail = Array.isArray(thumbnailUrl)
    ? thumbnailUrl.map((url) => (url.startsWith('http') ? url : `${baseUrl}${url}`))
    : thumbnailUrl.startsWith('http')
      ? thumbnailUrl
      : `${baseUrl}${thumbnailUrl}`;

  const schema: VideoObjectSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name,
    description,
    thumbnailUrl: absoluteThumbnail,
    uploadDate: uploadDate || new Date().toISOString().split('T')[0],
    ...(duration && { duration }),
    ...(contentUrl && {
      contentUrl: contentUrl.startsWith('http')
        ? contentUrl
        : `${baseUrl}${contentUrl}`,
    }),
    ...(embedUrl && {
      embedUrl: embedUrl.startsWith('http') ? embedUrl : `${baseUrl}${embedUrl}`,
    }),
    publisher: {
      '@type': 'Organization',
      name: defaultMessages.Metadata.name,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}${websiteConfig.metadata.images?.logoLight || '/logo.png'}`,
      },
    },
  };

  return <JsonLdScript data={schema} />;
}
