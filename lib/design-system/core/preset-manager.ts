import { EFFECT_PRESETS, PRESET_LIBRARY, VISUALIZER_PRESETS } from '../presets/defaults';
import {
  CardMetrics,
  DesignSystemSettings,
  EffectPresetBank,
  PresetLibrary,
  VisualizerPresetBank,
} from '../types';

export class PresetManager {
  private readonly library: PresetLibrary;
  private readonly customPresets = new Map<string, Partial<CardMetrics>>();

  constructor(library: PresetLibrary = PRESET_LIBRARY) {
    this.library = library;
  }

  get visualizer(): VisualizerPresetBank {
    return this.library.visualizer;
  }

  get effects(): EffectPresetBank {
    return this.library.effects;
  }

  get transitions() {
    return this.library.transitions;
  }

  get hoverPattern() {
    return this.library.hoverPattern;
  }

  get clickPattern() {
    return this.library.clickPattern;
  }

  get transitionCoordination() {
    return this.library.transitionCoordination;
  }

  get cardTransitions() {
    return this.library.cardTransitions;
  }

  get scrollableCards() {
    return this.library.scrollableCards;
  }

  get videoExpansion() {
    return this.library.videoExpansion;
  }

  createCardBaseMetrics(settings: DesignSystemSettings): CardMetrics {
    const densityPreset = this.library.visualizer.density_presets[settings.style.density] ?? VISUALIZER_PRESETS.density_presets.standard;
    const reactivityPreset = this.library.visualizer.reactivity_presets[settings.style.reactivity] ?? VISUALIZER_PRESETS.reactivity_presets.responsive;

    const baseDensity = densityPreset.base / 32; // normalize to 0-1
    const colorIntensity = densityPreset.variation / 8 + 0.6;

    return {
      gridDensity: Number.isFinite(baseDensity) ? baseDensity : 0.25,
      colorIntensity: Number.isFinite(colorIntensity) ? colorIntensity : 0.8,
      reactivity: reactivityPreset.mouse * settings.advanced.interaction_sensitivity,
      depth: 0,
    };
  }

  saveCustomPreset(name: string, metrics: CardMetrics) {
    this.customPresets.set(name, metrics);
  }

  getCustomPreset(name: string): Partial<CardMetrics> | undefined {
    return this.customPresets.get(name);
  }

  listCustomPresets() {
    return Array.from(this.customPresets.entries()).map(([name, metrics]) => ({ name, metrics }));
  }
}
