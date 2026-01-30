import { ImageHistoryList } from '@/components/creations/image-history-list';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { auth } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Image History Page
 *
 * Shows all user's generated images with filtering and management options
 */
export default async function ImagesPage() {
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
      label: t('creations.images.title'),
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
              {t('creations.images.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('creations.images.description')}
            </p>
          </div>
          <ImageHistoryList />
        </div>
      </div>
    </>
  );
}
