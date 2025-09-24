import {
  CardTransitionPreset,
  DesignSystemAdvancedTuning,
  DesignSystemSelections,
  HoverEffectPreset,
  PageTransitionPreset,
  ScrollEffectPreset,
  VisualizerColorPreset,
  VisualizerDensityPreset,
  VisualizerReactivityPreset,
  VisualizerSpeedPreset,
  ClickEffectPreset,
} from './types';

export const visualizerDensityPresets: Record<string, VisualizerDensityPreset> = {
  minimal: { base: 4.0, variation: 1.0 },
  standard: { base: 8.0, variation: 2.0 },
  dense: { base: 16.0, variation: 4.0 },
  maximum: { base: 32.0, variation: 8.0 },
};

export const visualizerSpeedPresets: Record<string, VisualizerSpeedPreset> = {
  static: { base: 0.0, variation: 0.0 },
  calm: { base: 0.3, variation: 0.1 },
  flowing: { base: 0.6, variation: 0.2 },
  energetic: { base: 1.2, variation: 0.4 },
  frenetic: { base: 2.0, variation: 0.8 },
};

export const visualizerReactivityPresets: Record<string, VisualizerReactivityPreset> = {
  passive: { mouse: 0.2, click: 0.1, scroll: 0.1 },
  responsive: { mouse: 0.6, click: 0.4, scroll: 0.3 },
  highly_reactive: { mouse: 1.0, click: 0.8, scroll: 0.6 },
  hypersensitive: { mouse: 1.5, click: 1.2, scroll: 1.0 },
};

export const visualizerColorPresets: Record<string, VisualizerColorPreset> = {
  monochrome: { palette: 'single_hue_variations' },
  complementary: { palette: 'opposite_color_wheel' },
  triadic: { palette: 'three_equidistant_hues' },
  analogous: { palette: 'adjacent_color_wheel' },
  rainbow: { palette: 'full_spectrum_cycle' },
};

export const pageTransitionPresets: Record<string, PageTransitionPreset> = {
  fade_cross: {
    outgoing: 'fade_to_black',
    incoming: 'fade_from_black',
    overlap: '200ms',
    easing: 'ease_in_out',
  },
  slide_portal: {
    outgoing: 'slide_to_edge_dissolve',
    incoming: 'slide_from_opposite_edge',
    overlap: '300ms',
    easing: 'cubic_bezier_custom',
  },
  spiral_morph: {
    outgoing: 'spiral_collapse_to_center',
    incoming: 'spiral_emerge_from_center',
    overlap: '400ms',
    easing: 'ease_out_expo',
  },
  glitch_burst: {
    outgoing: 'vhs_glitch_dissolve',
    incoming: 'chromatic_aberration_emerge',
    overlap: '150ms',
    easing: 'ease_in_bounce',
  },
};

export const cardTransitionPresets: Record<string, CardTransitionPreset> = {
  gentle_emerge: {
    from: 'background_layer',
    animation: 'translucency_and_scale',
    duration: '800ms',
    easing: 'ease_out_quart',
  },
  dramatic_burst: {
    from: 'screen_center',
    animation: 'explosive_scale_and_spin',
    duration: '1200ms',
    easing: 'ease_out_back',
  },
  liquid_flow: {
    from: 'edge_of_screen',
    animation: 'fluid_morph_and_settle',
    duration: '1500ms',
    easing: 'ease_out_elastic',
  },
};

export const hoverEffectPresets: Record<string, HoverEffectPreset> = {
  subtle_glow: {
    name: 'subtle_glow',
    description: 'soft luminous glow with slight dimming for neighbors',
    targetModifiers: {
      gridDensity: 1.05,
      colorIntensity: 1.2,
      reactivity: 1.05,
    },
    othersModifiers: {
      gridDensity: 0.9,
      colorIntensity: 0.92,
    },
    transitionSpeedMultiplier: 0.8,
  },
  magnetic_attraction: {
    name: 'magnetic_attraction',
    description: 'density increase with subtle pull and push dynamics',
    targetModifiers: {
      gridDensity: 1.25,
      colorIntensity: 1.1,
      reactivity: 1.15,
      depth: 6,
    },
    othersModifiers: {
      gridDensity: 0.8,
      reactivity: 0.9,
      depth: -4,
    },
    transitionSpeedMultiplier: 1.0,
  },
  reality_distortion: {
    name: 'reality_distortion',
    description: 'geometry warping and stability compensation for others',
    targetModifiers: {
      gridDensity: 1.4,
      colorIntensity: 1.35,
      reactivity: 1.4,
      depth: 10,
    },
    othersModifiers: {
      gridDensity: 0.7,
      colorIntensity: 0.85,
      reactivity: 0.8,
      depth: -6,
    },
    transitionSpeedMultiplier: 1.2,
  },
};

export const clickEffectPresets: Record<string, ClickEffectPreset> = {
  color_inversion: {
    name: 'color_inversion',
    description: 'full spectrum flip with exponential decay',
    colorInversionType: 'spectrum_flip',
    inversionDuration: 2000,
    decayCurve: 'exponential',
    sparkleDuration: 1500,
    sparkleCount: 8,
  },
  reality_glitch: {
    name: 'reality_glitch',
    description: 'digital artifact burst with linear decay',
    colorInversionType: 'digital_artifact_generation',
    inversionDuration: 1500,
    decayCurve: 'linear',
    sparkleDuration: 1200,
    sparkleCount: 12,
  },
  quantum_collapse: {
    name: 'quantum_collapse',
    description: 'parameter randomization then stabilization with sigmoid decay',
    colorInversionType: 'parameter_randomization_then_stabilization',
    inversionDuration: 3000,
    decayCurve: 'sigmoid',
    sparkleDuration: 2000,
    sparkleCount: 16,
  },
};

export const scrollEffectPresets: Record<string, ScrollEffectPreset> = {
  momentum_trails: {
    name: 'momentum_trails',
    description: 'motion blur particles proportional to velocity',
    intensityModel: 'velocity',
    decayModel: 'physics',
  },
  chaos_buildup: {
    name: 'chaos_buildup',
    description: 'progressive distortion released as a portal burst',
    intensityModel: 'threshold',
    decayModel: 'burst',
    threshold: 5,
    releaseBehavior: 'portal_burst',
  },
  harmonic_resonance: {
    name: 'harmonic_resonance',
    description: 'coordinated frequency modulation across visualizers',
    intensityModel: 'harmonic',
    decayModel: 'wave',
  },
};

export const DEFAULT_DESIGN_SYSTEM_SELECTIONS: DesignSystemSelections = {
  visualizer: 'standard',
  speed: 'flowing',
  reactivity: 'responsive',
  color: 'complementary',
  hoverEffect: 'magnetic_attraction',
  clickEffect: 'color_inversion',
  scrollEffect: 'momentum_trails',
  pageTransition: 'slide_portal',
  cardTransition: 'gentle_emerge',
};

export const DEFAULT_ADVANCED_TUNING: DesignSystemAdvancedTuning = {
  speedMultiplier: 1.0,
  interactionSensitivity: 1.0,
  transitionDurationMultiplier: 1.0,
};

