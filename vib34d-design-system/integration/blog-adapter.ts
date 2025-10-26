import VisualizerEngine from '../core/visualizer-engine';
import { DesignSystemSelection } from '../core/types';

export interface BlogAdapterOptions {
  heroVisualizerId?: string;
  articleVisualizerId?: string;
}

export function createBlogAdapter(engine: VisualizerEngine, options: BlogAdapterOptions = {}) {
  const heroId = options.heroVisualizerId ?? 'blog-hero';
  const articleId = options.articleVisualizerId ?? 'blog-article';

  const register = () => {
    engine.registerVisualizer(heroId, {
      scale: 1.2,
      depthOffset: -4,
      translucency: 0.9
    });
    engine.registerVisualizer(articleId, {
      scale: 0.95,
      depthOffset: 2
    });
  };

  const unregister = () => {
    engine.unregisterVisualizer(heroId);
    engine.unregisterVisualizer(articleId);
  };

  const configureForArticle = (selection: Partial<DesignSystemSelection>) => {
    engine.setSelection(selection);
    engine.updateInstanceOverrides(articleId, {
      gridDensity: engine.getSnapshot().visualizers[articleId]?.gridDensity ?? 12,
      scale: 0.98
    });
  };

  return {
    mount: register,
    unmount: unregister,
    configureForArticle
  };
}

export default createBlogAdapter;
