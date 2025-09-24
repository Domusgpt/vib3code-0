/**
 * VIB34D Design System - Core Engine Implementation
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 * "The Revolution Will Not be in a Structured Format"
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 * Main orchestrator for the VIB34D design system.
 * Revolutionary constraint: MAX 250 lines for elegant architecture.
 */
import {
  VIB34DEngine as IVIB34DEngine,
  SystemState,
  PresetCategory,
  VIB34DError,
  PresetCollection,
  PresetDefinition,
  PresetSelections,
  PerformanceMetrics
} from '@/lib/design-system/types/core';
import { PresetManager, EMPTY_PRESET_COLLECTION } from './preset-manager';
interface PerformanceWithMemory extends Performance {
  memory?: { usedJSHeapSize: number };
}
class PerformanceMonitor {
  private metrics: PerformanceMetrics = { fps: 60, memoryUsage: 0, renderTime: 0, interactionLatency: 0 };
  private lastTimestamp = 0;
  private lastEmit = 0;
  private rafId: number | null = null;
  private running = false;
  private readonly listeners = new Set<(metrics: PerformanceMetrics) => void>();
  private readonly emitInterval = 250;
  start(): void {
    if (this.running || typeof window === 'undefined') return;
    this.running = true;
    this.lastTimestamp = performance.now();
    this.lastEmit = this.lastTimestamp;
    this.rafId = requestAnimationFrame(this.handleFrame);
  }
  stop(): void {
    if (!this.running) return;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.running = false;
  }
  subscribe(listener: (metrics: PerformanceMetrics) => void): () => void {
    this.listeners.add(listener);
    listener(this.getMetrics());
    return () => this.listeners.delete(listener);
  }
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
  private handleFrame = (timestamp: number): void => {
    if (!this.running) return;
    const delta = timestamp - this.lastTimestamp || 16.67;
    this.lastTimestamp = timestamp;
    const fps = delta > 0 ? 1000 / delta : 60;
    const smoothedFps = this.metrics.fps * 0.85 + fps * 0.15;
    const renderTime = Number(delta.toFixed(2));
    const interactionLatency = Math.max(0, Number((delta - 16.67).toFixed(2)));
    const memory = (performance as PerformanceWithMemory).memory;
    const memoryUsage = memory ? Number((memory.usedJSHeapSize / 1048576).toFixed(2)) : 0;
    this.metrics = {
      fps: Number(smoothedFps.toFixed(2)),
      memoryUsage,
      renderTime,
      interactionLatency
    };
    if (timestamp - this.lastEmit >= this.emitInterval) {
      const snapshot = this.getMetrics();
      for (const listener of this.listeners) listener(snapshot);
      this.lastEmit = timestamp;
    }
    this.rafId = requestAnimationFrame(this.handleFrame);
  };
}
export class VIB34DEngine implements IVIB34DEngine {
  private initialized = false;
  private currentState: SystemState | null = null;
  private readonly presetManager = new PresetManager();
  private readonly performanceMonitor = new PerformanceMonitor();
  private readonly stateListeners = new Set<(state: SystemState) => void>();
  private readonly presetListeners = new Set<(collection: PresetCollection) => void>();
  private activePresets: PresetSelections = { visualizer: null, interactions: null, transitions: null, effects: null };
  private unsubscribePerformance: (() => void) | null = null;
  private unsubscribePresets: (() => void) | null = null;
  async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      await this.presetManager.loadAllPresets();
      this.syncActivePresets();
      this.currentState = this.buildState();
      this.unsubscribePerformance = this.performanceMonitor.subscribe((metrics) => {
        if (!this.currentState) return;
        const next = cloneState(this.currentState);
        next.visualizer.frameRate = metrics.fps;
        next.performance = { ...metrics };
        this.currentState = next;
        this.notifyStateListeners();
      });
      this.unsubscribePresets = this.presetManager.subscribe((category) => this.handlePresetLibraryUpdate(category));
      this.performanceMonitor.start();
      this.initialized = true;
      this.notifyPresetListeners(); this.notifyStateListeners();
      console.log('🌟 VIB34D Engine initialized - A Paul Phillips Manifestation');
    } catch (error) {
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
    if (!this.currentState) throw new VIB34DError('System state not available', 'STATE_NOT_AVAILABLE');
    return cloneState(this.currentState);
  }
  getAvailablePresets(): PresetCollection {
    return this.initialized ? this.presetManager.getPresetCollection() : EMPTY_PRESET_COLLECTION;
  }
  getActivePresets(): PresetSelections {
    return { ...this.activePresets };
  }
  subscribe(listener: (state: SystemState) => void): () => void {
    this.stateListeners.add(listener);
    if (this.currentState) listener(cloneState(this.currentState));
    return () => this.stateListeners.delete(listener);
  }
  onPresetsChange(listener: (collection: PresetCollection) => void): () => void {
    this.presetListeners.add(listener);
    listener(this.getAvailablePresets());
    return () => this.presetListeners.delete(listener);
  }
  dispose(): void {
    if (this.unsubscribePerformance) this.unsubscribePerformance();
    if (this.unsubscribePresets) this.unsubscribePresets();
    this.performanceMonitor.stop();
    this.presetManager.dispose();
    this.unsubscribePerformance = null; this.unsubscribePresets = null;
    this.currentState = null; this.initialized = false;
    this.activePresets = { visualizer: null, interactions: null, transitions: null, effects: null };
    this.stateListeners.clear(); this.presetListeners.clear();
  }
  private handlePresetLibraryUpdate(category: PresetCategory): void {
    this.syncActivePresets();
    if (category !== 'effects') this.applyPreset(category, this.getPresetForCategory(category));
    this.notifyPresetListeners();
  }
  private applyPreset(category: PresetCategory, preset: PresetDefinition | null): void {
    if (category === 'effects') return;
    const baseState = this.currentState ?? this.buildState();
    const next = cloneState(baseState);
    const metrics = this.performanceMonitor.getMetrics();
    if (category === 'visualizer') {
      next.visualizer = deriveVisualizerState(preset, metrics);
    } else if (category === 'interactions') {
      next.interactions = deriveInteractionState(preset, baseState.interactions.activeInteractions);
    } else if (category === 'transitions') {
      next.transitions = deriveTransitionState(preset, baseState.transitions.activeTransitions);
    }
    next.performance = { ...metrics }; next.visualizer.frameRate = metrics.fps;
    this.currentState = next;
    this.notifyStateListeners();
  }
  private buildState(): SystemState {
    const metrics = this.performanceMonitor.getMetrics();
    return {
      visualizer: deriveVisualizerState(this.getPresetForCategory('visualizer'), metrics),
      interactions: deriveInteractionState(this.getPresetForCategory('interactions'), 0),
      transitions: deriveTransitionState(this.getPresetForCategory('transitions'), []),
      performance: { ...metrics }
    };
  }
  private getPresetForCategory(category: PresetCategory): PresetDefinition | null {
    const name = this.activePresets[category];
    if (!name) return null;
    try {
      return this.presetManager.getPreset(category, name);
    } catch {
      return null;
    }
  }
  private syncActivePresets(): void {
    const collection = this.presetManager.getPresetCollection();
    (Object.keys(collection) as PresetCategory[]).forEach((category) => {
      const available = collection[category];
      const current = this.activePresets[category];
      this.activePresets[category] = current && available.some((preset) => preset.name === current)
        ? current
        : available[0]?.name ?? null;
    });
  }
  private notifyStateListeners(): void {
    if (!this.currentState) return;
    const snapshot = cloneState(this.currentState);
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
    transitions: { ...state.transitions, activeTransitions: [...state.transitions.activeTransitions] },
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
function deriveInteractionState(preset: PresetDefinition | null, activeInteractions: number) {
  const parameters = preset?.parameters ?? {};
  return {
    hoverEffect: extractString(parameters.hoverEffect, 'lift_glow'),
    clickEffect: extractString(parameters.clickEffect, 'ripple_expand'),
    scrollEffect: extractString(parameters.scrollEffect, 'parallax_smooth'),
    sensitivity: clampNumber(parameters.sensitivity, 0, 1, 0.5),
    activeInteractions
  };
}
function deriveTransitionState(preset: PresetDefinition | null, activeTransitions: string[]) {
  const parameters = preset?.parameters ?? {};
  return {
    pageTransition: extractString(parameters.pageTransition, 'dimensional_slide'),
    cardTransition: extractString(parameters.cardTransition, 'portal_expand'),
    duration: clampNumber(parameters.duration, 100, 5000, 800),
    easing: extractString(parameters.easing, 'cubic-bezier(0.4, 0.0, 0.2, 1)'),
    activeTransitions: [...activeTransitions]
  };
}
function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}
function extractString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}
