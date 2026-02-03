// src/components/generator/index.ts

// Main component
export { GenXCreator } from './GenXCreator';
export {
  GenXCreatorProvider,
  useCreatorState,
  useCreatorContext,
} from './GenXCreatorProvider';

// Types
export type {
  CreatorMode,
  ModeSwitchBehavior,
  GenerationParams,
  CreditsConfig,
  ModeConfig,
  GenerationResult,
  GenXCreatorProps,
  CreatorState,
  CreatorAction,
  CreatorContextValue,
  ToolPageLayoutProps,
  ResultSectionProps,
  HistorySectionProps,
  FloatingCreatorProps,
  ImageUploaderProps,
  ModelSelectorProps,
  AspectRatioSelectorProps,
  DurationSelectorProps,
  QualitySelectorProps,
  StyleSelectorProps,
  CreditsDisplayProps,
} from './types';

// Core components
export { CreatorInput } from './core/CreatorInput';
export { CreatorModeSelector } from './core/CreatorModeSelector';
export { CreatorParameterBar } from './core/CreatorParameterBar';
export { CreatorSubmitButton } from './core/CreatorSubmitButton';

// Panels
export { TextToVideoPanel } from './panels/TextToVideoPanel';
export { ImageToVideoPanel } from './panels/ImageToVideoPanel';
export { TextToImagePanel } from './panels/TextToImagePanel';
export { ReferenceToVideoPanel } from './panels/ReferenceToVideoPanel';
export { AudioPanel } from './panels/AudioPanel';

// Shared components
export { ModelSelector } from './shared/ModelSelector';
export { AspectRatioSelector } from './shared/AspectRatioSelector';
export { DurationSelector } from './shared/DurationSelector';
export { QualitySelector } from './shared/QualitySelector';
export { ImageUploader } from './shared/ImageUploader';
export { StyleSelector } from './shared/StyleSelector';
export { CreditsDisplay } from './shared/CreditsDisplay';

// Layout components
export { ToolPageLayout } from './layouts/ToolPageLayout';
export { ResultSection } from './layouts/ResultSection';
export { HistorySection } from './layouts/HistorySection';
export { FloatingCreator } from './layouts/FloatingCreator';

// Hooks
export { useGeneration } from './hooks/useGeneration';
export { useCreditsCalculation } from './hooks/useCreditsCalculation';
export {
  useModeConfig,
  useAvailableModels,
  useModeParameters,
  useHasParameter,
} from './hooks/useModeConfig';
export { useNavigationOnInput } from './hooks/useNavigationOnInput';

// Config
export {
  modeConfigs,
  getModeConfig,
  getDefaultModel,
  getAvailableModels,
  getModeRequiresImage,
  getModeParameters,
  getModeCreditsBase,
  modeRoutes,
  getRouteForMode,
  getModeFromRoute,
} from './config/modes';

export {
  defaultCreatorState,
  getDefaultStateForMode,
  defaultAspectRatios,
  defaultDurations,
  defaultQualities,
  defaultOutputNumbers,
  defaultStyles,
} from './config/defaults';

export {
  calculateCredits,
  isVideoMode,
  isImageMode,
  isAudioMode,
  getCreditsRange,
} from './config/credits';
