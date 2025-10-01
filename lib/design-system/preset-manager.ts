import {
  cardTransitionPresets,
  clickEffectPresets,
  hoverEffectPresets,
  pageTransitionPresets,
  scrollEffectPresets,
  visualizerColorPresets,
  visualizerDensityPresets,
  visualizerReactivityPresets,
  visualizerSpeedPresets,
  accentOverlayPresets,
  complementaryOverlayPresets,
} from './presets';
import {
  CardTransitionPreset,
  ClickEffectPreset,
  DesignSystemAdvancedTuning,
  HoverEffectPreset,
  MinimalParamsSnapshot,
  PageTransitionPreset,
  ParameterPatch,
  ScrollEffectPreset,
  VisualizerColorPreset,
  VisualizerDensityPreset,
  VisualizerReactivityPreset,
  VisualizerSpeedPreset,
} from './types';

export type PresetCategory =
  | 'visualizer'
  | 'speed'
  | 'reactivity'
  | 'color'
  | 'hoverEffect'
  | 'clickEffect'
  | 'scrollEffect'
  | 'pageTransition'
  | 'cardTransition'
  | 'accentOverlay'
  | 'complementaryOverlay';

export class PresetManager {
  private customPresets: Record<string, ParameterPatch> = {};

  list(category: PresetCategory): string[] {
    switch (category) {
      case 'visualizer':
        return Object.keys(visualizerDensityPresets);
      case 'speed':
        return Object.keys(visualizerSpeedPresets);
      case 'reactivity':
        return Object.keys(visualizerReactivityPresets);
      case 'color':
        return Object.keys(visualizerColorPresets);
      case 'hoverEffect':
        return Object.keys(hoverEffectPresets);
      case 'clickEffect':
        return Object.keys(clickEffectPresets);
      case 'scrollEffect':
        return Object.keys(scrollEffectPresets);
      case 'pageTransition':
        return Object.keys(pageTransitionPresets);
      case 'cardTransition':
        return Object.keys(cardTransitionPresets);
      case 'accentOverlay':
        return Object.keys(accentOverlayPresets);
      case 'complementaryOverlay':
        return Object.keys(complementaryOverlayPresets);
      default:
        return [];
    }
  }

  get(category: 'visualizer', name: string): VisualizerDensityPreset | undefined;
  get(category: 'speed', name: string): VisualizerSpeedPreset | undefined;
  get(category: 'reactivity', name: string): VisualizerReactivityPreset | undefined;
  get(category: 'color', name: string): VisualizerColorPreset | undefined;
  get(category: 'hoverEffect', name: string): HoverEffectPreset | undefined;
  get(category: 'clickEffect', name: string): ClickEffectPreset | undefined;
  get(category: 'scrollEffect', name: string): ScrollEffectPreset | undefined;
  get(category: 'pageTransition', name: string): PageTransitionPreset | undefined;
  get(category: 'cardTransition', name: string): CardTransitionPreset | undefined;
  get(category: 'accentOverlay', name: string): ParameterPatch | undefined;
  get(category: 'complementaryOverlay', name: string): ParameterPatch | undefined;
  get(category: PresetCategory, name: string): unknown {
    switch (category) {
      case 'visualizer':
        return visualizerDensityPresets[name];
      case 'speed':
        return visualizerSpeedPresets[name];
      case 'reactivity':
        return visualizerReactivityPresets[name];
      case 'color':
        return visualizerColorPresets[name];
      case 'hoverEffect':
        return hoverEffectPresets[name];
      case 'clickEffect':
        return clickEffectPresets[name];
      case 'scrollEffect':
        return scrollEffectPresets[name];
      case 'pageTransition':
        return pageTransitionPresets[name];
      case 'cardTransition':
        return cardTransitionPresets[name];
      case 'accentOverlay':
        return accentOverlayPresets[name];
      case 'complementaryOverlay':
        return complementaryOverlayPresets[name];
      default:
        return undefined;
    }
  }

  computeHomePatch(
    category: PresetCategory,
    name: string,
    base: MinimalParamsSnapshot,
    advanced: DesignSystemAdvancedTuning
  ): ParameterPatch | undefined {
    switch (category) {
      case 'visualizer':
        return this.computeVisualizerPatch(name, base);
      case 'speed':
        return this.computeSpeedPatch(name, base, advanced);
      case 'color':
        return this.computeColorPatch(name);
      case 'accentOverlay':
        return accentOverlayPresets[name];
      case 'complementaryOverlay':
        return complementaryOverlayPresets[name];
      default:
        return undefined;
    }
  }

  registerCustomPreset(name: string, patch: ParameterPatch): void {
    this.customPresets[name] = patch;
  }

  getCustomPreset(name: string): ParameterPatch | undefined {
    return this.customPresets[name];
  }

  listCustomPresets(): string[] {
    return Object.keys(this.customPresets);
  }

  private computeVisualizerPatch(name: string, base: MinimalParamsSnapshot): ParameterPatch | undefined {
    const preset = visualizerDensityPresets[name];
    if (!preset) return undefined;
    const normalized = Math.min(1, Math.max(0.125, preset.base / 32));
    const variationNormalized = Math.min(1, Math.max(0, preset.variation / 8));
    const density = Math.min(1.5, 0.2 + normalized * 0.8);
    const dispAmp = Math.min(1.5, base.dispAmp + variationNormalized * 0.3);
    return {
      density,
      dispAmp,
    };
  }

  private computeSpeedPatch(
    name: string,
    base: MinimalParamsSnapshot,
    advanced: DesignSystemAdvancedTuning
  ): ParameterPatch | undefined {
    const preset = visualizerSpeedPresets[name];
    if (!preset) return undefined;
    const multiplier = 1 + preset.base * 0.5;
    const timeScale = Math.min(5, Math.max(0.1, base.timeScale * multiplier * advanced.speedMultiplier));
    const morph = Math.min(2, Math.max(0, base.morph + preset.variation * 0.25));
    return { timeScale, morph };
  }

  private computeColorPatch(name: string): ParameterPatch | undefined {
    const palette = visualizerColorPresets[name];
    if (!palette) return undefined;
    const chromaMap: Record<string, number> = {
      monochrome: 0.02,
      complementary: 0.06,
      triadic: 0.08,
      analogous: 0.05,
      rainbow: 0.12,
    };
    const chromaShift = chromaMap[name] ?? 0.06;
    return { chromaShift };
  }
}

export const createPresetManager = () => new PresetManager();

