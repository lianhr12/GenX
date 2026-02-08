// src/components/generator/types.ts

/** 创作模式 */
export type CreatorMode =
  | 'text-to-video'
  | 'image-to-video'
  | 'text-to-image'
  | 'image-to-image'
  | 'reference-to-video'
  | 'audio';

/** 模式切换行为 */
export type ModeSwitchBehavior =
  | 'locked' // 锁定，不可切换
  | 'switchable' // 用户可切换
  | 'tabs'; // Tab 形式

/** 生成参数 */
export interface GenerationParams {
  mode: CreatorMode;
  prompt: string;
  model: string;
  // 视频参数
  duration?: number;
  aspectRatio?: string;
  quality?: string;
  // 图片参数
  sourceImage?: File | string | null;
  referenceImage?: File | string | null;
  style?: string;
  // 音频参数
  audioType?: string;
  generateAudio?: boolean;
  audioUrl?: string | null;
  // 输出数量（图片）
  outputNumber?: number;
  // 公开性
  isPublic?: boolean;
  // 版权保护（隐藏提示词和源图片）
  hidePrompt?: boolean;
}

/** Credits 配置 */
export interface CreditsConfig {
  baseCredits: number;
  multipliers?: {
    duration?: Record<number, number>;
    quality?: Record<string, number>;
    model?: Record<string, number>;
  };
  calculate?: (params: GenerationParams) => number;
}

/** 模式配置 */
export interface ModeConfig {
  id: CreatorMode;
  label: string;
  labelKey: string;
  icon: string;
  requiresImage: boolean;
  parameters: string[];
  defaultModel: string;
  availableModels: string[];
  creditsBase: number;
}

/** 生成结果 */
export interface GenerationResult {
  id: string;
  type: 'video' | 'image' | 'audio';
  url: string;
  thumbnailUrl?: string;
  prompt: string;
  model: string;
  duration?: number;
  aspectRatio?: string;
  quality?: string;
  creditsUsed: number;
  createdAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
}

/** 主组件 Props */
export interface GenXCreatorProps {
  // 模式控制
  mode?: CreatorMode;
  defaultMode?: CreatorMode;
  allowedModes?: CreatorMode[];
  modeSwitchBehavior?: ModeSwitchBehavior;
  onModeChange?: (mode: CreatorMode) => void;

  // 状态控制 (受控模式)
  value?: GenerationParams;
  onChange?: (params: Partial<GenerationParams>) => void;

  // 默认值 (非受控模式)
  defaultValue?: Partial<GenerationParams>;

  // 生成回调
  onGenerate?: (params: GenerationParams) => Promise<void>;

  // Credits 配置
  creditsConfig?: CreditsConfig;

  // UI 配置
  showStyles?: boolean;
  showCredits?: boolean;
  compact?: boolean;
  className?: string;

  // 导航模式 (仅 /create 主页面使用)
  enableNavigation?: boolean;

  // 导航前回调
  onBeforeNavigate?: (params: GenerationParams) => Promise<boolean>;

  // 导航后回调
  onAfterNavigate?: (route: string) => void;
}

/** Creator 状态 */
export interface CreatorState {
  mode: CreatorMode;
  prompt: string;
  model: string;
  duration: number;
  aspectRatio: string;
  quality: string;
  sourceImage: File | string | null;
  referenceImage: File | string | null;
  style: string;
  outputNumber: number;
  isPublic: boolean;
  hidePrompt: boolean;
  generateAudio: boolean;
  audioUrl: string | null;
  isGenerating: boolean;
  generationProgress: number;
}

/** Creator Action */
export type CreatorAction =
  | { type: 'SET_MODE'; payload: CreatorMode }
  | { type: 'SET_PROMPT'; payload: string }
  | { type: 'SET_MODEL'; payload: string }
  | { type: 'SET_PARAM'; key: keyof CreatorState; value: unknown }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'SET_STATE'; payload: Partial<CreatorState> }
  | { type: 'RESET' };

/** Creator Context 值 */
export interface CreatorContextValue {
  state: CreatorState;
  dispatch: React.Dispatch<CreatorAction>;
  isControlled: boolean;
}

/** 工具页面布局 Props */
export interface ToolPageLayoutProps {
  mode: CreatorMode;
  children?: React.ReactNode;
}

/** 结果区域 Props */
export interface ResultSectionProps {
  result: GenerationResult | null;
  mode: CreatorMode;
  isLoading?: boolean;
}

/** 历史区域 Props */
export interface HistorySectionProps {
  mode: CreatorMode;
}

/** 浮动输入栏 Props */
export interface FloatingCreatorProps {
  mode: CreatorMode;
  onGenerate: (params: GenerationParams) => Promise<void>;
}

/** 图片上传器 Props */
export interface ImageUploaderProps {
  value?: File | string | null;
  onChange?: (value: File | string | null) => void;
  onUploadStart?: () => void;
  onUploadComplete?: (url: string) => void;
  onUploadError?: (error: Error) => void;
  accept?: string;
  maxSize?: number;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
}

/** 模型选择器 Props */
export interface ModelSelectorProps {
  mode: CreatorMode;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

/** 比例选择器 Props */
export interface AspectRatioSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  options?: string[];
  disabled?: boolean;
  className?: string;
}

/** 时长选择器 Props */
export interface DurationSelectorProps {
  value?: number;
  onChange?: (value: number) => void;
  options?: number[];
  disabled?: boolean;
  className?: string;
}

/** 质量选择器 Props */
export interface QualitySelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  options?: string[];
  disabled?: boolean;
  className?: string;
}

/** 风格选择器 Props */
export interface StyleSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

/** Credits 显示 Props */
export interface CreditsDisplayProps {
  credits: number;
  showIcon?: boolean;
  className?: string;
}
