/**
 * VIB3CODE-0 Minimal Test Page
 * 
 * Ultra-simple version with no external dependencies
 */

'use client';

import { useState, useEffect } from 'react';

export default function MinimalPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingText, setLoadingText] = useState('Initializing...');
  
  useEffect(() => {
    console.log('MinimalPage: useEffect started');
    
    // Simulate loading steps
    setTimeout(() => {
      setLoadingText('Loading Interface...');
      console.log('MinimalPage: Step 1 - Loading Interface');
    }, 1000);
    
    setTimeout(() => {
      setLoadingText('Almost Ready...');
      console.log('MinimalPage: Step 2 - Almost Ready');
    }, 2000);
    
    setTimeout(() => {
      console.log('MinimalPage: Step 3 - Setting loaded to true');
      setIsLoaded(true);
      
      // Hide the global loading screen from layout.tsx
      try {
        const loading = document.getElementById('global-loading');
        if (loading) {
          console.log('MinimalPage: Hiding global loading screen');
          loading.style.opacity = '0';
          setTimeout(() => {
            loading.style.display = 'none';
            console.log('MinimalPage: Global loading screen hidden');
          }, 1000);
        } else {
          console.log('MinimalPage: Global loading screen not found');
        }
      } catch (error) {
        console.error('MinimalPage: Error hiding loading screen:', error);
      }
    }, 3000);
  }, []);

  console.log('MinimalPage: Render - isLoaded:', isLoaded);

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <div className="text-cyan-400 text-xl font-bold">
            {loadingText}
          </div>
          <div className="text-gray-400 text-sm mt-2">
            Minimal Test Version
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-8">
      <div className="text-center max-w-4xl">
        <h1 className="text-8xl font-black mb-6 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          VIB3CODE
        </h1>
        
        <div className="text-2xl text-cyan-100 mb-8">
          Holographic AI Blog
        </div>
        
        <p className="text-lg text-gray-300 mb-12 leading-relaxed">
          ✅ <strong>Minimal Version Successfully Loaded!</strong><br/>
          This ultra-simple version confirms the site infrastructure is working.<br/>
          No external dependencies, no complex state management, no WebGL.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="p-6 bg-cyan-500/10 rounded-xl border border-cyan-500/30 backdrop-blur-sm">
            <div className="text-3xl font-bold text-cyan-400 mb-2">216°</div>
            <div className="text-cyan-200/80">Hue</div>
          </div>
          
          <div className="p-6 bg-purple-500/10 rounded-xl border border-purple-500/30 backdrop-blur-sm">
            <div className="text-3xl font-bold text-purple-400 mb-2">75%</div>
            <div className="text-purple-200/80">Density</div>
          </div>
          
          <div className="p-6 bg-pink-500/10 rounded-xl border border-pink-500/30 backdrop-blur-sm">
            <div className="text-3xl font-bold text-pink-400 mb-2">1.2</div>
            <div className="text-pink-200/80">Morph</div>
          </div>
          
          <div className="p-6 bg-green-500/10 rounded-xl border border-green-500/30 backdrop-blur-sm">
            <div className="text-3xl font-bold text-green-400 mb-2">0.3</div>
            <div className="text-green-200/80">Chaos</div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={() => window.location.reload()} 
            className="px-8 py-3 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-cyan-400 hover:bg-cyan-500/30 transition-all duration-300 font-semibold"
          >
            🔄 Reload Test
          </button>
          
          <button 
            onClick={() => console.log('Button clicked - site is interactive!')} 
            className="px-8 py-3 bg-purple-500/20 border border-purple-500/50 rounded-full text-purple-400 hover:bg-purple-500/30 transition-all duration-300 font-semibold"
          >
            🧪 Test Interaction
          </button>
        </div>
        
        <div className="mt-12 text-sm text-gray-500">
          <p>Debug Info:</p>
          <p>Load time: 3 seconds | Version: Minimal | Status: ✅ Working</p>
          <p>Next step: Gradually add back complex features</p>
        </div>
      </div>
    </div>
  );
}