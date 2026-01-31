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

  return constructMetadata({
    title: 'Art Styles - 5 Unique Styles | ' + t('title'),
    description:
      'Explore our 5 unique art styles: Cyberpunk, Watercolor, Oil Painting, Anime, and Fluid Art. Each style is carefully tuned to make your work stand out.',
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
