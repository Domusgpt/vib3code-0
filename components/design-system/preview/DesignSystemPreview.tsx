/**
 * VIB34D Design System - Live Preview Component
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 * "The Revolution Will Not be in a Structured Format"
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 */

'use client';

import { useEffect, useRef } from 'react';
import { useDesignSystemContext } from '@/lib/design-system/context/provider';

export function DesignSystemPreview() {
  const { currentState, engine, isInitialized } = useDesignSystemContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !engine || !isInitialized) return;
    const context = canvasRef.current.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    context.fillStyle = 'rgba(56, 189, 248, 0.35)';
    context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    context.fillStyle = 'rgba(15, 118, 110, 0.65)';
    context.fillRect(0, canvasRef.current.height - 6, canvasRef.current.width, 6);
  }, [engine, isInitialized]);

  const demoCards = [
    {
      title: "Visualizer State",
      description: "Real-time particle system",
      metrics: {
        density: currentState?.visualizer?.density || 0,
        speed: currentState?.visualizer?.speed || 0,
        particles: currentState?.visualizer?.particleCount || 0
      }
    },
    {
      title: "Interaction Layer",
      description: "Hover and click responses",
      metrics: {
        sensitivity: currentState?.interactions?.sensitivity || 0,
        active: currentState?.interactions?.activeInteractions || 0,
        effect: currentState?.interactions?.hoverEffect || 'none'
      }
    },
    {
      title: "Transition Engine",
      description: "Page and component transitions",
      metrics: {
        duration: currentState?.transitions?.duration || 0,
        active: currentState?.transitions?.activeTransitions?.length || 0,
        type: currentState?.transitions?.pageTransition || 'none'
      }
    }
  ];

  return (
    <div className="bg-black/40 border border-cyan-500/20 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-cyan-500/20">
        <h2 className="text-xl font-bold text-white mb-2">Live Preview</h2>
        <p className="text-sm text-gray-400">Real-time visualization of current system state</p>
      </div>

      {/* Canvas Preview Area */}
      <div className="relative h-64 bg-gradient-to-br from-black via-slate-900 to-black">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          width={800}
          height={256}
        />

        {!isInitialized && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <div className="text-cyan-400 font-medium">Initializing Engine...</div>
            </div>
          </div>
        )}

        {/* Performance Overlay */}
        {isInitialized && currentState && (
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur rounded-lg p-3 text-xs font-mono">
            <div className="text-emerald-400 font-semibold mb-1">Performance</div>
            <div className="space-y-1 text-gray-300">
              <div>FPS: {currentState.performance?.fps || 0}</div>
              <div>Memory: {currentState.performance?.memoryUsage || 0}MB</div>
              <div>Render: {currentState.performance?.renderTime || 0}ms</div>
            </div>
          </div>
        )}
      </div>

      {/* State Cards */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {demoCards.map((card) => (
          <div
            key={card.title}
            className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            <h3 className="font-semibold text-white mb-2">{card.title}</h3>
            <p className="text-sm text-gray-400 mb-3">{card.description}</p>
            <div className="space-y-1 text-xs font-mono">
              {Object.entries(card.metrics).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-500">{key}:</span>
                  <span className="text-cyan-300">{
                    typeof value === 'number' ? value.toFixed(2) : value
                  }</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Demo Controls */}
      <div className="p-6 border-t border-cyan-500/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Interactive Demo</h3>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-emerald-500/30 text-emerald-200 rounded-full text-xs hover:bg-emerald-500/50 transition-colors">
              Play
            </button>
            <button className="px-3 py-1 bg-red-500/30 text-red-200 rounded-full text-xs hover:bg-red-500/50 transition-colors">
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {['Hover Me', 'Click Me', 'Drag Me', 'Scroll Me'].map((label, index) => (
            <button
              key={label}
              className="py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white rounded-lg text-sm hover:from-cyan-500/40 hover:to-purple-500/40 transition-all duration-300 transform hover:scale-105"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}