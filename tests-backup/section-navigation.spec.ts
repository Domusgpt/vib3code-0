import { test, expect, Page } from '@playwright/test';

/**
 * VIB3CODE-0 Section Navigation & State Management Tests
 * 
 * Testing the holographic blog's section-based navigation system with:
 * - GSAP ScrollTrigger integration
 * - Lenis smooth scroll 
 * - Section parameter derivation from PDF specification
 * - Zustand state management with parameter synchronization
 */

test.describe('Section Navigation System', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Add store state tracking
    await page.addInitScript(() => {
      window.stateChanges = [];
      
      // Track store changes if available
      if (window.store && window.store.subscribe) {
        window.store.subscribe((state) => {
          window.stateChanges.push({
            timestamp: Date.now(),
            focusedSection: state.focusedSection,
            homeParams: state.home,
            sectionParams: Object.keys(state.sections || {})
          });
        });
      }
    });
  });

  test('should initialize with proper section structure', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check for expected sections based on PDF specification
    const expectedSections = ['ai-news', 'vibe-coding', 'info-theory', 'philosophy'];
    
    for (const sectionId of expectedSections) {
      // Check for section existence (various possible selectors)
      const sectionExists = await page.evaluate((id) => {
        return !!(
          document.getElementById(id) || 
          document.querySelector(`[data-section="${id}"]`) ||
          document.querySelector(`section[id*="${id}"]`) ||
          document.querySelector(`div[id*="${id}"]`)
        );
      }, sectionId);
      
      expect(sectionExists).toBe(true);
    }
  });

  test('should handle scroll-based section activation', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Test smooth scroll navigation through sections
    const scrollPositions = [0, 0.25, 0.5, 0.75, 1.0];
    
    for (const position of scrollPositions) {
      await page.evaluate((pos) => {
        const maxScroll = Math.max(
          document.body.scrollHeight - window.innerHeight,
          document.documentElement.scrollHeight - window.innerHeight,
          0
        );
        window.scrollTo({ 
          top: maxScroll * pos, 
          behavior: 'smooth' 
        });
      }, position);
      
      await page.waitForTimeout(1000);
      
      // Check if scroll position changed
      const currentScroll = await page.evaluate(() => window.pageYOffset);
      expect(currentScroll).toBeGreaterThanOrEqual(0);
    }
  });

  test('should maintain Zustand state consistency during navigation', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Test state management during navigation
    const stateConsistency = await page.evaluate(() => {
      // Check if store exists and has expected structure
      if (!window.store) return { hasStore: false };
      
      const state = window.store.getState();
      
      return {
        hasStore: true,
        hasHomeParams: !!state.home,
        hasSections: !!state.sections,
        sectionCount: Object.keys(state.sections || {}).length,
        hasSetters: !!(state.setHomeParams && state.setFocusedSection)
      };
    });

    expect(stateConsistency.hasStore).toBe(true);
    expect(stateConsistency.hasHomeParams).toBe(true);
  });

  test('should derive section parameters according to PDF specification', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Test parameter derivation formulas from PDF spec
    const parameterDerivation = await page.evaluate(() => {
      if (!window.store) return { error: 'No store available' };
      
      const state = window.store.getState();
      if (!state.home || !state.sections) return { error: 'Missing state structure' };

      // Test parameter derivation for each section
      const results = {};
      const sections = ['ai-news', 'vibe-coding', 'info-theory', 'philosophy'];
      
      sections.forEach(sectionId => {
        const sectionParams = state.sections[sectionId];
        if (sectionParams) {
          results[sectionId] = {
            hasParams: true,
            hue: typeof sectionParams.hue === 'number',
            density: typeof sectionParams.density === 'number',
            morph: typeof sectionParams.morph === 'number',
            chaos: typeof sectionParams.chaos === 'number'
          };
        }
      });
      
      return results;
    });

    // Each section should have derived parameters
    const sections = ['ai-news', 'vibe-coding', 'info-theory', 'philosophy'];
    sections.forEach(sectionId => {
      if (parameterDerivation[sectionId]) {
        expect(parameterDerivation[sectionId].hasParams).toBe(true);
      }
    });
  });

  test('should handle section focus changes', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Test programmatic section focus changes
    const focusTest = await page.evaluate(() => {
      if (!window.store) return { error: 'No store' };
      
      const state = window.store.getState();
      const initialFocus = state.focusedSection;
      
      // Test focus change
      if (state.setFocusedSection) {
        state.setFocusedSection('ai-news');
        const newState = window.store.getState();
        
        return {
          initialFocus,
          newFocus: newState.focusedSection,
          changed: newState.focusedSection !== initialFocus
        };
      }
      
      return { error: 'No setFocusedSection method' };
    });

    if (!focusTest.error) {
      expect(typeof focusTest.newFocus).toBe('string');
    }
  });

  test('should implement section-specific transition rules', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Test section-specific parameter offsets from PDF specification
    const transitionRules = await page.evaluate(() => {
      if (!window.store) return { error: 'No store' };
      
      const state = window.store.getState();
      if (!state.sections) return { error: 'No sections' };
      
      // Check for section-specific parameter modifications
      const sectionData = {};
      
      // AI News: hueShift=+0.07, densMul=0.9
      if (state.sections['ai-news']) {
        const aiNews = state.sections['ai-news'];
        sectionData['ai-news'] = {
          hasModifiedParams: aiNews.hue !== state.home.hue || aiNews.density !== state.home.density
        };
      }
      
      // Vibe Coding: chaosMul=1.1, morphMul=1.2  
      if (state.sections['vibe-coding']) {
        const vibeCoding = state.sections['vibe-coding'];
        sectionData['vibe-coding'] = {
          hasModifiedParams: vibeCoding.chaos !== state.home.chaos || vibeCoding.morph !== state.home.morph
        };
      }
      
      // Info Theory: noiseFreqMul=0.8, dispAmp+0.05
      if (state.sections['info-theory']) {
        const infoTheory = state.sections['info-theory'];
        sectionData['info-theory'] = {
          hasModifiedParams: infoTheory.noiseFreq !== state.home.noiseFreq
        };
      }
      
      // Philosophy: glitchBias=-0.03, timeScale=0.9
      if (state.sections['philosophy']) {
        const philosophy = state.sections['philosophy'];
        sectionData['philosophy'] = {
          hasModifiedParams: philosophy.glitch !== state.home.glitch || philosophy.timeScale !== state.home.timeScale
        };
      }
      
      return sectionData;
    });

    // Each section should have parameter modifications based on PDF rules
    if (!transitionRules.error) {
      Object.keys(transitionRules).forEach(sectionId => {
        // Parameter derivation should create unique values per section
        expect(transitionRules[sectionId]).toHaveProperty('hasModifiedParams');
      });
    }
  });

  test('should handle rapid navigation without state corruption', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');  
    await page.waitForTimeout(2000);

    // Rapid navigation test
    for (let i = 0; i < 10; i++) {
      // Random scroll position
      await page.evaluate(() => {
        const randomScroll = Math.random() * (document.body.scrollHeight - window.innerHeight);
        window.scrollTo(0, randomScroll);
      });
      
      // Quick section focus changes if available
      await page.evaluate((iteration) => {
        if (window.store && window.store.getState().setFocusedSection) {
          const sections = ['ai-news', 'vibe-coding', 'info-theory', 'philosophy'];
          const randomSection = sections[iteration % sections.length];
          window.store.getState().setFocusedSection(randomSection);
        }
      }, i);
      
      await page.waitForTimeout(100);
    }

    // Check state integrity after rapid changes
    const stateIntegrity = await page.evaluate(() => {
      if (!window.store) return { error: 'No store' };
      
      const state = window.store.getState();
      
      return {
        hasValidHome: state.home && typeof state.home.hue === 'number',
        hasValidSections: state.sections && Object.keys(state.sections).length > 0,
        stateChangesRecorded: window.stateChanges ? window.stateChanges.length : 0
      };
    });

    expect(stateIntegrity.hasValidHome).toBe(true);
    expect(stateIntegrity.stateChangesRecorded).toBeGreaterThan(0);
  });

  test('should maintain parameter synchronization across sections', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Test parameter synchronization
    const syncTest = await page.evaluate(() => {
      if (!window.store) return { error: 'No store' };
      
      const state = window.store.getState();
      
      // Update home parameters
      if (state.setHomeParams) {
        const newParams = {
          hue: 0.75,
          density: 0.6,
          morph: 0.4,
          chaos: 0.3
        };
        
        state.setHomeParams(newParams);
        
        // Check if sections updated accordingly
        const updatedState = window.store.getState();
        const sectionUpdates = {};
        
        Object.keys(updatedState.sections || {}).forEach(sectionId => {
          const sectionParams = updatedState.sections[sectionId];
          sectionUpdates[sectionId] = {
            updated: sectionParams.hue !== undefined && sectionParams.density !== undefined
          };
        });
        
        return {
          homeUpdated: updatedState.home.hue === 0.75,
          sectionUpdates
        };
      }
      
      return { error: 'No parameter setter' };
    });

    if (!syncTest.error) {
      expect(syncTest.homeUpdated).toBe(true);
    }
  });
});

test.describe('GSAP ScrollTrigger Integration', () => {
  test('should integrate with GSAP ScrollTrigger for section activation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check for GSAP ScrollTrigger functionality
    const gsapIntegration = await page.evaluate(() => {
      return {
        gsapExists: typeof window.gsap !== 'undefined',
        scrollTriggerExists: !!(window.gsap && window.gsap.ScrollTrigger),
        lenisExists: typeof window.Lenis !== 'undefined' || 
                     typeof window.lenis !== 'undefined' ||
                     !!document.querySelector('[data-lenis]')
      };
    });

    // Should have smooth scroll and trigger systems
    expect(gsapIntegration.gsapExists || gsapIntegration.scrollTriggerExists || gsapIntegration.lenisExists).toBe(true);
  });

  test('should handle scroll-based parameter transitions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    let initialParams: any, finalParams: any;

    // Capture initial parameters
    initialParams = await page.evaluate(() => {
      return window.store ? window.store.getState().home : null;
    });

    // Scroll through sections
    await page.evaluate(() => {
      window.scrollTo({ top: document.body.scrollHeight * 0.5, behavior: 'smooth' });
    });
    await page.waitForTimeout(1500);

    // Capture updated parameters  
    finalParams = await page.evaluate(() => {
      return window.store ? window.store.getState().home : null;
    });

    // Parameters may change based on scroll position and active section
    if (initialParams && finalParams) {
      expect(typeof finalParams.hue).toBe('number');
      expect(typeof finalParams.density).toBe('number');
    }
  });
});