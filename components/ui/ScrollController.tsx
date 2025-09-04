/**
 * VIB3CODE-0 Scroll Controller
 * 
 * GSAP ScrollTrigger + Lenis smooth scroll implementation
 * - Faux-scroll navigation with dimensional expansion
 * - Section-based transitions from PDF specification
 * - Device orientation integration for 4D perspective
 */

'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollControllerProps {
  sections: string[];
  onSectionChange: (sectionId: string) => void;
  currentSection: string;
}

export default function ScrollController({ sections, onSectionChange, currentSection }: ScrollControllerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<any>(null);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Dynamic import for Lenis (client-side only)
    let lenis: any;
    let cleanup: (() => void) | null = null;
    
    const initializeLenis = async () => {
      try {
        // Dynamic import of Lenis
        const Lenis = (await import('@studio-freight/lenis')).default;
        
        // Initialize Lenis smooth scroll
        lenis = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing
          direction: 'vertical',
          gestureDirection: 'vertical',
          smooth: true,
          mouseMultiplier: 1,
          smoothTouch: false,
          touchMultiplier: 2,
          infinite: false,
        });
        
        lenisRef.current = lenis;
        
        // RAF loop for Lenis
        function raf(time: number) {
          lenis?.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
        
        // Setup GSAP ScrollTrigger with Lenis
        lenis.on('scroll', ScrollTrigger.update);
        
        gsap.ticker.lagSmoothing(0);
        
        // Create virtual sections for scroll-based navigation
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: `+=${sections.length * window.innerHeight}`,
            scrub: true,
            onUpdate: (self) => {
              // Calculate current section based on scroll progress
              const progress = self.progress;
              const sectionIndex = Math.floor(progress * sections.length);
              const targetSection = sections[Math.min(sectionIndex, sections.length - 1)];
              
              if (targetSection !== currentSection) {
                onSectionChange(targetSection);
              }
              
              // Update scroll progress for visual effects
              document.documentElement.style.setProperty('--scroll-progress', `${progress}`);
              
              // Holographic parallax effects (from Visual Codex study)
              const offset = (progress - 0.5) * 200;
              document.documentElement.style.setProperty('--bg-offset-x', `${offset * 0.3}px`);
              document.documentElement.style.setProperty('--bg-offset-y', `${offset * 0.1}px`);
              document.documentElement.style.setProperty('--bg-scale', `${1 + Math.abs(progress - 0.5) * 0.1}`);
              document.documentElement.style.setProperty('--bg-rotation', `${offset * 0.02}deg`);
              document.documentElement.style.setProperty('--bg-blur', `${Math.abs(progress - 0.5) * 2}px`);
            },
          },
        });
        
        // Individual section animations
        sections.forEach((sectionId, index) => {
          const sectionElement = document.getElementById(`section-${sectionId}`);
          if (!sectionElement) return;
          
          // Section entrance animation
          gsap.fromTo(
            sectionElement,
            {
              opacity: 0,
              scale: 0.9,
              rotationX: 15,
              z: -100,
            },
            {
              opacity: 1,
              scale: 1,
              rotationX: 0,
              z: 0,
              duration: 1.5,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: sectionElement,
                start: 'top bottom',
                end: 'center center',
                scrub: 1,
              },
            }
          );
          
          // Section-specific transition effects based on PDF specification
          const sectionConfig = getSectionTransitionConfig(sectionId);
          if (sectionConfig) {
            applySectionTransition(sectionElement, sectionConfig);
          }
        });
        
        // Keyboard navigation
        const handleKeyDown = (e: KeyboardEvent) => {
          const currentIndex = sections.indexOf(currentSection);
          
          switch (e.key) {
            case 'ArrowUp':
            case 'PageUp':
              if (currentIndex > 0) {
                e.preventDefault();
                onSectionChange(sections[currentIndex - 1]);
                scrollToSection(currentIndex - 1);
              }
              break;
            case 'ArrowDown':
            case 'PageDown':
            case ' ':
              if (currentIndex < sections.length - 1) {
                e.preventDefault();
                onSectionChange(sections[currentIndex + 1]);
                scrollToSection(currentIndex + 1);
              }
              break;
            case 'Home':
              e.preventDefault();
              onSectionChange(sections[0]);
              scrollToSection(0);
              break;
            case 'End':
              e.preventDefault();
              onSectionChange(sections[sections.length - 1]);
              scrollToSection(sections.length - 1);
              break;
          }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        
        cleanup = () => {
          lenis?.destroy();
          window.removeEventListener('keydown', handleKeyDown);
          ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
        
      } catch (error) {
        console.error('Failed to initialize Lenis:', error);
      }
    };
    
    // Scroll to specific section
    const scrollToSection = (index: number) => {
      const targetY = index * window.innerHeight;
      lenis?.scrollTo(targetY, { duration: 1.5, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
    };
    
    initializeLenis();
    
    return cleanup || (() => {});
  }, [sections, onSectionChange, currentSection]);
  
  // Section transition configurations from PDF specification
  const getSectionTransitionConfig = (sectionId: string) => {
    const configs: Record<string, any> = {
      home: {
        transitionIn: 'radial_hologram',
        transitionOut: 'dissolve_portal',
      },
      'ai-news': {
        transitionIn: 'oppose_snap',
        transitionOut: 'spring_return',
      },
      'vibe-coding': {
        transitionIn: 'morph_chaos_swap',
        transitionOut: 'peripheral_frenzy',
      },
      'info-theory': {
        transitionIn: 'spectral_slice',
        transitionOut: 'spectral_merge',
      },
      philosophy: {
        transitionIn: 'portal_peel',
        transitionOut: 'reseal_glitch',
      },
    };
    
    return configs[sectionId];
  };
  
  // Apply section-specific transitions
  const applySectionTransition = (element: Element, config: any) => {
    switch (config.transitionIn) {
      case 'radial_hologram':
        gsap.fromTo(
          element,
          {
            clipPath: 'circle(0% at 50% 50%)',
            filter: 'hue-rotate(0deg) brightness(0.5)',
          },
          {
            clipPath: 'circle(100% at 50% 50%)',
            filter: 'hue-rotate(360deg) brightness(1)',
            duration: 2,
            ease: 'power2.inOut',
            scrollTrigger: {
              trigger: element,
              start: 'top center',
              end: 'center center',
              scrub: 1,
            },
          }
        );
        break;
        
      case 'oppose_snap':
        gsap.fromTo(
          element,
          {
            rotationY: -90,
            scale: 0.5,
          },
          {
            rotationY: 0,
            scale: 1,
            duration: 1.5,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: element,
              start: 'top bottom',
              end: 'center center',
              scrub: 1,
            },
          }
        );
        break;
        
      case 'morph_chaos_swap':
        gsap.fromTo(
          element,
          {
            scaleX: 2,
            scaleY: 0.5,
            skewX: 45,
            filter: 'blur(10px)',
          },
          {
            scaleX: 1,
            scaleY: 1,
            skewX: 0,
            filter: 'blur(0px)',
            duration: 2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top bottom',
              end: 'center center',
              scrub: 1,
            },
          }
        );
        break;
        
      case 'spectral_slice':
        gsap.fromTo(
          element,
          {
            clipPath: 'inset(0% 100% 0% 0%)',
            filter: 'hue-rotate(0deg) saturate(200%)',
          },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            filter: 'hue-rotate(180deg) saturate(100%)',
            duration: 1.5,
            ease: 'power2.inOut',
            scrollTrigger: {
              trigger: element,
              start: 'top bottom',
              end: 'center center',
              scrub: 1,
            },
          }
        );
        break;
        
      case 'portal_peel':
        gsap.fromTo(
          element,
          {
            rotationX: 90,
            transformOrigin: 'top center',
            opacity: 0,
          },
          {
            rotationX: 0,
            opacity: 1,
            duration: 2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: element,
              start: 'top bottom',
              end: 'center center',
              scrub: 1,
            },
          }
        );
        break;
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ height: `${sections.length * 100}vh` }}
    >
      {/* Virtual scroll content for GSAP triggers */}
    </div>
  );
}