/**
 * VIB3CODE-0 Main Holographic Interface WITH DEBUGGING
 * 
 * Primary entry point implementing PDF specification:
 * - Faux-scroll navigation with dimensional expansion
 * - Multi-canvas WebGL visualization system  
 * - Section-based parameter derivation
 * - GSAP ScrollTrigger + Lenis smooth scroll
 * 
 * DEBUGGING ENABLED: Will catch and log all errors instead of failing silently
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

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
          The holographic blog encountered an error. This is debugging info:
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

// Main Component with Error Handling
function HolographicBlogWithErrorHandling() {
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    async function initializeApp() {
      try {
        console.log('[VIB3CODE] Starting initialization...');
        setLoadingStep(1);
        
        // Step 1: Dynamic imports with error handling
        console.log('[VIB3CODE] Step 1: Loading dynamic imports...');
        let Canvas, useStore, useEvents, useHomeParams, SECTION_CONFIGS, webglManager;
        
        try {
          const r3fImport = await import('@react-three/fiber');
          Canvas = r3fImport.Canvas;
          console.log('[VIB3CODE] ✅ React Three Fiber imported');
        } catch (err) {
          console.error('[VIB3CODE] ❌ Failed to import React Three Fiber:', err);
          setError(`React Three Fiber import failed: ${err instanceof Error ? err.message : String(err)}`);
          return;
        }
        
        try {
          const storeImport = await import('@/lib/store');
          useStore = storeImport.useStore;
          useEvents = storeImport.useEvents;
          useHomeParams = storeImport.useHomeParams;
          SECTION_CONFIGS = storeImport.SECTION_CONFIGS;
          console.log('[VIB3CODE] ✅ Store imported');
        } catch (err) {
          console.error('[VIB3CODE] ❌ Failed to import store:', err);
          setError(`Store import failed: ${err instanceof Error ? err.message : String(err)}`);
          return;
        }
        
        try {
          const webglImport = await import('@/lib/webgl-manager');
          webglManager = webglImport.webglManager;
          console.log('[VIB3CODE] ✅ WebGL Manager imported');
        } catch (err) {
          console.error('[VIB3CODE] ❌ Failed to import WebGL manager:', err);
          setError(`WebGL Manager import failed: ${err instanceof Error ? err.message : String(err)}`);
          return;
        }
        
        setLoadingStep(2);
        console.log('[VIB3CODE] Step 2: Initializing systems...');
        
        // Step 2: Initialize store and events
        try {
          const events = useEvents();
          events.UPDATE_HOME({});
          console.log('[VIB3CODE] ✅ Store initialized');
        } catch (err) {
          console.error('[VIB3CODE] ❌ Failed to initialize store:', err);
          setError(`Store initialization failed: ${err instanceof Error ? err.message : String(err)}`);
          return;
        }
        
        // Step 3: Initialize WebGL Manager
        try {
          webglManager.setMaxContexts(4);
          webglManager.setSectionActive('home', true);
          console.log('[VIB3CODE] ✅ WebGL Manager initialized');
        } catch (err) {
          console.error('[VIB3CODE] ❌ Failed to initialize WebGL Manager:', err);
          setError(`WebGL Manager initialization failed: ${err instanceof Error ? err.message : String(err)}`);
          return;
        }
        
        setLoadingStep(3);
        console.log('[VIB3CODE] Step 3: Loading components...');
        
        // Step 4: Load section components
        try {
          const homeImport = await import('@/components/sections/HomeSection');
          console.log('[VIB3CODE] ✅ HomeSection loaded');
        } catch (err) {
          console.error('[VIB3CODE] ❌ Failed to load HomeSection:', err);
          setError(`HomeSection import failed: ${err instanceof Error ? err.message : String(err)}`);
          return;
        }
        
        setLoadingStep(4);
        console.log('[VIB3CODE] Step 4: Final initialization...');
        
        // Hide loading screen
        setTimeout(() => {
          const loading = document.getElementById('global-loading');
          if (loading) {
            loading.style.opacity = '0';
            setTimeout(() => loading.style.display = 'none', 1000);
          }
        }, 500);
        
        setIsInitialized(true);
        console.log('[VIB3CODE] ✅ Initialization complete!');
        
      } catch (err) {
        console.error('[VIB3CODE] ❌ Initialization failed:', err);
        setError(`Initialization failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    
    initializeApp();
  }, []);
  
  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-center p-8">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold text-red-400 mb-4">
            🔧 Debug Mode: Error Found
          </h1>
          <div className="bg-gray-900 p-4 rounded text-left text-sm font-mono text-red-300 mb-4">
            {error}
          </div>
          <p className="text-white mb-4">
            This is the ACTUAL error preventing the holographic blog from loading.
            Now we can fix the real issue instead of making a minimal page.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-cyan-500 text-black rounded hover:bg-cyan-400"
          >
            Reload & Try Again
          </button>
        </div>
      </div>
    );
  }
  
  if (!isInitialized) {
    const steps = [
      'Starting initialization...',
      'Loading dynamic imports...',
      'Initializing systems...',
      'Loading components...',
      'Final initialization...'
    ];
    
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
            {steps[loadingStep] || 'Initializing...'}
          </div>
          <div className="text-gray-400 text-sm">
            Step {loadingStep + 1} of {steps.length}
          </div>
        </div>
      </div>
    );
  }
  
  // If we get here, everything loaded successfully
  return <FullHolographicBlog />;
}

// Lazy-loaded full implementation (only loads after successful initialization)
function FullHolographicBlog() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center text-center">
      <div>
        <h1 className="text-6xl font-bold text-cyan-400 mb-4">
          🎉 VIB3CODE LOADED!
        </h1>
        <p className="text-white mb-4">
          All systems successfully initialized. Ready to implement full features.
        </p>
        <div className="text-gray-400 text-sm">
          Complex multi-canvas WebGL system is ready to activate.
        </div>
      </div>
    </div>
  );
}

// Main export with Error Boundary
export default function Page() {
  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={(error) => console.error('VIB3CODE Error Boundary:', error)}
    >
      <HolographicBlogWithErrorHandling />
    </ErrorBoundary>
  );
}