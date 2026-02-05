'use client';

// src/components/generator/GenXCreatorProvider.tsx

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import { defaultCreatorState, getDefaultStateForMode } from './config/defaults';
import { getDefaultModel, getModeRequiresImage } from './config/modes';
import type {
  CreatorAction,
  CreatorContextValue,
  CreatorMode,
  CreatorState,
  GenerationParams,
} from './types';

// 常量
const MAX_PROMPT_LENGTH = 2000;

/**
 * 消毒 prompt 输入
 */
function sanitizePrompt(prompt: string): string {
  return prompt
    .trim()
    .replace(/<[^>]*>/g, '') // 移除 HTML 标签
    .slice(0, MAX_PROMPT_LENGTH); // 限制长度
}

// Reducer
function creatorReducer(
  state: CreatorState,
  action: CreatorAction
): CreatorState {
  switch (action.type) {
    case 'SET_MODE': {
      const newMode = action.payload;
      const modeDefaults = getDefaultStateForMode(newMode);
      const requiresImage = getModeRequiresImage(newMode);

      return {
        ...state,
        ...modeDefaults,
        mode: newMode,
        model: getDefaultModel(newMode),
        // 保留 prompt
        prompt: state.prompt,
        // 清理不需要的图片
        sourceImage: newMode === 'image-to-video' ? state.sourceImage : null,
        referenceImage:
          newMode === 'reference-to-video' ? state.referenceImage : null,
      };
    }
    case 'SET_PROMPT':
      return { ...state, prompt: sanitizePrompt(action.payload) };
    case 'SET_MODEL':
      return { ...state, model: action.payload };
    case 'SET_PARAM':
      return { ...state, [action.key]: action.value };
    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };
    case 'SET_PROGRESS':
      return { ...state, generationProgress: action.payload };
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'RESET':
      return { ...defaultCreatorState, mode: state.mode };
    default:
      return state;
  }
}

// 计算下一个状态（用于受控模式）
function getNextState(
  state: CreatorState,
  action: CreatorAction
): Partial<GenerationParams> {
  const nextState = creatorReducer(state, action);
  return {
    mode: nextState.mode,
    prompt: nextState.prompt,
    model: nextState.model,
    duration: nextState.duration,
    aspectRatio: nextState.aspectRatio,
    quality: nextState.quality,
    sourceImage: nextState.sourceImage,
    referenceImage: nextState.referenceImage,
    style: nextState.style,
    outputNumber: nextState.outputNumber,
    isPublic: nextState.isPublic,
    generateAudio: nextState.generateAudio,
  };
}

// Context
const CreatorContext = createContext<CreatorContextValue | null>(null);

// Provider Props
interface GenXCreatorProviderProps {
  children: ReactNode;
  value?: GenerationParams; // 受控模式
  onChange?: (params: Partial<GenerationParams>) => void; // 受控模式回调
  defaultValue?: Partial<CreatorState>; // 非受控模式默认值
}

export function GenXCreatorProvider({
  children,
  value,
  onChange,
  defaultValue,
}: GenXCreatorProviderProps) {
  const isControlled = value !== undefined;

  // 初始状态
  const initialState = useMemo(() => {
    const base = { ...defaultCreatorState };
    if (defaultValue) {
      return { ...base, ...defaultValue };
    }
    return base;
  }, [defaultValue]);

  const [internalState, dispatch] = useReducer(creatorReducer, initialState);

  // 受控模式使用外部 value，非受控使用内部 state
  const state = useMemo(() => {
    if (isControlled && value) {
      return {
        ...internalState,
        mode: value.mode ?? internalState.mode,
        prompt: value.prompt ?? internalState.prompt,
        model: value.model ?? internalState.model,
        duration: value.duration ?? internalState.duration,
        aspectRatio: value.aspectRatio ?? internalState.aspectRatio,
        quality: value.quality ?? internalState.quality,
        sourceImage: value.sourceImage ?? internalState.sourceImage,
        referenceImage: value.referenceImage ?? internalState.referenceImage,
        style: value.style ?? internalState.style,
        outputNumber: value.outputNumber ?? internalState.outputNumber,
        isPublic: value.isPublic ?? internalState.isPublic,
        generateAudio: value.generateAudio ?? internalState.generateAudio,
      };
    }
    return internalState;
  }, [isControlled, value, internalState]);

  // 包装 dispatch，受控模式时调用 onChange
  const wrappedDispatch = useCallback(
    (action: CreatorAction) => {
      dispatch(action);
      if (isControlled && onChange) {
        const nextParams = getNextState(state, action);
        onChange(nextParams);
      }
    },
    [isControlled, onChange, state]
  );

  const contextValue = useMemo(
    () => ({
      state,
      dispatch: wrappedDispatch,
      isControlled,
    }),
    [state, wrappedDispatch, isControlled]
  );

  return (
    <CreatorContext.Provider value={contextValue}>
      {children}
    </CreatorContext.Provider>
  );
}

// Hook to use creator context
export function useCreatorContext(): CreatorContextValue {
  const context = useContext(CreatorContext);
  if (!context) {
    throw new Error(
      'useCreatorContext must be used within GenXCreatorProvider'
    );
  }
  return context;
}

// 便捷 Hook
export function useCreatorState() {
  const { state, dispatch } = useCreatorContext();

  return {
    ...state,
    setMode: (mode: CreatorMode) =>
      dispatch({ type: 'SET_MODE', payload: mode }),
    setPrompt: (prompt: string) =>
      dispatch({ type: 'SET_PROMPT', payload: prompt }),
    setModel: (model: string) =>
      dispatch({ type: 'SET_MODEL', payload: model }),
    setParam: <K extends keyof CreatorState>(key: K, value: CreatorState[K]) =>
      dispatch({ type: 'SET_PARAM', key, value }),
    setGenerating: (generating: boolean) =>
      dispatch({ type: 'SET_GENERATING', payload: generating }),
    setProgress: (progress: number) =>
      dispatch({ type: 'SET_PROGRESS', payload: progress }),
    setState: (newState: Partial<CreatorState>) =>
      dispatch({ type: 'SET_STATE', payload: newState }),
    reset: () => dispatch({ type: 'RESET' }),
  };
}
