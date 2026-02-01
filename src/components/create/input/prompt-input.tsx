'use client';

import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useCreateStore } from '@/stores/create-store';
import { PlusIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ParameterBar } from './parameter-bar';

export function PromptInput() {
  const t = useTranslations('CreatePageNew.input');
  const { prompt, setPrompt, isGenerating } = useCreateStore();

  return (
    <div className="flex h-full flex-col">
      {/* Input Area */}
      <div className="flex-1">
        <div className="flex h-full items-start gap-3">
          {/* Upload Image Button */}
          <div className="block">
            <div className="group/image-upload relative z-10 flex w-14 shrink-0">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  className={cn(
                    'group/upload-card relative flex cursor-pointer items-center justify-center',
                    'h-[60px] w-[45px] rounded border border-dashed',
                    'border-border bg-muted/50 text-base',
                    'transition-transform duration-500 ease-out will-change-transform',
                    'hover:z-[2] hover:scale-110 hover:border-primary/50'
                  )}
                  style={{
                    transform: 'rotate(-5deg)',
                  }}
                >
                  <PlusIcon className="size-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>

          {/* Text Input */}
          <div className="relative size-full">
            <div
              className="scrollbar h-full min-h-[24px] overflow-y-auto"
              style={{ height: '112px', maxHeight: '112px' }}
            >
              <div className="relative size-full">
                <div className="relative flex size-full min-h-28">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={t('placeholder')}
                    className={cn(
                      'max-w-none flex-1 resize-none text-start text-sm',
                      'h-full min-h-[24px] leading-relaxed outline-none',
                      'border-0 bg-transparent p-0',
                      'focus-visible:ring-0 focus-visible:ring-offset-0',
                      'placeholder:text-muted-foreground/60'
                    )}
                    disabled={isGenerating}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Parameter Bar */}
      <ParameterBar />
    </div>
  );
}
