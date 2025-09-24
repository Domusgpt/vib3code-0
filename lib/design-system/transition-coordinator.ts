import { CARD_TRANSITIONS_STATES, TRANSITION_COORDINATION } from './constants';
import {
  CardTransitionEntry,
  CardTransitionsDefinition,
  CoordinatedPhaseDefinition,
  DesignSystemAdvancedTuning,
} from './types';

export interface TransitionPhaseSchedule {
  phase: string;
  start: number;
  end: number;
}

const parseRange = (range: string): [number, number] => {
  const match = range.match(/([0-9.]+)ms-([0-9.]+)ms/);
  if (!match) return [0, 0];
  return [parseFloat(match[1]), parseFloat(match[2])];
};

const buildSchedule = (
  definition: CoordinatedPhaseDefinition,
  multiplier: number
): TransitionPhaseSchedule[] => {
  const phases: Array<['phase1' | 'phase2' | 'phase3' | 'phase4', string]> = [
    ['phase1', definition.phase1],
    ['phase2', definition.phase2],
    ['phase3', definition.phase3],
    ['phase4', definition.phase4],
  ];

  return phases.map(([key, label]) => {
    const range = definition.timing[key];
    const [start, end] = parseRange(range);
    return {
      phase: label,
      start: start * multiplier,
      end: end * multiplier,
    };
  });
};

export class TransitionCoordinator {
  constructor(
    private coordination = TRANSITION_COORDINATION,
    private cardTransitions: CardTransitionsDefinition = CARD_TRANSITIONS_STATES
  ) {}

  getOutgoingTimeline(tuning: DesignSystemAdvancedTuning): TransitionPhaseSchedule[] {
    return buildSchedule(
      this.coordination.outgoing,
      tuning.transitionDurationMultiplier
    );
  }

  getIncomingTimeline(tuning: DesignSystemAdvancedTuning): TransitionPhaseSchedule[] {
    return buildSchedule(
      this.coordination.incoming,
      tuning.transitionDurationMultiplier
    );
  }

  getCardTransition(type: 'emergence' | 'submersion', variant: string): CardTransitionEntry | undefined {
    return this.cardTransitions[type][variant];
  }

  describeMathematicalRelationship(): Record<string, string> {
    return this.coordination.mathematical_relationship;
  }
}

export const createTransitionCoordinator = () => new TransitionCoordinator();

