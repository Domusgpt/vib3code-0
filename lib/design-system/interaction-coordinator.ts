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
  LayerVisualState,
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

const applyLayerOperations = (
  base: LayerVisualState,
  scalarOps: { gridDensity: string; colorIntensity: string; reactivity: string; depth: string },
  effect: Partial<VisualStateMultipliers> | undefined,
  timestamp: number
): LayerVisualState => {
  const gridMultiplier = parseScalarOperation(scalarOps.gridDensity) * (effect?.gridDensity ?? 1);
  const colorMultiplier = parseScalarOperation(scalarOps.colorIntensity) * (effect?.colorIntensity ?? 1);
  const reactivityMultiplier = parseScalarOperation(scalarOps.reactivity) * (effect?.reactivity ?? 1);
  const depthDelta = parseDepthOperation(scalarOps.depth) + (effect?.depth ?? 0);

  return {
    gridDensity: clamp(base.gridDensity * gridMultiplier, 0.1, 4),
    colorIntensity: clamp(base.colorIntensity * colorMultiplier, 0.2, 4),
    reactivity: clamp(base.reactivity * reactivityMultiplier, 0.2, 5),
    depth: clamp(base.depth + depthDelta, -60, 60),
    lastUpdated: timestamp,
  };
};

const applyModifierLayer = (
  base: LayerVisualState,
  modifiers: Partial<VisualStateMultipliers> | undefined,
  intensity: number,
  timestamp: number
): LayerVisualState | undefined => {
  if (!modifiers) {
    return undefined;
  }

  return {
    gridDensity: clamp(base.gridDensity * ((modifiers.gridDensity ?? 1) + intensity * 0.02), 0.1, 4),
    colorIntensity: clamp(base.colorIntensity * ((modifiers.colorIntensity ?? 1) + intensity * 0.02), 0.2, 4.5),
    reactivity: clamp(base.reactivity * ((modifiers.reactivity ?? 1) + intensity * 0.03), 0.2, 5.5),
    depth: clamp(base.depth + (modifiers.depth ?? 0) * intensity * 0.4, -60, 60),
    lastUpdated: timestamp,
  };
};

const combineLayerStates = (
  primary: LayerVisualState,
  accent?: LayerVisualState,
  complementary?: LayerVisualState
): LayerVisualState => {
  const gridDensity = clamp(
    primary.gridDensity + (accent ? accent.gridDensity - 1 : 0) + (complementary ? complementary.gridDensity - 1 : 0),
    0.1,
    4.5
  );
  const colorIntensity = clamp(
    primary.colorIntensity + (accent ? accent.colorIntensity - 1 : 0) + (complementary ? complementary.colorIntensity - 1 : 0),
    0.2,
    5
  );
  const reactivity = clamp(
    primary.reactivity + (accent ? accent.reactivity - 1 : 0) + (complementary ? complementary.reactivity - 1 : 0),
    0.2,
    6
  );
  const depth = clamp(
    primary.depth + (accent?.depth ?? 0) + (complementary?.depth ?? 0),
    -70,
    70
  );

  return {
    gridDensity,
    colorIntensity,
    reactivity,
    depth,
    lastUpdated: primary.lastUpdated,
  };
};

const mapVisualStateToParams = (
  visualState: SectionVisualState,
  baseParams: SectionParameterSnapshot[string],
  advanced: DesignSystemAdvancedTuning
): ParameterPatch => {
  const accentGridDelta = visualState.accentLayer ? visualState.accentLayer.gridDensity - 1 : 0;
  const complementaryGridDelta = visualState.complementaryLayer ? visualState.complementaryLayer.gridDensity - 1 : 0;
  const accentColorDelta = visualState.accentLayer ? visualState.accentLayer.colorIntensity - 1 : 0;
  const complementaryColorDelta = visualState.complementaryLayer ? visualState.complementaryLayer.colorIntensity - 1 : 0;
  const accentReactivityDelta = visualState.accentLayer ? visualState.accentLayer.reactivity - 1 : 0;
  const complementaryReactivityDelta = visualState.complementaryLayer ? visualState.complementaryLayer.reactivity - 1 : 0;
  const layeredDepth = visualState.depth + (visualState.accentLayer?.depth ?? 0) + (visualState.complementaryLayer?.depth ?? 0);

  const paramPatch: ParameterPatch = {};
  const densityMultiplier = clamp(
    visualState.gridDensity + accentGridDelta * 0.8 + complementaryGridDelta * 0.6,
    0.1,
    2.5
  );
  paramPatch.density = clamp(baseParams.density * densityMultiplier, 0, 1.6);

  const chromaMultiplier = clamp(
    visualState.colorIntensity + accentColorDelta * 0.9 + complementaryColorDelta * 0.7,
    0.1,
    3
  );
  paramPatch.chromaShift = clamp(baseParams.chromaShift * chromaMultiplier, -1.5, 1.5);

  const reactivityMultiplier = clamp(
    visualState.reactivity + accentReactivityDelta * 1.1 + complementaryReactivityDelta * 0.85,
    0.1,
    6.5
  );
  const reactivityBoost = reactivityMultiplier * advanced.speedMultiplier * advanced.interactionSensitivity;
  paramPatch.timeScale = clamp(baseParams.timeScale * reactivityBoost, -6, 6);

  paramPatch.dispAmp = clamp(baseParams.dispAmp + layeredDepth * 0.0012, 0, 1.6);
  paramPatch.glitch = clamp(baseParams.glitch + Math.max(0, accentGridDelta * 0.05) + Math.max(0, complementaryColorDelta * 0.04), 0, 1);
  return paramPatch;
};

export const createDefaultSectionVisualState = (): SectionVisualState => ({
  gridDensity: 1,
  colorIntensity: 1,
  reactivity: 1,
  depth: 0,
  lastUpdated: Date.now(),
  accentLayer: undefined,
  complementaryLayer: undefined,
  accentEffect: undefined,
  complementaryEffect: undefined,
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
    const isTarget = sectionId === targetId;
    const scalarOps = isTarget ? hoverResponse.target : hoverResponse.others;
    const modifiers = isTarget ? effect.targetModifiers : effect.othersModifiers;
    const primaryLayer = applyLayerOperations(baseState, scalarOps, modifiers ?? {}, timestamp);

    const accentOps = hoverResponse.accent
      ? (isTarget ? hoverResponse.accent.target : hoverResponse.accent.others)
      : undefined;
    const accentModifiers = isTarget ? effect.accentTargetModifiers : effect.accentOthersModifiers;
    const accentLayer = accentOps
      ? applyLayerOperations(primaryLayer, accentOps, accentModifiers ?? {}, timestamp)
      : undefined;

    const complementOps = hoverResponse.complementary
      ? (isTarget ? hoverResponse.complementary.target : hoverResponse.complementary.others)
      : undefined;
    const complementModifiers = isTarget ? effect.complementTargetModifiers : effect.complementOthersModifiers;
    const complementaryLayer = complementOps
      ? applyLayerOperations(primaryLayer, complementOps, complementModifiers ?? {}, timestamp)
      : undefined;

    const composite = combineLayerStates(primaryLayer, accentLayer, complementaryLayer);

    const accentEffect = accentLayer
      ? effect.accentEffect
        ? { type: effect.accentEffect.type, startedAt: timestamp, duration: effect.accentEffect.duration }
        : {
            type: 'hover_accent_layer',
            startedAt: timestamp,
            duration: parseDurationMs(hoverResponse.transition.duration),
          }
      : baseState.accentEffect;

    const complementaryEffect = complementaryLayer
      ? effect.complementEffect
        ? { type: effect.complementEffect.type, startedAt: timestamp, duration: effect.complementEffect.duration }
        : {
            type: 'hover_complementary_layer',
            startedAt: timestamp,
            duration: parseDurationMs(hoverResponse.transition.duration),
          }
      : baseState.complementaryEffect;

    const updatedState: SectionVisualState = {
      ...baseState,
      ...composite,
      accentLayer,
      complementaryLayer,
      accentEffect,
      complementaryEffect,
      lastUpdated: timestamp,
    };

    nextStates[sectionId] = updatedState;
    paramPatches[sectionId] = mapVisualStateToParams(updatedState, baseParams, advanced);
  });

  const baseDuration = parseDurationMs(hoverResponse.transition.duration);
  const layerCount = 1 + (hoverResponse.accent ? 1 : 0) + (hoverResponse.complementary ? 1 : 0);
  const averageMultiplier =
    (effect.transitionSpeedMultiplier +
      (hoverResponse.accent ? effect.accentTransitionSpeedMultiplier ?? effect.transitionSpeedMultiplier : 0) +
      (hoverResponse.complementary
        ? effect.complementTransitionSpeedMultiplier ?? effect.transitionSpeedMultiplier
        : 0)) /
    Math.max(1, layerCount);
  const duration = baseDuration * averageMultiplier * advanced.transitionDurationMultiplier;
  const stagger =
    parseDurationMs(hoverResponse.transition.stagger) +
    (hoverResponse.accent ? 20 : 0) +
    (hoverResponse.complementary ? 15 : 0);

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
  const paramPatches: Record<string, ParameterPatch> = {};

  Object.keys(params).forEach((sectionId) => {
    const baseParams = params[sectionId];
    if (!baseParams) {
      return;
    }

    const baseState = nextStates[sectionId] ?? createDefaultSectionVisualState();
    const isTarget = sectionId === targetId;

    const primaryOps = isTarget ? clickResponse.primary.target : clickResponse.primary.others;
    const primaryModifiers = isTarget ? effect.targetModifiers : effect.othersModifiers;
    const primaryLayer = applyLayerOperations(baseState, primaryOps, primaryModifiers ?? {}, timestamp);

    const accentOps = clickResponse.accent
      ? (isTarget ? clickResponse.accent.target : clickResponse.accent.others)
      : undefined;
    const accentModifiers = isTarget ? effect.accentTargetModifiers : effect.accentOthersModifiers;
    const accentLayer = accentOps
      ? applyLayerOperations(primaryLayer, accentOps, accentModifiers ?? {}, timestamp)
      : undefined;

    const complementaryOps = clickResponse.complementary
      ? (isTarget ? clickResponse.complementary.target : clickResponse.complementary.others)
      : undefined;
    const complementaryModifiers = isTarget ? effect.complementTargetModifiers : effect.complementOthersModifiers;
    const complementaryLayer = complementaryOps
      ? applyLayerOperations(primaryLayer, complementaryOps, complementaryModifiers ?? {}, timestamp)
      : undefined;

    const composite = combineLayerStates(primaryLayer, accentLayer, complementaryLayer);

    let rippleEffect = baseState.rippleEffect;
    let sparkleEffect = baseState.sparkleEffect;
    let accentEffect = baseState.accentEffect;
    let complementaryEffect = baseState.complementaryEffect;
    let inversionActiveUntil = baseState.inversionActiveUntil;

    if (isTarget) {
      rippleEffect = {
        type: clickResponse.immediate.rippleEffect,
        startedAt: timestamp,
        duration: parseDurationMs(clickResponse.duration.decay),
      };
      sparkleEffect = {
        type: clickResponse.immediate.sparkleGeneration,
        startedAt: timestamp,
        duration: effect.sparkleDuration,
        count: effect.sparkleCount,
      };
      inversionActiveUntil = timestamp + effect.inversionDuration;

      if (clickResponse.accent) {
        accentEffect = {
          type: clickResponse.accent.rippleEffect,
          startedAt: timestamp,
          duration: effect.accentRippleDuration ?? parseDurationMs(clickResponse.accent.duration),
          data: { sparkle: effect.accentSparkleCount ?? effect.sparkleCount },
        };
      } else if (accentLayer) {
        accentEffect = {
          type: 'click_accent_field',
          startedAt: timestamp,
          duration: effect.accentRippleDuration ?? 800,
        };
      }

      if (clickResponse.complementary) {
        complementaryEffect = {
          type: clickResponse.complementary.rippleEffect,
          startedAt: timestamp,
          duration: effect.complementaryRippleDuration ?? parseDurationMs(clickResponse.complementary.duration),
          data: {
            sparkle: effect.complementarySparkleCount ?? Math.max(4, Math.floor(effect.sparkleCount * 0.75)),
          },
        };
      } else if (complementaryLayer) {
        complementaryEffect = {
          type: 'click_complementary_field',
          startedAt: timestamp,
          duration: effect.complementaryRippleDuration ?? 650,
        };
      }
    } else {
      if (accentLayer && clickResponse.accent) {
        accentEffect = {
          type: clickResponse.accent.rippleEffect,
          startedAt: timestamp,
          duration: effect.accentRippleDuration ?? parseDurationMs(clickResponse.accent.duration),
        };
      }
      if (complementaryLayer && clickResponse.complementary) {
        complementaryEffect = {
          type: clickResponse.complementary.rippleEffect,
          startedAt: timestamp,
          duration: effect.complementaryRippleDuration ?? parseDurationMs(clickResponse.complementary.duration),
        };
      }
    }

    const updatedState: SectionVisualState = {
      ...baseState,
      ...composite,
      accentLayer,
      complementaryLayer,
      rippleEffect,
      sparkleEffect,
      accentEffect,
      complementaryEffect,
      inversionActiveUntil,
      lastUpdated: timestamp,
    };

    nextStates[sectionId] = updatedState;

    const patch = mapVisualStateToParams(updatedState, baseParams, advanced);

    if (isTarget) {
      if (clickResponse.immediate.variableInversion.density === 'inverse_value') {
        patch.density = invertValue(baseParams.density, 0, 1);
      }
      if (clickResponse.immediate.variableInversion.intensity === 'flip_polarity') {
        patch.chromaShift = invertValue(baseParams.chromaShift, -1.5, 1.5);
      }
      if (clickResponse.immediate.variableInversion.speed === 'reverse_direction') {
        const reversed = -Math.abs(baseParams.timeScale);
        patch.timeScale = clamp(reversed, -6, 6) * advanced.speedMultiplier;
      }
      patch.glitch = clamp((patch.glitch ?? baseParams.glitch) + 0.25, 0, 1);
      if (effect.accentSparkleDuration && clickResponse.accent) {
        patch.morph = clamp((baseParams.morph ?? 1) * 1.1, 0, 2);
      }
    } else {
      patch.glitch = clamp((patch.glitch ?? baseParams.glitch) + 0.08, 0, 1);
    }

    paramPatches[sectionId] = patch;
  });

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
    const primaryLayer: LayerVisualState = {
      gridDensity: clamp(baseState.gridDensity + delta, 0.2, 4.2),
      reactivity: clamp(baseState.reactivity + intensity * 0.05, 0.2, 5.5),
      colorIntensity: clamp(baseState.colorIntensity + intensity * 0.03, 0.2, 5.2),
      depth: clamp(baseState.depth + (direction === 'up' ? 1 : -1) * intensity * 0.5, -55, 55),
      lastUpdated: timestamp,
    };

    const accentLayer = applyModifierLayer(primaryLayer, effect.accentModifiers, intensity, timestamp);
    const complementaryLayer = applyModifierLayer(primaryLayer, effect.complementaryModifiers, intensity, timestamp);
    const composite = combineLayerStates(primaryLayer, accentLayer, complementaryLayer);

    const rippleEffect = effect.decayModel === 'wave'
      ? { type: 'scroll_wave', startedAt: timestamp, duration: 600 }
      : baseState.rippleEffect;

    const accentEffect = accentLayer
      ? effect.accentEffect
        ? { type: effect.accentEffect.type, startedAt: timestamp, duration: effect.accentEffect.duration }
        : { type: 'scroll_accent_trail', startedAt: timestamp, duration: 520 }
      : baseState.accentEffect;

    const complementaryEffect = complementaryLayer
      ? effect.complementaryEffect
        ? { type: effect.complementaryEffect.type, startedAt: timestamp, duration: effect.complementaryEffect.duration }
        : { type: 'scroll_complement_trail', startedAt: timestamp, duration: 460 }
      : baseState.complementaryEffect;

    const updatedState: SectionVisualState = {
      ...baseState,
      ...composite,
      accentLayer,
      complementaryLayer,
      rippleEffect,
      accentEffect,
      complementaryEffect,
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
    let accentEffect = state.accentEffect;
    if (accentEffect && timestamp - accentEffect.startedAt > accentEffect.duration) {
      accentEffect = undefined;
    }
    let complementaryEffect = state.complementaryEffect;
    if (complementaryEffect && timestamp - complementaryEffect.startedAt > complementaryEffect.duration) {
      complementaryEffect = undefined;
    }
    let accentLayer = state.accentLayer;
    if (accentLayer && timestamp - accentLayer.lastUpdated > 1200) {
      accentLayer = undefined;
    }
    let complementaryLayer = state.complementaryLayer;
    if (complementaryLayer && timestamp - complementaryLayer.lastUpdated > 1200) {
      complementaryLayer = undefined;
    }
    const inversionActive = state.inversionActiveUntil && timestamp > state.inversionActiveUntil;

    nextStates[id] = {
      ...state,
      rippleEffect,
      sparkleEffect,
      accentEffect,
      complementaryEffect,
      accentLayer,
      complementaryLayer,
      inversionActiveUntil: inversionActive ? undefined : state.inversionActiveUntil,
    };
  });
  return nextStates;
};

