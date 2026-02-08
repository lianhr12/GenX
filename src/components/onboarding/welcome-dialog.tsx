'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LocaleLink } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client';
import { useOnboardingStore } from '@/stores/onboarding-store';
import {
  ArrowRight,
  ImageIcon,
  PaletteIcon,
  SparklesIcon,
  VideoIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

const steps = [
  {
    id: 'upload',
    icon: ImageIcon,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'style',
    icon: PaletteIcon,
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'generate',
    icon: VideoIcon,
    gradient: 'from-orange-500 to-yellow-500',
  },
];

/**
 * Welcome Dialog Component
 * Automatically shows for logged-in users who haven't seen the onboarding
 * Uses authClient to check login status
 */
export function WelcomeDialog() {
  const t = useTranslations('Onboarding.welcome');
  const { hasSeenWelcome, completeWelcome } = useOnboardingStore();
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isLoggedIn = !!session?.user;
  const userName = session?.user?.name;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Show dialog only for logged-in users who haven't seen it
    if (mounted && !isPending && isLoggedIn && !hasSeenWelcome) {
      // Small delay to allow page to load first
      const timer = setTimeout(() => {
        setOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [mounted, isPending, isLoggedIn, hasSeenWelcome]);

  const handleClose = () => {
    setOpen(false);
    completeWelcome();
  };

  const handleStartCreating = () => {
    handleClose();
  };

  if (!mounted || isPending) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-lg" showCloseButton={false}>
        <DialogHeader className="text-center sm:text-center">
          {/* Welcome Icon */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20">
            <SparklesIcon className="h-8 w-8 text-primary" />
          </div>

          <DialogTitle className="text-2xl">
            {t('title', { name: userName || t('defaultName') })}
          </DialogTitle>
          <DialogDescription className="text-base">
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        {/* Steps */}
        <div className="my-6 space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className="flex items-center gap-4 rounded-xl border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${step.gradient}`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                    <h4 className="font-semibold">
                      {t(`steps.${step.id}.title` as Parameters<typeof t>[0])}
                    </h4>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(
                      `steps.${step.id}.description` as Parameters<typeof t>[0]
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Free credits highlight */}
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-center">
          <p className="text-sm font-medium text-primary">{t('freeCredits')}</p>
        </div>

        <DialogFooter className="mt-4 sm:justify-center">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto"
            onClick={handleStartCreating}
          >
            <LocaleLink href="/create">
              {t('startButton')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </LocaleLink>
          </Button>
        </DialogFooter>

        {/* Skip option */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleClose}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('skipButton')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
