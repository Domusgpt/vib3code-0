'use client';

import { DesignSystemProvider } from '@/vib34d-design-system/core/design-system-context';
import StyleSettingsPanel from '@/vib34d-design-system/components/editor-interface/StyleSettingsPanel';
import ContentManagementPanel from '@/vib34d-design-system/components/content-management/ContentManagementPanel';
import DesignSystemPreview from '@/vib34d-design-system/components/preview-system/DesignSystemPreview';

export default function VIB34DDesignSystemPage() {
  return (
    <DesignSystemProvider>
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 space-y-12">
          <header className="space-y-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              VIB34D Design System Architecture
            </h1>
            <p className="text-white/70 max-w-3xl mx-auto">
              Configure mathematically coordinated interactions, transitions, and content behaviors using the VIB34D preset bank. All visual responses update in real time using the unified engine.
            </p>
          </header>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            <div className="lg:col-span-2">
              <DesignSystemPreview />
            </div>
            <aside className="space-y-6">
              <StyleSettingsPanel />
            </aside>
          </section>

          <section className="bg-black/60 border border-cyan-500/30 rounded-3xl p-6 shadow-lg shadow-cyan-500/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-cyan-200">Content Management</h2>
              <span className="text-xs uppercase tracking-wide text-white/50">Scrollable grid, video expansion, and more</span>
            </div>
            <ContentManagementPanel />
          </section>
        </div>
      </div>
    </DesignSystemProvider>
  );
}
