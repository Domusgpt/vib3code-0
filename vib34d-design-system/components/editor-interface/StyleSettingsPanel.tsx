'use client';

import { useMemo } from 'react';
import type { PresetManager, PresetCategory } from '../../core/preset-manager';
import type { VIB34DState, VIB34DCustomization } from '../../core/visualizer-engine';

interface StyleSettingsPanelProps {
  presetManager: PresetManager;
  state: VIB34DState;
  onPresetChange: (category: PresetCategory, value: string) => void;
  onCustomizationChange: (update: Partial<VIB34DCustomization>) => void;
}

function SelectField({
  label,
  description,
  value,
  options,
  onChange
}: {
  label: string;
  description?: string;
  value: string;
  options: Array<{ value: string; label: string; description?: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-white">{label}</div>
          {description && (
            <p className="text-xs text-gray-400">{description}</p>
          )}
        </div>
      </div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-black/40 border border-cyan-500/40 rounded-lg px-3 py-2 text-sm text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {options.find((option) => option.value === value)?.description && (
        <p className="text-xs text-cyan-300/70">
          {options.find((option) => option.value === value)?.description}
        </p>
      )}
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-white">{label}</div>
        <div className="text-xs text-cyan-300 font-mono">{value.toFixed(2)}{suffix}</div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(parseFloat(event.target.value))}
        className="w-full accent-cyan-400"
      />
    </div>
  );
}

export function StyleSettingsPanel({ presetManager, state, onPresetChange, onCustomizationChange }: StyleSettingsPanelProps) {
  const visualizerOptions = useMemo(() => presetManager.listVisualizerCollections(), [presetManager]);
  const interactionOptions = useMemo(() => presetManager.listInteractionProfiles(), [presetManager]);
  const transitionOptions = useMemo(() => presetManager.listTransitionCollections(), [presetManager]);
  const effectCollections = useMemo(() => presetManager.listEffectCollections(), [presetManager]);
  const hoverOptions = useMemo(() => presetManager.listHoverEffects().map((name) => ({ value: name, label: name.replace(/_/g, ' ') })), [presetManager]);
  const clickOptions = useMemo(() => presetManager.listClickEffects().map((name) => ({ value: name, label: name.replace(/_/g, ' ') })), [presetManager]);
  const scrollOptions = useMemo(() => presetManager.listScrollEffects().map((name) => ({ value: name, label: name.replace(/_/g, ' ') })), [presetManager]);

  const customization = state.customization;

  return (
    <div className="bg-black/50 border border-cyan-500/30 rounded-2xl p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Style Settings</h2>
        <p className="text-sm text-gray-400">Configure preset banks and interaction behaviors.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SelectField
          label="Visualizer Collection"
          description="Density, speed, reactivity and color presets"
          value={state.presets.visualizerCollection}
          options={visualizerOptions}
          onChange={(value) => onPresetChange('visualizer', value)}
        />

        <SelectField
          label="Transition Style"
          description="Coordinated page and card animation"
          value={state.presets.transitionCollection}
          options={transitionOptions}
          onChange={(value) => onPresetChange('transitions', value)}
        />

        <SelectField
          label="Interaction Profile"
          description="Hover, click and scroll responsiveness"
          value={state.presets.interactionProfile}
          options={interactionOptions}
          onChange={(value) => onPresetChange('interactions', value)}
        />

        <SelectField
          label="Effect Collection"
          description="Coordinated hover, click and scroll effects"
          value={state.effects.collection ?? state.presets.effectsSelection}
          options={effectCollections}
          onChange={(value) => onPresetChange('effects', value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <SelectField
          label="Hover Effect"
          value={state.effects.hover.name}
          options={hoverOptions}
          onChange={(value) => onPresetChange('effects', value)}
        />
        <SelectField
          label="Click Effect"
          value={state.effects.click.name}
          options={clickOptions}
          onChange={(value) => onPresetChange('effects', value)}
        />
        <SelectField
          label="Scroll Effect"
          value={state.effects.scroll.name}
          options={scrollOptions}
          onChange={(value) => onPresetChange('effects', value)}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Advanced Tuning</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SliderField
            label="Global Speed Multiplier"
            value={customization.speedMultiplier}
            min={0.1}
            max={3}
            step={0.1}
            onChange={(value) => onCustomizationChange({ speedMultiplier: value })}
          />
          <SliderField
            label="Interaction Sensitivity"
            value={customization.sensitivityMultiplier}
            min={0.1}
            max={2}
            step={0.1}
            onChange={(value) => onCustomizationChange({ sensitivityMultiplier: value })}
          />
          <SliderField
            label="Transition Duration"
            value={customization.transitionDurationMultiplier}
            min={0.5}
            max={2}
            step={0.1}
            suffix="x"
            onChange={(value) => onCustomizationChange({ transitionDurationMultiplier: value })}
          />
        </div>
      </div>
    </div>
  );
}

export default StyleSettingsPanel;
