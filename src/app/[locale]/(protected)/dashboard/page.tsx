import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { UserDashboard } from '@/components/dashboard/user-dashboard';
import { getUserCredits } from '@/credits/credits';
import { auth } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';

/**
 * Dashboard page
 *
 * Shows user's credits, recent creations, and quick actions
 */
export default async function DashboardPage() {
  const t = await getTranslations('Dashboard');

  // Get session from headers
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Get user credits if logged in
  let userCredits = 0;
  if (session?.user?.id) {
    userCredits = await getUserCredits(session.user.id);
  }

  const breadcrumbs = [
    {
      label: t('dashboard.title'),
      isCurrentPage: true,
    },
  ];

  return (
    <>
      <DashboardHeader breadcrumbs={breadcrumbs} />

      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col">
          <UserDashboard initialCredits={userCredits} />
        </div>
      </div>
    </>
  );
}
