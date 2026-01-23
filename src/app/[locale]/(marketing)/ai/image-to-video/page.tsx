import { constructMetadata } from '@/lib/metadata';
import { getToolPageConfig } from '@/config/tool-pages';
import { auth } from '@/lib/auth';
import { getUserCredits } from '@/credits/credits';
import { ToolPageLayout } from '@/components/tool';
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
    pathname: '/ai/image-to-video',
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
    <ToolPageLayout
      toolType="image-to-video"
      isLoggedIn={!!session?.user}
      userCredits={userCredits}
    />
  );
}
