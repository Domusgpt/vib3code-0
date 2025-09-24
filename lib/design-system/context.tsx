'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { InteractionCoordinator } from './core/interaction-coordinator';
import { PresetManager } from './core/preset-manager';
import { TransitionCoordinator } from './core/transition-coordinator';
import { CLICK_RESPONSE_PATTERN, HOVER_RESPONSE_PATTERN, PRESET_LIBRARY } from './presets/defaults';
import {
  CardMetrics,
  CardVisualState,
  DesignSystemSettings,
  ManagedContentItem,
  ManagedSectionConfig,
  ScrollState,
  VideoState,
} from './types';

interface DesignSystemContextValue {
  settings: DesignSystemSettings;
  updateSettings: (updater: (prev: DesignSystemSettings) => DesignSystemSettings) => void;
  cardStates: Record<string, CardVisualState>;
  registerCard: (id: string) => () => void;
  handleHover: (id: string) => void;
  clearHover: () => void;
  handleClick: (id: string) => void;
  handleScroll: (delta: number, velocity: number) => void;
  scrollState: ScrollState;
  presetManager: PresetManager;
  transitionCoordinator: TransitionCoordinator;
  videoState: VideoState;
  setVideoMode: (mode: VideoState['mode']) => void;
  sections: ManagedSectionConfig[];
  addSection: (section: ManagedSectionConfig) => void;
  updateSection: (id: string, updater: (section: ManagedSectionConfig) => ManagedSectionConfig) => void;
  removeSection: (id: string) => void;
  addContentItem: (sectionId: string, item: ManagedContentItem) => void;
  updateContentItem: (sectionId: string, itemId: string, updater: (item: ManagedContentItem) => ManagedContentItem) => void;
  removeContentItem: (sectionId: string, itemId: string) => void;
}

const defaultSettings: DesignSystemSettings = {
  style: {
    density: 'standard',
    speed: 'flowing',
    reactivity: 'responsive',
    color_scheme: 'complementary',
  },
  interactions: {
    hover_effect: 'subtle_glow',
    click_effect: 'color_inversion',
    scroll_effect: 'momentum_trails',
  },
  transitions: {
    page_transition: 'slide_portal',
    card_transition: 'gentle_emerge',
  },
  advanced: {
    global_speed_multiplier: 1.0,
    interaction_sensitivity: 1.0,
    transition_duration_multiplier: 1.0,
  },
};

const initialSections: ManagedSectionConfig[] = [
  {
    id: 'section-articles',
    name: 'Article Grid',
    section_type: 'article_grid',
    scrolling: {
      enabled: true,
      scroll_type: 'smooth',
      scroll_direction: 'vertical',
    },
    expansion: {
      enabled: true,
      expansion_trigger: 'click',
      expansion_size: '2x',
    },
    items: [],
  },
  {
    id: 'section-videos',
    name: 'Video Gallery',
    section_type: 'video_gallery',
    scrolling: {
      enabled: true,
      scroll_type: 'snap',
      scroll_direction: 'vertical',
    },
    expansion: {
      enabled: true,
      expansion_trigger: 'click',
      expansion_size: 'fullscreen',
    },
    items: [],
  },
];

const DesignSystemContext = createContext<DesignSystemContextValue | undefined>(undefined);

export function DesignSystemProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<DesignSystemSettings>(defaultSettings);
  const [cardStates, setCardStates] = useState<Record<string, CardVisualState>>({});
  const [cardOrder, setCardOrder] = useState<string[]>([]);
  const [scrollState, setScrollState] = useState<ScrollState>({ velocity: 0, direction: 'down', momentum: 0 });
  const [videoState, setVideoState] = useState<VideoState>({ mode: 'thumbnail', progress: 0 });
  const [sections, setSections] = useState<ManagedSectionConfig[]>(initialSections);

  const presetManager = useMemo(() => new PresetManager(PRESET_LIBRARY), []);
  const interactionCoordinator = useMemo(
    () => new InteractionCoordinator(HOVER_RESPONSE_PATTERN, CLICK_RESPONSE_PATTERN),
    [],
  );
  const transitionCoordinator = useMemo(() => new TransitionCoordinator(), []);

  const cardStatesRef = useRef(cardStates);
  const cardOrderRef = useRef(cardOrder);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    cardStatesRef.current = cardStates;
  }, [cardStates]);

  useEffect(() => {
    cardOrderRef.current = cardOrder;
  }, [cardOrder]);

  useEffect(() => () => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  const createBaseMetrics = useCallback((): CardMetrics => {
    return presetManager.createCardBaseMetrics(settings);
  }, [presetManager, settings]);

  useEffect(() => {
    setCardStates((states) => {
      const next: Record<string, CardVisualState> = {};
      Object.entries(states).forEach(([id, value]) => {
        const base = createBaseMetrics();
        next[id] = {
          ...value,
          base,
          metrics: base,
          isTarget: false,
          isInverted: false,
          animationDirection: 1,
          lastInteraction: 'none',
          transition: {
            duration: 200,
            easing: 'ease-out',
            delay: 0,
          },
        };
      });
      return next;
    });
  }, [createBaseMetrics]);

  const registerCard = useCallback((id: string) => {
    setCardOrder((order) => (order.includes(id) ? order : [...order, id]));
    setCardStates((states) => {
      if (states[id]) {
        return states;
      }
      const base = createBaseMetrics();
      return {
        ...states,
        [id]: {
          id,
          base,
          metrics: base,
          transition: { duration: 0, easing: 'linear', delay: 0 },
          animationDirection: 1,
          isTarget: false,
          isInverted: false,
          lastInteraction: 'none',
        },
      };
    });

    return () => {
      setCardOrder((order) => order.filter((cardId) => cardId !== id));
      setCardStates((states) => {
        const { [id]: _removed, ...rest } = states;
        return rest;
      });
    };
  }, [createBaseMetrics]);

  const updateSettings = useCallback((updater: (prev: DesignSystemSettings) => DesignSystemSettings) => {
    setSettings((prev) => updater(prev));
  }, []);

  const handleHover = useCallback((id: string) => {
    const order = cardOrderRef.current;
    const baseMetrics = order.reduce<Record<string, CardMetrics>>((acc, cardId) => {
      const state = cardStatesRef.current[cardId];
      if (state) {
        acc[cardId] = state.base;
      }
      return acc;
    }, {});

    const result = interactionCoordinator.computeHoverStates(
      id,
      order,
      baseMetrics,
      cardStatesRef.current,
      settings,
    );

    setCardStates((states) => {
      const next: Record<string, CardVisualState> = { ...states };
      Object.entries(result.states).forEach(([cardId, partial]) => {
        const current = next[cardId];
        if (!current || !partial.metrics) {
          return;
        }
        next[cardId] = {
          ...current,
          ...partial,
          metrics: partial.metrics,
          transition: partial.transition ?? current.transition,
          animationDirection: partial.animationDirection ?? current.animationDirection,
          isTarget: partial.isTarget ?? current.isTarget,
          lastInteraction: partial.lastInteraction ?? current.lastInteraction,
        };
      });
      return next;
    });
  }, [interactionCoordinator, settings]);

  const clearHover = useCallback(() => {
    const order = cardOrderRef.current;
    const baseMetrics = order.reduce<Record<string, CardMetrics>>((acc, cardId) => {
      const state = cardStatesRef.current[cardId];
      if (state) {
        acc[cardId] = state.base;
      }
      return acc;
    }, {});

    const result = interactionCoordinator.clearHover(order, baseMetrics);

    setCardStates((states) => {
      const next: Record<string, CardVisualState> = { ...states };
      Object.entries(result.states).forEach(([cardId, partial]) => {
        const current = next[cardId];
        if (!current || !partial.metrics) {
          return;
        }
        next[cardId] = {
          ...current,
          ...partial,
          metrics: partial.metrics,
          transition: partial.transition ?? current.transition,
          animationDirection: 1,
        };
      });
      return next;
    });
  }, [interactionCoordinator]);

  const handleClick = useCallback((id: string) => {
    const target = cardStatesRef.current[id];
    if (!target) {
      return;
    }

    const { state, effect } = interactionCoordinator.computeClickState(
      id,
      target,
      target.base,
      settings,
    );

    setCardStates((states) => {
      const current = states[id];
      if (!current || !state.metrics) {
        return states;
      }
      return {
        ...states,
        [id]: {
          ...current,
          ...state,
          metrics: state.metrics,
          transition: state.transition ?? current.transition,
        },
      };
    });

    const timeoutId = window.setTimeout(() => {
      setCardStates((states) => {
        const current = states[id];
        if (!current) {
          return states;
        }
        return {
          ...states,
          [id]: {
            ...current,
            metrics: current.base,
            isInverted: false,
            isTarget: false,
            animationDirection: 1,
            sparkles: 0,
            rippleEffect: undefined,
            lastInteraction: 'none',
            transition: {
              duration: effect.decayDuration,
              easing: 'ease-in',
              delay: 0,
            },
          },
        };
      });
    }, effect.inversionDuration + effect.decayDuration);

    timeoutsRef.current.push(timeoutId);
  }, [interactionCoordinator, settings]);

  const handleScroll = useCallback((delta: number, velocity: number) => {
    const direction = delta > 0 ? 'down' : 'up';
    const magnitude = Math.min(1, Math.abs(velocity) / 1200);

    setScrollState({
      velocity: Math.abs(velocity),
      direction,
      momentum: magnitude,
    });

    setCardStates((states) => {
      const next: Record<string, CardVisualState> = {};
      Object.entries(states).forEach(([cardId, state]) => {
        const densityChange = direction === 'up' ? 0.05 : -0.05;
        const reactivityDelta = velocity * 0.0005 * settings.advanced.global_speed_multiplier;
        next[cardId] = {
          ...state,
          metrics: {
            ...state.metrics,
            gridDensity: Math.max(0, state.metrics.gridDensity + densityChange * magnitude),
            reactivity: state.metrics.reactivity + reactivityDelta,
          },
          transition: {
            duration: 150,
            easing: 'linear',
            delay: 0,
          },
        };
      });
      return next;
    });
  }, [settings.advanced.global_speed_multiplier]);

  const setVideoMode = useCallback((mode: VideoState['mode']) => {
    setVideoState((prev) => ({ ...prev, mode }));
  }, []);

  const addSection = useCallback((section: ManagedSectionConfig) => {
    setSections((prev) => [...prev, section]);
  }, []);

  const updateSection = useCallback((id: string, updater: (section: ManagedSectionConfig) => ManagedSectionConfig) => {
    setSections((prev) => prev.map((section) => (section.id === id ? updater(section) : section)));
  }, []);

  const removeSection = useCallback((id: string) => {
    setSections((prev) => prev.filter((section) => section.id !== id));
  }, []);

  const addContentItem = useCallback((sectionId: string, item: ManagedContentItem) => {
    setSections((prev) => prev.map((section) => {
      if (section.id !== sectionId) {
        return section;
      }
      return {
        ...section,
        items: [...section.items, item],
      };
    }));
  }, []);

  const updateContentItem = useCallback((sectionId: string, itemId: string, updater: (item: ManagedContentItem) => ManagedContentItem) => {
    setSections((prev) => prev.map((section) => {
      if (section.id !== sectionId) {
        return section;
      }
      return {
        ...section,
        items: section.items.map((item) => (item.id === itemId ? updater(item) : item)),
      };
    }));
  }, []);

  const removeContentItem = useCallback((sectionId: string, itemId: string) => {
    setSections((prev) => prev.map((section) => {
      if (section.id !== sectionId) {
        return section;
      }
      return {
        ...section,
        items: section.items.filter((item) => item.id !== itemId),
      };
    }));
  }, []);

  const value = useMemo<DesignSystemContextValue>(() => ({
    settings,
    updateSettings,
    cardStates,
    registerCard,
    handleHover,
    clearHover,
    handleClick,
    handleScroll,
    scrollState,
    presetManager,
    transitionCoordinator,
    videoState,
    setVideoMode,
    sections,
    addSection,
    updateSection,
    removeSection,
    addContentItem,
    updateContentItem,
    removeContentItem,
  }), [
    settings,
    cardStates,
    registerCard,
    handleHover,
    clearHover,
    handleClick,
    handleScroll,
    scrollState,
    presetManager,
    transitionCoordinator,
    videoState,
    setVideoMode,
    sections,
    addSection,
    updateSection,
    removeSection,
    addContentItem,
    updateContentItem,
    removeContentItem,
    updateSettings,
  ]);

  return (
    <DesignSystemContext.Provider value={value}>
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
