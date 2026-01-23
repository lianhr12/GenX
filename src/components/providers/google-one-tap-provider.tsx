'use client';

import { useGoogleOneTap } from '@/hooks/use-google-one-tap';
import type { ReactNode } from 'react';

interface GoogleOneTapProviderProps {
  children: ReactNode;
}

/**
 * Google One Tap Provider
 *
 * This provider wraps the application and triggers the Google One Tap
 * login prompt for unauthenticated users when enabled.
 *
 * @see https://www.better-auth.com/docs/plugins/one-tap
 */
export function GoogleOneTapProvider({ children }: GoogleOneTapProviderProps) {
  // This hook handles all the logic for displaying the One Tap prompt
  useGoogleOneTap();

  return <>{children}</>;
}
