'use client';

/**
 * VIB34D Hybrid Foundation 2.0 - Enhanced Demo Page
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 *
 * Demonstrates Hybrid Foundation parameter cascades and consciousness feedback
 * within a dedicated demo scene.
 *
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 */

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import VIB3EngineEnhanced from '@/components/VIB3EngineEnhanced';
import {
  VIB3SystemsProvider,
  useVisualConsciousness,
} from '@/hooks/useVIB3Systems';
import type { LayerType } from '@/lib/vib34d-home-master';

const LAYERS: LayerType[] = ['background', 'shadow', 'content', 'highlight', 'accent'];

function ConsciousnessPanel() {
  const snapshot = useVisualConsciousness();
  return (
    <div className="mt-8 rounded-lg border border-cyan-500/30 bg-black/40 p-6 backdrop-blur">
      <h2 className="text-lg font-semibold text-cyan-300">Visual Consciousness Metrics</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-cyan-100/80">
        <div>
          <div className="text-xs uppercase tracking-wide text-cyan-400/70">Awareness</div>
          <div className="text-2xl font-bold text-cyan-200">{snapshot.awareness.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-cyan-400/70">Emergence</div>
          <div className="text-2xl font-bold text-cyan-200">{snapshot.emergence.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-cyan-400/70">Coherence</div>
          <div className="text-2xl font-bold text-cyan-200">{snapshot.coherence.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-cyan-400/70">Flux</div>
          <div className="text-2xl font-bold text-cyan-200">{snapshot.flux.toFixed(2)}</div>
        </div>
      </div>
      <div className="mt-6">
        <div className="text-xs uppercase tracking-wide text-cyan-400/70 mb-2">Recent Memory</div>
        <ul className="space-y-1 text-xs text-cyan-200/70 max-h-32 overflow-auto">
          {snapshot.memory.slice(0, 6).map((entry) => (
            <li key={entry} className="font-mono">{entry}</li>
          ))}
          {snapshot.memory.length === 0 && (
            <li className="text-cyan-200/40">No events recorded yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function EnhancedDemoScene() {
  return (
    <div className="relative h-[540px] w-full overflow-hidden rounded-xl border border-cyan-500/30 bg-black/60">
      <Canvas camera={{ position: [0, 0, 6], fov: 55 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          {LAYERS.map((layer, index) => (
            <VIB3EngineEnhanced
              key={layer}
              sectionId="home"
              layerType={layer}
              visualizerId={`enhanced-${layer}`}
              hoverMeta={{ index, total: LAYERS.length }}
              pointSize={layer === 'content' ? 3.2 : 2.4}
              opacity={layer === 'background' ? 0.6 : 0.9}
            />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
}

export default function EnhancedDemoPage() {
  return (
    <VIB3SystemsProvider>
      <main className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black text-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16">
          <header className="space-y-4 text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-cyan-400/70">Hybrid Foundation 2.0</p>
            <h1 className="text-4xl font-black md:text-5xl">VIB34D Enhanced Parameter Web Demo</h1>
            <p className="text-base text-cyan-100/70 md:text-lg">
              Hover the holographic layers to experience cascade relationships and observe the live
              consciousness metrics.
            </p>
          </header>

          <EnhancedDemoScene />
          <ConsciousnessPanel />
        </div>
      </main>
    </VIB3SystemsProvider>
  );
}
