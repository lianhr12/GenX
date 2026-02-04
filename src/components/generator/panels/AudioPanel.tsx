'use client';

// src/components/generator/panels/AudioPanel.tsx

import { useTranslations } from 'next-intl';
import { useCreatorState } from '../hooks/useCreatorState';
import { ModelSelector } from '../shared/ModelSelector';

interface AudioPanelProps {
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

export function AudioPanel({ className }: AudioPanelProps) {
  const t = useTranslations('Generator.panels.audio');
  const { mode, model, setModel, isGenerating } = useCreatorState();

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

        {/* Audio Type Selection - Placeholder */}
        <div>
          <SectionLabel>{t('audioType')}</SectionLabel>
          <p className="text-sm text-muted-foreground">{t('comingSoon')}</p>
        </div>
      </div>
    </div>
  );
}
