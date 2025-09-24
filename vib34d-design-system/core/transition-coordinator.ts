import { VisualizerInstance, VisualizerComputedState, TransitionSession } from './types';
import { VisualizerUpdateMap } from './interaction-coordinator';

interface TransitionPhaseDefinition {
  name: string;
  start: number;
  end: number;
  apply: (
    progress: number,
    state: VisualizerComputedState,
    base: VisualizerComputedState
  ) => void;
}

const OUTGOING_PHASES: TransitionPhaseDefinition[] = [
  {
    name: 'density_collapse',
    start: 0,
    end: 400,
    apply: (progress, state, base) => {
      state.gridDensity = parseFloat((base.gridDensity * (1 - progress)).toFixed(3));
    }
  },
  {
    name: 'color_fade_to_black',
    start: 200,
    end: 600,
    apply: (progress, state, base) => {
      state.colorIntensity = parseFloat((base.colorIntensity * (1 - progress)).toFixed(3));
    }
  },
  {
    name: 'geometry_dissolve',
    start: 400,
    end: 800,
    apply: (progress, state, base) => {
      state.scale = parseFloat((base.scale * (1 - progress * 0.3)).toFixed(3));
      state.blur = parseFloat((base.blur + progress * 1.5).toFixed(3));
      state.rotation = parseFloat((base.rotation + progress * Math.PI * 0.5).toFixed(3));
    }
  },
  {
    name: 'translucency_to_zero',
    start: 600,
    end: 1000,
    apply: (progress, state, base) => {
      state.translucency = parseFloat((base.translucency * (1 - progress)).toFixed(3));
    }
  }
];

const INCOMING_PHASES: TransitionPhaseDefinition[] = [
  {
    name: 'translucency_from_zero',
    start: 500,
    end: 900,
    apply: (progress, state, base) => {
      state.translucency = parseFloat((base.translucency * progress).toFixed(3));
    }
  },
  {
    name: 'geometry_crystallize',
    start: 700,
    end: 1100,
    apply: (progress, state, base) => {
      state.scale = parseFloat(((0.8 + progress * 0.2) * base.scale).toFixed(3));
      state.blur = parseFloat(Math.max(0, base.blur * (1 - progress)).toFixed(3));
      state.rotation = parseFloat((base.rotation - progress * Math.PI * 0.25).toFixed(3));
    }
  },
  {
    name: 'color_bloom',
    start: 900,
    end: 1300,
    apply: (progress, state, base) => {
      state.colorIntensity = parseFloat((base.colorIntensity * Math.min(1, progress * 1.1)).toFixed(3));
    }
  },
  {
    name: 'density_expansion',
    start: 1100,
    end: 1500,
    apply: (progress, state, base) => {
      state.gridDensity = parseFloat((base.gridDensity * progress).toFixed(3));
    }
  }
];

export const TRANSITION_BASE_DURATION = 1500;

export class TransitionCoordinator {
  private context: (TransitionSession & {
    outgoingBase: VisualizerComputedState;
    incomingBase: VisualizerComputedState;
    scale: number;
  }) | null = null;

  startTransition(
    outgoingId: string,
    incomingId: string,
    instances: Map<string, VisualizerInstance>,
    timestamp: number,
    durationMultiplier: number
  ) {
    const outgoing = instances.get(outgoingId);
    const incoming = instances.get(incomingId);

    if (!outgoing || !incoming) return null;

    const duration = TRANSITION_BASE_DURATION * durationMultiplier;

    this.context = {
      outgoingId,
      incomingId,
      startedAt: timestamp,
      duration,
      outgoingBase: JSON.parse(JSON.stringify(outgoing.baseState)),
      incomingBase: JSON.parse(JSON.stringify(incoming.baseState)),
      scale: duration / TRANSITION_BASE_DURATION
    };
  }

  private computeProgress(elapsed: number, start: number, end: number) {
    if (elapsed < start) return 0;
    if (elapsed > end) return 1;
    return (elapsed - start) / Math.max(1, end - start);
  }

  update(instances: Map<string, VisualizerInstance>, timestamp: number) {
    if (!this.context) return null;

    const { outgoingId, incomingId, startedAt, duration, outgoingBase, incomingBase, scale } = this.context;
    const elapsed = timestamp - startedAt;

    const outgoingInstance = instances.get(outgoingId);
    const incomingInstance = instances.get(incomingId);
    if (!outgoingInstance || !incomingInstance) return null;

    if (elapsed >= duration) {
      const updates: VisualizerUpdateMap = {
        [outgoingId]: {
          ...outgoingInstance.currentState,
          ...outgoingBase,
          lastUpdated: timestamp
        },
        [incomingId]: {
          ...incomingInstance.currentState,
          ...incomingBase,
          lastUpdated: timestamp
        }
      };
      this.context = null;
      return updates;
    }

    const outgoingState: VisualizerComputedState = {
      ...outgoingInstance.currentState
    };
    const incomingState: VisualizerComputedState = {
      ...incomingInstance.currentState
    };

    OUTGOING_PHASES.forEach((phase) => {
      const start = phase.start * scale;
      const end = phase.end * scale;
      const progress = this.computeProgress(elapsed, start, end);
      if (progress > 0) {
        phase.apply(progress, outgoingState, outgoingBase);
      }
    });

    INCOMING_PHASES.forEach((phase) => {
      const start = phase.start * scale;
      const end = phase.end * scale;
      const progress = this.computeProgress(elapsed, start, end);
      if (progress > 0) {
        phase.apply(progress, incomingState, incomingBase);
      }
    });

    const densityLoss = outgoingBase.gridDensity - outgoingState.gridDensity;
    incomingState.gridDensity = parseFloat((incomingBase.gridDensity + densityLoss).toFixed(3));

    const outgoingColorNormalized = outgoingBase.colorIntensity === 0 ? 0 : outgoingState.colorIntensity / outgoingBase.colorIntensity;
    const harmonicColor = Math.max(0, 1 - outgoingColorNormalized);
    incomingState.colorIntensity = parseFloat((incomingBase.colorIntensity * harmonicColor).toFixed(3));

    incomingState.rotation = parseFloat((-outgoingState.rotation).toFixed(3));

    outgoingState.sparkles = Math.round(outgoingInstance.currentState.sparkles * 0.5);
    incomingState.sparkles = Math.max(incomingInstance.currentState.sparkles, Math.round(elapsed / 200));

    outgoingState.lastUpdated = timestamp;
    incomingState.lastUpdated = timestamp;

    return {
      [outgoingId]: outgoingState,
      [incomingId]: incomingState
    } as VisualizerUpdateMap;
  }

  isActive() {
    return Boolean(this.context);
  }
}

export default TransitionCoordinator;
