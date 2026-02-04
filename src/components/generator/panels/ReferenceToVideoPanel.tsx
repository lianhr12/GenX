'use client';

// src/components/generator/panels/ReferenceToVideoPanel.tsx

import { useTranslations } from 'next-intl';
import { useCreatorState } from '../hooks/useCreatorState';
import { DurationSelector } from '../shared/DurationSelector';
import { ImageUploader } from '../shared/ImageUploader';
import { ModelSelector } from '../shared/ModelSelector';
import { QualitySelector } from '../shared/QualitySelector';

interface ReferenceToVideoPanelProps {
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

export function ReferenceToVideoPanel({
  className,
}: ReferenceToVideoPanelProps) {
  const t = useTranslations('Generator.panels.referenceToVideo');
  const {
    mode,
    model,
    setModel,
    setParam,
    duration,
    quality,
    referenceImage,
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
            onValueChange={setModel}
            disabled={isGenerating}
          />
        </div>

        {/* Reference Image Upload */}
        <div>
          <SectionLabel required>{t('referenceImage')}</SectionLabel>
          <ImageUploader
            value={referenceImage}
            onChange={(v) => setParam('referenceImage', v)}
            disabled={isGenerating}
          />
          <p className="text-xs text-muted-foreground mt-2">
            {t('referenceHint')}
          </p>
        </div>

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
