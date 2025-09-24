/**
 * VIB34D Design System - Engine State Utilities
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 * "The Revolution Will Not be in a Structured Format"
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 * Helper utilities shared across the VIB34D engine subsystems.
 */

import {
  SystemState,
  PresetDefinition,
  PerformanceMetrics
} from '@/lib/design-system/types/core';

export function cloneState(state: SystemState): SystemState {
  return {
    visualizer: { ...state.visualizer },
    interactions: { ...state.interactions },
    transitions: { ...state.transitions, activeTransitions: [...state.transitions.activeTransitions] },
    performance: { ...state.performance }
  };
}

export function deriveVisualizerState(
  preset: PresetDefinition | null,
  metrics: PerformanceMetrics
) {
  const parameters = preset?.parameters ?? {};
  return {
    density: clampNumber(parameters.density, 0, 1, 0.5),
    speed: clampNumber(parameters.speed, 0, 5, 1),
    reactivity: clampNumber(parameters.reactivity, 0, 1, 0.5),
    colorScheme: extractString(parameters.colorScheme, 'cyan-purple'),
    particleCount: Math.max(0, Math.round(clampNumber(parameters.particleCount, 0, 5000, 1000))),
    frameRate: metrics.fps
  };
}

export function deriveInteractionState(
  preset: PresetDefinition | null,
  activeInteractions: number
) {
  const parameters = preset?.parameters ?? {};
  return {
    hoverEffect: extractString(parameters.hoverEffect, 'lift_glow'),
    clickEffect: extractString(parameters.clickEffect, 'ripple_expand'),
    scrollEffect: extractString(parameters.scrollEffect, 'parallax_smooth'),
    sensitivity: clampNumber(parameters.sensitivity, 0, 1, 0.5),
    activeInteractions
  };
}

export function deriveTransitionState(
  preset: PresetDefinition | null,
  activeTransitions: string[]
) {
  const parameters = preset?.parameters ?? {};
  return {
    pageTransition: extractString(parameters.pageTransition, 'dimensional_slide'),
    cardTransition: extractString(parameters.cardTransition, 'portal_expand'),
    duration: clampNumber(parameters.duration, 100, 5000, 800),
    easing: extractString(parameters.easing, 'cubic-bezier(0.4, 0.0, 0.2, 1)'),
    activeTransitions: [...activeTransitions]
  };
}

export function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

export function extractString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}
