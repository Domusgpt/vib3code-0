'use client';

import { useMemo, useState } from 'react';
import { useDesignSystem } from '@/lib/design-system/context';
import { ContentManagementPanel } from './ContentManagementPanel';

export function EditorInterface() {
  const { settings, updateSettings, presetManager } = useDesignSystem();
  const [customPresetName, setCustomPresetName] = useState('My Custom Preset');
  const [savedPresets, setSavedPresets] = useState<{ name: string; metrics: unknown }[]>([]);

  const densityOptions = useMemo(() => Object.keys(presetManager.visualizer.density_presets), [presetManager]);
  const speedOptions = useMemo(() => Object.keys(presetManager.visualizer.speed_presets), [presetManager]);
  const reactivityOptions = useMemo(() => Object.keys(presetManager.visualizer.reactivity_presets), [presetManager]);
  const colorOptions = useMemo(() => Object.keys(presetManager.visualizer.color_presets), [presetManager]);
  const hoverEffects = useMemo(() => Object.keys(presetManager.effects.hover_effects), [presetManager]);
  const clickEffects = useMemo(() => Object.keys(presetManager.effects.click_effects), [presetManager]);
  const scrollEffects = useMemo(() => Object.keys(presetManager.effects.scroll_effects), [presetManager]);
  const pageTransitions = useMemo(() => Object.keys(presetManager.transitions.page_transitions), [presetManager]);
  const cardTransitions = useMemo(() => Object.keys(presetManager.transitions.card_transitions), [presetManager]);

  const savePreset = () => {
    const metrics = presetManager.createCardBaseMetrics(settings);
    presetManager.saveCustomPreset(customPresetName, metrics);
    setSavedPresets(presetManager.listCustomPresets());
  };

  return (
    <div className="space-y-10">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h2 className="text-lg font-semibold text-white/80">Style Settings</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <SelectField
            label="Density"
            value={settings.style.density}
            options={densityOptions}
            onChange={(value) =>
              updateSettings((prev) => ({ ...prev, style: { ...prev.style, density: value } }))
            }
          />
          <SelectField
            label="Speed"
            value={settings.style.speed}
            options={speedOptions}
            onChange={(value) =>
              updateSettings((prev) => ({ ...prev, style: { ...prev.style, speed: value } }))
            }
          />
          <SelectField
            label="Reactivity"
            value={settings.style.reactivity}
            options={reactivityOptions}
            onChange={(value) =>
              updateSettings((prev) => ({ ...prev, style: { ...prev.style, reactivity: value } }))
            }
          />
          <SelectField
            label="Color Scheme"
            value={settings.style.color_scheme}
            options={colorOptions}
            onChange={(value) =>
              updateSettings((prev) => ({ ...prev, style: { ...prev.style, color_scheme: value } }))
            }
          />
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h2 className="text-lg font-semibold text-white/80">Interaction Behavior</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <SelectField
            label="Hover Effect"
            value={settings.interactions.hover_effect}
            options={hoverEffects}
            onChange={(value) =>
              updateSettings((prev) => ({ ...prev, interactions: { ...prev.interactions, hover_effect: value } }))
            }
          />
          <SelectField
            label="Click Effect"
            value={settings.interactions.click_effect}
            options={clickEffects}
            onChange={(value) =>
              updateSettings((prev) => ({ ...prev, interactions: { ...prev.interactions, click_effect: value } }))
            }
          />
          <SelectField
            label="Scroll Effect"
            value={settings.interactions.scroll_effect}
            options={scrollEffects}
            onChange={(value) =>
              updateSettings((prev) => ({ ...prev, interactions: { ...prev.interactions, scroll_effect: value } }))
            }
          />
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h2 className="text-lg font-semibold text-white/80">Transition Styles</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <SelectField
            label="Page Transition"
            value={settings.transitions.page_transition}
            options={pageTransitions}
            onChange={(value) =>
              updateSettings((prev) => ({ ...prev, transitions: { ...prev.transitions, page_transition: value } }))
            }
          />
          <SelectField
            label="Card Transition"
            value={settings.transitions.card_transition}
            options={cardTransitions}
            onChange={(value) =>
              updateSettings((prev) => ({ ...prev, transitions: { ...prev.transitions, card_transition: value } }))
            }
          />
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h2 className="text-lg font-semibold text-white/80">Advanced Tuning</h2>
        <div className="mt-4 space-y-4">
          <SliderField
            label="Global Speed Multiplier"
            min={0.1}
            max={3}
            step={0.1}
            value={settings.advanced.global_speed_multiplier}
            onChange={(value) =>
              updateSettings((prev) => ({
                ...prev,
                advanced: { ...prev.advanced, global_speed_multiplier: value },
              }))
            }
          />
          <SliderField
            label="Interaction Sensitivity"
            min={0.1}
            max={2}
            step={0.1}
            value={settings.advanced.interaction_sensitivity}
            onChange={(value) =>
              updateSettings((prev) => ({
                ...prev,
                advanced: { ...prev.advanced, interaction_sensitivity: value },
              }))
            }
          />
          <SliderField
            label="Transition Duration Multiplier"
            min={0.5}
            max={2}
            step={0.1}
            value={settings.advanced.transition_duration_multiplier}
            onChange={(value) =>
              updateSettings((prev) => ({
                ...prev,
                advanced: { ...prev.advanced, transition_duration_multiplier: value },
              }))
            }
          />
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white/80">Preset Library</h2>
            <p className="text-xs text-cyan-200/70">Save the current configuration as a reusable preset.</p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customPresetName}
              onChange={(event) => setCustomPresetName(event.target.value)}
              className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white focus:border-cyan-400/60 focus:outline-none"
            />
            <button
              onClick={savePreset}
              className="rounded-full bg-cyan-500/30 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500/50"
            >
              Save Preset
            </button>
          </div>
        </div>
        {savedPresets.length > 0 && (
          <div className="mt-4 grid gap-2 text-xs text-cyan-100/80">
            {savedPresets.map((preset) => (
              <div key={preset.name} className="rounded-xl border border-white/10 bg-black/40 px-4 py-3">
                <div className="font-semibold text-white/90">{preset.name}</div>
                <pre className="mt-2 overflow-auto text-[10px] text-cyan-200/70">
                  {JSON.stringify(preset.metrics, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>

      <ContentManagementPanel />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-xs text-cyan-100/80">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-cyan-400/60 focus:outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replace(/_/g, ' ')}
          </option>
        ))}
      </select>
    </label>
  );
}

function SliderField({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col text-xs text-cyan-100/80">
      <span className="mb-1 flex items-center justify-between">
        {label}
        <span className="text-[10px] text-cyan-200/70">{value.toFixed(2)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1 w-full appearance-none rounded-full bg-white/10 accent-cyan-400"
      />
    </label>
  );
}
