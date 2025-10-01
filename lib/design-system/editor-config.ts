import { EditorControlDefinition, EditorPanelDefinition } from './types';

const visualizerControls: EditorControlDefinition[] = [
  {
    id: 'visualizer_density',
    type: 'dropdown',
    label: 'Density',
    options: [
      { label: 'Minimal', value: 'minimal' },
      { label: 'Standard', value: 'standard' },
      { label: 'Dense', value: 'dense' },
      { label: 'Maximum', value: 'maximum' },
    ],
    livePreview: true,
  },
  {
    id: 'visualizer_speed',
    type: 'dropdown',
    label: 'Speed',
    options: [
      { label: 'Static', value: 'static' },
      { label: 'Calm', value: 'calm' },
      { label: 'Flowing', value: 'flowing' },
      { label: 'Energetic', value: 'energetic' },
      { label: 'Frenetic', value: 'frenetic' },
    ],
    livePreview: true,
  },
  {
    id: 'visualizer_reactivity',
    type: 'dropdown',
    label: 'Reactivity',
    options: [
      { label: 'Passive', value: 'passive' },
      { label: 'Responsive', value: 'responsive' },
      { label: 'Highly Reactive', value: 'highly_reactive' },
      { label: 'Hypersensitive', value: 'hypersensitive' },
    ],
    livePreview: true,
  },
  {
    id: 'visualizer_color',
    type: 'dropdown',
    label: 'Color Scheme',
    options: [
      { label: 'Monochrome', value: 'monochrome' },
      { label: 'Complementary', value: 'complementary' },
      { label: 'Triadic', value: 'triadic' },
      { label: 'Analogous', value: 'analogous' },
      { label: 'Rainbow', value: 'rainbow' },
    ],
    livePreview: true,
  },
  {
    id: 'accent_layer_focus',
    type: 'dropdown',
    label: 'Accent Layer Focus',
    options: [
      { label: 'Highlight Pulse', value: 'highlight' },
      { label: 'Accent Orbit', value: 'accent' },
      { label: 'Content Cascade', value: 'content' },
    ],
    livePreview: true,
  },
  {
    id: 'complementary_layer_balance',
    type: 'dropdown',
    label: 'Complement Layer Balance',
    options: [
      { label: 'Background Cushion', value: 'background' },
      { label: 'Shadow Stabilizer', value: 'shadow' },
      { label: 'Content Resonance', value: 'content' },
    ],
    livePreview: true,
  },
];

const interactionControls: EditorControlDefinition[] = [
  {
    id: 'hover_effect',
    type: 'dropdown',
    label: 'Hover Effect',
    options: [
      { label: 'Subtle Glow', value: 'subtle_glow' },
      { label: 'Magnetic Attraction', value: 'magnetic_attraction' },
      { label: 'Reality Distortion', value: 'reality_distortion' },
    ],
    livePreview: true,
  },
  {
    id: 'click_effect',
    type: 'dropdown',
    label: 'Click Effect',
    options: [
      { label: 'Color Inversion', value: 'color_inversion' },
      { label: 'Reality Glitch', value: 'reality_glitch' },
      { label: 'Quantum Collapse', value: 'quantum_collapse' },
    ],
    livePreview: true,
  },
  {
    id: 'scroll_effect',
    type: 'dropdown',
    label: 'Scroll Effect',
    options: [
      { label: 'Momentum Trails', value: 'momentum_trails' },
      { label: 'Chaos Buildup', value: 'chaos_buildup' },
      { label: 'Harmonic Resonance', value: 'harmonic_resonance' },
    ],
    livePreview: true,
  },
  {
    id: 'accent_response',
    type: 'dropdown',
    label: 'Accent Response',
    options: [
      { label: 'Pulse Amplify', value: 'pulse_amplify' },
      { label: 'Radiant Sweep', value: 'radiant_sweep' },
      { label: 'Orbit Trace', value: 'orbit_trace' },
    ],
    livePreview: true,
  },
  {
    id: 'complementary_response',
    type: 'dropdown',
    label: 'Complementary Response',
    options: [
      { label: 'Shadow Dampening', value: 'shadow_dampening' },
      { label: 'Background Cushion', value: 'background_cushion' },
      { label: 'Content Echo', value: 'content_echo' },
    ],
    livePreview: true,
  },
];

const transitionControls: EditorControlDefinition[] = [
  {
    id: 'page_transition',
    type: 'dropdown',
    label: 'Page Transition',
    options: [
      { label: 'Fade Cross', value: 'fade_cross' },
      { label: 'Slide Portal', value: 'slide_portal' },
      { label: 'Spiral Morph', value: 'spiral_morph' },
      { label: 'Glitch Burst', value: 'glitch_burst' },
    ],
    previewActionId: 'test_transition',
  },
  {
    id: 'card_transition',
    type: 'dropdown',
    label: 'Card Transition',
    options: [
      { label: 'Gentle Emerge', value: 'gentle_emerge' },
      { label: 'Dramatic Burst', value: 'dramatic_burst' },
      { label: 'Liquid Flow', value: 'liquid_flow' },
    ],
    previewActionId: 'test_card_animation',
  },
];

const advancedControls: EditorControlDefinition[] = [
  {
    id: 'global_speed_multiplier',
    type: 'slider',
    label: 'Global Speed Multiplier',
    range: [0.1, 3.0],
    step: 0.1,
    defaultValue: 1.0,
    livePreview: true,
  },
  {
    id: 'interaction_sensitivity',
    type: 'slider',
    label: 'Interaction Sensitivity',
    range: [0.1, 2.0],
    step: 0.1,
    defaultValue: 1.0,
    livePreview: true,
  },
  {
    id: 'transition_duration_multiplier',
    type: 'slider',
    label: 'Transition Duration Multiplier',
    range: [0.5, 2.0],
    step: 0.1,
    defaultValue: 1.0,
    livePreview: true,
  },
  {
    id: 'accent_complement_ratio',
    type: 'slider',
    label: 'Accent / Complement Ratio',
    range: [0.2, 2.0],
    step: 0.1,
    defaultValue: 1.0,
    livePreview: true,
  },
  {
    id: 'envelope_persistence',
    type: 'slider',
    label: 'Envelope Persistence',
    range: [0.3, 0.95],
    step: 0.01,
    defaultValue: 0.7,
    livePreview: true,
  },
];

export const STYLE_SETTINGS_PANEL: EditorPanelDefinition = {
  id: 'style_settings',
  sections: [
    { id: 'visualizer_configuration', title: 'Visualizer Configuration', controls: visualizerControls },
    { id: 'interaction_behavior', title: 'Interaction Behavior', controls: interactionControls },
    { id: 'transition_style', title: 'Transition Style', controls: transitionControls },
    { id: 'advanced_tuning', title: 'Advanced Tuning', controls: advancedControls },
  ],
};

export const CONTENT_MANAGEMENT_PANEL: EditorPanelDefinition = {
  id: 'content_management',
  sections: [
    {
      id: 'section_configuration',
      title: 'Section Configuration',
      controls: [
        {
          id: 'section_type',
          type: 'dropdown',
          label: 'Section Type',
          options: [
            { label: 'Article Grid', value: 'article_grid' },
            { label: 'Video Gallery', value: 'video_gallery' },
            { label: 'Audio Playlist', value: 'audio_playlist' },
            { label: 'Image Showcase', value: 'image_showcase' },
            { label: 'Custom Layout', value: 'custom_layout' },
          ],
        },
        {
          id: 'scrolling_toggle',
          type: 'toggle',
          label: 'Scrolling',
          options: [
            { label: 'Enabled', value: 'enabled' },
            { label: 'Disabled', value: 'disabled' },
          ],
        },
        {
          id: 'expansion_toggle',
          type: 'toggle',
          label: 'Expansion',
          options: [
            { label: 'Enabled', value: 'enabled' },
            { label: 'Disabled', value: 'disabled' },
          ],
        },
        {
          id: 'accent_layer_binding',
          type: 'dropdown',
          label: 'Accent Layer Binding',
          options: [
            { label: 'Highlight Pulse', value: 'highlight' },
            { label: 'Accent Orbit', value: 'accent' },
            { label: 'Content Cascade', value: 'content' },
          ],
        },
        {
          id: 'complement_layer_binding',
          type: 'dropdown',
          label: 'Complement Layer Binding',
          options: [
            { label: 'Background Cushion', value: 'background' },
            { label: 'Shadow Shield', value: 'shadow' },
            { label: 'Content Support', value: 'content' },
          ],
        },
      ],
    },
    {
      id: 'content_items',
      title: 'Content Items',
      controls: [
        {
          id: 'add_content',
          type: 'button',
          label: 'Add Content',
          actions: ['open_content_editor'],
        },
        {
          id: 'content_list',
          type: 'sortable_list',
          label: 'Content List',
          actions: ['edit', 'delete', 'duplicate', 'reorder'],
        },
      ],
    },
  ],
};

