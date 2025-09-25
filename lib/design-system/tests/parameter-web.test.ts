/**
 * Unit tests for Parameter Web Engine
 *
 * @jest-environment jsdom
 */

import { ParameterWebEngine } from '../interaction-coordinator';
import { ParameterWeb, SectionVisualState } from '../types';

describe('ParameterWebEngine', () => {
  let engine: ParameterWebEngine;
  let mockStates: Record<string, SectionVisualState>;

  beforeEach(() => {
    const web: ParameterWeb = {
      relationships: [
        {
          source: 'gridDensity',
          target: 'colorIntensity',
          relationship: 'linear',
          intensity: 0.5,
        },
        {
          source: 'depth',
          target: 'reactivity',
          relationship: 'exponential',
          intensity: 0.3,
        },
      ],
    };

    engine = new ParameterWebEngine(web);

    mockStates = {
      home: {
        gridDensity: 1.0,
        colorIntensity: 1.0,
        reactivity: 1.0,
        depth: 0,
        lastUpdated: Date.now(),
      },
      about: {
        gridDensity: 0.8,
        colorIntensity: 1.2,
        reactivity: 0.9,
        depth: 5,
        lastUpdated: Date.now(),
      },
    };
  });

  describe('Mathematical Relationships', () => {
    test('linear relationship calculates correctly', () => {
      const cascades = engine.calculateCascade('home', 'gridDensity', 1.5, mockStates);

      expect(cascades.about).toBeDefined();
      expect(cascades.about.colorIntensity).toBeCloseTo(1.2 + (1.5 * 0.5));
    });

    test('exponential relationship calculates correctly', () => {
      const cascades = engine.calculateCascade('about', 'depth', 10, mockStates);

      expect(cascades.home).toBeDefined();
      expect(cascades.home.reactivity).toBeCloseTo(1.0 + (100 * 0.3)); // 10^2 * 0.3
    });

    test('does not cascade to source section', () => {
      const cascades = engine.calculateCascade('home', 'gridDensity', 1.5, mockStates);

      expect(cascades.home).toBeUndefined();
      expect(cascades.about).toBeDefined();
    });
  });

  describe('Input Validation', () => {
    test('handles NaN input values', () => {
      const cascades = engine.calculateCascade('home', 'gridDensity', NaN, mockStates);

      // Should not crash and should produce valid results
      expect(cascades).toBeDefined();
      Object.values(cascades).forEach(cascade => {
        Object.values(cascade).forEach(value => {
          if (typeof value === 'number') {
            expect(isFinite(value)).toBe(true);
          }
        });
      });
    });

    test('handles Infinity input values', () => {
      const cascades = engine.calculateCascade('home', 'gridDensity', Infinity, mockStates);

      // Should clamp to safe bounds
      expect(cascades).toBeDefined();
      Object.values(cascades).forEach(cascade => {
        Object.values(cascade).forEach(value => {
          if (typeof value === 'number') {
            expect(value).toBeLessThanOrEqual(1000);
            expect(value).toBeGreaterThanOrEqual(-1000);
          }
        });
      });
    });
  });

  describe('Curve Function Validation', () => {
    test('accepts valid curve functions', () => {
      const webWithCurve: ParameterWeb = {
        relationships: [
          {
            source: 'gridDensity',
            target: 'colorIntensity',
            relationship: 'linear',
            intensity: 1.0,
            curve: (x: number) => Math.sin(x * Math.PI),
          },
        ],
      };

      const engineWithCurve = new ParameterWebEngine(webWithCurve);
      const cascades = engineWithCurve.calculateCascade('home', 'gridDensity', 0.5, mockStates);

      expect(cascades.about).toBeDefined();
      expect(cascades.about.colorIntensity).toBeDefined();
      expect(isFinite(cascades.about.colorIntensity as number)).toBe(true);
    });

    test('rejects invalid curve functions', () => {
      const webWithInvalidCurve: ParameterWeb = {
        relationships: [
          {
            source: 'gridDensity',
            target: 'colorIntensity',
            relationship: 'linear',
            intensity: 1.0,
            curve: (x: number) => 1 / (x - 0.5), // Division by zero at x = 0.5
          },
        ],
      };

      const engineWithInvalidCurve = new ParameterWebEngine(webWithInvalidCurve);
      const cascades = engineWithInvalidCurve.calculateCascade('home', 'gridDensity', 0.5, mockStates);

      // Should fallback to linear calculation
      expect(cascades.about).toBeDefined();
      expect(cascades.about.colorIntensity).toBeCloseTo(1.2 + (0.5 * 1.0));
    });
  });

  describe('Factory Methods', () => {
    test('createHoverWeb returns valid configuration', () => {
      const hoverWeb = ParameterWebEngine.createHoverWeb();

      expect(hoverWeb.relationships).toHaveLength(3);
      expect(hoverWeb.relationships[0]).toMatchObject({
        source: 'gridDensity',
        target: 'colorIntensity',
        relationship: 'linear',
        intensity: 0.3,
      });
    });

    test('createClickWeb returns valid configuration', () => {
      const clickWeb = ParameterWebEngine.createClickWeb();

      expect(clickWeb.relationships).toHaveLength(2);
      expect(clickWeb.relationships[0]).toMatchObject({
        source: 'gridDensity',
        target: 'depth',
        relationship: 'inverse',
        intensity: 0.5,
      });
    });
  });

  describe('Bounds Enforcement', () => {
    test('respects minimum gridDensity bounds', () => {
      const cascades = engine.calculateCascade('home', 'gridDensity', -5, mockStates);

      if (cascades.about?.gridDensity !== undefined) {
        expect(cascades.about.gridDensity).toBeGreaterThanOrEqual(0.1);
      }
    });

    test('respects minimum colorIntensity bounds', () => {
      const cascades = engine.calculateCascade('home', 'gridDensity', -5, mockStates);

      if (cascades.about?.colorIntensity !== undefined) {
        expect(cascades.about.colorIntensity).toBeGreaterThanOrEqual(0.2);
      }
    });

    test('respects maximum bounds', () => {
      const cascades = engine.calculateCascade('home', 'gridDensity', 1000, mockStates);

      Object.values(cascades).forEach(cascade => {
        if (cascade.gridDensity !== undefined) {
          expect(cascade.gridDensity).toBeLessThanOrEqual(4);
        }
        if (cascade.colorIntensity !== undefined) {
          expect(cascade.colorIntensity).toBeLessThanOrEqual(4);
        }
        if (cascade.reactivity !== undefined) {
          expect(cascade.reactivity).toBeLessThanOrEqual(4);
        }
      });
    });
  });
});