/**
 * JSON-LD Schema Types for SEO
 *
 * These types follow Schema.org specifications for structured data
 */

// Base JSON-LD type
export interface JsonLdBase {
  '@context': 'https://schema.org';
  '@type': string;
}

// Organization Schema
export interface OrganizationSchema extends JsonLdBase {
  '@type': 'Organization';
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
  contactPoint?: {
    '@type': 'ContactPoint';
    contactType: string;
    email?: string;
  };
}

// WebSite Schema with SearchAction
export interface WebSiteSchema extends JsonLdBase {
  '@type': 'WebSite';
  name: string;
  url: string;
  description?: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: {
      '@type': 'EntryPoint';
      urlTemplate: string;
    };
    'query-input': string;
  };
  inLanguage?: string;
}

// Article Schema for blog posts
export interface ArticleSchema extends JsonLdBase {
  '@type': 'Article' | 'BlogPosting';
  headline: string;
  description?: string;
  image?: string | string[];
  datePublished: string;
  dateModified?: string;
  author: {
    '@type': 'Person' | 'Organization';
    name: string;
    url?: string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
    logo?: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  mainEntityOfPage?: {
    '@type': 'WebPage';
    '@id': string;
  };
  keywords?: string[];
}

// FAQ Schema
export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQPageSchema extends JsonLdBase {
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
}

// Product/Offer Schema for pricing
export interface ProductSchema extends JsonLdBase {
  '@type': 'Product';
  name: string;
  description?: string;
  image?: string;
  brand?: {
    '@type': 'Brand';
    name: string;
  };
  offers:
    | {
        '@type': 'Offer';
        price: number | string;
        priceCurrency: string;
        availability?: string;
        priceValidUntil?: string;
        url?: string;
      }
    | Array<{
        '@type': 'Offer';
        price: number | string;
        priceCurrency: string;
        availability?: string;
        name?: string;
        description?: string;
      }>;
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
}

// SoftwareApplication Schema
export interface SoftwareApplicationSchema extends JsonLdBase {
  '@type': 'SoftwareApplication' | 'WebApplication';
  name: string;
  description?: string;
  applicationCategory: string;
  operatingSystem?: string;
  offers?: {
    '@type': 'Offer';
    price: number | string;
    priceCurrency: string;
  };
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
  };
  featureList?: string[];
  screenshot?: string | string[];
}

// Breadcrumb Schema
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface BreadcrumbListSchema extends JsonLdBase {
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item?: string;
  }>;
}

// VideoObject Schema
export interface VideoObjectSchema extends JsonLdBase {
  '@type': 'VideoObject';
  name: string;
  description: string;
  thumbnailUrl: string | string[];
  uploadDate: string;
  duration?: string; // ISO 8601 format (e.g., "PT1M30S")
  contentUrl?: string;
  embedUrl?: string;
  publisher?: {
    '@type': 'Organization';
    name: string;
    logo?: {
      '@type': 'ImageObject';
      url: string;
    };
  };
}
