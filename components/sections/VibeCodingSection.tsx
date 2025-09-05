/**
 * VIB3CODE-0 Vibe Coding Section
 * 
 * Implements Vibe Coding section from PDF specification:
 * - Morph/Chaos Swap transition (focused clarity, peripheral frenzy)
 * - Peripheral frenzy decay transition out
 * - Offset rules: chaosMul=1.1, morphMul=1.2
 */

'use client';

import { useStore, useHomeParams, useSectionParams, SECTION_CONFIGS } from '@/lib/store';

export default function VibeCodingSection() {
  const homeParams = useHomeParams();
  const sectionParams = useSectionParams('vibe-coding');
  const config = SECTION_CONFIGS['vibe-coding'];
  
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-8">
      {/* Section content overlay */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-black holographic-text mb-6">
          VIBE CODING
        </h1>
        
        <div className="text-xl md:text-2xl font-light text-cyan-100/80 mb-8 leading-relaxed">
          Creative Programming & Development
        </div>
        
        <p className="text-lg text-cyan-200/70 mb-12 leading-relaxed max-w-2xl">
          Explore the intersection of creativity and code through holographic development environments. 
          Experience programming as an art form through immersive visualization.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <div className="text-2xl font-bold text-purple-400">
              {Math.round(homeParams.hue * 360)}°
            </div>
            <div className="text-sm text-purple-200/60">Hue</div>
          </div>
          
          <div className="p-4 bg-pink-500/10 rounded-lg border border-pink-500/20">
            <div className="text-2xl font-bold text-pink-400">
              {Math.round(homeParams.density * 100)}%
            </div>
            <div className="text-sm text-pink-200/60">Density</div>
          </div>
          
          <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <div className="text-2xl font-bold text-orange-400">
              {(homeParams.morph * 1.2).toFixed(2)}
            </div>
            <div className="text-sm text-orange-200/60">Morph (×1.2)</div>
          </div>
          
          <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
            <div className="text-2xl font-bold text-red-400">
              {Math.round(homeParams.chaos * 1.1 * 100)}%
            </div>
            <div className="text-sm text-red-200/60">Chaos (×1.1)</div>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-black/20 rounded-full border border-white/10">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-cyan-100">
              {config.transitionIn.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Active
            </span>
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