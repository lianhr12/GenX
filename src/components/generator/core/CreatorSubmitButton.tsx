'use client';

// src/components/generator/core/CreatorSubmitButton.tsx

import { Button } from '@/components/ui/button';
import { useCreditBalance } from '@/hooks/use-credits';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { ArrowUpIcon, Loader2Icon, SparklesIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { useCreatorState } from '../hooks/useCreatorState';
import { useCreditsCalculation } from '../hooks/useCreditsCalculation';
import type { CreditsConfig, GenerationParams } from '../types';

interface CreatorSubmitButtonProps {
  onGenerate?: (params: GenerationParams) => Promise<void>;
  creditsConfig?: CreditsConfig;
  showCredits?: boolean;
  variant?: 'default' | 'compact';
  className?: string;
  // 导航模式相关
  enableNavigation?: boolean;
  onNavigate?: () => Promise<void>;
}

export function CreatorSubmitButton({
  onGenerate,
  creditsConfig,
  showCredits = true,
  variant = 'default',
  className,
  enableNavigation = false,
  onNavigate,
}: CreatorSubmitButtonProps) {
  const t = useTranslations('Generator.submit');
  const state = useCreatorState();

  // 防止并发提交
  const isSubmittingRef = useRef(false);

  // 获取用户会话
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  // 获取用户积分余额
  const { data: creditBalance } = useCreditBalance(userId);
  const userCredits = creditBalance ?? 0;

  // 构建参数用于 credits 计算 - 优化依赖项
  const params: GenerationParams = useMemo(
    () => ({
      mode: state.mode,
      prompt: state.prompt,
      model: state.model,
      duration: state.duration,
      aspectRatio: state.aspectRatio,
      quality: state.quality,
      sourceImage: state.sourceImage,
      referenceImage: state.referenceImage,
      style: state.style,
      outputNumber: state.outputNumber,
      isPublic: state.isPublic,
    }),
    [
      state.mode,
      state.prompt,
      state.model,
      state.duration,
      state.aspectRatio,
      state.quality,
      state.sourceImage,
      state.referenceImage,
      state.style,
      state.outputNumber,
      state.isPublic,
    ]
  );

  const credits = useCreditsCalculation(params, creditsConfig);

  // 检查积分是否充足
  const hasEnoughCredits = userCredits >= credits;

  // 检查是否可以提交
  const canSubmit = useMemo(() => {
    if (state.isGenerating) return false;
    if (!state.prompt.trim()) return false;

    // 图生视频模式需要图片
    if (state.mode === 'image-to-video' && !state.sourceImage) return false;

    // 参考图生视频模式需要参考图
    if (state.mode === 'reference-to-video' && !state.referenceImage)
      return false;

    return true;
  }, [
    state.isGenerating,
    state.prompt,
    state.mode,
    state.sourceImage,
    state.referenceImage,
  ]);

  const handleSubmit = useCallback(async () => {
    // 防止并发提交
    if (isSubmittingRef.current) return;

    // 导航模式：触发导航而不是生成
    if (enableNavigation && onNavigate) {
      // 导航模式下只需要有内容即可
      if (!state.prompt.trim() && !state.sourceImage && !state.referenceImage) {
        return;
      }
      isSubmittingRef.current = true;
      state.setGenerating(true);
      try {
        await onNavigate();
      } finally {
        state.setGenerating(false);
        isSubmittingRef.current = false;
      }
      return;
    }

    // 生成模式：需要 onGenerate 回调
    if (!canSubmit || !onGenerate) return;

    // 检查积分余额
    if (!hasEnoughCredits) {
      toast.error(t('insufficientCredits'));
      return;
    }

    isSubmittingRef.current = true;

    try {
      state.setGenerating(true);
      await onGenerate(params);
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error(t('generationFailed'));
    } finally {
      state.setGenerating(false);
      isSubmittingRef.current = false;
    }
  }, [
    canSubmit,
    onGenerate,
    params,
    state,
    hasEnoughCredits,
    t,
    enableNavigation,
    onNavigate,
  ]);

  // 按钮禁用状态
  const isDisabled = !canSubmit || !hasEnoughCredits;

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {showCredits && (
          <span
            className={cn(
              'text-xs',
              hasEnoughCredits
                ? 'text-muted-foreground'
                : 'text-destructive font-medium'
            )}
          >
            {credits} Credits
          </span>
        )}
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={handleSubmit}
          disabled={isDisabled}
          className={cn(
            '!size-9 rounded-full border-none',
            !isDisabled
              ? 'bg-white text-black hover:bg-white/90'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {state.isGenerating ? (
            <Loader2Icon className="size-5 animate-spin" />
          ) : (
            <ArrowUpIcon className="size-5" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-between gap-2', className)}>
      {showCredits && (
        <div className="flex flex-col items-end gap-[2px]">
          <span
            className={cn(
              'inline-flex items-center gap-[2px] text-xs leading-none',
              hasEnoughCredits
                ? 'text-muted-foreground'
                : 'text-destructive font-medium'
            )}
          >
            {credits} Credits
            {!hasEnoughCredits && ` (${t('balance')}: ${userCredits})`}
          </span>
        </div>
      )}
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isDisabled}
        className={cn(
          'flex items-center gap-2',
          !isDisabled
            ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        )}
      >
        {state.isGenerating ? (
          <>
            <Loader2Icon className="size-4 animate-spin" />
            {t('generating')}
          </>
        ) : !hasEnoughCredits ? (
          <>
            <SparklesIcon className="size-4" />
            {t('insufficientCreditsButton')}
          </>
        ) : (
          <>
            <SparklesIcon className="size-4" />
            {t('generate')}
          </>
        )}
      </Button>
    </div>
  );
}
