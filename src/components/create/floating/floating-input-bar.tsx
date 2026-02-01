'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useCreateStore } from '@/stores/create-store';
import { SparklesIcon, XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function FloatingInputBar() {
  const t = useTranslations('CreatePageNew.floating');
  const {
    prompt,
    setPrompt,
    showFloatingInput,
    setShowFloatingInput,
    isGenerating,
  } = useCreateStore();

  if (!showFloatingInput) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 bg-gradient-to-t from-background via-background to-transparent animate-in slide-in-from-bottom duration-300">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-center gap-2 rounded-full border bg-background shadow-lg p-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t('placeholder')}
            className={cn(
              'flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0',
              'h-10 px-4 text-base'
            )}
            disabled={isGenerating}
          />

          <Button
            size="sm"
            className="h-9 px-4 rounded-full gap-1.5"
            disabled={!prompt.trim() || isGenerating}
          >
            <SparklesIcon className="size-4" />
            <span className="hidden sm:inline">
              {isGenerating ? t('generating') : t('generate')}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => setShowFloatingInput(false)}
          >
            <XIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
