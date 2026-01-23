import type { Locale } from 'next-intl';
import { redirect } from 'next/navigation';

/**
 * Video page - redirects to text-to-video
 */
export default async function AIVideoPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/create/text-to-video`);
}
