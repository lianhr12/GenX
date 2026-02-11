import { ToolPageLayout } from '@/components/generator/layouts/ToolPageLayout';
import { PageBreadcrumb, SoftwareSchema } from '@/components/seo';
import { getToolPageConfig } from '@/config/tool-pages';
import { constructMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

const config = getToolPageConfig('text-to-video');

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const tp = await getTranslations({
    locale,
    namespace: config.i18nPrefix as never,
  });

  return constructMetadata({
    title: tp('seo.title' as never) + ' | ' + t('title'),
    description: tp('seo.description' as never),
    locale,
    pathname: '/create/text-to-video',
    keywords: config.seo.keywords,
  });
}

export default async function TextToVideoPage() {
  const bt = await getTranslations('ToolPage');
  const tp = await getTranslations(config.i18nPrefix as never);

  return (
    <>
      {/* JSON-LD SoftwareApplication Schema for SEO */}
      <SoftwareSchema
        name={tp('seo.title' as never)}
        description={tp('seo.description' as never)}
        applicationCategory="MultimediaApplication"
        price={0}
        features={config.landing.features}
        aggregateRating={{
          ratingValue: 4.8,
          reviewCount: 1250,
        }}
      />

      {/* Breadcrumb Navigation */}
      <div className="container mx-auto px-4 pt-4">
        <PageBreadcrumb
          items={[
            { label: bt('breadcrumb.create'), href: '/create' },
            { label: bt('breadcrumb.textToVideo') },
          ]}
        />
      </div>

      <ToolPageLayout mode="text-to-video" />
    </>
  );
}
