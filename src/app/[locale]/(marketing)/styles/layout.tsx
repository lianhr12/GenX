import Container from '@/components/layout/container';
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
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const st = await getTranslations({ locale, namespace: 'StylesPage' });

  return constructMetadata({
    title: st('seo.title') + ' | ' + t('title'),
    description: st('seo.description'),
    locale,
    pathname: '/styles',
  });
}

export default function StylesLayout({ children }: PropsWithChildren) {
  return (
    <Container className="py-16 px-4">
      <div className="mx-auto max-w-6xl">{children}</div>
    </Container>
  );
}
