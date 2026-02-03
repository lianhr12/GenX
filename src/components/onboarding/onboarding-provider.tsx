'use client';

import { ReferralProcessor } from '@/components/referral/referral-processor';
import type { ReactNode } from 'react';
import { WelcomeDialog } from './welcome-dialog';

interface OnboardingProviderProps {
  children: ReactNode;
}

/**
 * Onboarding Provider Component
 * Wraps children with onboarding components like welcome dialog
 * Must be used as a client component wrapper
 *
 * WelcomeDialog automatically checks user login status via authClient
 * ReferralProcessor handles referral relationships for new users
 */
export function OnboardingProvider({ children }: OnboardingProviderProps) {
  return (
    <>
      {children}
      <WelcomeDialog />
      <ReferralProcessor />
    </>
  );
}
