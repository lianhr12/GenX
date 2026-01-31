import { GalleryPageClient } from '@/components/gallery';
import Container from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/navigation';
import { constructMetadata } from '@/lib/metadata';
import { GalleryHorizontalEndIcon, SparklesIcon } from 'lucide-react';
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
    title: 'Creator Gallery - Art Videos | ' + t('title'),
    description:
      'Explore stunning art videos created by our community. Get inspired by Cyberpunk, Watercolor, Oil Painting, Anime, and Fluid Art styles.',
    locale,
    pathname: '/gallery',
  });
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'GalleryPage' });

  return (
    <Container className="py-16 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <GalleryHorizontalEndIcon className="size-4" />
            {t('badge')}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        {/* Gallery Client Component */}
        <GalleryPageClient />

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="inline-flex flex-col items-center p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 border">
            <SparklesIcon className="size-12 text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t('cta.title')}</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              {t('cta.description')}
            </p>
            <Button asChild size="lg">
              <LocaleLink href="/create/image-to-video">
                {t('cta.button')}
              </LocaleLink>
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
