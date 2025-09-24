'use client';

import { DesignSystemProvider } from '@/lib/design-system/context';
import { DesignSystemPreview } from '@/components/design-system/preview/DesignSystemPreview';
import { EditorInterface } from '@/components/design-system/editor/EditorInterface';

function HolographicBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-black" />
      <div className="absolute -left-20 top-10 h-[420px] w-[420px] rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-purple-500/20 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.25),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(244,114,182,0.15),transparent)]" />
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <DesignSystemProvider>
      <div className="relative min-h-screen overflow-x-hidden bg-black text-white">
        <HolographicBackdrop />
        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col gap-12 px-6 py-16">
          <header className="space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-cyan-200">
              VIB34D Reactive HyperAV Core
            </div>
            <h1 className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-4xl font-black uppercase tracking-tight text-transparent md:text-6xl">
              Design System Architecture
            </h1>
            <p className="mx-auto max-w-3xl text-sm text-cyan-100/80 md:text-base">
              A modular architecture that standardizes interactions, transitions, and content orchestration for the VIB34D StylePack.
              Hover, click, scroll, and expansion behaviors are mathematically coordinated and exposed through configurable preset banks.
            </p>
            <div className="mx-auto grid max-w-4xl gap-4 text-xs text-cyan-100/70 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-[10px] uppercase tracking-widest text-cyan-200/70">Interaction Stack</div>
                <div className="mt-2 text-sm font-semibold text-white/80">Hover & Click Response DSL</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-[10px] uppercase tracking-widest text-cyan-200/70">Transition Lattice</div>
                <div className="mt-2 text-sm font-semibold text-white/80">Outgoing↔Incoming Phase Coupling</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-[10px] uppercase tracking-widest text-cyan-200/70">Preset Banks</div>
                <div className="mt-2 text-sm font-semibold text-white/80">Visualizer · Interaction · Effects</div>
              </div>
            </div>
          </header>

          <main className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
              <DesignSystemPreview />
            </section>
            <aside className="space-y-10">
              <EditorInterface />
              <section className="rounded-3xl border border-white/10 bg-black/40 p-6 text-xs text-cyan-100/80">
                <div className="text-[10px] uppercase tracking-widest text-cyan-200/70">API Usage</div>
                <pre className="mt-3 overflow-auto rounded-2xl border border-white/10 bg-black/60 p-4 text-[11px] text-cyan-200/80">
{`const vib34d = new VIB34DSystem({
  container: '#app',
  presets: {
    visualizer: 'standard',
    interactions: 'responsive',
    transitions: 'slide_portal',
    effects: 'subtle_glow',
  },
  customization: {
    speedMultiplier: 1.2,
    sensitivityMultiplier: 0.8,
    transitionDurationMultiplier: 1.0,
  },
});

vib34d.switchPreset('visualizer', 'dense');
vib34d.switchPreset('transitions', 'glitch_burst');
`}
                </pre>
                <ul className="mt-4 space-y-2">
                  <li>• Preset banks load dynamically and can be extended with custom entries.</li>
                  <li>• Transition coordination conserves density and color harmonics during navigation.</li>
                  <li>• Editor actions emit real-time updates for visualizer engines and content sections.</li>
                </ul>
              </section>
            </aside>
          </main>

          <footer className="rounded-3xl border border-white/10 bg-white/5 p-6 text-xs text-cyan-200/70 backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-cyan-200/70">Success Metrics</div>
                <p className="text-sm text-white/80">Interaction consistency, transition smoothness, customization velocity, and system scalability are tracked across every module.</p>
              </div>
              <div className="grid gap-3 text-center md:grid-cols-4">
                <MetricBlock label="Hover/Click" value="Standardized" />
                <MetricBlock label="Frame Budget" value="&lt;16ms" />
                <MetricBlock label="Preset Switch" value="&lt;5 clicks" />
                <MetricBlock label="Integration" value="&lt;1 hour" />
              </div>
            </div>
          </footer>
        </div>
      </div>
    </DesignSystemProvider>
  );
}

function MetricBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
      <div className="text-[10px] uppercase tracking-widest text-cyan-200/70">{label}</div>
      <div className="text-sm font-semibold text-white/80">{value}</div>
    </div>
  );
}
