import {
  ClickEffectPreset,
  ClickInteractionResult,
  ClickResponseDefinition,
  DesignSystemAdvancedTuning,
  EnhancedClickResult,
  HoverEffectPreset,
  HoverInteractionResult,
  HoverResponseDefinition,
  ParameterPatch,
  ParameterRelationship,
  ParameterWeb,
  RealityInversionState,
  ScrollEffectPreset,
  ScrollInteractionResult,
  SectionParameterSnapshot,
  SectionVisualState,
  SparkleEffect,
  VisualStateMultipliers,
} from './types';

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

/**
 * Parameter Web Engine - Type-safe parameter relationships
 *
 * Manages mathematical relationships between visual parameters across sections,
 * enabling sophisticated cascade effects and coordinated animations.
 *
 * @example
 * ```typescript
 * const hoverWeb = ParameterWebEngine.createHoverWeb();
 * const engine = new ParameterWebEngine(hoverWeb);
 *
 * const cascades = engine.calculateCascade(
 *   'home',
 *   'gridDensity',
 *   1.2,
 *   currentStates
 * );
 * ```
 */
export class ParameterWebEngine {
  private web: ParameterWeb;

  /**
   * Creates a new Parameter Web Engine
   * @param web - The parameter web configuration defining relationships
   */
  constructor(web: ParameterWeb) {
    this.web = web;
  }

  /**
   * Validates and sanitizes numerical input to prevent edge cases
   * @param value - Input value to validate
   * @returns Sanitized number within safe bounds
   */
  private validateInput(value: number): number {
    if (!isFinite(value)) return 0;
    return Math.max(-1000, Math.min(1000, value));
  }

  /**
   * Validates a curve function by testing it with safe values
   * @param curve - The curve function to validate
   * @returns True if the curve function is safe to use
   */
  private validateCurve(curve: (x: number) => number): boolean {
    try {
      const testValues = [0, 0.5, 1.0, -0.5, -1.0];
      for (const testValue of testValues) {
        const result = curve(testValue);
        if (!isFinite(result)) {
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  private applyRelationship(
    sourceValue: number,
    relationship: ParameterRelationship
  ): number {
    const { relationship: type, intensity, curve } = relationship;

    // Validate input to prevent edge cases
    const safeSourceValue = this.validateInput(sourceValue);
    const safeIntensity = this.validateInput(intensity);

    if (curve) {
      // Validate curve function first
      if (!this.validateCurve(curve)) {
        console.warn('Invalid curve function detected, falling back to linear relationship');
        return safeSourceValue * safeIntensity;
      }

      try {
        const curveResult = curve(safeSourceValue);
        return this.validateInput(curveResult * safeIntensity);
      } catch (error) {
        console.warn('Curve function error, falling back to linear relationship:', error);
        return safeSourceValue * safeIntensity;
      }
    }

    let result: number;
    switch (type) {
      case 'linear':
        result = safeSourceValue * safeIntensity;
        break;
      case 'inverse':
        result = (1.0 - safeSourceValue) * safeIntensity;
        break;
      case 'exponential':
        result = Math.pow(Math.abs(safeSourceValue), 2) * Math.sign(safeSourceValue) * safeIntensity;
        break;
      case 'logarithmic':
        result = Math.log(Math.max(0.01, Math.abs(safeSourceValue))) * Math.sign(safeSourceValue) * safeIntensity * 0.5;
        break;
      default:
        result = safeSourceValue * safeIntensity;
    }

    return this.validateInput(result);
  }

  /**
   * Calculates cascade effects from a source parameter change
   *
   * @param sourceSection - The section ID that triggered the cascade
   * @param sourceProperty - The visual property that changed
   * @param newValue - The new value of the source property
   * @param currentStates - Current state of all sections
   * @returns Object mapping section IDs to their partial state updates
   *
   * @example
   * ```typescript
   * const cascades = engine.calculateCascade(
   *   'hero',
   *   'gridDensity',
   *   1.5,
   *   { hero: heroState, sidebar: sidebarState }
   * );
   * // Returns: { sidebar: { colorIntensity: 0.8, reactivity: 1.2 } }
   * ```
   */
  calculateCascade(
    sourceSection: string,
    sourceProperty: keyof SectionVisualState,
    newValue: number,
    currentStates: Record<string, SectionVisualState>
  ): Record<string, Partial<SectionVisualState>> {
    const cascades: Record<string, Partial<SectionVisualState>> = {};

    // Find relationships that affect this source property
    this.web.relationships.forEach((relationship) => {
      if (relationship.source === sourceProperty) {
        // Apply this relationship to all other sections
        Object.keys(currentStates).forEach((sectionId) => {
          if (sectionId === sourceSection) return; // Don't cascade to self

          const targetValue = this.applyRelationship(newValue, relationship);
          const currentState = currentStates[sectionId];

          if (!cascades[sectionId]) {
            cascades[sectionId] = {};
          }

          // Apply the cascade with proper clamping based on target property
          switch (relationship.target) {
            case 'gridDensity':
              cascades[sectionId].gridDensity = clamp(
                currentState.gridDensity + targetValue,
                0.1,
                4
              );
              break;
            case 'colorIntensity':
              cascades[sectionId].colorIntensity = clamp(
                currentState.colorIntensity + targetValue,
                0.2,
                4
              );
              break;
            case 'reactivity':
              cascades[sectionId].reactivity = clamp(
                currentState.reactivity + targetValue,
                0.2,
                4
              );
              break;
            case 'depth':
              cascades[sectionId].depth = clamp(
                currentState.depth + targetValue * 10, // Scale for depth
                -50,
                50
              );
              break;
          }
        });
      }
    });

    return cascades;
  }

  /**
   * Creates a parameter web optimized for hover interactions
   * @returns A ParameterWeb configured with hover-optimized relationships
   */
  static createHoverWeb(): ParameterWeb {
    return {
      relationships: [
        {
          source: 'gridDensity',
          target: 'colorIntensity',
          relationship: 'linear',
          intensity: 0.3,
        },
        {
          source: 'colorIntensity',
          target: 'gridDensity',
          relationship: 'inverse',
          intensity: 0.6,
        },
        {
          source: 'depth',
          target: 'reactivity',
          relationship: 'exponential',
          intensity: 0.2,
        },
      ],
    };
  }

  /**
   * Creates a parameter web optimized for click interactions
   * @returns A ParameterWeb configured with click-optimized relationships
   */
  static createClickWeb(): ParameterWeb {
    return {
      relationships: [
        {
          source: 'gridDensity',
          target: 'depth',
          relationship: 'inverse',
          intensity: 0.5,
          delay: 100,
        },
        {
          source: 'colorIntensity',
          target: 'reactivity',
          relationship: 'logarithmic',
          intensity: 0.4,
        },
      ],
    };
  }
}

/**
 * Reality Inversion System - React-friendly reality inversion effects
 *
 * Provides sophisticated reality inversion capabilities that flip visual parameters
 * across all sections in a coordinated manner, with proper cleanup and React-compatible
 * timing mechanisms.
 *
 * @example
 * ```typescript
 * const inversionEngine = new RealityInversionEngine();
 * const result = inversionEngine.triggerRealityInversion(sectionStates, 1.5);
 *
 * // Result includes inverted states, parameter patches, and sparkle effects
 * console.log(result.sparkleEffects.length); // Number of sparkle effects generated
 * ```
 */
export class RealityInversionEngine {
  private inversionState?: RealityInversionState;

  /**
   * Triggers a coordinated reality inversion across all sections
   *
   * @param sections - Current visual states of all sections
   * @param intensity - Intensity multiplier for the inversion effect (default: 1.0)
   * @returns Enhanced click result with inversion states, patches, and sparkle effects
   *
   * @example
   * ```typescript
   * const result = engine.triggerRealityInversion(
   *   { home: homeState, about: aboutState },
   *   1.2
   * );
   * ```
   */
  triggerRealityInversion(
    sections: Record<string, SectionVisualState>,
    intensity: number = 1.0
  ): EnhancedClickResult {
    // Store original states for restoration
    const originalStates = { ...sections };

    // Create inverted states
    const invertedStates: Record<string, SectionVisualState> = {};
    const paramPatches: Record<string, ParameterPatch> = {};

    Object.entries(sections).forEach(([sectionId, state]) => {
      invertedStates[sectionId] = {
        ...state,
        gridDensity: Math.max(0.1, (1 - state.gridDensity) * intensity),
        colorIntensity: Math.max(0.2, (2 - state.colorIntensity) * intensity),
        reactivity: Math.max(0.2, (1.5 - state.reactivity) * intensity),
        depth: -state.depth * intensity,
        inversionActiveUntil: Date.now() + (2000 * intensity),
        lastUpdated: Date.now(),
      };

      // Generate inversion parameter patches
      paramPatches[sectionId] = {
        density: Math.max(0, 1 - (state.gridDensity * intensity)),
        chaos: Math.min(1, 0.5 * intensity),
        glitch: Math.min(1, 0.3 * intensity),
        chromaShift: Math.max(-1, -0.5 * intensity),
        timeScale: -Math.abs(1.0) * intensity,
      };
    });

    // Create sparkle effects
    const sparkleEffects: SparkleEffect[] = Object.keys(sections).map((sectionId) => ({
      sectionId,
      count: Math.floor(8 * intensity),
      duration: 1500 * intensity,
    }));

    // Update internal inversion state
    this.inversionState = {
      isActive: true,
      startedAt: Date.now(),
      duration: 2000 * intensity,
      originalState: originalStates,
      sparkleCount: Math.floor(8 * intensity),
    };

    return {
      sectionStates: invertedStates,
      paramPatches,
      realityInversion: this.inversionState,
      sparkleEffects,
    };
  }

  generateInversionPatches(invertedStates: Record<string, SectionVisualState>): Record<string, ParameterPatch> {
    const patches: Record<string, ParameterPatch> = {};

    Object.entries(invertedStates).forEach(([sectionId, state]) => {
      patches[sectionId] = {
        density: state.gridDensity,
        morph: Math.max(0, 1 - state.colorIntensity),
        chaos: state.reactivity * 0.3,
        glitch: Math.min(1, state.depth * 0.01 + 0.2),
        dispAmp: Math.abs(state.depth * 0.002),
        chromaShift: state.colorIntensity - 1,
        timeScale: state.reactivity,
      };
    });

    return patches;
  }

  generateSparkleEffects(
    sections: Record<string, SectionVisualState>,
    intensity: number
  ): SparkleEffect[] {
    return Object.keys(sections).map((sectionId) => ({
      sectionId,
      count: Math.floor((8 + Math.random() * 8) * intensity),
      duration: Math.floor((1500 + Math.random() * 500) * intensity),
    }));
  }

  isInversionActive(): boolean {
    if (!this.inversionState) return false;

    const elapsed = Date.now() - this.inversionState.startedAt;
    return elapsed < this.inversionState.duration;
  }

  getInversionProgress(): number {
    if (!this.inversionState) return 0;

    const elapsed = Date.now() - this.inversionState.startedAt;
    return Math.min(1, elapsed / this.inversionState.duration);
  }

  clearInversion(): void {
    this.inversionState = undefined;
  }
}

const parseScalarOperation = (operation: string): number => {
  if (operation.startsWith('increase_')) {
    const value = operation.replace('increase_', '').replace('x', '');
    return parseFloat(value);
  }
  if (operation.startsWith('decrease_')) {
    const value = operation.replace('decrease_', '').replace('x', '');
    return parseFloat(value);
  }
  return 1;
};

const parseDepthOperation = (operation: string): number => {
  if (operation.startsWith('lift_forward_')) {
    const value = operation.replace('lift_forward_', '').replace('px', '');
    return parseFloat(value);
  }
  if (operation.startsWith('push_back_')) {
    const value = operation.replace('push_back_', '').replace('px', '');
    return -parseFloat(value);
  }
  return 0;
};

const parseDurationMs = (value: string): number => {
  const match = value.match(/([0-9.]+)ms/);
  return match ? parseFloat(match[1]) : 0;
};

const applyMultipliers = (
  base: SectionVisualState,
  scalarOps: { gridDensity: string; colorIntensity: string; reactivity: string; depth: string },
  effect: Partial<VisualStateMultipliers>
): SectionVisualState => {
  const gridMultiplier = parseScalarOperation(scalarOps.gridDensity) * (effect.gridDensity ?? 1);
  const colorMultiplier = parseScalarOperation(scalarOps.colorIntensity) * (effect.colorIntensity ?? 1);
  const reactivityMultiplier = parseScalarOperation(scalarOps.reactivity) * (effect.reactivity ?? 1);
  const depthDelta = parseDepthOperation(scalarOps.depth) + (effect.depth ?? 0);

  return {
    gridDensity: clamp(base.gridDensity * gridMultiplier, 0.1, 4),
    colorIntensity: clamp(base.colorIntensity * colorMultiplier, 0.2, 4),
    reactivity: clamp(base.reactivity * reactivityMultiplier, 0.2, 4),
    depth: clamp(base.depth + depthDelta, -50, 50),
    inversionActiveUntil: base.inversionActiveUntil,
    rippleEffect: base.rippleEffect,
    sparkleEffect: base.sparkleEffect,
    lastUpdated: Date.now(),
  };
};

const mapVisualStateToParams = (
  visualState: SectionVisualState,
  baseParams: SectionParameterSnapshot[string],
  advanced: DesignSystemAdvancedTuning
): ParameterPatch => {
  const paramPatch: ParameterPatch = {};
  paramPatch.density = clamp(baseParams.density * visualState.gridDensity, 0, 1.5);
  paramPatch.chromaShift = clamp(baseParams.chromaShift * visualState.colorIntensity, -1, 1);
  const reactivityBoost = visualState.reactivity * advanced.speedMultiplier * advanced.interactionSensitivity;
  paramPatch.timeScale = clamp(baseParams.timeScale * reactivityBoost, -5, 5);
  paramPatch.dispAmp = clamp(baseParams.dispAmp + visualState.depth * 0.001, 0, 1.5);
  return paramPatch;
};

export const createDefaultSectionVisualState = (): SectionVisualState => ({
  gridDensity: 1,
  colorIntensity: 1,
  reactivity: 1,
  depth: 0,
  lastUpdated: Date.now(),
});

interface HoverInteractionContext {
  targetId: string;
  sectionStates: Record<string, SectionVisualState>;
  params: SectionParameterSnapshot;
  hoverResponse: HoverResponseDefinition;
  effect: HoverEffectPreset;
  advanced: DesignSystemAdvancedTuning;
  timestamp: number;
  parameterWeb?: ParameterWeb;
}

export const applyHoverInteraction = ({
  targetId,
  sectionStates,
  params,
  hoverResponse,
  effect,
  advanced,
  timestamp,
  parameterWeb,
}: HoverInteractionContext): HoverInteractionResult => {
  const nextStates: Record<string, SectionVisualState> = { ...sectionStates };
  const paramPatches: Record<string, ParameterPatch> = {};
  const sectionIds = Object.keys(params);

  // Apply base hover effects first
  sectionIds.forEach((sectionId) => {
    const baseParams = params[sectionId];
    if (!baseParams) {
      return;
    }
    const baseState = nextStates[sectionId] ?? createDefaultSectionVisualState();
    const scalarOps = sectionId === targetId ? hoverResponse.target : hoverResponse.others;
    const modifiers = sectionId === targetId ? effect.targetModifiers : effect.othersModifiers;
    const updatedState = applyMultipliers(baseState, scalarOps, modifiers ?? {});
    updatedState.lastUpdated = timestamp;

    nextStates[sectionId] = updatedState;
    paramPatches[sectionId] = mapVisualStateToParams(updatedState, baseParams, advanced);
  });

  // Apply parameter web cascades if available
  if (parameterWeb) {
    const webEngine = new ParameterWebEngine(parameterWeb);
    const targetState = nextStates[targetId];

    if (targetState) {
      // Calculate cascades for each property that changed
      const cascades = webEngine.calculateCascade(
        targetId,
        'gridDensity', // Primary cascade property for hover
        targetState.gridDensity,
        nextStates
      );

      // Apply cascades to affected sections
      Object.entries(cascades).forEach(([sectionId, cascade]) => {
        if (nextStates[sectionId]) {
          nextStates[sectionId] = {
            ...nextStates[sectionId],
            ...cascade,
            lastUpdated: timestamp,
          };

          // Update parameter patches with cascaded changes
          const baseParams = params[sectionId];
          if (baseParams) {
            paramPatches[sectionId] = mapVisualStateToParams(
              nextStates[sectionId],
              baseParams,
              advanced
            );
          }
        }
      });
    }
  }

  const baseDuration = parseDurationMs(hoverResponse.transition.duration);
  const duration = baseDuration * effect.transitionSpeedMultiplier * advanced.transitionDurationMultiplier;
  const stagger = parseDurationMs(hoverResponse.transition.stagger);

  return {
    sectionStates: nextStates,
    paramPatches,
    transitionDuration: duration,
    transitionEasing: hoverResponse.transition.easing,
    stagger,
  };
};

interface ClickInteractionContext {
  targetId: string;
  sectionStates: Record<string, SectionVisualState>;
  params: SectionParameterSnapshot;
  clickResponse: ClickResponseDefinition;
  effect: ClickEffectPreset;
  advanced: DesignSystemAdvancedTuning;
  timestamp: number;
  enableRealityInversion?: boolean;
  inversionIntensity?: number;
}

const invertValue = (value: number, min = 0, max = 1): number => clamp(max - (value - min), min, max);

export const applyClickInteraction = ({
  targetId,
  sectionStates,
  params,
  clickResponse,
  effect,
  advanced,
  timestamp,
  enableRealityInversion = false,
  inversionIntensity = 1.0,
}: ClickInteractionContext): ClickInteractionResult | EnhancedClickResult => {
  // Check if reality inversion is requested
  if (enableRealityInversion) {
    const inversionEngine = new RealityInversionEngine();
    return inversionEngine.triggerRealityInversion(sectionStates, inversionIntensity);
  }

  // Standard click interaction (original behavior)
  const nextStates: Record<string, SectionVisualState> = { ...sectionStates };
  const baseState = nextStates[targetId] ?? createDefaultSectionVisualState();
  const updatedState: SectionVisualState = {
    ...baseState,
    inversionActiveUntil: timestamp + effect.inversionDuration,
    rippleEffect: {
      type: clickResponse.immediate.rippleEffect,
      startedAt: timestamp,
      duration: parseDurationMs(clickResponse.duration.decay),
    },
    sparkleEffect: {
      type: clickResponse.immediate.sparkleGeneration,
      startedAt: timestamp,
      duration: effect.sparkleDuration,
      count: effect.sparkleCount,
    },
    lastUpdated: timestamp,
  };

  nextStates[targetId] = updatedState;

  const baseParams = params[targetId];
  const paramPatch: ParameterPatch = {};
  // Apply inversion rules
  if (clickResponse.immediate.variableInversion.density === 'inverse_value') {
    paramPatch.density = invertValue(baseParams.density, 0, 1);
  }
  if (clickResponse.immediate.variableInversion.intensity === 'flip_polarity') {
    paramPatch.chromaShift = invertValue(baseParams.chromaShift, -1, 1);
  }
  if (clickResponse.immediate.variableInversion.speed === 'reverse_direction') {
    const reversed = -Math.abs(baseParams.timeScale);
    paramPatch.timeScale = clamp(reversed, -5, 5) * advanced.speedMultiplier;
  }
  paramPatch.glitch = clamp(baseParams.glitch + 0.2, 0, 1);

  const paramPatches: Record<string, ParameterPatch> = { [targetId]: paramPatch };

  return {
    sectionStates: nextStates,
    paramPatches,
  };
};

interface ScrollInteractionContext {
  direction: 'up' | 'down';
  velocity: number;
  sectionStates: Record<string, SectionVisualState>;
  params: SectionParameterSnapshot;
  effect: ScrollEffectPreset;
  advanced: DesignSystemAdvancedTuning;
  timestamp: number;
}

const computeScrollIntensity = (velocity: number, effect: ScrollEffectPreset, timestamp: number): number => {
  const magnitude = Math.abs(velocity);
  switch (effect.intensityModel) {
    case 'velocity':
      return clamp(magnitude, 0, 4);
    case 'threshold':
      return magnitude > (effect.threshold ?? 5) ? clamp(magnitude * 0.5, 0, 4) : 0.2;
    case 'harmonic':
      return clamp(2 + Math.sin(timestamp / 300), 0, 4);
    default:
      return clamp(magnitude, 0, 4);
  }
};

export const applyScrollInteraction = ({
  direction,
  velocity,
  sectionStates,
  params,
  effect,
  advanced,
  timestamp,
}: ScrollInteractionContext): ScrollInteractionResult => {
  const intensity = computeScrollIntensity(velocity, effect, timestamp) * advanced.interactionSensitivity;
  const nextStates: Record<string, SectionVisualState> = { ...sectionStates };
  const paramPatches: Record<string, ParameterPatch> = {};

  Object.keys(params).forEach((sectionId) => {
    const baseParams = params[sectionId];
    if (!baseParams) {
      return;
    }
    const baseState = nextStates[sectionId] ?? createDefaultSectionVisualState();
    const delta = direction === 'up' ? intensity * 0.1 : -intensity * 0.1;
    const updatedState: SectionVisualState = {
      ...baseState,
      gridDensity: clamp(baseState.gridDensity + delta, 0.2, 4),
      reactivity: clamp(baseState.reactivity + intensity * 0.05, 0.2, 5),
      colorIntensity: clamp(baseState.colorIntensity + intensity * 0.03, 0.2, 5),
      depth: clamp(baseState.depth + (direction === 'up' ? 1 : -1) * intensity * 0.5, -50, 50),
      rippleEffect: effect.decayModel === 'wave' ? {
        type: 'scroll_wave',
        startedAt: timestamp,
        duration: 600,
      } : baseState.rippleEffect,
      lastUpdated: timestamp,
    };

    nextStates[sectionId] = updatedState;
    paramPatches[sectionId] = mapVisualStateToParams(updatedState, baseParams, advanced);
  });

  return { sectionStates: nextStates, paramPatches };
};

export const resetSectionVisualStates = (
  sectionStates: Record<string, SectionVisualState>,
  sectionIds?: string[]
): Record<string, SectionVisualState> => {
  if (!sectionIds || sectionIds.length === 0) {
    return {};
  }

  const nextStates: Record<string, SectionVisualState> = { ...sectionStates };
  sectionIds.forEach((id) => {
    nextStates[id] = createDefaultSectionVisualState();
  });
  return nextStates;
};

export const pruneExpiredEffects = (
  sectionStates: Record<string, SectionVisualState>,
  timestamp: number
): Record<string, SectionVisualState> => {
  const nextStates: Record<string, SectionVisualState> = { ...sectionStates };
  Object.entries(nextStates).forEach(([id, state]) => {
    if (!state) return;
    let rippleEffect = state.rippleEffect;
    if (rippleEffect && timestamp - rippleEffect.startedAt > rippleEffect.duration) {
      rippleEffect = undefined;
    }
    let sparkleEffect = state.sparkleEffect;
    if (sparkleEffect && timestamp - sparkleEffect.startedAt > sparkleEffect.duration) {
      sparkleEffect = undefined;
    }
    const inversionActive = state.inversionActiveUntil && timestamp > state.inversionActiveUntil;

    nextStates[id] = {
      ...state,
      rippleEffect,
      sparkleEffect,
      inversionActiveUntil: inversionActive ? undefined : state.inversionActiveUntil,
    };
  });
  return nextStates;
};

