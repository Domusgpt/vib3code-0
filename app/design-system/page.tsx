/**
 * VIB34D Design System Management Interface
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 * "The Revolution Will Not be in a Structured Format"
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 */

'use client';

import { DesignSystemProvider } from '@/lib/design-system/context/provider';
import { EditorInterface } from '@/components/design-system/editor/EditorInterface';
import { DesignSystemPreview } from '@/components/design-system/preview/DesignSystemPreview';

export default function DesignSystemPage() {
  return (
    <DesignSystemProvider>
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 space-y-12">
          <header className="space-y-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              VIB34D Design System Architecture
            </h1>
            <p className="text-white/70 max-w-3xl mx-auto">
              Configure mathematically coordinated interactions, transitions, and content behaviors
              using the VIB34D preset bank. All visual responses update in real time using the unified engine.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <DesignSystemPreview />
            </div>
            <aside className="space-y-6">
              <EditorInterface />
            </aside>
          </div>
        </div>
      </div>
    </DesignSystemProvider>
  );
}