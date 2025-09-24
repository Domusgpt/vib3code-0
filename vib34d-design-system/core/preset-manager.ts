import visualizerPresetsData from '../presets/visualizer-presets.json';
import transitionPresetsData from '../presets/transition-presets.json';
import interactionPresetsData from '../presets/interaction-presets.json';
import effectPresetsData from '../presets/effect-presets.json';
import {
  ColorPreset,
  ColorPresetName,
  DesignSystemSelection,
  EffectPresetDefinition,
  InteractionPresetsDefinition,
  ReactivityPreset,
  TransitionPresetDefinition,
  VisualizerComputedState,
  VisualizerPresetsDefinition,
  DensityPresetName,
  SpeedPresetName,
  ReactivityPresetName,
  HoverEffectName,
  ClickEffectName,
  ScrollEffectName,
  PageTransitionName,
  CardTransitionName
} from './types';

export type PresetCategory = 'visualizer' | 'interaction' | 'transition' | 'effect';

type CustomPresetRegistry = Record<PresetCategory, Record<string, unknown>>;

export class PresetManager {
  private visualizerPresets: VisualizerPresetsDefinition;
  private transitionPresets: TransitionPresetDefinition;
  private interactionPresets: InteractionPresetsDefinition;
  private effectPresets: EffectPresetDefinition;
  private customPresets: CustomPresetRegistry = {
    visualizer: {},
    interaction: {},
    transition: {},
    effect: {}
  };

  constructor() {
    this.visualizerPresets = visualizerPresetsData as VisualizerPresetsDefinition;
    this.transitionPresets = transitionPresetsData as TransitionPresetDefinition;
    this.interactionPresets = interactionPresetsData as InteractionPresetsDefinition;
    this.effectPresets = effectPresetsData as EffectPresetDefinition;
  }

  getVisualizerPresetOptions() {
    return {
      density: Object.keys(this.visualizerPresets.density_presets) as DensityPresetName[],
      speed: Object.keys(this.visualizerPresets.speed_presets) as SpeedPresetName[],
      reactivity: Object.keys(this.visualizerPresets.reactivity_presets) as ReactivityPresetName[],
      colorScheme: Object.keys(this.visualizerPresets.color_presets) as ColorPresetName[]
    };
  }

  getInteractionPresetOptions() {
    return {
      hover: Object.keys(this.interactionPresets.hover_effects) as HoverEffectName[],
      click: Object.keys(this.interactionPresets.click_effects) as ClickEffectName[],
      scroll: Object.keys(this.interactionPresets.scroll_effects) as ScrollEffectName[]
    };
  }

  getTransitionPresetOptions() {
    return {
      page: Object.keys(this.transitionPresets.page_transitions) as PageTransitionName[],
      card: Object.keys(this.transitionPresets.card_transitions) as CardTransitionName[]
    };
  }

  getVisualizerPresets() {
    return this.visualizerPresets;
  }

  getInteractionPresets() {
    return this.interactionPresets;
  }

  getEffectPresets() {
    return this.effectPresets;
  }

  getTransitionPresets() {
    return this.transitionPresets;
  }

  composeVisualizerState(selection: DesignSystemSelection, timestamp: number): VisualizerComputedState {
    const density = this.visualizerPresets.density_presets[selection.density];
    const speed = this.visualizerPresets.speed_presets[selection.speed];
    const reactivity = this.visualizerPresets.reactivity_presets[selection.reactivity];
    const colorScheme = this.visualizerPresets.color_presets[selection.colorScheme];

    const speedValue = (speed.base + speed.variation * 0.5) * selection.globalSpeedMultiplier;

    const scaledReactivity: ReactivityPreset = {
      mouse: parseFloat((reactivity.mouse * selection.interactionSensitivity).toFixed(3)),
      click: parseFloat((reactivity.click * selection.interactionSensitivity).toFixed(3)),
      scroll: parseFloat((reactivity.scroll * selection.interactionSensitivity).toFixed(3))
    };

    return {
      gridDensity: density.base,
      gridVariance: density.variation,
      colorIntensity: 1,
      animationSpeed: speedValue,
      speedVariance: speed.variation,
      reactivity: scaledReactivity,
      depthOffset: 0,
      translucency: 0.8,
      scale: 1,
      rotation: 0,
      blur: 0,
      colorScheme: colorScheme as ColorPreset,
      isInverted: false,
      sparkles: 0,
      rippleActive: false,
      lastUpdated: timestamp
    };
  }

  createCustomPreset(category: PresetCategory, name: string, preset: unknown) {
    this.customPresets[category][name] = preset;
  }

  getCustomPresets(category: PresetCategory) {
    return this.customPresets[category];
  }

  exportCustomPresetLibrary() {
    return JSON.parse(JSON.stringify(this.customPresets));
  }

  importCustomPresetLibrary(library: Partial<CustomPresetRegistry>) {
    (Object.keys(library) as PresetCategory[]).forEach((key) => {
      this.customPresets[key] = {
        ...this.customPresets[key],
        ...library[key]
      };
    });
  }

  resetCustomPresets(category?: PresetCategory) {
    if (category) {
      this.customPresets[category] = {};
      return;
    }

    this.customPresets = {
      visualizer: {},
      interaction: {},
      transition: {},
      effect: {}
    };
  }
}

export default PresetManager;
