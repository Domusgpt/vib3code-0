import type {
  CardTransitionPreset,
  PageTransitionPreset
} from './preset-manager';

interface PhaseDefinition {
  name: string;
  descriptor: string;
  start: number;
  end: number;
}

export interface TransitionPhase {
  name: string;
  descriptor: string;
  start: number;
  end: number;
}

export interface CoordinatedTransition {
  outgoing: TransitionPhase[];
  incoming: TransitionPhase[];
  relationships: {
    densityConservation: string;
    colorHarmonic: string;
    geometricMorphing: string;
  };
  pagePreset: PageTransitionPreset;
}

export interface CardTransitionPhase {
  property: string;
  from: string | number;
  to: string | number;
  duration: number;
}

export interface CardTransitionSequence {
  variant: string;
  direction: 'emergence' | 'submersion';
  phases: CardTransitionPhase[];
}

const BASE_COORDINATION: {
  outgoing: PhaseDefinition[];
  incoming: PhaseDefinition[];
  relationships: {
    densityConservation: string;
    colorHarmonic: string;
    geometricMorphing: string;
  };
} = {
  outgoing: [
    { name: 'phase1', descriptor: 'density_collapse', start: 0, end: 400 },
    { name: 'phase2', descriptor: 'color_fade_to_black', start: 200, end: 600 },
    { name: 'phase3', descriptor: 'geometry_dissolve', start: 400, end: 800 },
    { name: 'phase4', descriptor: 'translucency_to_zero', start: 600, end: 1000 }
  ],
  incoming: [
    { name: 'phase1', descriptor: 'translucency_from_zero', start: 500, end: 900 },
    { name: 'phase2', descriptor: 'geometry_crystallize', start: 700, end: 1100 },
    { name: 'phase3', descriptor: 'color_bloom', start: 900, end: 1300 },
    { name: 'phase4', descriptor: 'density_expansion', start: 1100, end: 1500 }
  ],
  relationships: {
    densityConservation: 'outgoing_loss = incoming_gain',
    colorHarmonic: 'complementary_color_progression',
    geometricMorphing: 'shared_mathematical_transform'
  }
};

type CardVariantDefinition = {
  duration: number;
  [key: string]: string | number | { from: string | number; to: string | number } | number;
};

const CARD_TRANSITION_SYSTEM: Record<'emergence' | 'submersion', Record<string, CardVariantDefinition>> = {
  emergence: {
    from_background: {
      translucency: { from: 0, to: 0.8 },
      depth: { from: 'background_layer', to: 'foreground_layer' },
      scale: { from: 0.8, to: 1.0 },
      geometry_sync: 'background_visualizer_parameters',
      duration: 1200
    },
    from_center: {
      scale: { from: 0, to: 1.0 },
      rotation: { from: '360deg', to: '0deg' },
      blur: { from: '20px', to: '0px' },
      emergence_point: 'screen_center',
      duration: 800
    },
    edge_of_screen: {
      scale: { from: 0.6, to: 1.0 },
      translation: { from: 'edge_of_screen', to: 'layout_target' },
      blur: { from: '15px', to: '0px' },
      flow_state: 'fluid_morph_and_settle',
      duration: 1500
    }
  },
  submersion: {
    to_background: {
      translucency: { from: 0.8, to: 0 },
      depth: { from: 'foreground_layer', to: 'background_layer' },
      scale: { from: 1.0, to: 0.8 },
      geometry_sync: 'merge_with_background_visualizer',
      duration: 1000
    },
    to_center: {
      scale: { from: 1.0, to: 0 },
      rotation: { from: '0deg', to: '360deg' },
      blur: { from: '0px', to: '20px' },
      convergence_point: 'screen_center',
      duration: 600
    }
  }
} as const;

function cloneAndScalePhases(phases: readonly PhaseDefinition[], multiplier: number): TransitionPhase[] {
  return phases.map((phase) => ({
    ...phase,
    start: Math.round(phase.start * multiplier),
    end: Math.round(phase.end * multiplier)
  }));
}

function msStringToNumber(duration: string): number {
  const match = duration.match(/([\d.]+)ms/);
  return match ? parseFloat(match[1]) : 0;
}

export class TransitionCoordinator {
  private lastSequence?: CoordinatedTransition;

  buildPageTransition(pagePreset: PageTransitionPreset, durationMultiplier = 1): CoordinatedTransition {
    const outgoing = cloneAndScalePhases(BASE_COORDINATION.outgoing, durationMultiplier);
    const incoming = cloneAndScalePhases(BASE_COORDINATION.incoming, durationMultiplier);

    const sequence: CoordinatedTransition = {
      outgoing,
      incoming,
      relationships: {
        densityConservation: BASE_COORDINATION.relationships.densityConservation,
        colorHarmonic: BASE_COORDINATION.relationships.colorHarmonic,
        geometricMorphing: BASE_COORDINATION.relationships.geometricMorphing
      },
      pagePreset
    };

    this.lastSequence = sequence;
    return sequence;
  }

  getLastSequence(): CoordinatedTransition | undefined {
    return this.lastSequence;
  }

  buildCardTransition(direction: 'emergence' | 'submersion', variant: keyof typeof CARD_TRANSITION_SYSTEM['emergence'] | keyof typeof CARD_TRANSITION_SYSTEM['submersion'], preset: CardTransitionPreset, durationMultiplier = 1): CardTransitionSequence {
    const system = CARD_TRANSITION_SYSTEM[direction];
    const definition = system[String(variant)];
    if (!definition) {
      return {
        variant: String(variant),
        direction,
        phases: []
      };
    }

    const duration = msStringToNumber(preset.duration) || definition.duration;
    const scaledDuration = duration * durationMultiplier;

    const phases: CardTransitionPhase[] = Object.entries(definition)
      .filter(([key]) => key !== 'duration')
      .map(([property, value]) => {
        if (typeof value === 'string') {
          return {
            property,
            from: value,
            to: value,
            duration: scaledDuration
          };
        }

        if (typeof value === 'object' && 'from' in value && 'to' in value) {
          return {
            property,
            from: value.from,
            to: value.to,
            duration: scaledDuration
          };
        }

        return {
          property,
          from: value as string | number,
          to: value as string | number,
          duration: scaledDuration
        };
      });

    return {
      variant: String(variant),
      direction,
      phases
    };
  }
}
