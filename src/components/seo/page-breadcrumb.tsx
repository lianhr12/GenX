'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { LocaleLink } from '@/i18n/navigation';
import { Home } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Fragment } from 'react';
import {
  BreadcrumbSchema,
  type BreadcrumbItem as BreadcrumbSchemaItem,
} from './json-ld';

export interface BreadcrumbNavItem {
  label: string;
  href?: string;
}

interface PageBreadcrumbProps {
  items: BreadcrumbNavItem[];
  homeLabel?: string;
}

/**
 * Page Breadcrumb Component
 *
 * Renders both visual breadcrumb navigation and JSON-LD structured data
 * Use this component on marketing pages to improve SEO and UX
 */
export function PageBreadcrumb({
  items,
  homeLabel,
}: PageBreadcrumbProps) {
  const t = useTranslations('Common');
  const resolvedHomeLabel = homeLabel || t('home');
  // Build schema items including home
  const schemaItems: BreadcrumbSchemaItem[] = [
    { name: resolvedHomeLabel, url: '/' },
    ...items.map((item) => ({
      name: item.label,
      url: item.href || '',
    })),
  ];

  return (
    <>
      {/* JSON-LD Structured Data */}
      <BreadcrumbSchema items={schemaItems} />

      {/* Visual Breadcrumb Navigation */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          {/* Home link */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <LocaleLink href="/" className="flex items-center gap-1">
                <Home className="size-3.5" />
                <span className="sr-only">{resolvedHomeLabel}</span>
              </LocaleLink>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {/* Dynamic items */}
          {items.map((item, index) => (
            <Fragment key={item.label}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {index === items.length - 1 || !item.href ? (
                  // Last item or no href - current page
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  // Intermediate item with link
                  <BreadcrumbLink asChild>
                    <LocaleLink href={item.href}>{item.label}</LocaleLink>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}
