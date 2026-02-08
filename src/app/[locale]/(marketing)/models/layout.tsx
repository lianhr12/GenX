import { constructMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import type { PropsWithChildren } from 'react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ModelPage' });

  return constructMetadata({
    title: t('list.seo.title'),
    description: t('list.seo.description'),
    locale,
    pathname: '/models',
    keywords: [
      'ai video models',
      'ai video generator',
      'veo 3',
      'sora 2',
      'kling ai',
      'hailuo ai',
      'seedance',
      'wan ai',
    ],
  });
}

export default function ModelsLayout({ children }: PropsWithChildren) {
  return <>{children}</>;
}
