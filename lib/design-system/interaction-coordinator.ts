import {
  ClickEffectPreset,
  ClickInteractionResult,
  ClickResponseDefinition,
  ClickChannelResponseDefinition,
  ClickChannelImpact,
  FocusInteractionResult,
  DesignSystemAdvancedTuning,
  HoverEffectPreset,
  HoverInteractionResult,
  HoverResponseDefinition,
  HoverResponseLayerGroup,
  HoverBandModifier,
  LayerInteractionEffectState,
  LayerType,
  LayerVisualState,
  ParameterPatch,
  ChannelEnvelopeState,
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

const resolveEnvelopeDecay = (advanced?: DesignSystemAdvancedTuning): number =>
  clamp(advanced?.envelopePersistence ?? 0.7, 0.05, 0.95);

const computeChannelRatio = (
  kind: 'accent' | 'complementary',
  advanced: DesignSystemAdvancedTuning,
): number => {
  const base = kind === 'accent' ? advanced.accentComplementRatio : 2 - advanced.accentComplementRatio;
  return clamp(base, 0.1, 3);
};

const createEnvelopeState = (
  advanced?: DesignSystemAdvancedTuning,
  kind: 'accent' | 'complementary' = 'accent',
): ChannelEnvelopeState => ({
  amplitude: 0,
  velocity: 0,
  ratio: computeChannelRatio(kind, advanced ?? {
    speedMultiplier: 1,
    interactionSensitivity: 1,
    transitionDurationMultiplier: 1,
    accentComplementRatio: 1,
    envelopePersistence: 0.7,
  }),
  decay: resolveEnvelopeDecay(advanced),
  lastUpdate: Date.now(),
});

const updateChannelEnvelope = (
  state: SectionVisualState,
  kind: 'accent' | 'complementary',
  amplitude: number,
  timestamp: number,
  advanced: DesignSystemAdvancedTuning,
) => {
  const key = kind === 'accent' ? 'accentEnvelope' : 'complementaryEnvelope';
  const ratio = computeChannelRatio(kind, advanced);
  const decay = resolveEnvelopeDecay(advanced);
  const existing = state[key] ?? createEnvelopeState(advanced, kind);
  const decayedAmplitude = existing.amplitude * decay;
  const nextAmplitude = clamp(decayedAmplitude + amplitude * ratio, 0, 6);
  const velocity = nextAmplitude - existing.amplitude;
  state[key] = {
    amplitude: nextAmplitude,
    velocity,
    ratio,
    decay,
    lastUpdate: timestamp,
  };
};

const createDefaultLayerState = (): LayerVisualState => ({
  gridDensity: 1,
  colorIntensity: 1,
  reactivity: 1,
  depth: 0,
});

const ensureLayerMap = (
  layers?: Record<LayerType, LayerVisualState>
): Record<LayerType, LayerVisualState> => ({
  background: { ...(layers?.background ?? createDefaultLayerState()) },
  shadow: { ...(layers?.shadow ?? createDefaultLayerState()) },
  content: { ...(layers?.content ?? createDefaultLayerState()) },
  highlight: { ...(layers?.highlight ?? createDefaultLayerState()) },
  accent: { ...(layers?.accent ?? createDefaultLayerState()) },
});

const cloneSectionState = (state: SectionVisualState): SectionVisualState => ({
  ...state,
  layers: ensureLayerMap(state.layers),
  rippleEffect: state.rippleEffect ? { ...state.rippleEffect } : undefined,
  sparkleEffect: state.sparkleEffect ? { ...state.sparkleEffect } : undefined,
  accentChannel: state.accentChannel ? { ...state.accentChannel } : undefined,
  complementaryChannel: state.complementaryChannel ? { ...state.complementaryChannel } : undefined,
  accentEnvelope: state.accentEnvelope ? { ...state.accentEnvelope } : undefined,
  complementaryEnvelope: state.complementaryEnvelope ? { ...state.complementaryEnvelope } : undefined,
});

const applyHoverBehavior = (
  state: SectionVisualState,
  operations: { gridDensity: string; colorIntensity: string; reactivity: string; depth: string },
  modifier?: Partial<VisualStateMultipliers>
) => {
  const gridMultiplier = parseScalarOperation(operations.gridDensity) * (modifier?.gridDensity ?? 1);
  const colorMultiplier = parseScalarOperation(operations.colorIntensity) * (modifier?.colorIntensity ?? 1);
  const reactivityMultiplier = parseScalarOperation(operations.reactivity) * (modifier?.reactivity ?? 1);
  const depthDelta = parseDepthOperation(operations.depth) + (modifier?.depth ?? 0);

  state.gridDensity = clamp(state.gridDensity * gridMultiplier, 0.1, 5);
  state.colorIntensity = clamp(state.colorIntensity * colorMultiplier, 0.1, 5);
  state.reactivity = clamp(state.reactivity * reactivityMultiplier, 0.1, 6);
  state.depth = clamp(state.depth + depthDelta, -60, 60);
};

const applyHoverLayerBehavior = (
  layer: LayerVisualState,
  operations: { gridDensity: string; colorIntensity: string; reactivity: string; depth: string },
  modifier?: Partial<VisualStateMultipliers>
): LayerVisualState => {
  const gridMultiplier = parseScalarOperation(operations.gridDensity) * (modifier?.gridDensity ?? 1);
  const colorMultiplier = parseScalarOperation(operations.colorIntensity) * (modifier?.colorIntensity ?? 1);
  const reactivityMultiplier = parseScalarOperation(operations.reactivity) * (modifier?.reactivity ?? 1);
  const depthDelta = parseDepthOperation(operations.depth) + (modifier?.depth ?? 0);

  return {
    gridDensity: clamp(layer.gridDensity * gridMultiplier, 0.1, 5),
    colorIntensity: clamp(layer.colorIntensity * colorMultiplier, 0.1, 5),
    reactivity: clamp(layer.reactivity * reactivityMultiplier, 0.1, 6),
    depth: clamp(layer.depth + depthDelta, -60, 60),
  };
};

const applyHoverGroup = (
  baseState: SectionVisualState,
  group: HoverResponseLayerGroup,
  modifiers: HoverBandModifier | undefined,
  timestamp: number,
  isTarget: boolean,
  advanced: DesignSystemAdvancedTuning,
): SectionVisualState => {
  const state = cloneSectionState(baseState);

  applyHoverBehavior(state, group.primary, modifiers?.primary);
  applyHoverBehavior(state, group.accent, modifiers?.accent);
  applyHoverBehavior(state, group.complementary, modifiers?.complementary);

  const layerOps = group.layers ?? {};
  const layerModifiers = modifiers?.layers ?? {};
  (Object.keys(layerOps) as LayerType[]).forEach((layerKey) => {
    const ops = layerOps[layerKey];
    if (!ops) return;
    const currentLayer = state.layers[layerKey] ?? createDefaultLayerState();
    state.layers[layerKey] = applyHoverLayerBehavior(currentLayer, ops, layerModifiers[layerKey]);
  });

  const accentLayer: LayerType = isTarget ? 'highlight' : 'shadow';
  const complementaryLayer: LayerType = isTarget ? 'background' : 'content';
  const accentAmplitude = (modifiers?.accent?.colorIntensity ?? 1) * computeChannelRatio('accent', advanced);
  const complementaryAmplitude = (modifiers?.complementary?.gridDensity ?? 1) * computeChannelRatio('complementary', advanced);

  state.accentChannel = {
    type: isTarget ? 'hover_accent_target' : 'hover_accent_other',
    layer: accentLayer,
    amplitude: accentAmplitude,
    startedAt: timestamp,
    duration: 600,
  } satisfies LayerInteractionEffectState;

  state.complementaryChannel = {
    type: isTarget ? 'hover_complementary_target' : 'hover_complementary_other',
    layer: complementaryLayer,
    amplitude: complementaryAmplitude,
    startedAt: timestamp,
    duration: 600,
  } satisfies LayerInteractionEffectState;

  updateChannelEnvelope(state, 'accent', accentAmplitude, timestamp, advanced);
  updateChannelEnvelope(state, 'complementary', complementaryAmplitude, timestamp, advanced);

  const highlightLayer = state.layers.highlight;
  const accentLayerState = state.layers.accent;
  const accentEnvelope = state.accentEnvelope?.amplitude ?? 0;
  const complementaryEnvelope = state.complementaryEnvelope?.amplitude ?? 0;
  state.gridDensity = clamp(
    state.gridDensity + (highlightLayer.gridDensity - 1) * 0.1 + accentEnvelope * 0.04 - complementaryEnvelope * 0.02,
    0.1,
    5,
  );
  state.colorIntensity = clamp(
    state.colorIntensity + (highlightLayer.colorIntensity - 1) * 0.1 + accentEnvelope * 0.05,
    0.1,
    5,
  );
  state.reactivity = clamp(
    state.reactivity + (accentLayerState.reactivity - 1) * 0.08 + accentEnvelope * 0.06,
    0.1,
    6,
  );
  state.depth = clamp(
    state.depth + highlightLayer.depth * 0.04 + (state.accentEnvelope?.velocity ?? 0) * 0.8,
    -60,
    60,
  );
  state.lastUpdated = timestamp;

  return state;
};

const applyClickChannel = (
  state: SectionVisualState,
  channel: ClickChannelResponseDefinition,
  impact: ClickChannelImpact,
  timestamp: number,
  kind: 'accent' | 'complementary',
  advanced: DesignSystemAdvancedTuning,
) => {
  const layers = ensureLayerMap(state.layers);
  const targetLayer = impact.layer;
  const baseLayer = layers[targetLayer] ?? createDefaultLayerState();
  const chromaScalar = parseScalarOperation(channel.chroma);
  const resonanceScalar = parseScalarOperation(channel.resonance);
  const depthDelta = parseDepthOperation(channel.depth) + impact.depthShift;
  const amplitude = impact.intensity * computeChannelRatio(kind, advanced);
  const intensityScalar = Math.max(0.1, chromaScalar * amplitude);
  const reactivityScalar = Math.max(0.1, resonanceScalar * (1 + impact.reactivityBoost));

  state.layers[targetLayer] = {
    gridDensity: clamp(baseLayer.gridDensity * intensityScalar, 0.1, 6),
    colorIntensity: clamp(baseLayer.colorIntensity * intensityScalar, 0.1, 6),
    reactivity: clamp(baseLayer.reactivity * reactivityScalar, 0.1, 6),
    depth: clamp(baseLayer.depth + depthDelta, -60, 60),
  };
  state.gridDensity = clamp(state.gridDensity * (1 + amplitude * 0.05), 0.1, 5);
  state.colorIntensity = clamp(state.colorIntensity * (1 + impact.chromaShift), 0.1, 6);
  state.reactivity = clamp(state.reactivity * Math.max(0.1, 1 + impact.reactivityBoost), 0.1, 6);
  state.depth = clamp(state.depth + depthDelta * 0.4, -60, 60);

  const effectState: LayerInteractionEffectState = {
    type: kind === 'accent' ? 'click_accent' : 'click_complementary',
    layer: targetLayer,
    amplitude,
    startedAt: timestamp,
    duration: impact.duration,
  };

  if (kind === 'accent') {
    state.accentChannel = effectState;
  } else {
    state.complementaryChannel = effectState;
  }

  updateChannelEnvelope(state, kind, amplitude, timestamp, advanced);
};

const applyScrollChannels = (
  state: SectionVisualState,
  effect: ScrollEffectPreset,
  intensity: number,
  timestamp: number,
  direction: 'up' | 'down',
  advanced: DesignSystemAdvancedTuning,
) => {
  const accent = effect.accentChannel;
  if (accent) {
    const baseLayer = ensureLayerMap(state.layers)[accent.layer] ?? createDefaultLayerState();
    const reactivityScalar = Math.max(0.1, 1 + accent.reactivityMultiplier * 0.1 * intensity);
    const intensityScalar = Math.max(0.1, 1 + accent.intensityScale * 0.05 * intensity);
    const depthDelta = accent.depthRebound * intensity * 0.2 * (direction === 'up' ? 1 : -1);
    const amplitude = intensity * accent.intensityScale * computeChannelRatio('accent', advanced);
    state.layers[accent.layer] = {
      gridDensity: clamp(baseLayer.gridDensity * intensityScalar, 0.1, 6),
      colorIntensity: clamp(baseLayer.colorIntensity * intensityScalar, 0.1, 6),
      reactivity: clamp(baseLayer.reactivity * reactivityScalar, 0.1, 6),
      depth: clamp(baseLayer.depth + depthDelta, -60, 60),
    };
    state.accentChannel = {
      type: 'scroll_accent',
      layer: accent.layer,
      amplitude,
      startedAt: timestamp,
      duration: 500 + intensity * 80,
    };
    updateChannelEnvelope(state, 'accent', amplitude, timestamp, advanced);
  }

  const complementary = effect.complementaryChannel;
  if (complementary) {
    const baseLayer = ensureLayerMap(state.layers)[complementary.layer] ?? createDefaultLayerState();
    const reactivityScalar = Math.max(0.1, 1 + complementary.reactivityMultiplier * 0.08 * intensity);
    const intensityScalar = Math.max(0.1, 1 + complementary.intensityScale * 0.04 * intensity);
    const depthDelta = complementary.depthRebound * intensity * 0.15 * (direction === 'up' ? -1 : 1);
    const amplitude = intensity * complementary.intensityScale * computeChannelRatio('complementary', advanced);
    state.layers[complementary.layer] = {
      gridDensity: clamp(baseLayer.gridDensity * intensityScalar, 0.1, 6),
      colorIntensity: clamp(baseLayer.colorIntensity * intensityScalar, 0.1, 6),
      reactivity: clamp(baseLayer.reactivity * reactivityScalar / Math.max(0.2, complementary.stabilization), 0.1, 6),
      depth: clamp(baseLayer.depth + depthDelta, -60, 60),
    };
    state.complementaryChannel = {
      type: 'scroll_complementary',
      layer: complementary.layer,
      amplitude,
      startedAt: timestamp,
      duration: 450 + intensity * 70,
    };
    updateChannelEnvelope(state, 'complementary', amplitude, timestamp, advanced);
  }
};

const mapVisualStateToParams = (
  visualState: SectionVisualState,
  baseParams: SectionParameterSnapshot[string],
  advanced: DesignSystemAdvancedTuning
): ParameterPatch => {
  const layers = ensureLayerMap(visualState.layers);
  const accentLayer = layers.accent;
  const highlightLayer = layers.highlight;
  const backgroundLayer = layers.background;
  const contentLayer = layers.content;
  const accentAmplitude = visualState.accentChannel?.amplitude ?? 1;
  const complementaryAmplitude = visualState.complementaryChannel?.amplitude ?? 1;
  const accentEnvelope = visualState.accentEnvelope ?? createEnvelopeState(advanced, 'accent');
  const complementaryEnvelope =
    visualState.complementaryEnvelope ?? createEnvelopeState(advanced, 'complementary');

  const accentEnvelopeAmp = accentEnvelope.amplitude;
  const accentEnvelopeVelocity = accentEnvelope.velocity;
  const complementaryEnvelopeAmp = complementaryEnvelope.amplitude;
  const complementaryEnvelopeVelocity = complementaryEnvelope.velocity;

  const paramPatch: ParameterPatch = {};
  const densityBase =
    baseParams.density * visualState.gridDensity * (1 + (accentLayer.gridDensity - 1) * 0.25) +
    accentEnvelopeAmp * 0.05 -
    complementaryEnvelopeAmp * 0.04;
  paramPatch.density = clamp(densityBase, 0, 1.5);

  const chromaBase =
    baseParams.chromaShift * visualState.colorIntensity +
    accentLayer.colorIntensity * 0.05 * accentAmplitude -
    backgroundLayer.colorIntensity * 0.03 * complementaryAmplitude +
    accentEnvelopeVelocity * 0.02 -
    complementaryEnvelopeVelocity * 0.015;
  paramPatch.chromaShift = clamp(chromaBase, -1, 1);

  const reactivityBoost =
    (visualState.reactivity + highlightLayer.reactivity * 0.3 + accentAmplitude * 0.1) *
    advanced.speedMultiplier *
    advanced.interactionSensitivity +
    accentEnvelopeAmp * 0.2 -
    complementaryEnvelopeAmp * 0.1;
  paramPatch.timeScale = clamp(baseParams.timeScale * reactivityBoost, -5, 5);

  const dispBase =
    baseParams.dispAmp +
    (visualState.depth +
      highlightLayer.depth * 0.2 +
      accentLayer.depth * 0.12 -
      backgroundLayer.depth * 0.08 +
      accentEnvelopeAmp * 4 -
      complementaryEnvelopeAmp * 3) *
      0.0015;
  paramPatch.dispAmp = clamp(dispBase, 0, 1.5);

  paramPatch.glitch = clamp(
    baseParams.glitch +
      (accentLayer.reactivity - 1) * 0.2 +
      (visualState.accentChannel ? 0.08 : 0) +
      accentEnvelopeAmp * 0.04,
    0,
    1
  );

  paramPatch.morph = clamp(
    baseParams.morph * (contentLayer.gridDensity + highlightLayer.gridDensity * 0.1) + accentEnvelopeVelocity * 0.05,
    0,
    2
  );

  paramPatch.chaos = clamp(
    baseParams.chaos +
      (accentLayer.colorIntensity - 1) * 0.12 +
      (visualState.accentChannel ? 0.05 : 0) +
      accentEnvelopeAmp * 0.06 -
      complementaryEnvelopeAmp * 0.04,
    0,
    1
  );

  paramPatch.noiseFreq = clamp(
    baseParams.noiseFreq * (1 + backgroundLayer.depth * -0.002) * (1 - complementaryEnvelopeAmp * 0.05),
    0,
    10,
  );

  return paramPatch;
};

export const createDefaultSectionVisualState = (): SectionVisualState => ({
  gridDensity: 1,
  colorIntensity: 1,
  reactivity: 1,
  depth: 0,
  layers: ensureLayerMap(),
  accentEnvelope: createEnvelopeState(),
  complementaryEnvelope: createEnvelopeState(undefined, 'complementary'),
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
    const responseGroup = sectionId === targetId ? hoverResponse.target : hoverResponse.others;
    const modifiers = sectionId === targetId ? effect.targetModifiers : effect.othersModifiers;
    const updatedState = applyHoverGroup(
      baseState,
      responseGroup,
      modifiers,
      timestamp,
      sectionId === targetId,
      advanced,
    );

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
  const workingState = cloneSectionState(baseState);
  const updatedState: SectionVisualState = {
    ...workingState,
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

  const baseParams = params[targetId];
  const paramPatch: ParameterPatch = {
    ...mapVisualStateToParams(updatedState, baseParams, advanced),
  };

  applyClickChannel(updatedState, clickResponse.accent, effect.accentImpact, timestamp, 'accent', advanced);
  applyClickChannel(
    updatedState,
    clickResponse.complementary,
    effect.complementaryImpact,
    timestamp,
    'complementary',
    advanced,
  );

  // Recompute mapping after channel application
  Object.assign(paramPatch, mapVisualStateToParams(updatedState, baseParams, advanced));

  // Apply inversion rules
  if (clickResponse.immediate.variableInversion.density === 'inverse_value') {
    paramPatch.density = invertValue(paramPatch.density ?? baseParams.density, 0, 1);
  }
  if (clickResponse.immediate.variableInversion.intensity === 'flip_polarity') {
    const baseChroma = paramPatch.chromaShift ?? baseParams.chromaShift;
    paramPatch.chromaShift = invertValue(baseChroma, -1, 1);
  }
  if (clickResponse.immediate.variableInversion.speed === 'reverse_direction') {
    const reversed = -Math.abs(paramPatch.timeScale ?? baseParams.timeScale);
    paramPatch.timeScale = clamp(reversed, -5, 5) * advanced.speedMultiplier;
  }
  paramPatch.glitch = clamp((paramPatch.glitch ?? baseParams.glitch) + effect.accentImpact.glitchBoost + effect.complementaryImpact.glitchBoost, 0, 1);
  paramPatch.chromaShift = clamp(
    (paramPatch.chromaShift ?? baseParams.chromaShift) + effect.accentImpact.chromaShift + effect.complementaryImpact.chromaShift,
    -1,
    1
  );
  paramPatch.density = clamp(
    (paramPatch.density ?? baseParams.density) * Math.max(0.1, 1 + effect.complementaryImpact.intensity * 0.05),
    0,
    1.5
  );
  paramPatch.chaos = clamp(
    (paramPatch.chaos ?? baseParams.chaos) + effect.accentImpact.intensity * 0.05,
    0,
    1
  );
  paramPatch.morph = clamp(
    (paramPatch.morph ?? baseParams.morph) * Math.max(0.1, 1 + effect.accentImpact.reactivityBoost * 0.2),
    0,
    2
  );
  paramPatch.timeScale = clamp(
    (paramPatch.timeScale ?? baseParams.timeScale) * Math.max(0.1, 1 + effect.accentImpact.reactivityBoost),
    -5,
    5
  );

  nextStates[targetId] = updatedState;

  const paramPatches: Record<string, ParameterPatch> = { [targetId]: paramPatch };

  Object.keys(params).forEach((sectionId) => {
    if (sectionId === targetId) {
      return;
    }
    const baseParams = params[sectionId];
    if (!baseParams) {
      return;
    }
    const baseState = nextStates[sectionId] ?? createDefaultSectionVisualState();
    const workingState = cloneSectionState(baseState);
    const layers = ensureLayerMap(workingState.layers);

    const accentEcho = effect.accentImpact.intensity * 0.3;
    const complementaryEcho = effect.complementaryImpact.intensity * 0.5;

    workingState.accentChannel = {
      type: 'click_accent_echo',
      layer: effect.accentImpact.layer,
      amplitude: accentEcho,
      startedAt: timestamp,
      duration: Math.max(400, effect.accentImpact.duration * 0.5),
    } satisfies LayerInteractionEffectState;
    workingState.complementaryChannel = {
      type: 'click_complementary_echo',
      layer: effect.complementaryImpact.layer,
      amplitude: complementaryEcho,
      startedAt: timestamp,
      duration: Math.max(600, effect.complementaryImpact.duration * 0.6),
    } satisfies LayerInteractionEffectState;

    updateChannelEnvelope(workingState, 'accent', accentEcho, timestamp, advanced);
    updateChannelEnvelope(workingState, 'complementary', complementaryEcho, timestamp, advanced);

    layers.highlight = {
      ...layers.highlight,
      colorIntensity: clamp(layers.highlight.colorIntensity * (1 + accentEcho * 0.08), 0.1, 6),
      reactivity: clamp(layers.highlight.reactivity * (1 + accentEcho * 0.06), 0.1, 6),
      depth: clamp(layers.highlight.depth + accentEcho * 6, -60, 60),
    };
    layers.background = {
      ...layers.background,
      colorIntensity: clamp(layers.background.colorIntensity * (1 - complementaryEcho * 0.04), 0.1, 6),
      depth: clamp(layers.background.depth - complementaryEcho * 5, -60, 60),
    };
    workingState.layers = layers;
    workingState.lastUpdated = timestamp;

    nextStates[sectionId] = workingState;
    paramPatches[sectionId] = mapVisualStateToParams(workingState, baseParams, advanced);
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

interface FocusInteractionContext {
  focusId: string;
  sectionStates: Record<string, SectionVisualState>;
  params: SectionParameterSnapshot;
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
    const updatedState = cloneSectionState(baseState);
    const delta = direction === 'up' ? intensity * 0.1 : -intensity * 0.1;
    updatedState.gridDensity = clamp(updatedState.gridDensity + delta, 0.2, 5);
    updatedState.reactivity = clamp(updatedState.reactivity + intensity * 0.05, 0.2, 6);
    updatedState.colorIntensity = clamp(updatedState.colorIntensity + intensity * 0.03, 0.2, 6);
    updatedState.depth = clamp(updatedState.depth + (direction === 'up' ? 1 : -1) * intensity * 0.5, -60, 60);
    if (effect.decayModel === 'wave') {
      updatedState.rippleEffect = {
        type: 'scroll_wave',
        startedAt: timestamp,
        duration: 600,
      };
    }

    applyScrollChannels(updatedState, effect, intensity, timestamp, direction, advanced);

    updatedState.lastUpdated = timestamp;

    nextStates[sectionId] = updatedState;
    paramPatches[sectionId] = mapVisualStateToParams(updatedState, baseParams, advanced);
  });

  return { sectionStates: nextStates, paramPatches };
};

export const applyFocusCalibration = ({
  focusId,
  sectionStates,
  params,
  advanced,
  timestamp,
}: FocusInteractionContext): FocusInteractionResult => {
  const nextStates: Record<string, SectionVisualState> = { ...sectionStates };
  const paramPatches: Record<string, ParameterPatch> = {};

  Object.keys(params).forEach((sectionId) => {
    const baseParams = params[sectionId];
    if (!baseParams) {
      return;
    }

    const baseState = nextStates[sectionId] ?? createDefaultSectionVisualState();
    const workingState = cloneSectionState(baseState);
    const layers = ensureLayerMap(workingState.layers);
    const isFocus = sectionId === focusId;

    if (isFocus) {
      const accentPulse = computeChannelRatio('accent', advanced) * 0.9 + 0.4;
      const complementaryPulse = computeChannelRatio('complementary', advanced) * 0.7 + 0.3;

      workingState.accentChannel = {
        type: 'focus_accent',
        layer: 'highlight',
        amplitude: accentPulse,
        startedAt: timestamp,
        duration: 900,
      } satisfies LayerInteractionEffectState;
      workingState.complementaryChannel = {
        type: 'focus_complementary',
        layer: 'background',
        amplitude: complementaryPulse,
        startedAt: timestamp,
        duration: 900,
      } satisfies LayerInteractionEffectState;

      updateChannelEnvelope(workingState, 'accent', accentPulse, timestamp, advanced);
      updateChannelEnvelope(workingState, 'complementary', complementaryPulse, timestamp, advanced);

      layers.highlight = {
        ...layers.highlight,
        gridDensity: clamp(layers.highlight.gridDensity * (1 + accentPulse * 0.08), 0.1, 6),
        colorIntensity: clamp(layers.highlight.colorIntensity * (1 + accentPulse * 0.12), 0.1, 6),
        reactivity: clamp(layers.highlight.reactivity * (1 + accentPulse * 0.1), 0.1, 6),
        depth: clamp(layers.highlight.depth + accentPulse * 10, -60, 60),
      };
      layers.accent = {
        ...layers.accent,
        gridDensity: clamp(layers.accent.gridDensity * (1 + accentPulse * 0.05), 0.1, 6),
        colorIntensity: clamp(layers.accent.colorIntensity * (1 + accentPulse * 0.08), 0.1, 6),
        reactivity: clamp(layers.accent.reactivity * (1 + accentPulse * 0.1), 0.1, 6),
        depth: clamp(layers.accent.depth + accentPulse * 8, -60, 60),
      };
      layers.background = {
        ...layers.background,
        gridDensity: clamp(layers.background.gridDensity * (1 - complementaryPulse * 0.05), 0.1, 6),
        colorIntensity: clamp(layers.background.colorIntensity * (1 - complementaryPulse * 0.06), 0.1, 6),
        depth: clamp(layers.background.depth - complementaryPulse * 6, -60, 60),
      };
    } else {
      const accentPulse = computeChannelRatio('accent', advanced) * 0.25;
      const complementaryPulse = computeChannelRatio('complementary', advanced) * 0.9;

      workingState.accentChannel = {
        type: 'focus_accent_field',
        layer: 'shadow',
        amplitude: accentPulse,
        startedAt: timestamp,
        duration: 650,
      } satisfies LayerInteractionEffectState;
      workingState.complementaryChannel = {
        type: 'focus_complementary_field',
        layer: 'background',
        amplitude: complementaryPulse,
        startedAt: timestamp,
        duration: 750,
      } satisfies LayerInteractionEffectState;

      updateChannelEnvelope(workingState, 'accent', accentPulse, timestamp, advanced);
      updateChannelEnvelope(workingState, 'complementary', complementaryPulse, timestamp, advanced);

      layers.highlight = {
        ...layers.highlight,
        colorIntensity: clamp(layers.highlight.colorIntensity * (1 - accentPulse * 0.05), 0.1, 6),
        depth: clamp(layers.highlight.depth - accentPulse * 4, -60, 60),
      };
      layers.background = {
        ...layers.background,
        colorIntensity: clamp(layers.background.colorIntensity * (1 + complementaryPulse * 0.06), 0.1, 6),
        depth: clamp(layers.background.depth - complementaryPulse * 8, -60, 60),
      };
      layers.shadow = {
        ...layers.shadow,
        gridDensity: clamp(layers.shadow.gridDensity * (1 + complementaryPulse * 0.05), 0.1, 6),
        depth: clamp(layers.shadow.depth - complementaryPulse * 5, -60, 60),
      };
    }

    workingState.layers = layers;
    workingState.lastUpdated = timestamp;

    nextStates[sectionId] = workingState;
    paramPatches[sectionId] = mapVisualStateToParams(workingState, baseParams, advanced);
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
    let accentChannel = state.accentChannel;
    if (accentChannel && timestamp - accentChannel.startedAt > accentChannel.duration) {
      accentChannel = undefined;
    }
    let complementaryChannel = state.complementaryChannel;
    if (complementaryChannel && timestamp - complementaryChannel.startedAt > complementaryChannel.duration) {
      complementaryChannel = undefined;
    }
    let accentEnvelope = state.accentEnvelope;
    if (accentEnvelope) {
      const decay = clamp(accentEnvelope.decay, 0.05, 0.95);
      const elapsed = Math.max(0, timestamp - accentEnvelope.lastUpdate);
      const steps = Math.max(1, Math.floor(elapsed / 60));
      const nextAmplitude = accentEnvelope.amplitude * Math.pow(decay, steps);
      const nextVelocity = accentEnvelope.velocity * Math.pow(decay, steps);
      if (nextAmplitude < 0.01) {
        accentEnvelope = undefined;
      } else {
        accentEnvelope = {
          ...accentEnvelope,
          amplitude: nextAmplitude,
          velocity: nextVelocity,
          lastUpdate: timestamp,
        };
      }
    }
    let complementaryEnvelope = state.complementaryEnvelope;
    if (complementaryEnvelope) {
      const decay = clamp(complementaryEnvelope.decay, 0.05, 0.95);
      const elapsed = Math.max(0, timestamp - complementaryEnvelope.lastUpdate);
      const steps = Math.max(1, Math.floor(elapsed / 60));
      const nextAmplitude = complementaryEnvelope.amplitude * Math.pow(decay, steps);
      const nextVelocity = complementaryEnvelope.velocity * Math.pow(decay, steps);
      if (nextAmplitude < 0.01) {
        complementaryEnvelope = undefined;
      } else {
        complementaryEnvelope = {
          ...complementaryEnvelope,
          amplitude: nextAmplitude,
          velocity: nextVelocity,
          lastUpdate: timestamp,
        };
      }
    }
    const inversionActive = state.inversionActiveUntil && timestamp > state.inversionActiveUntil;

    nextStates[id] = {
      ...state,
      rippleEffect,
      sparkleEffect,
      inversionActiveUntil: inversionActive ? undefined : state.inversionActiveUntil,
      accentChannel,
      complementaryChannel,
      accentEnvelope,
      complementaryEnvelope,
    };
  });
  return nextStates;
};

