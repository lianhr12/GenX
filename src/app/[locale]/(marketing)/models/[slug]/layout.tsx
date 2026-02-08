import { getModelPageBySlug, validModelSlugs } from '@/config/model-pages';
import { constructMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import type { PropsWithChildren } from 'react';

export async function generateStaticParams() {
  return validModelSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata | undefined> {
  const { locale, slug } = await params;

  const config = getModelPageBySlug(slug);
  if (!config) {
    return;
  }

  const t = await getTranslations({ locale, namespace: config.i18nPrefix as never });

  return constructMetadata({
    title: t('seo.title' as never),
    description: t('seo.description' as never),
    locale,
    pathname: `/models/${slug}`,
    keywords: config.seo.keywords,
  });
}

export default function ModelDetailLayout({ children }: PropsWithChildren) {
  return <>{children}</>;
}
