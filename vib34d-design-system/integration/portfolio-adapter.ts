import type { VIB34DSystem, VIB34DState } from '../core/visualizer-engine';

export interface PortfolioProfile {
  cameraPath: string;
  lightingIntensity: number;
  accentHue: number;
  cardDepth: number;
}

export interface PortfolioAdapterOptions {
  onProfileChange?: (profile: PortfolioProfile, state: VIB34DState) => void;
}

export interface PortfolioAdapter {
  dispose(): void;
  getProfile(): PortfolioProfile;
}

function deriveCameraPath(state: VIB34DState): string {
  const base = state.visualizer.collectionName;
  switch (base) {
    case 'minimal':
      return 'orbital_low';
    case 'dense':
      return 'spiral_inward';
    case 'maximum':
      return 'quantum_jump';
    default:
      return 'standard_arc';
  }
}

function deriveLightingIntensity(state: VIB34DState): number {
  return Math.min(2.5, 1 + state.visualizer.density.base / 16 + state.visualizer.reactivity.mouse * 0.3);
}

function deriveAccentHue(state: VIB34DState): number {
  return Math.round((state.visualizer.density.base / 32 + state.visualizer.speed.base / 2) * 360) % 360;
}

function deriveCardDepth(state: VIB34DState): number {
  return 20 + state.visualizer.density.variation * 3 + state.customization.speedMultiplier * 10;
}

export function createPortfolioAdapter(system: VIB34DSystem, options: PortfolioAdapterOptions = {}): PortfolioAdapter {
  let lastState: VIB34DState = system.getState();

  const buildProfile = (state: VIB34DState): PortfolioProfile => ({
    cameraPath: deriveCameraPath(state),
    lightingIntensity: deriveLightingIntensity(state),
    accentHue: deriveAccentHue(state),
    cardDepth: deriveCardDepth(state)
  });

  let profile = buildProfile(lastState);

  const unsubscribe = system.subscribe((state) => {
    lastState = state;
    profile = buildProfile(state);
    options.onProfileChange?.(profile, state);
  });

  return {
    dispose() {
      unsubscribe();
    },
    getProfile() {
      return profile;
    }
  };
}

export default createPortfolioAdapter;
