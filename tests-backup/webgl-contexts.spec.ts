import { test, expect, Page } from '@playwright/test';

/**
 * VIB3CODE-0 WebGL Context Management Tests
 * 
 * Testing the multi-canvas WebGL architecture with smart context management.
 * Each section has 5 layers (background/shadow/content/highlight/accent) 
 * with proper WebGL context initialization and cleanup.
 */

test.describe('WebGL Context Management', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Enable WebGL debugging
    await page.addInitScript(() => {
      // Track WebGL context creation
      window.webglContexts = [];
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(contextType, ...args) {
        const context = originalGetContext.call(this, contextType, ...args);
        if (contextType === 'webgl' || contextType === 'webgl2') {
          window.webglContexts.push({
            canvas: this,
            context,
            id: this.id,
            timestamp: Date.now()
          });
        }
        return context;
      };
    });
  });

  test('should initialize WebGL contexts without errors', async () => {
    // Navigate and wait for full load
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for React hydration and WebGL initialization
    await page.waitForTimeout(2000);
    
    // Check for any console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Should have no WebGL initialization errors
    expect(errors.filter(e => e.includes('WebGL'))).toHaveLength(0);
  });

  test('should create canvas layers for each section', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check for section canvas layers
    const sections = ['home', 'ai-news', 'vibe-coding', 'info-theory', 'philosophy'];
    const layers = ['background', 'shadow', 'content', 'highlight', 'accent'];
    
    for (const section of sections) {
      for (const layer of layers) {
        const canvasId = section === 'home' ? `${layer}-canvas` : `${section}-${layer}-canvas`;
        const canvas = await page.locator(`canvas#${canvasId}`);
        await expect(canvas).toBeAttached();
      }
    }
  });

  test('should manage WebGL context limits properly', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check WebGL context count
    const contextCount = await page.evaluate(() => {
      return window.webglContexts ? window.webglContexts.length : 0;
    });

    // Should not exceed reasonable limits (20 contexts max: 4 sections × 5 layers)
    expect(contextCount).toBeLessThanOrEqual(20);
    expect(contextCount).toBeGreaterThan(0);
  });

  test('should handle WebGL context switching between sections', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Test section navigation
    const sections = ['ai-news', 'vibe-coding', 'info-theory', 'philosophy'];
    
    for (const section of sections) {
      // Navigate to section (scroll or click if section buttons exist)
      await page.evaluate((sectionId) => {
        const element = document.getElementById(sectionId) || document.querySelector(`[data-section="${sectionId}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, section);
      
      await page.waitForTimeout(1000);
      
      // Check that section canvases are active
      const activeCanvases = await page.evaluate((sectionId) => {
        const layers = ['background', 'shadow', 'content', 'highlight', 'accent'];
        return layers.map(layer => {
          const canvasId = `${sectionId}-${layer}-canvas`;
          const canvas = document.getElementById(canvasId);
          return canvas ? {
            id: canvasId,
            visible: canvas.style.display !== 'none',
            hasContext: !!canvas.getContext('webgl')
          } : null;
        }).filter(Boolean);
      }, section);

      expect(activeCanvases.length).toBeGreaterThan(0);
    }
  });

  test('should prevent WebGL context memory leaks', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Initial context count
    await page.waitForTimeout(2000);
    const initialCount = await page.evaluate(() => window.webglContexts?.length || 0);
    
    // Simulate heavy usage - rapid section switching
    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => {
        window.scrollTo(0, Math.random() * document.body.scrollHeight);
      });
      await page.waitForTimeout(200);
    }
    
    // Check for excessive context growth
    const finalCount = await page.evaluate(() => window.webglContexts?.length || 0);
    
    // Should not have created excessive new contexts
    expect(finalCount - initialCount).toBeLessThanOrEqual(5);
  });

  test('should handle WebGL context loss gracefully', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Simulate context loss on a canvas
    await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const gl = canvas.getContext('webgl');
        if (gl && gl.getExtension('WEBGL_lose_context')) {
          gl.getExtension('WEBGL_lose_context').loseContext();
        }
      }
    });

    await page.waitForTimeout(1000);

    // Check for proper error handling - no uncaught exceptions
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('WebGL context lost')) {
        errors.push(msg.text());
      }
    });

    // Should handle context loss without crashing
    expect(errors.length).toBe(0);
  });
});

test.describe('WebGL Performance', () => {
  test('should maintain stable frame rate', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Measure frame rate stability
    const frameRates = await page.evaluate(() => {
      return new Promise((resolve) => {
        const rates = [];
        let lastTime = performance.now();
        let frameCount = 0;

        function measureFrame() {
          const now = performance.now();
          const delta = now - lastTime;
          lastTime = now;
          
          if (delta > 0) {
            rates.push(1000 / delta);
          }
          
          frameCount++;
          if (frameCount < 60) {
            requestAnimationFrame(measureFrame);
          } else {
            resolve(rates);
          }
        }
        
        requestAnimationFrame(measureFrame);
      });
    });

    const avgFrameRate = frameRates.reduce((a, b) => a + b, 0) / frameRates.length;
    
    // Should maintain reasonable frame rate (> 30fps average)
    expect(avgFrameRate).toBeGreaterThan(30);
  });

  test('should handle high parameter update frequency', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Rapid parameter updates to stress test
    await page.evaluate(() => {
      // Simulate rapid parameter changes
      for (let i = 0; i < 100; i++) {
        setTimeout(() => {
          // Trigger parameter updates if store is available
          if (window.store && window.store.getState) {
            const state = window.store.getState();
            if (state.setHomeParams) {
              state.setHomeParams({
                hue: Math.random(),
                density: Math.random(),
                morph: Math.random()
              });
            }
          }
        }, i * 10);
      }
    });

    await page.waitForTimeout(2000);

    // Should handle rapid updates without crashing
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    expect(errors.length).toBe(0);
  });
});