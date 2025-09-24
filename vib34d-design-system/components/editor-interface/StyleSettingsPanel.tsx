'use client';

import { ChangeEvent } from 'react';
import { useDesignSystem } from '../../core/design-system-context';
import {
  DensityPresetName,
  SpeedPresetName,
  ReactivityPresetName,
  ColorPresetName,
  HoverEffectName,
  ClickEffectName,
  ScrollEffectName,
  PageTransitionName,
  CardTransitionName
} from '../../core/types';

export function StyleSettingsPanel() {
  const { selection, setSelection, options } = useDesignSystem();

  const handleDensityChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelection({ density: event.target.value as DensityPresetName });
  };

  const handleSpeedChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelection({ speed: event.target.value as SpeedPresetName });
  };

  const handleReactivityChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelection({ reactivity: event.target.value as ReactivityPresetName });
  };

  const handleColorChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelection({ colorScheme: event.target.value as ColorPresetName });
  };

  const handleHoverEffectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelection({ hoverEffect: event.target.value as HoverEffectName });
  };

  const handleClickEffectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelection({ clickEffect: event.target.value as ClickEffectName });
  };

  const handleScrollEffectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelection({ scrollEffect: event.target.value as ScrollEffectName });
  };

  const handlePageTransitionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelection({ pageTransition: event.target.value as PageTransitionName });
  };

  const handleCardTransitionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelection({ cardTransition: event.target.value as CardTransitionName });
  };

  return (
    <div className="space-y-6 text-sm">
      <section className="bg-black/60 border border-cyan-500/30 rounded-xl p-4 shadow-lg shadow-cyan-500/10">
        <h2 className="text-lg font-semibold text-cyan-300 mb-3">Visualizer Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-cyan-200/70">Density</span>
            <select
              value={selection.density}
              onChange={handleDensityChange}
              className="bg-black/70 border border-cyan-500/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              {options.visualizer.density.map((option) => (
                <option key={option} value={option}>
                  {option.replace('_', ' ')}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-cyan-200/70">Speed</span>
            <select
              value={selection.speed}
              onChange={handleSpeedChange}
              className="bg-black/70 border border-cyan-500/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              {options.visualizer.speed.map((option) => (
                <option key={option} value={option}>
                  {option.replace('_', ' ')}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-cyan-200/70">Reactivity</span>
            <select
              value={selection.reactivity}
              onChange={handleReactivityChange}
              className="bg-black/70 border border-cyan-500/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              {options.visualizer.reactivity.map((option) => (
                <option key={option} value={option}>
                  {option.replace('_', ' ')}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-cyan-200/70">Color Scheme</span>
            <select
              value={selection.colorScheme}
              onChange={handleColorChange}
              className="bg-black/70 border border-cyan-500/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              {options.visualizer.colorScheme.map((option) => (
                <option key={option} value={option}>
                  {option.replace('_', ' ')}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="bg-black/60 border border-purple-500/30 rounded-xl p-4 shadow-lg shadow-purple-500/10">
        <h2 className="text-lg font-semibold text-purple-200 mb-3">Interaction Behavior</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-purple-200/70">Hover Effect</span>
            <select
              value={selection.hoverEffect}
              onChange={handleHoverEffectChange}
              className="bg-black/70 border border-purple-500/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              {options.interactions.hover.map((option) => (
                <option key={option} value={option}>
                  {option.replace('_', ' ')}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-purple-200/70">Click Effect</span>
            <select
              value={selection.clickEffect}
              onChange={handleClickEffectChange}
              className="bg-black/70 border border-purple-500/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              {options.interactions.click.map((option) => (
                <option key={option} value={option}>
                  {option.replace('_', ' ')}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-purple-200/70">Scroll Effect</span>
            <select
              value={selection.scrollEffect}
              onChange={handleScrollEffectChange}
              className="bg-black/70 border border-purple-500/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              {options.interactions.scroll.map((option) => (
                <option key={option} value={option}>
                  {option.replace('_', ' ')}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="bg-black/60 border border-sky-500/30 rounded-xl p-4 shadow-lg shadow-sky-500/10">
        <h2 className="text-lg font-semibold text-sky-200 mb-3">Transition Style</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-sky-200/70">Page Transition</span>
            <select
              value={selection.pageTransition}
              onChange={handlePageTransitionChange}
              className="bg-black/70 border border-sky-500/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              {options.transitions.page.map((option) => (
                <option key={option} value={option}>
                  {option.replace('_', ' ')}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-sky-200/70">Card Transition</span>
            <select
              value={selection.cardTransition}
              onChange={handleCardTransitionChange}
              className="bg-black/70 border border-sky-500/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              {options.transitions.card.map((option) => (
                <option key={option} value={option}>
                  {option.replace('_', ' ')}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="bg-black/60 border border-emerald-500/30 rounded-xl p-4 shadow-lg shadow-emerald-500/10">
        <h2 className="text-lg font-semibold text-emerald-200 mb-3">Advanced Tuning</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs text-emerald-200/80">
              <span>Global Speed Multiplier</span>
              <span>{selection.globalSpeedMultiplier.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={3}
              step={0.1}
              value={selection.globalSpeedMultiplier}
              onChange={(event) => setSelection({ globalSpeedMultiplier: parseFloat(event.target.value) })}
              className="w-full accent-emerald-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-emerald-200/80">
              <span>Interaction Sensitivity</span>
              <span>{selection.interactionSensitivity.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={2}
              step={0.1}
              value={selection.interactionSensitivity}
              onChange={(event) => setSelection({ interactionSensitivity: parseFloat(event.target.value) })}
              className="w-full accent-emerald-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-emerald-200/80">
              <span>Transition Duration</span>
              <span>{selection.transitionDurationMultiplier.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.1}
              value={selection.transitionDurationMultiplier}
              onChange={(event) => setSelection({ transitionDurationMultiplier: parseFloat(event.target.value) })}
              className="w-full accent-emerald-400"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default StyleSettingsPanel;
