import { defaultMessages } from '@/i18n/messages';
import { getBaseUrl } from '@/lib/urls/urls';
import type { Locale } from 'next-intl';
import { JsonLdScript } from './json-ld-script';
import type { WebSiteSchema as WebSiteSchemaType } from './types';

interface WebsiteSchemaProps {
  locale?: Locale;
  enableSearch?: boolean;
}

/**
 * WebSite Schema Component
 *
 * Provides structured data about the website
 * Should be included on the homepage
 */
export function WebsiteSchema({
  locale = 'en',
  enableSearch = false,
}: WebsiteSchemaProps = {}) {
  const baseUrl = getBaseUrl();

  const schema: WebSiteSchemaType = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: defaultMessages.Metadata.name,
    url: baseUrl,
    description: defaultMessages.Metadata.description,
    inLanguage: locale === 'zh' ? 'zh-CN' : 'en-US',
    ...(enableSearch && {
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${baseUrl}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    }),
  };

  return <JsonLdScript data={schema} />;
}
