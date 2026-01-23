/**
 * SEO Components
 *
 * Centralized exports for all SEO-related components
 */

// JSON-LD Structured Data
export {
  ArticleSchema,
  BreadcrumbSchema,
  FAQSchema,
  JsonLdScript,
  OrganizationSchema,
  ProductSchema,
  SoftwareSchema,
  VideoSchema,
  WebsiteSchema,
  type BreadcrumbItem,
} from './json-ld';

// Page-specific Schema Bundles
export { HomePageSchemas } from './home-page-schemas';
export { PricingPageSchema } from './pricing-page-schema';

// Reusable SEO Components
export { PageBreadcrumb, type BreadcrumbNavItem } from './page-breadcrumb';
