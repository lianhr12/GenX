import { redirect } from 'next/navigation';
import type { Locale } from 'next-intl';

/**
 * Video page - redirects to text-to-video
 */
export default async function AIVideoPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/ai/text-to-video`);
}
