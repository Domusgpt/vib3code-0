import PresetManager from './preset-manager';
import InteractionCoordinator, { VisualizerUpdateMap } from './interaction-coordinator';
import TransitionCoordinator, { TRANSITION_BASE_DURATION } from './transition-coordinator';
import {
  DesignSystemSelection,
  VisualizerEngineSnapshot,
  VisualizerInstance,
  VisualizerComputedState,
  InteractionStateSnapshot,
  TransitionSession
} from './types';

const DEFAULT_SELECTION: DesignSystemSelection = {
  density: 'standard',
  speed: 'flowing',
  reactivity: 'responsive',
  colorScheme: 'triadic',
  hoverEffect: 'subtle_glow',
  clickEffect: 'color_inversion',
  scrollEffect: 'momentum_trails',
  pageTransition: 'slide_portal',
  cardTransition: 'gentle_emerge',
  globalSpeedMultiplier: 1,
  interactionSensitivity: 1,
  transitionDurationMultiplier: 1
};

function cloneState(state: VisualizerComputedState): VisualizerComputedState {
  return JSON.parse(JSON.stringify(state));
}

export type EngineSubscriber = (snapshot: VisualizerEngineSnapshot) => void;

export class VisualizerEngine {
  private presetManager: PresetManager;
  private interactionCoordinator: InteractionCoordinator;
  private transitionCoordinator: TransitionCoordinator;
  private instances = new Map<string, VisualizerInstance>();
  private selection: DesignSystemSelection = { ...DEFAULT_SELECTION };
  private listeners = new Set<EngineSubscriber>();
  private activeTransition: TransitionSession | null = null;

  constructor(presetManager = new PresetManager()) {
    this.presetManager = presetManager;
    this.interactionCoordinator = new InteractionCoordinator();
    this.transitionCoordinator = new TransitionCoordinator();
  }

  registerVisualizer(id: string, overrides?: Partial<VisualizerComputedState>) {
    const timestamp = Date.now();
    const baseState = this.createBaseState(timestamp, overrides);

    const instance: VisualizerInstance = {
      id,
      baseState: baseState,
      currentState: cloneState(baseState),
      overrides
    };

    this.instances.set(id, instance);
    this.notify();
    return instance;
  }

  unregisterVisualizer(id: string) {
    this.instances.delete(id);
    this.notify();
  }

  private createBaseState(timestamp: number, overrides?: Partial<VisualizerComputedState>) {
    const baseState = this.presetManager.composeVisualizerState(this.selection, timestamp);
    return {
      ...baseState,
      ...(overrides || {})
    };
  }

  setSelection(selection: Partial<DesignSystemSelection>) {
    this.selection = {
      ...this.selection,
      ...selection
    };

    const timestamp = Date.now();
    this.instances.forEach((instance) => {
      const baseState = this.createBaseState(timestamp, instance.overrides);
      instance.baseState = cloneState(baseState);
      instance.currentState = {
        ...instance.currentState,
        ...baseState,
        isInverted: false,
        rippleActive: false,
        sparkles: 0,
        lastUpdated: timestamp
      };
    });

    this.notify();
  }

  getSelection() {
    return this.selection;
  }

  startTransition(outgoingId: string, incomingId: string) {
    const timestamp = Date.now();
    const duration = TRANSITION_BASE_DURATION * this.selection.transitionDurationMultiplier;
    this.transitionCoordinator.startTransition(outgoingId, incomingId, this.instances, timestamp, this.selection.transitionDurationMultiplier);
    this.activeTransition = {
      outgoingId,
      incomingId,
      startedAt: timestamp,
      duration
    };
    this.notify();
  }

  triggerHover(targetId: string) {
    const timestamp = Date.now();
    const updates = this.interactionCoordinator.applyHover(targetId, Array.from(this.instances.values()), timestamp);
    this.applyUpdates(updates);
  }

  clearHover() {
    const timestamp = Date.now();
    const updates = this.interactionCoordinator.clearHover(Array.from(this.instances.values()), timestamp);
    if (updates) this.applyUpdates(updates);
  }

  triggerClick() {
    const timestamp = Date.now();
    const updates = this.interactionCoordinator.applyClick(Array.from(this.instances.values()), timestamp);
    this.applyUpdates(updates);
  }

  triggerScroll(direction: 'up' | 'down', velocity: number) {
    const timestamp = Date.now();
    const updates = this.interactionCoordinator.applyScroll(direction, velocity, Array.from(this.instances.values()), timestamp);
    this.applyUpdates(updates);
  }

  updateInstanceOverrides(id: string, overrides: Partial<VisualizerComputedState>) {
    const instance = this.instances.get(id);
    if (!instance) return;
    instance.overrides = overrides;
    const timestamp = Date.now();
    const baseState = this.createBaseState(timestamp, overrides);
    instance.baseState = cloneState(baseState);
    instance.currentState = {
      ...instance.currentState,
      ...baseState,
      lastUpdated: timestamp
    };
    this.notify();
  }

  tick(timestamp: number = Date.now()) {
    const instancesArray = Array.from(this.instances.values());
    const interactionUpdates = this.interactionCoordinator.update(instancesArray, timestamp);
    if (interactionUpdates) {
      this.applyUpdates(interactionUpdates);
    }

    const transitionUpdates = this.transitionCoordinator.update(this.instances, timestamp);
    if (transitionUpdates) {
      this.applyUpdates(transitionUpdates);
      if (!this.transitionCoordinator.isActive()) {
        this.activeTransition = null;
      }
    }
  }

  subscribe(listener: EngineSubscriber) {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot(): VisualizerEngineSnapshot {
    const visualizers: Record<string, VisualizerComputedState> = {};
    this.instances.forEach((instance) => {
      visualizers[instance.id] = instance.currentState;
    });

    return {
      visualizers,
      interactions: this.interactionCoordinator.getState() as InteractionStateSnapshot | null,
      activeTransition: this.activeTransition
    };
  }

  private applyUpdates(updateMap: VisualizerUpdateMap | null) {
    if (!updateMap) return;
    Object.entries(updateMap).forEach(([id, state]) => {
      const instance = this.instances.get(id);
      if (!instance) return;
      instance.currentState = {
        ...instance.currentState,
        ...state
      };
    });

    this.notify();
  }

  private notify() {
    const snapshot = this.getSnapshot();
    this.listeners.forEach((listener) => listener(snapshot));
  }
}

export default VisualizerEngine;
