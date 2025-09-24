/**
 * VIB34D Design System - Landing Page
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 * "The Revolution Will Not be in a Structured Format"
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 */

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-950 to-black">
      <div className="text-center space-y-6 px-6">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          VIB34D Unified Design System
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Manifesting Paul Phillips&apos; holographic architecture vision. Explore the live editor and engine preview to experience the
          VIB3CODE revolution in motion.
        </p>
        <Link
          href="/design-system"
          className="inline-block px-6 py-3 rounded-full bg-cyan-500/30 text-cyan-100 border border-cyan-400/50 hover:bg-cyan-500/50 transition"
        >
          Enter Design System Interface
        </Link>
      </div>
    </main>
  );
}
