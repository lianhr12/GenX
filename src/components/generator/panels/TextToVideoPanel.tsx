'use client';

// src/components/generator/panels/TextToVideoPanel.tsx

import { useTranslations } from 'next-intl';
import { useCreatorState } from '../hooks/useCreatorState';
import { AspectRatioSelector } from '../shared/AspectRatioSelector';
import { DurationSelector } from '../shared/DurationSelector';
import { ModelSelector } from '../shared/ModelSelector';
import { QualitySelector } from '../shared/QualitySelector';
import { StyleSelector } from '../shared/StyleSelector';

interface TextToVideoPanelProps {
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

export function TextToVideoPanel({
  showStyles = true,
  className,
}: TextToVideoPanelProps) {
  const t = useTranslations('Generator.panels.textToVideo');
  const {
    mode,
    model,
    setModel,
    aspectRatio,
    setParam,
    duration,
    quality,
    style,
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

        {/* Aspect Ratio */}
        <div>
          <SectionLabel>{t('aspectRatio')}</SectionLabel>
          <AspectRatioSelector
            value={aspectRatio}
            onChange={(v) => setParam('aspectRatio', v)}
            disabled={isGenerating}
          />
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
