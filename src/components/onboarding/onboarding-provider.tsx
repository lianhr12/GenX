'use client';

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
 */
export function OnboardingProvider({ children }: OnboardingProviderProps) {
  return (
    <>
      {children}
      <WelcomeDialog />
    </>
  );
}
