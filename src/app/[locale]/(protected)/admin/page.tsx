import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getDashboardStats } from '@/lib/admin/analytics';
import { Routes } from '@/routes';
import {
  ActivityIcon,
  BarChart3Icon,
  CheckCircle2Icon,
  CreditCardIcon,
  GalleryHorizontalEndIcon,
  ImageIcon,
  LayersIcon,
  LoaderIcon,
  Settings2Icon,
  UsersIcon,
  UsersRoundIcon,
  VideoIcon,
  XCircleIcon,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const t = await getTranslations('Dashboard.admin');
  const stats = await getDashboardStats();

  const breadcrumbs = [
    { label: t('title'), isCurrentPage: false },
    { label: t('dashboard.title'), isCurrentPage: true },
  ];

  return (
    <>
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-6 px-4 py-4 md:px-6 md:py-6">
            {/* Core Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title={t('dashboard.totalUsers')}
                value={stats.totalUsers}
                delta={`+${stats.recentUsers}`}
                deltaLabel={t('dashboard.last7Days')}
                icon={<UsersIcon className="size-4 text-muted-foreground" />}
              />
              <StatCard
                title={t('dashboard.totalMedia')}
                value={stats.totalMedia}
                delta={`+${stats.recentMedia}`}
                deltaLabel={t('dashboard.last7Days')}
                icon={<LayersIcon className="size-4 text-muted-foreground" />}
              />
              <StatCard
                title={t('dashboard.totalPayments')}
                value={stats.totalPayments}
                delta={`+${stats.recentPayments}`}
                deltaLabel={t('dashboard.last7Days')}
                icon={<CreditCardIcon className="size-4 text-muted-foreground" />}
              />
              <StatCard
                title={t('dashboard.successRate')}
                value={`${(stats.mediaSuccessRate * 100).toFixed(1)}%`}
                icon={<ActivityIcon className="size-4 text-muted-foreground" />}
              />
            </div>

            {/* Media Status - combined into one card */}
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <VideoIcon className="size-4 text-muted-foreground" />
                    <CardTitle className="text-base">{t('dashboard.videoStatus')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    <StatusItem
                      color="green"
                      label={t('dashboard.completed')}
                      value={stats.videoStatusCounts.completed}
                    />
                    <StatusItem
                      color="red"
                      label={t('dashboard.failed')}
                      value={stats.videoStatusCounts.failed}
                    />
                    <StatusItem
                      color="blue"
                      label={t('dashboard.processing')}
                      value={stats.videoStatusCounts.processing}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="size-4 text-muted-foreground" />
                    <CardTitle className="text-base">{t('dashboard.imageStatus')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    <StatusItem
                      color="green"
                      label={t('dashboard.completed')}
                      value={stats.imageStatusCounts.completed}
                    />
                    <StatusItem
                      color="red"
                      label={t('dashboard.failed')}
                      value={stats.imageStatusCounts.failed}
                    />
                    <StatusItem
                      color="blue"
                      label={t('dashboard.generating')}
                      value={stats.imageStatusCounts.generating}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="mb-3 font-semibold text-sm text-muted-foreground">
                {t('dashboard.quickActions')}
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <QuickAction
                  href={Routes.AdminUsers}
                  icon={<UsersRoundIcon className="size-4" />}
                  label={t('users.title')}
                />
                <QuickAction
                  href={Routes.AdminImages}
                  icon={<ImageIcon className="size-4" />}
                  label={t('images.title')}
                />
                <QuickAction
                  href={Routes.AdminGallery}
                  icon={<GalleryHorizontalEndIcon className="size-4" />}
                  label={t('gallery.title')}
                />
                <QuickAction
                  href={Routes.AdminAnalytics}
                  icon={<BarChart3Icon className="size-4" />}
                  label={t('analytics.title')}
                />
                <QuickAction
                  href={Routes.AdminSettings}
                  icon={<Settings2Icon className="size-4" />}
                  label={t('adminSettings.title')}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
function StatCard({
  title,
  value,
  delta,
  deltaLabel,
  icon,
}: {
  title: string;
  value: string | number;
  delta?: string;
  deltaLabel?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription>{title}</CardDescription>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="font-bold text-2xl">{value}</div>
        {delta && (
          <p className="mt-1 text-muted-foreground text-xs">
            {delta} {deltaLabel}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

const statusColors = {
  green: 'bg-green-500/10 text-green-500',
  red: 'bg-red-500/10 text-red-500',
  blue: 'bg-blue-500/10 text-blue-500',
} as const;

function StatusItem({
  color,
  label,
  value,
}: {
  color: keyof typeof statusColors;
  label: string;
  value: number;
}) {
  return (
    <div className={`rounded-lg p-3 ${statusColors[color]}`}>
      <p className="font-bold text-2xl">{value}</p>
      <p className="text-xs opacity-80">{label}</p>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="flex items-center gap-2 px-4 py-3">
          {icon}
          <span className="font-medium text-sm">{label}</span>
        </CardContent>
      </Card>
    </Link>
  );
}
