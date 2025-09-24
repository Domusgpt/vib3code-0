'use client';

import { useMemo, useState } from 'react';
import { useDesignSystem } from '../../core/design-system-context';
import { VisualizerComputedState } from '../../core/types';

function formatNumber(value: number) {
  if (Number.isNaN(value)) return '0.00';
  return value.toFixed(2);
}

function VisualizerStateCard({
  id,
  state,
  onHover,
  onLeave,
  onClick,
  onScroll
}: {
  id: string;
  state: VisualizerComputedState;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
  onScroll: (direction: 'up' | 'down', velocity: number) => void;
}) {
  return (
    <div
      className="group bg-black/60 border border-cyan-500/40 rounded-2xl p-4 space-y-3 transition transform hover:-translate-y-1 hover:border-cyan-400/60"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      onWheel={(event) => {
        event.preventDefault();
        const direction = event.deltaY < 0 ? 'up' : 'down';
        const velocity = Math.min(1, Math.abs(event.deltaY) / 200);
        onScroll(direction, velocity);
      }}
    >
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-cyan-200">{id}</h3>
        <span className="text-xs text-white/60">Updated {new Date(state.lastUpdated).toLocaleTimeString()}</span>
      </header>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-white/5 rounded-lg p-2 border border-white/10">
          <div className="text-white/60">Grid Density</div>
          <div className="text-cyan-200 font-semibold">{formatNumber(state.gridDensity)}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-2 border border-white/10">
          <div className="text-white/60">Color Intensity</div>
          <div className="text-cyan-200 font-semibold">{formatNumber(state.colorIntensity)}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-2 border border-white/10">
          <div className="text-white/60">Animation Speed</div>
          <div className="text-cyan-200 font-semibold">{formatNumber(state.animationSpeed)}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-2 border border-white/10">
          <div className="text-white/60">Depth Offset</div>
          <div className="text-cyan-200 font-semibold">{formatNumber(state.depthOffset)}</div>
        </div>
      </div>
      <div className="text-xs text-white/60 space-y-1">
        <div>Reactivity — mouse {formatNumber(state.reactivity.mouse)}, click {formatNumber(state.reactivity.click)}, scroll {formatNumber(state.reactivity.scroll)}</div>
        <div>Translucency {formatNumber(state.translucency)} • Scale {formatNumber(state.scale)} • Rotation {formatNumber(state.rotation)}</div>
        <div>Blur {formatNumber(state.blur)} • Sparkles {state.sparkles}</div>
        <div>Color Palette: {state.colorScheme.palette}</div>
        {state.isInverted && <div className="text-amber-300">Spectrum inversion active</div>}
        {state.rippleActive && <div className="text-cyan-300">Ripple burst engaged</div>}
      </div>
    </div>
  );
}

export function DesignSystemPreview() {
  const {
    snapshot,
    triggerHover,
    clearHover,
    triggerClick,
    triggerScroll,
    startTransition,
    sections
  } = useDesignSystem();

  const visualizerEntries = useMemo(() => Object.entries(snapshot.visualizers), [snapshot.visualizers]);
  const [transitionIndex, setTransitionIndex] = useState(0);

  const handleTransition = () => {
    if (visualizerEntries.length < 2) return;
    const from = visualizerEntries[transitionIndex % visualizerEntries.length][0];
    const to = visualizerEntries[(transitionIndex + 1) % visualizerEntries.length][0];
    startTransition(from, to);
    setTransitionIndex((prev) => (prev + 1) % visualizerEntries.length);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-cyan-200">Live Preview</h2>
        <div className="flex items-center gap-3 text-xs text-white/70">
          <div className="px-3 py-1 bg-white/10 rounded-full">Interaction: {snapshot.interactions?.type ?? 'idle'}</div>
          {snapshot.activeTransition && (
            <div className="px-3 py-1 bg-purple-500/20 rounded-full text-purple-100">
              Transition {snapshot.activeTransition.outgoingId} → {snapshot.activeTransition.incomingId}
            </div>
          )}
          <button
            onClick={handleTransition}
            className="px-3 py-1 rounded-full bg-purple-500/30 text-purple-100 hover:bg-purple-500/40"
          >
            Trigger Transition
          </button>
          <button
            onClick={() => triggerClick()}
            className="px-3 py-1 rounded-full bg-cyan-500/30 text-cyan-100 hover:bg-cyan-500/40"
          >
            Pulse Click Effect
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {visualizerEntries.map(([id, state]) => (
          <VisualizerStateCard
            key={id}
            id={id}
            state={state}
            onHover={() => triggerHover(id)}
            onLeave={() => clearHover()}
            onClick={() => triggerClick()}
            onScroll={(direction, velocity) => triggerScroll(direction, velocity)}
          />
        ))}
      </div>

      <section className="bg-black/60 border border-cyan-500/30 rounded-2xl p-5 space-y-4">
        <header className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-cyan-200">Content Sections</h3>
          <span className="text-xs text-white/60">{sections.length} configured</span>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {sections.map((section) => (
            <div key={section.id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-cyan-100">{section.name}</span>
                <span className="text-white/50">{section.type.replace('_', ' ')}</span>
              </div>
              <div className="text-white/60">
                Scrolling: {section.scrolling.enabled ? `${section.scrolling.scrollType} / ${section.scrolling.direction}` : 'Disabled'}
              </div>
              <div className="text-white/60">
                Expansion: {section.expansion.enabled ? `${section.expansion.trigger} → ${section.expansion.size}` : 'Static'}
              </div>
              <div className="text-white/60">Items: {section.items.length}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default DesignSystemPreview;
