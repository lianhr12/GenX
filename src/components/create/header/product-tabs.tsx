'use client';

import { CreditsBalanceButton } from '@/components/layout/credits-balance-button';
import type { ProductTab } from '@/config/create';
import { cn } from '@/lib/utils';
import { useSession } from '@/hooks/use-session';
import { useCreateStore } from '@/stores/create-store';
import { ImageIcon, VideoIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

const tabs: {
  id: ProductTab;
  icon: typeof VideoIcon;
  labelKey: string;
  gradient: string;
}[] = [
  {
    id: 'video',
    icon: VideoIcon,
    labelKey: 'video',
    gradient: 'from-[#350098] via-[#A10DDB] to-[#ED4F70]',
  },
  {
    id: 'image',
    icon: ImageIcon,
    labelKey: 'image',
    gradient: 'from-[#0066CC] via-[#00AAFF] to-[#00DDCC]',
  },
];

export function ProductTabs() {
  const t = useTranslations('CreatePageNew.header.tabs');
  const { activeTab, setActiveTab } = useCreateStore();
  const session = useSession();

  return (
    <div className="relative flex w-full items-start justify-between">
      {/* Tabs */}
      <div className="flex">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const zIndex = isActive ? 9 : tabs.length - index;

          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'group relative flex cursor-pointer items-center pt-2 pb-8',
                index === 0 ? 'ps-8 pe-20' : '-ms-12 ps-16 pe-20'
              )}
              style={{
                zIndex,
                filter: !isActive
                  ? 'drop-shadow(0 0 10px rgba(0,0,0,0.48))'
                  : undefined,
              }}
            >
              {/* Tab background shape */}
              <div
                className={cn(
                  'pointer-events-none absolute inset-0',
                  isActive
                    ? `bg-gradient-to-r ${tab.gradient}`
                    : 'bg-muted/80 dark:bg-muted/40'
                )}
                style={{
                  clipPath:
                    index === 0
                      ? 'polygon(0 0, calc(100% - 50px) 0, 100% 100%, 0 100%)'
                      : 'polygon(50px 0, calc(100% - 50px) 0, 100% 100%, 0 100%)',
                  borderTopLeftRadius: index === 0 ? '16px' : '0',
                }}
              />

              {/* Content */}
              <div className="relative flex items-center gap-3">
                <figure
                  className={cn(
                    'relative size-8 transition-all duration-300',
                    isActive
                      ? '-translate-y-1 scale-110 opacity-100'
                      : 'opacity-70 group-hover:opacity-100'
                  )}
                >
                  <div
                    className={cn(
                      'flex size-full items-center justify-center rounded-lg',
                      isActive ? 'bg-white/20' : 'bg-muted'
                    )}
                  >
                    <Icon
                      className={cn('size-5', isActive ? 'text-white' : '')}
                    />
                  </div>
                </figure>
                <div
                  className={cn(
                    'flex items-center gap-2',
                    isActive
                      ? 'text-white'
                      : 'text-muted-foreground group-hover:text-foreground'
                  )}
                >
                  <span className="whitespace-nowrap font-semibold">
                    {t(tab.labelKey as never)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Credits Balance - Right side */}
      {session?.user && (
        <div className="pt-2 pe-2">
          <CreditsBalanceButton />
        </div>
      )}
    </div>
  );
}
