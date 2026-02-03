import { ToolPageLayout } from '@/components/generator/layouts/ToolPageLayout';
import { PageBreadcrumb, SoftwareSchema } from '@/components/seo';
import { getToolPageConfig } from '@/config/tool-pages';
import { constructMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

const config = getToolPageConfig('image');

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return constructMetadata({
    title: config.seo.title + ' | ' + t('title'),
    description: config.seo.description,
    locale,
    pathname: '/create/image',
    keywords: config.seo.keywords,
  });
}

export default function AIImagePage() {
  return (
    <>
      {/* JSON-LD SoftwareApplication Schema for SEO */}
      <SoftwareSchema
        name={config.seo.title}
        description={config.seo.description}
        applicationCategory="MultimediaApplication"
        price={0}
        features={config.landing.features}
        aggregateRating={{
          ratingValue: 4.8,
          reviewCount: 850,
        }}
      />

      {/* Breadcrumb Navigation */}
      <div className="container mx-auto px-4 pt-4">
        <PageBreadcrumb
          items={[{ label: 'Create', href: '/create' }, { label: 'AI Image' }]}
        />
      </div>

      <ToolPageLayout mode="text-to-image" />
    </>
  );
}
