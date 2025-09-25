import {
  CardTransitionPreset,
  CoordinatedPreset,
  DesignSystemAdvancedTuning,
  DesignSystemSelections,
  HoverEffectPreset,
  PageTransitionPreset,
  ParameterWeb,
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

// Sophisticated Coordinated Presets - Multi-system coordination with mathematical relationships
export const coordinatedPresets: Record<string, CoordinatedPreset> = {
  dimensional_focus: {
    name: 'dimensional_focus',
    description: 'Multi-dimensional focus with parameter web cascade',
    effects: {
      focused: {
        visual: {
          gridDensity: 1.08,
          colorIntensity: 1.0,
          depth: 6,
          reactivity: 1.15,
        },
        parameters: {
          density: 1.08,
          chaos: 0.0,
          glitch: 0.0,
          dispAmp: 0.15,
          chromaShift: 0.02,
        },
        timing: { duration: 400, easing: 'ease-out' },
      },
      unfocused: {
        visual: {
          gridDensity: 0.96,
          colorIntensity: 0.65,
          depth: -3,
          reactivity: 0.85,
        },
        parameters: {
          density: 0.96,
          chaos: 0.1,
          glitch: 0.05,
          dispAmp: 0.08,
          chromaShift: -0.02,
        },
        timing: { duration: 400, easing: 'ease-out', stagger: 50 },
      },
      system: {
        globalMultipliers: {
          speedMultiplier: 0.95,
          interactionSensitivity: 1.25,
          transitionDurationMultiplier: 1.3,
        },
        parameterWeb: {
          relationships: [
            {
              source: 'gridDensity',
              target: 'colorIntensity',
              relationship: 'linear',
              intensity: 0.4,
            },
            {
              source: 'depth',
              target: 'reactivity',
              relationship: 'exponential',
              intensity: 0.3,
            },
          ],
        },
      },
    },
  },

  harmonic_resonance: {
    name: 'harmonic_resonance',
    description: 'Synchronized oscillation with harmonic mathematical relationships',
    effects: {
      focused: {
        visual: {
          gridDensity: 1.2,
          colorIntensity: 1.3,
          depth: 8,
          reactivity: 1.4,
        },
        parameters: {
          density: 1.2,
          morph: 0.8,
          noiseFreq: 2.5,
          timeScale: 1.2,
        },
        timing: { duration: 600, easing: 'ease-in-out' },
      },
      unfocused: {
        visual: {
          gridDensity: 0.8,
          colorIntensity: 0.7,
          depth: -2,
          reactivity: 0.6,
        },
        parameters: {
          density: 0.8,
          morph: 0.3,
          noiseFreq: 1.8,
          timeScale: 0.8,
        },
        timing: { duration: 600, easing: 'ease-in-out', stagger: 75 },
      },
      system: {
        globalMultipliers: {
          speedMultiplier: 1.1,
          interactionSensitivity: 1.4,
          transitionDurationMultiplier: 0.9,
        },
        parameterWeb: {
          relationships: [
            {
              source: 'colorIntensity',
              target: 'gridDensity',
              relationship: 'inverse',
              intensity: 0.6,
              curve: (x: number) => Math.sin(x * Math.PI * 2) * 0.5 + 0.5,
            },
            {
              source: 'reactivity',
              target: 'depth',
              relationship: 'logarithmic',
              intensity: 0.5,
            },
          ],
        },
      },
    },
  },

  reality_distortion: {
    name: 'reality_distortion',
    description: 'Extreme parameter inversion with cascade stabilization',
    effects: {
      focused: {
        visual: {
          gridDensity: 1.5,
          colorIntensity: 1.6,
          depth: 15,
          reactivity: 1.8,
        },
        parameters: {
          density: 1.5,
          chaos: 0.6,
          glitch: 0.3,
          dispAmp: 0.4,
          chromaShift: 0.15,
          timeScale: 1.5,
        },
        timing: { duration: 300, easing: 'ease-out-expo' },
      },
      unfocused: {
        visual: {
          gridDensity: 0.6,
          colorIntensity: 0.4,
          depth: -8,
          reactivity: 0.5,
        },
        parameters: {
          density: 0.6,
          chaos: 0.2,
          glitch: 0.1,
          dispAmp: 0.1,
          chromaShift: -0.1,
          timeScale: 0.7,
        },
        timing: { duration: 500, easing: 'ease-out-back', stagger: 100 },
      },
      system: {
        globalMultipliers: {
          speedMultiplier: 1.3,
          interactionSensitivity: 2.0,
          transitionDurationMultiplier: 0.8,
        },
        parameterWeb: {
          relationships: [
            {
              source: 'gridDensity',
              target: 'depth',
              relationship: 'inverse',
              intensity: 0.8,
            },
            {
              source: 'colorIntensity',
              target: 'reactivity',
              relationship: 'exponential',
              intensity: 0.7,
            },
            {
              source: 'depth',
              target: 'gridDensity',
              relationship: 'logarithmic',
              intensity: 0.4,
              delay: 200,
            },
          ],
        },
      },
    },
  },

  zen_equilibrium: {
    name: 'zen_equilibrium',
    description: 'Balanced harmony with subtle mathematical stabilization',
    effects: {
      focused: {
        visual: {
          gridDensity: 1.02,
          colorIntensity: 1.05,
          depth: 2,
          reactivity: 1.03,
        },
        parameters: {
          density: 1.02,
          morph: 0.5,
          chaos: 0.02,
          noiseFreq: 2.0,
          timeScale: 1.0,
        },
        timing: { duration: 800, easing: 'ease-in-out-sine' },
      },
      unfocused: {
        visual: {
          gridDensity: 0.98,
          colorIntensity: 0.95,
          depth: -1,
          reactivity: 0.97,
        },
        parameters: {
          density: 0.98,
          morph: 0.5,
          chaos: 0.01,
          noiseFreq: 2.0,
          timeScale: 1.0,
        },
        timing: { duration: 800, easing: 'ease-in-out-sine', stagger: 25 },
      },
      system: {
        globalMultipliers: {
          speedMultiplier: 0.9,
          interactionSensitivity: 0.8,
          transitionDurationMultiplier: 1.5,
        },
        parameterWeb: {
          relationships: [
            {
              source: 'gridDensity',
              target: 'colorIntensity',
              relationship: 'linear',
              intensity: 0.1,
              curve: (x: number) => x * 0.95 + 0.05, // Gentle stabilization
            },
          ],
        },
      },
    },
  },
};

