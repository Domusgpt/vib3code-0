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

import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useStore, useEvents, useHomeParams, SECTION_CONFIGS } from '@/lib/store';
import { webglManager } from '@/lib/webgl-manager';
import VIB3Engine from '@/components/engines/VIB3Engine';
import { Suspense, lazy } from 'react';
import dynamic from 'next/dynamic';

// Lazy load heavy components
const ScrollController = dynamic(() => import('@/components/ui/ScrollController'), {
  ssr: false,
});

const ParameterPanel = dynamic(() => import('@/components/ui/ParameterPanel'), {
  ssr: false,
});

// Section components (lazy loaded for performance)
const HomeSection = lazy(() => import('@/components/sections/HomeSection'));
const AINewsSection = lazy(() => import('@/components/sections/AINewsSection'));  
const VibeCodingSection = lazy(() => import('@/components/sections/VibeCodingSection'));
const InfoTheorySection = lazy(() => import('@/components/sections/InfoTheorySection'));
const PhilosophySection = lazy(() => import('@/components/sections/PhilosophySection'));

// Section configuration from PDF specification
const SECTIONS = [
  {
    id: 'home',
    name: 'Home',
    component: HomeSection,
    description: 'Holographic AI Blog Portal',
  },
  {
    id: 'ai-news',
    name: 'AI News',
    component: AINewsSection,
    description: 'Daily AI Research & Development',
  },
  {
    id: 'vibe-coding',
    name: 'Vibe Coding',
    component: VibeCodingSection,
    description: 'Creative Programming & Development',
  },
  {
    id: 'info-theory',
    name: 'Info Theory',
    component: InfoTheorySection,
    description: 'Information Systems & Mathematics',
  },
  {
    id: 'philosophy',
    name: 'Philosophy',
    component: PhilosophySection,
    description: 'AI Ethics & Philosophical Inquiry',
  },
];

interface CanvasLayerProps {
  id: string;
  layerType: 'background' | 'shadow' | 'content' | 'highlight' | 'accent';
  blend?: 'multiply' | 'screen' | 'overlay' | 'color-dodge' | 'difference';
  opacity?: number;
}

// Smart WebGL Canvas Layer with Context Management
function CanvasLayer({ id, layerType, blend = 'screen', opacity = 1 }: CanvasLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCanvasActive, setIsCanvasActive] = useState(false);
  const [contextId, setContextId] = useState<string | null>(null);
  const params = useStore((state) => state.sections[id] || state.home);

  // Register canvas with WebGL manager on mount
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvasId = webglManager.registerCanvas(id, layerType, canvasRef.current);
    setContextId(canvasId);

    // Set up event listeners for smart loading/destruction
    webglManager.addEventListener('onCanvasLoad', (instance) => {
      if (instance.id === canvasId) {
        setIsCanvasActive(true);
        console.log(`[Canvas] Loaded: ${canvasId}`);
      }
    });

    webglManager.addEventListener('onCanvasDestroy', (instance) => {
      if (instance.id === canvasId) {
        setIsCanvasActive(false);
        console.log(`[Canvas] Destroyed: ${canvasId}`);
      }
    });

    webglManager.addEventListener('onContextLost', (instance) => {
      if (instance.id === canvasId) {
        console.warn(`[Canvas] Context lost: ${canvasId}`);
        setIsCanvasActive(false);
      }
    });

    return () => {
      // Cleanup handled by WebGL manager
    };
  }, [id, layerType]);

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 canvas-layer-${layerType} ${isCanvasActive ? 'active' : 'inactive'}`}
      style={{ 
        mixBlendMode: blend,
        opacity: isCanvasActive ? opacity : 0.1,
        zIndex: {
          background: 1,
          shadow: 2, 
          content: 3,
          highlight: 4,
          accent: 5
        }[layerType],
        transition: 'opacity 0.5s ease-in-out',
        pointerEvents: isCanvasActive ? 'auto' : 'none',
      }}
    >
      <Canvas
        ref={canvasRef}
        id={`${id}-${layerType}-canvas`}
        className="webgl-canvas"
        camera={{ 
          position: [0, 0, 5],
          fov: 45,
          near: 0.1,
          far: 1000
        }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: false,
        }}
        performance={{
          min: 0.5,
          max: 1,
          debounce: 200,
        }}
        onCreated={(state) => {
          // Canvas ready for WebGL manager
          console.log(`[Canvas] WebGL context created: ${contextId}`);
        }}
      >
        {isCanvasActive && (
          <Suspense fallback={null}>
            <CanvasContent 
              sectionId={id}
              layerType={layerType}
              params={params}
            />
          </Suspense>
        )}
      </Canvas>
      
      {/* Loading indicator for inactive canvases */}
      {!isCanvasActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm">
          <div className="text-xs text-cyan-400/50 font-orbitron">
            {layerType} layer loading...
          </div>
        </div>
      )}
    </div>
  );
}

// Separate R3F content component (prevents hook errors)
function CanvasContent({ 
  sectionId, 
  layerType, 
  params 
}: { 
  sectionId: string; 
  layerType: string; 
  params: any; 
}) {
  return (
    <>
      {/* Ambient lighting for depth */}
      <ambientLight intensity={0.1} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={0.3 + (params?.density || 0.5) * 0.5}
        color={`hsl(${(params?.hue || 0.6) * 360}, 70%, 60%)`}
      />
      
      {/* VIB3 Engine with sophisticated geometric systems */}
      <VIB3Engine
        sectionId={sectionId}
        layerType={layerType as any}
        params={{
          geometry: params?.geometry || 0,
          morph: params?.morph || 1,
          chaos: params?.chaos || 0.2,
          density: params?.density || 0.5,
          hue: params?.hue || 0.6,
          noiseFreq: params?.noiseFreq || 2.1,
          dispAmp: params?.dispAmp || 0.2,
          timeScale: params?.timeScale || 1.0,
          beatPhase: params?.beatPhase || 0.0,
        }}
        opacity={layerType === 'accent' ? 0.7 : 1.0}
        pointSize={layerType === 'content' ? 3.0 : 2.0}
      />
    </>
  );
}

// Individual section with multi-canvas layers
function SectionView({ section, isActive }: { section: typeof SECTIONS[0], isActive: boolean }) {
  const config = SECTION_CONFIGS[section.id];
  const SectionComponent = section.component;
  
  return (
    <section
      id={`section-${section.id}`}
      className={`section-container ${isActive ? 'active' : ''}`}
      data-section={section.id}
      style={{
        height: '100vh',
        position: 'relative',
        display: isActive ? 'block' : 'none',
      }}
    >
      {/* Multi-canvas layer system (5 layers per section) */}
      <div className="relative w-full h-full">
        <CanvasLayer 
          id={section.id} 
          layerType="background" 
          blend="multiply"
          opacity={0.8}
        />
        <CanvasLayer 
          id={section.id} 
          layerType="shadow" 
          blend="overlay"
          opacity={0.6}
        />
        <CanvasLayer 
          id={section.id} 
          layerType="content" 
          blend="screen"
          opacity={0.9}
        />
        <CanvasLayer 
          id={section.id} 
          layerType="highlight" 
          blend="color-dodge"
          opacity={0.4}
        />
        <CanvasLayer 
          id={section.id} 
          layerType="accent" 
          blend="difference"
          opacity={0.3}
        />
        
        {/* Content overlay */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="text-center max-w-4xl px-8">
            <h1 className="text-6xl font-bold mb-4 holographic-text">
              {section.name}
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              {section.description}
            </p>
            
            {/* Section-specific content */}
            <Suspense fallback={<div className="holographic-spinner"><div className="spinner-ring"></div></div>}>
              <SectionComponent />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}

// Main holographic interface
export default function HolographicBlog() {
  const [currentSection, setCurrentSection] = useState('home');
  const [isInitialized, setIsInitialized] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const events = useEvents();
  const homeParams = useHomeParams();
  
  // Initialize system
  useEffect(() => {
    // Initialize home parameters from PDF defaults
    events.UPDATE_HOME({});
    
    // Setup device orientation listeners for 4D perspective
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
        const alpha = event.alpha || 0;
        const beta = event.beta || 0;
        const gamma = event.gamma || 0;
        
        // Map device orientation to CSS custom properties (from VIB34D study)
        document.documentElement.style.setProperty('--device-alpha', `${alpha}`);
        document.documentElement.style.setProperty('--device-beta', `${beta}`);
        document.documentElement.style.setProperty('--device-gamma', `${gamma}`);
        
        // Calculate tilt intensity for extreme effects
        const tiltIntensity = Math.min(1, Math.sqrt(
          Math.pow(beta / 90, 2) + Math.pow(gamma / 90, 2)
        ));
        document.documentElement.style.setProperty('--tilt-intensity', `${tiltIntensity}`);
      }
    };
    
    // Request device orientation permission (iOS 13+)
    if (typeof DeviceOrientationEvent !== 'undefined' && 'requestPermission' in DeviceOrientationEvent) {
      (DeviceOrientationEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    
    // Animation loop for beat phase and parameter updates
    const animate = () => {
      events.TICK(0.016); // ~60fps tick
      requestAnimationFrame(animate);
    };
    animate();
    
    // Beat clock (from PDF specification)
    const beatInterval = setInterval(() => {
      events.CLOCK_BEAT();
    }, 2000); // 2-second beat interval
    
    // Initialize WebGL Manager
    webglManager.setMaxContexts(4); // Allow up to 4 active contexts
    
    // Set up WebGL monitoring
    webglManager.addEventListener('onCanvasLoad', (instance) => {
      console.log(`[WebGL] Canvas loaded: ${instance.id} (${instance.sectionId}/${instance.layerType})`);
    });
    
    webglManager.addEventListener('onCanvasDestroy', (instance) => {
      console.log(`[WebGL] Canvas destroyed: ${instance.id} (${instance.sectionId}/${instance.layerType})`);
    });
    
    webglManager.addEventListener('onMaxContextsReached', (count) => {
      console.warn(`[WebGL] Max contexts reached: ${count}/4 - starting smart cleanup`);
    });
    
    // Activate home section by default
    webglManager.setSectionActive('home', true);
    
    setIsInitialized(true);
    
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      clearInterval(beatInterval);
      webglManager.destroy();
    };
  }, [events]);
  
  // Update CSS custom properties when home parameters change
  useEffect(() => {
    Object.entries(homeParams).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--param-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, `${value}`);
    });
  }, [homeParams]);
  
  // Navigation handler with WebGL choreography
  const navigateToSection = (sectionId: string) => {
    const previousSection = currentSection;
    setCurrentSection(sectionId);
    events.SET_FOCUS(sectionId);
    
    // Smart WebGL Context Management - trigger canvas loading/destruction
    SECTIONS.forEach((section) => {
      const isActive = section.id === sectionId;
      webglManager.setSectionActive(section.id, isActive);
    });
    
    console.log(`[Navigation] Section changed: ${previousSection} → ${sectionId}`);
    console.log(`[WebGL] Active contexts:`, webglManager.getContextInfo());
    
    // Trigger section-specific transition
    const config = SECTION_CONFIGS[sectionId];
    if (config) {
      // Apply transition-specific effects based on PDF specification
      switch (config.transitionIn) {
        case 'oppose_snap':
          events.HOVER_START(sectionId);
          break;
        case 'morph_chaos_swap':
          // Will be implemented in individual section components
          break;
        default:
          break;
      }
    }
  };
  
  if (!isInitialized) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="holographic-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-text">
            Initializing Holographic Interface...
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div ref={containerRef} className="holographic-interface">
      {/* Holographic background system from globals.css */}
      <div className="holographic-background"></div>
      
      {/* Navigation */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex space-x-4 bg-black/20 backdrop-blur-md rounded-full px-6 py-3 border border-white/10">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => navigateToSection(section.id)}
              className={`px-4 py-2 rounded-full transition-all duration-300 ${
                currentSection === section.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              onMouseEnter={() => events.HOVER_START(section.id)}
              onMouseLeave={() => events.HOVER_END(section.id)}
            >
              {section.name}
            </button>
          ))}
        </div>
      </nav>
      
      {/* Main content sections */}
      <main className="relative">
        {SECTIONS.map((section) => (
          <SectionView
            key={section.id}
            section={section}
            isActive={currentSection === section.id}
          />
        ))}
      </main>
      
      {/* Parameter control panel */}
      <Suspense fallback={null}>
        <ParameterPanel />
      </Suspense>
      
      {/* Scroll controller for GSAP + Lenis integration */}
      <Suspense fallback={null}>
        <ScrollController 
          sections={SECTIONS.map(s => s.id)}
          onSectionChange={navigateToSection}
          currentSection={currentSection}
        />
      </Suspense>
    </div>
  );
}