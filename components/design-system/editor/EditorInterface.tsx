/**
 * VIB34D Design System - Main Editor Interface
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 * "The Revolution Will Not be in a Structured Format"
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 */

'use client';

import { useState } from 'react';
import { useDesignSystemContext } from '@/lib/design-system/context/provider';
import { PresetCategory } from '@/lib/design-system/types/core';

export function EditorInterface() {
  const { currentState, updatePreset, presets } = useDesignSystemContext();
  const [activeCategory, setActiveCategory] = useState<PresetCategory>('visualizer');

  const categories: { key: PresetCategory; label: string; color: string }[] = [
    { key: 'visualizer', label: 'Visualizer', color: 'cyan' },
    { key: 'interactions', label: 'Interactions', color: 'purple' },
    { key: 'transitions', label: 'Transitions', color: 'emerald' },
    { key: 'effects', label: 'Effects', color: 'amber' }
  ];

  const handlePresetChange = (category: PresetCategory, presetName: string) => {
    updatePreset(category, presetName);
  };

  return (
    <div className="bg-black/60 border border-cyan-500/30 rounded-2xl p-6 space-y-6">
      <header>
        <h2 className="text-xl font-bold text-white mb-2">Design System Editor</h2>
        <p className="text-sm text-gray-400">Configure preset banks and system behaviors</p>
      </header>

      {/* Category Tabs */}
      <div className="flex space-x-2 bg-black/40 p-2 rounded-lg">
        {categories.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeCategory === key
                ? `bg-${color}-500/30 text-${color}-200 border border-${color}-500/50`
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Preset Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white capitalize">
          {activeCategory} Presets
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {presets[activeCategory]?.map((preset) => (
            <div
              key={preset.name}
              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-cyan-400/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white">{preset.name}</h4>
                <button
                  onClick={() => handlePresetChange(activeCategory, preset.name)}
                  className="px-3 py-1 bg-cyan-500/30 text-cyan-200 rounded-full text-xs hover:bg-cyan-500/50 transition-colors"
                >
                  Apply
                </button>
              </div>
              <p className="text-sm text-gray-400 mb-3">{preset.metadata.description}</p>

              <div className="flex items-center justify-between text-xs">
                <div className="flex space-x-4">
                  <span className="text-gray-500">
                    Performance: <span className="text-white">{preset.metadata.performance}</span>
                  </span>
                  <span className="text-gray-500">
                    Complexity: <span className="text-white">{preset.metadata.complexity}</span>
                  </span>
                </div>
                <div className="flex space-x-1">
                  {preset.metadata.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-white/10 text-gray-300 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
        <h4 className="font-semibold text-emerald-200 mb-2">System Status</h4>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-400">FPS:</span>
            <span className="text-emerald-200 ml-2">{currentState?.performance?.fps || 60}</span>
          </div>
          <div>
            <span className="text-gray-400">Memory:</span>
            <span className="text-emerald-200 ml-2">{currentState?.performance?.memoryUsage || 0}MB</span>
          </div>
          <div>
            <span className="text-gray-400">Render Time:</span>
            <span className="text-emerald-200 ml-2">{currentState?.performance?.renderTime || 0}ms</span>
          </div>
          <div>
            <span className="text-gray-400">Interactions:</span>
            <span className="text-emerald-200 ml-2">{currentState?.interactions?.activeInteractions || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}