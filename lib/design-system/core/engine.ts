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
  PresetSelections
} from '@/lib/design-system/types/core';
import { PresetManager, EMPTY_PRESET_COLLECTION } from './preset-manager';
import { InteractionCoordinator } from './interaction-coordinator';
import { TransitionCoordinator } from './transition-coordinator';
import { PerformanceMonitor } from './performance-monitor';
import {
  cloneState,
  deriveVisualizerState,
  deriveInteractionState,
  deriveTransitionState
} from './state-utils';

export class VIB34DEngine implements IVIB34DEngine {
  private initialized = false;
  private currentState: SystemState | null = null;
  private readonly presetManager = new PresetManager();
  private readonly performanceMonitor = new PerformanceMonitor();
  private readonly interactionCoordinator = new InteractionCoordinator();
  private readonly transitionCoordinator = new TransitionCoordinator();
  private readonly stateListeners = new Set<(state: SystemState) => void>();
  private readonly presetListeners = new Set<(collection: PresetCollection) => void>();
  private activePresets: PresetSelections = { visualizer: null, interactions: null, transitions: null, effects: null };
  private unsubPerformance: (() => void) | null = null;
  private unsubPresets: (() => void) | null = null;
  private unsubInteractions: (() => void) | null = null;
  private unsubTransitions: (() => void) | null = null;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      await this.presetManager.loadAllPresets();
      this.syncActivePresets();
      this.applyCoordinatorPreset('interactions', this.getPresetForCategory('interactions'));
      this.applyCoordinatorPreset('transitions', this.getPresetForCategory('transitions'));
      this.currentState = this.buildState();
      this.unsubPerformance = this.performanceMonitor.subscribe((metrics) => {
        if (!this.currentState) return;
        const next = cloneState(this.currentState);
        next.visualizer.frameRate = metrics.fps;
        next.performance = { ...metrics };
        this.currentState = next;
        this.notifyStateListeners();
      });
      this.unsubPresets = this.presetManager.subscribe((category) => this.handlePresetLibraryUpdate(category));
      this.unsubInteractions = this.interactionCoordinator.subscribeActiveInteractions((count) => {
        if (!this.currentState) return;
        const next = cloneState(this.currentState);
        next.interactions.activeInteractions = count;
        this.currentState = next;
        this.notifyStateListeners();
      });
      this.unsubTransitions = this.transitionCoordinator.subscribeActiveTransitions((active) => {
        if (!this.currentState) return;
        const next = cloneState(this.currentState);
        next.transitions.activeTransitions = [...active];
        this.currentState = next;
        this.notifyStateListeners();
      });
      this.performanceMonitor.start();
      this.initialized = true;
      this.notifyPresetListeners();
      this.notifyStateListeners();
      console.log('🌟 VIB34D Engine initialized - A Paul Phillips Manifestation');
    } catch (error) {
      throw new VIB34DError('Failed to initialize VIB34D Engine', 'ENGINE_INIT_FAILED', { originalError: error });
    }
  }

  updatePreset(category: PresetCategory, name: string): void {
    if (!this.initialized) throw new VIB34DError('Engine not initialized', 'ENGINE_NOT_INITIALIZED');
    const preset = this.presetManager.getPreset(category, name);
    this.activePresets = { ...this.activePresets, [category]: preset.name };
    this.applyStateForPreset(category, preset);
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
    this.unsubPerformance?.();
    this.unsubPresets?.();
    this.unsubInteractions?.();
    this.unsubTransitions?.();
    this.performanceMonitor.stop();
    this.interactionCoordinator.cleanup();
    this.transitionCoordinator.cleanup();
    this.presetManager.dispose();
    this.unsubPerformance = null;
    this.unsubPresets = null;
    this.unsubInteractions = null;
    this.unsubTransitions = null;
    this.currentState = null;
    this.initialized = false;
    this.activePresets = { visualizer: null, interactions: null, transitions: null, effects: null };
    this.stateListeners.clear();
    this.presetListeners.clear();
  }

  private handlePresetLibraryUpdate(category: PresetCategory): void {
    this.syncActivePresets();
    const preset = this.getPresetForCategory(category);
    this.applyCoordinatorPreset(category, preset);
    if (category !== 'effects') this.applyStateForPreset(category, preset);
    this.notifyPresetListeners();
  }

  private applyStateForPreset(category: PresetCategory, preset: PresetDefinition | null): void {
    if (category === 'effects') return;
    this.applyCoordinatorPreset(category, preset);
    const baseState = this.currentState ?? this.buildState();
    const next = cloneState(baseState);
    const metrics = this.performanceMonitor.getMetrics();
    if (category === 'visualizer') {
      next.visualizer = deriveVisualizerState(preset, metrics);
    } else if (category === 'interactions') {
      next.interactions = deriveInteractionState(preset, this.interactionCoordinator.getActiveInteractions());
    } else if (category === 'transitions') {
      next.transitions = deriveTransitionState(preset, this.transitionCoordinator.getActiveTransitions());
    }
    next.performance = { ...metrics };
    next.visualizer.frameRate = metrics.fps;
    this.currentState = next;
    this.notifyStateListeners();
  }

  private buildState(): SystemState {
    const metrics = this.performanceMonitor.getMetrics();
    const visualizerPreset = this.getPresetForCategory('visualizer');
    const interactionPreset = this.getPresetForCategory('interactions');
    const transitionPreset = this.getPresetForCategory('transitions');
    this.applyCoordinatorPreset('interactions', interactionPreset);
    this.applyCoordinatorPreset('transitions', transitionPreset);
    return {
      visualizer: deriveVisualizerState(visualizerPreset, metrics),
      interactions: deriveInteractionState(interactionPreset, this.interactionCoordinator.getActiveInteractions()),
      transitions: deriveTransitionState(transitionPreset, this.transitionCoordinator.getActiveTransitions()),
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

  private applyCoordinatorPreset(category: PresetCategory, preset: PresetDefinition | null): void {
    if (category === 'interactions') {
      this.interactionCoordinator.applyPreset(preset);
    } else if (category === 'transitions') {
      this.transitionCoordinator.applyPreset(preset);
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
