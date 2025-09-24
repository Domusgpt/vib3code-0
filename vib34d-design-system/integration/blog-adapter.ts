import type { VIB34DSystem, VIB34DState } from '../core/visualizer-engine';

export interface SectionTheme {
  backgroundGradient: string;
  accentColor: string;
  cardHighlight: string;
}

export interface BlogAdapterOptions {
  sections: string[];
  onThemeChange?: (sectionId: string, state: VIB34DState, theme: SectionTheme) => void;
}

export interface BlogAdapter {
  dispose(): void;
  getTheme(sectionId: string): SectionTheme;
}

function paletteToGradient(palette: string): string {
  switch (palette) {
    case 'single_hue_variations':
      return 'linear-gradient(135deg, rgba(94,234,212,0.15), rgba(45,212,191,0.05))';
    case 'opposite_color_wheel':
      return 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(244,63,94,0.08))';
    case 'three_equidistant_hues':
      return 'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(14,165,233,0.12), rgba(168,85,247,0.12))';
    case 'adjacent_color_wheel':
      return 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(14,165,233,0.08))';
    case 'full_spectrum_cycle':
    default:
      return 'linear-gradient(135deg, rgba(236,72,153,0.18), rgba(20,184,166,0.1), rgba(129,140,248,0.12))';
  }
}

function paletteAccent(palette: string): string {
  switch (palette) {
    case 'single_hue_variations':
      return '#22d3ee';
    case 'opposite_color_wheel':
      return '#f97316';
    case 'three_equidistant_hues':
      return '#a855f7';
    case 'adjacent_color_wheel':
      return '#14b8a6';
    case 'full_spectrum_cycle':
    default:
      return '#f472b6';
  }
}

export function createBlogAdapter(system: VIB34DSystem, options: BlogAdapterOptions): BlogAdapter {
  let lastState: VIB34DState = system.getState();

  const computeTheme = (state: VIB34DState): SectionTheme => {
    const gradient = paletteToGradient(state.visualizer.color.palette);
    const accent = paletteAccent(state.visualizer.color.palette);

    const cardHighlight = state.effects.hover.definition?.target_enhancement
      ? `drop-shadow(0 0 18px rgba(56,189,248,0.45))`
      : `drop-shadow(0 0 12px rgba(59,130,246,0.25))`;

    return {
      backgroundGradient: gradient,
      accentColor: accent,
      cardHighlight
    };
  };

  const sectionThemes = new Map<string, SectionTheme>();

  const updateThemes = (state: VIB34DState) => {
    const theme = computeTheme(state);
    options.sections.forEach((sectionId) => {
      sectionThemes.set(sectionId, theme);
      options.onThemeChange?.(sectionId, state, theme);
    });
  };

  const unsubscribe = system.subscribe((state) => {
    lastState = state;
    updateThemes(state);
  });

  // Initialize once
  updateThemes(lastState);

  return {
    dispose() {
      unsubscribe();
      sectionThemes.clear();
    },
    getTheme(sectionId: string) {
      if (!sectionThemes.has(sectionId)) {
        sectionThemes.set(sectionId, computeTheme(lastState));
      }
      return sectionThemes.get(sectionId)!;
    }
  };
}

export default createBlogAdapter;
