'use client';

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import VisualizerEngine from './visualizer-engine';
import PresetManager, { PresetCategory } from './preset-manager';
import {
  DesignSystemSelection,
  VisualizerEngineSnapshot,
  SectionConfiguration,
  ContentItem
} from './types';

interface DesignSystemContextValue {
  engine: VisualizerEngine;
  snapshot: VisualizerEngineSnapshot;
  selection: DesignSystemSelection;
  options: {
    visualizer: ReturnType<PresetManager['getVisualizerPresetOptions']>;
    interactions: ReturnType<PresetManager['getInteractionPresetOptions']>;
    transitions: ReturnType<PresetManager['getTransitionPresetOptions']>;
  };
  setSelection: (update: Partial<DesignSystemSelection>) => void;
  triggerHover: (id: string) => void;
  clearHover: () => void;
  triggerClick: () => void;
  triggerScroll: (direction: 'up' | 'down', velocity: number) => void;
  startTransition: (outgoingId: string, incomingId: string) => void;
  createCustomPreset: (category: PresetCategory, name: string, preset: unknown) => void;
  exportPresetLibrary: () => Record<PresetCategory, Record<string, unknown>>;
  importPresetLibrary: (library: Partial<Record<PresetCategory, Record<string, unknown>>>) => void;
  resetCustomPresets: (category?: PresetCategory) => void;
  sections: SectionConfiguration[];
  addSection: () => void;
  updateSection: (id: string, update: Partial<SectionConfiguration>) => void;
  removeSection: (id: string) => void;
  addContentItem: (sectionId: string, item: ContentItem) => void;
  updateContentItem: (sectionId: string, itemId: string, update: Partial<ContentItem>) => void;
  removeContentItem: (sectionId: string, itemId: string) => void;
}

const DesignSystemContext = createContext<DesignSystemContextValue | null>(null);

const DEFAULT_SNAPSHOT: VisualizerEngineSnapshot = {
  visualizers: {},
  interactions: null,
  activeTransition: null
};

const DEFAULT_SECTIONS: SectionConfiguration[] = [
  {
    id: 'section-1',
    name: 'Article Grid',
    type: 'article_grid',
    scrolling: {
      enabled: true,
      scrollType: 'smooth',
      direction: 'vertical'
    },
    expansion: {
      enabled: true,
      trigger: 'click',
      size: '1.5x'
    },
    items: []
  }
];

export function DesignSystemProvider({ children }: { children: ReactNode }) {
  const presetManager = useMemo(() => new PresetManager(), []);
  const engine = useMemo(() => new VisualizerEngine(presetManager), [presetManager]);

  const [snapshot, setSnapshot] = useState<VisualizerEngineSnapshot>(DEFAULT_SNAPSHOT);
  const [selection, setSelectionState] = useState<DesignSystemSelection>(engine.getSelection());
  const [sections, setSections] = useState<SectionConfiguration[]>(DEFAULT_SECTIONS);

  useEffect(() => {
    const unsubscribe = engine.subscribe((nextSnapshot) => {
      setSnapshot(nextSnapshot);
      setSelectionState(engine.getSelection());
    });

    engine.registerVisualizer('primary-card');
    engine.registerVisualizer('secondary-card', { depthOffset: 4, scale: 0.9 });
    engine.registerVisualizer('accent-card', { depthOffset: -6, scale: 1.1 });

    let rafId = 0;
    const tick = () => {
      engine.tick();
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      unsubscribe();
      cancelAnimationFrame(rafId);
      engine.unregisterVisualizer('primary-card');
      engine.unregisterVisualizer('secondary-card');
      engine.unregisterVisualizer('accent-card');
    };
  }, [engine]);

  const addSection = () => {
    const newSection: SectionConfiguration = {
      id: `section-${sections.length + 1}`,
      name: `Section ${sections.length + 1}`,
      type: 'custom_layout',
      scrolling: {
        enabled: true,
        scrollType: 'smooth',
        direction: 'vertical'
      },
      expansion: {
        enabled: false,
        trigger: 'click',
        size: '1.5x'
      },
      items: []
    };
    setSections((prev) => [...prev, newSection]);
  };

  const updateSection = (id: string, update: Partial<SectionConfiguration>) => {
    setSections((prev) => prev.map((section) => (section.id === id ? { ...section, ...update } : section)));
  };

  const removeSection = (id: string) => {
    setSections((prev) => prev.filter((section) => section.id !== id));
  };

  const addContentItem = (sectionId: string, item: ContentItem) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, items: [...section.items, item] }
          : section
      )
    );
  };

  const updateContentItem = (sectionId: string, itemId: string, update: Partial<ContentItem>) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          items: section.items.map((item) => (item.id === itemId ? { ...item, ...update } : item))
        };
      })
    );
  };

  const removeContentItem = (sectionId: string, itemId: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, items: section.items.filter((item) => item.id !== itemId) }
          : section
      )
    );
  };

  const contextValue: DesignSystemContextValue = {
    engine,
    snapshot,
    selection,
    options: {
      visualizer: presetManager.getVisualizerPresetOptions(),
      interactions: presetManager.getInteractionPresetOptions(),
      transitions: presetManager.getTransitionPresetOptions()
    },
    setSelection: (update) => engine.setSelection(update),
    triggerHover: (id) => engine.triggerHover(id),
    clearHover: () => engine.clearHover(),
    triggerClick: () => engine.triggerClick(),
    triggerScroll: (direction, velocity) => engine.triggerScroll(direction, velocity),
    startTransition: (outgoingId, incomingId) => engine.startTransition(outgoingId, incomingId),
    createCustomPreset: (category, name, preset) => presetManager.createCustomPreset(category, name, preset),
    exportPresetLibrary: () => presetManager.exportCustomPresetLibrary(),
    importPresetLibrary: (library) => presetManager.importCustomPresetLibrary(library),
    resetCustomPresets: (category) => presetManager.resetCustomPresets(category),
    sections,
    addSection,
    updateSection,
    removeSection,
    addContentItem,
    updateContentItem,
    removeContentItem
  };

  return (
    <DesignSystemContext.Provider value={contextValue}>
      {children}
    </DesignSystemContext.Provider>
  );
}

export function useDesignSystem() {
  const context = useContext(DesignSystemContext);
  if (!context) {
    throw new Error('useDesignSystem must be used within a DesignSystemProvider');
  }
  return context;
}
