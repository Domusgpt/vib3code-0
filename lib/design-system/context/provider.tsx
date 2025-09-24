/**
 * VIB34D Design System - React Context Provider
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 * "The Revolution Will Not be in a Structured Format"
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 *
 * Lightweight context provider for design system state management.
 * Revolutionary constraint: MAX 200 lines to force elegant architecture.
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  VIB34DEngine,
  SystemState,
  PresetCategory,
  PresetDefinition
} from '@/lib/design-system/types/core';

// Context type definition
interface DesignSystemContextType {
  engine: VIB34DEngine | null;
  currentState: SystemState | null;
  presets: Record<PresetCategory, PresetDefinition[]>;
  updatePreset: (category: PresetCategory, name: string) => void;
  isInitialized: boolean;
  error: string | null;
}

// Create context with undefined default (will be provided)
const DesignSystemContext = createContext<DesignSystemContextType | undefined>(undefined);

// Provider component props
interface DesignSystemProviderProps {
  children: ReactNode;
}

// Main provider implementation
export function DesignSystemProvider({ children }: DesignSystemProviderProps) {
  const [engine, setEngine] = useState<VIB34DEngine | null>(null);
  const [currentState, setCurrentState] = useState<SystemState | null>(null);
  const [presets, setPresets] = useState<Record<PresetCategory, PresetDefinition[]>>({
    visualizer: [],
    interactions: [],
    transitions: [],
    effects: []
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize engine on mount
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        // TODO: Import actual engine implementation when Phase 2 is complete
        // const engineInstance = new VIB34DEngine();
        // await engineInstance.initialize();
        // setEngine(engineInstance);

        // For now, load preset definitions
        const presetData = await loadPresetDefinitions();
        setPresets(presetData);
        setIsInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize design system');
        console.error('Design system initialization error:', err);
      }
    };

    initializeSystem();
  }, []);

  // Update system state periodically
  useEffect(() => {
    if (!engine) return;

    const interval = setInterval(() => {
      try {
        const state = engine.getCurrentState();
        setCurrentState(state);
      } catch (err) {
        console.warn('Failed to update system state:', err);
      }
    }, 100); // 100ms updates for smooth real-time feedback

    return () => clearInterval(interval);
  }, [engine]);

  // Preset update handler
  const updatePreset = useCallback((category: PresetCategory, name: string) => {
    if (!engine) {
      console.warn('Engine not initialized, cannot update preset');
      return;
    }

    try {
      engine.updatePreset(category, name);
      // State will be updated by the periodic effect above
    } catch (err) {
      setError(`Failed to update ${category} preset to ${name}: ${err}`);
      console.error('Preset update error:', err);
    }
  }, [engine]);

  // Context value object
  const contextValue: DesignSystemContextType = {
    engine,
    currentState,
    presets,
    updatePreset,
    isInitialized,
    error
  };

  return (
    <DesignSystemContext.Provider value={contextValue}>
      {children}
    </DesignSystemContext.Provider>
  );
}

// Hook for consuming context
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

// Preset loading utility (temporary implementation)
async function loadPresetDefinitions(): Promise<Record<PresetCategory, PresetDefinition[]>> {
  try {
    // TODO: Implement actual preset loading from JSON files
    // This is a placeholder implementation for Phase 1
    const mockPresets: Record<PresetCategory, PresetDefinition[]> = {
      visualizer: [
        {
          name: 'Standard',
          category: 'visualizer',
          parameters: { density: 0.5, speed: 1.0, reactivity: 0.6 },
          metadata: { description: 'Balanced visualization', performance: 'medium', complexity: 'moderate', tags: ['default'] }
        }
      ],
      interactions: [
        {
          name: 'Responsive',
          category: 'interactions',
          parameters: { hoverEffect: 'lift_glow', sensitivity: 0.7 },
          metadata: { description: 'Responsive interactions', performance: 'medium', complexity: 'moderate', tags: ['responsive'] }
        }
      ],
      transitions: [
        {
          name: 'Slide Portal',
          category: 'transitions',
          parameters: { pageTransition: 'dimensional_slide', duration: 800 },
          metadata: { description: 'Smooth dimensional sliding', performance: 'medium', complexity: 'moderate', tags: ['slide'] }
        }
      ],
      effects: []
    };

    return mockPresets;
  } catch (err) {
    console.error('Failed to load preset definitions:', err);
    throw new Error('Preset loading failed');
  }
}

// Export context for direct access if needed
export { DesignSystemContext };