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
  transition: {
    duration: '300ms',
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    stagger: '50ms',
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
};

