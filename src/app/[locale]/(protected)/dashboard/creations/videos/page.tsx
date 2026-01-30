import { VideoHistoryList } from '@/components/creations/video-history-list';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { auth } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Video History Page
 *
 * Shows all user's generated videos with filtering and management options
 */
export default async function VideosPage() {
  const t = await getTranslations('Dashboard');

  // Get session from headers
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const breadcrumbs = [
    {
      label: t('dashboard.title'),
      href: '/dashboard',
    },
    {
      label: t('creations.title'),
    },
    {
      label: t('creations.videos.title'),
      isCurrentPage: true,
    },
  ];

  return (
    <>
      <DashboardHeader breadcrumbs={breadcrumbs} />

      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-6 p-6">
          <div>
            <h1 className="text-2xl font-bold">
              {t('creations.videos.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('creations.videos.description')}
            </p>
          </div>
          <VideoHistoryList />
        </div>
      </div>
    </>
  );
}
