/**
 * VIB34D Hybrid Foundation 2.0 - Parameter Authority Core
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 * 
 * Establishes the Hybrid Foundation parameter web responsible for cascading
 * relationships between interaction intent, consciousness feedback, and the
 * underlying WebGL uniform space.
 *
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 */

import { DEFAULT_HOME_PARAMS, SECTION_CONFIGS, deriveParams, type Params, type SectionConfig } from './store';
import type { VIB3GeometryParams } from './vib34d-geometries';
import { VisualConsciousnessSystem } from './visual-consciousness';

/** Layers supported by the Hybrid Foundation render stack. */
export type LayerType = 'background' | 'shadow' | 'content' | 'highlight' | 'accent';

/** Mathematical intent for a relationship between two parameters. */
export type ParameterRelationship = 'linear' | 'inverse' | 'exponential' | 'logarithmic';

/** Time-domain behaviour for cascaded updates. */
export type ParameterCurve = 'easeIn' | 'easeOut' | 'easeInOut' | 'immediate';

/** Definition for a cascade influence. */
export interface ParameterCascadeInfluence {
  target: string;
  relationship: ParameterRelationship;
  intensity: number;
  layer?: LayerType;
  curve?: ParameterCurve;
  damping?: number;
  delay?: number;
  min?: number;
  max?: number;
  polarity?: number;
}

/** Mapping of trigger name to cascade definitions. */
export type ParameterCascadeDefinition = Record<string, ParameterCascadeInfluence[]>;

/** Context supplied when executing a cascade. */
export interface ParameterCascadeContext {
  sectionId?: string;
  layerType?: LayerType;
  targetId?: string;
  targetIndex?: number;
  magnitude?: number;
  polarity?: number;
  timestamp?: number;
}

/** Internal state container for smoothing. */
class ParameterValue {
  private bias = 0;
  private targetBias = 0;
  private damping: number;
  private min: number | undefined;
  private max: number | undefined;
  private readonly epsilon = 1e-4;

  constructor(damping = 8) {
    this.damping = damping;
  }

  setTarget(bias: number, options: { damping?: number; curve?: ParameterCurve; min?: number; max?: number } = {}): boolean {
    const { damping, curve, min, max } = options;
    if (typeof damping === 'number' && damping > 0) {
      this.damping = damping;
    }

    this.min = min;
    this.max = max;
    this.targetBias = bias;

    if (curve === 'immediate') {
      const changed = Math.abs(this.bias - bias) > this.epsilon;
      this.bias = bias;
      this.targetBias = bias;
      return changed;
    }

    return Math.abs(this.targetBias - this.bias) > this.epsilon;
  }

  step(delta: number): boolean {
    if (Math.abs(this.bias - this.targetBias) <= this.epsilon) {
      this.bias = this.targetBias;
      return false;
    }

    const alpha = 1 - Math.exp(-delta * this.damping);
    const previous = this.bias;
    this.bias += (this.targetBias - this.bias) * alpha;

    if (Math.abs(this.bias - this.targetBias) <= this.epsilon) {
      this.bias = this.targetBias;
    }

    return Math.abs(previous - this.bias) > this.epsilon;
  }

  compute(base: number): number {
    let value = base + this.bias;
    if (typeof this.min === 'number') {
      value = Math.max(this.min, value);
    }
    if (typeof this.max === 'number') {
      value = Math.min(this.max, value);
    }
    return value;
  }
}

const GEOMETRY_KEYS: (keyof VIB3GeometryParams)[] = [
  'geometry',
  'morph',
  'chaos',
  'density',
  'hue',
  'noiseFreq',
  'dispAmp',
  'timeScale',
  'beatPhase'
];

interface ParsedTarget {
  domain: 'geometry' | 'aux';
  key: string;
}

function parseTarget(target: string): ParsedTarget {
  if (target.startsWith('geometry.')) {
    return { domain: 'geometry', key: target.slice('geometry.'.length) };
  }
  if (target.startsWith('aux.')) {
    return { domain: 'aux', key: target.slice('aux.'.length) };
  }
  return { domain: 'aux', key: target };
}

function computeBias(relationship: ParameterRelationship, intensity: number, weight: number): number {
  const signed = intensity * weight;
  switch (relationship) {
    case 'linear':
      return signed;
    case 'inverse':
      return -Math.abs(intensity) * Math.sign(weight || 1);
    case 'exponential':
      return Math.sign(weight || 1) * (Math.exp(Math.abs(intensity) * Math.abs(weight)) - 1);
    case 'logarithmic':
      return Math.sign(weight || 1) * Math.log(1 + Math.abs(intensity * weight));
    default:
      return signed;
  }
}

interface LayerState {
  values: Map<string, ParameterValue>;
}

/**
 * Maintains parameter relationships and smoothing logic.
 */
class ParameterWeb {
  private readonly cascades: ParameterCascadeDefinition;
  private readonly layerState = new Map<LayerType, LayerState>();
  private readonly auxState = new Map<string, ParameterValue>();
  private readonly pendingTimeouts = new Set<number>();
  private changeListener?: () => void;

  constructor(cascades: ParameterCascadeDefinition) {
    this.cascades = cascades;
  }

  setChangeListener(listener: () => void) {
    this.changeListener = listener;
  }

  dispose() {
    if (typeof window !== 'undefined') {
      this.pendingTimeouts.forEach((handle) => window.clearTimeout(handle));
    }
    this.pendingTimeouts.clear();
  }

  trigger(trigger: string, context: ParameterCascadeContext = {}): void {
    const influences = this.cascades[trigger];
    if (!influences || influences.length === 0) {
      return;
    }

    let changed = false;
    influences.forEach((influence) => {
      const layer = influence.layer ?? context.layerType ?? 'content';
      const polarity = context.polarity ?? influence.polarity ?? 1;
      const magnitude = context.magnitude ?? 1;
      const weight = polarity * magnitude;
      const bias = computeBias(influence.relationship, influence.intensity, weight);
      const applyInfluence = () => {
        const parsed = parseTarget(influence.target);
        if (parsed.domain === 'geometry') {
          const layerKey = layer;
          const state = this.ensureLayer(layerKey);
          const key = parsed.key as keyof VIB3GeometryParams;
          if (!GEOMETRY_KEYS.includes(key)) {
            return false;
          }
          const value = this.ensureValue(state.values, parsed.key);
          const influenceChanged = value.setTarget(bias, {
            damping: influence.damping,
            curve: influence.curve,
            min: influence.min,
            max: influence.max,
          });
          if (influenceChanged) {
            changed = true;
          }
          return influenceChanged;
        }
        const auxValue = this.ensureValue(this.auxState, parsed.key);
        const auxChanged = auxValue.setTarget(bias, {
          damping: influence.damping,
          curve: influence.curve,
          min: influence.min,
          max: influence.max,
        });
        if (auxChanged) {
          changed = true;
        }
        return auxChanged;
      };

      if (influence.delay && influence.delay > 0 && typeof window !== 'undefined') {
        const handle = window.setTimeout(() => {
          this.pendingTimeouts.delete(handle);
          const applied = applyInfluence();
          if (applied) {
            this.emitChange();
          }
        }, influence.delay);
        this.pendingTimeouts.add(handle);
      } else {
        const applied = applyInfluence();
        if (applied) {
          this.emitChange();
        }
      }
    });

  }

  step(delta: number): boolean {
    let changed = false;
    this.layerState.forEach((state) => {
      state.values.forEach((value) => {
        if (value.step(delta)) {
          changed = true;
        }
      });
    });
    this.auxState.forEach((value) => {
      if (value.step(delta)) {
        changed = true;
      }
    });

    if (changed) {
      this.emitChange();
    }
    return changed;
  }

  applyTo(base: VIB3GeometryParams, context: ParameterCascadeContext = {}): VIB3GeometryParams {
    const layer = context.layerType ?? 'content';
    const state = this.ensureLayer(layer);
    const result: VIB3GeometryParams = { ...base };

    state.values.forEach((value, key) => {
      const paramKey = key as keyof VIB3GeometryParams;
      if (!GEOMETRY_KEYS.includes(paramKey)) {
        return;
      }
      const computed = value.compute(base[paramKey]);
      if (paramKey === 'geometry') {
        result[paramKey] = Math.max(0, Math.round(computed));
      } else if (paramKey === 'density' || paramKey === 'chaos' || paramKey === 'dispAmp' || paramKey === 'hue' || paramKey === 'beatPhase') {
        result[paramKey] = clamp01(computed);
      } else {
        result[paramKey] = computed;
      }
    });

    return result;
  }

  getAuxValue(key: string, base = 0): number {
    const value = this.auxState.get(key);
    return value ? value.compute(base) : base;
  }

  private ensureLayer(layer: LayerType): LayerState {
    let state = this.layerState.get(layer);
    if (!state) {
      state = { values: new Map() };
      this.layerState.set(layer, state);
    }
    return state;
  }

  private ensureValue(map: Map<string, ParameterValue>, key: string): ParameterValue {
    let value = map.get(key);
    if (!value) {
      value = new ParameterValue();
      map.set(key, value);
    }
    return value;
  }

  private emitChange() {
    this.changeListener?.();
  }
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

/** Default geometry selection for the five layers. */
const LAYER_GEOMETRY: Record<LayerType, number> = {
  background: 1,
  shadow: 4,
  content: 2,
  highlight: 5,
  accent: 6,
};

interface MapOptions {
  layerType: LayerType;
  sectionConfig: SectionConfig;
}

function mapParamsToGeometry(params: Params, options: MapOptions): VIB3GeometryParams {
  const { layerType } = options;
  const geometryIndex = LAYER_GEOMETRY[layerType] ?? 0;
  const densityScale = layerType === 'background' ? 0.7 : layerType === 'accent' ? 0.5 : 1.0;
  const chaosScale = layerType === 'shadow' ? 0.8 : layerType === 'highlight' ? 1.2 : 1.0;

  return {
    geometry: geometryIndex,
    morph: params.morph,
    chaos: clamp01(params.chaos * chaosScale),
    density: clamp01(params.density * densityScale),
    hue: clamp01(params.hue),
    noiseFreq: params.noiseFreq,
    dispAmp: clamp01(params.dispAmp),
    timeScale: params.timeScale,
    beatPhase: clamp01(params.beatPhase),
  };
}

export interface VIB3HomeMasterConfig {
  cascades?: ParameterCascadeDefinition;
  homeParams?: Partial<Params>;
}

/**
 * Hybrid Foundation parameter authority integrating cascades and consciousness.
 */
export class VIB3HomeMaster {
  private homeParams: Params;
  private readonly parameterWeb: ParameterWeb;
  private readonly listeners = new Set<() => void>();
  private revision = 0;
  private rafHandle: number | null = null;
  private lastFrame = 0;
  public readonly consciousness: VisualConsciousnessSystem;

  constructor(config: VIB3HomeMasterConfig = {}) {
    this.homeParams = { ...DEFAULT_HOME_PARAMS, ...config.homeParams };
    this.parameterWeb = new ParameterWeb(config.cascades ?? createDefaultParameterWebDefinition());
    this.parameterWeb.setChangeListener(() => this.notifyChange());
    this.consciousness = new VisualConsciousnessSystem();
  }

  getParameterWeb(): ParameterWeb {
    return this.parameterWeb;
  }

  getConsciousness(): VisualConsciousnessSystem {
    return this.consciousness;
  }

  updateHomeParams(partial: Partial<Params>) {
    this.homeParams = { ...this.homeParams, ...partial };
    this.notifyChange();
  }

  deriveParameters(sectionId: string, layerType: LayerType): VIB3GeometryParams {
    const sectionConfig = SECTION_CONFIGS[sectionId] ?? SECTION_CONFIGS.home;
    const derived = deriveParams(this.homeParams, sectionConfig.offsets);
    const baseGeometry = mapParamsToGeometry(derived, { layerType, sectionConfig });
    const cascaded = this.parameterWeb.applyTo(baseGeometry, { sectionId, layerType });
    this.consciousness.observe(sectionId, layerType, cascaded);
    return cascaded;
  }

  triggerParameterCascade(trigger: string, context: ParameterCascadeContext = {}) {
    this.parameterWeb.trigger(trigger, context);
  }

  getAuxValue(key: string, base = 0): number {
    return this.parameterWeb.getAuxValue(key, base);
  }

  start() {
    if (typeof window === 'undefined' || this.rafHandle !== null) {
      return;
    }
    const loop = (timestamp: number) => {
      if (this.lastFrame === 0) {
        this.lastFrame = timestamp;
      }
      const delta = Math.max(0, (timestamp - this.lastFrame) / 1000);
      this.lastFrame = timestamp;
      const changed = this.parameterWeb.step(delta);
      this.consciousness.step(delta);
      if (changed) {
        this.notifyChange();
      }
      this.rafHandle = window.requestAnimationFrame(loop);
    };
    this.rafHandle = window.requestAnimationFrame(loop);
  }

  stop() {
    if (typeof window === 'undefined') {
      return;
    }
    if (this.rafHandle !== null) {
      window.cancelAnimationFrame(this.rafHandle);
      this.rafHandle = null;
    }
    this.lastFrame = 0;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot = (): number => this.revision;

  dispose() {
    this.stop();
    this.parameterWeb.dispose();
    this.listeners.clear();
  }

  private notifyChange() {
    this.revision += 1;
    this.listeners.forEach((listener) => listener());
  }
}

/**
 * Provides the default cascade configuration inspired by the legacy system.
 */
export function createDefaultParameterWebDefinition(): ParameterCascadeDefinition {
  return {
    cardHoverTarget: [
      {
        target: 'geometry.morph',
        relationship: 'linear',
        intensity: 0.28,
        curve: 'easeOut',
        damping: 9,
      },
      {
        target: 'geometry.density',
        relationship: 'linear',
        intensity: 0.18,
        curve: 'easeOut',
        damping: 6,
        max: 1,
      },
      {
        target: 'aux.otherCards.opacity',
        relationship: 'inverse',
        intensity: 0.6,
        curve: 'easeInOut',
        min: 0.15,
        max: 1,
      },
    ],
    cardHoverSibling: [
      {
        target: 'geometry.density',
        relationship: 'inverse',
        intensity: 0.2,
        curve: 'easeOut',
        damping: 5,
        min: 0.05,
      },
      {
        target: 'geometry.chaos',
        relationship: 'linear',
        intensity: 0.12,
        curve: 'easeIn',
        damping: 7,
      },
    ],
    cardFocus: [
      {
        target: 'geometry.timeScale',
        relationship: 'linear',
        intensity: 0.35,
        curve: 'easeInOut',
        damping: 4,
      },
      {
        target: 'geometry.dispAmp',
        relationship: 'exponential',
        intensity: 0.12,
        curve: 'easeInOut',
      },
    ],
    cardFocusRelease: [
      {
        target: 'geometry.timeScale',
        relationship: 'inverse',
        intensity: 0.3,
        curve: 'easeOut',
        damping: 4,
      },
      {
        target: 'geometry.dispAmp',
        relationship: 'inverse',
        intensity: 0.2,
        curve: 'easeOut',
      },
    ],
    realityInversion: [
      {
        target: 'geometry.hue',
        relationship: 'linear',
        intensity: 0.2,
        curve: 'immediate',
      },
      {
        target: 'geometry.chaos',
        relationship: 'exponential',
        intensity: 0.25,
        curve: 'easeIn',
        damping: 10,
      },
      {
        target: 'geometry.beatPhase',
        relationship: 'linear',
        intensity: 0.5,
        curve: 'immediate',
      },
    ],
    idleFlux: [
      {
        target: 'geometry.morph',
        relationship: 'logarithmic',
        intensity: 0.08,
        curve: 'easeInOut',
        damping: 3,
      },
      {
        target: 'geometry.chaos',
        relationship: 'logarithmic',
        intensity: 0.05,
        curve: 'easeInOut',
        damping: 3,
      },
    ],
  };
}
