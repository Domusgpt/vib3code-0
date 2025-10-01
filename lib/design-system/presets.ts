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
  ParameterPatch,
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
    accentTargetModifiers: {
      gridDensity: 1.15,
      colorIntensity: 1.25,
      reactivity: 1.12,
      depth: 6,
    },
    accentOthersModifiers: {
      gridDensity: 0.92,
      colorIntensity: 0.9,
      reactivity: 0.95,
      depth: -3,
    },
    complementTargetModifiers: {
      gridDensity: 1.08,
      colorIntensity: 1.1,
      reactivity: 1.06,
      depth: 2,
    },
    complementOthersModifiers: {
      gridDensity: 0.95,
      colorIntensity: 0.94,
      depth: -2,
    },
    accentTransitionSpeedMultiplier: 0.9,
    complementTransitionSpeedMultiplier: 0.85,
    accentEffect: { type: 'hover_accent_glow', duration: 420 },
    complementEffect: { type: 'hover_complement_echo', duration: 360 },
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
    accentTargetModifiers: {
      gridDensity: 1.32,
      colorIntensity: 1.18,
      reactivity: 1.28,
      depth: 12,
    },
    accentOthersModifiers: {
      gridDensity: 0.75,
      reactivity: 0.88,
      depth: -8,
    },
    complementTargetModifiers: {
      gridDensity: 1.16,
      colorIntensity: 1.14,
      reactivity: 1.12,
      depth: 4,
    },
    complementOthersModifiers: {
      gridDensity: 0.85,
      colorIntensity: 0.9,
      depth: -3,
    },
    accentTransitionSpeedMultiplier: 1.05,
    complementTransitionSpeedMultiplier: 0.95,
    accentEffect: { type: 'hover_magnetic_arc', duration: 520 },
    complementEffect: { type: 'hover_counterwave', duration: 440 },
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
    accentTargetModifiers: {
      gridDensity: 1.5,
      colorIntensity: 1.45,
      reactivity: 1.5,
      depth: 16,
    },
    accentOthersModifiers: {
      gridDensity: 0.68,
      colorIntensity: 0.8,
      reactivity: 0.75,
      depth: -10,
    },
    complementTargetModifiers: {
      gridDensity: 1.28,
      colorIntensity: 1.22,
      reactivity: 1.18,
      depth: 6,
    },
    complementOthersModifiers: {
      gridDensity: 0.78,
      colorIntensity: 0.88,
      depth: -4,
    },
    accentTransitionSpeedMultiplier: 1.35,
    complementTransitionSpeedMultiplier: 1.1,
    accentEffect: { type: 'hover_reality_wave', duration: 640 },
    complementEffect: { type: 'hover_anchor_field', duration: 520 },
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
    targetModifiers: {
      gridDensity: 1.18,
      colorIntensity: 1.22,
      reactivity: 1.2,
      depth: 8,
    },
    othersModifiers: {
      gridDensity: 0.88,
      colorIntensity: 0.92,
      reactivity: 0.9,
      depth: -4,
    },
    accentTargetModifiers: {
      gridDensity: 1.32,
      colorIntensity: 1.38,
      reactivity: 1.35,
      depth: 14,
    },
    accentOthersModifiers: {
      gridDensity: 0.82,
      colorIntensity: 0.88,
      reactivity: 0.84,
      depth: -7,
    },
    complementTargetModifiers: {
      gridDensity: 1.12,
      colorIntensity: 1.16,
      reactivity: 1.1,
      depth: 5,
    },
    complementOthersModifiers: {
      gridDensity: 0.9,
      colorIntensity: 0.94,
      reactivity: 0.92,
      depth: -3,
    },
    accentSparkleDuration: 1100,
    accentSparkleCount: 12,
    accentRippleDuration: 950,
    complementarySparkleDuration: 900,
    complementarySparkleCount: 10,
    complementaryRippleDuration: 780,
  },
  reality_glitch: {
    name: 'reality_glitch',
    description: 'digital artifact burst with linear decay',
    colorInversionType: 'digital_artifact_generation',
    inversionDuration: 1500,
    decayCurve: 'linear',
    sparkleDuration: 1200,
    sparkleCount: 12,
    targetModifiers: {
      gridDensity: 1.24,
      colorIntensity: 1.3,
      reactivity: 1.28,
      depth: 10,
    },
    othersModifiers: {
      gridDensity: 0.84,
      colorIntensity: 0.88,
      reactivity: 0.86,
      depth: -6,
    },
    accentTargetModifiers: {
      gridDensity: 1.38,
      colorIntensity: 1.44,
      reactivity: 1.4,
      depth: 18,
    },
    accentOthersModifiers: {
      gridDensity: 0.78,
      colorIntensity: 0.82,
      reactivity: 0.8,
      depth: -9,
    },
    complementTargetModifiers: {
      gridDensity: 1.16,
      colorIntensity: 1.2,
      reactivity: 1.15,
      depth: 6,
    },
    complementOthersModifiers: {
      gridDensity: 0.88,
      colorIntensity: 0.9,
      reactivity: 0.9,
      depth: -4,
    },
    accentSparkleDuration: 1300,
    accentSparkleCount: 18,
    accentRippleDuration: 1200,
    complementarySparkleDuration: 1000,
    complementarySparkleCount: 14,
    complementaryRippleDuration: 880,
  },
  quantum_collapse: {
    name: 'quantum_collapse',
    description: 'parameter randomization then stabilization with sigmoid decay',
    colorInversionType: 'parameter_randomization_then_stabilization',
    inversionDuration: 3000,
    decayCurve: 'sigmoid',
    sparkleDuration: 2000,
    sparkleCount: 16,
    targetModifiers: {
      gridDensity: 1.3,
      colorIntensity: 1.32,
      reactivity: 1.34,
      depth: 12,
    },
    othersModifiers: {
      gridDensity: 0.8,
      colorIntensity: 0.85,
      reactivity: 0.82,
      depth: -7,
    },
    accentTargetModifiers: {
      gridDensity: 1.48,
      colorIntensity: 1.5,
      reactivity: 1.46,
      depth: 20,
    },
    accentOthersModifiers: {
      gridDensity: 0.75,
      colorIntensity: 0.8,
      reactivity: 0.78,
      depth: -11,
    },
    complementTargetModifiers: {
      gridDensity: 1.2,
      colorIntensity: 1.18,
      reactivity: 1.16,
      depth: 7,
    },
    complementOthersModifiers: {
      gridDensity: 0.88,
      colorIntensity: 0.9,
      reactivity: 0.88,
      depth: -5,
    },
    accentSparkleDuration: 1600,
    accentSparkleCount: 22,
    accentRippleDuration: 1500,
    complementarySparkleDuration: 1300,
    complementarySparkleCount: 18,
    complementaryRippleDuration: 1100,
  },
};

export const scrollEffectPresets: Record<string, ScrollEffectPreset> = {
  momentum_trails: {
    name: 'momentum_trails',
    description: 'motion blur particles proportional to velocity',
    intensityModel: 'velocity',
    decayModel: 'physics',
    accentModifiers: {
      gridDensity: 1.12,
      colorIntensity: 1.18,
      reactivity: 1.22,
      depth: 4,
    },
    complementaryModifiers: {
      gridDensity: 0.94,
      colorIntensity: 0.92,
      reactivity: 0.9,
      depth: -3,
    },
    accentEffect: { type: 'scroll_trail_flare', duration: 600 },
    complementaryEffect: { type: 'scroll_trail_echo', duration: 520 },
  },
  chaos_buildup: {
    name: 'chaos_buildup',
    description: 'progressive distortion released as a portal burst',
    intensityModel: 'threshold',
    decayModel: 'burst',
    threshold: 5,
    releaseBehavior: 'portal_burst',
    accentModifiers: {
      gridDensity: 1.3,
      colorIntensity: 1.26,
      reactivity: 1.28,
      depth: 12,
    },
    complementaryModifiers: {
      gridDensity: 0.9,
      colorIntensity: 0.88,
      reactivity: 0.9,
      depth: -5,
    },
    accentEffect: { type: 'scroll_chaos_burst', duration: 720 },
    complementaryEffect: { type: 'scroll_grounding_field', duration: 640 },
  },
  harmonic_resonance: {
    name: 'harmonic_resonance',
    description: 'coordinated frequency modulation across visualizers',
    intensityModel: 'harmonic',
    decayModel: 'wave',
    accentModifiers: {
      gridDensity: 1.18,
      colorIntensity: 1.22,
      reactivity: 1.2,
      depth: 8,
    },
    complementaryModifiers: {
      gridDensity: 0.92,
      colorIntensity: 0.9,
      reactivity: 0.92,
      depth: -4,
    },
    accentEffect: { type: 'scroll_resonance_chorus', duration: 680 },
    complementaryEffect: { type: 'scroll_resonance_counter', duration: 580 },
  },
};

export const accentOverlayPresets: Record<string, ParameterPatch> = {
  chromatic_stitching: { chromaShift: 0.08, density: 1.1 },
  plasma_highlights: { dispAmp: 0.25, timeScale: 1.1 },
  halo_bloom: { morph: 1.05, chromaShift: 0.12 },
};

export const complementaryOverlayPresets: Record<string, ParameterPatch> = {
  anchoring_grid: { density: 0.92, glitch: 0.02 },
  mist_envelope: { dispAmp: 0.18, chaos: 0.1 },
  ground_fog: { morph: 0.94, chromaShift: 0.03 },
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
  accentOverlay: 'chromatic_stitching',
  complementaryOverlay: 'anchoring_grid',
};

export const DEFAULT_ADVANCED_TUNING: DesignSystemAdvancedTuning = {
  speedMultiplier: 1.0,
  interactionSensitivity: 1.0,
  transitionDurationMultiplier: 1.0,
};

