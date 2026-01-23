import { getBaseUrl } from '@/lib/urls/urls';
import { JsonLdScript } from './json-ld-script';
import type {
  BreadcrumbItem,
  BreadcrumbListSchema as BreadcrumbListSchemaType,
} from './types';

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

/**
 * BreadcrumbList Schema Component
 *
 * Provides structured data for breadcrumb navigation
 * Helps Google understand site structure and display breadcrumbs in search results
 */
export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  if (!items || items.length === 0) {
    return null;
  }

  const baseUrl = getBaseUrl();

  const schema: BreadcrumbListSchemaType = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      // Last item shouldn't have an item URL (current page)
      item: index < items.length - 1 ? `${baseUrl}${item.url}` : undefined,
    })),
  };

  return <JsonLdScript data={schema} />;
}

export type { BreadcrumbItem };
