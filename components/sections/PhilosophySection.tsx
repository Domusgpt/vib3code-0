/**
 * VIB3CODE-0 Philosophy Section
 * 
 * Implements Philosophy section from PDF specification:
 * - Slow portal peel intro (dispAmp↑)
 * - Reseal with low glitch transition out
 * - Offset rules: glitchBias=-0.03, timeScale=0.9
 */

'use client';

import { useStore, useHomeParams, useSectionParams, SECTION_CONFIGS } from '@/lib/store';

export default function PhilosophySection() {
  const homeParams = useHomeParams();
  const sectionParams = useSectionParams('philosophy');
  const config = SECTION_CONFIGS['philosophy'];
  
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-8">
      {/* Section content overlay */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-black holographic-text mb-6">
          PHILOSOPHY
        </h1>
        
        <div className="text-xl md:text-2xl font-light text-cyan-100/80 mb-8 leading-relaxed">
          AI Ethics & Philosophical Inquiry
        </div>
        
        <p className="text-lg text-cyan-200/70 mb-12 leading-relaxed max-w-2xl">
          Explore the philosophical implications of artificial intelligence, consciousness, 
          and the future of human-AI collaboration through contemplative visualizations.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <div className="text-2xl font-bold text-amber-400">
              {Math.round(homeParams.hue * 360)}°
            </div>
            <div className="text-sm text-amber-200/60">Hue</div>
          </div>
          
          <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <div className="text-2xl font-bold text-orange-400">
              {Math.round(homeParams.density * 100)}%
            </div>
            <div className="text-sm text-orange-200/60">Density</div>
          </div>
          
          <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <div className="text-2xl font-bold text-yellow-400">
              {Math.max(0, homeParams.glitch - 0.03).toFixed(3)}
            </div>
            <div className="text-sm text-yellow-200/60">Glitch (-0.03)</div>
          </div>
          
          <div className="p-4 bg-lime-500/10 rounded-lg border border-lime-500/20">
            <div className="text-2xl font-bold text-lime-400">
              {(homeParams.timeScale * 0.9).toFixed(2)}
            </div>
            <div className="text-sm text-lime-200/60">Time Scale (×0.9)</div>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-black/20 rounded-full border border-white/10">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
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