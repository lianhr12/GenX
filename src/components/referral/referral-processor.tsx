'use client';

import {
  payReferralRegistrationRewardAction,
  processReferralAction,
} from '@/actions/referral';
import { authClient } from '@/lib/auth-client';
import { useEffect, useRef } from 'react';

/**
 * Referral Processor Component
 * Automatically processes referral relationships for logged-in users
 * This component should be placed in the root layout
 */
export function ReferralProcessor() {
  const { data: session, isPending } = authClient.useSession();
  const processedRef = useRef(false);

  useEffect(() => {
    // Only process once per session
    if (processedRef.current) return;
    if (isPending) return;
    if (!session?.user) return;

    processedRef.current = true;

    // Process referral relationship
    const processReferral = async () => {
      try {
        // First, try to create the referral relationship from cookie
        const result = await processReferralAction();
        if (result.success) {
          console.log('Referral processed successfully');
        }

        // If user's email is verified, try to pay the registration reward
        // This handles the case where user was referred but reward wasn't paid yet
        if (session.user.emailVerified) {
          const rewardResult = await payReferralRegistrationRewardAction();
          if (rewardResult.success) {
            console.log('Referral registration reward paid');
          }
        }
      } catch (error) {
        console.error('Error processing referral:', error);
      }
    };

    processReferral();
  }, [session, isPending]);

  // This component doesn't render anything
  return null;
}
