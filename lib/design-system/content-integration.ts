import {
  ContentManagementDefinition,
  ScrollableCardsDefinition,
  VideoExpansionDefinition,
} from './types';

export const SCROLLABLE_CARDS_CONFIG: ScrollableCardsDefinition = {
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
      accent_channel: 'highlight_layers_pulse',
      complementary_channel: 'background_shadow_balance',
    },
    content_behavior: {
      snap_points: 'every_3_items',
      momentum_scrolling: 'ios_style',
      edge_bouncing: 'subtle_elastic',
    },
  },
  accent_layers: {
    highlight: 'velocity_pulse',
    accent: 'trail_extension',
  },
  complementary_layers: {
    background: 'depth_cushion',
    shadow: 'momentum_buffer',
  },
};

export const VIDEO_EXPANSION_CONFIG: VideoExpansionDefinition = {
  expansion_states: {
    thumbnail: {
      size: '100%_of_card',
      visualizer_role: 'background_ambient',
      play_button_overlay: 'center_with_glow',
      controls: 'overlay_button',
      accent_layer: 'background',
      complementary_layer: 'shadow',
    },
    playing: {
      size: '150%_of_original',
      z_index: '1000',
      background_blur: 'other_elements',
      visualizer_role: 'audio_reactive',
      controls: 'floating_transparent',
      accent_layer: 'highlight',
      complementary_layer: 'content',
    },
    fullscreen: {
      size: '100vw_100vh',
      background: 'pure_black',
      visualizer_role: 'immersive_audio_visual',
      controls: 'minimal_overlay',
      accent_layer: 'accent',
      complementary_layer: 'background',
    },
  },
  transitions: {
    thumbnail_to_playing: {
      duration: '500ms',
      easing: 'ease_out_expo',
      visualizer_morph: 'ambient_to_audio_reactive',
      accent_sync: 'highlight_wave_alignment',
      complementary_sync: 'background_stabilize',
    },
    playing_to_fullscreen: {
      duration: '300ms',
      easing: 'ease_in_out',
      visualizer_morph: 'audio_reactive_to_immersive',
      accent_sync: 'accent_radiance_spread',
      complementary_sync: 'shadow_wrap_enclosure',
    },
  },
};

export const CONTENT_MANAGEMENT_CONFIG: ContentManagementDefinition = {
  sections: [
    {
      id: 'section_type',
      type: 'dropdown',
      options: ['article_grid', 'video_gallery', 'audio_playlist', 'image_showcase', 'custom_layout'],
    },
    {
      id: 'scrolling',
      type: 'toggle',
      options: ['enabled', 'disabled'],
      subOptions: {
        enabled: ['smooth', 'snap', 'infinite'],
        scroll_direction: ['vertical', 'horizontal', 'both'],
      },
    },
    {
      id: 'expansion',
      type: 'toggle',
      options: ['enabled', 'disabled'],
      subOptions: {
        enabled: ['click', 'hover', 'auto'],
        expansion_size: ['1.5x', '2x', 'fullscreen'],
      },
    },
  ],
  actions: [
    {
      id: 'add_content',
      type: 'button',
      label: 'Add Content Item',
      actions: ['open_content_editor'],
    },
    {
      id: 'content_list',
      type: 'sortable_list',
      label: 'Content Items',
      actions: ['edit', 'delete', 'duplicate', 'reorder'],
    },
  ],
  accent_options: ['highlight', 'accent', 'content'],
  complementary_options: ['background', 'shadow', 'content'],
};

