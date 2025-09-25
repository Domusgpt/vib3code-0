/**
 * Unit tests for Reality Inversion Engine
 *
 * @jest-environment jsdom
 */

import { RealityInversionEngine } from '../interaction-coordinator';
import { SectionVisualState } from '../types';

describe('RealityInversionEngine', () => {
  let engine: RealityInversionEngine;
  let mockSections: Record<string, SectionVisualState>;

  beforeEach(() => {
    engine = new RealityInversionEngine();

    mockSections = {
      home: {
        gridDensity: 1.0,
        colorIntensity: 1.0,
        reactivity: 1.0,
        depth: 0,
        lastUpdated: Date.now(),
      },
      about: {
        gridDensity: 0.5,
        colorIntensity: 1.5,
        reactivity: 0.8,
        depth: 10,
        lastUpdated: Date.now(),
      },
      contact: {
        gridDensity: 2.0,
        colorIntensity: 2.0,
        reactivity: 2.0,
        depth: -5,
        lastUpdated: Date.now(),
      },
    };
  });

  describe('Reality Inversion Logic', () => {
    test('inverts visual parameters correctly', () => {
      const result = engine.triggerRealityInversion(mockSections, 1.0);

      // Check home section inversion (normal values)
      expect(result.sectionStates.home.gridDensity).toBeCloseTo(0.1); // Max(0.1, (1-1)*1) = 0.1
      expect(result.sectionStates.home.colorIntensity).toBeCloseTo(1.0); // Max(0.2, (2-1)*1) = 1
      expect(result.sectionStates.home.depth).toBe(0); // -0 * 1 = 0

      // Check about section inversion (low values)
      expect(result.sectionStates.about.gridDensity).toBeCloseTo(0.5); // Max(0.1, (1-0.5)*1) = 0.5
      expect(result.sectionStates.about.colorIntensity).toBeCloseTo(0.5); // Max(0.2, (2-1.5)*1) = 0.5
      expect(result.sectionStates.about.depth).toBe(-10); // -10 * 1 = -10

      // Check contact section inversion (high values)
      expect(result.sectionStates.contact.gridDensity).toBeCloseTo(0.1); // Max(0.1, (1-2)*1) = 0.1 (clamped)
      expect(result.sectionStates.contact.colorIntensity).toBeCloseTo(0.2); // Max(0.2, (2-2)*1) = 0.2 (clamped)
      expect(result.sectionStates.contact.depth).toBe(5); // -(-5) * 1 = 5
    });

    test('CRITICAL: bounds fix prevents values below minimum at low intensity', () => {
      // This tests the critical bounds fix
      const result = engine.triggerRealityInversion(mockSections, 0.5);

      // All gridDensity values should be >= 0.1
      Object.values(result.sectionStates).forEach(state => {
        expect(state.gridDensity).toBeGreaterThanOrEqual(0.1);
      });

      // All colorIntensity values should be >= 0.2
      Object.values(result.sectionStates).forEach(state => {
        expect(state.colorIntensity).toBeGreaterThanOrEqual(0.2);
      });

      // All reactivity values should be >= 0.2
      Object.values(result.sectionStates).forEach(state => {
        expect(state.reactivity).toBeGreaterThanOrEqual(0.2);
      });
    });

    test('scales with intensity correctly', () => {
      const result1 = engine.triggerRealityInversion(mockSections, 1.0);
      const result2 = engine.triggerRealityInversion(mockSections, 2.0);

      // Higher intensity should produce different results
      const home1 = result1.sectionStates.home;
      const home2 = result2.sectionStates.home;

      // At intensity 2.0, colorIntensity should be higher
      // Max(0.2, (2-1)*2) = 2.0 vs Max(0.2, (2-1)*1) = 1.0
      expect(home2.colorIntensity).toBeGreaterThan(home1.colorIntensity);
    });
  });

  describe('Parameter Patch Generation', () => {
    test('generates valid parameter patches', () => {
      const result = engine.triggerRealityInversion(mockSections, 1.0);

      Object.keys(mockSections).forEach(sectionId => {
        const patch = result.paramPatches[sectionId];

        expect(patch).toBeDefined();
        expect(patch.density).toBeGreaterThanOrEqual(0);
        expect(patch.chaos).toBeGreaterThanOrEqual(0);
        expect(patch.chaos).toBeLessThanOrEqual(1);
        expect(patch.glitch).toBeGreaterThanOrEqual(0);
        expect(patch.glitch).toBeLessThanOrEqual(1);
        expect(patch.chromaShift).toBeGreaterThanOrEqual(-1);
        expect(patch.chromaShift).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Sparkle Effects', () => {
    test('generates correct number of sparkle effects', () => {
      const result = engine.triggerRealityInversion(mockSections, 1.0);

      expect(result.sparkleEffects).toHaveLength(3); // One per section

      result.sparkleEffects?.forEach(effect => {
        expect(effect.count).toBe(8); // 8 * 1.0 intensity
        expect(effect.duration).toBe(1500); // 1500 * 1.0 intensity
        expect(mockSections[effect.sectionId]).toBeDefined();
      });
    });

    test('scales sparkle effects with intensity', () => {
      const result = engine.triggerRealityInversion(mockSections, 1.5);

      result.sparkleEffects?.forEach(effect => {
        expect(effect.count).toBe(12); // 8 * 1.5
        expect(effect.duration).toBe(2250); // 1500 * 1.5
      });
    });
  });

  describe('Inversion State Management', () => {
    test('tracks inversion state correctly', () => {
      expect(engine.isInversionActive()).toBe(false);
      expect(engine.getInversionProgress()).toBe(0);

      const result = engine.triggerRealityInversion(mockSections, 1.0);

      expect(engine.isInversionActive()).toBe(true);
      expect(engine.getInversionProgress()).toBeGreaterThanOrEqual(0);
      expect(result.realityInversion?.isActive).toBe(true);
      expect(result.realityInversion?.duration).toBe(2000);
    });

    test('can clear inversion state', () => {
      engine.triggerRealityInversion(mockSections, 1.0);
      expect(engine.isInversionActive()).toBe(true);

      engine.clearInversion();
      expect(engine.isInversionActive()).toBe(false);
    });
  });

  describe('Helper Methods', () => {
    test('generateInversionPatches produces valid patches', () => {
      const invertedStates = {
        test: {
          gridDensity: 0.5,
          colorIntensity: 1.5,
          reactivity: 0.8,
          depth: 10,
          lastUpdated: Date.now(),
        }
      };

      const patches = engine.generateInversionPatches(invertedStates);
      const patch = patches.test;

      expect(patch.density).toBe(0.5);
      expect(patch.morph).toBeCloseTo(0); // Max(0, 1 - 1.5) = 0
      expect(patch.chaos).toBeCloseTo(0.24); // 0.8 * 0.3
      expect(patch.dispAmp).toBeCloseTo(0.02); // 10 * 0.002
    });

    test('generateSparkleEffects creates effects for all sections', () => {
      const effects = engine.generateSparkleEffects(mockSections, 1.2);

      expect(effects).toHaveLength(3);
      effects.forEach(effect => {
        expect(effect.count).toBeGreaterThanOrEqual(8); // 8 + random * 8, scaled by intensity
        expect(effect.count).toBeLessThanOrEqual(20); // Should be reasonable max
        expect(effect.duration).toBeGreaterThanOrEqual(1500 * 1.2);
        expect(effect.duration).toBeLessThanOrEqual(2000 * 1.2);
      });
    });
  });
});