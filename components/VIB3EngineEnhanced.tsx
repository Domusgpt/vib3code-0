'use client';

/**
 * VIB34D Hybrid Foundation 2.0 - Enhanced Engine Wrapper
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 *
 * Couples the VIB3 engine renderer with the Hybrid Foundation parameter web,
 * visual consciousness registry, and interaction cascades.
 *
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 */

import { useEffect, useMemo } from 'react';
import { VIB3Engine } from '@/components/engines/VIB3Engine';
import type { LayerType } from '@/lib/vib34d-home-master';
import type { VIB3GeometryParams } from '@/lib/vib34d-geometries';
import {
  useVIB3Systems,
  useVIB3ParameterRevision,
} from '@/hooks/useVIB3Systems';

export interface VIB3EngineEnhancedProps {
  sectionId: string;
  layerType: LayerType;
  opacity?: number;
  pointSize?: number;
  visualizerId?: string;
  hoverMeta?: { index?: number; total?: number };
  isFocused?: boolean;
  enablePointerInteractions?: boolean;
}

export function VIB3EngineEnhanced({
  sectionId,
  layerType,
  opacity,
  pointSize,
  visualizerId,
  hoverMeta,
  isFocused,
  enablePointerInteractions = true,
}: VIB3EngineEnhancedProps) {
  const { homeMaster, registerVisualizer, interactionCoordinator } = useVIB3Systems();
  const revision = useVIB3ParameterRevision();
  const elementId = visualizerId ?? `${sectionId}-${layerType}`;

  useEffect(() => {
    return registerVisualizer({
      id: elementId,
      sectionId,
      layer: layerType,
    });
  }, [registerVisualizer, elementId, sectionId, layerType]);

  useEffect(() => {
    if (typeof isFocused !== 'boolean') {
      return;
    }
    if (isFocused) {
      interactionCoordinator.handleFocus(elementId);
    } else {
      interactionCoordinator.handleBlur(elementId);
    }
  }, [interactionCoordinator, elementId, isFocused]);

  const params: VIB3GeometryParams = useMemo(
    () => homeMaster.deriveParameters(sectionId, layerType),
    [homeMaster, revision, sectionId, layerType],
  );

  const handlePointerOver = () => {
    if (!enablePointerInteractions) return;
    interactionCoordinator.handleHoverStart(elementId, hoverMeta);
  };

  const handlePointerOut = () => {
    if (!enablePointerInteractions) return;
    interactionCoordinator.handleHoverEnd(elementId);
  };

  const handleClick = () => {
    if (!enablePointerInteractions) return;
    interactionCoordinator.handleClick(elementId);
  };

  return (
    <VIB3Engine
      sectionId={sectionId}
      layerType={layerType}
      params={params}
      opacity={opacity}
      pointSize={pointSize}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    />
  );
}

export default VIB3EngineEnhanced;
