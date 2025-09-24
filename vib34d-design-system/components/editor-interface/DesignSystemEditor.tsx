'use client';

import { useEffect, useMemo, useState } from 'react';
import StyleSettingsPanel from './StyleSettingsPanel';
import type { VIB34DState, VIB34DCustomization } from '../../core/visualizer-engine';
import { VIB34DSystem } from '../../core/visualizer-engine';
import { PresetManager, type PresetCategory } from '../../core/preset-manager';

function StateSummary({ state }: { state: VIB34DState }) {
  const { visualizer, transitions, interaction, effects } = state;

  return (
    <div className="bg-black/40 border border-cyan-500/20 rounded-2xl p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">Active System State</h3>
        <p className="text-sm text-gray-400">Live values computed from current preset selections.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4 space-y-2">
          <div className="text-sm text-cyan-200 uppercase tracking-wide">Visualizer</div>
          <div className="text-xl font-semibold text-white">{visualizer.collection.label}</div>
          <div className="grid grid-cols-2 gap-2 text-xs text-cyan-200 font-mono">
            <div>Density: {visualizer.density.base.toFixed(1)}±{visualizer.density.variation.toFixed(1)}</div>
            <div>Speed: {visualizer.speed.base.toFixed(2)}±{visualizer.speed.variation.toFixed(2)}</div>
            <div>Reactivity μ: {visualizer.reactivity.mouse.toFixed(2)}</div>
            <div>Color: {visualizer.color.palette}</div>
          </div>
        </div>

        <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-4 space-y-2">
          <div className="text-sm text-purple-200 uppercase tracking-wide">Transitions</div>
          <div className="text-xl font-semibold text-white">{transitions.collection.label}</div>
          <div className="text-xs text-purple-100 font-mono space-y-1">
            <div>Page: {transitions.page.name} ({transitions.page.easing})</div>
            <div>Card: {transitions.card.name} ({transitions.card.duration})</div>
            <div>Outgoing Phases: {transitions.coordination.outgoing.length}</div>
            <div>Incoming Phases: {transitions.coordination.incoming.length}</div>
          </div>
        </div>

        <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 space-y-2">
          <div className="text-sm text-green-200 uppercase tracking-wide">Interactions</div>
          <div className="text-xl font-semibold text-white">{interaction.activeProfile}</div>
          <div className="text-xs text-green-100 font-mono space-y-1">
            <div>Hover target: {interaction.hoverTarget ?? 'none'}</div>
            <div>Hover multiplier: {interaction.multipliers.hover.toFixed(2)}</div>
            <div>Click multiplier: {interaction.multipliers.click.toFixed(2)}</div>
            <div>Scroll multiplier: {interaction.multipliers.scroll.toFixed(2)}</div>
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 space-y-2">
          <div className="text-sm text-amber-200 uppercase tracking-wide">Effects</div>
          <div className="text-xl font-semibold text-white">{effects.collection ?? 'custom selection'}</div>
          <div className="text-xs text-amber-100 font-mono space-y-1">
            <div>Hover: {effects.hover.name}</div>
            <div>Click: {effects.click.name}</div>
            <div>Scroll: {effects.scroll.name}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface DesignSystemEditorProps {
  onStateChange?: (state: VIB34DState, system: VIB34DSystem) => void;
}

export function DesignSystemEditor({ onStateChange }: DesignSystemEditorProps = {}) {
  const presetManager = useMemo(() => new PresetManager(), []);
  const [system, setSystem] = useState<VIB34DSystem | null>(null);
  const [state, setState] = useState<VIB34DState | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const instance = new VIB34DSystem({ container: '#vib34d-preview-root' });
    setSystem(instance);
    const unsubscribe = instance.subscribe((nextState) => {
      setState(nextState);
      onStateChange?.(nextState, instance);
    });

    return () => {
      unsubscribe();
      instance.destroy();
      setSystem(null);
      setState(null);
    };
  }, []);

  const handlePresetChange = (category: PresetCategory, value: string) => {
    system?.switchPreset(category, value);
  };

  const handleCustomizationChange = (update: Partial<VIB34DCustomization>) => {
    system?.updateCustomization(update);
  };

  if (!system || !state) {
    return (
      <div className="bg-black/40 border border-cyan-500/30 rounded-2xl p-6 text-sm text-gray-400">
        Initializing VIB34D design system…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StyleSettingsPanel
        presetManager={presetManager}
        state={state}
        onPresetChange={handlePresetChange}
        onCustomizationChange={handleCustomizationChange}
      />
      <StateSummary state={state} />
    </div>
  );
}

export default DesignSystemEditor;
