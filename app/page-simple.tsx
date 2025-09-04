/**
 * VIB3CODE-0 Simple Test Page
 * 
 * Simplified version to test basic functionality
 */

'use client';

import { useState, useEffect } from 'react';

export default function SimplePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Simple loading simulation
    setTimeout(() => {
      setIsLoaded(true);
      // Hide the loading screen from layout.tsx
      const loading = document.getElementById('global-loading');
      if (loading) {
        loading.style.opacity = '0';
        setTimeout(() => loading.style.display = 'none', 1000);
      }
    }, 3000);
  }, []);

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="holographic-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-text">
            Loading Simple Test...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-black to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl md:text-8xl font-black holographic-text mb-6">
          VIB3CODE
        </h1>
        
        <div className="text-xl md:text-2xl font-light text-cyan-100/80 mb-8 leading-relaxed">
          Holographic AI Blog
        </div>
        
        <p className="text-lg text-cyan-200/70 mb-12 leading-relaxed max-w-2xl mx-auto">
          This is a simple test version to verify the site is working correctly.
          The complex WebGL and R3F components have been temporarily disabled.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center max-w-2xl mx-auto">
          <div className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <div className="text-2xl font-bold text-cyan-400">216°</div>
            <div className="text-sm text-cyan-200/60">Hue</div>
          </div>
          
          <div className="p-4 bg-pink-500/10 rounded-lg border border-pink-500/20">
            <div className="text-2xl font-bold text-pink-400">50%</div>
            <div className="text-sm text-pink-200/60">Density</div>
          </div>
          
          <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <div className="text-2xl font-bold text-yellow-400">1.0</div>
            <div className="text-sm text-yellow-200/60">Morph</div>
          </div>
          
          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="text-2xl font-bold text-green-400">0.2</div>
            <div className="text-sm text-green-200/60">Chaos</div>
          </div>
        </div>
        
        <div className="mt-12">
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-cyan-400 hover:bg-cyan-500/30 transition-all duration-300"
          >
            Reload Test
          </button>
        </div>
      </div>
    </div>
  );
}