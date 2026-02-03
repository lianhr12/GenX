'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { REFERRAL_CONFIG } from '@/lib/referral-config';
import { useTranslations } from 'next-intl';

interface ReferralHistoryItem {
  id: string;
  referredEmail: string;
  status: string;
  registrationRewardPaid: boolean;
  purchaseRewardPaid: boolean;
  createdAt: Date;
  registeredAt: Date | null;
  purchasedAt: Date | null;
}

interface ReferralHistoryTableProps {
  history: ReferralHistoryItem[];
  isLoading: boolean;
}

export function ReferralHistoryTable({
  history,
  isLoading,
}: ReferralHistoryTableProps) {
  const t = useTranslations('Dashboard.settings.referral');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">{t('status.pending')}</Badge>;
      case 'registered':
        return <Badge variant="default">{t('status.registered')}</Badge>;
      case 'purchased':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            {t('status.purchased')}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRewardAmount = (item: ReferralHistoryItem) => {
    let total = 0;
    if (item.registrationRewardPaid) {
      total += REFERRAL_CONFIG.registrationReward;
    }
    if (item.purchaseRewardPaid) {
      total += REFERRAL_CONFIG.purchaseReward;
    }
    return total;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('history.user')}</TableHead>
                <TableHead>{t('history.status')}</TableHead>
                <TableHead>{t('history.reward')}</TableHead>
                <TableHead>{t('history.date')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {t('history.empty')}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('history.user')}</TableHead>
              <TableHead>{t('history.status')}</TableHead>
              <TableHead>{t('history.reward')}</TableHead>
              <TableHead>{t('history.date')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-sm">
                  {item.referredEmail}
                </TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell>
                  {getRewardAmount(item) > 0 ? (
                    <span className="text-green-600 font-medium">
                      +{getRewardAmount(item)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">0</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(item.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
