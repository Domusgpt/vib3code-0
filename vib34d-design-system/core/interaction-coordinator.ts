import {
  HoverResponsePattern,
  ClickResponsePattern,
  VisualizerInstance,
  VisualizerComputedState,
  InteractionStateSnapshot
} from './types';

const baseHoverPattern: HoverResponsePattern = {
  target: {
    gridDensityMultiplier: 2,
    colorIntensityMultiplier: 1.5,
    reactivityMultiplier: 1.3,
    depthOffset: 10
  },
  others: {
    gridDensityMultiplier: 0.5,
    colorIntensityMultiplier: 0.8,
    reactivityMultiplier: 0.7,
    depthOffset: -5
  },
  transition: {
    duration: 300,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    stagger: 50
  }
};

const baseClickPattern: ClickResponsePattern = {
  inversionDuration: 2000,
  decayDuration: 500,
  sparkleDuration: 1500,
  sparkleCount: 8
};

const SCROLL_MOMENTUM_DURATION = 600;
const SCROLL_DECAY_DURATION = 500;

export type VisualizerUpdateMap = Record<string, VisualizerComputedState>;

export class InteractionCoordinator {
  private hoverPattern = baseHoverPattern;
  private clickPattern = baseClickPattern;

  private state: InteractionStateSnapshot | null = null;
  private clickEndAt: number | null = null;
  private clickDecayEndAt: number | null = null;
  private sparkleEndAt: number | null = null;
  private clickSnapshot: VisualizerUpdateMap | null = null;

  private scrollEndAt: number | null = null;
  private scrollDecayEndAt: number | null = null;
  private scrollSnapshot: VisualizerUpdateMap | null = null;

  getState() {
    return this.state;
  }

  applyHover(targetId: string, instances: VisualizerInstance[], timestamp: number): VisualizerUpdateMap {
    this.state = {
      type: 'hover',
      targetId,
      intensity: 1,
      startedAt: timestamp
    };

    const updates: VisualizerUpdateMap = {};

    instances.forEach((instance, index) => {
      const pattern = instance.id === targetId ? this.hoverPattern.target : this.hoverPattern.others;
      const base = instance.baseState;
      const current = instance.currentState;

      updates[instance.id] = {
        ...current,
        gridDensity: parseFloat((base.gridDensity * pattern.gridDensityMultiplier).toFixed(3)),
        colorIntensity: parseFloat((base.colorIntensity * pattern.colorIntensityMultiplier).toFixed(3)),
        reactivity: {
          mouse: parseFloat((base.reactivity.mouse * pattern.reactivityMultiplier).toFixed(3)),
          click: parseFloat((base.reactivity.click * pattern.reactivityMultiplier).toFixed(3)),
          scroll: parseFloat((base.reactivity.scroll * pattern.reactivityMultiplier).toFixed(3))
        },
        depthOffset: base.depthOffset + pattern.depthOffset,
        lastUpdated: timestamp + index * this.hoverPattern.transition.stagger
      };
    });

    return updates;
  }

  clearHover(instances: VisualizerInstance[], timestamp: number) {
    if (this.state?.type !== 'hover') return null;
    this.state = null;

    const updates: VisualizerUpdateMap = {};
    instances.forEach((instance) => {
      updates[instance.id] = {
        ...instance.currentState,
        gridDensity: instance.baseState.gridDensity,
        colorIntensity: instance.baseState.colorIntensity,
        reactivity: { ...instance.baseState.reactivity },
        depthOffset: instance.baseState.depthOffset,
        lastUpdated: timestamp
      };
    });

    return updates;
  }

  applyClick(instances: VisualizerInstance[], timestamp: number) {
    this.state = {
      type: 'click',
      intensity: 1,
      startedAt: timestamp
    };

    this.clickEndAt = timestamp + this.clickPattern.inversionDuration;
    this.clickDecayEndAt = this.clickEndAt + this.clickPattern.decayDuration;
    this.sparkleEndAt = timestamp + this.clickPattern.sparkleDuration;

    const updates: VisualizerUpdateMap = {};

    instances.forEach((instance) => {
      const base = instance.baseState;
      const current = instance.currentState;

      const minDensity = Math.max(1, base.gridDensity - (base.gridVariance ?? base.gridDensity * 0.5));
      const maxDensity = base.gridDensity + (base.gridVariance ?? base.gridDensity * 0.5);
      const normalizedDensity = Math.min(1, Math.max(0, (current.gridDensity - minDensity) / Math.max(0.001, maxDensity - minDensity)));
      const invertedDensity = minDensity + (1 - normalizedDensity) * (maxDensity - minDensity);

      const invertedSpeed = -Math.abs(current.animationSpeed || base.animationSpeed || 0);

      updates[instance.id] = {
        ...current,
        gridDensity: parseFloat(invertedDensity.toFixed(3)),
        colorIntensity: parseFloat((Math.max(0, 2 * base.colorIntensity - current.colorIntensity)).toFixed(3)),
        animationSpeed: parseFloat(invertedSpeed.toFixed(3)),
        reactivity: { ...current.reactivity },
        isInverted: true,
        rippleActive: true,
        sparkles: this.clickPattern.sparkleCount,
        lastUpdated: timestamp
      };
    });

    this.clickSnapshot = updates;

    return updates;
  }

  applyScroll(direction: 'up' | 'down', velocity: number, instances: VisualizerInstance[], timestamp: number) {
    const intensity = Math.min(1, Math.abs(velocity));
    this.state = {
      type: 'scroll',
      intensity,
      startedAt: timestamp
    };

    this.scrollEndAt = timestamp + SCROLL_MOMENTUM_DURATION;
    this.scrollDecayEndAt = this.scrollEndAt + SCROLL_DECAY_DURATION;

    const updates: VisualizerUpdateMap = {};

    instances.forEach((instance) => {
      const base = instance.baseState;
      const current = instance.currentState;
      const densityDelta = (base.gridVariance ?? base.gridDensity * 0.5) * 0.1 * intensity;
      const directionMultiplier = direction === 'up' ? 1 : -1;

      const newDensity = base.gridDensity + densityDelta * directionMultiplier;
      const newSpeed = base.animationSpeed + velocity * 0.1;

      updates[instance.id] = {
        ...current,
        gridDensity: parseFloat(Math.max(1, newDensity).toFixed(3)),
        animationSpeed: parseFloat(newSpeed.toFixed(3)),
        rippleActive: intensity > 0.6,
        sparkles: Math.max(current.sparkles, Math.round(intensity * 4)),
        lastUpdated: timestamp
      };
    });

    this.scrollSnapshot = updates;

    return updates;
  }

  update(instances: VisualizerInstance[], timestamp: number) {
    if (this.state?.type === 'click' && this.clickEndAt) {
      if (timestamp >= this.clickDecayEndAt!) {
        const updates: VisualizerUpdateMap = {};
        instances.forEach((instance) => {
          updates[instance.id] = {
            ...instance.currentState,
            gridDensity: instance.baseState.gridDensity,
            colorIntensity: instance.baseState.colorIntensity,
            animationSpeed: instance.baseState.animationSpeed,
            reactivity: { ...instance.baseState.reactivity },
            isInverted: false,
            rippleActive: false,
            sparkles: 0,
            lastUpdated: timestamp
          };
        });
        this.state = null;
        this.clickEndAt = null;
        this.clickDecayEndAt = null;
        this.sparkleEndAt = null;
        this.clickSnapshot = null;
        return updates;
      }

      if (timestamp >= this.clickEndAt) {
        const updates: VisualizerUpdateMap = {};
        const decayProgress = Math.min(1, (timestamp - this.clickEndAt) / this.clickPattern.decayDuration);

        instances.forEach((instance) => {
          const base = instance.baseState;
          const inverted = this.clickSnapshot?.[instance.id] ?? instance.currentState;
          updates[instance.id] = {
            ...instance.currentState,
            gridDensity: parseFloat((inverted.gridDensity + (base.gridDensity - inverted.gridDensity) * decayProgress).toFixed(3)),
            colorIntensity: parseFloat((inverted.colorIntensity + (base.colorIntensity - inverted.colorIntensity) * decayProgress).toFixed(3)),
            animationSpeed: parseFloat((inverted.animationSpeed + (base.animationSpeed - inverted.animationSpeed) * decayProgress).toFixed(3)),
            reactivity: { ...base.reactivity },
            isInverted: decayProgress < 0.99,
            rippleActive: false,
            sparkles: timestamp > (this.sparkleEndAt ?? 0) ? 0 : inverted.sparkles,
            lastUpdated: timestamp
          };
        });

        return updates;
      }

      if (this.sparkleEndAt && timestamp > this.sparkleEndAt) {
        const updates: VisualizerUpdateMap = {};
        instances.forEach((instance) => {
          updates[instance.id] = {
            ...instance.currentState,
            sparkles: 0,
            rippleActive: false,
            lastUpdated: timestamp
          };
        });
        this.sparkleEndAt = null;
        return updates;
      }
    }

    if (this.state?.type === 'scroll' && this.scrollEndAt) {
      if (timestamp >= this.scrollDecayEndAt!) {
        const updates: VisualizerUpdateMap = {};
        instances.forEach((instance) => {
          updates[instance.id] = {
            ...instance.currentState,
            gridDensity: instance.baseState.gridDensity,
            animationSpeed: instance.baseState.animationSpeed,
            sparkles: Math.floor(instance.currentState.sparkles * 0.5),
            rippleActive: false,
            lastUpdated: timestamp
          };
        });
        this.state = null;
        this.scrollEndAt = null;
        this.scrollDecayEndAt = null;
        this.scrollSnapshot = null;
        return updates;
      }

      if (timestamp >= this.scrollEndAt) {
        const progress = Math.min(1, (timestamp - this.scrollEndAt) / SCROLL_DECAY_DURATION);
        const updates: VisualizerUpdateMap = {};
        instances.forEach((instance) => {
          const base = instance.baseState;
          const scrollState = this.scrollSnapshot?.[instance.id] ?? instance.currentState;
          updates[instance.id] = {
            ...instance.currentState,
            gridDensity: parseFloat((scrollState.gridDensity + (base.gridDensity - scrollState.gridDensity) * progress).toFixed(3)),
            animationSpeed: parseFloat((scrollState.animationSpeed + (base.animationSpeed - scrollState.animationSpeed) * progress).toFixed(3)),
            sparkles: Math.round(scrollState.sparkles * (1 - progress)),
            rippleActive: progress < 0.95,
            lastUpdated: timestamp
          };
        });
        return updates;
      }
    }

    return null;
  }
}

export default InteractionCoordinator;
