'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useOnboardingStore } from '@/stores/onboarding-store';
import {
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface ToolGuideProps {
  isLoggedIn: boolean;
  toolType: 'image-to-video' | 'text-to-video' | 'reference-to-video';
}

const guideSteps = [
  {
    id: 'upload',
    targetSelector: '[data-guide="upload"]',
    position: 'right' as const,
  },
  {
    id: 'style',
    targetSelector: '[data-guide="style"]',
    position: 'right' as const,
  },
  {
    id: 'prompt',
    targetSelector: '[data-guide="prompt"]',
    position: 'right' as const,
  },
  {
    id: 'generate',
    targetSelector: '[data-guide="generate"]',
    position: 'top' as const,
  },
];

export function ToolGuide({ isLoggedIn, toolType }: ToolGuideProps) {
  const t = useTranslations('Onboarding.toolGuide');
  const {
    hasSeenToolGuide,
    toolGuideStep,
    setToolGuideStep,
    completeToolGuide,
  } = useOnboardingStore();
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Show guide for logged-in users who haven't seen it
    if (mounted && isLoggedIn && !hasSeenToolGuide) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setCurrentStep(toolGuideStep || 0);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [mounted, isLoggedIn, hasSeenToolGuide, toolGuideStep]);

  const handleNext = () => {
    if (currentStep < guideSteps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setToolGuideStep(nextStep);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setToolGuideStep(prevStep);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    completeToolGuide();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!mounted || !isVisible) return null;

  const step = guideSteps[currentStep];
  const isLastStep = currentStep === guideSteps.length - 1;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/60 transition-opacity"
        onClick={handleSkip}
      />

      {/* Guide Card - Fixed position for simplicity */}
      <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 w-[90%] max-w-md">
        <div className="relative rounded-xl border bg-background p-6 shadow-2xl">
          {/* Close button */}
          <button
            type="button"
            onClick={handleSkip}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <XIcon className="h-4 w-4" />
          </button>

          {/* Progress indicators */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {guideSteps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  index === currentStep
                    ? 'w-8 bg-primary'
                    : index < currentStep
                      ? 'w-2 bg-primary/50'
                      : 'w-2 bg-muted-foreground/30'
                )}
              />
            ))}
          </div>

          {/* Step content */}
          <div className="text-center mb-6">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <span className="text-2xl font-bold text-primary">
                {currentStep + 1}
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {t(`steps.${step.id}.title` as Parameters<typeof t>[0])}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t(`steps.${step.id}.description` as Parameters<typeof t>[0])}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={cn(currentStep === 0 && 'invisible')}
            >
              <ChevronLeftIcon className="mr-1 h-4 w-4" />
              {t('prev')}
            </Button>

            <button
              type="button"
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('skip')}
            </button>

            <Button size="sm" onClick={handleNext}>
              {isLastStep ? (
                <>
                  <CheckCircle2Icon className="mr-1 h-4 w-4" />
                  {t('done')}
                </>
              ) : (
                <>
                  {t('next')}
                  <ChevronRightIcon className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
