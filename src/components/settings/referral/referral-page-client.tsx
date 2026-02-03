'use client';

import {
  getReferralCodeAction,
  getReferralHistoryAction,
  getReferralStatsAction,
} from '@/actions/referral';
import { authClient } from '@/lib/auth-client';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { ReferralCodeCard } from './referral-code-card';
import { ReferralHistoryTable } from './referral-history-table';
import { ReferralStatsCard } from './referral-stats-card';

interface ReferralStats {
  totalReferrals: number;
  registeredReferrals: number;
  purchasedReferrals: number;
  totalCreditsEarned: number;
}

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

/**
 * Referral page client component
 */
export default function ReferralPageClient() {
  const t = useTranslations('Dashboard.settings.referral');
  const { data: session } = authClient.useSession();

  const [referralCode, setReferralCode] = useState<string>('');
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [history, setHistory] = useState<ReferralHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all data in parallel
        const [codeResult, statsResult, historyResult] = await Promise.all([
          getReferralCodeAction(),
          getReferralStatsAction(),
          getReferralHistoryAction(),
        ]);

        if (codeResult.success && codeResult.code) {
          setReferralCode(codeResult.code);
        }

        if (statsResult.success && statsResult.stats) {
          setStats(statsResult.stats);
        }

        if (historyResult.success && historyResult.history) {
          setHistory(historyResult.history);
        }
      } catch (error) {
        console.error('Failed to fetch referral data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session?.user]);

  const referralLink = referralCode
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/ref/${referralCode}`
    : '';

  return (
    <div className="flex flex-col gap-8">
      {/* Referral Code and Link */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReferralCodeCard
          code={referralCode}
          link={referralLink}
          isLoading={isLoading}
        />
        <ReferralStatsCard stats={stats} isLoading={isLoading} />
      </div>

      {/* Referral History */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{t('history.title')}</h2>
        <ReferralHistoryTable history={history} isLoading={isLoading} />
      </div>
    </div>
  );
}
