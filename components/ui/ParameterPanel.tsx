/**
 * VIB3CODE-0 Parameter Control Panel
 * 
 * Real-time parameter control interface implementing exact PDF specification:
 * - 10 core parameters with exact ranges
 * - Zustand store integration with immediate visual feedback
 * - Section-specific parameter derivation display
 * - Randomization and reset functionality
 */

'use client';

import { useStore, useHomeParams, useEvents, DEFAULT_HOME_PARAMS, randomizeHomeParams, SECTION_CONFIGS } from '@/lib/store';
import { useState } from 'react';

interface ParameterSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  unit?: string;
}

function ParameterSlider({ label, value, min, max, step, onChange, unit = '' }: ParameterSliderProps) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-300">
          {label}
        </label>
        <span className="text-xs text-cyan-400 font-mono">
          {typeof value === 'number' ? value.toFixed(3) : '0.000'}{unit}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer slider-holographic"
        />
        <div 
          className="absolute top-0 left-0 h-2 bg-gradient-to-r from-cyan-500 to-magenta-500 rounded-lg pointer-events-none"
          style={{ 
            width: `${((value - min) / (max - min)) * 100}%`,
            opacity: 0.6
          }}
        />
      </div>
    </div>
  );
}

export default function ParameterPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const homeParams = useHomeParams();
  const events = useEvents();
  const focus = useStore((state) => state.focus);
  const sections = useStore((state) => state.sections);
  
  // Parameter update handlers
  const updateParam = (key: keyof typeof homeParams, value: number) => {
    events.UPDATE_HOME({ [key]: value });
  };
  
  const handleRandomize = () => {
    events.RANDOMIZE_HOME();
  };
  
  const handleReset = () => {
    events.UPDATE_HOME(DEFAULT_HOME_PARAMS);
  };
  
  const handleRandomizeParameter = (key: keyof typeof homeParams) => {
    const random = randomizeHomeParams();
    updateParam(key, random[key]);
  };
  
  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="fixed bottom-4 right-4 z-50 md:hidden bg-black/40 backdrop-blur-md border border-cyan-500/30 rounded-full p-3 text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      </button>
      
      {/* Parameter panel */}
      <div className={`fixed top-4 right-4 w-80 bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6 z-40 transition-all duration-300 ${
        isExpanded ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">VIB3 Parameters</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleRandomize}
              className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
              title="Randomize All"
            >
              Random
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1 bg-gray-700 text-white text-xs rounded-full hover:bg-gray-600 transition-all duration-300"
              title="Reset to Defaults"
            >
              Reset
            </button>
          </div>
        </div>
        
        {/* Current focus indicator */}
        {focus && (
          <div className="mb-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <div className="text-xs text-cyan-400 font-medium mb-1">ACTIVE SECTION</div>
            <div className="text-sm text-white">{SECTION_CONFIGS[focus]?.name || focus}</div>
          </div>
        )}
        
        {/* Parameter Controls */}
        <div className="space-y-1">
          {/* Hue */}
          <div className="relative">
            <ParameterSlider
              label="Hue"
              value={homeParams.hue || 0}
              min={0}
              max={1}
              step={0.001}
              onChange={(value) => updateParam('hue', value)}
            />
            <button
              onClick={() => handleRandomizeParameter('hue')}
              className="absolute top-0 right-8 text-xs text-gray-500 hover:text-cyan-400 transition-colors"
              title="Randomize Hue"
            >
              ⚃
            </button>
          </div>
          
          {/* Density */}
          <div className="relative">
            <ParameterSlider
              label="Density"
              value={homeParams.density || 0}
              min={0}
              max={1}
              step={0.01}
              onChange={(value) => updateParam('density', value)}
            />
            <button
              onClick={() => handleRandomizeParameter('density')}
              className="absolute top-0 right-8 text-xs text-gray-500 hover:text-cyan-400 transition-colors"
              title="Randomize Density"
            >
              ⚃
            </button>
          </div>
          
          {/* Morph */}
          <div className="relative">
            <ParameterSlider
              label="Morph"
              value={homeParams.morph || 0}
              min={0}
              max={2}
              step={0.01}
              onChange={(value) => updateParam('morph', value)}
            />
            <button
              onClick={() => handleRandomizeParameter('morph')}
              className="absolute top-0 right-8 text-xs text-gray-500 hover:text-cyan-400 transition-colors"
              title="Randomize Morph"
            >
              ⚃
            </button>
          </div>
          
          {/* Chaos */}
          <div className="relative">
            <ParameterSlider
              label="Chaos"
              value={homeParams.chaos || 0}
              min={0}
              max={1}
              step={0.01}
              onChange={(value) => updateParam('chaos', value)}
            />
            <button
              onClick={() => handleRandomizeParameter('chaos')}
              className="absolute top-0 right-8 text-xs text-gray-500 hover:text-cyan-400 transition-colors"
              title="Randomize Chaos"
            >
              ⚃
            </button>
          </div>
          
          {/* Noise Frequency */}
          <div className="relative">
            <ParameterSlider
              label="Noise Freq"
              value={homeParams.noiseFreq || 0}
              min={0.5}
              max={5}
              step={0.1}
              onChange={(value) => updateParam('noiseFreq', value)}
              unit="Hz"
            />
            <button
              onClick={() => handleRandomizeParameter('noiseFreq')}
              className="absolute top-0 right-8 text-xs text-gray-500 hover:text-cyan-400 transition-colors"
              title="Randomize Noise Frequency"
            >
              ⚃
            </button>
          </div>
          
          {/* Glitch */}
          <div className="relative">
            <ParameterSlider
              label="Glitch"
              value={homeParams.glitch || 0}
              min={0}
              max={1}
              step={0.01}
              onChange={(value) => updateParam('glitch', value)}
            />
            <button
              onClick={() => handleRandomizeParameter('glitch')}
              className="absolute top-0 right-8 text-xs text-gray-500 hover:text-cyan-400 transition-colors"
              title="Randomize Glitch"
            >
              ⚃
            </button>
          </div>
          
          {/* Displacement Amplitude */}
          <div className="relative">
            <ParameterSlider
              label="Displacement"
              value={homeParams.dispAmp || 0}
              min={0}
              max={1}
              step={0.01}
              onChange={(value) => updateParam('dispAmp', value)}
            />
            <button
              onClick={() => handleRandomizeParameter('dispAmp')}
              className="absolute top-0 right-8 text-xs text-gray-500 hover:text-cyan-400 transition-colors"
              title="Randomize Displacement"
            >
              ⚃
            </button>
          </div>
          
          {/* Chroma Shift */}
          <div className="relative">
            <ParameterSlider
              label="Chroma Shift"
              value={homeParams.chromaShift || 0}
              min={0}
              max={0.2}
              step={0.001}
              onChange={(value) => updateParam('chromaShift', value)}
            />
            <button
              onClick={() => handleRandomizeParameter('chromaShift')}
              className="absolute top-0 right-8 text-xs text-gray-500 hover:text-cyan-400 transition-colors"
              title="Randomize Chroma Shift"
            >
              ⚃
            </button>
          </div>
          
          {/* Time Scale */}
          <div className="relative">
            <ParameterSlider
              label="Time Scale"
              value={homeParams.timeScale || 0}
              min={0.1}
              max={3}
              step={0.1}
              onChange={(value) => updateParam('timeScale', value)}
              unit="x"
            />
            <button
              onClick={() => handleRandomizeParameter('timeScale')}
              className="absolute top-0 right-8 text-xs text-gray-500 hover:text-cyan-400 transition-colors"
              title="Randomize Time Scale"
            >
              ⚃
            </button>
          </div>
          
          {/* Beat Phase (Read-only, managed by system) */}
          <div className="opacity-60">
            <ParameterSlider
              label="Beat Phase"
              value={homeParams.beatPhase || 0}
              min={0}
              max={1}
              step={0.001}
              onChange={() => {}} // Read-only, managed by TICK/CLOCK_BEAT events
              unit="φ"
            />
          </div>
        </div>
        
        {/* Section derivations preview */}
        {focus && sections[focus] && (
          <div className="mt-6 pt-4 border-t border-white/10">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Section Derivation</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Hue:</span>
                <span className="text-cyan-400 ml-1 font-mono">
                  {(sections[focus].hue || 0).toFixed(3)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Density:</span>
                <span className="text-cyan-400 ml-1 font-mono">
                  {(sections[focus].density || 0).toFixed(3)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Morph:</span>
                <span className="text-cyan-400 ml-1 font-mono">
                  {(sections[focus].morph || 0).toFixed(3)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Chaos:</span>
                <span className="text-cyan-400 ml-1 font-mono">
                  {(sections[focus].chaos || 0).toFixed(3)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Overlay for mobile when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
}