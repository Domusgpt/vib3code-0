import { CLICK_RESPONSE_PATTERN, HOVER_RESPONSE_PATTERN } from '../presets/defaults';
import {
  CardMetrics,
  CardVisualState,
  ClickEffectState,
  ClickResponsePattern,
  DesignSystemSettings,
  HoverResponsePattern,
  NumericOperation,
  DurationString,
} from '../types';

const parseNumericMultiplier = (operation: NumericOperation): number => {
  const match = operation.match(/(increase|decrease)_([0-9.]+)x/);
  if (!match) {
    return 1;
  }

  const [, action, value] = match;
  const numeric = parseFloat(value);
  if (Number.isNaN(numeric)) {
    return 1;
  }

  if (action === 'increase') {
    return numeric;
  }

  return numeric;
};

const parseDepthOffset = (operation: string): number => {
  const match = operation.match(/(lift_forward|push_back)_([0-9.]+)px/);
  if (!match) {
    return 0;
  }

  const [, action, value] = match;
  const numeric = parseFloat(value);
  if (Number.isNaN(numeric)) {
    return 0;
  }

  return action === 'lift_forward' ? numeric : -numeric;
};

const parseDuration = (duration: DurationString): number => {
  const numeric = parseFloat(duration.replace('ms', ''));
  return Number.isNaN(numeric) ? 0 : numeric;
};

const parseSparkles = (value: string): number => {
  const match = value.match(/([0-9]+)/);
  if (!match) {
    return 0;
  }
  const numeric = parseInt(match[1], 10);
  return Number.isNaN(numeric) ? 0 : numeric;
};

export interface HoverComputationResult {
  states: Record<string, Partial<CardVisualState>>;
  duration: number;
  easing: string;
  stagger: number;
}

export interface ClickComputationResult {
  state: Partial<CardVisualState>;
  effect: ClickEffectState;
}

const applyNumericOperation = (value: number, operation: NumericOperation): number => {
  const multiplier = parseNumericMultiplier(operation);
  return value * multiplier;
};

export class InteractionCoordinator {
  constructor(
    private readonly hoverPattern: HoverResponsePattern = HOVER_RESPONSE_PATTERN,
    private readonly clickPattern: ClickResponsePattern = CLICK_RESPONSE_PATTERN,
  ) {}

  computeHoverStates(
    targetId: string,
    cardOrder: string[],
    baseMetrics: Record<string, CardMetrics>,
    existing: Record<string, CardVisualState>,
    settings: DesignSystemSettings,
  ): HoverComputationResult {
    const duration = parseDuration(this.hoverPattern.transition.duration);
    const stagger = parseDuration(this.hoverPattern.transition.stagger);
    const easing = this.hoverPattern.transition.easing;

    const result: Record<string, Partial<CardVisualState>> = {};

    cardOrder.forEach((cardId, index) => {
      const base = baseMetrics[cardId] ?? existing[cardId]?.base;
      if (!base) {
        return;
      }

      const adjustments = cardId === targetId ? this.hoverPattern.target : this.hoverPattern.others;
      const multiplier = cardId === targetId ? settings.advanced.interaction_sensitivity : 1 / Math.max(settings.advanced.interaction_sensitivity, 0.1);

      const metrics: CardMetrics = {
        gridDensity: applyNumericOperation(base.gridDensity, adjustments.gridDensity) * multiplier,
        colorIntensity: applyNumericOperation(base.colorIntensity, adjustments.colorIntensity) * multiplier,
        reactivity: applyNumericOperation(base.reactivity, adjustments.reactivity) * settings.advanced.interaction_sensitivity,
        depth: base.depth + parseDepthOffset(adjustments.depth),
      };

      result[cardId] = {
        metrics,
        isTarget: cardId === targetId,
        animationDirection: existing[cardId]?.animationDirection ?? 1,
        lastInteraction: 'hover',
        transition: {
          duration,
          easing,
          delay: cardId === targetId ? 0 : index * stagger,
        },
      };
    });

    return {
      states: result,
      duration,
      easing,
      stagger,
    };
  }

  clearHover(
    cardOrder: string[],
    baseMetrics: Record<string, CardMetrics>,
  ): HoverComputationResult {
    const duration = parseDuration(this.hoverPattern.transition.duration);
    const easing = this.hoverPattern.transition.easing;
    const stagger = parseDuration(this.hoverPattern.transition.stagger);

    const result: Record<string, Partial<CardVisualState>> = {};

    cardOrder.forEach((cardId, index) => {
      const base = baseMetrics[cardId];
      if (!base) {
        return;
      }
      result[cardId] = {
        metrics: base,
        isTarget: false,
        lastInteraction: 'none',
        animationDirection: 1,
        transition: {
          duration,
          easing,
          delay: index * stagger,
        },
      };
    });

    return {
      states: result,
      duration,
      easing,
      stagger,
    };
  }

  computeClickState(
    cardId: string,
    current: CardVisualState | undefined,
    base: CardMetrics,
    settings: DesignSystemSettings,
  ): ClickComputationResult {
    const target = current ?? {
      id: cardId,
      base,
      metrics: base,
      transition: { duration: 0, easing: 'linear', delay: 0 },
      animationDirection: 1,
      isTarget: false,
      isInverted: false,
      lastInteraction: 'none',
    };

    const inversionDuration = parseDuration(this.clickPattern.duration.inversion) * settings.advanced.transition_duration_multiplier;
    const decayDuration = parseDuration(this.clickPattern.duration.decay) * settings.advanced.transition_duration_multiplier;
    const sparkleDuration = parseDuration(this.clickPattern.duration.sparkles) * settings.advanced.transition_duration_multiplier;
    const sparkleCount = parseSparkles(this.clickPattern.immediate.sparkleGeneration);

    const invertedMetrics: CardMetrics = {
      gridDensity: this.clickPattern.immediate.variableInversion.density === 'inverse_value'
        ? Math.max(0, 1 - target.metrics.gridDensity)
        : target.metrics.gridDensity,
      colorIntensity: this.clickPattern.immediate.variableInversion.intensity === 'flip_polarity'
        ? Math.max(0, 1 - target.metrics.colorIntensity)
        : target.metrics.colorIntensity,
      reactivity: this.clickPattern.immediate.variableInversion.speed === 'reverse_direction'
        ? -Math.abs(target.metrics.reactivity) * settings.advanced.global_speed_multiplier
        : target.metrics.reactivity,
      depth: target.metrics.depth,
    };

    const state: Partial<CardVisualState> = {
      metrics: invertedMetrics,
      isTarget: true,
      isInverted: true,
      lastInteraction: 'click',
      rippleEffect: this.clickPattern.immediate.rippleEffect,
      sparkles: sparkleCount,
      animationDirection: this.clickPattern.immediate.variableInversion.speed === 'reverse_direction' ? -1 : 1,
      transition: {
        duration: inversionDuration,
        easing: 'ease-out',
        delay: 0,
      },
    };

    const effect: ClickEffectState = {
      inversionDuration,
      decayDuration,
      sparkleDuration,
    };

    return {
      state,
      effect,
    };
  }
}
