import { PresetManager, type PresetCategory, type VisualizerCollection, type DensityPreset, type SpeedPreset, type ReactivityPreset, type ColorPreset, type PageTransitionPreset, type CardTransitionPreset, type EffectCollection, type EffectDefinition } from './preset-manager';
import { InteractionCoordinator, type InteractionState } from './interaction-coordinator';
import { TransitionCoordinator, type CoordinatedTransition, type CardTransitionSequence } from './transition-coordinator';

type ContainerInput = string | HTMLElement | null | undefined;

export interface VIB34DCustomization {
  speedMultiplier: number;
  sensitivityMultiplier: number;
  transitionDurationMultiplier: number;
}

export interface VIB34DOptions {
  container?: ContainerInput;
  presets?: {
    visualizer?: string;
    interactions?: string;
    transitions?: string;
    effects?: string;
  };
  customization?: Partial<VIB34DCustomization>;
}

export interface EffectState {
  collection?: string;
  hover: { name: string; definition?: EffectDefinition };
  click: { name: string; definition?: EffectDefinition };
  scroll: { name: string; definition?: EffectDefinition };
}

export interface VisualizerState {
  collectionName: string;
  collection: VisualizerCollection;
  density: DensityPreset & { name: string };
  speed: SpeedPreset & { name: string };
  reactivity: ReactivityPreset & { name: string };
  color: ColorPreset & { name: string };
}

export interface TransitionState {
  collectionName: string;
  collection: { label: string; page: string; card: string };
  page: PageTransitionPreset & { name: string };
  card: CardTransitionPreset & { name: string };
  coordination: CoordinatedTransition;
  cardSequence: CardTransitionSequence;
}

export interface VIB34DState {
  container?: HTMLElement | null;
  presets: {
    visualizerCollection: string;
    transitionCollection: string;
    interactionProfile: string;
    effectsSelection: string;
  };
  visualizer: VisualizerState;
  transitions: TransitionState;
  interaction: InteractionState;
  effects: EffectState;
  customization: VIB34DCustomization;
}

type StateListener = (state: VIB34DState) => void;

type CardMapping = {
  direction: 'emergence' | 'submersion';
  variant: string;
};

const DEFAULT_CUSTOMIZATION: VIB34DCustomization = {
  speedMultiplier: 1,
  sensitivityMultiplier: 1,
  transitionDurationMultiplier: 1
};

const CARD_MAPPING: Record<string, CardMapping> = {
  gentle_emerge: { direction: 'emergence', variant: 'from_background' },
  dramatic_burst: { direction: 'emergence', variant: 'from_center' },
  liquid_flow: { direction: 'emergence', variant: 'edge_of_screen' }
};

function resolveContainer(container: ContainerInput): HTMLElement | null | undefined {
  if (!container) return undefined;
  if (typeof container === 'string') {
    if (typeof window === 'undefined') return undefined;
    return document.querySelector(container) as HTMLElement | null;
  }
  return container;
}

function require<T>(value: T | undefined, message: string): T {
  if (!value) {
    throw new Error(message);
  }
  return value;
}

export class VIB34DSystem {
  private presetManager = new PresetManager();
  private transitionCoordinator = new TransitionCoordinator();
  private interactionCoordinator: InteractionCoordinator;
  private interactionUnsubscribe?: () => void;
  private listeners: Set<StateListener> = new Set();
  private state: VIB34DState;

  constructor(options: VIB34DOptions = {}) {
    const visualizerCollection = options.presets?.visualizer ?? 'standard';
    const transitionCollection = options.presets?.transitions ?? 'slide_portal';
    const interactionProfile = options.presets?.interactions ?? 'responsive';
    const effectsSelection = options.presets?.effects ?? 'subtle_glow';
    const customization: VIB34DCustomization = {
      ...DEFAULT_CUSTOMIZATION,
      ...options.customization
    };

    const visualizer = this.computeVisualizerState(visualizerCollection);
    const transitions = this.computeTransitionState(transitionCollection, customization.transitionDurationMultiplier);
    const effects = this.computeEffectState(effectsSelection);

    const profile = require(
      this.presetManager.getInteractionProfile(interactionProfile),
      `Unknown interaction profile: ${interactionProfile}`
    );

    const reactivity = require(
      this.presetManager.getReactivityPreset(profile.reactivityPreset),
      `Unknown reactivity preset: ${profile.reactivityPreset}`
    );

    this.interactionCoordinator = new InteractionCoordinator({
      profileName: interactionProfile,
      profile,
      reactivity,
      hoverResponse: this.presetManager.getHoverResponse(),
      clickResponse: this.presetManager.getClickResponse(),
      scrollableCards: this.presetManager.getScrollableCardConfig(),
      videoExpansion: this.presetManager.getVideoExpansionConfig()
    });

    const container = resolveContainer(options.container);

    this.state = {
      container,
      presets: {
        visualizerCollection,
        transitionCollection,
        interactionProfile,
        effectsSelection
      },
      visualizer,
      transitions,
      interaction: this.interactionCoordinator.getState(),
      effects,
      customization
    };

    this.interactionUnsubscribe = this.interactionCoordinator.subscribe((interactionState) => {
      this.state = {
        ...this.state,
        interaction: interactionState
      };
      this.notify();
    });
  }

  private computeVisualizerState(collectionName: string): VisualizerState {
    const collection = this.presetManager.getVisualizerCollection(collectionName) ??
      require(this.presetManager.getVisualizerCollection('standard'), 'Missing standard visualizer collection');

    const densityPreset = require(
      this.presetManager.getDensityPreset(collection.density),
      `Unknown density preset: ${collection.density}`
    );
    const speedPreset = require(
      this.presetManager.getSpeedPreset(collection.speed),
      `Unknown speed preset: ${collection.speed}`
    );
    const reactivityPreset = require(
      this.presetManager.getReactivityPreset(collection.reactivity),
      `Unknown reactivity preset: ${collection.reactivity}`
    );
    const colorPreset = require(
      this.presetManager.getColorPreset(collection.color),
      `Unknown color preset: ${collection.color}`
    );

    return {
      collectionName,
      collection,
      density: { name: collection.density, ...densityPreset },
      speed: { name: collection.speed, ...speedPreset },
      reactivity: { name: collection.reactivity, ...reactivityPreset },
      color: { name: collection.color, ...colorPreset }
    };
  }

  private computeTransitionState(collectionName: string, durationMultiplier: number): TransitionState {
    const collection = this.presetManager.getTransitionCollection(collectionName) ??
      require(this.presetManager.getTransitionCollection('slide_portal'), 'Missing slide_portal transition collection');

    const page = require(
      this.presetManager.getPageTransition(collection.page),
      `Unknown page transition preset: ${collection.page}`
    );
    const card = require(
      this.presetManager.getCardTransition(collection.card),
      `Unknown card transition preset: ${collection.card}`
    );

    const coordination = this.transitionCoordinator.buildPageTransition(page, durationMultiplier);

    const mapping = CARD_MAPPING[collection.card] ?? CARD_MAPPING.gentle_emerge;
    const cardSequence = this.transitionCoordinator.buildCardTransition(
      mapping.direction,
      mapping.variant,
      card,
      durationMultiplier
    );

    return {
      collectionName,
      collection,
      page: { name: collection.page, ...page },
      card: { name: collection.card, ...card },
      coordination,
      cardSequence
    };
  }

  private computeEffectState(selection: string): EffectState {
    const collection = this.presetManager.getEffectCollection(selection);

    if (collection) {
      return this.buildEffectStateFromCollection(collection, selection);
    }

    const category = this.presetManager.resolveEffectCategory(selection);

    let hover = this.state?.effects?.hover?.name ?? 'subtle_glow';
    let click = this.state?.effects?.click?.name ?? 'color_inversion';
    let scroll = this.state?.effects?.scroll?.name ?? 'momentum_trails';

    if (category === 'hover') {
      hover = selection;
    } else if (category === 'click') {
      click = selection;
    } else if (category === 'scroll') {
      scroll = selection;
    }

    return this.buildEffectState({ hover, click, scroll }, undefined);
  }

  private buildEffectStateFromCollection(collection: EffectCollection, selection: string): EffectState {
    return this.buildEffectState({
      hover: collection.hover,
      click: collection.click,
      scroll: collection.scroll
    }, selection);
  }

  private buildEffectState({ hover, click, scroll }: { hover: string; click: string; scroll: string }, collection?: string): EffectState {
    return {
      collection,
      hover: { name: hover, definition: this.presetManager.getHoverEffect(hover) },
      click: { name: click, definition: this.presetManager.getClickEffect(click) },
      scroll: { name: scroll, definition: this.presetManager.getScrollEffect(scroll) }
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  getState(): VIB34DState {
    return this.state;
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  switchPreset(category: PresetCategory, name: string) {
    switch (category) {
      case 'visualizer':
        this.state = {
          ...this.state,
          presets: { ...this.state.presets, visualizerCollection: name },
          visualizer: this.computeVisualizerState(name)
        };
        this.reapplyInteractionProfile(this.state.presets.interactionProfile);
        break;
      case 'transitions':
        this.state = {
          ...this.state,
          presets: { ...this.state.presets, transitionCollection: name },
          transitions: this.computeTransitionState(name, this.state.customization.transitionDurationMultiplier)
        };
        break;
      case 'interactions':
        this.applyInteractionProfile(name);
        break;
      case 'effects':
        this.state = {
          ...this.state,
          presets: { ...this.state.presets, effectsSelection: name },
          effects: this.computeEffectState(name)
        };
        break;
    }
    this.notify();
  }

  private applyInteractionProfile(name: string) {
    const profile = require(
      this.presetManager.getInteractionProfile(name),
      `Unknown interaction profile: ${name}`
    );
    const reactivity = require(
      this.presetManager.getReactivityPreset(profile.reactivityPreset),
      `Unknown reactivity preset: ${profile.reactivityPreset}`
    );

    this.interactionCoordinator.setProfile(name, profile, reactivity);
    this.state = {
      ...this.state,
      presets: { ...this.state.presets, interactionProfile: name }
    };
  }

  private reapplyInteractionProfile(name: string) {
    const profile = this.presetManager.getInteractionProfile(name);
    if (!profile) return;
    const reactivity = this.presetManager.getReactivityPreset(profile.reactivityPreset);
    if (!reactivity) return;
    this.interactionCoordinator.setProfile(name, profile, reactivity);
  }

  createCustomPreset(name: string, config: {
    density?: DensityPreset;
    speed?: SpeedPreset;
    reactivity?: ReactivityPreset;
    color?: ColorPreset;
    description?: string;
  }) {
    this.presetManager.registerCustomVisualizerCollection(name, config);
    this.switchPreset('visualizer', name);
  }

  updateCustomization(update: Partial<VIB34DCustomization>) {
    const customization = { ...this.state.customization, ...update };
    this.state = {
      ...this.state,
      customization,
      transitions: this.computeTransitionState(
        this.state.presets.transitionCollection,
        customization.transitionDurationMultiplier
      )
    };
    this.notify();
  }

  attachInteractiveElement(id: string, element: HTMLElement, group?: string) {
    this.interactionCoordinator.registerElement(id, element, group);
  }

  detachInteractiveElement(id: string) {
    this.interactionCoordinator.unregisterElement(id);
  }

  applyScrollVelocity(velocity: number) {
    this.interactionCoordinator.applyScrollIntensity(velocity);
  }

  destroy() {
    if (this.interactionUnsubscribe) {
      this.interactionUnsubscribe();
      this.interactionUnsubscribe = undefined;
    }
    this.interactionCoordinator.destroy();
    this.listeners.clear();
  }
}
