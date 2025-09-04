/**
 * VIB3CODE-0 Main Holographic Interface
 * 
 * Primary entry point implementing PDF specification:
 * - Faux-scroll navigation with dimensional expansion
 * - Multi-canvas WebGL visualization system  
 * - Section-based parameter derivation
 * - GSAP ScrollTrigger + Lenis smooth scroll
 */

'use client';

import { useEffect, useRef, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import HomeSection from '@/components/sections/HomeSection';
import AINewsSection from '@/components/sections/AINewsSection'; 
import VibeCodingSection from '@/components/sections/VibeCodingSection';
import InfoTheorySection from '@/components/sections/InfoTheorySection';
import PhilosophySection from '@/components/sections/PhilosophySection';
import ScrollController from '@/components/ui/ScrollController';
import ParameterPanel from '@/components/ui/ParameterPanel';
import { webglManager } from '@/lib/webgl-manager';

// Error Boundary Component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  console.error('VIB3CODE Error Boundary Caught:', error);
  
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center text-center p-8">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold text-red-400 mb-4">
          🚨 VIB3CODE Error Detected
        </h1>
        <p className="text-white mb-4">
          The holographic blog encountered an error:
        </p>
        <div className="bg-gray-900 p-4 rounded text-left text-sm font-mono text-red-300 mb-4">
          <strong>Error:</strong> {error.message}<br/>
          <strong>Stack:</strong> {error.stack}
        </div>
        <button 
          onClick={resetErrorBoundary}
          className="px-6 py-3 bg-cyan-500 text-black rounded hover:bg-cyan-400"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

// Loading component for Suspense
function HolographicLoader() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center text-center">
      <div>
        <div className="holographic-spinner mb-6">
          <div className="spinner-ring"></div>
        </div>
        <div className="text-cyan-400 text-xl font-bold mb-2">
          VIB3CODE Holographic Blog
        </div>
        <div className="text-white mb-4">
          Initializing holographic systems...
        </div>
      </div>
    </div>
  );
}

// Main Holographic Blog Interface
function HolographicBlog() {
  const mainRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    // Initialize WebGL Manager on mount
    console.log('[VIB3CODE] Initializing WebGL context manager...');
    webglManager.setMaxContexts(4);
    webglManager.setSectionActive('home', true);
    
    // Hide loading screen after components mount
    const hideLoading = () => {
      const loading = document.getElementById('global-loading');
      if (loading) {
        loading.style.opacity = '0';
        setTimeout(() => {
          loading.style.display = 'none';
        }, 1000);
      }
    };
    
    // Small delay to ensure components are rendered
    const timer = setTimeout(hideLoading, 1500);
    
    return () => {
      clearTimeout(timer);
      // Cleanup on unmount
      webglManager.cleanup();
    };
  }, []);
  
  return (
    <main ref={mainRef} className="relative min-h-screen bg-black overflow-hidden">
      {/* Multi-canvas WebGL layers (managed by webglManager) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Canvas layers will be dynamically created by webglManager */}
      </div>
      
      {/* Scroll-controlled content sections */}
      <div className="relative z-10">
        {/* Home Section - Radial hologram expand transition */}
        <section id="home" className="min-h-screen relative">
          <HomeSection />
        </section>
        
        {/* AI News Section - Oppose & Snap interactions */}
        <section id="ai-news" className="min-h-screen relative">
          <AINewsSection />
        </section>
        
        {/* Vibe Coding Section - Morph/Chaos Swap patterns */}
        <section id="vibe-coding" className="min-h-screen relative">
          <VibeCodingSection />
        </section>
        
        {/* Information Theory Section - Spectral slice transitions */}
        <section id="info-theory" className="min-h-screen relative">
          <InfoTheorySection />
        </section>
        
        {/* Philosophy Section - Portal peel effects */}
        <section id="philosophy" className="min-h-screen relative">
          <PhilosophySection />
        </section>
      </div>
      
      {/* Scroll Controller - GSAP ScrollTrigger + Lenis */}
      <ScrollController />
      
      {/* Parameter Control Panel - Zustand state management */}
      <ParameterPanel />
      
      {/* Global loading screen overlay (will be hidden after mount) */}
      <div id="global-loading" className="fixed inset-0 bg-black z-50 transition-opacity duration-1000">
        <HolographicLoader />
      </div>
    </main>
  );
}

// Main export with Error Boundary and Suspense
export default function Page() {
  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={(error) => console.error('VIB3CODE Error Boundary:', error)}
    >
      <Suspense fallback={<HolographicLoader />}>
        <HolographicBlog />
      </Suspense>
    </ErrorBoundary>
  );
}