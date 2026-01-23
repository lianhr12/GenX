/**
 * JSON-LD Structured Data Components
 *
 * These components add Schema.org structured data to pages
 * for better SEO and rich search results
 */

export { ArticleSchema } from './article-schema';
export { BreadcrumbSchema, type BreadcrumbItem } from './breadcrumb-schema';
export { FAQSchema } from './faq-schema';
export { JsonLdScript } from './json-ld-script';
export { OrganizationSchema } from './organization-schema';
export { ProductSchema } from './product-schema';
export { SoftwareSchema } from './software-schema';
export { VideoSchema } from './video-schema';
export { WebsiteSchema } from './website-schema';

// Re-export types
export type {
  ArticleSchema as ArticleSchemaType,
  BreadcrumbListSchema,
  FAQItem,
  FAQPageSchema,
  OrganizationSchema as OrganizationSchemaType,
  ProductSchema as ProductSchemaType,
  SoftwareApplicationSchema,
  VideoObjectSchema,
  WebSiteSchema,
} from './types';
