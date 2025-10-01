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
      primary: { gridDensity: 1.05, colorIntensity: 1.2, reactivity: 1.05 },
      accent: { colorIntensity: 1.25, reactivity: 1.1, depth: 4 },
      complementary: { gridDensity: 1.08, colorIntensity: 1.1, depth: 3 },
      layers: {
        highlight: { colorIntensity: 1.35, reactivity: 1.15, depth: 6 },
        accent: { colorIntensity: 1.4, reactivity: 1.2, depth: 8 },
        content: { colorIntensity: 1.15, reactivity: 1.05, depth: 4 },
        background: { colorIntensity: 0.92, depth: -4 },
        shadow: { colorIntensity: 0.9, depth: -6 },
      },
    },
    othersModifiers: {
      primary: { gridDensity: 0.9, colorIntensity: 0.92 },
      accent: { colorIntensity: 0.88, reactivity: 0.9, depth: -4 },
      complementary: { gridDensity: 1.02, colorIntensity: 1.05, depth: 2 },
      layers: {
        highlight: { colorIntensity: 0.8, reactivity: 0.85, depth: -5 },
        accent: { colorIntensity: 0.75, reactivity: 0.8, depth: -8 },
        background: { colorIntensity: 1.05, depth: -2 },
        shadow: { colorIntensity: 1.02, depth: -3 },
      },
    },
    transitionSpeedMultiplier: 0.8,
  },
  magnetic_attraction: {
    name: 'magnetic_attraction',
    description: 'density increase with subtle pull and push dynamics',
    targetModifiers: {
      primary: { gridDensity: 1.25, colorIntensity: 1.1, reactivity: 1.15, depth: 6 },
      accent: { gridDensity: 1.35, colorIntensity: 1.25, reactivity: 1.2, depth: 10 },
      complementary: { gridDensity: 1.12, colorIntensity: 1.08, reactivity: 1.1, depth: 5 },
      layers: {
        highlight: { colorIntensity: 1.4, reactivity: 1.25, depth: 12 },
        accent: { colorIntensity: 1.5, reactivity: 1.35, depth: 16 },
        content: { colorIntensity: 1.2, reactivity: 1.15, depth: 8 },
        background: { colorIntensity: 0.88, depth: -6 },
        shadow: { colorIntensity: 0.85, depth: -10 },
      },
    },
    othersModifiers: {
      primary: { gridDensity: 0.8, reactivity: 0.9, depth: -4 },
      accent: { gridDensity: 0.75, colorIntensity: 0.82, reactivity: 0.85, depth: -8 },
      complementary: { gridDensity: 1.05, colorIntensity: 1.08, depth: 3 },
      layers: {
        highlight: { colorIntensity: 0.78, reactivity: 0.8, depth: -9 },
        accent: { colorIntensity: 0.72, reactivity: 0.75, depth: -12 },
        background: { colorIntensity: 1.1, depth: -3 },
        shadow: { colorIntensity: 1.05, depth: -5 },
      },
    },
    transitionSpeedMultiplier: 1.0,
  },
  reality_distortion: {
    name: 'reality_distortion',
    description: 'geometry warping and stability compensation for others',
    targetModifiers: {
      primary: { gridDensity: 1.4, colorIntensity: 1.35, reactivity: 1.4, depth: 10 },
      accent: { gridDensity: 1.55, colorIntensity: 1.5, reactivity: 1.45, depth: 18 },
      complementary: { gridDensity: 1.18, colorIntensity: 1.2, reactivity: 1.18, depth: 6 },
      layers: {
        highlight: { colorIntensity: 1.6, reactivity: 1.55, depth: 18 },
        accent: { colorIntensity: 1.7, reactivity: 1.6, depth: 24 },
        content: { colorIntensity: 1.28, reactivity: 1.22, depth: 12 },
        background: { colorIntensity: 0.82, depth: -8 },
        shadow: { colorIntensity: 0.78, depth: -12 },
      },
    },
    othersModifiers: {
      primary: { gridDensity: 0.7, colorIntensity: 0.85, reactivity: 0.8, depth: -6 },
      accent: { gridDensity: 0.6, colorIntensity: 0.72, reactivity: 0.68, depth: -10 },
      complementary: { gridDensity: 1.08, colorIntensity: 1.12, depth: 4 },
      layers: {
        highlight: { colorIntensity: 0.68, reactivity: 0.7, depth: -11 },
        accent: { colorIntensity: 0.6, reactivity: 0.65, depth: -16 },
        background: { colorIntensity: 1.12, depth: -4 },
        shadow: { colorIntensity: 1.08, depth: -6 },
      },
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
    accentImpact: {
      layer: 'highlight',
      intensity: 1.4,
      reactivityBoost: 0.6,
      depthShift: 12,
      chromaShift: 0.2,
      glitchBoost: 0.1,
      duration: 1600,
    },
    complementaryImpact: {
      layer: 'background',
      intensity: 0.85,
      reactivityBoost: -0.2,
      depthShift: -10,
      chromaShift: -0.05,
      glitchBoost: 0.06,
      duration: 1200,
    },
  },
  reality_glitch: {
    name: 'reality_glitch',
    description: 'digital artifact burst with linear decay',
    colorInversionType: 'digital_artifact_generation',
    inversionDuration: 1500,
    decayCurve: 'linear',
    sparkleDuration: 1200,
    sparkleCount: 12,
    accentImpact: {
      layer: 'accent',
      intensity: 1.6,
      reactivityBoost: 0.75,
      depthShift: 16,
      chromaShift: 0.28,
      glitchBoost: 0.18,
      duration: 1500,
    },
    complementaryImpact: {
      layer: 'shadow',
      intensity: 0.9,
      reactivityBoost: -0.15,
      depthShift: -8,
      chromaShift: -0.04,
      glitchBoost: 0.12,
      duration: 1100,
    },
  },
  quantum_collapse: {
    name: 'quantum_collapse',
    description: 'parameter randomization then stabilization with sigmoid decay',
    colorInversionType: 'parameter_randomization_then_stabilization',
    inversionDuration: 3000,
    decayCurve: 'sigmoid',
    sparkleDuration: 2000,
    sparkleCount: 16,
    accentImpact: {
      layer: 'highlight',
      intensity: 1.75,
      reactivityBoost: 0.9,
      depthShift: 20,
      chromaShift: 0.32,
      glitchBoost: 0.24,
      duration: 2200,
    },
    complementaryImpact: {
      layer: 'background',
      intensity: 0.92,
      reactivityBoost: -0.25,
      depthShift: -14,
      chromaShift: -0.08,
      glitchBoost: 0.18,
      duration: 1800,
    },
  },
};

export const scrollEffectPresets: Record<string, ScrollEffectPreset> = {
  momentum_trails: {
    name: 'momentum_trails',
    description: 'motion blur particles proportional to velocity',
    intensityModel: 'velocity',
    decayModel: 'physics',
    accentChannel: {
      layer: 'highlight',
      reactivityMultiplier: 1.4,
      intensityScale: 1.1,
      depthRebound: 6,
      stabilization: 0.4,
    },
    complementaryChannel: {
      layer: 'background',
      reactivityMultiplier: 0.9,
      intensityScale: 0.7,
      depthRebound: -4,
      stabilization: 1.2,
    },
  },
  chaos_buildup: {
    name: 'chaos_buildup',
    description: 'progressive distortion released as a portal burst',
    intensityModel: 'threshold',
    decayModel: 'burst',
    threshold: 5,
    releaseBehavior: 'portal_burst',
    accentChannel: {
      layer: 'accent',
      reactivityMultiplier: 1.65,
      intensityScale: 1.4,
      depthRebound: 10,
      stabilization: 0.5,
    },
    complementaryChannel: {
      layer: 'shadow',
      reactivityMultiplier: 0.8,
      intensityScale: 0.6,
      depthRebound: -6,
      stabilization: 1.35,
    },
  },
  harmonic_resonance: {
    name: 'harmonic_resonance',
    description: 'coordinated frequency modulation across visualizers',
    intensityModel: 'harmonic',
    decayModel: 'wave',
    accentChannel: {
      layer: 'highlight',
      reactivityMultiplier: 1.5,
      intensityScale: 1.3,
      depthRebound: 8,
      stabilization: 0.6,
    },
    complementaryChannel: {
      layer: 'content',
      reactivityMultiplier: 1.1,
      intensityScale: 0.9,
      depthRebound: -2,
      stabilization: 1.0,
    },
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
  accentComplementRatio: 1.0,
  envelopePersistence: 0.7,
};

