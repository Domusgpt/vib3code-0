/**
 * VIB34D Design System - Core Engine Implementation
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 * "The Revolution Will Not be in a Structured Format"
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 * Unified orchestration engine for presets, performance, and coordinators.
 */

import {
  VIB34DEngine as IVIB34DEngine,
  SystemState,
  PresetCategory,
  VIB34DError,
  PresetCollection,
  PresetDefinition,
  PresetSelections,
  PerformanceMetrics,
  InteractionActivity,
  TransitionActivity
} from '@/lib/design-system/types/core';
import { PresetManager, EMPTY_PRESET_COLLECTION } from './preset-manager';
import { InteractionCoordinator } from './interaction-coordinator';
import { TransitionCoordinator } from './transition-coordinator';

type PerformanceWithMemory = Performance & { memory?: { usedJSHeapSize: number } };
type StateListener = (state: SystemState) => void; type PresetListener = (collection: PresetCollection) => void;

class PerformanceMonitor {
  private metrics: PerformanceMetrics = { fps: 60, memoryUsage: 0, renderTime: 0, interactionLatency: 0 };
  private rafId: number | null = null; private lastFrame = 0; private lastEmit = 0;
  private readonly listeners = new Set<(metrics: PerformanceMetrics) => void>();
  start(): void { if (this.rafId !== null || typeof window === 'undefined') return; this.lastFrame = performance.now(); this.lastEmit = this.lastFrame; this.rafId = requestAnimationFrame(this.frame); }
  stop(): void { if (this.rafId !== null) cancelAnimationFrame(this.rafId); this.rafId = null; }
  subscribe(listener: (metrics: PerformanceMetrics) => void): () => void { this.listeners.add(listener); listener(this.getMetrics()); return () => this.listeners.delete(listener); }
  getMetrics(): PerformanceMetrics { return { ...this.metrics }; }
  private frame = (timestamp: number): void => {
    if (this.rafId === null) return;
    const delta = timestamp - this.lastFrame || 16.67; this.lastFrame = timestamp;
    const fps = delta > 0 ? 1000 / delta : 60; const memory = (performance as PerformanceWithMemory).memory;
    this.metrics = {
      fps: Number((this.metrics.fps * 0.8 + fps * 0.2).toFixed(2)),
      memoryUsage: memory ? Number((memory.usedJSHeapSize / 1048576).toFixed(2)) : 0,
      renderTime: Number(delta.toFixed(2)),
      interactionLatency: Math.max(0, Number((delta - 16.67).toFixed(2)))
    };
    if (timestamp - this.lastEmit >= 250) {
      this.lastEmit = timestamp;
      const snapshot = this.getMetrics();
      for (const listener of this.listeners) listener(snapshot);
    }
    this.rafId = requestAnimationFrame(this.frame);
  };
}

export class VIB34DEngine implements IVIB34DEngine {
  private initialized = false; private state: SystemState | null = null;
  private activePresets: PresetSelections = { visualizer: null, interactions: null, transitions: null, effects: null };
  private readonly presetManager = new PresetManager(); private readonly performanceMonitor = new PerformanceMonitor();
  private readonly interactionCoordinator = new InteractionCoordinator(); private readonly transitionCoordinator = new TransitionCoordinator();
  private readonly stateListeners = new Set<StateListener>(); private readonly presetListeners = new Set<PresetListener>();
  private unsubscribePerf: (() => void) | null = null; private unsubscribePresets: (() => void) | null = null;
  private unsubscribeInteractions: (() => void) | null = null; private unsubscribeTransitions: (() => void) | null = null;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      await this.presetManager.loadAllPresets();
      this.syncActivePresets();
      this.state = this.buildState();
      this.unsubscribePerf = this.performanceMonitor.subscribe(this.updatePerformance);
      this.unsubscribePresets = this.presetManager.subscribe((category) => this.handlePresetLibraryUpdate(category));
      this.unsubscribeInteractions = this.interactionCoordinator.subscribe((activity) => this.handleInteractionActivity(activity));
      this.unsubscribeTransitions = this.transitionCoordinator.subscribe((activity) => this.handleTransitionActivity(activity));
      this.performanceMonitor.start(); this.initialized = true;
      this.notifyPresetListeners(); this.notifyStateListeners();
    } catch (error) {
      this.dispose();
      throw new VIB34DError('Failed to initialize VIB34D Engine', 'ENGINE_INIT_FAILED', { originalError: error });
    }
  }
  updatePreset(category: PresetCategory, name: string): void {
    if (!this.initialized) throw new VIB34DError('Engine not initialized', 'ENGINE_NOT_INITIALIZED');
    const preset = this.presetManager.getPreset(category, name);
    this.activePresets = { ...this.activePresets, [category]: preset.name };
    this.applyPreset(category, preset);
  }
  getCurrentState(): SystemState {
    if (!this.state) throw new VIB34DError('System state not available', 'STATE_NOT_AVAILABLE');
    return cloneState(this.state);
  }
  getAvailablePresets(): PresetCollection {
    return this.initialized ? this.presetManager.getPresetCollection() : EMPTY_PRESET_COLLECTION;
  }
  getActivePresets(): PresetSelections { return { ...this.activePresets }; }
  getInteractionCoordinator(): InteractionCoordinator { return this.interactionCoordinator; }
  getTransitionCoordinator(): TransitionCoordinator { return this.transitionCoordinator; }
  subscribe(listener: StateListener): () => void { this.stateListeners.add(listener); if (this.state) listener(cloneState(this.state)); return () => this.stateListeners.delete(listener); }
  onPresetsChange(listener: PresetListener): () => void { this.presetListeners.add(listener); listener(this.getAvailablePresets()); return () => this.presetListeners.delete(listener); }

  dispose(): void {
    this.unsubscribePerf?.(); this.unsubscribePresets?.(); this.unsubscribeInteractions?.(); this.unsubscribeTransitions?.();
    this.unsubscribePerf = this.unsubscribePresets = this.unsubscribeInteractions = this.unsubscribeTransitions = null;
    this.performanceMonitor.stop(); this.interactionCoordinator.cleanup(); this.transitionCoordinator.cleanup(); this.presetManager.dispose();
    this.state = null; this.initialized = false;
    this.activePresets = { visualizer: null, interactions: null, transitions: null, effects: null };
    this.stateListeners.clear(); this.presetListeners.clear();
  }

  private updatePerformance = (metrics: PerformanceMetrics): void => {
    if (!this.state) return; const next = cloneState(this.state);
    next.visualizer.frameRate = metrics.fps; next.performance = { ...metrics };
    this.state = next; this.notifyStateListeners();
  };

  private handlePresetLibraryUpdate(category: PresetCategory): void {
    this.syncActivePresets(); if (category !== 'effects') this.applyPreset(category, this.getPresetForCategory(category)); this.notifyPresetListeners();
  }

  private handleInteractionActivity(activity: InteractionActivity): void {
    if (!this.state) return; const next = cloneState(this.state);
    next.interactions.activeInteractions = activity.activeCount;
    next.interactions.lastInteractionType = activity.lastEvent?.type ?? null;
    next.interactions.lastInteractionTime = activity.lastEvent?.timestamp ?? null;
    this.state = next; this.notifyStateListeners();
  }

  private handleTransitionActivity(activity: TransitionActivity): void {
    if (!this.state) return; const next = cloneState(this.state);
    next.transitions.activeTransitions = [...activity.activeTransitions];
    next.transitions.currentTransition = activity.currentTransition;
    next.transitions.lastTransition = activity.lastTransition ? { ...activity.lastTransition } : null;
    this.state = next; this.notifyStateListeners();
  }
  private applyPreset(category: PresetCategory, preset: PresetDefinition | null): void {
    const base = this.state ?? this.buildState(); const metrics = this.performanceMonitor.getMetrics(); const next = cloneState(base);
    if (category === 'visualizer') next.visualizer = deriveVisualizerState(preset, metrics);
    else if (category === 'interactions') next.interactions = deriveInteractionState(preset, this.interactionCoordinator.getActivitySnapshot());
    else if (category === 'transitions') next.transitions = deriveTransitionState(preset, this.transitionCoordinator.getActivitySnapshot());
    this.configureCoordinators(next); next.performance = { ...metrics }; next.visualizer.frameRate = metrics.fps;
    this.state = next; this.notifyStateListeners();
  }
  private buildState(): SystemState {
    const metrics = this.performanceMonitor.getMetrics();
    const state: SystemState = {
      visualizer: deriveVisualizerState(this.getPresetForCategory('visualizer'), metrics),
      interactions: deriveInteractionState(this.getPresetForCategory('interactions'), this.interactionCoordinator.getActivitySnapshot()),
      transitions: deriveTransitionState(this.getPresetForCategory('transitions'), this.transitionCoordinator.getActivitySnapshot()),
      performance: { ...metrics }
    };
    state.visualizer.frameRate = metrics.fps; this.configureCoordinators(state); return state;
  }
  private configureCoordinators(state: SystemState): void {
    this.interactionCoordinator.configure({ sensitivity: state.interactions.sensitivity });
    const duration = state.transitions.duration; const easing = state.transitions.easing;
    this.transitionCoordinator.registerTransition(state.transitions.pageTransition, {
      type: state.transitions.pageTransition, duration, easing, properties: ['opacity', 'transform']
    });
    this.transitionCoordinator.registerTransition(state.transitions.cardTransition, {
      type: state.transitions.cardTransition, duration, easing, properties: ['transform', 'box-shadow', 'opacity']
    });
  }
  private getPresetForCategory(category: PresetCategory): PresetDefinition | null {
    const name = this.activePresets[category]; if (!name) return null;
    try { return this.presetManager.getPreset(category, name); } catch { return null; }
  }
  private syncActivePresets(): void {
    const collection = this.presetManager.getPresetCollection();
    (Object.keys(collection) as PresetCategory[]).forEach((category) => {
      const available = collection[category]; const current = this.activePresets[category];
      this.activePresets[category] = current && available.some((preset) => preset.name === current) ? current : available[0]?.name ?? null;
    });
  }
  private notifyStateListeners(): void {
    if (!this.state) return; const snapshot = cloneState(this.state);
    for (const listener of this.stateListeners) listener(snapshot);
  }
  private notifyPresetListeners(): void {
    const snapshot = this.getAvailablePresets();
    for (const listener of this.presetListeners) listener(snapshot);
  }
}

export const vib34dEngine = new VIB34DEngine();
function cloneState(state: SystemState): SystemState {
  return {
    visualizer: { ...state.visualizer },
    interactions: { ...state.interactions },
    transitions: { ...state.transitions, activeTransitions: [...state.transitions.activeTransitions], lastTransition: state.transitions.lastTransition ? { ...state.transitions.lastTransition } : null },
    performance: { ...state.performance }
  };
}
function deriveVisualizerState(preset: PresetDefinition | null, metrics: PerformanceMetrics) {
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
function deriveInteractionState(preset: PresetDefinition | null, activity: InteractionActivity) {
  const parameters = preset?.parameters ?? {}; const lastEvent = activity.lastEvent ?? null;
  return {
    hoverEffect: extractString(parameters.hoverEffect, 'lift_glow'),
    clickEffect: extractString(parameters.clickEffect, 'ripple_expand'),
    scrollEffect: extractString(parameters.scrollEffect, 'parallax_smooth'),
    sensitivity: clampNumber(parameters.sensitivity, 0, 1, 0.5),
    activeInteractions: activity.activeCount,
    lastInteractionType: lastEvent?.type ?? null,
    lastInteractionTime: lastEvent?.timestamp ?? null
  };
}
function deriveTransitionState(preset: PresetDefinition | null, activity: TransitionActivity) {
  const parameters = preset?.parameters ?? {};
  return {
    pageTransition: extractString(parameters.pageTransition, 'dimensional_slide'),
    cardTransition: extractString(parameters.cardTransition, 'portal_expand'),
    duration: clampNumber(parameters.duration, 100, 5000, 800),
    easing: extractString(parameters.easing, 'cubic-bezier(0.4, 0.0, 0.2, 1)'),
    activeTransitions: [...activity.activeTransitions],
    currentTransition: activity.currentTransition,
    lastTransition: activity.lastTransition ? { ...activity.lastTransition } : null
  };
}
function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}
function extractString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}
