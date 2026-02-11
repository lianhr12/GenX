import type { AnalyticsStats } from '@/lib/admin/analytics';
import {
  CreditCardIcon,
  ImageIcon,
  LayersIcon,
  PercentIcon,
  TrendingUpIcon,
  UserMinusIcon,
  UsersIcon,
} from 'lucide-react';
import { StatCard } from './stat-card';

interface StatsCardsLabels {
  totalUsers: string;
  totalPayments: string;
  totalMedia: string;
  totalVideos: string;
  videos: string;
  images: string;
  creationConversion: string;
  paymentConversion: string;
  mediaSuccessRate: string;
  inactiveUsers: string;
}

interface StatsCardsProps {
  stats: AnalyticsStats;
  labels: StatsCardsLabels;
}

export function StatsCards({ stats, labels }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title={labels.totalUsers}
        value={stats.totalUsers}
        icon={UsersIcon}
      />
      <StatCard
        title={labels.totalPayments}
        value={stats.totalPayments}
        icon={CreditCardIcon}
      />
      <StatCard
        title={labels.totalMedia}
        value={stats.totalMedia}
        description={`${labels.videos}: ${stats.totalVideos} | ${labels.images}: ${stats.totalImages}`}
        icon={LayersIcon}
      />
      <StatCard
        title={labels.mediaSuccessRate}
        value={`${(stats.mediaSuccessRate * 100).toFixed(1)}%`}
        icon={ImageIcon}
      />
      <StatCard
        title={labels.creationConversion}
        value={`${(stats.creationConversion * 100).toFixed(1)}%`}
        icon={TrendingUpIcon}
      />
      <StatCard
        title={labels.paymentConversion}
        value={`${(stats.paymentConversion * 100).toFixed(1)}%`}
        icon={PercentIcon}
      />
      <StatCard
        title={labels.inactiveUsers}
        value={stats.inactiveUsers}
        icon={UserMinusIcon}
      />
    </div>
  );
}
