'use client';

/**
 * VIB34D Hybrid Foundation 2.0 - Systems Hook
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 *
 * React integration layer exposing the Hybrid Foundation parameter web,
 * interaction coordinator, and consciousness state to Next.js components.
 *
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 */

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSyncExternalStore } from 'react';
import {
  VIB3HomeMaster,
  createDefaultParameterWebDefinition,
  type LayerType,
  type ParameterCascadeDefinition,
} from '@/lib/vib34d-home-master';
import type { Params } from '@/lib/store';
import { VIB34DInteractionCoordinator } from '@/lib/vib34d-interaction-coordinator';
import type { VisualConsciousnessSnapshot } from '@/lib/visual-consciousness';

interface VIB3SystemsContextValue {
  homeMaster: VIB3HomeMaster;
  parameterWeb: ReturnType<VIB3HomeMaster['getParameterWeb']>;
  interactionCoordinator: VIB34DInteractionCoordinator;
  consciousnessSnapshot: () => VisualConsciousnessSnapshot;
  registerVisualizer: (registration: {
    id: string;
    sectionId: string;
    layer: LayerType;
    element?: Element | null;
  }) => () => void;
}

const VIB3SystemsContext = createContext<VIB3SystemsContextValue | null>(null);

export interface VIB3SystemsProviderProps {
  children: ReactNode;
  initialHomeParams?: Partial<Params>;
  cascades?: ParameterCascadeDefinition;
}

export function VIB3SystemsProvider({
  children,
  initialHomeParams,
  cascades,
}: VIB3SystemsProviderProps) {
  const [homeMaster] = useState(
    () =>
      new VIB3HomeMaster({
        cascades: cascades ?? createDefaultParameterWebDefinition(),
        homeParams: initialHomeParams,
      }),
  );
  const [interactionCoordinator] = useState(
    () => new VIB34DInteractionCoordinator(homeMaster),
  );

  useEffect(() => {
    if (initialHomeParams) {
      homeMaster.updateHomeParams(initialHomeParams);
    }
  }, [homeMaster, initialHomeParams]);

  useEffect(() => {
    homeMaster.start();
    interactionCoordinator.start();
    return () => {
      interactionCoordinator.stop();
      homeMaster.stop();
      homeMaster.dispose();
    };
  }, [homeMaster, interactionCoordinator]);

  const contextValue = useMemo<VIB3SystemsContextValue>(() => {
    const consciousness = homeMaster.getConsciousness();
    return {
      homeMaster,
      parameterWeb: homeMaster.getParameterWeb(),
      interactionCoordinator,
      consciousnessSnapshot: () => consciousness.getSnapshot(),
      registerVisualizer: (registration) => interactionCoordinator.registerVisualizer(registration),
    };
  }, [homeMaster, interactionCoordinator]);

  return (
    <VIB3SystemsContext.Provider value={contextValue}>
      {children}
    </VIB3SystemsContext.Provider>
  );
}

export function useVIB3Systems(): VIB3SystemsContextValue {
  const context = useContext(VIB3SystemsContext);
  if (!context) {
    throw new Error('useVIB3Systems must be used within a VIB3SystemsProvider');
  }
  return context;
}

export function useVIB3ParameterRevision(): number {
  const { homeMaster } = useVIB3Systems();
  return useSyncExternalStore(
    (listener) => homeMaster.subscribe(listener),
    () => homeMaster.getSnapshot(),
    () => homeMaster.getSnapshot(),
  );
}

export function useVisualConsciousness(): VisualConsciousnessSnapshot {
  const { homeMaster } = useVIB3Systems();
  const consciousness = homeMaster.getConsciousness();
  const revision = useSyncExternalStore(
    (listener) => consciousness.subscribe(listener),
    () => consciousness.getRevision(),
    () => consciousness.getRevision(),
  );
  return useMemo(() => consciousness.getSnapshot(), [consciousness, revision]);
}
