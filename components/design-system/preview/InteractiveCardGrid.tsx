'use client';

import { useEffect, useMemo, useRef, useCallback } from 'react';
import type { CSSProperties } from 'react';
import { useDesignSystem } from '@/lib/design-system/context';
import { CardVisualState } from '@/lib/design-system/types';

interface PreviewCard {
  id: string;
  title: string;
  description: string;
  category: string;
}

const previewCards: PreviewCard[] = [
  {
    id: 'card-ai-lab',
    title: 'AI Lab Report',
    description: 'Deep dive into hyperspectral cognition engines and cooperative agents.',
    category: 'Research',
  },
  {
    id: 'card-viz',
    title: 'Visualizer Evolution',
    description: 'Tracking the evolution of VIB34D geometry synthesis across releases.',
    category: 'Systems',
  },
  {
    id: 'card-behavior',
    title: 'Interaction Taxonomy',
    description: 'Mapping hover, click, and scroll responses into a modular DSL.',
    category: 'Design',
  },
  {
    id: 'card-transitions',
    title: 'Transition Phases',
    description: 'Coordinating outgoing collapse with incoming crystallization in 4D.',
    category: 'Motion',
  },
  {
    id: 'card-effects',
    title: 'Effect Banks',
    description: 'Preset banks for quantum collapse, glitch harmonics, and hover magnetism.',
    category: 'Effects',
  },
  {
    id: 'card-content',
    title: 'Content Orchestration',
    description: 'Configurable sections with scroll snapping and expansion choreography.',
    category: 'Content',
  },
];

const computeCardStyle = (state?: CardVisualState) => {
  if (!state) {
    const style: CSSProperties = {
      transform: 'translateZ(0px) scale(1)',
      filter: 'brightness(1)',
      boxShadow: '0 0 20px rgba(0, 255, 255, 0.08)',
      opacity: 0.85,
    };
    return style;
  }

  const scale = 1 + (state.metrics.colorIntensity - 0.6) * 0.3;
  const depth = state.metrics.depth;
  const brightness = 0.7 + state.metrics.colorIntensity * 0.4;
  const reactivityGlow = Math.min(1, Math.abs(state.metrics.reactivity)) * 0.4;

  const style: CSSProperties = {
    transform: `translateZ(${depth}px) scale(${scale})`,
    filter: `brightness(${brightness}) ${state.isInverted ? 'invert(1)' : ''}`.trim(),
    boxShadow: `0 0 25px rgba(0, 255, 255, ${reactivityGlow})`,
    opacity: state.isTarget ? 1 : 0.85,
    transition: `all ${state.transition.duration}ms ${state.transition.easing}`,
    transitionDelay: `${state.transition.delay}ms`,
  };

  return style;
};

export function InteractiveCardGrid() {
  const {
    cardStates,
    registerCard,
    handleHover,
    clearHover,
    handleClick,
    handleScroll,
    scrollState,
  } = useDesignSystem();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);
  const lastTimestamp = useRef(performance.now());

  const handleScrollEvent = useCallback((event: Event) => {
    const target = event.target as HTMLDivElement | null;
    if (!target) {
      return;
    }
    const now = performance.now();
    const delta = target.scrollTop - lastScrollTop.current;
    const dt = now - lastTimestamp.current;
    const velocity = dt > 0 ? (delta / dt) * 1000 : 0; // px per second
    lastScrollTop.current = target.scrollTop;
    lastTimestamp.current = now;
    handleScroll(delta, velocity);
  }, [handleScroll]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }
    const listener = (event: Event) => handleScrollEvent(event);
    container.addEventListener('scroll', listener, { passive: true });
    return () => container.removeEventListener('scroll', listener);
  }, [handleScrollEvent]);

  const cards = useMemo(() => previewCards, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-cyan-300">Scrollable Grid Cards</h3>
          <p className="text-xs text-cyan-200/70">Momentum {scrollState.momentum.toFixed(2)} · Velocity {scrollState.velocity.toFixed(1)}px/s</p>
        </div>
      </div>
      <div
        ref={scrollContainerRef}
        className="max-h-[28rem] overflow-y-auto pr-2" 
        style={{ scrollSnapType: 'y mandatory' }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
          }}
        >
          {cards.map((card) => (
            <PreviewCardItem
              key={card.id}
              card={card}
              state={cardStates[card.id]}
              registerCard={registerCard}
              handleHover={handleHover}
              clearHover={clearHover}
              handleClick={handleClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface PreviewCardItemProps {
  card: PreviewCard;
  state?: CardVisualState;
  registerCard: (id: string) => () => void;
  handleHover: (id: string) => void;
  clearHover: () => void;
  handleClick: (id: string) => void;
}

function PreviewCardItem({ card, state, registerCard, handleHover, clearHover, handleClick }: PreviewCardItemProps) {
  useEffect(() => {
    const unregister = registerCard(card.id);
    return () => unregister();
  }, [registerCard, card.id]);

  const style = computeCardStyle(state);

  return (
    <div
      className="relative rounded-2xl border border-cyan-500/20 bg-black/40 p-4 backdrop-blur-sm cursor-pointer group"
      style={{
        ...style,
        scrollSnapAlign: 'start',
      }}
      onMouseEnter={() => handleHover(card.id)}
      onMouseLeave={() => clearHover()}
      onClick={() => handleClick(card.id)}
    >
      <div className="text-xs uppercase tracking-widest text-cyan-200/70 mb-2">{card.category}</div>
      <h4 className="text-xl font-semibold text-white mb-2 group-hover:text-cyan-300 transition-colors duration-300">
        {card.title}
      </h4>
      <p className="text-sm text-cyan-100/70 leading-relaxed mb-4">
        {card.description}
      </p>
      <CardMetricsDisplay state={state} />
      {state?.sparkles && state.sparkles > 0 && (
        <div className="absolute inset-0 pointer-events-none rounded-2xl border border-purple-500/40 animate-pulse"></div>
      )}
    </div>
  );
}

function CardMetricsDisplay({ state }: { state?: CardVisualState }) {
  return (
    <div className="grid grid-cols-2 gap-2 text-[11px] text-cyan-200/70">
      <Metric label="Density" value={state ? state.metrics.gridDensity.toFixed(2) : '—'} />
      <Metric label="Intensity" value={state ? state.metrics.colorIntensity.toFixed(2) : '—'} />
      <Metric label="Reactivity" value={state ? state.metrics.reactivity.toFixed(2) : '—'} />
      <Metric label="Depth" value={state ? `${state.metrics.depth.toFixed(0)}px` : '—'} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col rounded-lg border border-white/5 bg-white/5 px-2 py-1">
      <span className="text-[10px] uppercase tracking-wider text-white/40">{label}</span>
      <span className="font-semibold text-white/80">{value}</span>
    </div>
  );
}
