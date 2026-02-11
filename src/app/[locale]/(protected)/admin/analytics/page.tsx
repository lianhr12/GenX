import {
  AnalyticsHeader,
  FunnelChart,
  StatsCards,
  TrendChart,
} from '@/components/admin/analytics';
import {
  type TimeRange,
  getFunnelData,
  getStats,
  getTrendData,
} from '@/lib/admin/analytics';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

interface AnalyticsPageProps {
  searchParams: Promise<{ range?: string }>;
}

const VALID_RANGES: TimeRange[] = ['1d', '7d', '30d', '90d', 'all'];

export default async function AnalyticsPage({
  searchParams,
}: AnalyticsPageProps) {
  const params = await searchParams;
  const range: TimeRange = VALID_RANGES.includes(params.range as TimeRange)
    ? (params.range as TimeRange)
    : '7d';

  const t = await getTranslations('Dashboard.admin.analytics');

  const [stats, funnelData, trendData] = await Promise.all([
    getStats(range),
    getFunnelData(range),
    getTrendData(range),
  ]);

  const timeRangeLabels: Record<TimeRange, string> = {
    '1d': t('timeRange.1d'),
    '7d': t('timeRange.7d'),
    '30d': t('timeRange.30d'),
    '90d': t('timeRange.90d'),
    all: t('timeRange.all'),
  };

  const funnelLabels: Record<string, string> = {
    registered: t('funnel.registered'),
    firstCreation: t('funnel.firstCreation'),
    firstSuccess: t('funnel.firstSuccess'),
  };

  const trendLabels = {
    registrations: t('trend.registrations'),
    creations: t('trend.creations'),
    completions: t('trend.completions'),
  };

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <Suspense>
        <AnalyticsHeader
          title={t('title')}
          description={t('description')}
          labels={timeRangeLabels}
          currentRange={range}
        />
      </Suspense>

      <StatsCards
        stats={stats}
        labels={{
          totalUsers: t('stats.totalUsers'),
          totalPayments: t('stats.totalPayments'),
          totalMedia: t('stats.totalMedia'),
          totalVideos: t('stats.totalVideos'),
          videos: t('stats.videos'),
          images: t('stats.images'),
          creationConversion: t('stats.creationConversion'),
          paymentConversion: t('stats.paymentConversion'),
          mediaSuccessRate: t('stats.mediaSuccessRate'),
          inactiveUsers: t('stats.inactiveUsers'),
        }}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <FunnelChart
          data={funnelData}
          title={t('funnel.title')}
          description={t('funnel.description')}
          labels={funnelLabels}
        />
        <TrendChart
          data={trendData}
          title={t('trend.title')}
          description={t('trend.description')}
          labels={trendLabels}
        />
      </div>
    </div>
  );
}
