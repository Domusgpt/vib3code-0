export type NumericOperation = `increase_${number}x` | `decrease_${number}x`;
export type DepthOperation = `lift_forward_${number}px` | `push_back_${number}px`;
export type DurationString = `${number}ms`;

export interface HoverAdjustments {
  gridDensity: NumericOperation;
  colorIntensity: NumericOperation;
  reactivity: NumericOperation;
  depth: DepthOperation;
}

export interface HoverResponsePattern {
  target: HoverAdjustments;
  others: HoverAdjustments;
  transition: {
    duration: DurationString;
    easing: string;
    stagger: DurationString;
  };
}

export interface ClickResponsePattern {
  immediate: {
    colorInversion: 'full_spectrum' | 'partial';
    variableInversion: {
      speed: 'reverse_direction' | 'none';
      density: 'inverse_value' | 'none';
      intensity: 'flip_polarity' | 'none';
    };
    rippleEffect: 'radial_burst' | 'none';
    sparkleGeneration: `${number}_particles`;
  };
  duration: {
    inversion: DurationString;
    decay: DurationString;
    sparkles: DurationString;
  };
}

export interface TransitionPhaseTiming {
  phase: string;
  start: number;
  end: number;
}

export interface TransitionCoordinationPhase {
  phase1: string;
  phase2: string;
  phase3: string;
  phase4: string;
  timing: {
    phase1: string;
    phase2: string;
    phase3: string;
    phase4: string;
  };
}

export interface TransitionCoordinationSpec {
  outgoing: TransitionCoordinationPhase;
  incoming: TransitionCoordinationPhase;
  mathematical_relationship: {
    density_conservation: string;
    color_harmonic: string;
    geometric_morphing: string;
  };
}

export interface CardTransitionVariant {
  translucency?: [number, number];
  depth?: [string, string];
  scale?: [number, number];
  rotation?: [string, string];
  blur?: [string, string];
  geometry_sync?: string;
  emergence_point?: string;
  convergence_point?: string;
  duration: DurationString;
}

export interface CardTransitionSpec {
  emergence: Record<'from_background' | 'from_center', CardTransitionVariant>;
  submersion: Record<'to_background' | 'to_center', CardTransitionVariant>;
}

export interface ScrollBehaviorPreset {
  grid_layout: {
    columns: string;
    gap: string;
    scroll_behavior: string;
    scroll_snap: string;
    virtualization: string;
  };
  scroll_interactions: {
    visualizer_response: {
      scroll_up: string;
      scroll_down: string;
      scroll_velocity: string;
      scroll_momentum: string;
    };
    content_behavior: {
      snap_points: string;
      momentum_scrolling: string;
      edge_bouncing: string;
    };
  };
}

export interface VideoExpansionStateConfig {
  size: string;
  visualizer_role: string;
  play_button_overlay?: string;
  z_index?: string;
  background_blur?: string;
  controls?: string;
  background?: string;
}

export interface VideoExpansionTransitions {
  thumbnail_to_playing: {
    duration: DurationString;
    easing: string;
    visualizer_morph: string;
  };
  playing_to_fullscreen: {
    duration: DurationString;
    easing: string;
    visualizer_morph: string;
  };
}

export interface VideoExpansionConfig {
  expansion_states: {
    thumbnail: VideoExpansionStateConfig;
    playing: VideoExpansionStateConfig;
    fullscreen: VideoExpansionStateConfig;
  };
  transitions: VideoExpansionTransitions;
}

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
}

export interface VisualizerPresetBank {
  density_presets: Record<string, DensityPreset>;
  speed_presets: Record<string, SpeedPreset>;
  reactivity_presets: Record<string, ReactivityPreset>;
  color_presets: Record<string, ColorPreset>;
}

export interface PageTransitionPreset {
  outgoing: string;
  incoming: string;
  overlap: DurationString;
  easing: string;
}

export interface CardTransitionPreset {
  from: string;
  animation: string;
  duration: DurationString;
  easing: string;
}

export interface TransitionPresetBank {
  page_transitions: Record<string, PageTransitionPreset>;
  card_transitions: Record<string, CardTransitionPreset>;
}

export interface HoverEffectPreset {
  target_enhancement: string;
  others_response: string;
  transition_speed: 'fast' | 'medium' | 'slow';
}

export interface ClickEffectPreset {
  type: string;
  duration: DurationString;
  decay: 'linear' | 'exponential' | 'sigmoid';
}

export interface ScrollEffectPreset {
  type: string;
  intensity?: string;
  decay?: string;
  threshold?: string;
  buildup?: string;
  release?: string;
  synchronization?: string;
  pattern?: string;
}

export interface EffectPresetBank {
  hover_effects: Record<string, HoverEffectPreset>;
  click_effects: Record<string, ClickEffectPreset>;
  scroll_effects: Record<string, ScrollEffectPreset>;
}

export interface StyleSettingsSelection {
  density: string;
  speed: string;
  reactivity: string;
  color_scheme: string;
}

export interface InteractionSettingsSelection {
  hover_effect: string;
  click_effect: string;
  scroll_effect: string;
}

export interface TransitionSettingsSelection {
  page_transition: string;
  card_transition: string;
}

export interface AdvancedTuningSettings {
  global_speed_multiplier: number;
  interaction_sensitivity: number;
  transition_duration_multiplier: number;
}

export interface DesignSystemSettings {
  style: StyleSettingsSelection;
  interactions: InteractionSettingsSelection;
  transitions: TransitionSettingsSelection;
  advanced: AdvancedTuningSettings;
}

export interface CardMetrics {
  gridDensity: number;
  colorIntensity: number;
  reactivity: number;
  depth: number;
}

export interface CardVisualState {
  id: string;
  base: CardMetrics;
  metrics: CardMetrics;
  transition: {
    duration: number;
    easing: string;
    delay: number;
  };
  animationDirection: 1 | -1;
  isTarget: boolean;
  isInverted: boolean;
  rippleEffect?: string;
  sparkles?: number;
  lastInteraction: 'none' | 'hover' | 'click';
}

export interface ClickEffectState {
  inversionDuration: number;
  decayDuration: number;
  sparkleDuration: number;
}

export interface VideoState {
  mode: 'thumbnail' | 'playing' | 'fullscreen';
  progress: number;
}

export type ScrollDirection = 'up' | 'down';

export interface ScrollState {
  velocity: number;
  direction: ScrollDirection;
  momentum: number;
}

export interface ManagedContentItem {
  id: string;
  title: string;
  type: 'article' | 'video' | 'audio' | 'image' | 'custom';
  description?: string;
}

export interface ManagedSectionConfig {
  id: string;
  name: string;
  section_type: string;
  scrolling: {
    enabled: boolean;
    scroll_type: 'smooth' | 'snap' | 'infinite';
    scroll_direction: 'vertical' | 'horizontal' | 'both';
  };
  expansion: {
    enabled: boolean;
    expansion_trigger: 'click' | 'hover' | 'auto';
    expansion_size: '1.5x' | '2x' | 'fullscreen';
  };
  items: ManagedContentItem[];
}

export interface PresetLibrary {
  visualizer: VisualizerPresetBank;
  transitions: TransitionPresetBank;
  effects: EffectPresetBank;
  hoverPattern: HoverResponsePattern;
  clickPattern: ClickResponsePattern;
  transitionCoordination: TransitionCoordinationSpec;
  cardTransitions: CardTransitionSpec;
  scrollableCards: ScrollBehaviorPreset;
  videoExpansion: VideoExpansionConfig;
}
