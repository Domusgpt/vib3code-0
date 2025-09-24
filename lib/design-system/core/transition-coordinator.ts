import { CARD_TRANSITIONS, TRANSITION_COORDINATION, TRANSITION_PRESETS } from '../presets/defaults';
import {
  CardTransitionSpec,
  CardTransitionVariant,
  DurationString,
  TransitionCoordinationSpec,
  TransitionPhaseTiming,
  TransitionPresetBank,
} from '../types';

const parsePhaseRange = (range: string): [number, number] => {
  const match = range.match(/([0-9.]+)ms-([0-9.]+)ms/);
  if (!match) {
    return [0, 0];
  }

  const start = parseFloat(match[1]);
  const end = parseFloat(match[2]);

  return [Number.isNaN(start) ? 0 : start, Number.isNaN(end) ? start : end];
};

const parseDuration = (duration: DurationString): number => {
  const value = parseFloat(duration.replace('ms', ''));
  return Number.isNaN(value) ? 0 : value;
};

export class TransitionCoordinator {
  constructor(
    private readonly coordination: TransitionCoordinationSpec = TRANSITION_COORDINATION,
    private readonly cardTransitions: CardTransitionSpec = CARD_TRANSITIONS,
    private readonly presets: TransitionPresetBank = TRANSITION_PRESETS,
  ) {}

  getOutgoingPhases(multiplier = 1): TransitionPhaseTiming[] {
    const { phase1, phase2, phase3, phase4, timing } = this.coordination.outgoing;
    const map: [string, string][] = [
      [phase1, timing.phase1],
      [phase2, timing.phase2],
      [phase3, timing.phase3],
      [phase4, timing.phase4],
    ];

    return map.map(([phase, time]) => {
      const [start, end] = parsePhaseRange(time);
      return {
        phase,
        start: start * multiplier,
        end: end * multiplier,
      };
    });
  }

  getIncomingPhases(multiplier = 1): TransitionPhaseTiming[] {
    const { phase1, phase2, phase3, phase4, timing } = this.coordination.incoming;
    const map: [string, string][] = [
      [phase1, timing.phase1],
      [phase2, timing.phase2],
      [phase3, timing.phase3],
      [phase4, timing.phase4],
    ];

    return map.map(([phase, time]) => {
      const [start, end] = parsePhaseRange(time);
      return {
        phase,
        start: start * multiplier,
        end: end * multiplier,
      };
    });
  }

  getCardTransition(
    mode: 'emergence' | 'submersion',
    variant: string,
    multiplier = 1,
  ): (CardTransitionVariant & { durationMs: number }) | null {
    const transitions = this.cardTransitions[mode] as Record<string, CardTransitionVariant | undefined>;
    const config = transitions[variant];
    if (!config) {
      return null;
    }
    const duration = parseDuration(config.duration) * multiplier;

    return {
      ...config,
      durationMs: duration,
    };
  }

  getPageTransitionPreset(key: string, multiplier = 1) {
    const preset = this.presets.page_transitions[key];
    if (!preset) {
      return null;
    }

    return {
      ...preset,
      overlapMs: parseDuration(preset.overlap) * multiplier,
    };
  }

  getCardTransitionPreset(key: string, multiplier = 1) {
    const preset = this.presets.card_transitions[key];
    if (!preset) {
      return null;
    }

    return {
      ...preset,
      durationMs: parseDuration(preset.duration) * multiplier,
    };
  }

  getMathematicalRelationships() {
    return this.coordination.mathematical_relationship;
  }
}
