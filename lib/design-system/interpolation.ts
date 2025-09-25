import { ParameterPatch } from './types';

export type EasingFunction = (t: number) => number;
export type InterpolationMethod = 'linear' | 'cubic' | 'exponential' | 'bounce' | 'elastic' | 'custom';

export interface InterpolationOptions {
  method: InterpolationMethod;
  duration: number;
  easingFunction?: EasingFunction;
  onUpdate?: (value: any) => void;
  onComplete?: () => void;
}

export interface KeyframeData<T = number> {
  time: number; // 0-1
  value: T;
  easing?: EasingFunction;
}

/**
 * Advanced Interpolation System - Smooth parameter transitions
 *
 * Provides sophisticated interpolation methods for parameter animations,
 * including cubic splines, elastic easing, and multi-dimensional interpolation.
 * Designed for high-performance 60fps parameter updates.
 *
 * @example
 * ```typescript
 * const interpolator = new ParameterInterpolator();
 *
 * // Simple value interpolation
 * interpolator.interpolate(0.5, 1.5, 0.3, { method: 'cubic', duration: 500 });
 *
 * // Parameter patch interpolation
 * interpolator.interpolateParameterPatch(
 *   { density: 1.0, chaos: 0.2 },
 *   { density: 2.0, chaos: 0.8 },
 *   { method: 'elastic', duration: 1000 }
 * );
 * ```
 */
export class ParameterInterpolator {
  private activeInterpolations: Map<string, {
    startValue: any;
    targetValue: any;
    startTime: number;
    duration: number;
    easingFunction: EasingFunction;
    onUpdate: (value: any) => void;
    onComplete: () => void;
  }> = new Map();

  private animationFrameId?: number;

  constructor() {
    this.startAnimationLoop();
  }

  /**
   * Interpolate between two numeric values
   */
  interpolate(
    startValue: number,
    targetValue: number,
    progress: number,
    options: Partial<InterpolationOptions> = {}
  ): number {
    const { method = 'linear', easingFunction } = options;
    const easing = easingFunction || this.getEasingFunction(method);
    const easedProgress = easing(Math.max(0, Math.min(1, progress)));

    return startValue + (targetValue - startValue) * easedProgress;
  }

  /**
   * Start animated interpolation
   */
  animateValue(
    id: string,
    startValue: number,
    targetValue: number,
    options: InterpolationOptions
  ): void {
    const { duration, method = 'linear', easingFunction, onUpdate, onComplete } = options;

    this.activeInterpolations.set(id, {
      startValue,
      targetValue,
      startTime: performance.now(),
      duration,
      easingFunction: easingFunction || this.getEasingFunction(method),
      onUpdate: onUpdate || (() => {}),
      onComplete: onComplete || (() => {}),
    });
  }

  /**
   * Interpolate parameter patches smoothly
   */
  interpolateParameterPatch(
    startPatch: ParameterPatch,
    targetPatch: ParameterPatch,
    progress: number,
    method: InterpolationMethod = 'linear'
  ): ParameterPatch {
    const result: ParameterPatch = {};
    const easing = this.getEasingFunction(method);
    const easedProgress = easing(Math.max(0, Math.min(1, progress)));

    // Get all parameter keys from both patches
    const allKeys = new Set([
      ...Object.keys(startPatch),
      ...Object.keys(targetPatch)
    ]);

    allKeys.forEach(key => {
      const startValue = startPatch[key as keyof ParameterPatch] || 0;
      const targetValue = targetPatch[key as keyof ParameterPatch] || 0;

      result[key as keyof ParameterPatch] = startValue + (targetValue - startValue) * easedProgress;
    });

    return result;
  }

  /**
   * Animate parameter patch transition
   */
  animateParameterPatch(
    id: string,
    startPatch: ParameterPatch,
    targetPatch: ParameterPatch,
    options: InterpolationOptions
  ): void {
    const { duration, method = 'linear', easingFunction, onUpdate, onComplete } = options;

    this.activeInterpolations.set(id, {
      startValue: startPatch,
      targetValue: targetPatch,
      startTime: performance.now(),
      duration,
      easingFunction: easingFunction || this.getEasingFunction(method),
      onUpdate: onUpdate || (() => {}),
      onComplete: onComplete || (() => {}),
    });
  }

  /**
   * Keyframe-based interpolation
   */
  interpolateKeyframes<T>(keyframes: KeyframeData<T>[], time: number): T {
    if (keyframes.length === 0) throw new Error('No keyframes provided');
    if (keyframes.length === 1) return keyframes[0].value;

    // Sort keyframes by time
    const sortedKeyframes = keyframes.sort((a, b) => a.time - b.time);

    // Handle edge cases
    if (time <= sortedKeyframes[0].time) {
      return sortedKeyframes[0].value;
    }
    if (time >= sortedKeyframes[sortedKeyframes.length - 1].time) {
      return sortedKeyframes[sortedKeyframes.length - 1].value;
    }

    // Find the two keyframes to interpolate between
    let startFrame, endFrame;
    for (let i = 0; i < sortedKeyframes.length - 1; i++) {
      if (time >= sortedKeyframes[i].time && time <= sortedKeyframes[i + 1].time) {
        startFrame = sortedKeyframes[i];
        endFrame = sortedKeyframes[i + 1];
        break;
      }
    }

    if (!startFrame || !endFrame) {
      return sortedKeyframes[sortedKeyframes.length - 1].value;
    }

    // Calculate local progress between keyframes
    const localProgress = (time - startFrame.time) / (endFrame.time - startFrame.time);

    // Apply easing if specified
    const easing = endFrame.easing || this.getEasingFunction('linear');
    const easedProgress = easing(localProgress);

    // Interpolate based on value type
    return this.interpolateValues(startFrame.value, endFrame.value, easedProgress);
  }

  /**
   * Multi-dimensional cubic spline interpolation
   */
  cubicSplineInterpolation(
    points: Array<{ x: number; y: number }>,
    x: number
  ): number {
    if (points.length < 2) throw new Error('Need at least 2 points for spline interpolation');

    // Sort points by x value
    const sortedPoints = points.sort((a, b) => a.x - b.x);

    // Handle edge cases
    if (x <= sortedPoints[0].x) return sortedPoints[0].y;
    if (x >= sortedPoints[sortedPoints.length - 1].x) return sortedPoints[sortedPoints.length - 1].y;

    // Find the segment
    let i = 0;
    while (i < sortedPoints.length - 1 && x > sortedPoints[i + 1].x) {
      i++;
    }

    // Simplified cubic interpolation (Hermite spline)
    const p0 = sortedPoints[Math.max(0, i - 1)];
    const p1 = sortedPoints[i];
    const p2 = sortedPoints[i + 1];
    const p3 = sortedPoints[Math.min(sortedPoints.length - 1, i + 2)];

    const t = (x - p1.x) / (p2.x - p1.x);
    const t2 = t * t;
    const t3 = t2 * t;

    // Tangent vectors (simplified)
    const m1 = (p2.y - p0.y) / (p2.x - p0.x);
    const m2 = (p3.y - p1.y) / (p3.x - p1.x);

    // Hermite basis functions
    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;

    return h00 * p1.y + h10 * m1 * (p2.x - p1.x) + h01 * p2.y + h11 * m2 * (p2.x - p1.x);
  }

  /**
   * Vector field interpolation for complex parameter relationships
   */
  vectorFieldInterpolation(
    parameterSpace: Record<string, number>,
    fieldDefinition: Record<string, (params: Record<string, number>) => number>
  ): Record<string, number> {
    const result: Record<string, number> = {};

    Object.entries(fieldDefinition).forEach(([param, fieldFunction]) => {
      try {
        result[param] = fieldFunction(parameterSpace);
      } catch (error) {
        console.warn(`Vector field calculation failed for ${param}:`, error);
        result[param] = parameterSpace[param] || 0;
      }
    });

    return result;
  }

  /**
   * Stop specific interpolation
   */
  stopInterpolation(id: string): void {
    this.activeInterpolations.delete(id);
  }

  /**
   * Stop all active interpolations
   */
  stopAllInterpolations(): void {
    this.activeInterpolations.clear();
  }

  /**
   * Get interpolation progress
   */
  getInterpolationProgress(id: string): number | null {
    const interpolation = this.activeInterpolations.get(id);
    if (!interpolation) return null;

    const elapsed = performance.now() - interpolation.startTime;
    return Math.min(1, elapsed / interpolation.duration);
  }

  /**
   * Destroy interpolator and cleanup
   */
  destroy(): void {
    this.stopAllInterpolations();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  /**
   * Animation loop for active interpolations - PERFORMANCE OPTIMIZED
   */
  private startAnimationLoop(): void {
    const animate = () => {
      const now = performance.now();
      const completedIds: string[] = [];

      // CRITICAL: Only run if there are active interpolations
      if (this.activeInterpolations.size === 0) {
        // No interpolations active, stop the loop to prevent infinite RAF calls
        this.animationFrameId = undefined;
        console.log('[VIB34D Interpolator] Animation loop stopped - no active interpolations');
        return;
      }

      this.activeInterpolations.forEach((interpolation, id) => {
        const elapsed = now - interpolation.startTime;
        const progress = Math.min(1, elapsed / interpolation.duration);
        const easedProgress = interpolation.easingFunction(progress);

        let currentValue;
        if (typeof interpolation.startValue === 'number') {
          // Numeric interpolation
          currentValue = interpolation.startValue +
            (interpolation.targetValue - interpolation.startValue) * easedProgress;
        } else {
          // Parameter patch interpolation
          currentValue = this.interpolateParameterPatch(
            interpolation.startValue,
            interpolation.targetValue,
            easedProgress
          );
        }

        try {
          interpolation.onUpdate(currentValue);
        } catch (error) {
          console.error('[VIB34D Interpolator] Update callback error:', error);
          completedIds.push(id); // Remove problematic interpolation
        }

        if (progress >= 1) {
          completedIds.push(id);
          try {
            interpolation.onComplete();
          } catch (error) {
            console.error('[VIB34D Interpolator] Complete callback error:', error);
          }
        }
      });

      // Remove completed interpolations
      completedIds.forEach(id => this.activeInterpolations.delete(id));

      // Only continue if there are still active interpolations
      if (this.activeInterpolations.size > 0) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        this.animationFrameId = undefined;
        console.log('[VIB34D Interpolator] Animation loop ended - all interpolations complete');
      }
    };

    // Only start if not already running
    if (!this.animationFrameId) {
      this.animationFrameId = requestAnimationFrame(animate);
      console.log('[VIB34D Interpolator] Animation loop started');
    }
  }

  /**
   * Get easing function by name
   */
  private getEasingFunction(method: InterpolationMethod): EasingFunction {
    switch (method) {
      case 'linear':
        return t => t;

      case 'cubic':
        return t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      case 'exponential':
        return t => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, 10 * (t - 1));

      case 'bounce':
        return t => {
          const n1 = 7.5625;
          const d1 = 2.75;

          if (t < 1 / d1) {
            return n1 * t * t;
          } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
          } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
          } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
          }
        };

      case 'elastic':
        return t => {
          const c4 = (2 * Math.PI) / 3;
          return t === 0 ? 0 : t === 1 ? 1 :
            -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
        };

      default:
        return t => t; // Linear fallback
    }
  }

  /**
   * Type-aware value interpolation
   */
  private interpolateValues<T>(startValue: T, endValue: T, progress: number): T {
    if (typeof startValue === 'number' && typeof endValue === 'number') {
      return (startValue + (endValue - startValue) * progress) as T;
    }

    if (typeof startValue === 'object' && typeof endValue === 'object' &&
        startValue !== null && endValue !== null) {
      const result: any = {};

      // Get all keys from both objects
      const allKeys = new Set([
        ...Object.keys(startValue),
        ...Object.keys(endValue)
      ]);

      allKeys.forEach(key => {
        const startVal = (startValue as any)[key];
        const endVal = (endValue as any)[key];

        if (typeof startVal === 'number' && typeof endVal === 'number') {
          result[key] = startVal + (endVal - startVal) * progress;
        } else {
          // For non-numeric values, use step function at 50% progress
          result[key] = progress < 0.5 ? startVal : endVal;
        }
      });

      return result as T;
    }

    // For non-interpolatable types, use step function
    return progress < 0.5 ? startValue : endValue;
  }
}

/**
 * Built-in easing functions collection
 */
export const EasingFunctions = {
  // Basic easing
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

  // Cubic easing
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (--t) * t * t + 1,
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  // Exponential easing
  easeInExpo: (t: number) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  easeOutExpo: (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInOutExpo: (t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return Math.pow(2, 10 * (t * 2 - 1)) / 2;
    return (2 - Math.pow(2, -10 * (t * 2 - 1))) / 2;
  },

  // Elastic easing
  easeInElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 :
      -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },
  easeOutElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 :
      Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },

  // Bounce easing
  easeInBounce: (t: number) => 1 - EasingFunctions.easeOutBounce(1 - t),
  easeOutBounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },

  // Back easing (overshoot)
  easeInBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
};

/**
 * Factory function for creating interpolator
 */
export const createParameterInterpolator = (): ParameterInterpolator => {
  return new ParameterInterpolator();
};

/**
 * Utility functions for common interpolation operations
 */
export const InterpolationUtils = {
  /**
   * Create smooth parameter transition
   */
  createSmoothTransition(
    startPatch: ParameterPatch,
    targetPatch: ParameterPatch,
    duration: number,
    method: InterpolationMethod = 'cubic'
  ): (progress: number) => ParameterPatch {
    const interpolator = new ParameterInterpolator();

    return (progress: number) => {
      return interpolator.interpolateParameterPatch(startPatch, targetPatch, progress, method);
    };
  },

  /**
   * Create parameter oscillation
   */
  createOscillation(
    basePatch: ParameterPatch,
    amplitude: Partial<ParameterPatch>,
    frequency: number
  ): (time: number) => ParameterPatch {
    return (time: number) => {
      const result: ParameterPatch = { ...basePatch };

      Object.entries(amplitude).forEach(([key, amp]) => {
        if (amp !== undefined && key in result) {
          const oscillation = Math.sin(time * frequency * 2 * Math.PI) * amp;
          result[key as keyof ParameterPatch] = (basePatch[key as keyof ParameterPatch] || 0) + oscillation;
        }
      });

      return result;
    };
  },

  /**
   * Create parameter wave function
   */
  createParameterWave(
    parameters: (keyof ParameterPatch)[],
    waveFunction: (t: number, param: string) => number
  ): (time: number) => ParameterPatch {
    return (time: number) => {
      const result: ParameterPatch = {};

      parameters.forEach(param => {
        result[param] = waveFunction(time, param);
      });

      return result;
    };
  },
};