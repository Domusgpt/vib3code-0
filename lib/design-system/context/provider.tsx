/**
 * VIB34D Design System - React Context Provider
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 * "The Revolution Will Not be in a Structured Format"
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 * Lightweight context provider for design system state management.
 * Revolutionary constraint: MAX 200 lines to force elegant architecture.
 */

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  ReactNode
} from 'react';
import {
  VIB34DEngine,
  SystemState,
  PresetCategory,
  PresetCollection,
  InteractionCoordinator,
  TransitionCoordinator
} from '@/lib/design-system/types/core';
import { vib34dEngine } from '@/lib/design-system/core/engine';
import { EMPTY_PRESET_COLLECTION } from '@/lib/design-system/core/preset-manager';

interface DesignSystemContextType {
  engine: VIB34DEngine | null;
  currentState: SystemState | null;
  presets: PresetCollection;
  updatePreset: (category: PresetCategory, name: string) => void;
  isInitialized: boolean;
  error: string | null;
  interactionCoordinator: InteractionCoordinator | null;
  transitionCoordinator: TransitionCoordinator | null;
}

const DesignSystemContext = createContext<DesignSystemContextType | undefined>(undefined);

interface DesignSystemProviderProps {
  children: ReactNode;
}

export function DesignSystemProvider({ children }: DesignSystemProviderProps) {
  const engineRef = useRef<VIB34DEngine>(vib34dEngine);
  const engine = engineRef.current;
  const [currentState, setCurrentState] = useState<SystemState | null>(null);
  const [presets, setPresets] = useState<PresetCollection>(EMPTY_PRESET_COLLECTION);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interactionCoordinator, setInteractionCoordinator] = useState<InteractionCoordinator | null>(null);
  const [transitionCoordinator, setTransitionCoordinator] = useState<TransitionCoordinator | null>(null);

  useEffect(() => {
    let unsubscribeState: (() => void) | null = null;
    let unsubscribePresets: (() => void) | null = null;

    const initializeSystem = async () => {
      try {
        await engine.initialize();
        setPresets(engine.getAvailablePresets());
        setCurrentState(engine.getCurrentState());
        setInteractionCoordinator(engine.getInteractionCoordinator());
        setTransitionCoordinator(engine.getTransitionCoordinator());
        unsubscribeState = engine.subscribe((state) => setCurrentState(state));
        unsubscribePresets = engine.onPresetsChange((collection) => setPresets(collection));
        setIsInitialized(true);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to initialize design system';
        setError(message);
        console.error('Design system initialization error:', err);
      }
    };

    initializeSystem();

    return () => {
      unsubscribeState?.();
      unsubscribePresets?.();
      engine.dispose();
      setInteractionCoordinator(null);
      setTransitionCoordinator(null);
    };
  }, [engine]);

  const updatePreset = useCallback((category: PresetCategory, name: string) => {
    if (!isInitialized) {
      setError('Design system engine not ready');
      return;
    }

    try {
      engine.updatePreset(category, name);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to update ${category} preset`;
      setError(message);
      console.error('Preset update error:', err);
    }
  }, [engine, isInitialized]);

  const contextValue = useMemo<DesignSystemContextType>(() => ({
    engine,
    currentState,
    presets,
    updatePreset,
    isInitialized,
    error,
    interactionCoordinator,
    transitionCoordinator
  }), [engine, currentState, presets, updatePreset, isInitialized, error, interactionCoordinator, transitionCoordinator]);

  return (
    <DesignSystemContext.Provider value={contextValue}>
      {children}
    </DesignSystemContext.Provider>
  );
}

export function useDesignSystemContext(): DesignSystemContextType {
  const context = useContext(DesignSystemContext);

  if (context === undefined) {
    throw new Error(
      'useDesignSystemContext must be used within a DesignSystemProvider. ' +
      'Make sure to wrap your component tree with <DesignSystemProvider>.'
    );
  }

  return context;
}

export { DesignSystemContext };
