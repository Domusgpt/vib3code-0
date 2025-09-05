/**
 * VIB3CODE-0 Info Theory Section
 * 
 * Implements Info Theory section from PDF specification:
 * - Spectral slice intro (chromaShift↑)
 * - Spectral merge transition out
 * - Offset rules: noiseFreqMul=0.8, dispAmp+0.05
 */

'use client';

import { useStore, useHomeParams, useSectionParams, SECTION_CONFIGS } from '@/lib/store';

export default function InfoTheorySection() {
  const homeParams = useHomeParams();
  const sectionParams = useSectionParams('info-theory');
  const config = SECTION_CONFIGS['info-theory'];
  
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-8">
      {/* Section content overlay */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-black holographic-text mb-6">
          INFO THEORY
        </h1>
        
        <div className="text-xl md:text-2xl font-light text-cyan-100/80 mb-8 leading-relaxed">
          Information Systems & Mathematics
        </div>
        
        <p className="text-lg text-cyan-200/70 mb-12 leading-relaxed max-w-2xl">
          Dive deep into information theory, computational complexity, and mathematical foundations 
          of artificial intelligence through spectral data visualizations.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <div className="text-2xl font-bold text-cyan-400">
              {Math.round(homeParams.hue * 360)}°
            </div>
            <div className="text-sm text-cyan-200/60">Hue</div>
          </div>
          
          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="text-2xl font-bold text-blue-400">
              {Math.round(homeParams.density * 100)}%
            </div>
            <div className="text-sm text-blue-200/60">Density</div>
          </div>
          
          <div className="p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <div className="text-2xl font-bold text-indigo-400">
              {(homeParams.noiseFreq * 0.8).toFixed(1)}
            </div>
            <div className="text-sm text-indigo-200/60">Noise Freq (×0.8)</div>
          </div>
          
          <div className="p-4 bg-violet-500/10 rounded-lg border border-violet-500/20">
            <div className="text-2xl font-bold text-violet-400">
              {(homeParams.dispAmp + 0.05).toFixed(3)}
            </div>
            <div className="text-sm text-violet-200/60">Disp Amp (+0.05)</div>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-black/20 rounded-full border border-white/10">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
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