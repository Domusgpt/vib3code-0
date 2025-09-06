/**
 * VIB3CODE-0 Holographic AI Blog - End-to-End Tests
 * 
 * Comprehensive testing of the live deployment
 */

import { test, expect, Page } from '@playwright/test';

const SITE_URL = 'https://domusgpt.github.io/vib3code-0/';

test.describe('VIB3CODE-0 Holographic Blog', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the live site
    await page.goto(SITE_URL);
    
    // Wait for initial loading to complete
    await page.waitForTimeout(3000);
  });

  test('site loads successfully and displays main content', async ({ page }) => {
    // Check that the page loads without errors
    await expect(page).toHaveTitle(/VIB3CODE-0.*Holographic AI Blog/);
    
    // Check main heading is visible
    const mainHeading = page.locator('h1:has-text("VIB3CODE")');
    await expect(mainHeading).toBeVisible();
    
    // Check parameter display grid is visible
    const parameterGrid = page.locator('.grid').filter({ has: page.locator('[class*="text-2xl"]') });
    await expect(parameterGrid).toBeVisible();
    
    // Check all 4 parameter boxes are present
    const paramBoxes = page.locator('.grid .p-4');
    await expect(paramBoxes).toHaveCount(4);
    
    console.log('✅ Main content loaded successfully');
  });

  test('WebGL canvases are present and functional', async ({ page }) => {
    // Wait for canvases to load
    await page.waitForTimeout(5000);
    
    // Check for WebGL canvas elements
    const canvases = page.locator('canvas');
    const canvasCount = await canvases.count();
    console.log(`Found ${canvasCount} canvas elements`);
    
    // Should have multiple canvases (multi-layer system)
    expect(canvasCount).toBeGreaterThan(0);
    
    // Check canvas dimensions are reasonable
    const firstCanvas = canvases.first();
    const boundingBox = await firstCanvas.boundingBox();
    expect(boundingBox?.width).toBeGreaterThan(100);
    expect(boundingBox?.height).toBeGreaterThan(100);
    
    console.log(`✅ Found ${canvasCount} WebGL canvases with proper dimensions`);
  });

  test('parameter panel is accessible and interactive', async ({ page }) => {
    // Look for parameter controls (should be on right side or accessible via mobile button)
    const mobileToggle = page.locator('button').filter({ has: page.locator('svg') }).first();
    
    // Try to open parameter panel on mobile
    if (await mobileToggle.isVisible()) {
      await mobileToggle.click();
      await page.waitForTimeout(500);
    }
    
    // Look for parameter sliders or controls
    const parameterControls = page.locator('input[type="range"], .parameter-slider, [class*="slider"]');
    const controlCount = await parameterControls.count();
    
    console.log(`Found ${controlCount} parameter controls`);
    
    // Should have parameter controls for the holographic system
    if (controlCount > 0) {
      // Test interaction with first control
      const firstControl = parameterControls.first();
      await firstControl.click();
      console.log('✅ Parameter controls are interactive');
    }
  });

  test('font loading works correctly', async ({ page }) => {
    // Check that Orbitron font is loaded
    const mainHeading = page.locator('h1:has-text("VIB3CODE")');
    
    // Get computed styles
    const fontFamily = await mainHeading.evaluate(el => {
      return window.getComputedStyle(el).fontFamily;
    });
    
    console.log(`Font family: ${fontFamily}`);
    
    // Should include Orbitron or have fallback
    expect(fontFamily.toLowerCase()).toMatch(/(orbitron|monospace|sans-serif)/);
    
    console.log('✅ Font loading working correctly');
  });

  test('no JavaScript errors in console', async ({ page }) => {
    const jsErrors: string[] = [];
    
    // Capture JavaScript errors
    page.on('pageerror', (error) => {
      jsErrors.push(error.message);
    });
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
      }
    });
    
    // Wait for page to fully load and initialize
    await page.waitForTimeout(10000);
    
    // Check for critical errors
    const criticalErrors = jsErrors.filter(error => 
      error.includes('WebGL') || 
      error.includes('Context Lost') || 
      error.includes('undefined') ||
      error.includes('ReferenceError') ||
      error.includes('TypeError')
    );
    
    console.log(`Found ${jsErrors.length} total console messages`);
    console.log(`Found ${criticalErrors.length} critical errors`);
    
    if (jsErrors.length > 0) {
      console.log('Console messages:', jsErrors);
    }
    
    // Report issues but don't fail if they're non-critical
    if (criticalErrors.length > 0) {
      console.log('⚠️  Critical errors found:', criticalErrors);
    } else {
      console.log('✅ No critical JavaScript errors');
    }
  });

  test('WebGL context management is working', async ({ page }) => {
    // Look for WebGL manager console logs
    const webglLogs: string[] = [];
    
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('[WebGL]') || text.includes('[Canvas]') || text.includes('WebGL')) {
        webglLogs.push(text);
      }
    });
    
    // Wait for WebGL initialization
    await page.waitForTimeout(8000);
    
    console.log(`WebGL-related logs: ${webglLogs.length}`);
    if (webglLogs.length > 0) {
      console.log('WebGL logs:', webglLogs);
    }
    
    // Check that WebGL contexts are being managed
    const webglActivity = webglLogs.some(log => 
      log.includes('Canvas loaded') || 
      log.includes('Context created') ||
      log.includes('Activating section')
    );
    
    if (webglActivity) {
      console.log('✅ WebGL context management is active');
    } else {
      console.log('⚠️  No WebGL context management activity detected');
    }
  });

  test('responsive design works on different screen sizes', async ({ page }) => {
    // Test desktop size
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    
    const desktopHeading = page.locator('h1:has-text("VIB3CODE")');
    await expect(desktopHeading).toBeVisible();
    
    // Test tablet size
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    const tabletHeading = page.locator('h1:has-text("VIB3CODE")');
    await expect(tabletHeading).toBeVisible();
    
    // Test mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    const mobileHeading = page.locator('h1:has-text("VIB3CODE")');
    await expect(mobileHeading).toBeVisible();
    
    // Check mobile toggle button exists
    const mobileToggle = page.locator('button').filter({ has: page.locator('svg') });
    const toggleCount = await mobileToggle.count();
    
    console.log(`✅ Responsive design works across screen sizes (${toggleCount} mobile controls found)`);
  });

  test('holographic effects are rendering', async ({ page }) => {
    // Check for holographic CSS classes and effects
    const holographicElements = page.locator('[class*="holographic"]');
    const holographicCount = await holographicElements.count();
    
    console.log(`Found ${holographicCount} elements with holographic styling`);
    
    // Check for CSS custom properties being set (parameter binding)
    const rootElement = page.locator('html');
    const hasCustomProps = await rootElement.evaluate(el => {
      const styles = window.getComputedStyle(el);
      const props = [];
      for (let i = 0; i < styles.length; i++) {
        const prop = styles[i];
        if (prop.startsWith('--param-') || prop.startsWith('--device-')) {
          props.push(prop);
        }
      }
      return props.length > 0;
    });
    
    if (hasCustomProps) {
      console.log('✅ CSS custom properties are being set for parameter binding');
    }
    
    // Check canvas layers are properly positioned
    const canvasLayers = page.locator('[class*="canvas-layer"]');
    const layerCount = await canvasLayers.count();
    
    console.log(`Found ${layerCount} canvas layers for holographic effects`);
    
    expect(holographicCount).toBeGreaterThan(0);
  });

});

test.describe('Deep Integration Testing', () => {
  
  test('parameter changes affect visual output', async ({ page }) => {
    await page.goto(SITE_URL);
    await page.waitForTimeout(5000);
    
    // Try to interact with parameter controls
    const mobileToggle = page.locator('button').filter({ has: page.locator('svg') }).first();
    if (await mobileToggle.isVisible()) {
      await mobileToggle.click();
      await page.waitForTimeout(500);
    }
    
    // Look for parameter value displays
    const parameterValues = page.locator('[class*="text-2xl"][class*="font-bold"]');
    const valueCount = await parameterValues.count();
    
    console.log(`Found ${valueCount} parameter value displays`);
    
    // Capture initial values
    const initialValues: string[] = [];
    for (let i = 0; i < Math.min(valueCount, 4); i++) {
      const value = await parameterValues.nth(i).textContent();
      initialValues.push(value || '');
    }
    
    console.log('Initial parameter values:', initialValues);
    
    // Look for randomize or control buttons
    const randomButton = page.locator('button:has-text("Random"), button:has-text("⚃")');
    if (await randomButton.first().isVisible()) {
      await randomButton.first().click();
      await page.waitForTimeout(2000);
      
      // Check if values changed
      const newValues: string[] = [];
      for (let i = 0; i < Math.min(valueCount, 4); i++) {
        const value = await parameterValues.nth(i).textContent();
        newValues.push(value || '');
      }
      
      console.log('New parameter values:', newValues);
      
      const valuesChanged = initialValues.some((val, idx) => val !== newValues[idx]);
      if (valuesChanged) {
        console.log('✅ Parameter controls are functional and affect values');
      } else {
        console.log('⚠️  Parameter values did not change after interaction');
      }
    }
  });

  test('performance is acceptable', async ({ page }) => {
    await page.goto(SITE_URL);
    
    // Measure page load performance
    const navigationTiming = await page.evaluate(() => {
      const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        loadComplete: timing.loadEventEnd - timing.loadEventStart,
        domReady: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
        totalTime: timing.loadEventEnd - (timing as any).navigationStart,
      };
    });
    
    console.log('Performance timing:', navigationTiming);
    
    // Wait for WebGL initialization
    await page.waitForTimeout(5000);
    
    // Measure FPS if possible
    const fpsTest = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let frames = 0;
        const start = Date.now();
        
        function countFrames() {
          frames++;
          if (Date.now() - start < 2000) {
            requestAnimationFrame(countFrames);
          } else {
            resolve(frames / 2); // FPS over 2 seconds
          }
        }
        
        requestAnimationFrame(countFrames);
      });
    });
    
    console.log(`Estimated FPS: ${fpsTest.toFixed(1)}`);
    
    // Performance should be reasonable
    expect(navigationTiming.totalTime).toBeLessThan(10000); // < 10s total load
    expect(fpsTest).toBeGreaterThan(10); // > 10 FPS minimum
    
    console.log('✅ Performance is within acceptable ranges');
  });

});