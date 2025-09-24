import VisualizerEngine from '../core/visualizer-engine';

export interface PortfolioAdapterOptions {
  heroId?: string;
  projectId?: string;
  spotlightId?: string;
}

export function createPortfolioAdapter(engine: VisualizerEngine, options: PortfolioAdapterOptions = {}) {
  const heroId = options.heroId ?? 'portfolio-hero';
  const projectId = options.projectId ?? 'portfolio-project';
  const spotlightId = options.spotlightId ?? 'portfolio-spotlight';

  const register = () => {
    engine.registerVisualizer(heroId, {
      scale: 1.4,
      depthOffset: -6,
      gridDensity: 18
    });
    engine.registerVisualizer(projectId, {
      scale: 1,
      depthOffset: -2,
      gridDensity: 12
    });
    engine.registerVisualizer(spotlightId, {
      scale: 0.85,
      depthOffset: 3,
      colorIntensity: 1.3
    });
  };

  const unmount = () => {
    engine.unregisterVisualizer(heroId);
    engine.unregisterVisualizer(projectId);
    engine.unregisterVisualizer(spotlightId);
  };

  const focusProject = (index: number) => {
    const baseScale = 1 + index * 0.05;
    engine.updateInstanceOverrides(projectId, {
      scale: baseScale,
      gridDensity: 12 + index * 2,
      colorIntensity: 1 + index * 0.1
    });
  };

  return {
    mount: register,
    unmount,
    focusProject
  };
}

export default createPortfolioAdapter;
