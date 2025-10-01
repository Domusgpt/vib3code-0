// Design system type definitions derived from the VIB34D architecture

export type InteractionOperation = string;

export type LayerType = 'background' | 'shadow' | 'content' | 'highlight' | 'accent';

export interface HoverBehaviorOperations {
  gridDensity: InteractionOperation;
  colorIntensity: InteractionOperation;
  reactivity: InteractionOperation;
  depth: InteractionOperation;
}

export interface HoverTransitionDefinition {
  duration: string;
  easing: string;
  stagger: string;
}

export interface HoverResponseLayerGroup {
  primary: HoverBehaviorOperations;
  accent: HoverBehaviorOperations;
  complementary: HoverBehaviorOperations;
  layers: Partial<Record<LayerType, HoverBehaviorOperations>>;
}

export interface HoverResponseDefinition {
  target: HoverResponseLayerGroup;
  others: HoverResponseLayerGroup;
  transition: HoverTransitionDefinition;
}

export interface ClickVariableInversionDefinition {
  speed: InteractionOperation;
  density: InteractionOperation;
  intensity: InteractionOperation;
}

export interface ClickImmediateDefinition {
  colorInversion: InteractionOperation;
  variableInversion: ClickVariableInversionDefinition;
  rippleEffect: InteractionOperation;
  sparkleGeneration: InteractionOperation;
}

export interface ClickDurationDefinition {
  inversion: string;
  decay: string;
  sparkles: string;
}

export interface ClickChannelResponseDefinition {
  layer: LayerType;
  depth: string;
  chroma: string;
  resonance: string;
}

export interface ClickResponseDefinition {
  immediate: ClickImmediateDefinition;
  duration: ClickDurationDefinition;
  accent: ClickChannelResponseDefinition;
  complementary: ClickChannelResponseDefinition;
}

export interface CoordinatedPhaseDefinition {
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

export interface TransitionCoordinationDefinition {
  outgoing: CoordinatedPhaseDefinition;
  incoming: CoordinatedPhaseDefinition;
  accent: CoordinatedPhaseDefinition;
  complementary: CoordinatedPhaseDefinition;
  mathematical_relationship: {
    density_conservation: string;
    color_harmonic: string;
    geometric_morphing: string;
    accent_resonance: string;
    complementary_balance: string;
  };
}

export interface CardTransitionEntry {
  translucency?: string;
  depth?: string;
  scale?: string;
  geometry_sync?: string;
  duration: string;
  rotation?: string;
  blur?: string;
  emergence_point?: string;
  convergence_point?: string;
  accent_layer?: string;
  complementary_layer?: string;
  accent_timing?: string;
  complementary_timing?: string;
}

export interface CardTransitionsDefinition {
  emergence: Record<string, CardTransitionEntry>;
  submersion: Record<string, CardTransitionEntry>;
}

export interface VisualizerDensityPreset {
  base: number;
  variation: number;
}

export interface VisualizerSpeedPreset {
  base: number;
  variation: number;
}

export interface VisualizerReactivityPreset {
  mouse: number;
  click: number;
  scroll: number;
}

export interface VisualizerColorPreset {
  palette: string;
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

export interface HoverBandModifier {
  primary?: Partial<VisualStateMultipliers>;
  accent?: Partial<VisualStateMultipliers>;
  complementary?: Partial<VisualStateMultipliers>;
  layers?: Partial<Record<LayerType, Partial<VisualStateMultipliers>>>;
}

export interface HoverEffectPreset {
  name: string;
  description: string;
  targetModifiers: HoverBandModifier;
  othersModifiers: HoverBandModifier;
  transitionSpeedMultiplier: number;
}

export interface ClickChannelImpact {
  layer: LayerType;
  intensity: number;
  reactivityBoost: number;
  depthShift: number;
  chromaShift: number;
  glitchBoost: number;
  duration: number;
}

export interface ClickEffectPreset {
  name: string;
  description: string;
  colorInversionType: string;
  inversionDuration: number;
  decayCurve: 'exponential' | 'linear' | 'sigmoid';
  sparkleDuration: number;
  sparkleCount: number;
  accentImpact: ClickChannelImpact;
  complementaryImpact: ClickChannelImpact;
}

export interface ScrollChannelImpact {
  layer: LayerType;
  reactivityMultiplier: number;
  intensityScale: number;
  depthRebound: number;
  stabilization: number;
}

export interface ScrollEffectPreset {
  name: string;
  description: string;
  intensityModel: 'velocity' | 'threshold' | 'harmonic';
  decayModel: 'physics' | 'burst' | 'wave';
  threshold?: number;
  releaseBehavior?: string;
  accentChannel: ScrollChannelImpact;
  complementaryChannel: ScrollChannelImpact;
}

export interface VisualStateMultipliers {
  gridDensity?: number;
  colorIntensity?: number;
  reactivity?: number;
  depth?: number;
}

export interface InteractionEffectState {
  type: string;
  startedAt: number;
  duration: number;
  data?: Record<string, number | string>;
}

export interface LayerVisualState {
  gridDensity: number;
  colorIntensity: number;
  reactivity: number;
  depth: number;
}

export interface LayerInteractionEffectState extends InteractionEffectState {
  layer: LayerType;
  amplitude: number;
}

export interface ChannelEnvelopeState {
  amplitude: number;
  velocity: number;
  ratio: number;
  decay: number;
  lastUpdate: number;
}

export interface SectionVisualState {
  gridDensity: number;
  colorIntensity: number;
  reactivity: number;
  depth: number;
  layers: Record<LayerType, LayerVisualState>;
  inversionActiveUntil?: number;
  rippleEffect?: InteractionEffectState;
  sparkleEffect?: InteractionEffectState & { count: number };
  accentChannel?: LayerInteractionEffectState;
  complementaryChannel?: LayerInteractionEffectState;
  accentEnvelope?: ChannelEnvelopeState;
  complementaryEnvelope?: ChannelEnvelopeState;
  lastUpdated: number;
}

export type ParameterPatch = Partial<{
  density: number;
  morph: number;
  chaos: number;
  noiseFreq: number;
  glitch: number;
  dispAmp: number;
  chromaShift: number;
  timeScale: number;
}>;

export interface MinimalParamsSnapshot {
  density: number;
  morph: number;
  chaos: number;
  noiseFreq: number;
  glitch: number;
  dispAmp: number;
  chromaShift: number;
  timeScale: number;
}

export type SectionParameterSnapshot = Record<string, MinimalParamsSnapshot>;

export interface HoverInteractionResult {
  sectionStates: Record<string, SectionVisualState>;
  paramPatches: Record<string, ParameterPatch>;
  transitionDuration: number;
  transitionEasing: string;
  stagger: number;
}

export interface ClickInteractionResult {
  sectionStates: Record<string, SectionVisualState>;
  paramPatches: Record<string, ParameterPatch>;
}

export interface ScrollInteractionResult {
  sectionStates: Record<string, SectionVisualState>;
  paramPatches: Record<string, ParameterPatch>;
}

export interface FocusInteractionResult {
  sectionStates: Record<string, SectionVisualState>;
  paramPatches: Record<string, ParameterPatch>;
}

export interface DesignSystemSelections {
  visualizer: string;
  speed: string;
  reactivity: string;
  color: string;
  hoverEffect: string;
  clickEffect: string;
  scrollEffect: string;
  pageTransition: string;
  cardTransition: string;
}

export interface DesignSystemAdvancedTuning {
  speedMultiplier: number;
  interactionSensitivity: number;
  transitionDurationMultiplier: number;
  accentComplementRatio: number;
  envelopePersistence: number;
}

export interface DesignSystemStateSlice {
  selections: DesignSystemSelections;
  advanced: DesignSystemAdvancedTuning;
  sectionStates: Record<string, SectionVisualState>;
  lastInteraction?: {
    type: 'hover' | 'click' | 'scroll';
    at: number;
    sectionId?: string;
  };
  customPresets: Record<string, ParameterPatch>;
  reactivitySettings?: VisualizerReactivityPreset;
  colorPalette?: VisualizerColorPreset;
}

export interface EditorControlOption {
  label: string;
  value: string;
}

export interface EditorControlDefinition {
  id: string;
  type: 'dropdown' | 'slider' | 'toggle' | 'button' | 'sortable_list';
  label: string;
  options?: EditorControlOption[];
  range?: [number, number];
  step?: number;
  defaultValue?: number | string;
  livePreview?: boolean;
  actions?: string[];
  subOptions?: Record<string, string[]>;
  previewActionId?: string;
}

export interface EditorSectionDefinition {
  id: string;
  title: string;
  controls: EditorControlDefinition[];
}

export interface EditorPanelDefinition {
  id: string;
  sections: EditorSectionDefinition[];
}

export interface ContentSectionBehaviorDefinition {
  id: string;
  type: 'dropdown' | 'toggle';
  options: string[];
  subOptions?: Record<string, string[]>;
}

export interface ContentManagementDefinition {
  sections: ContentSectionBehaviorDefinition[];
  actions: EditorControlDefinition[];
  accent_options?: string[];
  complementary_options?: string[];
}

export interface ScrollableGridLayoutDefinition {
  columns: string;
  gap: string;
  scroll_behavior: string;
  scroll_snap: string;
  virtualization: string;
}

export interface ScrollableVisualizerResponseDefinition {
  scroll_up: string;
  scroll_down: string;
  scroll_velocity: string;
  scroll_momentum: string;
  accent_channel?: string;
  complementary_channel?: string;
}

export interface ScrollableContentBehaviorDefinition {
  snap_points: string;
  momentum_scrolling: string;
  edge_bouncing: string;
}

export interface ScrollableCardsDefinition {
  grid_layout: ScrollableGridLayoutDefinition;
  scroll_interactions: {
    visualizer_response: ScrollableVisualizerResponseDefinition;
    content_behavior: ScrollableContentBehaviorDefinition;
  };
  accent_layers?: Partial<Record<LayerType, string>>;
  complementary_layers?: Partial<Record<LayerType, string>>;
}

export interface VideoExpansionStateDefinition {
  size: string;
  visualizer_role: string;
  play_button_overlay?: string;
  z_index?: string;
  background_blur?: string;
  controls: string;
  background?: string;
  accent_layer?: string;
  complementary_layer?: string;
}

export interface VideoExpansionTransitionsDefinition {
  duration: string;
  easing: string;
  visualizer_morph: string;
  accent_sync?: string;
  complementary_sync?: string;
}

export interface VideoExpansionDefinition {
  expansion_states: {
    thumbnail: VideoExpansionStateDefinition;
    playing: VideoExpansionStateDefinition;
    fullscreen: VideoExpansionStateDefinition;
  };
  transitions: {
    thumbnail_to_playing: VideoExpansionTransitionsDefinition;
    playing_to_fullscreen: VideoExpansionTransitionsDefinition;
  };
}

