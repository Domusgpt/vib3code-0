export type DensityPresetName = 'minimal' | 'standard' | 'dense' | 'maximum';
export type SpeedPresetName = 'static' | 'calm' | 'flowing' | 'energetic' | 'frenetic';
export type ReactivityPresetName = 'passive' | 'responsive' | 'highly_reactive' | 'hypersensitive';
export type ColorPresetName = 'monochrome' | 'complementary' | 'triadic' | 'analogous' | 'rainbow';

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

export interface VisualizerPresetsDefinition {
  density_presets: Record<DensityPresetName, DensityPreset>;
  speed_presets: Record<SpeedPresetName, SpeedPreset>;
  reactivity_presets: Record<ReactivityPresetName, ReactivityPreset>;
  color_presets: Record<ColorPresetName, ColorPreset>;
}

export type HoverEffectName = 'subtle_glow' | 'magnetic_attraction' | 'reality_distortion';
export type ClickEffectName = 'color_inversion' | 'reality_glitch' | 'quantum_collapse';
export type ScrollEffectName = 'momentum_trails' | 'chaos_buildup' | 'harmonic_resonance';

export interface HoverEffectPreset {
  target_enhancement: string;
  others_response: string;
  transition_speed: 'fast' | 'medium' | 'slow';
}

export interface ClickEffectPreset {
  type: string;
  duration: string;
  decay: 'exponential' | 'linear' | 'sigmoid';
}

export interface ScrollEffectPreset {
  type: string;
  intensity?: string;
  decay: string;
  threshold?: string;
  buildup?: string;
  release?: string;
  synchronization?: string;
  pattern?: string;
}

export interface InteractionPresetsDefinition {
  hover_effects: Record<HoverEffectName, HoverEffectPreset>;
  click_effects: Record<ClickEffectName, ClickEffectPreset>;
  scroll_effects: Record<ScrollEffectName, ScrollEffectPreset>;
}

export type PageTransitionName = 'fade_cross' | 'slide_portal' | 'spiral_morph' | 'glitch_burst';
export type CardTransitionName = 'gentle_emerge' | 'dramatic_burst' | 'liquid_flow';

export interface TransitionPhaseTiming {
  start: number;
  end: number;
}

export interface TransitionPhase {
  name: string;
  action: string;
  timing: TransitionPhaseTiming;
}

export interface TransitionDefinition {
  phases: TransitionPhase[];
}

export interface TransitionPresetDefinition {
  page_transitions: Record<PageTransitionName, {
    outgoing: string;
    incoming: string;
    overlap: string;
    easing: string;
  }>;
  card_transitions: Record<CardTransitionName, {
    from: string;
    animation: string;
    duration: string;
    easing: string;
  }>;
}

export interface EffectPresetDefinition {
  hover_effects: Record<HoverEffectName, HoverEffectPreset>;
  click_effects: Record<ClickEffectName, ClickEffectPreset>;
  scroll_effects: Record<ScrollEffectName, ScrollEffectPreset>;
}

export interface InteractionResponsePattern {
  gridDensityMultiplier: number;
  colorIntensityMultiplier: number;
  reactivityMultiplier: number;
  depthOffset: number;
}

export interface HoverResponsePattern {
  target: InteractionResponsePattern;
  others: InteractionResponsePattern;
  transition: {
    duration: number;
    easing: string;
    stagger: number;
  };
}

export interface ClickResponsePattern {
  inversionDuration: number;
  decayDuration: number;
  sparkleDuration: number;
  sparkleCount: number;
}

export interface ScrollResponsePattern {
  densityDirection: 'increase' | 'decrease';
  speedMultiplier: number;
  momentumTrail: boolean;
}

export interface VisualizerComputedState {
  gridDensity: number;
  gridVariance?: number;
  colorIntensity: number;
  animationSpeed: number;
  speedVariance?: number;
  reactivity: ReactivityPreset;
  depthOffset: number;
  translucency: number;
  scale: number;
  rotation: number;
  blur: number;
  colorScheme: ColorPreset;
  isInverted: boolean;
  sparkles: number;
  rippleActive: boolean;
  lastUpdated: number;
}

export interface VisualizerInstance {
  id: string;
  baseState: VisualizerComputedState;
  currentState: VisualizerComputedState;
  overrides?: Partial<VisualizerComputedState>;
}

export interface DesignSystemSelection {
  density: DensityPresetName;
  speed: SpeedPresetName;
  reactivity: ReactivityPresetName;
  colorScheme: ColorPresetName;
  hoverEffect: HoverEffectName;
  clickEffect: ClickEffectName;
  scrollEffect: ScrollEffectName;
  pageTransition: PageTransitionName;
  cardTransition: CardTransitionName;
  globalSpeedMultiplier: number;
  interactionSensitivity: number;
  transitionDurationMultiplier: number;
}

export interface InteractionStateSnapshot {
  type: 'idle' | 'hover' | 'click' | 'scroll';
  targetId?: string;
  intensity: number;
  startedAt: number;
}

export interface TransitionSession {
  outgoingId: string;
  incomingId: string;
  startedAt: number;
  duration: number;
}

export interface VisualizerEngineSnapshot {
  visualizers: Record<string, VisualizerComputedState>;
  interactions: InteractionStateSnapshot | null;
  activeTransition: TransitionSession | null;
}

export type SectionType = 'article_grid' | 'video_gallery' | 'audio_playlist' | 'image_showcase' | 'custom_layout';

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  mediaType?: 'video' | 'audio' | 'image' | 'text';
  url?: string;
}

export interface SectionConfiguration {
  id: string;
  name: string;
  type: SectionType;
  scrolling: {
    enabled: boolean;
    scrollType: 'smooth' | 'snap' | 'infinite';
    direction: 'vertical' | 'horizontal' | 'both';
  };
  expansion: {
    enabled: boolean;
    trigger: 'click' | 'hover' | 'auto';
    size: '1.5x' | '2x' | 'fullscreen';
  };
  items: ContentItem[];
}
