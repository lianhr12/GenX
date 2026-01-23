'use client';

import { websiteConfig } from '@/config/website';
import { useLocaleRouter } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client';
import { getUrlWithLocale } from '@/lib/urls/urls';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';
import { useLocale } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

/**
 * Hook to trigger Google One Tap login
 *
 * This hook will display the Google One Tap prompt for unauthenticated users
 * when Google login and One Tap are both enabled in the website config.
 *
 * @see https://www.better-auth.com/docs/plugins/one-tap
 */
export function useGoogleOneTap() {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const router = useLocaleRouter();
  const locale = useLocale();
  const [isPromptShown, setIsPromptShown] = useState(false);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    // Don't trigger if session is still loading
    if (isSessionPending) {
      return;
    }

    // Don't trigger if user is already logged in
    if (session?.user) {
      return;
    }

    // Don't trigger if Google login or One Tap is disabled
    if (
      !websiteConfig.auth.enableGoogleLogin ||
      !websiteConfig.auth.enableGoogleOneTap
    ) {
      return;
    }

    // Don't trigger if NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      console.warn(
        'Google One Tap: NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured'
      );
      return;
    }

    // Prevent multiple triggers
    if (hasTriggeredRef.current) {
      return;
    }

    hasTriggeredRef.current = true;

    const showOneTap = async () => {
      try {
        const callbackURL = getUrlWithLocale(DEFAULT_LOGIN_REDIRECT, locale);

        await authClient.oneTap({
          callbackURL,
          fetchOptions: {
            onSuccess: () => {
              console.log('Google One Tap: Login successful');
              router.push(DEFAULT_LOGIN_REDIRECT);
              router.refresh();
            },
            onError: (ctx) => {
              console.error('Google One Tap: Login error', ctx.error);
            },
          },
          onPromptNotification: (notification) => {
            // This is called when the prompt is dismissed or skipped
            // after max attempts have been reached
            console.log('Google One Tap: Prompt notification', notification);
            setIsPromptShown(false);
          },
        });
        setIsPromptShown(true);
      } catch (error) {
        console.error('Google One Tap: Error displaying prompt', error);
        setIsPromptShown(false);
      }
    };

    showOneTap();
  }, [session, isSessionPending, router, locale]);

  return { isPromptShown };
}
