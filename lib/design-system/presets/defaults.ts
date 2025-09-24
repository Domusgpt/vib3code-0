import { CardTransitionSpec, ClickResponsePattern, EffectPresetBank, HoverResponsePattern, PresetLibrary, ScrollBehaviorPreset, TransitionCoordinationSpec, TransitionPresetBank, VideoExpansionConfig, VisualizerPresetBank } from '../types';

export const HOVER_RESPONSE_PATTERN: HoverResponsePattern = {
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

export const CLICK_RESPONSE_PATTERN: ClickResponsePattern = {
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

export const TRANSITION_COORDINATION: TransitionCoordinationSpec = {
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

export const CARD_TRANSITIONS: CardTransitionSpec = {
  emergence: {
    from_background: {
      translucency: [0, 0.8],
      depth: ['background_layer', 'foreground_layer'],
      scale: [0.8, 1.0],
      geometry_sync: 'background_visualizer_parameters',
      duration: '1200ms',
    },
    from_center: {
      scale: [0.0, 1.0],
      rotation: ['360deg', '0deg'],
      blur: ['20px', '0px'],
      emergence_point: 'screen_center',
      duration: '800ms',
    },
  },
  submersion: {
    to_background: {
      translucency: [0.8, 0],
      depth: ['foreground_layer', 'background_layer'],
      scale: [1.0, 0.8],
      geometry_sync: 'merge_with_background_visualizer',
      duration: '1000ms',
    },
    to_center: {
      scale: [1.0, 0],
      rotation: ['0deg', '360deg'],
      blur: ['0px', '20px'],
      convergence_point: 'screen_center',
      duration: '600ms',
    },
  },
};

export const SCROLLABLE_CARDS: ScrollBehaviorPreset = {
  grid_layout: {
    columns: 'auto-fit(minmax(250px, 1fr))',
    gap: '20px',
    scroll_behavior: 'smooth',
    scroll_snap: 'y_mandatory',
    virtualization: 'enabled_for_performance',
  },
  scroll_interactions: {
    visualizer_response: {
      scroll_up: 'increase_grid_density',
      scroll_down: 'decrease_grid_density',
      scroll_velocity: 'affects_animation_speed',
      scroll_momentum: 'creates_trailing_effects',
    },
    content_behavior: {
      snap_points: 'every_3_items',
      momentum_scrolling: 'ios_style',
      edge_bouncing: 'subtle_elastic',
    },
  },
};

export const VIDEO_EXPANSION: VideoExpansionConfig = {
  expansion_states: {
    thumbnail: {
      size: '100%_of_card',
      visualizer_role: 'background_ambient',
      play_button_overlay: 'center_with_glow',
    },
    playing: {
      size: '150%_of_original',
      z_index: '1000',
      background_blur: 'other_elements',
      visualizer_role: 'audio_reactive',
      controls: 'floating_transparent',
    },
    fullscreen: {
      size: '100vw_100vh',
      background: 'pure_black',
      visualizer_role: 'immersive_audio_visual',
      controls: 'minimal_overlay',
    },
  },
  transitions: {
    thumbnail_to_playing: {
      duration: '500ms',
      easing: 'ease_out_expo',
      visualizer_morph: 'ambient_to_audio_reactive',
    },
    playing_to_fullscreen: {
      duration: '300ms',
      easing: 'ease_in_out',
      visualizer_morph: 'audio_reactive_to_immersive',
    },
  },
};

export const VISUALIZER_PRESETS: VisualizerPresetBank = {
  density_presets: {
    minimal: { base: 4.0, variation: 1.0 },
    standard: { base: 8.0, variation: 2.0 },
    dense: { base: 16.0, variation: 4.0 },
    maximum: { base: 32.0, variation: 8.0 },
  },
  speed_presets: {
    static: { base: 0.0, variation: 0.0 },
    calm: { base: 0.3, variation: 0.1 },
    flowing: { base: 0.6, variation: 0.2 },
    energetic: { base: 1.2, variation: 0.4 },
    frenetic: { base: 2.0, variation: 0.8 },
  },
  reactivity_presets: {
    passive: { mouse: 0.2, click: 0.1, scroll: 0.1 },
    responsive: { mouse: 0.6, click: 0.4, scroll: 0.3 },
    highly_reactive: { mouse: 1.0, click: 0.8, scroll: 0.6 },
    hypersensitive: { mouse: 1.5, click: 1.2, scroll: 1.0 },
  },
  color_presets: {
    monochrome: { palette: 'single_hue_variations' },
    complementary: { palette: 'opposite_color_wheel' },
    triadic: { palette: 'three_equidistant_hues' },
    analogous: { palette: 'adjacent_color_wheel' },
    rainbow: { palette: 'full_spectrum_cycle' },
  },
};

export const TRANSITION_PRESETS: TransitionPresetBank = {
  page_transitions: {
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
  },
  card_transitions: {
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
  },
};

export const EFFECT_PRESETS: EffectPresetBank = {
  hover_effects: {
    subtle_glow: {
      target_enhancement: 'soft_luminous_glow',
      others_response: 'slight_dimming',
      transition_speed: 'fast',
    },
    magnetic_attraction: {
      target_enhancement: 'density_increase_with_pull_effect',
      others_response: 'density_decrease_with_push_effect',
      transition_speed: 'medium',
    },
    reality_distortion: {
      target_enhancement: 'geometry_warping_and_color_shift',
      others_response: 'stability_compensation',
      transition_speed: 'slow',
    },
  },
  click_effects: {
    color_inversion: {
      type: 'spectrum_flip',
      duration: '2000ms',
      decay: 'exponential',
    },
    reality_glitch: {
      type: 'digital_artifact_generation',
      duration: '1500ms',
      decay: 'linear',
    },
    quantum_collapse: {
      type: 'parameter_randomization_then_stabilization',
      duration: '3000ms',
      decay: 'sigmoid',
    },
  },
  scroll_effects: {
    momentum_trails: {
      type: 'motion_blur_with_particle_generation',
      intensity: 'velocity_based',
      decay: 'physics_based',
    },
    chaos_buildup: {
      type: 'progressive_distortion_with_threshold',
      threshold: '5_scroll_events',
      buildup: 'exponential',
      release: 'portal_burst',
    },
    harmonic_resonance: {
      type: 'coordinated_frequency_modulation',
      synchronization: 'all_visualizers',
      pattern: 'mathematical_wave_function',
    },
  },
};

export const PRESET_LIBRARY: PresetLibrary = {
  visualizer: VISUALIZER_PRESETS,
  transitions: TRANSITION_PRESETS,
  effects: EFFECT_PRESETS,
  hoverPattern: HOVER_RESPONSE_PATTERN,
  clickPattern: CLICK_RESPONSE_PATTERN,
  transitionCoordination: TRANSITION_COORDINATION,
  cardTransitions: CARD_TRANSITIONS,
  scrollableCards: SCROLLABLE_CARDS,
  videoExpansion: VIDEO_EXPANSION,
};

