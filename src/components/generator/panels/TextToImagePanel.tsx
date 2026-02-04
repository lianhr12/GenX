'use client';

// src/components/generator/panels/TextToImagePanel.tsx

import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { defaultOutputNumbers } from '../config/defaults';
import { useCreatorState } from '../hooks/useCreatorState';
import { AspectRatioSelector } from '../shared/AspectRatioSelector';
import { ModelSelector } from '../shared/ModelSelector';
import { StyleSelector } from '../shared/StyleSelector';

interface TextToImagePanelProps {
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

export function TextToImagePanel({
  showStyles = true,
  className,
}: TextToImagePanelProps) {
  const t = useTranslations('Generator.panels.textToImage');
  const {
    mode,
    model,
    setModel,
    aspectRatio,
    setParam,
    style,
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
