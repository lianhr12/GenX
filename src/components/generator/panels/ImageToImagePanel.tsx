'use client';

// src/components/generator/panels/ImageToImagePanel.tsx

import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { defaultOutputNumbers } from '../config/defaults';
import { useCreatorState } from '../hooks/useCreatorState';
import { ImageUploader } from '../shared/ImageUploader';
import { ModelSelector } from '../shared/ModelSelector';

interface ImageToImagePanelProps {
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

export function ImageToImagePanel({ className }: ImageToImagePanelProps) {
  const t = useTranslations('Generator.panels.imageToImage');
  const {
    mode,
    model,
    setModel,
    setParam,
    sourceImage,
    outputNumber,
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

        {/* Image Upload */}
        <div>
          <SectionLabel required>{t('sourceImage')}</SectionLabel>
          <ImageUploader
            value={sourceImage}
            onChange={(v) => setParam('sourceImage', v)}
            disabled={isGenerating}
          />
          <p className="text-xs text-muted-foreground mt-2">
            {t('sourceImageHint')}
          </p>
        </div>

        {/* Output Number */}
        <div>
          <SectionLabel>{t('outputNumber')}</SectionLabel>
          <div className="flex gap-2">
            {defaultOutputNumbers.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setParam('outputNumber', num)}
                disabled={isGenerating}
                className={cn(
                  'flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  outputNumber === num
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
