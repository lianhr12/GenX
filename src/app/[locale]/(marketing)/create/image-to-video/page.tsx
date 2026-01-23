import { PageBreadcrumb, SoftwareSchema } from '@/components/seo';
import { ToolPageLayout } from '@/components/tool';
import { getToolPageConfig } from '@/config/tool-pages';
import { getUserCredits } from '@/credits/credits';
import { auth } from '@/lib/auth';
import { constructMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';

const config = getToolPageConfig('image-to-video');

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
    pathname: '/create/image-to-video',
    keywords: config.seo.keywords,
  });
}

export default async function ImageToVideoPage() {
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
          reviewCount: 1250,
        }}
      />

      {/* Breadcrumb Navigation */}
      <div className="container mx-auto px-4 pt-4">
        <PageBreadcrumb
          items={[
            { label: 'Create', href: '/create' },
            { label: 'Image to Video' },
          ]}
        />
      </div>

      <ToolPageLayout
        toolType="image-to-video"
        isLoggedIn={!!session?.user}
        userCredits={userCredits}
      />
    </>
  );
}
