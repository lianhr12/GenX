'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CoinsIcon,
  ShoppingCartIcon,
  UserCheckIcon,
  UsersIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ReferralStats {
  totalReferrals: number;
  registeredReferrals: number;
  purchasedReferrals: number;
  totalCreditsEarned: number;
}

interface ReferralStatsCardProps {
  stats: ReferralStats | null;
  isLoading: boolean;
}

export function ReferralStatsCard({
  stats,
  isLoading,
}: ReferralStatsCardProps) {
  const t = useTranslations('Dashboard.settings.referral');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const statItems = [
    {
      label: t('stats.totalReferrals'),
      value: stats?.totalReferrals ?? 0,
      icon: UsersIcon,
      color: 'text-blue-500',
    },
    {
      label: t('stats.registeredReferrals'),
      value: stats?.registeredReferrals ?? 0,
      icon: UserCheckIcon,
      color: 'text-green-500',
    },
    {
      label: t('stats.purchasedReferrals'),
      value: stats?.purchasedReferrals ?? 0,
      icon: ShoppingCartIcon,
      color: 'text-purple-500',
    },
    {
      label: t('stats.totalCredits'),
      value: stats?.totalCreditsEarned ?? 0,
      icon: CoinsIcon,
      color: 'text-yellow-500',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CoinsIcon className="h-5 w-5" />
          {t('stats.title')}
        </CardTitle>
        <CardDescription>{t('stats.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {statItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex flex-col space-y-1 p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className={`h-4 w-4 ${item.color}`} />
                  {item.label}
                </div>
                <div className="text-2xl font-bold">{item.value}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
