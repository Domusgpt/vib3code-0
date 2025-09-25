/**
 * Unit tests for Configuration Validator
 *
 * @jest-environment jsdom
 */

import { ConfigValidator, createConfigValidator, validateBuiltInPresets, checkBrowserSupport } from '../config-validator';
import { SystemConfiguration } from '../config-validator';
import { coordinatedPresets } from '../presets';
import { ParameterWeb, DesignSystemAdvancedTuning, SectionVisualState } from '../types';

describe('ConfigValidator', () => {
  let validator: ConfigValidator;
  let mockSystemConfig: SystemConfiguration;

  beforeEach(() => {
    validator = createConfigValidator();

    mockSystemConfig = {
      presets: coordinatedPresets,
      parameterWebs: [
        {
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
        },
      ],
      tuning: {
        speedMultiplier: 1.0,
        interactionSensitivity: 1.0,
        transitionDurationMultiplier: 1.0,
      },
      sections: {
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
      },
    };
  });

  describe('System Validation', () => {
    test('validates complete valid system configuration', () => {
      const result = validator.validateSystem(mockSystemConfig);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('detects missing presets', () => {
      const invalidConfig = { ...mockSystemConfig, presets: {} };
      const result = validator.validateSystem(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('No presets defined - system requires at least one preset');
    });

    test('detects missing sections', () => {
      const invalidConfig = { ...mockSystemConfig, sections: {} };
      const result = validator.validateSystem(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('No sections defined - system requires at least one section');
    });

    test('handles validation exceptions gracefully', () => {
      const corruptConfig = null as any;
      const result = validator.validateSystem(corruptConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toMatch(/Validation failed/);
    });
  });

  describe('Preset Validation', () => {
    test('validates built-in presets successfully', () => {
      const result = validateBuiltInPresets();

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('detects invalid preset structure', () => {
      const invalidPresets = {
        invalid: {
          // Missing required properties
          effects: {
            focused: { parameters: {} },
            unfocused: { parameters: {} },
            system: {},
          },
        } as any,
      };

      const config = { ...mockSystemConfig, presets: invalidPresets };
      const result = validator.validateSystem(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Preset \'invalid\' missing required property: name');
      expect(result.errors).toContain('Preset \'invalid\' missing required property: description');
    });

    test('warns about unknown parameters', () => {
      const presetsWithUnknownParam = {
        testPreset: {
          id: 'test',
          name: 'Test Preset',
          description: 'Test',
          tags: ['test'],
          effects: {
            focused: {
              visual: {},
              parameters: { unknownParam: 1.0 },
              timing: { duration: 500 }
            },
            unfocused: {
              visual: {},
              parameters: {},
              timing: { duration: 500 }
            },
            system: {}
          },
        },
      };

      const config = { ...mockSystemConfig, presets: presetsWithUnknownParam };
      const result = validator.validateSystem(config);

      expect(result.warnings).toContain('Preset \'testPreset\' uses unknown parameter: unknownParam');
    });

    test('warns about parameter values outside normal ranges', () => {
      const presetsWithExtremeValues = {
        extremePreset: {
          id: 'extreme',
          name: 'Extreme Preset',
          description: 'Test',
          tags: ['test'],
          effects: {
            focused: {
              visual: {},
              parameters: {
                hue: 2.0,      // Outside [0,1]
                density: 10.0, // Outside [0,4]
                chaos: -0.5    // Outside [0,1]
              },
              timing: { duration: 500 }
            },
            unfocused: {
              visual: {},
              parameters: {},
              timing: { duration: 500 }
            },
            system: {}
          },
        },
      };

      const config = { ...mockSystemConfig, presets: presetsWithExtremeValues };
      const result = validator.validateSystem(config);

      expect(result.warnings).toContain('Preset \'extremePreset\' has hue outside [0,1]: 2');
      expect(result.warnings).toContain('Preset \'extremePreset\' has extreme density value: 10');
      expect(result.warnings).toContain('Preset \'extremePreset\' has chaos outside [0,1]: -0.5');
    });
  });

  describe('Parameter Web Validation', () => {
    test('validates parameter relationships correctly', () => {
      const result = validator.validateSystem(mockSystemConfig);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('detects missing relationship properties', () => {
      const invalidWeb: ParameterWeb = {
        relationships: [
          {
            source: '',  // Missing
            target: 'colorIntensity',
            relationship: 'linear',
            intensity: 0.5,
          } as any,
        ],
      };

      const config = { ...mockSystemConfig, parameterWebs: [invalidWeb] };
      const result = validator.validateSystem(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Web 0 Relationship 0: Missing source parameter');
    });

    test('detects invalid relationship types', () => {
      const invalidWeb: ParameterWeb = {
        relationships: [
          {
            source: 'gridDensity',
            target: 'colorIntensity',
            relationship: 'invalid' as any,
            intensity: 0.5,
          },
        ],
      };

      const config = { ...mockSystemConfig, parameterWebs: [invalidWeb] };
      const result = validator.validateSystem(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Web 0 Relationship 0: Invalid relationship type: invalid');
    });

    test('warns about unknown parameter names', () => {
      const webWithUnknownParams: ParameterWeb = {
        relationships: [
          {
            source: 'unknownSource',
            target: 'unknownTarget',
            relationship: 'linear',
            intensity: 0.5,
          },
        ],
      };

      const config = { ...mockSystemConfig, parameterWebs: [webWithUnknownParams] };
      const result = validator.validateSystem(config);

      expect(result.warnings).toContain('Web 0 Relationship 0: Unknown source parameter: unknownSource');
      expect(result.warnings).toContain('Web 0 Relationship 0: Unknown target parameter: unknownTarget');
    });

    test('validates curve functions', () => {
      const webWithValidCurve: ParameterWeb = {
        relationships: [
          {
            source: 'gridDensity',
            target: 'colorIntensity',
            relationship: 'linear',
            intensity: 0.5,
            curve: (x: number) => Math.sin(x * Math.PI),
          },
        ],
      };

      const config = { ...mockSystemConfig, parameterWebs: [webWithValidCurve] };
      const result = validator.validateSystem(config);

      expect(result.isValid).toBe(true);
    });

    test('detects invalid curve functions', () => {
      const webWithInvalidCurve: ParameterWeb = {
        relationships: [
          {
            source: 'gridDensity',
            target: 'colorIntensity',
            relationship: 'linear',
            intensity: 0.5,
            curve: () => { throw new Error('Test error'); },
          },
        ],
      };

      const config = { ...mockSystemConfig, parameterWebs: [webWithInvalidCurve] };
      const result = validator.validateSystem(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Web 0 Relationship 0: Curve function throws error: Test error');
    });

    test('detects circular dependencies', () => {
      const webWithCircular: ParameterWeb = {
        relationships: [
          {
            source: 'gridDensity',
            target: 'colorIntensity',
            relationship: 'linear',
            intensity: 0.5,
          },
          {
            source: 'colorIntensity',
            target: 'gridDensity',
            relationship: 'inverse',
            intensity: 0.3,
          },
        ],
      };

      const config = { ...mockSystemConfig, parameterWebs: [webWithCircular] };
      const result = validator.validateSystem(config);

      expect(result.warnings).toContain(
        'Web 0 Relationship 0: Potential circular dependency detected with colorIntensity -> gridDensity'
      );
    });
  });

  describe('Tuning Validation', () => {
    test('validates correct tuning parameters', () => {
      const result = validator.validateSystem(mockSystemConfig);

      expect(result.isValid).toBe(true);
    });

    test('detects invalid tuning values', () => {
      const invalidTuning: DesignSystemAdvancedTuning = {
        speedMultiplier: -1,     // Invalid
        interactionSensitivity: 0,  // Invalid
        transitionDurationMultiplier: 'invalid' as any, // Wrong type
      };

      const config = { ...mockSystemConfig, tuning: invalidTuning };
      const result = validator.validateSystem(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('speedMultiplier must be positive');
      expect(result.errors).toContain('interactionSensitivity must be positive');
      expect(result.errors).toContain('transitionDurationMultiplier must be a number');
    });

    test('warns about extreme tuning values', () => {
      const extremeTuning: DesignSystemAdvancedTuning = {
        speedMultiplier: 10,     // Very high
        interactionSensitivity: 0.01,  // Very low
        transitionDurationMultiplier: 8, // Very high
      };

      const config = { ...mockSystemConfig, tuning: extremeTuning };
      const result = validator.validateSystem(config);

      expect(result.warnings).toContain('speedMultiplier outside typical range [0.1,5]: 10');
      expect(result.warnings).toContain('interactionSensitivity outside typical range [0.1,3]: 0.01');
      expect(result.warnings).toContain('transitionDurationMultiplier outside typical range [0.1,5]: 8');
    });

    test('provides performance recommendations', () => {
      const highTuning: DesignSystemAdvancedTuning = {
        speedMultiplier: 2.5,
        interactionSensitivity: 2.5,
        transitionDurationMultiplier: 4,
      };

      const config = { ...mockSystemConfig, tuning: highTuning };
      const result = validator.validateSystem(config);

      expect(result.recommendations).toContain('High speed and sensitivity values may cause visual overload');
      expect(result.recommendations).toContain('Very slow transitions may impact user experience');
    });
  });

  describe('Section Validation', () => {
    test('warns about extreme section values', () => {
      const sectionsWithExtremeValues: Record<string, SectionVisualState> = {
        extreme: {
          gridDensity: 10,      // Outside typical range
          colorIntensity: -1,   // Outside typical range
          reactivity: 100,      // Outside typical range
          depth: 500,           // Extreme depth
          lastUpdated: Date.now() - 120000, // 2 minutes old
        },
      };

      const config = { ...mockSystemConfig, sections: sectionsWithExtremeValues };
      const result = validator.validateSystem(config);

      expect(result.warnings).toContain('Section \'extreme\' gridDensity outside typical range [0.1,4]: 10');
      expect(result.warnings).toContain('Section \'extreme\' colorIntensity outside typical range [0.2,4]: -1');
      expect(result.warnings).toContain('Section \'extreme\' reactivity outside typical range [0.2,4]: 100');
      expect(result.warnings).toContain('Section \'extreme\' has extreme depth value: 500');
      expect(result.warnings).toContain('Section \'extreme\' state is stale (120s old)');
    });
  });

  describe('Quick Health Check', () => {
    test('returns healthy status for valid config', () => {
      const health = validator.quickHealthCheck(mockSystemConfig);

      expect(health.healthy).toBe(true);
      expect(health.criticalIssues).toHaveLength(0);
      expect(health.score).toBe(100);
    });

    test('detects critical issues', () => {
      const unhealthyConfig = {
        presets: {},
        sections: {},
        tuning: { speedMultiplier: -1 } as any,
      };

      const health = validator.quickHealthCheck(unhealthyConfig);

      expect(health.healthy).toBe(false);
      expect(health.criticalIssues).toContain('No presets available');
      expect(health.criticalIssues).toContain('No sections configured');
      expect(health.criticalIssues).toContain('Invalid speed multiplier');
      expect(health.score).toBeLessThan(100);
    });

    test('handles partial configurations', () => {
      const partialConfig = {
        presets: coordinatedPresets,
        // Missing other properties
      };

      const health = validator.quickHealthCheck(partialConfig);

      expect(health.score).toBeLessThan(100);
      expect(health.score).toBeGreaterThan(0);
    });
  });

  describe('Browser Support Check', () => {
    // Mock DOM environment for testing
    beforeEach(() => {
      // Mock canvas and WebGL context
      const mockCanvas = {
        getContext: jest.fn(() => ({
          getExtension: jest.fn(() => true),
        })),
      };

      jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'canvas') {
          return mockCanvas as any;
        }
        return document.createElement(tagName);
      });

      // Mock window properties
      Object.defineProperty(window, 'requestAnimationFrame', {
        value: jest.fn(),
        writable: true,
      });

      Object.defineProperty(window, 'AudioContext', {
        value: jest.fn(),
        writable: true,
      });

      Object.defineProperty(window, 'performance', {
        value: { now: jest.fn(), memory: {} },
        writable: true,
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('detects WebGL support', () => {
      const result = checkBrowserSupport();

      expect(result.isValid).toBe(true);
      expect(result.errors).not.toContain(expect.stringMatching(/WebGL not supported/));
    });

    test('detects missing WebGL', () => {
      jest.spyOn(document, 'createElement').mockImplementation(() => ({
        getContext: jest.fn(() => null),
      }) as any);

      const result = checkBrowserSupport();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('WebGL not supported - system requires WebGL for visualization');
    });

    test('provides mobile recommendations', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 400,
        writable: true,
      });

      const result = checkBrowserSupport();

      expect(result.recommendations).toContain('Small viewport detected - consider mobile-optimized settings');
    });
  });
});