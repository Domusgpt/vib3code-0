/**
 * VIB34D Design System - Core Type Definitions
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 * "The Revolution Will Not be in a Structured Format"
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 */

// Core Engine Types
export interface VIB34DEngine {
  initialize(): Promise<void>;
  updatePreset(category: PresetCategory, name: string): void;
  getCurrentState(): SystemState;
  dispose(): void;
}

export interface SystemState {
  visualizer: VisualizerState;
  interactions: InteractionState;
  transitions: TransitionState;
  performance: PerformanceMetrics;
}

export interface VisualizerState {
  density: number;
  speed: number;
  reactivity: number;
  colorScheme: string;
  particleCount: number;
  frameRate: number;
}

export interface InteractionState {
  hoverEffect: string;
  clickEffect: string;
  scrollEffect: string;
  sensitivity: number;
  activeInteractions: number;
}

export interface TransitionState {
  pageTransition: string;
  cardTransition: string;
  duration: number;
  easing: string;
  activeTransitions: string[];
}

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  interactionLatency: number;
}

// Preset System Types
export type PresetCategory = 'visualizer' | 'interactions' | 'transitions' | 'effects';

export interface PresetDefinition {
  name: string;
  category: PresetCategory;
  parameters: Record<string, any>;
  metadata: PresetMetadata;
}

export interface PresetMetadata {
  description: string;
  performance: 'low' | 'medium' | 'high';
  complexity: 'simple' | 'moderate' | 'advanced';
  tags: string[];
}

// Coordinator Types
export interface InteractionCoordinator {
  registerHoverHandler(element: HTMLElement, config: HoverConfig): void;
  registerClickHandler(element: HTMLElement, config: ClickConfig): void;
  registerScrollHandler(element: HTMLElement, config: ScrollConfig): void;
  cleanup(): void;
}

export interface TransitionCoordinator {
  executeTransition(from: string, to: string, config: TransitionConfig): Promise<void>;
  registerTransition(name: string, config: TransitionConfig): void;
  getCurrentTransition(): string | null;
}

export interface HoverConfig {
  effect: string;
  intensity: number;
  duration: number;
  easing?: string;
}

export interface ClickConfig {
  effect: string;
  feedback: 'visual' | 'haptic' | 'audio' | 'none';
  propagation: boolean;
}

export interface ScrollConfig {
  direction: 'horizontal' | 'vertical' | 'both';
  sensitivity: number;
  momentum: boolean;
}

export interface TransitionConfig {
  type: string;
  duration: number;
  easing: string;
  properties: string[];
}

// Error Types
export class VIB34DError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = 'VIB34DError';
  }
}