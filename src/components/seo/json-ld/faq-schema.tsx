import { JsonLdScript } from './json-ld-script';
import type { FAQItem, FAQPageSchema } from './types';

interface FAQSchemaProps {
  items: FAQItem[];
}

/**
 * FAQPage Schema Component
 *
 * Provides structured data for FAQ sections
 * Enables FAQ rich snippets in Google search results
 */
export function FAQSchema({ items }: FAQSchemaProps) {
  if (!items || items.length === 0) {
    return null;
  }

  const schema: FAQPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return <JsonLdScript data={schema as unknown as Record<string, unknown>} />;
}
