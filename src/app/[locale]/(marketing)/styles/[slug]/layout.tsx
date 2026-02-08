import { artStylesUI, validStyleSlugs } from '@/config/art-styles-ui';
import { constructMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import type { PropsWithChildren } from 'react';

export async function generateStaticParams() {
  return validStyleSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata | undefined> {
  const { locale, slug } = await params;

  if (!validStyleSlugs.includes(slug)) {
    return;
  }

  const style = artStylesUI.find((s) => s.slug === slug);
  if (!style) {
    return;
  }

  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const st = await getTranslations({ locale, namespace: 'StylesPage' });

  const styleTitle = st(`styles.${slug}.title` as never);
  const styleDesc = st(`styles.${slug}.description` as never);

  return constructMetadata({
    title: st('seo.detailTitle', { style: styleTitle }) + ' | ' + t('title'),
    description: st('seo.detailDescription', { style: styleTitle, description: styleDesc }),
    locale,
    pathname: `/styles/${slug}`,
    keywords: style.seoKeywords,
  });
}

export default function StyleDetailLayout({ children }: PropsWithChildren) {
  return <>{children}</>;
}
