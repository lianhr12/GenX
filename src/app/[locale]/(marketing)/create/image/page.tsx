import { PageBreadcrumb, SoftwareSchema } from '@/components/seo';
import { ImageToolPageLayout } from '@/components/tool';
import { getToolPageConfig } from '@/config/tool-pages';
import { getUserCredits } from '@/credits/credits';
import { auth } from '@/lib/auth';
import { constructMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';

const config = getToolPageConfig('image');

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return constructMetadata({
    title: config.seo.title + ' | ' + t('title'),
    description: config.seo.description,
    locale,
    pathname: '/create/image',
    keywords: config.seo.keywords,
  });
}

export default async function AIImagePage() {
  // Get session from headers
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Get user credits if logged in
  let userCredits = 0;
  if (session?.user?.id) {
    userCredits = await getUserCredits(session.user.id);
  }

  return (
    <>
      {/* JSON-LD SoftwareApplication Schema for SEO */}
      <SoftwareSchema
        name={config.seo.title}
        description={config.seo.description}
        applicationCategory="MultimediaApplication"
        price={0}
        features={config.landing.features}
        aggregateRating={{
          ratingValue: 4.8,
          reviewCount: 850,
        }}
      />

      {/* Breadcrumb Navigation */}
      <div className="container mx-auto px-4 pt-4">
        <PageBreadcrumb
          items={[{ label: 'Create', href: '/create' }, { label: 'AI Image' }]}
        />
      </div>

      <ImageToolPageLayout
        config={config}
        isLoggedIn={!!session?.user}
        userCredits={userCredits}
      />
    </>
  );
}
