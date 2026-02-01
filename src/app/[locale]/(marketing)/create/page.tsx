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

  return constructMetadata({
    title: 'Create - AI Video & Image Generator | ' + t('title'),
    description:
      'Create stunning AI videos and images with multiple models. Text to video, image to video, and more AI-powered creation tools.',
    locale,
    pathname: '/create',
  });
}

export default function CreatePage() {
  return <CreatePageClient />;
}
