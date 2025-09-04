/**
 * VIB3CODE-0 Home Section
 * 
 * Implements Home section from PDF specification:
 * - Radial hologram expand transition in
 * - Dissolve into portal field transition out
 * - Base parameter state (hueShift=0, densMul=1, glitchBias=+0.05)
 */

'use client';

import { useRef, useEffect } from 'react';
import { useStore, useHomeParams, SECTION_CONFIGS } from '@/lib/store';

export default function HomeSection() {
  const homeParams = useHomeParams();
  const config = SECTION_CONFIGS.home;
  
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-8">
      {/* Section content overlay */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-black holographic-text mb-6">
          VIB3CODE
        </h1>
        
        <div className="text-xl md:text-2xl font-light text-cyan-100/80 mb-8 leading-relaxed">
          Holographic AI Blog
        </div>
        
        <p className="text-lg text-cyan-200/70 mb-12 leading-relaxed max-w-2xl">
          Experience the convergence of artificial intelligence and holographic visualization. 
          Navigate through dimensional spaces where AI research meets immersive design.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <div className="text-2xl font-bold text-cyan-400">
              {Math.round(homeParams.hue * 360)}°
            </div>
            <div className="text-sm text-cyan-200/60">Hue</div>
          </div>
          
          <div className="p-4 bg-pink-500/10 rounded-lg border border-pink-500/20">
            <div className="text-2xl font-bold text-pink-400">
              {Math.round(homeParams.density * 100)}%
            </div>
            <div className="text-sm text-pink-200/60">Density</div>
          </div>
          
          <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <div className="text-2xl font-bold text-yellow-400">
              {homeParams.morph.toFixed(2)}
            </div>
            <div className="text-sm text-yellow-200/60">Morph</div>
          </div>
          
          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="text-2xl font-bold text-green-400">
              {Math.round(homeParams.chaos * 100)}%
            </div>
            <div className="text-sm text-green-200/60">Chaos</div>
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