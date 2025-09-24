/**
 * VIB34D Design System - Live Preview Component
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 * "The Revolution Will Not be in a Structured Format"
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useDesignSystemContext } from '@/lib/design-system/context/provider';

export function DesignSystemPreview() {
  const {
    currentState,
    isInitialized,
    interactionCoordinator,
    transitionCoordinator
  } = useDesignSystemContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const interactionButtonsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!interactionCoordinator || !isInitialized) return;
    const sensitivity = currentState?.interactions.sensitivity ?? 0.5;
    const cleanups: Array<() => void> = [];
    const buttons = interactionButtonsRef.current;

    if (buttons[0]) {
      cleanups.push(interactionCoordinator.registerHoverHandler(buttons[0], {
        effect: currentState?.interactions.hoverEffect ?? 'lift_glow',
        intensity: sensitivity,
        duration: 240,
        easing: 'ease-out'
      }));
    }
    if (buttons[1]) {
      cleanups.push(interactionCoordinator.registerClickHandler(buttons[1], {
        effect: currentState?.interactions.clickEffect ?? 'ripple_expand',
        feedback: 'visual',
        propagation: false
      }));
    }
    if (buttons[2]) {
      cleanups.push(interactionCoordinator.registerHoverHandler(buttons[2], {
        effect: 'drag_curve',
        intensity: Math.min(1, sensitivity + 0.25),
        duration: 260,
        easing: 'ease-in-out'
      }));
    }
    if (buttons[3]) {
      cleanups.push(interactionCoordinator.registerScrollHandler(buttons[3], {
        direction: 'vertical',
        sensitivity,
        momentum: true
      }));
    }
    if (scrollAreaRef.current) {
      cleanups.push(interactionCoordinator.registerScrollHandler(scrollAreaRef.current, {
        direction: 'both',
        sensitivity,
        momentum: true
      }));
    }

    return () => cleanups.forEach((dispose) => dispose());
  }, [interactionCoordinator, isInitialized, currentState?.interactions]);

  const handlePlay = useCallback(async () => {
    if (!transitionCoordinator || !currentState) return;
    setIsTransitioning(true);
    try {
      await transitionCoordinator.executeTransition('preview', 'preview', {
        type: currentState.transitions.pageTransition,
        duration: currentState.transitions.duration,
        easing: currentState.transitions.easing,
        properties: ['opacity', 'transform']
      });
    } finally {
      setIsTransitioning(false);
    }
  }, [transitionCoordinator, currentState]);

  const handleReset = useCallback(async () => {
    if (!transitionCoordinator || !currentState) return;
    setIsTransitioning(true);
    try {
      await transitionCoordinator.executeTransition('preview', 'reset', {
        type: currentState.transitions.cardTransition,
        duration: Math.max(120, Math.round(currentState.transitions.duration * 0.6)),
        easing: currentState.transitions.easing,
        properties: ['transform', 'opacity']
      });
    } finally {
      setIsTransitioning(false);
    }
  }, [transitionCoordinator, currentState]);

  const demoCards = [
    {
      title: 'Visualizer State',
      description: 'Real-time particle system',
      metrics: {
        density: currentState?.visualizer?.density ?? 0,
        speed: currentState?.visualizer?.speed ?? 0,
        particles: currentState?.visualizer?.particleCount ?? 0
      }
    },
    {
      title: 'Interaction Layer',
      description: 'Hover and click responses',
      metrics: {
        sensitivity: currentState?.interactions?.sensitivity ?? 0,
        active: currentState?.interactions?.activeInteractions ?? 0,
        last: currentState?.interactions?.lastInteractionType ?? 'none'
      }
    },
    {
      title: 'Transition Engine',
      description: 'Page and component transitions',
      metrics: {
        duration: currentState?.transitions?.duration ?? 0,
        active: currentState?.transitions?.activeTransitions?.length ?? 0,
        current: currentState?.transitions?.currentTransition ?? 'idle'
      }
    }
  ];

  const activeTransitions = currentState?.transitions?.activeTransitions ?? [];
  const lastTransitionName = currentState?.transitions?.lastTransition?.name ?? 'none';

  return (
    <div className="bg-black/40 border border-cyan-500/20 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-cyan-500/20">
        <h2 className="text-xl font-bold text-white mb-2">Live Preview</h2>
        <p className="text-sm text-gray-400">Real-time visualization of current system state</p>
      </div>

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
              <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4" />
              <div className="text-cyan-400 font-medium">Initializing Engine...</div>
            </div>
          </div>
        )}

        {isInitialized && currentState && (
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur rounded-lg p-3 text-xs font-mono space-y-1 text-gray-300">
            <div className="text-emerald-400 font-semibold">Performance</div>
            <div>FPS: {currentState.performance?.fps ?? 0}</div>
            <div>Memory: {currentState.performance?.memoryUsage ?? 0}MB</div>
            <div>Render: {currentState.performance?.renderTime ?? 0}ms</div>
            <div>Transition: {currentState.transitions?.currentTransition ?? 'idle'}</div>
            <div>Active: {activeTransitions.length ? activeTransitions.join(', ') : 'none'}</div>
            <div>Last: {lastTransitionName}</div>
          </div>
        )}
      </div>

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
                  <span className="text-cyan-300">{typeof value === 'number' ? value.toFixed(2) : value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-cyan-500/20" ref={scrollAreaRef}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Interactive Demo</h3>
          <div className="flex space-x-2">
            <button
              onClick={handlePlay}
              disabled={!isInitialized || isTransitioning}
              className="px-3 py-1 bg-emerald-500/30 text-emerald-200 rounded-full text-xs hover:bg-emerald-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Play
            </button>
            <button
              onClick={handleReset}
              disabled={!isInitialized || isTransitioning}
              className="px-3 py-1 bg-red-500/30 text-red-200 rounded-full text-xs hover:bg-red-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {['Hover Me', 'Click Me', 'Drag Me', 'Scroll Me'].map((label, index) => (
            <button
              key={label}
              ref={(element) => (interactionButtonsRef.current[index] = element)}
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
