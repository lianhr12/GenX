import { websiteConfig } from '@/config/website';
import { defaultMessages } from '@/i18n/messages';
import { getBaseUrl } from '@/lib/urls/urls';
import { JsonLdScript } from './json-ld-script';
import type { OrganizationSchema as OrganizationSchemaType } from './types';

/**
 * Organization Schema Component
 *
 * Provides structured data about the organization/company
 * Should be included on every page (typically in the root layout)
 */
export function OrganizationSchema() {
  const baseUrl = getBaseUrl();

  const sameAs: string[] = [];
  if (websiteConfig.metadata.social?.twitter) {
    sameAs.push(websiteConfig.metadata.social.twitter);
  }
  if (websiteConfig.metadata.social?.discord) {
    sameAs.push(websiteConfig.metadata.social.discord);
  }

  const schema: OrganizationSchemaType = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: defaultMessages.Metadata.name,
    url: baseUrl,
    logo: `${baseUrl}${websiteConfig.metadata.images?.logoLight || '/logo.png'}`,
    description: defaultMessages.Metadata.description,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: websiteConfig.mail.supportEmail,
    },
  };

  return <JsonLdScript data={schema as unknown as Record<string, unknown>} />;
}
