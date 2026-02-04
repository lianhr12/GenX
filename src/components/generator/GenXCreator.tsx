'use client';

// src/components/generator/GenXCreator.tsx

import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { GenXCreatorProvider } from './GenXCreatorProvider';
import { CreatorInput } from './core/CreatorInput';
import { CreatorParameterBar } from './core/CreatorParameterBar';
import { CreatorSubmitButton } from './core/CreatorSubmitButton';
import { useCreatorState } from './hooks/useCreatorState';
import { useNavigationOnInput } from './hooks/useNavigationOnInput';
import { AudioPanel } from './panels/AudioPanel';
import { ImageToImagePanel } from './panels/ImageToImagePanel';
import { ImageToVideoPanel } from './panels/ImageToVideoPanel';
import { ReferenceToVideoPanel } from './panels/ReferenceToVideoPanel';
import { TextToImagePanel } from './panels/TextToImagePanel';
import { TextToVideoPanel } from './panels/TextToVideoPanel';
import type { CreatorMode, CreatorState, GenXCreatorProps } from './types';

// 错误边界组件
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class CreatorErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('GenXCreator Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-6 text-center">
          <p className="text-destructive font-medium">
            Something went wrong. Please refresh the page.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 内部组件，用于渲染动态面板
function DynamicPanel({ showStyles }: { showStyles: boolean }) {
  const { mode } = useCreatorState();

  switch (mode) {
    case 'text-to-video':
      return <TextToVideoPanel showStyles={showStyles} />;
    case 'image-to-video':
      return <ImageToVideoPanel showStyles={showStyles} />;
    case 'text-to-image':
      return <TextToImagePanel showStyles={showStyles} />;
    case 'image-to-image':
      return <ImageToImagePanel />;
    case 'reference-to-video':
      return <ReferenceToVideoPanel />;
    case 'audio':
      return <AudioPanel />;
    default:
      return null;
  }
}

// 内部组件，包含所有 UI 元素
function CreatorContent({
  allowedModes,
  modeSwitchBehavior,
  onGenerate,
  creditsConfig,
  showStyles,
  showCredits,
  compact,
  enableNavigation,
  onBeforeNavigate,
  onAfterNavigate,
}: Omit<
  GenXCreatorProps,
  | 'mode'
  | 'defaultMode'
  | 'value'
  | 'onChange'
  | 'defaultValue'
  | 'onModeChange'
>) {
  const t = useTranslations('Generator.input');

  // 导航 hook - 用于 Enter 键和生成按钮
  const { handleInputComplete } = useNavigationOnInput({
    onBeforeNavigate,
    onAfterNavigate,
  });

  // 是否显示模式选择器（在参数栏中）
  const showModeSelector = modeSwitchBehavior !== 'locked';

  if (compact) {
    // 紧凑模式：类似 /create 主页面的输入框样式
    return (
      <div className="rounded-xl bg-card border border-border p-4">
        {/* 输入区 */}
        <CreatorInput
          showImageUpload
          enableNavigation={enableNavigation}
          onBeforeNavigate={onBeforeNavigate}
          onAfterNavigate={onAfterNavigate}
        />

        {/* 参数栏 + 提交按钮 */}
        <div className="flex items-center justify-between pt-4">
          <CreatorParameterBar
            allowedModes={allowedModes}
            showModeSelector={showModeSelector}
            showAudio={false}
            showMoreOptions={false}
          />
          <CreatorSubmitButton
            onGenerate={onGenerate}
            creditsConfig={creditsConfig}
            showCredits={showCredits}
            variant="compact"
            enableNavigation={enableNavigation}
            onNavigate={handleInputComplete}
          />
        </div>
      </div>
    );
  }

  // 完整模式：类似工具页面的完整表单
  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      {/* 内容区 */}
      <div className="p-5 space-y-5">
        {/* 动态面板 */}
        <DynamicPanel showStyles={showStyles ?? true} />

        {/* 提示词输入 */}
        <div>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2 block">
            {t('prompt')}
          </span>
          <CreatorInput
            showImageUpload={false}
            enableNavigation={enableNavigation}
            onBeforeNavigate={onBeforeNavigate}
            onAfterNavigate={onAfterNavigate}
            className="min-h-[100px]"
          />
        </div>
      </div>

      {/* 底部：参数栏 + Credits + 提交按钮 */}
      <div className="px-5 py-4 bg-muted/50 border-t border-border">
        <div className="flex items-center justify-between">
          <CreatorParameterBar
            allowedModes={allowedModes}
            showModeSelector={showModeSelector}
            showAudio={false}
            showMoreOptions={false}
          />
          <CreatorSubmitButton
            onGenerate={onGenerate}
            creditsConfig={creditsConfig}
            showCredits={showCredits}
            enableNavigation={enableNavigation}
            onNavigate={handleInputComplete}
          />
        </div>
      </div>
    </div>
  );
}

export function GenXCreator({
  mode,
  defaultMode = 'text-to-video',
  allowedModes = [
    'text-to-video',
    'image-to-video',
    'text-to-image',
    'image-to-image',
  ],
  modeSwitchBehavior = 'switchable',
  onModeChange,
  value,
  onChange,
  defaultValue,
  onGenerate,
  creditsConfig,
  showStyles = true,
  showCredits = true,
  compact = false,
  className,
  enableNavigation = false,
  onBeforeNavigate,
  onAfterNavigate,
}: GenXCreatorProps) {
  // 构建初始状态
  const initialState: Partial<CreatorState> = {
    mode: mode ?? defaultMode,
    ...defaultValue,
  };

  return (
    <CreatorErrorBoundary>
      <GenXCreatorProvider
        value={value}
        onChange={onChange}
        defaultValue={initialState}
      >
        <div className={cn('genx-creator', className)}>
          <CreatorContent
            allowedModes={allowedModes}
            modeSwitchBehavior={modeSwitchBehavior}
            onGenerate={onGenerate}
            creditsConfig={creditsConfig}
            showStyles={showStyles}
            showCredits={showCredits}
            compact={compact}
            enableNavigation={enableNavigation}
            onBeforeNavigate={onBeforeNavigate}
            onAfterNavigate={onAfterNavigate}
          />
        </div>
      </GenXCreatorProvider>
    </CreatorErrorBoundary>
  );
}
