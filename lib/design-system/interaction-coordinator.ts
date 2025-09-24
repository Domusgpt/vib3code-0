import {
  ClickEffectPreset,
  ClickInteractionResult,
  ClickResponseDefinition,
  DesignSystemAdvancedTuning,
  HoverEffectPreset,
  HoverInteractionResult,
  HoverResponseDefinition,
  ParameterPatch,
  ScrollEffectPreset,
  ScrollInteractionResult,
  SectionParameterSnapshot,
  SectionVisualState,
  VisualStateMultipliers,
} from './types';

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

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
}

export const applyHoverInteraction = ({
  targetId,
  sectionStates,
  params,
  hoverResponse,
  effect,
  advanced,
  timestamp,
}: HoverInteractionContext): HoverInteractionResult => {
  const nextStates: Record<string, SectionVisualState> = { ...sectionStates };
  const paramPatches: Record<string, ParameterPatch> = {};
  const sectionIds = Object.keys(params);

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
}: ClickInteractionContext): ClickInteractionResult => {
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

