/**
 * VIB3CODE-0 Admin Dashboard
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 * "The Revolution Will Not be in a Structured Format"
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 *
 * Owner/Editor control panel for:
 * - Holographic parameter controls
 * - Content management
 * - Visual effects customization
 * - Site configuration
 */

'use client';

import React, { useEffect, useState } from 'react';

// Parameter control component
function ParameterControl({ 
  label, 
  value, 
  onChange, 
  min = 0, 
  max = 1, 
  step = 0.01,
  description 
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-cyan-400">{label}</label>
        <span className="text-sm text-gray-400 font-mono">
          {typeof value === 'number' ? value.toFixed(3) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
      />
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </div>
  );
}

// Live preview component (simplified without broken dependencies)
function LivePreview() {
  const [params, setParams] = useState({
    hue: 0.5,
    density: 0.5,
    morph: 0.5,
    chaos: 0.2
  });

  return (
    <div className="bg-black/50 rounded-lg border border-cyan-500/30 overflow-hidden">
      <div className="p-4 border-b border-cyan-500/20">
        <h3 className="text-lg font-bold text-cyan-400">Live Preview</h3>
        <p className="text-sm text-gray-400">Visual effects preview (WebGL integration pending)</p>
      </div>
      <div className="aspect-video relative bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-cyan-400 mb-4 animate-pulse">VIB3CODE</div>
          <div className="text-sm text-gray-400">Holographic effects preview</div>
        </div>
        
        {/* Parameter overlay */}
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded p-3 text-xs font-mono">
          <div className="grid grid-cols-2 gap-2 text-cyan-300">
            <div>Hue: {(params.hue * 360).toFixed(0)}°</div>
            <div>Density: {(params.density * 100).toFixed(0)}%</div>
            <div>Morph: {params.morph.toFixed(3)}</div>
            <div>Chaos: {(params.chaos * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick presets
function QuickPresets({ onApplyPreset }: { onApplyPreset: (params: any) => void }) {
  const presets = [
    {
      name: 'Calm Focus',
      params: { hue: 0.6, density: 0.3, morph: 0.2, chaos: 0.1, glitch: 0.05, timeScale: 0.8 }
    },
    {
      name: 'Dynamic Energy', 
      params: { hue: 0.1, density: 0.7, morph: 0.8, chaos: 0.6, glitch: 0.2, timeScale: 1.2 }
    },
    {
      name: 'Ethereal Flow',
      params: { hue: 0.8, density: 0.5, morph: 0.6, chaos: 0.3, glitch: 0.1, timeScale: 1.0 }
    },
    {
      name: 'Minimal Clean',
      params: { hue: 0.5, density: 0.2, morph: 0.1, chaos: 0.05, glitch: 0.02, timeScale: 0.6 }
    }
  ];

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-cyan-400 mb-4">Quick Presets</h3>
      <div className="grid grid-cols-2 gap-3">
        {presets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => onApplyPreset(preset.params)}
            className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors border border-gray-600 hover:border-cyan-500/50"
          >
            <div className="font-medium text-white text-sm">{preset.name}</div>
            <div className="text-xs text-gray-400 mt-1">
              H:{(preset.params.hue * 360).toFixed(0)}° D:{(preset.params.density * 100).toFixed(0)}% 
              M:{preset.params.morph.toFixed(1)} C:{(preset.params.chaos * 100).toFixed(0)}%
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Site stats component (simplified)
function SiteStats() {
  const [stats, setStats] = useState({
    memoryUsage: 0,
    loadTime: 0,
    uptime: 0
  });

  useEffect(() => {
    const updateStats = () => {
      setStats({
        memoryUsage: (performance as any).memory ? (performance as any).memory.usedJSHeapSize / 1024 / 1024 : 0,
        loadTime: performance.timing ? performance.timing.loadEventEnd - performance.timing.navigationStart : 0,
        uptime: Math.floor(performance.now() / 1000)
      });
    };

    const interval = setInterval(updateStats, 1000);
    updateStats();
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900/50 rounded-lg p-4 mb-8">
      <h3 className="text-lg font-bold text-cyan-400 mb-4">System Status</h3>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-green-400">{stats.memoryUsage.toFixed(1)}MB</div>
          <div className="text-xs text-gray-400">Memory Usage</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-yellow-400">{stats.loadTime}ms</div>
          <div className="text-xs text-gray-400">Load Time</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-cyan-400">{stats.uptime}s</div>
          <div className="text-xs text-gray-400">Uptime</div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [params, setParams] = useState({
    hue: 0.5,
    density: 0.5,
    morph: 0.5,
    chaos: 0.2,
    glitch: 0.1,
    timeScale: 1.0,
    noiseFreq: 2.0
  });

  const updateParam = (key: string, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const applyPreset = (presetParams: any) => {
    setParams(prev => ({ ...prev, ...presetParams }));
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-cyan-500/30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-cyan-400">VIB3CODE Admin</h1>
              <p className="text-gray-400 text-sm">Visual Effects & Content Management</p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm font-medium transition-colors"
              >
                View Site
              </button>
              <button 
                onClick={() => setParams({ hue: 0.5, density: 0.5, morph: 0.5, chaos: 0.2, glitch: 0.1, timeScale: 1.0, noiseFreq: 2.0 })}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Control Panel */}
          <div className="space-y-8">
            <div className="bg-gray-900/50 rounded-lg p-6">
              <h2 className="text-xl font-bold text-cyan-400 mb-6">Holographic Parameters</h2>
              
              <QuickPresets onApplyPreset={applyPreset} />

              <div className="space-y-6">
                <ParameterControl
                  label="Hue Rotation"
                  value={params.hue}
                  onChange={(value) => updateParam('hue', value)}
                  min={0}
                  max={1}
                  description="Base color hue (0-360°)"
                />

                <ParameterControl
                  label="Density"
                  value={params.density}
                  onChange={(value) => updateParam('density', value)}
                  min={0}
                  max={1}
                  description="Particle/mesh density"
                />

                <ParameterControl
                  label="Morph Factor"
                  value={params.morph}
                  onChange={(value) => updateParam('morph', value)}
                  min={0}
                  max={2}
                  description="Shape transformation amount"
                />

                <ParameterControl
                  label="Chaos Level"
                  value={params.chaos}
                  onChange={(value) => updateParam('chaos', value)}
                  min={0}
                  max={1}
                  description="Turbulence/noise amplitude"
                />

                <ParameterControl
                  label="Glitch Intensity"
                  value={params.glitch}
                  onChange={(value) => updateParam('glitch', value)}
                  min={0}
                  max={0.5}
                  description="Digital glitch effects"
                />

                <ParameterControl
                  label="Time Scale"
                  value={params.timeScale}
                  onChange={(value) => updateParam('timeScale', value)}
                  min={0.1}
                  max={3}
                  description="Animation speed multiplier"
                />

                <ParameterControl
                  label="Noise Frequency"
                  value={params.noiseFreq}
                  onChange={(value) => updateParam('noiseFreq', value)}
                  min={0.5}
                  max={5}
                  step={0.1}
                  description="Domain noise frequency"
                />
              </div>
            </div>

            <SiteStats />
          </div>

          {/* Preview Panel */}
          <div className="space-y-8">
            <LivePreview />
            
            <div className="bg-gray-900/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-cyan-400 mb-4">AI Research Automation</h3>

              {/* Research Ingestion Controls */}
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-gradient-to-r from-purple-900/20 to-cyan-900/20 rounded-lg border border-cyan-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-white font-medium">Daily Research Ingestion</div>
                      <div className="text-sm text-gray-400">Automatically publish AI research</div>
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                      Active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={async () => {
                        const res = await fetch('/api/research/schedule', {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SCHEDULE_SECRET || 'schedule-secret'}`,
                            'Content-Type': 'application/json'
                          }
                        });
                        const data = await res.json();
                        alert(data.success ? 'Research automation triggered!' : 'Failed to trigger automation');
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm font-medium transition-colors"
                    >
                      🚀 Run Now
                    </button>
                    <button
                      onClick={() => alert('Upload feature coming soon!')}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-sm font-medium transition-colors"
                    >
                      📤 Upload Research
                    </button>
                  </div>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <div>✅ Randomizes holographic parameters for each post</div>
                  <div>✅ Auto-categorizes based on content analysis</div>
                  <div>✅ Runs daily at 9 AM or manually via button</div>
                </div>
              </div>

              {/* Manual Content Management */}
              <h4 className="text-sm font-bold text-cyan-400 mb-3">Manual Content</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                  <div>
                    <div className="text-white font-medium text-sm">AI News Articles</div>
                    <div className="text-xs text-gray-400">Manage AI research posts</div>
                  </div>
                  <button className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded text-xs font-medium transition-colors">
                    Edit
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                  <div>
                    <div className="text-white font-medium text-sm">Vibe Coding Posts</div>
                    <div className="text-xs text-gray-400">Creative programming content</div>
                  </div>
                  <button className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded text-xs font-medium transition-colors">
                    Edit
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                  <div>
                    <div className="text-white font-medium text-sm">Philosophy Articles</div>
                    <div className="text-xs text-gray-400">AI ethics and philosophical content</div>
                  </div>
                  <button className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded text-xs font-medium transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-cyan-400 mb-4">Export Settings</h3>
              <div className="space-y-3">
                <button className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors">
                  <div className="font-medium text-white">Export Current Settings</div>
                  <div className="text-sm text-gray-400">Save parameter configuration as JSON</div>
                </button>
                
                <button className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors">
                  <div className="font-medium text-white">Generate CSS Theme</div>
                  <div className="text-sm text-gray-400">Create CSS variables from current parameters</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for slider styling */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #00bcd4;
          cursor: pointer;
          border: 2px solid #000;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #00bcd4;
          cursor: pointer;
          border: 2px solid #000;
        }
      `}</style>
    </div>
  );
}