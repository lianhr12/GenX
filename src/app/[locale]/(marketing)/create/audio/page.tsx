import { ToolPageLayout } from '@/components/generator/layouts/ToolPageLayout';
import { PageBreadcrumb } from '@/components/seo';
import { constructMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const pt = await getTranslations({ locale, namespace: 'AIAudioPage' });

  return constructMetadata({
    title: pt('title') + ' | ' + t('title'),
    description: pt('description'),
    locale,
    pathname: '/create/audio',
  });
}

export default function AIAudioPage() {
  return (
    <>
      {/* Breadcrumb Navigation */}
      <div className="container mx-auto px-4 pt-4">
        <PageBreadcrumb
          items={[{ label: 'Create', href: '/create' }, { label: 'AI Audio' }]}
        />
      </div>

      <ToolPageLayout mode="audio" />
    </>
  );
}
