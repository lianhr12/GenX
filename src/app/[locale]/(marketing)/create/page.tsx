import { CreatePageClient } from '@/components/create';
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

  const ct = await getTranslations({ locale, namespace: 'CreatePage' });

  return constructMetadata({
    title: ct('seo.title') + ' | ' + t('title'),
    description: ct('seo.description'),
    locale,
    pathname: '/create',
  });
}

export default function CreatePage() {
  return <CreatePageClient />;
}
