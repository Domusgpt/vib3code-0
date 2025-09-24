'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { VIB34DState } from '../../core/visualizer-engine';
import type { VIB34DSystem } from '../../core/visualizer-engine';

interface PreviewSurfaceProps {
  state: VIB34DState;
  system: VIB34DSystem;
}

function TransitionTimeline({ state }: { state: VIB34DState }) {
  const outgoing = state.transitions.coordination.outgoing;
  const incoming = state.transitions.coordination.incoming;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-white">Transition Timeline</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
        <div className="bg-black/50 border border-cyan-500/20 rounded-lg p-3 space-y-1">
          <div className="text-cyan-200 uppercase tracking-wide text-[10px]">Outgoing</div>
          {outgoing.map((phase) => (
            <div key={phase.name} className="flex items-center justify-between text-cyan-100">
              <span>{phase.descriptor}</span>
              <span>{phase.start} → {phase.end}ms</span>
            </div>
          ))}
        </div>
        <div className="bg-black/50 border border-purple-500/20 rounded-lg p-3 space-y-1">
          <div className="text-purple-200 uppercase tracking-wide text-[10px]">Incoming</div>
          {incoming.map((phase) => (
            <div key={phase.name} className="flex items-center justify-between text-purple-100">
              <span>{phase.descriptor}</span>
              <span>{phase.start} → {phase.end}ms</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PreviewSurface({ state, system }: PreviewSurfaceProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cards = useMemo(() => [
    { id: 'preview-card-1', title: 'Hover Me', description: 'Demonstrates hover response pattern' },
    { id: 'preview-card-2', title: 'Click Me', description: 'Triggers click inversion & sparkles' },
    { id: 'preview-card-3', title: 'Scroll Area', description: 'Scroll inside panel to modulate density' }
  ], []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const registered: string[] = [];

    cards.forEach((card) => {
      const element = container.querySelector<HTMLElement>(`[data-preview-card="${card.id}"]`);
      if (element) {
        system.attachInteractiveElement(card.id, element, 'preview');
        registered.push(card.id);
      }
    });

    return () => {
      registered.forEach((id) => system.detachInteractiveElement(id));
    };
  }, [cards, system]);

  return (
    <div className="bg-black/50 border border-cyan-500/30 rounded-2xl p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">Live Preview</h3>
        <p className="text-sm text-gray-400">Interactive surface illustrating preset responses.</p>
      </div>

      <div
        ref={containerRef}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {cards.map((card) => (
          <div
            key={card.id}
            data-preview-card={card.id}
            className="relative overflow-hidden rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 p-4 cursor-pointer transition-transform hover:-translate-y-1"
          >
            <div className="text-sm font-semibold text-white">{card.title}</div>
            <p className="text-xs text-cyan-100 mt-2 leading-relaxed">{card.description}</p>
            {card.id === 'preview-card-3' && (
              <div
                className="mt-4 h-24 overflow-y-auto rounded-lg border border-cyan-500/30 bg-black/40 p-3 text-xs text-cyan-200"
                onScroll={(event) => {
                  const element = event.currentTarget;
                  const velocity = element.scrollTop / Math.max(1, element.scrollHeight - element.clientHeight);
                  system.applyScrollVelocity(velocity);
                }}
              >
                {[...Array(8)].map((_, index) => (
                  <p key={index} className="mb-2 last:mb-0">
                    Scroll sample {index + 1}: fluid momentum resonance calibration.
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-cyan-100">
        <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-4">
          <div className="text-[10px] uppercase tracking-wide text-cyan-300 mb-2">Interaction State</div>
          <div>Active profile: {state.interaction.activeProfile}</div>
          <div>Hover target: {state.interaction.hoverTarget ?? 'none'}</div>
          <div>Last click: {state.interaction.lastClick ? new Date(state.interaction.lastClick.timestamp).toLocaleTimeString() : 'never'}</div>
        </div>
        <div className="bg-black/40 border border-purple-500/20 rounded-lg p-4">
          <div className="text-[10px] uppercase tracking-wide text-purple-300 mb-2">Effect Definitions</div>
          <div>Hover → {state.effects.hover.definition?.target_enhancement ?? 'n/a'}</div>
          <div>Click → {state.effects.click.definition?.type ?? 'n/a'}</div>
          <div>Scroll → {state.effects.scroll.definition?.type ?? 'n/a'}</div>
        </div>
      </div>

      <TransitionTimeline state={state} />
    </div>
  );
}

export default PreviewSurface;
