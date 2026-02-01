'use client';

import { useCreateStore } from '@/stores/create-store';
import { useEffect, useRef } from 'react';
import { FeatureBanner } from './banner/feature-banner';
import { FloatingInputBar } from './floating/floating-input-bar';
import { GallerySection } from './gallery/gallery-section';
import { MainInputArea } from './input/main-input-area';
import { ModelsSection } from './models/models-section';
import { StyleTags } from './styles/style-tags';
import { VideoToolsSection } from './tools/video-tools-section';

export function CreatePageClient() {
  const inputRef = useRef<HTMLDivElement>(null);
  const { setShowFloatingInput } = useCreateStore();

  // Show floating input when main input is out of view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowFloatingInput(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    if (inputRef.current) {
      observer.observe(inputRef.current);
    }

    return () => observer.disconnect();
  }, [setShowFloatingInput]);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Main Input Area with Tabs */}
        <div ref={inputRef}>
          <MainInputArea />
        </div>

        {/* Style Tags */}
        <div className="max-w-[980px] mx-auto">
          <StyleTags />
        </div>

        {/* Feature Banners */}
        <FeatureBanner />

        {/* Video Tools */}
        <VideoToolsSection />

        {/* AI Models */}
        <ModelsSection />

        {/* Gallery */}
        <GallerySection />
      </main>

      {/* Floating Input Bar */}
      <FloatingInputBar />
    </div>
  );
}
