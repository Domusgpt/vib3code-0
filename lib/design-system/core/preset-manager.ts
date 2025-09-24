/**
 * VIB34D Design System - Preset Manager
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 * "The Revolution Will Not be in a Structured Format"
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 * Runtime preset loading, validation, and hot swapping utility.
 */

import {
  PresetCategory,
  PresetCollection,
  PresetDefinition,
  VIB34DError
} from '@/lib/design-system/types/core';

type Loader = () => Promise<unknown>;

const LOADERS: Partial<Record<PresetCategory, Loader>> = {
  visualizer: () => import('../presets/visualizer.json'),
  interactions: () => import('../presets/interactions.json'),
  transitions: () => import('../presets/transitions.json')
};

const CATEGORY_SEQUENCE: PresetCategory[] = ['visualizer', 'interactions', 'transitions', 'effects'];

export const EMPTY_PRESET_COLLECTION: PresetCollection = {
  visualizer: [],
  interactions: [],
  transitions: [],
  effects: []
};

export class PresetManager {
  private readonly presets = new Map<PresetCategory, Map<string, PresetDefinition>>();
  private readonly listeners = new Set<(category: PresetCategory) => void>();
  private devReloadBound = false;

  constructor() {
    for (const category of CATEGORY_SEQUENCE) {
      this.presets.set(category, new Map());
    }
  }

  /** Load every preset bank and enable dev hot reload triggers. */
  async loadAllPresets(): Promise<void> {
    await Promise.all(CATEGORY_SEQUENCE.map((category) => this.loadCategory(category)));
    this.bindDevReload();
  }

  /** Load a specific preset category. */
  async loadCategory(category: PresetCategory): Promise<void> {
    const loader = LOADERS[category];
    const previous = new Map(this.presets.get(category) ?? []);
    if (!loader) { this.notify(category); return; }
    try {
      const moduleData = await loader();
      const record = this.validateRecord(category, this.extractModuleData(moduleData));
      const map = new Map<string, PresetDefinition>();
      for (const preset of Object.values(record)) map.set(preset.name, clonePreset(preset));
      this.presets.set(category, map);
      this.notify(category);
    } catch (error) {
      console.error('VIB34D PresetManager load failed:', category, error);
      if (previous.size === 0) {
        throw new VIB34DError('Failed to load preset category', 'PRESET_LOAD_FAILED', { category });
      }
      this.presets.set(category, previous);
    }
  }

  /** Retrieve a preset definition by name. */
  getPreset(category: PresetCategory, name: string): PresetDefinition {
    const map = this.presets.get(category);
    if (!map || !map.has(name)) {
      throw new VIB34DError('Preset not found', 'PRESET_NOT_FOUND', { category, name });
    }
    return clonePreset(map.get(name)!);
  }

  /** List presets for a category. */
  getPresets(category: PresetCategory): PresetDefinition[] {
    const map = this.presets.get(category);
    return map ? Array.from(map.values()).map(clonePreset) : [];
  }

  /** Provide a full preset snapshot for consumers. */
  getPresetCollection(): PresetCollection {
    return {
      visualizer: this.getPresets('visualizer'),
      interactions: this.getPresets('interactions'),
      transitions: this.getPresets('transitions'),
      effects: this.getPresets('effects')
    };
  }

  /** Resolve the first preset key for a category. */
  getDefaultPresetName(category: PresetCategory): string | null {
    const iterator = this.presets.get(category)?.keys().next();
    return iterator && !iterator.done ? iterator.value : null;
  }

  /** Register or override a preset at runtime. */
  registerCustomPreset(
    preset: PresetDefinition,
    options: { override?: boolean } = {}
  ): void {
    const validated = this.validateDefinition(preset.category, preset, preset.name);
    const map = this.presets.get(validated.category) ?? new Map<string, PresetDefinition>();
    if (!options.override && map.has(validated.name))
      throw new VIB34DError('Preset already exists', 'PRESET_EXISTS', {
        category: validated.category,
        name: validated.name
      });
    map.set(validated.name, clonePreset(validated));
    this.presets.set(validated.category, map);
    this.notify(validated.category);
  }

  /** Listen for preset collection updates. */
  subscribe(listener: (category: PresetCategory) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Clean up listeners and dev bindings. */
  dispose(): void {
    if (this.devReloadBound && typeof window !== 'undefined') {
      window.removeEventListener('vib34d:reload-presets', this.handleDevReload as EventListener);
      this.devReloadBound = false;
    }
    this.listeners.clear();
  }

  private notify(category: PresetCategory): void {
    for (const listener of this.listeners) listener(category);
  }

  private bindDevReload(): void {
    if (typeof window === 'undefined' || process.env.NODE_ENV === 'production' || this.devReloadBound) {
      return;
    }
    window.addEventListener('vib34d:reload-presets', this.handleDevReload as EventListener);
    this.devReloadBound = true;
  }

  private handleDevReload = (event: Event): void => {
    const category = this.parseReloadDetail(event);
    if (category) {
      void this.loadCategory(category);
    } else {
      void this.loadAllPresets();
    }
  };

  private parseReloadDetail(event: Event): PresetCategory | null {
    const detailCandidate = (event as { detail?: unknown }).detail;
    if (!isPlainObject(detailCandidate)) return null;
    const category = detailCandidate.category;
    return typeof category === 'string' && isPresetCategory(category) ? category : null;
  }

  private extractModuleData(moduleData: unknown): unknown {
    if (isPlainObject(moduleData) && 'default' in moduleData) {
      const value = (moduleData as { default?: unknown }).default;
      return typeof value === 'undefined' ? {} : value;
    }
    return moduleData ?? {};
  }

  private validateRecord(
    category: PresetCategory,
    data: unknown
  ): Record<string, PresetDefinition> {
    if (!isPlainObject(data)) {
      throw new VIB34DError('Invalid preset data structure', 'PRESET_INVALID', { category });
    }
    const record: Record<string, PresetDefinition> = {};
    for (const [key, value] of Object.entries(data)) record[key] = this.validateDefinition(category, value, key);
    return record;
  }

  private validateDefinition(
    category: PresetCategory,
    value: unknown,
    key: string
  ): PresetDefinition {
    if (!isPlainObject(value)) throw new VIB34DError('Invalid preset definition', 'PRESET_INVALID', { category, key });
    const { name, category: presetCategory, parameters, metadata } = value;
    if (typeof name !== 'string' || !name.trim()) throw new VIB34DError('Preset name missing', 'PRESET_INVALID', { category, key });
    if (typeof presetCategory !== 'string' || !isPresetCategory(presetCategory)) {
      throw new VIB34DError('Invalid preset category', 'PRESET_INVALID', { category, key });
    }
    if (presetCategory !== category) throw new VIB34DError('Preset category mismatch', 'PRESET_INVALID', { category, key });
    if (!isPlainObject(parameters)) throw new VIB34DError('Preset parameters invalid', 'PRESET_INVALID', { category, key });
    if (!isPlainObject(metadata)) throw new VIB34DError('Preset metadata invalid', 'PRESET_INVALID', { category, key });
    const { description, performance, complexity, tags } = metadata;
    if (typeof description !== 'string') throw new VIB34DError('Preset description missing', 'PRESET_INVALID', { category, key });
    if (performance !== 'low' && performance !== 'medium' && performance !== 'high')
      throw new VIB34DError('Preset performance invalid', 'PRESET_INVALID', { category, key });
    if (complexity !== 'simple' && complexity !== 'moderate' && complexity !== 'advanced')
      throw new VIB34DError('Preset complexity invalid', 'PRESET_INVALID', { category, key });
    if (!isStringArray(tags)) throw new VIB34DError('Preset tags invalid', 'PRESET_INVALID', { category, key });
    return {
      name,
      category,
      parameters: { ...parameters },
      metadata: {
        description,
        performance,
        complexity,
        tags: [...tags]
      }
    };
  }
}

function clonePreset(preset: PresetDefinition): PresetDefinition {
  return {
    name: preset.name,
    category: preset.category,
    parameters: { ...preset.parameters },
    metadata: {
      description: preset.metadata.description,
      performance: preset.metadata.performance,
      complexity: preset.metadata.complexity,
      tags: [...preset.metadata.tags]
    }
  };
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isPresetCategory(value: string): value is PresetCategory {
  return (CATEGORY_SEQUENCE as readonly string[]).includes(value);
}
