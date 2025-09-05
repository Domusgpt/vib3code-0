/**
 * VIB3CODE-0 AI News Section
 * 
 * Implements AI News section from PDF specification:
 * - Oppose & Snap transition (hover-driven counter-motion with beat snap)
 * - Spring return with chroma trail transition out
 * - Offset rules: hueShift=+0.07, densMul=0.9
 */

'use client';

import { useStore, useHomeParams, useSectionParams, SECTION_CONFIGS } from '@/lib/store';

export default function AINewsSection() {
  const homeParams = useHomeParams();
  const sectionParams = useSectionParams('ai-news');
  const config = SECTION_CONFIGS['ai-news'];
  
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-8">
      {/* Section content overlay */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-black holographic-text mb-6">
          AI NEWS
        </h1>
        
        <div className="text-xl md:text-2xl font-light text-cyan-100/80 mb-8 leading-relaxed">
          Daily AI Research & Development
        </div>
        
        <p className="text-lg text-cyan-200/70 mb-12 leading-relaxed max-w-2xl">
          Stay updated with the latest breakthroughs in artificial intelligence research, 
          development trends, and industry innovations through our holographic data streams.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="text-2xl font-bold text-blue-400">
              {Math.round((homeParams.hue + 0.07) % 1.0 * 360)}°
            </div>
            <div className="text-sm text-blue-200/60">Hue (+0.07)</div>
          </div>
          
          <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <div className="text-2xl font-bold text-purple-400">
              {Math.round((homeParams.density * 0.9) * 100)}%
            </div>
            <div className="text-sm text-purple-200/60">Density (×0.9)</div>
          </div>
          
          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="text-2xl font-bold text-green-400">
              {homeParams.morph.toFixed(2)}
            </div>
            <div className="text-sm text-green-200/60">Morph</div>
          </div>
          
          <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
            <div className="text-2xl font-bold text-red-400">
              {Math.round(homeParams.chaos * 100)}%
            </div>
            <div className="text-sm text-red-200/60">Chaos</div>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-black/20 rounded-full border border-white/10">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-cyan-100">
              {config.transitionIn.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Active
            </span>
          </div>
        </div>
        
        <div className="mt-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Data Stream Parameters</h3>
            <div className="text-sm text-gray-400 space-y-1">
              <div>Oppose & Snap Transition: {config.transitionIn}</div>
              <div>Spring Return Effect: {config.transitionOut}</div>
              <div>Hue Shift: +0.07 | Density Multiplier: 0.9</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background interaction area */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* This area will be handled by the WebGL canvases */}
      </div>
    </div>
  );
}