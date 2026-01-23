import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
  // Whether user has completed the welcome dialog
  hasSeenWelcome: boolean;
  // Whether user has seen the tool page guide
  hasSeenToolGuide: boolean;
  // Current step in the tool guide (0 = not started)
  toolGuideStep: number;
  // Actions
  completeWelcome: () => void;
  completeToolGuide: () => void;
  setToolGuideStep: (step: number) => void;
  resetOnboarding: () => void;
}

/**
 * Onboarding store with localStorage persistence
 * Tracks user's progress through the onboarding flow
 */
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasSeenWelcome: false,
      hasSeenToolGuide: false,
      toolGuideStep: 0,
      completeWelcome: () => set({ hasSeenWelcome: true }),
      completeToolGuide: () =>
        set({ hasSeenToolGuide: true, toolGuideStep: 0 }),
      setToolGuideStep: (step) => set({ toolGuideStep: step }),
      resetOnboarding: () =>
        set({
          hasSeenWelcome: false,
          hasSeenToolGuide: false,
          toolGuideStep: 0,
        }),
    }),
    {
      name: 'genx-onboarding',
    }
  )
);
