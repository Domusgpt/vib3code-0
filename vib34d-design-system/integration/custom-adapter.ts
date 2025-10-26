import VisualizerEngine from '../core/visualizer-engine';
import { DesignSystemSelection, SectionConfiguration } from '../core/types';

export interface CustomAdapterConfig {
  selection?: Partial<DesignSystemSelection>;
  sections?: SectionConfiguration[];
}

export function applyCustomConfiguration(engine: VisualizerEngine, config: CustomAdapterConfig) {
  if (config.selection) {
    engine.setSelection(config.selection);
  }

  if (config.sections) {
    config.sections.forEach((section, index) => {
      const id = `custom-${index}`;
      engine.registerVisualizer(id, {
        scale: 0.9 + index * 0.05,
        gridDensity: 10 + section.items.length * 2,
        depthOffset: index * 2
      });
    });
  }
}

export default applyCustomConfiguration;
