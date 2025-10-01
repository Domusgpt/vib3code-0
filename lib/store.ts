/**
 * VIB3CODE-0 Holographic Blog - Global Parameter Store
 * 
 * Implements exact parameter vocabulary and deterministic derivations 
 * from PDF specification (page 2-3)
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  DEFAULT_ADVANCED_TUNING,
  DEFAULT_DESIGN_SYSTEM_SELECTIONS,
  UNIVERSAL_HOVER_RESPONSE,
  UNIVERSAL_CLICK_RESPONSE,
  hoverEffectPresets,
  clickEffectPresets,
  scrollEffectPresets,
  createPresetManager,
  applyHoverInteraction,
  applyClickInteraction,
  applyScrollInteraction,
  resetSectionVisualStates,
  pruneExpiredEffects,
  createDefaultSectionVisualState,
} from '@/lib/design-system';
import type {
  DesignSystemAdvancedTuning,
  DesignSystemStateSlice,
  MinimalParamsSnapshot,
  ParameterPatch,
  PresetCategory,
  SectionParameterSnapshot,
  SectionVisualState,
} from '@/lib/design-system';

// EXACT PARAMETER VOCABULARY from PDF specification
export interface Params {
  hue: number;        // base hue (0–1)
  density: number;    // particle/mesh instance density
  morph: number;      // shape morph factor (0–1)
  chaos: number;      // turbulence/noise amplitude
  noiseFreq: number;  // domain noise frequency
  glitch: number;     // glitch intensity (0–1)
  dispAmp: number;    // displacement amplitude
  chromaShift: number;// RGB shift amount
  timeScale: number;  // shader time multiplier
  beatPhase: number;  // musical/clock phase [0–1)
}

// Section-specific offset rules for parameter derivations
export interface SectionOffsets {
  hueShift: number;      // Fixed hue offset for this section
  densMul: number;       // Density multiplier
  densAdd: number;       // Density additive offset
  morphMul: number;      // Morph multiplier
  morphAdd: number;      // Morph additive offset
  chaosMul: number;      // Chaos multiplier
  chaosAdd: number;      // Chaos additive offset
  glitchBias: number;    // Glitch bias offset
  noiseFreqMul: number;  // Noise frequency multiplier
  timeScaleMul: number;  // Time scale multiplier
}

// Section configuration with transition rules (from PDF table)
export interface SectionConfig {
  id: string;
  name: string;
  offsets: SectionOffsets;
  transitionIn: 'radial_hologram' | 'oppose_snap' | 'morph_chaos_swap' | 'spectral_slice' | 'portal_peel';
  transitionOut: 'dissolve_portal' | 'spring_return' | 'peripheral_frenzy' | 'spectral_merge' | 'reseal_glitch';
}

// SECTION CONFIGURATIONS (exact from PDF table page 7)
export const SECTION_CONFIGS: Record<string, SectionConfig> = {
  home: {
    id: 'home',
    name: 'Home',
    offsets: {
      hueShift: 0,
      densMul: 1.0,
      densAdd: 0,
      morphMul: 1.0,
      morphAdd: 0,
      chaosMul: 1.0,
      chaosAdd: 0,
      glitchBias: 0.05,
      noiseFreqMul: 1.0,
      timeScaleMul: 1.0,
    },
    transitionIn: 'radial_hologram',
    transitionOut: 'dissolve_portal',
  },
  'ai-news': {
    id: 'ai-news',
    name: 'AI News',
    offsets: {
      hueShift: 0.07,
      densMul: 0.9,
      densAdd: 0,
      morphMul: 1.0,
      morphAdd: 0,
      chaosMul: 1.0,
      chaosAdd: 0,
      glitchBias: 0,
      noiseFreqMul: 1.0,
      timeScaleMul: 1.0,
    },
    transitionIn: 'oppose_snap',
    transitionOut: 'spring_return',
  },
  'vibe-coding': {
    id: 'vibe-coding',
    name: 'Vibe Coding',
    offsets: {
      hueShift: 0,
      densMul: 1.0,
      densAdd: 0,
      morphMul: 1.2,
      morphAdd: 0,
      chaosMul: 1.1,
      chaosAdd: 0,
      glitchBias: 0,
      noiseFreqMul: 1.0,
      timeScaleMul: 1.0,
    },
    transitionIn: 'morph_chaos_swap',
    transitionOut: 'peripheral_frenzy',
  },
  'info-theory': {
    id: 'info-theory',
    name: 'Info Theory',
    offsets: {
      hueShift: 0,
      densMul: 1.0,
      densAdd: 0,
      morphMul: 1.0,
      morphAdd: 0,
      chaosMul: 1.0,
      chaosAdd: 0,
      glitchBias: 0,
      noiseFreqMul: 0.8,
      timeScaleMul: 1.0,
    },
    transitionIn: 'spectral_slice',
    transitionOut: 'spectral_merge',
  },
  philosophy: {
    id: 'philosophy',
    name: 'Philosophy',
    offsets: {
      hueShift: 0,
      densMul: 1.0,
      densAdd: 0.05,
      morphMul: 1.0,
      morphAdd: 0,
      chaosMul: 1.0,
      chaosAdd: 0,
      glitchBias: -0.03,
      noiseFreqMul: 1.0,
      timeScaleMul: 0.9,
    },
    transitionIn: 'portal_peel',
    transitionOut: 'reseal_glitch',
  },
};

// DEFAULT HOME PARAMETERS
export const DEFAULT_HOME_PARAMS: Params = {
  hue: 0.6,        // Cyan-blue base hue
  density: 0.5,    // Medium particle density
  morph: 1.0,      // Full morph factor
  chaos: 0.2,      // Low chaos/turbulence
  noiseFreq: 2.1,  // Standard noise frequency
  glitch: 0.1,     // Subtle glitch intensity
  dispAmp: 0.2,    // Medium displacement
  chromaShift: 0.05, // Subtle RGB shift
  timeScale: 1.0,  // Normal time scale
  beatPhase: 0.0,  // Beat phase start
};

// COMPLEMENTARY ACCENT COUPLING (from PDF page 5)
export const COUPLING_FACTORS = {
  hue: 1.0,
  density: 0.85,
  chaos: 0.3,
  morph: 0.2,
  chromaShift: 0.4,
  glitch: 0.15,
};

const presetManager = createPresetManager();

const createInitialSectionStates = (): Record<string, SectionVisualState> =>
  Object.keys(SECTION_CONFIGS).reduce((acc, sectionId) => {
    acc[sectionId] = createDefaultSectionVisualState();
    return acc;
  }, {} as Record<string, SectionVisualState>);

// State interface
interface StoreState {
  // Core parameter state
  home: Params;
  sections: Record<string, Params>;
  focus?: string;
  beatPhase: number;

  // Interaction state
  isHovering: boolean;
  hoverSection?: string;
  scrollProgress: number;

  // Audio reactivity
  audioEnabled: boolean;
  audioData: Float32Array | null;

  // Design system
  designSystem: DesignSystemStateSlice;

  // Events and actions
  events: {
    HOVER_START: (id: string) => void;
    HOVER_END: (id: string) => void;
    TICK: (dt: number) => void;
    CLOCK_BEAT: () => void;
    SET_FOCUS: (id: string) => void;
    UPDATE_HOME: (params: Partial<Params>) => void;
    RANDOMIZE_HOME: () => void;
    TOGGLE_AUDIO: () => void;
    APPLY_HOVER_RESPONSE: (id: string) => void;
    APPLY_CLICK_RESPONSE: (id: string) => void;
    APPLY_SCROLL_RESPONSE: (direction: 'up' | 'down', velocity: number) => void;
    SET_PRESET: (category: PresetCategory, name: string) => void;
    SET_ADVANCED_TUNING: (key: keyof DesignSystemAdvancedTuning, value: number) => void;
    CREATE_CUSTOM_PRESET: (name: string, patch: ParameterPatch) => void;
    RESET_SECTION_VISUAL_STATE: (sectionId?: string) => void;
  };
}

/**
 * DETERMINISTIC PARAMETER DERIVATION
 * Implements exact formulas from PDF specification (page 3)
 */
export function deriveParams(home: Params, offsets: SectionOffsets): Params {
  return {
    // hue_i = mod(home.hue + hueShift[i], 1.0)
    hue: (home.hue + offsets.hueShift) % 1.0,
    
    // density_i = clamp(home.density * densMul[i] + densAdd[i], 0.0, 1.0)
    density: Math.max(0.0, Math.min(1.0, home.density * offsets.densMul + offsets.densAdd)),
    
    // morph_i = clamp(home.morph * morphMul[i] + morphAdd[i], 0.0, 1.0)
    morph: Math.max(0.0, Math.min(1.0, home.morph * offsets.morphMul + offsets.morphAdd)),
    
    // chaos_i = clamp(home.chaos * chaosMul[i] + chaosAdd[i], 0.0, 1.0)
    chaos: Math.max(0.0, Math.min(1.0, home.chaos * offsets.chaosMul + offsets.chaosAdd)),
    
    // glitch_i = max(0.0, home.glitch + glitchBias[i])
    glitch: Math.max(0.0, home.glitch + offsets.glitchBias),
    
    // Derived parameters
    noiseFreq: home.noiseFreq * offsets.noiseFreqMul,
    timeScale: home.timeScale * offsets.timeScaleMul,
    dispAmp: home.dispAmp,
    chromaShift: home.chromaShift,
    beatPhase: home.beatPhase,
  };
}

/**
 * COMPLEMENTARY ACCENT COUPLING
 * For focused k, apply coupling to all j ≠ k (from PDF page 5)
 */
export function coupleParam(jVal: number, deltaK: number, factor: number): number {
  return jVal + deltaK * factor;
}

/**
 * RANDOMIZE HOME PARAMETERS
 * Generates new home state with intelligent ranges
 */
export function randomizeHomeParams(): Params {
  return {
    hue: Math.random(),
    density: 0.2 + Math.random() * 0.6, // 0.2 - 0.8
    morph: 0.5 + Math.random() * 1.5,   // 0.5 - 2.0
    chaos: Math.random() * 0.8,         // 0.0 - 0.8
    noiseFreq: 1.0 + Math.random() * 3.0, // 1.0 - 4.0
    glitch: Math.random() * 0.3,        // 0.0 - 0.3
    dispAmp: 0.1 + Math.random() * 0.4, // 0.1 - 0.5
    chromaShift: Math.random() * 0.1,   // 0.0 - 0.1
    timeScale: 0.5 + Math.random() * 2.0, // 0.5 - 2.5
    beatPhase: Math.random(),           // 0.0 - 1.0
  };
}

const computeSectionParams = (
  home: Params,
  sections: Record<string, Params>
): Record<string, Params> => {
  const resolved: Record<string, Params> = { ...sections };
  Object.keys(SECTION_CONFIGS).forEach((sectionId) => {
    if (!resolved[sectionId]) {
      resolved[sectionId] = deriveParams(home, SECTION_CONFIGS[sectionId].offsets);
    }
  });
  return resolved;
};

const buildParamsSnapshot = (sections: Record<string, Params>): SectionParameterSnapshot => {
  return Object.entries(sections).reduce((acc, [sectionId, params]) => {
    acc[sectionId] = {
      density: params.density,
      morph: params.morph,
      chaos: params.chaos,
      noiseFreq: params.noiseFreq,
      glitch: params.glitch,
      dispAmp: params.dispAmp,
      chromaShift: params.chromaShift,
      timeScale: params.timeScale,
    };
    return acc;
  }, {} as SectionParameterSnapshot);
};

const applyParameterPatches = (
  sections: Record<string, Params>,
  patches: Record<string, ParameterPatch>
): Record<string, Params> => {
  const updated = { ...sections };
  Object.entries(patches).forEach(([sectionId, patch]) => {
    const base = updated[sectionId];
    if (!base) return;
    updated[sectionId] = { ...base, ...patch };
  });
  return updated;
};

const toMinimalSnapshot = (params: Params): MinimalParamsSnapshot => ({
  density: params.density,
  morph: params.morph,
  chaos: params.chaos,
  noiseFreq: params.noiseFreq,
  glitch: params.glitch,
  dispAmp: params.dispAmp,
  chromaShift: params.chromaShift,
  timeScale: params.timeScale,
});

const computeHoverResponse = (
  input: { home: Params; sections: Record<string, Params>; designSystem: DesignSystemStateSlice },
  targetId: string,
  timestamp: number
) => {
  const ensuredSections = computeSectionParams(input.home, input.sections);
  let updatedSections = { ...ensuredSections };

  if (SECTION_CONFIGS[targetId]?.transitionIn === 'oppose_snap') {
    Object.keys(SECTION_CONFIGS).forEach((sectionId) => {
      if (sectionId !== targetId) {
        const currentParams = updatedSections[sectionId] || deriveParams(input.home, SECTION_CONFIGS[sectionId].offsets);
        updatedSections[sectionId] = {
          ...currentParams,
          hue: 1.0 - currentParams.hue,
          density: currentParams.density * 0.85,
          chromaShift: currentParams.chromaShift + 0.05,
        };
      }
    });
  }

  const snapshot = buildParamsSnapshot(updatedSections);
  const hoverEffect =
    hoverEffectPresets[input.designSystem.selections.hoverEffect] ||
    hoverEffectPresets.subtle_glow;

  const hoverResult = applyHoverInteraction({
    targetId,
    sectionStates: input.designSystem.sectionStates,
    params: snapshot,
    hoverResponse: UNIVERSAL_HOVER_RESPONSE,
    effect: hoverEffect,
    advanced: input.designSystem.advanced,
    timestamp,
  });
  const accentOverlay =
    (presetManager.get('accentOverlay', input.designSystem.selections.accentOverlay) as ParameterPatch | undefined) ??
    undefined;
  const complementaryOverlay =
    (presetManager.get('complementaryOverlay', input.designSystem.selections.complementaryOverlay) as
      | ParameterPatch
      | undefined) ?? undefined;

  const overlayPatches: Record<string, ParameterPatch> = { ...hoverResult.paramPatches };

  if (accentOverlay) {
    overlayPatches[targetId] = overlayPatches[targetId]
      ? { ...overlayPatches[targetId], ...accentOverlay }
      : { ...accentOverlay };
  }

  if (complementaryOverlay) {
    Object.keys(updatedSections).forEach((sectionId) => {
      if (sectionId === targetId) return;
      overlayPatches[sectionId] = overlayPatches[sectionId]
        ? { ...overlayPatches[sectionId], ...complementaryOverlay }
        : { ...complementaryOverlay };
    });
  }

  const sections = applyParameterPatches(updatedSections, overlayPatches);
  const designSystem: DesignSystemStateSlice = {
    ...input.designSystem,
    sectionStates: hoverResult.sectionStates,
    lastInteraction: { type: 'hover', at: timestamp, sectionId: targetId },
  };

  return { sections, designSystem };
};

const computeClickResponse = (
  input: { home: Params; sections: Record<string, Params>; designSystem: DesignSystemStateSlice },
  targetId: string,
  timestamp: number
) => {
  const ensuredSections = computeSectionParams(input.home, input.sections);
  const snapshot = buildParamsSnapshot(ensuredSections);
  const clickEffect =
    clickEffectPresets[input.designSystem.selections.clickEffect] ||
    clickEffectPresets.color_inversion;

  const clickResult = applyClickInteraction({
    targetId,
    sectionStates: input.designSystem.sectionStates,
    params: snapshot,
    clickResponse: UNIVERSAL_CLICK_RESPONSE,
    effect: clickEffect,
    advanced: input.designSystem.advanced,
    timestamp,
  });
  const accentOverlay =
    (presetManager.get('accentOverlay', input.designSystem.selections.accentOverlay) as ParameterPatch | undefined) ??
    undefined;
  const complementaryOverlay =
    (presetManager.get('complementaryOverlay', input.designSystem.selections.complementaryOverlay) as
      | ParameterPatch
      | undefined) ?? undefined;

  const overlayPatches: Record<string, ParameterPatch> = { ...clickResult.paramPatches };

  if (accentOverlay) {
    overlayPatches[targetId] = overlayPatches[targetId]
      ? { ...overlayPatches[targetId], ...accentOverlay }
      : { ...accentOverlay };
  }

  if (complementaryOverlay) {
    Object.keys(snapshot).forEach((sectionId) => {
      if (sectionId === targetId) return;
      overlayPatches[sectionId] = overlayPatches[sectionId]
        ? { ...overlayPatches[sectionId], ...complementaryOverlay }
        : { ...complementaryOverlay };
    });
  }

  const sections = applyParameterPatches(ensuredSections, overlayPatches);
  const designSystem: DesignSystemStateSlice = {
    ...input.designSystem,
    sectionStates: clickResult.sectionStates,
    lastInteraction: { type: 'click', at: timestamp, sectionId: targetId },
  };

  return { sections, designSystem };
};

const computeScrollResponse = (
  input: { home: Params; sections: Record<string, Params>; designSystem: DesignSystemStateSlice },
  direction: 'up' | 'down',
  velocity: number,
  timestamp: number
) => {
  const ensuredSections = computeSectionParams(input.home, input.sections);
  const snapshot = buildParamsSnapshot(ensuredSections);
  const scrollEffect =
    scrollEffectPresets[input.designSystem.selections.scrollEffect] ||
    scrollEffectPresets.momentum_trails;

  const scrollResult = applyScrollInteraction({
    direction,
    velocity,
    sectionStates: input.designSystem.sectionStates,
    params: snapshot,
    effect: scrollEffect,
    advanced: input.designSystem.advanced,
    timestamp,
  });
  const accentOverlay =
    (presetManager.get('accentOverlay', input.designSystem.selections.accentOverlay) as ParameterPatch | undefined) ??
    undefined;
  const complementaryOverlay =
    (presetManager.get('complementaryOverlay', input.designSystem.selections.complementaryOverlay) as
      | ParameterPatch
      | undefined) ?? undefined;

  const overlayPatches: Record<string, ParameterPatch> = { ...scrollResult.paramPatches };
  const accentTarget = input.designSystem.lastInteraction?.sectionId;

  if (accentOverlay && accentTarget) {
    overlayPatches[accentTarget] = overlayPatches[accentTarget]
      ? { ...overlayPatches[accentTarget], ...accentOverlay }
      : { ...accentOverlay };
  }

  if (complementaryOverlay) {
    Object.keys(snapshot).forEach((sectionId) => {
      if (accentTarget && sectionId === accentTarget) return;
      overlayPatches[sectionId] = overlayPatches[sectionId]
        ? { ...overlayPatches[sectionId], ...complementaryOverlay }
        : { ...complementaryOverlay };
    });
  }

  const sections = applyParameterPatches(ensuredSections, overlayPatches);
  const designSystem: DesignSystemStateSlice = {
    ...input.designSystem,
    sectionStates: scrollResult.sectionStates,
    lastInteraction: { type: 'scroll', at: timestamp },
  };

  return { sections, designSystem };
};

// MAIN ZUSTAND STORE
export const useStore = create<StoreState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    home: DEFAULT_HOME_PARAMS,
    sections: {},
    focus: undefined,
    beatPhase: 0.0,
    
    isHovering: false,
    hoverSection: undefined,
    scrollProgress: 0.0,
    
    audioEnabled: false,
    audioData: null,

    designSystem: {
      selections: { ...DEFAULT_DESIGN_SYSTEM_SELECTIONS },
      advanced: { ...DEFAULT_ADVANCED_TUNING },
      sectionStates: createInitialSectionStates(),
      lastInteraction: undefined,
      customPresets: {},
      reactivitySettings: presetManager.get('reactivity', DEFAULT_DESIGN_SYSTEM_SELECTIONS.reactivity) || undefined,
      colorPalette: presetManager.get('color', DEFAULT_DESIGN_SYSTEM_SELECTIONS.color) || undefined,
    },

    // Event handlers
    events: {
      HOVER_START: (id: string) => {
        set((state) => {
          const timestamp = Date.now();
          const { sections, designSystem } = computeHoverResponse(
            { home: state.home, sections: state.sections, designSystem: state.designSystem },
            id,
            timestamp
          );

          return {
            ...state,
            isHovering: true,
            hoverSection: id,
            sections,
            designSystem,
          };
        });
      },
      
      HOVER_END: (_id: string) => {
        set((state) => {
          const timestamp = Date.now();
          const baseSections = Object.keys(SECTION_CONFIGS).reduce((acc, sectionId) => {
            acc[sectionId] = deriveParams(state.home, SECTION_CONFIGS[sectionId].offsets);
            return acc;
          }, {} as Record<string, Params>);

          const resetStates = resetSectionVisualStates(
            state.designSystem.sectionStates,
            Object.keys(SECTION_CONFIGS)
          );

          return {
            ...state,
            isHovering: false,
            hoverSection: undefined,
            sections: baseSections,
            designSystem: {
              ...state.designSystem,
              sectionStates: resetStates,
              lastInteraction: { type: 'hover', at: timestamp },
            },
          };
        });
      },
      
      TICK: (dt: number) => {
        const timestamp = Date.now();
        set((state) => ({
          ...state,
          beatPhase: (state.beatPhase + dt * 0.5) % 1.0,
          designSystem: {
            ...state.designSystem,
            sectionStates: pruneExpiredEffects(state.designSystem.sectionStates, timestamp),
          },
        }));
      },
      
      CLOCK_BEAT: () => {
        // Implement beat snap (meet-in-middle) from PDF page 3
        set((state) => {
          if (!state.isHovering) return state;
          
          const updatedSections = { ...state.sections };
          Object.keys(updatedSections).forEach((sectionId) => {
            const params = updatedSections[sectionId];
            if (params) {
              // density_i ← 0.5 * (density_i + (1.0 - density_i)) (meet-in-middle)
              updatedSections[sectionId] = {
                ...params,
                density: 0.5 * (params.density + (1.0 - params.density)),
              };
            }
          });
          
          return { ...state, sections: updatedSections };
        });
      },
      
      SET_FOCUS: (id: string) => {
        set((state) => ({ ...state, focus: id }));
      },
      
      UPDATE_HOME: (params: Partial<Params>) => {
        set((state) => {
          const newHome = { ...state.home, ...params };
          
          // Cascade changes through all sections using deterministic derivations
          const updatedSections = Object.keys(SECTION_CONFIGS).reduce((acc, sectionId) => {
            acc[sectionId] = deriveParams(newHome, SECTION_CONFIGS[sectionId].offsets);
            return acc;
          }, {} as Record<string, Params>);
          
          return {
            ...state,
            home: newHome,
            sections: updatedSections,
          };
        });
      },
      
      RANDOMIZE_HOME: () => {
        const randomHome = randomizeHomeParams();
        get().events.UPDATE_HOME(randomHome);
      },
      
      TOGGLE_AUDIO: () => {
        set((state) => ({ ...state, audioEnabled: !state.audioEnabled }));
      },

      APPLY_HOVER_RESPONSE: (id: string) => {
        set((state) => {
          const timestamp = Date.now();
          const { sections, designSystem } = computeHoverResponse(
            { home: state.home, sections: state.sections, designSystem: state.designSystem },
            id,
            timestamp
          );
          return {
            ...state,
            sections,
            designSystem,
          };
        });
      },

      APPLY_CLICK_RESPONSE: (id: string) => {
        set((state) => {
          const timestamp = Date.now();
          const { sections, designSystem } = computeClickResponse(
            { home: state.home, sections: state.sections, designSystem: state.designSystem },
            id,
            timestamp
          );
          return {
            ...state,
            sections,
            designSystem,
          };
        });
      },

      APPLY_SCROLL_RESPONSE: (direction: 'up' | 'down', velocity: number) => {
        set((state) => {
          const timestamp = Date.now();
          const { sections, designSystem } = computeScrollResponse(
            { home: state.home, sections: state.sections, designSystem: state.designSystem },
            direction,
            velocity,
            timestamp
          );
          return {
            ...state,
            sections,
            designSystem,
          };
        });
      },

      SET_PRESET: (category: PresetCategory, name: string) => {
        set((state) => {
          const selections = { ...state.designSystem.selections, [category]: name };
          let advanced = { ...state.designSystem.advanced };
          let reactivitySettings = state.designSystem.reactivitySettings;
          let colorPalette = state.designSystem.colorPalette;
          let home = state.home;
          let sections = state.sections;

          const timestamp = Date.now();

          if (category === 'reactivity') {
            const preset = presetManager.get('reactivity', name);
            if (preset) {
              advanced = {
                ...advanced,
                interactionSensitivity: preset.mouse,
              };
              reactivitySettings = preset;
            }
          }

          if (category === 'color') {
            const patch = presetManager.computeHomePatch('color', name, toMinimalSnapshot(state.home), advanced);
            if (patch) {
              home = { ...state.home, ...patch };
              sections = Object.keys(SECTION_CONFIGS).reduce((acc, sectionId) => {
                acc[sectionId] = deriveParams(home, SECTION_CONFIGS[sectionId].offsets);
                return acc;
              }, {} as Record<string, Params>);
            }
            const preset = presetManager.get('color', name);
            if (preset) {
              colorPalette = preset;
            }
          }

          if (category === 'visualizer' || category === 'speed') {
            const patch = presetManager.computeHomePatch(category, name, toMinimalSnapshot(home), advanced);
            if (patch) {
              home = { ...home, ...patch };
              sections = Object.keys(SECTION_CONFIGS).reduce((acc, sectionId) => {
                acc[sectionId] = deriveParams(home, SECTION_CONFIGS[sectionId].offsets);
                return acc;
              }, {} as Record<string, Params>);
            }
          }

          return {
            ...state,
            home,
            sections,
            designSystem: {
              ...state.designSystem,
              selections,
              advanced,
              reactivitySettings,
              colorPalette,
              lastInteraction: { type: 'hover', at: timestamp },
            },
          };
        });
      },

      SET_ADVANCED_TUNING: (key: keyof DesignSystemAdvancedTuning, value: number) => {
        set((state) => ({
          ...state,
          designSystem: {
            ...state.designSystem,
            advanced: {
              ...state.designSystem.advanced,
              [key]: value,
            },
          },
        }));
      },

      CREATE_CUSTOM_PRESET: (name: string, patch: ParameterPatch) => {
        presetManager.registerCustomPreset(name, patch);
        set((state) => ({
          ...state,
          designSystem: {
            ...state.designSystem,
            customPresets: { ...state.designSystem.customPresets, [name]: patch },
          },
        }));
      },

      RESET_SECTION_VISUAL_STATE: (sectionId?: string) => {
        set((state) => {
          const ids = sectionId ? [sectionId] : Object.keys(SECTION_CONFIGS);
          const resetStates = resetSectionVisualStates(state.designSystem.sectionStates, ids);
          return {
            ...state,
            designSystem: {
              ...state.designSystem,
              sectionStates: resetStates,
            },
          };
        });
      },
    },
  }))
);

// Initialize sections on store creation
useStore.getState().events.UPDATE_HOME({});

// SHADER UNIFORM ADAPTER (exact from PDF page 4)
export const UNIFORM_MAP = {
  hue: 'uHue',
  density: 'uDensity', 
  morph: 'uMorph',
  chaos: 'uChaos',
  noiseFreq: 'uNoiseFreq',
  glitch: 'uGlitch',
  dispAmp: 'uDispAmp',
  chromaShift: 'uChromaShift',
  timeScale: 'uTimeScale',
  beatPhase: 'uBeatPhase',
} as const;

/**
 * SHADER UNIFORM BINDING ADAPTER
 * Implements exact binding from PDF specification (page 4)
 */
export function bindVib34d(shader: any, map = UNIFORM_MAP) {
  const U = shader.uniforms;
  return (params: Params) => {
    if (U[map.hue]) U[map.hue].value = params.hue;
    if (U[map.density]) U[map.density].value = params.density;
    if (U[map.morph]) U[map.morph].value = params.morph;
    if (U[map.chaos]) U[map.chaos].value = params.chaos;
    if (U[map.noiseFreq]) U[map.noiseFreq].value = params.noiseFreq;
    if (U[map.glitch]) U[map.glitch].value = params.glitch;
    if (U[map.dispAmp]) U[map.dispAmp].value = params.dispAmp;
    if (U[map.chromaShift]) U[map.chromaShift].value = params.chromaShift;
    if (U[map.timeScale]) U[map.timeScale].value = params.timeScale;
    if (U[map.beatPhase]) U[map.beatPhase].value = params.beatPhase;
  };
}

// Export commonly used selectors
export const useHomeParams = () => useStore((state) => state.home);
export const useSectionParams = (id: string) => useStore((state) => state.sections[id]);
export const useEvents = () => useStore((state) => state.events);
export const useFocus = () => useStore((state) => state.focus);
export const useAudioEnabled = () => useStore((state) => state.audioEnabled);