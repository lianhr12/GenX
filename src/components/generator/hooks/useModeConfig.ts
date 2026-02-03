'use client';

// src/components/generator/hooks/useModeConfig.ts

import { useMemo } from 'react';
import {
  getAvailableModels,
  getModeConfig,
  getModeParameters,
} from '../config/modes';
import type { CreatorMode, ModeConfig } from '../types';

/**
 * Hook to get mode configuration
 */
export function useModeConfig(mode: CreatorMode): ModeConfig {
  return useMemo(() => getModeConfig(mode), [mode]);
}

/**
 * Hook to get available models for a mode
 */
export function useAvailableModels(mode: CreatorMode): string[] {
  return useMemo(() => getAvailableModels(mode), [mode]);
}

/**
 * Hook to get parameters for a mode
 */
export function useModeParameters(mode: CreatorMode): string[] {
  return useMemo(() => getModeParameters(mode), [mode]);
}

/**
 * Hook to check if a parameter is available for current mode
 */
export function useHasParameter(mode: CreatorMode, parameter: string): boolean {
  const parameters = useModeParameters(mode);
  return parameters.includes(parameter);
}
