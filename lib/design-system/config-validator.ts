import { ParameterWeb, CoordinatedPreset, DesignSystemAdvancedTuning, SectionVisualState } from './types';
import { coordinatedPresets } from './presets';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

export interface SystemConfiguration {
  presets: Record<string, CoordinatedPreset>;
  parameterWebs: ParameterWeb[];
  tuning: DesignSystemAdvancedTuning;
  sections: Record<string, SectionVisualState>;
}

/**
 * Configuration Validator - Ensures system setup integrity
 *
 * Validates the design system configuration for completeness, correctness,
 * and optimal performance. Detects common setup issues and provides
 * actionable recommendations for improvement.
 *
 * @example
 * ```typescript
 * const validator = new ConfigValidator();
 * const result = validator.validateSystem({
 *   presets: coordinatedPresets,
 *   parameterWebs: [hoverWeb, clickWeb],
 *   tuning: defaultTuning,
 *   sections: sectionStates
 * });
 *
 * if (!result.isValid) {
 *   console.error('Configuration errors:', result.errors);
 * }
 * ```
 */
export class ConfigValidator {
  private readonly REQUIRED_PRESET_PROPERTIES = [
    'name', 'description', 'effects'
  ] as const;

  private readonly REQUIRED_EFFECT_PROPERTIES = [
    'focused', 'unfocused', 'system'
  ] as const;

  private readonly VALID_PARAMETER_NAMES = [
    'hue', 'density', 'morph', 'chaos', 'noiseFreq', 'glitch',
    'dispAmp', 'chromaShift', 'timeScale', 'beatPhase'
  ] as const;

  private readonly VALID_RELATIONSHIPS = [
    'linear', 'exponential', 'inverse', 'logarithmic'
  ] as const;

  /**
   * Validate complete system configuration
   */
  validateSystem(config: SystemConfiguration): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    try {
      // Validate presets
      const presetResult = this.validatePresets(config.presets);
      errors.push(...presetResult.errors);
      warnings.push(...presetResult.warnings);
      recommendations.push(...presetResult.recommendations);

      // Validate parameter webs
      config.parameterWebs.forEach((web, index) => {
        const webResult = this.validateParameterWeb(web, `Web ${index}`);
        errors.push(...webResult.errors);
        warnings.push(...webResult.warnings);
        recommendations.push(...webResult.recommendations);
      });

      // Validate tuning configuration
      const tuningResult = this.validateTuning(config.tuning);
      errors.push(...tuningResult.errors);
      warnings.push(...tuningResult.warnings);
      recommendations.push(...tuningResult.recommendations);

      // Validate section states
      const sectionsResult = this.validateSections(config.sections);
      errors.push(...sectionsResult.errors);
      warnings.push(...sectionsResult.warnings);
      recommendations.push(...sectionsResult.recommendations);

      // Cross-validation checks
      const crossResult = this.validateCrossReferences(config);
      errors.push(...crossResult.errors);
      warnings.push(...crossResult.warnings);
      recommendations.push(...crossResult.recommendations);

    } catch (error) {
      errors.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      recommendations,
    };
  }

  /**
   * Validate preset collection
   */
  private validatePresets(presets: Record<string, CoordinatedPreset>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    if (Object.keys(presets).length === 0) {
      errors.push('No presets defined - system requires at least one preset');
      return { isValid: false, errors, warnings, recommendations };
    }

    Object.entries(presets).forEach(([key, preset]) => {
      // Check required properties
      this.REQUIRED_PRESET_PROPERTIES.forEach(prop => {
        if (!(prop in preset)) {
          errors.push(`Preset '${key}' missing required property: ${prop}`);
        }
      });

      // Validate preset structure
      if (preset.effects) {
        this.REQUIRED_EFFECT_PROPERTIES.forEach(effectType => {
          if (!(effectType in preset.effects)) {
            errors.push(`Preset '${key}' missing effect type: ${effectType}`);
          }
        });

        // Check for valid parameter names in effects
        const allEffectParams = [
          ...Object.keys(preset.effects.focused?.parameters || {}),
          ...Object.keys(preset.effects.unfocused?.parameters || {}),
        ];

        allEffectParams.forEach(param => {
          if (!this.VALID_PARAMETER_NAMES.includes(param as any)) {
            warnings.push(`Preset '${key}' uses unknown parameter: ${param}`);
          }
        });
      }

      // Check for reasonable parameter ranges
      if (preset.effects?.focused?.parameters) {
        const params = preset.effects.focused.parameters;
        Object.entries(params).forEach(([param, value]) => {
          if (typeof value === 'number') {
            if (param === 'hue' && (value < 0 || value > 1)) {
              warnings.push(`Preset '${key}' has hue outside [0,1]: ${value}`);
            }
            if (param === 'density' && (value < 0 || value > 4)) {
              warnings.push(`Preset '${key}' has extreme density value: ${value}`);
            }
            if (param === 'chaos' && (value < 0 || value > 1)) {
              warnings.push(`Preset '${key}' has chaos outside [0,1]: ${value}`);
            }
          }
        });
      }
    });

    // Check for preset diversity
    const presetCount = Object.keys(presets).length;
    if (presetCount < 3) {
      recommendations.push('Consider adding more presets for richer visual variety');
    }

    // Check for preset diversity based on names
    const presetNames = Object.values(presets).map(p => p.name.toLowerCase());
    const themes = new Set(presetNames.map(name => {
      // Extract theme keywords from preset names
      if (name.includes('zen') || name.includes('calm')) return 'zen';
      if (name.includes('dimensional') || name.includes('focus')) return 'dimensional';
      if (name.includes('holographic') || name.includes('shimmer')) return 'holographic';
      if (name.includes('chaos') || name.includes('glitch')) return 'chaos';
      return 'other';
    }));

    if (themes.size < 2) {
      recommendations.push('Consider adding presets with different themes for better variety');
    }

    return { isValid: errors.length === 0, errors, warnings, recommendations };
  }

  /**
   * Validate parameter web configuration
   */
  private validateParameterWeb(web: ParameterWeb, contextName: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    if (!web.relationships || web.relationships.length === 0) {
      warnings.push(`${contextName}: No parameter relationships defined`);
      return { isValid: true, errors, warnings, recommendations };
    }

    web.relationships.forEach((rel, index) => {
      const relContext = `${contextName} Relationship ${index}`;

      // Check required properties
      if (!rel.source) {
        errors.push(`${relContext}: Missing source parameter`);
      } else if (!this.VALID_PARAMETER_NAMES.includes(rel.source as any)) {
        warnings.push(`${relContext}: Unknown source parameter: ${rel.source}`);
      }

      if (!rel.target) {
        errors.push(`${relContext}: Missing target parameter`);
      } else if (!this.VALID_PARAMETER_NAMES.includes(rel.target as any)) {
        warnings.push(`${relContext}: Unknown target parameter: ${rel.target}`);
      }

      if (!rel.relationship) {
        errors.push(`${relContext}: Missing relationship type`);
      } else if (!this.VALID_RELATIONSHIPS.includes(rel.relationship)) {
        errors.push(`${relContext}: Invalid relationship type: ${rel.relationship}`);
      }

      // Check intensity bounds
      if (typeof rel.intensity === 'number') {
        if (rel.intensity < 0 || rel.intensity > 2) {
          warnings.push(`${relContext}: Intensity outside typical range [0,2]: ${rel.intensity}`);
        }
      } else {
        errors.push(`${relContext}: Intensity must be a number`);
      }

      // Validate curve function if present
      if (rel.curve) {
        try {
          const testResult = rel.curve(0.5);
          if (!isFinite(testResult)) {
            errors.push(`${relContext}: Curve function produces invalid output`);
          }
        } catch (error) {
          errors.push(`${relContext}: Curve function throws error: ${error instanceof Error ? error.message : 'Unknown'}`);
        }
      }

      // Check for circular dependencies
      const circular = web.relationships.find(other =>
        other !== rel && other.source === rel.target && other.target === rel.source
      );
      if (circular) {
        warnings.push(`${relContext}: Potential circular dependency detected with ${rel.target} -> ${rel.source}`);
      }
    });

    // Recommendations for web complexity
    if (web.relationships.length > 10) {
      recommendations.push(`${contextName}: Large number of relationships (${web.relationships.length}) may impact performance`);
    }

    return { isValid: errors.length === 0, errors, warnings, recommendations };
  }

  /**
   * Validate system tuning parameters
   */
  private validateTuning(tuning: DesignSystemAdvancedTuning): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check speed multiplier
    if (typeof tuning.speedMultiplier !== 'number') {
      errors.push('speedMultiplier must be a number');
    } else {
      if (tuning.speedMultiplier <= 0) {
        errors.push('speedMultiplier must be positive');
      } else if (tuning.speedMultiplier < 0.1 || tuning.speedMultiplier > 5) {
        warnings.push(`speedMultiplier outside typical range [0.1,5]: ${tuning.speedMultiplier}`);
      }
    }

    // Check interaction sensitivity
    if (typeof tuning.interactionSensitivity !== 'number') {
      errors.push('interactionSensitivity must be a number');
    } else {
      if (tuning.interactionSensitivity <= 0) {
        errors.push('interactionSensitivity must be positive');
      } else if (tuning.interactionSensitivity < 0.1 || tuning.interactionSensitivity > 3) {
        warnings.push(`interactionSensitivity outside typical range [0.1,3]: ${tuning.interactionSensitivity}`);
      }
    }

    // Check transition duration multiplier
    if (typeof tuning.transitionDurationMultiplier !== 'number') {
      errors.push('transitionDurationMultiplier must be a number');
    } else {
      if (tuning.transitionDurationMultiplier <= 0) {
        errors.push('transitionDurationMultiplier must be positive');
      } else if (tuning.transitionDurationMultiplier < 0.1 || tuning.transitionDurationMultiplier > 5) {
        warnings.push(`transitionDurationMultiplier outside typical range [0.1,5]: ${tuning.transitionDurationMultiplier}`);
      }
    }

    // Performance recommendations
    if (tuning.speedMultiplier > 2 && tuning.interactionSensitivity > 2) {
      recommendations.push('High speed and sensitivity values may cause visual overload');
    }

    if (tuning.transitionDurationMultiplier > 3) {
      recommendations.push('Very slow transitions may impact user experience');
    }

    return { isValid: errors.length === 0, errors, warnings, recommendations };
  }

  /**
   * Validate section states
   */
  private validateSections(sections: Record<string, SectionVisualState>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    if (Object.keys(sections).length === 0) {
      errors.push('No sections defined - system requires at least one section');
      return { isValid: false, errors, warnings, recommendations };
    }

    Object.entries(sections).forEach(([sectionId, state]) => {
      // Validate numeric ranges
      if (state.gridDensity < 0.1 || state.gridDensity > 4) {
        warnings.push(`Section '${sectionId}' gridDensity outside typical range [0.1,4]: ${state.gridDensity}`);
      }

      if (state.colorIntensity < 0.2 || state.colorIntensity > 4) {
        warnings.push(`Section '${sectionId}' colorIntensity outside typical range [0.2,4]: ${state.colorIntensity}`);
      }

      if (state.reactivity < 0.2 || state.reactivity > 4) {
        warnings.push(`Section '${sectionId}' reactivity outside typical range [0.2,4]: ${state.reactivity}`);
      }

      if (Math.abs(state.depth) > 100) {
        warnings.push(`Section '${sectionId}' has extreme depth value: ${state.depth}`);
      }

      // Check timestamp freshness
      const age = Date.now() - state.lastUpdated;
      if (age > 60000) { // 1 minute
        warnings.push(`Section '${sectionId}' state is stale (${Math.round(age / 1000)}s old)`);
      }
    });

    // Check for required sections
    const requiredSections = ['home', 'hero'];
    requiredSections.forEach(required => {
      if (!(required in sections)) {
        recommendations.push(`Consider adding a '${required}' section for better UX patterns`);
      }
    });

    return { isValid: errors.length === 0, errors, warnings, recommendations };
  }

  /**
   * Validate cross-references between configuration components
   */
  private validateCrossReferences(config: SystemConfiguration): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check that parameter web relationships reference valid sections
    config.parameterWebs.forEach((web, webIndex) => {
      web.relationships.forEach((rel, relIndex) => {
        // This would need section targeting info in relationships to validate
        // For now, just check that we have reasonable relationships
      });
    });

    // Validate preset coverage
    const presetParams = new Set<string>();
    Object.values(config.presets).forEach(preset => {
      if (preset.effects?.focused?.parameters) {
        Object.keys(preset.effects.focused.parameters).forEach(param => {
          presetParams.add(param);
        });
      }
      if (preset.effects?.unfocused?.parameters) {
        Object.keys(preset.effects.unfocused.parameters).forEach(param => {
          presetParams.add(param);
        });
      }
    });

    // Check that major parameters are covered by presets
    const majorParams = ['density', 'chaos', 'morph', 'glitch'];
    majorParams.forEach(param => {
      if (!presetParams.has(param)) {
        recommendations.push(`Consider adding presets that modify ${param} for richer visual effects`);
      }
    });

    return { isValid: errors.length === 0, errors, warnings, recommendations };
  }

  /**
   * Quick health check for runtime validation
   */
  quickHealthCheck(config: Partial<SystemConfiguration>): {
    healthy: boolean;
    criticalIssues: string[];
    score: number; // 0-100
  } {
    const issues: string[] = [];
    let score = 100;

    // Check basic requirements
    if (!config.presets || Object.keys(config.presets).length === 0) {
      issues.push('No presets available');
      score -= 30;
    }

    if (!config.sections || Object.keys(config.sections).length === 0) {
      issues.push('No sections configured');
      score -= 25;
    }

    if (!config.tuning) {
      issues.push('No tuning configuration');
      score -= 15;
    } else {
      // Quick tuning checks
      if (config.tuning.speedMultiplier <= 0) {
        issues.push('Invalid speed multiplier');
        score -= 10;
      }
    }

    if (!config.parameterWebs || config.parameterWebs.length === 0) {
      score -= 10; // Not critical but reduces functionality
    }

    return {
      healthy: issues.length === 0,
      criticalIssues: issues,
      score: Math.max(0, score),
    };
  }
}

/**
 * Factory function for creating a config validator
 */
export const createConfigValidator = (): ConfigValidator => {
  return new ConfigValidator();
};

/**
 * Utility to validate just the built-in presets
 */
export const validateBuiltInPresets = (): ValidationResult => {
  const validator = new ConfigValidator();
  return validator['validatePresets'](coordinatedPresets);
};

/**
 * Environment check for browser capabilities
 */
export const checkBrowserSupport = (): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Check WebGL support
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  if (!gl) {
    errors.push('WebGL not supported - system requires WebGL for visualization');
  } else {
    const extensions = {
      floatTextures: gl.getExtension('OES_texture_float') || gl.getExtension('EXT_color_buffer_float'),
      depthTexture: gl.getExtension('WEBGL_depth_texture'),
      derivatives: gl.getExtension('OES_standard_derivatives'),
    };

    if (!extensions.floatTextures) {
      warnings.push('Float textures not supported - some effects may be limited');
    }

    if (!extensions.derivatives) {
      warnings.push('Derivative functions not supported - some shader effects unavailable');
    }
  }

  // Check for requestAnimationFrame
  if (!window.requestAnimationFrame) {
    errors.push('requestAnimationFrame not supported - animations will not work');
  }

  // Check for Web Audio API
  if (!window.AudioContext && !(window as any).webkitAudioContext) {
    warnings.push('Web Audio API not supported - audio reactivity unavailable');
  }

  // Check for performance API
  if (!window.performance || !performance.now) {
    warnings.push('Performance API limited - timing measurements may be inaccurate');
  }

  // Check for memory info (Chrome-specific)
  if (!('memory' in performance)) {
    recommendations.push('Memory monitoring unavailable - performance tracking limited');
  }

  // Check viewport size
  if (window.innerWidth < 768) {
    recommendations.push('Small viewport detected - consider mobile-optimized settings');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    recommendations,
  };
};