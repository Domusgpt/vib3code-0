import {
  CardTransitionsDefinition,
  HoverResponseDefinition,
  ClickResponseDefinition,
  TransitionCoordinationDefinition,
} from './types';

export const UNIVERSAL_HOVER_RESPONSE: HoverResponseDefinition = {
  target: {
    gridDensity: 'increase_2x',
    colorIntensity: 'increase_1.5x',
    reactivity: 'increase_1.3x',
    depth: 'lift_forward_10px',
  },
  others: {
    gridDensity: 'decrease_0.5x',
    colorIntensity: 'decrease_0.8x',
    reactivity: 'decrease_0.7x',
    depth: 'push_back_5px',
  },
  accent: {
    target: {
      gridDensity: 'increase_2.4x',
      colorIntensity: 'increase_1.8x',
      reactivity: 'increase_1.5x',
      depth: 'lift_forward_18px',
    },
    others: {
      gridDensity: 'decrease_0.6x',
      colorIntensity: 'decrease_0.75x',
      reactivity: 'decrease_0.65x',
      depth: 'push_back_9px',
    },
  },
  complementary: {
    target: {
      gridDensity: 'increase_1.7x',
      colorIntensity: 'increase_1.4x',
      reactivity: 'increase_1.25x',
      depth: 'lift_forward_6px',
    },
    others: {
      gridDensity: 'decrease_0.7x',
      colorIntensity: 'decrease_0.85x',
      reactivity: 'decrease_0.75x',
      depth: 'push_back_4px',
    },
  },
  transition: {
    duration: '300ms',
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    stagger: '50ms',
  },
};

export const UNIVERSAL_CLICK_RESPONSE: ClickResponseDefinition = {
  primary: {
    target: {
      gridDensity: 'increase_1.3x',
      colorIntensity: 'increase_1.4x',
      reactivity: 'increase_1.35x',
      depth: 'lift_forward_12px',
    },
    others: {
      gridDensity: 'decrease_0.8x',
      colorIntensity: 'decrease_0.85x',
      reactivity: 'decrease_0.75x',
      depth: 'push_back_6px',
    },
  },
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
    target: {
      gridDensity: 'increase_1.6x',
      colorIntensity: 'increase_1.7x',
      reactivity: 'increase_1.6x',
      depth: 'lift_forward_20px',
    },
    others: {
      gridDensity: 'decrease_0.7x',
      colorIntensity: 'decrease_0.8x',
      reactivity: 'decrease_0.7x',
      depth: 'push_back_10px',
    },
    rippleEffect: 'accent_ring',
    sparkleGeneration: '16_particles',
    duration: '900ms',
  },
  complementary: {
    target: {
      gridDensity: 'increase_1.2x',
      colorIntensity: 'increase_1.25x',
      reactivity: 'increase_1.15x',
      depth: 'lift_forward_8px',
    },
    others: {
      gridDensity: 'decrease_0.85x',
      colorIntensity: 'decrease_0.9x',
      reactivity: 'decrease_0.85x',
      depth: 'push_back_5px',
    },
    rippleEffect: 'complementary_wave',
    sparkleGeneration: '10_particles',
    duration: '700ms',
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
    phase1: 'accent_flare_charge',
    phase2: 'accent_wave_emit',
    phase3: 'accent_glimmer_decay',
    phase4: 'accent_harmonic_release',
    timing: {
      phase1: '300ms-600ms',
      phase2: '600ms-900ms',
      phase3: '900ms-1200ms',
      phase4: '1200ms-1600ms',
    },
  },
  complementary: {
    phase1: 'complementary_swell',
    phase2: 'complementary_lattice_shift',
    phase3: 'complementary_color_echo',
    phase4: 'complementary_depth_settle',
    timing: {
      phase1: '400ms-700ms',
      phase2: '700ms-1000ms',
      phase3: '1000ms-1400ms',
      phase4: '1400ms-1800ms',
    },
  },
  mathematical_relationship: {
    density_conservation: 'outgoing_loss = incoming_gain',
    color_harmonic: 'complementary_color_progression',
    geometric_morphing: 'shared_mathematical_transform',
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
    },
    from_center: {
      scale: '0 → 1.0',
      rotation: '360deg → 0deg',
      blur: '20px → 0px',
      emergence_point: 'screen_center',
      duration: '800ms',
    },
  },
  submersion: {
    to_background: {
      translucency: '0.8 → 0',
      depth: 'foreground_layer → background_layer',
      scale: '1.0 → 0.8',
      geometry_sync: 'merge_with_background_visualizer',
      duration: '1000ms',
    },
    to_center: {
      scale: '1.0 → 0',
      rotation: '0deg → 360deg',
      blur: '0px → 20px',
      convergence_point: 'screen_center',
      duration: '600ms',
    },
  },
  accent: {
    halo_bloom: {
      translucency: '0.3 → 0.9',
      depth: 'mid_layer → highlight_layer',
      scale: '1.0 → 1.15',
      geometry_sync: 'accent_visualizer_phase_lock',
      duration: '900ms',
    },
    flare_loop: {
      rotation: '0deg → -180deg',
      blur: '5px → 0px',
      scale: '0.9 → 1.1',
      emergence_point: 'perimeter_field',
      duration: '750ms',
    },
  },
  complementary: {
    lattice_shear: {
      translucency: '0.2 → 0.7',
      depth: 'background_layer → mid_layer',
      scale: '0.85 → 1.05',
      geometry_sync: 'complementary_visualizer_blend',
      duration: '800ms',
    },
    prism_slide: {
      scale: '1.05 → 0.95',
      rotation: '45deg → 0deg',
      blur: '0px → 10px',
      convergence_point: 'corner_nodes',
      duration: '700ms',
    },
  },
};

