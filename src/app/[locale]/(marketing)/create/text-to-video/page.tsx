import { ToolPageLayout } from '@/components/tool';
import { getToolPageConfig } from '@/config/tool-pages';
import { getUserCredits } from '@/credits/credits';
import { auth } from '@/lib/auth';
import { constructMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';

const config = getToolPageConfig('text-to-video');

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
    pathname: '/create/text-to-video',
    keywords: config.seo.keywords,
  });
}

export default async function TextToVideoPage() {
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
      toolType="text-to-video"
      isLoggedIn={!!session?.user}
      userCredits={userCredits}
    />
  );
}
