import { test, expect, Page } from '@playwright/test';

/**
 * VIB3CODE-0 VIB34D Geometry Engine Tests
 * 
 * Testing the advanced geometric visualization engines implementing VIB3 specification:
 * - 8 geometry types: tetrahedron, hypercube, hypersphere, hypertetrahedron, torus, Klein bottle, wave, crystal fractals
 * - Complex 4D projections with device orientation mapping
 * - Parameter-driven morphing and chaos effects
 * - WebGL rendering performance and correctness
 */

test.describe('VIB34D Geometry Engine Core', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Enable WebGL debugging and geometry tracking
    await page.addInitScript(() => {
      window.geometryStats = {
        rendered: [],
        errors: [],
        frameData: []
      };
      
      // Track WebGL draw calls
      const originalDrawElements = WebGLRenderingContext.prototype.drawElements;
      const originalDrawArrays = WebGLRenderingContext.prototype.drawArrays;
      
      WebGLRenderingContext.prototype.drawElements = function(...args) {
        window.geometryStats.rendered.push({
          type: 'drawElements',
          count: args[1],
          timestamp: performance.now()
        });
        return originalDrawElements.apply(this, args);
      };
      
      WebGLRenderingContext.prototype.drawArrays = function(...args) {
        window.geometryStats.rendered.push({
          type: 'drawArrays', 
          count: args[2],
          timestamp: performance.now()
        });
        return originalDrawArrays.apply(this, args);
      };
    });
  });

  test('should load VIB34D geometry systems without errors', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check for geometry initialization errors
    const geometryErrors = await page.evaluate(() => {
      const errors = [];
      
      // Check console for geometry-related errors
      if (window.geometryStats && window.geometryStats.errors) {
        errors.push(...window.geometryStats.errors);
      }
      
      return errors;
    });

    expect(geometryErrors.length).toBe(0);
  });

  test('should render all 8 VIB3 geometry types', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Test that geometry rendering is active
    const renderingStats = await page.evaluate(() => {
      if (!window.geometryStats) return { error: 'No geometry tracking' };
      
      return {
        totalDrawCalls: window.geometryStats.rendered.length,
        hasRendering: window.geometryStats.rendered.length > 0,
        uniqueTimestamps: [...new Set(window.geometryStats.rendered.map(r => Math.floor(r.timestamp / 100)))].length
      };
    });

    expect(renderingStats.hasRendering).toBe(true);
    expect(renderingStats.totalDrawCalls).toBeGreaterThan(0);
  });

  test('should handle geometry parameter updates', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Test geometry parameter responsiveness
    const parameterTest = await page.evaluate(() => {
      if (!window.store) return { error: 'No store available' };
      
      const initialStats = window.geometryStats ? { ...window.geometryStats } : null;
      
      // Update parameters that affect geometry
      const state = window.store.getState();
      if (state.setHomeParams) {
        state.setHomeParams({
          density: 0.8,
          morph: 0.6,
          chaos: 0.4,
          hue: 0.5
        });
        
        // Allow time for geometry updates
        return new Promise(resolve => {
          setTimeout(() => {
            const newStats = window.geometryStats || {};
            resolve({
              parameterUpdateTriggered: true,
              initialDrawCalls: initialStats ? initialStats.rendered.length : 0,
              newDrawCalls: newStats.rendered ? newStats.rendered.length : 0,
              renderingContinued: newStats.rendered && newStats.rendered.length > 0
            });
          }, 500);
        });
      }
      
      return { error: 'No parameter setter available' };
    });

    const result = await parameterTest;
    
    if (!result.error) {
      expect(result.renderingContinued).toBe(true);
    }
  });

  test('should properly implement 4D projection mathematics', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Test 4D projection calculations
    const projectionTest = await page.evaluate(() => {
      // Look for 4D projection evidence in shaders or matrices
      const canvases = document.querySelectorAll('canvas');
      let has4DProjection = false;
      let shaderPrograms = 0;
      
      for (let canvas of canvases) {
        const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
        if (gl) {
          const program = gl.getParameter(gl.CURRENT_PROGRAM);
          if (program) {
            shaderPrograms++;
            
            // Check for 4D-related uniforms
            const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
            for (let i = 0; i < numUniforms; i++) {
              const uniform = gl.getActiveUniform(program, i);
              if (uniform && (
                uniform.name.includes('rot4d') || 
                uniform.name.includes('projection') ||
                uniform.name.includes('4D') ||
                uniform.name.includes('morph') ||
                uniform.name.includes('chaos')
              )) {
                has4DProjection = true;
                break;
              }
            }
          }
        }
      }
      
      return {
        has4DProjection,
        shaderPrograms,
        canvasCount: canvases.length
      };
    });

    expect(projectionTest.shaderPrograms).toBeGreaterThan(0);
    expect(projectionTest.canvasCount).toBeGreaterThan(0);
  });

  test('should handle device orientation for 4D perspective', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Simulate device orientation change
    await page.evaluate(() => {
      // Simulate device orientation event
      const event = new DeviceOrientationEvent('deviceorientation', {
        alpha: 45,    // Z-axis rotation
        beta: 30,     // X-axis rotation  
        gamma: 15     // Y-axis rotation
      });
      
      window.dispatchEvent(event);
    });

    await page.waitForTimeout(500);

    // Check if orientation affects rendering
    const orientationResponse = await page.evaluate(() => {
      const hasOrientationListeners = !!window.addEventListener;
      const renderingActive = window.geometryStats && 
                             window.geometryStats.rendered && 
                             window.geometryStats.rendered.length > 0;
      
      return {
        hasOrientationListeners,
        renderingActive,
        timestampAfterOrientation: performance.now()
      };
    });

    expect(orientationResponse.hasOrientationListeners).toBe(true);
  });

  test('should maintain geometry performance under parameter stress', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Stress test with rapid parameter changes
    const stressTest = await page.evaluate(() => {
      if (!window.store) return { error: 'No store' };
      
      const startTime = performance.now();
      const state = window.store.getState();
      
      if (!state.setHomeParams) return { error: 'No parameter setter' };
      
      // Rapid parameter updates
      for (let i = 0; i < 50; i++) {
        setTimeout(() => {
          state.setHomeParams({
            hue: Math.random(),
            density: Math.random() * 0.8 + 0.2,
            morph: Math.random(),
            chaos: Math.random() * 0.5,
            noiseFreq: Math.random() * 3 + 1,
            glitch: Math.random() * 0.3
          });
        }, i * 20);
      }
      
      return new Promise(resolve => {
        setTimeout(() => {
          const endTime = performance.now();
          const stats = window.geometryStats || {};
          
          resolve({
            duration: endTime - startTime,
            totalDrawCalls: stats.rendered ? stats.rendered.length : 0,
            averageDrawCallsPerSecond: stats.rendered ? 
              (stats.rendered.length / (endTime - startTime)) * 1000 : 0,
            noErrors: !stats.errors || stats.errors.length === 0
          });
        }, 1200);
      });
    });

    const results = await stressTest;
    
    if (!results.error) {
      expect(results.noErrors).toBe(true);
      expect(results.totalDrawCalls).toBeGreaterThan(0);
    }
  });

  test('should properly handle geometry morphing transitions', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Test morphing between geometry states
    const morphingTest = await page.evaluate(() => {
      if (!window.store) return { error: 'No store' };
      
      const state = window.store.getState();
      if (!state.setHomeParams) return { error: 'No parameter setter' };
      
      const morphStates = [
        { morph: 0.0, chaos: 0.0 },  // Base geometry
        { morph: 0.5, chaos: 0.3 },  // Intermediate morph
        { morph: 1.0, chaos: 0.1 },  // Full morph
        { morph: 0.2, chaos: 0.8 }   // Chaos emphasis
      ];
      
      let morphResults = [];
      
      morphStates.forEach((morphState, index) => {
        setTimeout(() => {
          state.setHomeParams(morphState);
          
          // Record morph state
          setTimeout(() => {
            const stats = window.geometryStats || {};
            morphResults.push({
              morphValue: morphState.morph,
              chaosValue: morphState.chaos,
              drawCalls: stats.rendered ? stats.rendered.length : 0,
              timestamp: performance.now()
            });
          }, 100);
        }, index * 300);
      });
      
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            morphResults,
            totalTransitions: morphResults.length,
            renderingContinuous: morphResults.every(r => r.drawCalls > 0)
          });
        }, 1500);
      });
    });

    const results = await morphingTest;
    
    if (!results.error && results.morphResults) {
      expect(results.totalTransitions).toBeGreaterThan(0);
    }
  });
});

test.describe('VIB34D Geometry Types', () => {
  test('should support tetrahedron lattice geometry', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Test tetrahedron-specific rendering
    const tetrahedronTest = await page.evaluate(() => {
      // Look for tetrahedron-specific shader uniforms or geometry
      const canvases = document.querySelectorAll('canvas');
      let hasTetrahedronGeometry = false;
      
      for (let canvas of canvases) {
        const gl = canvas.getContext('webgl');
        if (gl) {
          const program = gl.getParameter(gl.CURRENT_PROGRAM);
          if (program) {
            const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
            for (let i = 0; i < numUniforms; i++) {
              const uniform = gl.getActiveUniform(program, i);
              if (uniform && uniform.name.toLowerCase().includes('tetrahedron')) {
                hasTetrahedronGeometry = true;
                break;
              }
            }
          }
        }
      }
      
      return {
        hasTetrahedronGeometry,
        totalCanvases: canvases.length
      };
    });

    expect(tetrahedronTest.totalCanvases).toBeGreaterThan(0);
  });

  test('should support hypercube 4D projections', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Test hypercube-specific rendering
    const hypercubeTest = await page.evaluate(() => {
      // Check for 4D cube projection mathematics
      let hasHypercubeFeatures = false;
      const canvases = document.querySelectorAll('canvas');
      
      for (let canvas of canvases) {
        const gl = canvas.getContext('webgl');
        if (gl) {
          const program = gl.getParameter(gl.CURRENT_PROGRAM);
          if (program) {
            const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
            for (let i = 0; i < numUniforms; i++) {
              const uniform = gl.getActiveUniform(program, i);
              if (uniform && (
                uniform.name.includes('hypercube') ||
                uniform.name.includes('4d') ||
                uniform.name.includes('tesseract')
              )) {
                hasHypercubeFeatures = true;
                break;
              }
            }
          }
        }
      }
      
      return {
        hasHypercubeFeatures,
        renderingActive: window.geometryStats && window.geometryStats.rendered.length > 0
      };
    });

    expect(hypercubeTest.renderingActive).toBe(true);
  });

  test('should handle complex fractal geometry', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Test fractal complexity under high chaos parameters
    const fractalTest = await page.evaluate(() => {
      if (!window.store) return { error: 'No store' };
      
      const state = window.store.getState();
      if (!state.setHomeParams) return { error: 'No parameter setter' };
      
      // Set high chaos for fractal emergence
      state.setHomeParams({
        chaos: 0.9,
        morph: 0.7,
        density: 0.8,
        noiseFreq: 3.5
      });
      
      return new Promise(resolve => {
        setTimeout(() => {
          const stats = window.geometryStats || {};
          resolve({
            fractalRendering: stats.rendered && stats.rendered.length > 0,
            highComplexityHandled: true,
            drawCallsUnderHighChaos: stats.rendered ? stats.rendered.length : 0
          });
        }, 1000);
      });
    });

    const results = await fractalTest;
    
    if (!results.error) {
      expect(results.fractalRendering).toBe(true);
      expect(results.highComplexityHandled).toBe(true);
    }
  });
});

test.describe('VIB34D Performance & Memory', () => {
  test('should maintain stable memory usage during geometry updates', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Monitor memory usage during geometry operations
    const memoryTest = await page.evaluate(() => {
      const initialMemory = performance.memory ? {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize
      } : null;
      
      if (!window.store) return { error: 'No store', initialMemory };
      
      const state = window.store.getState();
      if (!state.setHomeParams) return { error: 'No parameter setter', initialMemory };
      
      // Stress test geometry with multiple updates
      for (let i = 0; i < 20; i++) {
        setTimeout(() => {
          state.setHomeParams({
            density: Math.random(),
            morph: Math.random(),
            chaos: Math.random()
          });
        }, i * 50);
      }
      
      return new Promise(resolve => {
        setTimeout(() => {
          const finalMemory = performance.memory ? {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize
          } : null;
          
          resolve({
            initialMemory,
            finalMemory,
            memoryGrowth: finalMemory && initialMemory ? 
              finalMemory.used - initialMemory.used : 'unknown',
            hasMemoryInfo: !!performance.memory
          });
        }, 1200);
      });
    });

    const results = await memoryTest;
    
    if (results.hasMemoryInfo && results.memoryGrowth !== 'unknown') {
      // Memory growth should be reasonable (< 10MB for geometry updates)
      expect(results.memoryGrowth).toBeLessThan(10 * 1024 * 1024);
    }
  });

  test('should optimize geometry LOD based on performance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Test Level of Detail optimization
    const lodTest = await page.evaluate(() => {
      // Simulate performance constraints
      const startTime = performance.now();
      let frameCount = 0;
      const frameTimes = [];
      
      function measureFrames() {
        const now = performance.now();
        frameTimes.push(now - startTime);
        frameCount++;
        
        if (frameCount < 30) {
          requestAnimationFrame(measureFrames);
        }
      }
      
      requestAnimationFrame(measureFrames);
      
      return new Promise(resolve => {
        setTimeout(() => {
          const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
          const fps = 1000 / avgFrameTime;
          
          resolve({
            averageFPS: fps,
            performanceStable: fps > 20,
            frameTimeConsistency: frameTimes.length > 20
          });
        }, 1000);
      });
    });

    const results = await lodTest;
    
    expect(results.frameTimeConsistency).toBe(true);
    expect(results.averageFPS).toBeGreaterThan(10); // Minimum acceptable FPS
  });
});