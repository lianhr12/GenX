'use client';

import { GenXCreator } from '@/components/generator';
import type { CreatorMode } from '@/components/generator/types';
import { defaultQuickStyles } from '@/config/create';
import { useCallback, useEffect, useRef, useState } from 'react';
// import { FeatureBanner } from './banner/feature-banner';
import { GallerySection } from './gallery/gallery-section';
import { ModelsSection } from './models/models-section';
// import { VideoToolsSection } from './tools/video-tools-section';

export function CreatePageClient() {
  const inputRef = useRef<HTMLDivElement>(null);
  const [showFloating, setShowFloating] = useState(false);
  const [currentMode, setCurrentMode] = useState<CreatorMode>('text-to-video');
  const handleModeChange = useCallback((mode: CreatorMode) => {
    setCurrentMode(mode);
  }, []);

  // Show floating input when main input is out of view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowFloating(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    if (inputRef.current) {
      observer.observe(inputRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Main Input Area with GenXCreator */}
        <div ref={inputRef} className="max-w-[980px] mx-auto">
          <GenXCreator
            allowedModes={[
              'text-to-video',
              'image-to-video',
              'text-to-image',
              'image-to-image',
            ]}
            modeSwitchBehavior="tabs"
            onModeChange={handleModeChange}
            showStyles
            showCredits
            compact
            quickStyles={defaultQuickStyles}
            enableNavigation
          />
        </div>

        {/* Feature Banners */}
        {/* <FeatureBanner /> */}

        {/* Video Tools */}
        {/* <VideoToolsSection /> */}

        {/* AI Models */}
        <ModelsSection />

        {/* Gallery */}
        <GallerySection />
      </main>

      {/* Floating Input Bar - 使用 GenXCreator 的 floating 模式 */}
      {showFloating && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
          <GenXCreator
            mode={currentMode}
            modeSwitchBehavior="locked"
            compact
            enableNavigation
          />
        </div>
      )}
    </div>
  );
}
