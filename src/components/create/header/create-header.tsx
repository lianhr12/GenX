'use client';

import { CreditsBalanceButton } from '@/components/layout/credits-balance-button';
import { useSession } from '@/hooks/use-session';
import { useTranslations } from 'next-intl';

export function CreateHeader() {
  const t = useTranslations('CreatePageNew');
  const session = useSession();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">{t('header.title')}</h1>
        </div>

        <div className="flex items-center gap-3">
          {session?.user && <CreditsBalanceButton />}
        </div>
      </div>
    </header>
  );
}
