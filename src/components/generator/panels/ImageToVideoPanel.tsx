'use client';

// src/components/generator/panels/ImageToVideoPanel.tsx

import { useTranslations } from 'next-intl';
import { useCreatorState } from '../hooks/useCreatorState';
import { DurationSelector } from '../shared/DurationSelector';
import { ImageUploader } from '../shared/ImageUploader';
import { ModelSelector } from '../shared/ModelSelector';
import { QualitySelector } from '../shared/QualitySelector';
import { StyleSelector } from '../shared/StyleSelector';

interface ImageToVideoPanelProps {
  showStyles?: boolean;
  className?: string;
}

function SectionLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2 block">
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </span>
  );
}

export function ImageToVideoPanel({
  showStyles = true,
  className,
}: ImageToVideoPanelProps) {
  const t = useTranslations('Generator.panels.imageToVideo');
  const {
    mode,
    model,
    setModel,
    setParam,
    duration,
    quality,
    style,
    sourceImage,
    isGenerating,
  } = useCreatorState();

  return (
    <div className={className}>
      <div className="space-y-5">
        {/* Model Selection */}
        <div>
          <SectionLabel>{t('model')}</SectionLabel>
          <ModelSelector
            mode={mode}
            value={model}
            onChange={setModel}
            disabled={isGenerating}
          />
        </div>

        {/* Image Upload */}
        <div>
          <SectionLabel required>{t('sourceImage')}</SectionLabel>
          <ImageUploader
            value={sourceImage}
            onChange={(v) => setParam('sourceImage', v)}
            disabled={isGenerating}
          />
        </div>

        {/* Art Style Selection */}
        {showStyles && (
          <div>
            <SectionLabel>{t('style')}</SectionLabel>
            <StyleSelector
              value={style}
              onChange={(v) => setParam('style', v)}
              disabled={isGenerating}
            />
          </div>
        )}

        {/* Duration & Quality */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <SectionLabel>{t('duration')}</SectionLabel>
            <DurationSelector
              value={duration}
              onChange={(v) => setParam('duration', v)}
              disabled={isGenerating}
            />
          </div>

          <div>
            <SectionLabel>{t('quality')}</SectionLabel>
            <QualitySelector
              value={quality}
              onChange={(v) => setParam('quality', v)}
              disabled={isGenerating}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
