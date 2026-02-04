'use client';

import { GenXCreator } from '@/components/generator';
import { FloatingCreator } from '@/components/generator/layouts/FloatingCreator';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FeatureBanner } from './banner/feature-banner';
import { GallerySection } from './gallery/gallery-section';
import { ModelsSection } from './models/models-section';
import { StyleTags } from './styles/style-tags';
import { VideoToolsSection } from './tools/video-tools-section';

export function CreatePageClient() {
  const inputRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [showFloating, setShowFloating] = useState(false);

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
            showStyles
            showCredits
            compact
            enableNavigation
            onAfterNavigate={(route) => {
              router.push(route);
            }}
          />
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
      {showFloating && (
        <FloatingCreator
          mode="text-to-video"
          onGenerate={async () => {
            // 导航到对应工具页面
            router.push('/create/text-to-video');
          }}
        />
      )}
    </div>
  );
}
