import visualizerData from '../presets/visualizer-presets.json';
import transitionData from '../presets/transition-presets.json';
import interactionData from '../presets/interaction-presets.json';
import effectData from '../presets/effect-presets.json';

export interface DensityPreset {
  base: number;
  variation: number;
}

export interface SpeedPreset {
  base: number;
  variation: number;
}

export interface ReactivityPreset {
  mouse: number;
  click: number;
  scroll: number;
}

export interface ColorPreset {
  palette: string;
  description?: string;
}

export interface VisualizerCollection {
  label: string;
  description?: string;
  density: string;
  speed: string;
  reactivity: string;
  color: string;
}

export interface PageTransitionPreset {
  outgoing: string;
  incoming: string;
  overlap: string;
  easing: string;
}

export interface CardTransitionPreset {
  from: string;
  animation: string;
  duration: string;
  easing: string;
}

export interface TransitionCollection {
  label: string;
  page: string;
  card: string;
}

export interface InteractionProfile {
  label: string;
  description?: string;
  reactivityPreset: string;
  hoverMultiplier: number;
  clickMultiplier: number;
  scrollMultiplier: number;
}

export interface HoverResponseConfig {
  target: Record<string, string>;
  others: Record<string, string>;
  transition: Record<string, string>;
}

export interface ClickResponseConfig {
  immediate: {
    colorInversion: string;
    variableInversion: Record<string, string>;
    rippleEffect: string;
    sparkleGeneration: string;
  };
  duration: Record<string, string>;
}

export interface ScrollableCardConfig {
  grid_layout: Record<string, string>;
  scroll_interactions: {
    visualizer_response: Record<string, string>;
    content_behavior: Record<string, string>;
  };
}

export interface VideoExpansionConfig {
  expansion_states: Record<string, Record<string, string>>;
  transitions: Record<string, Record<string, string>>;
}

export interface EffectDefinition {
  target_enhancement?: string;
  others_response?: string;
  transition_speed?: string;
  type?: string;
  duration?: string;
  decay?: string;
  intensity?: string;
  threshold?: string;
  buildup?: string;
  release?: string;
  synchronization?: string;
  pattern?: string;
}

export interface EffectCollection {
  label: string;
  hover: string;
  click: string;
  scroll: string;
}

interface VisualizerPresetData {
  collections: Record<string, VisualizerCollection>;
  density_presets: Record<string, DensityPreset>;
  speed_presets: Record<string, SpeedPreset>;
  reactivity_presets: Record<string, ReactivityPreset>;
  color_presets: Record<string, ColorPreset>;
}

interface TransitionPresetData {
  collections: Record<string, TransitionCollection>;
  page_transitions: Record<string, PageTransitionPreset>;
  card_transitions: Record<string, CardTransitionPreset>;
}

interface InteractionPresetData {
  profiles: Record<string, InteractionProfile>;
  hover_response: HoverResponseConfig;
  click_response: ClickResponseConfig;
  scrollable_cards: ScrollableCardConfig;
  video_expansion: VideoExpansionConfig;
}

interface EffectPresetData {
  collections: Record<string, EffectCollection>;
  hover_effects: Record<string, EffectDefinition>;
  click_effects: Record<string, EffectDefinition>;
  scroll_effects: Record<string, EffectDefinition>;
}

export type PresetCategory = 'visualizer' | 'transitions' | 'interactions' | 'effects';

type EffectCategory = 'hover' | 'click' | 'scroll';

export class PresetManager {
  private visualizer: VisualizerPresetData;
  private transitions: TransitionPresetData;
  private interactions: InteractionPresetData;
  private effects: EffectPresetData;

  private customVisualizerCollections: Record<string, VisualizerCollection> = {};
  private customDensityPresets: Record<string, DensityPreset> = {};
  private customSpeedPresets: Record<string, SpeedPreset> = {};
  private customReactivityPresets: Record<string, ReactivityPreset> = {};
  private customColorPresets: Record<string, ColorPreset> = {};

  constructor() {
    this.visualizer = visualizerData as VisualizerPresetData;
    this.transitions = transitionData as TransitionPresetData;
    this.interactions = interactionData as InteractionPresetData;
    this.effects = effectData as EffectPresetData;
  }

  listVisualizerCollections(): Array<{ value: string; label: string; description?: string }> {
    return Object.entries({ ...this.visualizer.collections, ...this.customVisualizerCollections }).map(([value, config]) => ({
      value,
      label: config.label,
      description: config.description
    }));
  }

  getVisualizerCollection(name: string): VisualizerCollection | undefined {
    return this.customVisualizerCollections[name] ?? this.visualizer.collections[name];
  }

  getDensityPreset(name: string): DensityPreset | undefined {
    return this.customDensityPresets[name] ?? this.visualizer.density_presets[name];
  }

  getSpeedPreset(name: string): SpeedPreset | undefined {
    return this.customSpeedPresets[name] ?? this.visualizer.speed_presets[name];
  }

  getReactivityPreset(name: string): ReactivityPreset | undefined {
    return this.customReactivityPresets[name] ?? this.visualizer.reactivity_presets[name];
  }

  getColorPreset(name: string): ColorPreset | undefined {
    return this.customColorPresets[name] ?? this.visualizer.color_presets[name];
  }

  listTransitionCollections(): Array<{ value: string; label: string }> {
    return Object.entries(this.transitions.collections).map(([value, config]) => ({
      value,
      label: config.label
    }));
  }

  getTransitionCollection(name: string): TransitionCollection | undefined {
    return this.transitions.collections[name];
  }

  getPageTransition(name: string): PageTransitionPreset | undefined {
    return this.transitions.page_transitions[name];
  }

  getCardTransition(name: string): CardTransitionPreset | undefined {
    return this.transitions.card_transitions[name];
  }

  listInteractionProfiles(): Array<{ value: string; label: string; description?: string }> {
    return Object.entries(this.interactions.profiles).map(([value, profile]) => ({
      value,
      label: profile.label,
      description: profile.description
    }));
  }

  getInteractionProfile(name: string): InteractionProfile | undefined {
    return this.interactions.profiles[name];
  }

  getHoverResponse(): HoverResponseConfig {
    return this.interactions.hover_response;
  }

  getClickResponse(): ClickResponseConfig {
    return this.interactions.click_response;
  }

  getScrollableCardConfig(): ScrollableCardConfig {
    return this.interactions.scrollable_cards;
  }

  getVideoExpansionConfig(): VideoExpansionConfig {
    return this.interactions.video_expansion;
  }

  listEffectCollections(): Array<{ value: string; label: string }> {
    return Object.entries(this.effects.collections).map(([value, config]) => ({
      value,
      label: config.label
    }));
  }

  getEffectCollection(name: string): EffectCollection | undefined {
    return this.effects.collections[name];
  }

  listHoverEffects(): string[] {
    return Object.keys(this.effects.hover_effects);
  }

  listClickEffects(): string[] {
    return Object.keys(this.effects.click_effects);
  }

  listScrollEffects(): string[] {
    return Object.keys(this.effects.scroll_effects);
  }

  getHoverEffect(name: string): EffectDefinition | undefined {
    return this.effects.hover_effects[name];
  }

  getClickEffect(name: string): EffectDefinition | undefined {
    return this.effects.click_effects[name];
  }

  getScrollEffect(name: string): EffectDefinition | undefined {
    return this.effects.scroll_effects[name];
  }

  resolveEffectCategory(effectName: string): EffectCategory | undefined {
    if (this.effects.hover_effects[effectName]) return 'hover';
    if (this.effects.click_effects[effectName]) return 'click';
    if (this.effects.scroll_effects[effectName]) return 'scroll';
    return undefined;
  }

  registerCustomVisualizerCollection(name: string, config: {
    density?: DensityPreset;
    speed?: SpeedPreset;
    reactivity?: ReactivityPreset;
    color?: ColorPreset;
    description?: string;
  }): VisualizerCollection {
    const densityKey = config.density ? `custom_${name}_density` : this.visualizer.collections.standard.density;
    const speedKey = config.speed ? `custom_${name}_speed` : this.visualizer.collections.standard.speed;
    const reactivityKey = config.reactivity ? `custom_${name}_reactivity` : this.visualizer.collections.standard.reactivity;
    const colorKey = config.color ? `custom_${name}_color` : this.visualizer.collections.standard.color;

    if (config.density) {
      this.customDensityPresets[densityKey] = config.density;
    }
    if (config.speed) {
      this.customSpeedPresets[speedKey] = config.speed;
    }
    if (config.reactivity) {
      this.customReactivityPresets[reactivityKey] = config.reactivity;
    }
    if (config.color) {
      this.customColorPresets[colorKey] = config.color;
    }

    const collection: VisualizerCollection = {
      label: `${name.replace(/_/g, ' ')} (Custom)`,
      description: config.description,
      density: densityKey,
      speed: speedKey,
      reactivity: reactivityKey,
      color: colorKey
    };

    this.customVisualizerCollections[name] = collection;
    return collection;
  }
}
