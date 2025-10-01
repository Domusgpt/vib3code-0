import {
  CardTransitionsDefinition,
  HoverResponseDefinition,
  ClickResponseDefinition,
  TransitionCoordinationDefinition,
} from './types';

export const UNIVERSAL_HOVER_RESPONSE: HoverResponseDefinition = {
  target: {
    primary: {
      gridDensity: 'increase_2x',
      colorIntensity: 'increase_1.5x',
      reactivity: 'increase_1.3x',
      depth: 'lift_forward_10px',
    },
    accent: {
      gridDensity: 'increase_1.6x',
      colorIntensity: 'increase_1.8x',
      reactivity: 'increase_1.6x',
      depth: 'lift_forward_18px',
    },
    complementary: {
      gridDensity: 'increase_1.2x',
      colorIntensity: 'increase_1.25x',
      reactivity: 'increase_1.2x',
      depth: 'lift_forward_8px',
    },
    layers: {
      background: {
        gridDensity: 'decrease_0.85x',
        colorIntensity: 'decrease_0.8x',
        reactivity: 'decrease_0.75x',
        depth: 'push_back_12px',
      },
      shadow: {
        gridDensity: 'decrease_0.8x',
        colorIntensity: 'decrease_0.75x',
        reactivity: 'decrease_0.7x',
        depth: 'push_back_16px',
      },
      content: {
        gridDensity: 'increase_1.3x',
        colorIntensity: 'increase_1.35x',
        reactivity: 'increase_1.25x',
        depth: 'lift_forward_8px',
      },
      highlight: {
        gridDensity: 'increase_1.7x',
        colorIntensity: 'increase_1.85x',
        reactivity: 'increase_1.7x',
        depth: 'lift_forward_22px',
      },
      accent: {
        gridDensity: 'increase_1.9x',
        colorIntensity: 'increase_1.95x',
        reactivity: 'increase_1.8x',
        depth: 'lift_forward_26px',
      },
    },
  },
  others: {
    primary: {
      gridDensity: 'decrease_0.5x',
      colorIntensity: 'decrease_0.8x',
      reactivity: 'decrease_0.7x',
      depth: 'push_back_5px',
    },
    accent: {
      gridDensity: 'decrease_0.65x',
      colorIntensity: 'decrease_0.7x',
      reactivity: 'decrease_0.65x',
      depth: 'push_back_12px',
    },
    complementary: {
      gridDensity: 'increase_1.05x',
      colorIntensity: 'increase_1.08x',
      reactivity: 'increase_1.05x',
      depth: 'lift_forward_4px',
    },
    layers: {
      background: {
        gridDensity: 'increase_1.05x',
        colorIntensity: 'increase_1.1x',
        reactivity: 'increase_1.05x',
        depth: 'push_back_6px',
      },
      shadow: {
        gridDensity: 'increase_1.02x',
        colorIntensity: 'increase_1.05x',
        reactivity: 'increase_1.02x',
        depth: 'push_back_4px',
      },
      content: {
        gridDensity: 'decrease_0.85x',
        colorIntensity: 'decrease_0.9x',
        reactivity: 'decrease_0.85x',
        depth: 'push_back_6px',
      },
      highlight: {
        gridDensity: 'decrease_0.7x',
        colorIntensity: 'decrease_0.75x',
        reactivity: 'decrease_0.7x',
        depth: 'push_back_14px',
      },
      accent: {
        gridDensity: 'decrease_0.6x',
        colorIntensity: 'decrease_0.58x',
        reactivity: 'decrease_0.6x',
        depth: 'push_back_18px',
      },
    },
  },
  transition: {
    duration: '420ms',
    easing: 'cubic-bezier(0.23, 0.72, 0.32, 0.99)',
    stagger: '80ms',
  },
};

export const UNIVERSAL_CLICK_RESPONSE: ClickResponseDefinition = {
  immediate: {
    colorInversion: 'full_spectrum',
    variableInversion: {
      speed: 'reverse_direction',
      density: 'inverse_value',
      intensity: 'flip_polarity',
    },
    rippleEffect: 'radial_burst',
    sparkleGeneration: '8_particles',
  },
  duration: {
    inversion: '2000ms',
    decay: '500ms',
    sparkles: '1500ms',
  },
  accent: {
    layer: 'highlight',
    depth: 'lift_forward_28px',
    chroma: 'increase_1.6x',
    resonance: 'increase_1.8x',
  },
  complementary: {
    layer: 'background',
    depth: 'push_back_18px',
    chroma: 'decrease_0.7x',
    resonance: 'increase_1.2x',
  },
};

export const TRANSITION_COORDINATION: TransitionCoordinationDefinition = {
  outgoing: {
    phase1: 'density_collapse',
    phase2: 'color_fade_to_black',
    phase3: 'geometry_dissolve',
    phase4: 'translucency_to_zero',
    timing: {
      phase1: '0ms-400ms',
      phase2: '200ms-600ms',
      phase3: '400ms-800ms',
      phase4: '600ms-1000ms',
    },
  },
  incoming: {
    phase1: 'translucency_from_zero',
    phase2: 'geometry_crystallize',
    phase3: 'color_bloom',
    phase4: 'density_expansion',
    timing: {
      phase1: '500ms-900ms',
      phase2: '700ms-1100ms',
      phase3: '900ms-1300ms',
      phase4: '1100ms-1500ms',
    },
  },
  accent: {
    phase1: 'accent_charge',
    phase2: 'highlight_flare',
    phase3: 'accent_crossfade',
    phase4: 'accent_settle',
    timing: {
      phase1: '150ms-450ms',
      phase2: '400ms-900ms',
      phase3: '850ms-1400ms',
      phase4: '1200ms-1700ms',
    },
  },
  complementary: {
    phase1: 'shadow_wrap',
    phase2: 'background_drift',
    phase3: 'content_alignment',
    phase4: 'parallax_lock',
    timing: {
      phase1: '0ms-500ms',
      phase2: '300ms-900ms',
      phase3: '700ms-1300ms',
      phase4: '1200ms-1800ms',
    },
  },
  mathematical_relationship: {
    density_conservation: 'outgoing_loss = incoming_gain',
    color_harmonic: 'complementary_color_progression',
    geometric_morphing: 'shared_mathematical_transform',
    accent_resonance: 'highlight_phase_sync_with_content',
    complementary_balance: 'background_shadow_inverse_curve',
  },
};

export const CARD_TRANSITIONS_STATES: CardTransitionsDefinition = {
  emergence: {
    from_background: {
      translucency: '0 → 0.8',
      depth: 'background_layer → foreground_layer',
      scale: '0.8 → 1.0',
      geometry_sync: 'background_visualizer_parameters',
      duration: '1200ms',
      accent_layer: 'highlight',
      complementary_layer: 'background',
      accent_timing: 'phase2_peak',
      complementary_timing: 'phase1_trail',
    },
    from_center: {
      scale: '0 → 1.0',
      rotation: '360deg → 0deg',
      blur: '20px → 0px',
      emergence_point: 'screen_center',
      duration: '800ms',
      accent_layer: 'accent',
      complementary_layer: 'shadow',
      accent_timing: 'phase3_resonate',
      complementary_timing: 'phase2_balance',
    },
    accent_radiance: {
      translucency: '0 → 1.0',
      depth: 'accent_layer → foreground_layer',
      scale: '0.6 → 1.2',
      geometry_sync: 'accent_visualizer_pulse',
      duration: '1400ms',
      rotation: '540deg → 0deg',
      blur: '16px → 0px',
      accent_layer: 'accent',
      complementary_layer: 'shadow',
      accent_timing: 'phase3_resonate',
      complementary_timing: 'phase2_balance',
    },
  },
  submersion: {
    to_background: {
      translucency: '0.8 → 0',
      depth: 'foreground_layer → background_layer',
      scale: '1.0 → 0.8',
      geometry_sync: 'merge_with_background_visualizer',
      duration: '1000ms',
      accent_layer: 'highlight',
      complementary_layer: 'background',
      accent_timing: 'phase1_release',
      complementary_timing: 'phase3_anchor',
    },
    to_center: {
      scale: '1.0 → 0',
      rotation: '0deg → 360deg',
      blur: '0px → 20px',
      convergence_point: 'screen_center',
      duration: '600ms',
      accent_layer: 'accent',
      complementary_layer: 'content',
      accent_timing: 'phase2_sweep',
      complementary_timing: 'phase3_compress',
    },
    complementary_fold: {
      translucency: '0.9 → 0',
      depth: 'foreground_layer → background_layer',
      scale: '1.1 → 0.5',
      geometry_sync: 'background_shadow_merge',
      duration: '900ms',
      blur: '10px → 24px',
      accent_layer: 'highlight',
      complementary_layer: 'background',
      accent_timing: 'phase1_release',
      complementary_timing: 'phase3_anchor',
    },
  },
};

