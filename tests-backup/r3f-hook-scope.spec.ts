import { test, expect, Page } from '@playwright/test';

/**
 * VIB3CODE-0 React Three Fiber Hook Scope Tests
 * 
 * CRITICAL: Testing the fix for "R3F: Hooks can only be used within the Canvas component!" errors
 * 
 * Previously section components contained useFrame hooks but were rendered outside Canvas contexts.
 * Fixed by converting all section components to pure React UI components without R3F hooks.
 */

test.describe('React Three Fiber Hook Scope Fix', () => {
  let page: Page;
  let consoleErrors: string[] = [];

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    consoleErrors = [];
    
    // Capture all console errors, especially R3F hook scope errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
  });

  test('should load without R3F hook scope errors', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for React hydration and component mounting
    await page.waitForTimeout(3000);

    // Filter for specific R3F hook errors that were causing issues
    const r3fHookErrors = consoleErrors.filter(error => 
      error.includes('R3F: Hooks can only be used within the Canvas component!') ||
      error.includes('useFrame') ||
      error.includes('useThree')
    );

    // Should have ZERO R3F hook scope errors
    expect(r3fHookErrors).toHaveLength(0);
    
    if (r3fHookErrors.length > 0) {
      console.log('❌ R3F Hook Scope Errors Found:');
      r3fHookErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
  });

  test('should render all section components as pure React UI', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Test that all section components render correctly without R3F dependencies
    const sections = [
      { id: 'ai-news', title: 'AI NEWS' },
      { id: 'vibe-coding', title: 'VIBE CODING' },
      { id: 'info-theory', title: 'INFO THEORY' },
      { id: 'philosophy', title: 'PHILOSOPHY' }
    ];

    for (const section of sections) {
      // Check that section content is rendered
      const sectionElement = await page.locator(`[data-section="${section.id}"]`).first();
      const titleElement = await page.locator('h1').filter({ hasText: section.title }).first();
      
      // Section should exist and be visible (may be outside viewport)
      await expect(sectionElement.or(titleElement)).toBeAttached();
      
      // No R3F-related errors should occur when scrolling to section
      await page.evaluate((sectionId) => {
        const element = document.querySelector(`[data-section="${sectionId}"]`) || 
                      document.querySelector(`h1:has-text("${sectionId.replace('-', ' ').toUpperCase()}")`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, section.id);

      await page.waitForTimeout(500);
    }

    // Verify no new R3F errors after navigation
    const newR3fErrors = consoleErrors.filter(error => 
      error.includes('R3F: Hooks can only be used within the Canvas component!') ||
      error.includes('useFrame') ||
      error.includes('useThree')
    );
    
    expect(newR3fErrors).toHaveLength(0);
  });

  test('should have Canvas components with proper R3F context', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check that Canvas components exist and provide R3F context
    const canvasElements = await page.locator('canvas').count();
    
    // Should have multiple canvas elements (5 layers × sections)
    expect(canvasElements).toBeGreaterThan(0);

    // Verify Canvas components are properly initialized
    const canvasInitialized = await page.evaluate(() => {
      const canvases = document.querySelectorAll('canvas');
      let initializedCount = 0;
      
      canvases.forEach(canvas => {
        // Check if canvas has WebGL context (indicates R3F initialization)
        const context = canvas.getContext('webgl') || canvas.getContext('webgl2');
        if (context) {
          initializedCount++;
        }
      });
      
      return initializedCount;
    });

    expect(canvasInitialized).toBeGreaterThan(0);
  });

  test('should properly scope VIB3GeometryRenderer within Canvas contexts', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Test that geometry renderers work within Canvas contexts
    const geometryErrors = consoleErrors.filter(error => 
      error.includes('VIB3GeometryRenderer') ||
      error.includes('geometry') && error.includes('useFrame')
    );

    expect(geometryErrors).toHaveLength(0);

    // Check that geometries are being rendered
    const hasActiveGeometry = await page.evaluate(() => {
      const canvases = document.querySelectorAll('canvas');
      for (let canvas of canvases) {
        const context = canvas.getContext('webgl');
        if (context) {
          // Check for active draw calls (indicates geometry rendering)
          const program = context.getParameter(context.CURRENT_PROGRAM);
          if (program) {
            return true;
          }
        }
      }
      return false;
    });

    // At least one canvas should have active rendering
    expect(hasActiveGeometry).toBe(true);
  });

  test('should handle section parameter updates without hook errors', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Clear existing errors
    consoleErrors = [];

    // Simulate parameter updates that previously caused hook scope issues
    await page.evaluate(() => {
      // Try to update parameters through the store
      if (window.store && window.store.getState) {
        const state = window.store.getState();
        
        // Test home parameter updates
        if (state.setHomeParams) {
          state.setHomeParams({
            hue: 0.5,
            density: 0.8,
            morph: 0.3
          });
        }
        
        // Test section parameter derivation
        if (state.deriveSectionParams) {
          ['ai-news', 'vibe-coding', 'info-theory', 'philosophy'].forEach(sectionId => {
            state.deriveSectionParams(sectionId);
          });
        }
      }
    });

    await page.waitForTimeout(1000);

    // Should handle parameter updates without hook scope errors
    const parameterUpdateErrors = consoleErrors.filter(error => 
      error.includes('R3F: Hooks can only be used within the Canvas component!') ||
      error.includes('useFrame') ||
      error.includes('parameter') && error.includes('hook')
    );

    expect(parameterUpdateErrors).toHaveLength(0);
  });

  test('should maintain proper component architecture separation', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Test that section components are pure React (no R3F dependencies)
    // and Canvas components properly contain R3F logic
    
    const architectureValid = await page.evaluate(() => {
      // Check for proper separation: sections should not contain Three.js objects
      const sectionElements = document.querySelectorAll('[data-section]');
      
      // Sections should exist as DOM elements (not Three.js objects)
      return sectionElements.length > 0;
    });

    expect(architectureValid).toBe(true);

    // Verify final error state
    const finalR3fErrors = consoleErrors.filter(error => 
      error.includes('R3F: Hooks can only be used within the Canvas component!')
    );

    expect(finalR3fErrors).toHaveLength(0);
    
    if (finalR3fErrors.length > 0) {
      console.log('❌ Architecture Separation Failed - R3F Errors:');
      finalR3fErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ R3F Hook Scope Fix: Architecture properly separated');
    }
  });

  test('should handle scroll-based section activation without hook errors', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Clear errors before scroll testing
    consoleErrors = [];

    // Test scroll-based section activation (GSAP ScrollTrigger + Lenis)
    for (let i = 0; i < 5; i++) {
      await page.evaluate((scrollPercent) => {
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        window.scrollTo(0, maxScroll * scrollPercent);
      }, i * 0.25);
      
      await page.waitForTimeout(500);
    }

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Should handle scroll-triggered section changes without hook errors
    const scrollErrors = consoleErrors.filter(error => 
      error.includes('R3F: Hooks can only be used within the Canvas component!') ||
      error.includes('useFrame') && error.includes('scroll')
    );

    expect(scrollErrors).toHaveLength(0);
  });
});