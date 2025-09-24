'use client';

import { useEffect, useState } from 'react';
import { DesignSystemEditor } from '@/vib34d-design-system/components/editor-interface/DesignSystemEditor';
import ContentManagementPanel from '@/vib34d-design-system/components/content-management/ContentManagementPanel';
import PreviewSurface from '@/vib34d-design-system/components/preview-system/PreviewSurface';
import type { VIB34DState, VIB34DSystem } from '@/vib34d-design-system/core/visualizer-engine';

function PerformanceStatus({ state }: { state: VIB34DState | null }) {
  const [metrics, setMetrics] = useState({
    memory: 0,
    loadTime: 0,
    uptime: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const performanceAny = performance as unknown as { memory?: { usedJSHeapSize: number }; timing?: PerformanceTiming };
      const memory = performanceAny.memory ? performanceAny.memory.usedJSHeapSize / 1024 / 1024 : 0;
      const timing = performanceAny.timing;
      const loadTime = timing ? Math.max(0, timing.loadEventEnd - timing.navigationStart) : 0;
      setMetrics({
        memory,
        loadTime,
        uptime: Math.floor(performance.now() / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black/40 border border-cyan-500/20 rounded-2xl p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white">System Diagnostics</h3>
        <p className="text-sm text-gray-400">Live rendering metrics and global multipliers.</p>
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-emerald-400">{metrics.memory.toFixed(1)} MB</div>
          <div className="text-xs text-gray-400">Heap usage</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-amber-400">{metrics.loadTime.toFixed(0)} ms</div>
          <div className="text-xs text-gray-400">Page load</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-cyan-400">{metrics.uptime}s</div>
          <div className="text-xs text-gray-400">Uptime</div>
        </div>
      </div>
      {state && (
        <div className="grid grid-cols-3 gap-3 text-xs font-mono text-cyan-100">
          <div>Speed × {state.customization.speedMultiplier.toFixed(2)}</div>
          <div>Sensitivity × {state.customization.sensitivityMultiplier.toFixed(2)}</div>
          <div>Transition × {state.customization.transitionDurationMultiplier.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [system, setSystem] = useState<VIB34DSystem | null>(null);
  const [state, setState] = useState<VIB34DState | null>(null);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-cyan-500/30 bg-black/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.4em] text-cyan-400">VIB3CODE</div>
            <h1 className="text-3xl font-black">Reactive HyperAV Control Center</h1>
          </div>
          <div className="text-sm text-gray-400">
            Coordinated design system orchestration
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <DesignSystemEditor
          onStateChange={(nextState, instance) => {
            setSystem(instance);
            setState(nextState);
          }}
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {system && state ? (
            <PreviewSurface state={state} system={system} />
          ) : (
            <div className="bg-black/40 border border-cyan-500/20 rounded-2xl p-6 text-sm text-gray-400">
              Live preview initializes when the design system is ready.
            </div>
          )}
          <PerformanceStatus state={state} />
        </div>

        <ContentManagementPanel />
      </main>
    </div>
  );
}
