import { ParameterPatch } from './types';

export interface SyncLayer {
  lastUpdate: number;
  pendingPatches: ParameterPatch[];
}

export interface SyncState {
  css: SyncLayer;
  webgl: SyncLayer;
  audio: SyncLayer;
}

export interface SyncConfiguration {
  batchSize: number;
  maxBatchDelay: number;
  enableAudioSync: boolean;
  enableCSSSync: boolean;
  enableWebGLSync: boolean;
}

export interface SyncResult {
  css: boolean;
  webgl: boolean;
  audio: boolean;
  timestamp: number;
  batchSize: number;
  performance?: SyncPerformanceMetrics;
}

export interface SyncPerformanceMetrics {
  executionTime: number;
  batchOptimizationRatio: number;
  memoryUsageKB: number;
  frameDropped: boolean;
  warnings: string[];
}

/**
 * Unified Synchronization System - React-friendly batched multi-layer sync
 *
 * Coordinates parameter updates across multiple rendering layers (CSS, WebGL, Audio)
 * using efficient batching and requestAnimationFrame timing to maintain 60fps performance.
 *
 * @example
 * ```typescript
 * const syncCoordinator = createSyncCoordinator({
 *   batchSize: 10,
 *   maxBatchDelay: 16
 * });
 *
 * syncCoordinator.registerSyncCallback('css', (patches) => {
 *   // Update CSS custom properties
 * });
 *
 * await syncCoordinator.scheduleBatchSync({
 *   css: [patch1, patch2],
 *   webgl: [patch3]
 * });
 * ```
 */
export class SyncCoordinator {
  private syncState: SyncState;
  private syncScheduled = false;
  private configuration: SyncConfiguration;
  private syncCallbacks: {
    css?: (patches: ParameterPatch[]) => void;
    webgl?: (patches: ParameterPatch[]) => void;
    audio?: (patches: ParameterPatch[]) => void;
  } = {};

  // Performance monitoring
  private performanceHistory: SyncPerformanceMetrics[] = [];
  private frameBudgetMs = 16.67; // 60fps frame budget
  private lastFrameTime = 0;
  private enablePerformanceMonitoring = true;

  constructor(config: Partial<SyncConfiguration> = {}) {
    this.configuration = {
      batchSize: 10,
      maxBatchDelay: 16, // ~60fps
      enableAudioSync: true,
      enableCSSSync: true,
      enableWebGLSync: true,
      ...config,
    };

    this.syncState = {
      css: { lastUpdate: 0, pendingPatches: [] },
      webgl: { lastUpdate: 0, pendingPatches: [] },
      audio: { lastUpdate: 0, pendingPatches: [] },
    };
  }

  // Register sync callbacks for each layer
  registerSyncCallback(
    layer: 'css' | 'webgl' | 'audio',
    callback: (patches: ParameterPatch[]) => void
  ): void {
    this.syncCallbacks[layer] = callback;
  }

  // Schedule batched sync with requestAnimationFrame
  scheduleBatchSync(
    layerPatches: Partial<Record<'css' | 'webgl' | 'audio', ParameterPatch[]>>
  ): Promise<SyncResult> {
    return new Promise((resolve) => {
      // Add patches to pending queues
      Object.entries(layerPatches).forEach(([layer, patches]) => {
        const syncLayer = this.syncState[layer as keyof SyncState];
        if (syncLayer && patches) {
          syncLayer.pendingPatches.push(...patches);
        }
      });

      // Schedule sync if not already scheduled
      if (!this.syncScheduled) {
        this.syncScheduled = true;
        requestAnimationFrame(() => {
          const result = this.performBatchSync();
          this.syncScheduled = false;
          resolve(result);
        });
      }
    });
  }

  // Perform the actual synchronization
  private performBatchSync(): SyncResult {
    const timestamp = Date.now();
    const startTime = performance.now();
    const initialMemory = this.getMemoryUsage();

    const result: SyncResult = {
      css: false,
      webgl: false,
      audio: false,
      timestamp,
      batchSize: 0,
    };

    const warnings: string[] = [];
    let totalPatchesBeforeOptimization = 0;
    let totalPatchesAfterOptimization = 0;

    // Sync CSS layer
    if (this.configuration.enableCSSSync && this.syncState.css.pendingPatches.length > 0) {
      const originalPatchCount = this.syncState.css.pendingPatches.length;
      const patches = this.optimizePatchBatch(this.syncState.css.pendingPatches);

      totalPatchesBeforeOptimization += originalPatchCount;
      totalPatchesAfterOptimization += patches.length;

      if (originalPatchCount > this.configuration.batchSize) {
        warnings.push(`CSS: Large batch size (${originalPatchCount}), consider increasing batch frequency`);
      }

      if (this.syncCallbacks.css) {
        this.syncCallbacks.css(patches);
        result.css = true;
        result.batchSize += patches.length;
      }
      this.syncState.css.pendingPatches = [];
      this.syncState.css.lastUpdate = timestamp;
    }

    // Sync WebGL layer
    if (this.configuration.enableWebGLSync && this.syncState.webgl.pendingPatches.length > 0) {
      const originalPatchCount = this.syncState.webgl.pendingPatches.length;
      const patches = this.optimizePatchBatch(this.syncState.webgl.pendingPatches);

      totalPatchesBeforeOptimization += originalPatchCount;
      totalPatchesAfterOptimization += patches.length;

      if (originalPatchCount > this.configuration.batchSize) {
        warnings.push(`WebGL: Large batch size (${originalPatchCount}), may cause frame drops`);
      }

      if (this.syncCallbacks.webgl) {
        this.syncCallbacks.webgl(patches);
        result.webgl = true;
        result.batchSize += patches.length;
      }
      this.syncState.webgl.pendingPatches = [];
      this.syncState.webgl.lastUpdate = timestamp;
    }

    // Sync Audio layer
    if (this.configuration.enableAudioSync && this.syncState.audio.pendingPatches.length > 0) {
      const originalPatchCount = this.syncState.audio.pendingPatches.length;
      const patches = this.optimizePatchBatch(this.syncState.audio.pendingPatches);

      totalPatchesBeforeOptimization += originalPatchCount;
      totalPatchesAfterOptimization += patches.length;

      if (originalPatchCount > this.configuration.batchSize) {
        warnings.push(`Audio: Large batch size (${originalPatchCount}), may cause audio glitches`);
      }

      if (this.syncCallbacks.audio) {
        this.syncCallbacks.audio(patches);
        result.audio = true;
        result.batchSize += patches.length;
      }
      this.syncState.audio.pendingPatches = [];
      this.syncState.audio.lastUpdate = timestamp;
    }

    // Performance monitoring
    if (this.enablePerformanceMonitoring) {
      const executionTime = performance.now() - startTime;
      const frameDropped = executionTime > this.frameBudgetMs;
      const finalMemory = this.getMemoryUsage();

      if (frameDropped) {
        warnings.push(`Frame budget exceeded: ${executionTime.toFixed(2)}ms > ${this.frameBudgetMs}ms`);
      }

      const batchOptimizationRatio = totalPatchesBeforeOptimization > 0
        ? totalPatchesAfterOptimization / totalPatchesBeforeOptimization
        : 1;

      const performanceMetrics: SyncPerformanceMetrics = {
        executionTime,
        batchOptimizationRatio,
        memoryUsageKB: finalMemory - initialMemory,
        frameDropped,
        warnings,
      };

      result.performance = performanceMetrics;
      this.recordPerformanceMetrics(performanceMetrics);
    }

    this.lastFrameTime = timestamp;
    return result;
  }

  // Optimize patch batches by merging similar parameters
  private optimizePatchBatch(patches: ParameterPatch[]): ParameterPatch[] {
    if (patches.length <= 1) return patches;

    // Group patches by similarity and merge
    const merged: ParameterPatch = {};

    patches.forEach((patch) => {
      Object.entries(patch).forEach(([key, value]) => {
        if (value !== undefined) {
          // Use the most recent value for each parameter
          merged[key as keyof ParameterPatch] = value;
        }
      });
    });

    return [merged];
  }

  // Immediate sync for critical updates (bypasses batching)
  syncImmediate(
    layerPatches: Partial<Record<'css' | 'webgl' | 'audio', ParameterPatch[]>>
  ): SyncResult {
    const timestamp = Date.now();
    const result: SyncResult = {
      css: false,
      webgl: false,
      audio: false,
      timestamp,
      batchSize: 0,
    };

    // Sync each layer immediately
    Object.entries(layerPatches).forEach(([layer, patches]) => {
      if (patches && patches.length > 0) {
        const callback = this.syncCallbacks[layer as keyof typeof this.syncCallbacks];
        if (callback) {
          const optimized = this.optimizePatchBatch(patches);
          callback(optimized);
          (result as any)[layer] = true;
          result.batchSize += optimized.length;

          // Update sync state
          const syncLayer = this.syncState[layer as keyof SyncState];
          syncLayer.lastUpdate = timestamp;
        }
      }
    });

    return result;
  }

  // Get sync statistics with performance data
  getSyncStats(): {
    css: { lastUpdate: number; hasPending: boolean; pendingCount: number };
    webgl: { lastUpdate: number; hasPending: boolean; pendingCount: number };
    audio: { lastUpdate: number; hasPending: boolean; pendingCount: number };
    isScheduled: boolean;
    performance: {
      averageExecutionTime: number;
      frameDropRate: number;
      averageOptimizationRatio: number;
      memoryTrendKB: number;
      recentWarnings: string[];
    };
  } {
    const performanceStats = this.calculatePerformanceStats();

    return {
      css: {
        lastUpdate: this.syncState.css.lastUpdate,
        hasPending: this.syncState.css.pendingPatches.length > 0,
        pendingCount: this.syncState.css.pendingPatches.length,
      },
      webgl: {
        lastUpdate: this.syncState.webgl.lastUpdate,
        hasPending: this.syncState.webgl.pendingPatches.length > 0,
        pendingCount: this.syncState.webgl.pendingPatches.length,
      },
      audio: {
        lastUpdate: this.syncState.audio.lastUpdate,
        hasPending: this.syncState.audio.pendingPatches.length > 0,
        pendingCount: this.syncState.audio.pendingPatches.length,
      },
      isScheduled: this.syncScheduled,
      performance: performanceStats,
    };
  }

  // Update configuration
  updateConfiguration(config: Partial<SyncConfiguration>): void {
    this.configuration = { ...this.configuration, ...config };
  }

  // Clear all pending patches
  clearPendingPatches(): void {
    this.syncState.css.pendingPatches = [];
    this.syncState.webgl.pendingPatches = [];
    this.syncState.audio.pendingPatches = [];
  }

  // Get memory usage in KB
  private getMemoryUsage(): number {
    if ('memory' in performance && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / 1024;
    }
    return 0;
  }

  // Record performance metrics
  private recordPerformanceMetrics(metrics: SyncPerformanceMetrics): void {
    this.performanceHistory.push(metrics);

    // Keep only last 100 measurements to prevent memory leak
    if (this.performanceHistory.length > 100) {
      this.performanceHistory.shift();
    }
  }

  // Calculate aggregated performance statistics
  private calculatePerformanceStats(): {
    averageExecutionTime: number;
    frameDropRate: number;
    averageOptimizationRatio: number;
    memoryTrendKB: number;
    recentWarnings: string[];
  } {
    if (this.performanceHistory.length === 0) {
      return {
        averageExecutionTime: 0,
        frameDropRate: 0,
        averageOptimizationRatio: 1,
        memoryTrendKB: 0,
        recentWarnings: [],
      };
    }

    const recent = this.performanceHistory.slice(-20); // Last 20 measurements
    const averageExecutionTime = recent.reduce((sum, m) => sum + m.executionTime, 0) / recent.length;
    const frameDropRate = recent.filter(m => m.frameDropped).length / recent.length;
    const averageOptimizationRatio = recent.reduce((sum, m) => sum + m.batchOptimizationRatio, 0) / recent.length;

    // Calculate memory trend (slope of last 10 measurements)
    const memoryValues = recent.slice(-10).map(m => m.memoryUsageKB);
    const memoryTrendKB = memoryValues.length > 1
      ? (memoryValues[memoryValues.length - 1] - memoryValues[0]) / (memoryValues.length - 1)
      : 0;

    // Collect recent unique warnings
    const allWarnings = recent.flatMap(m => m.warnings);
    const recentWarnings = Array.from(new Set(allWarnings)).slice(-5);

    return {
      averageExecutionTime,
      frameDropRate,
      averageOptimizationRatio,
      memoryTrendKB,
      recentWarnings,
    };
  }

  // Enable/disable performance monitoring
  setPerformanceMonitoring(enabled: boolean): void {
    this.enablePerformanceMonitoring = enabled;
    if (!enabled) {
      this.performanceHistory = [];
    }
  }

  // Get detailed performance report
  getPerformanceReport(): {
    totalSyncs: number;
    averageExecutionTime: number;
    frameDropRate: number;
    worstExecutionTime: number;
    bestOptimizationRatio: number;
    memoryLeakDetected: boolean;
    recommendations: string[];
  } {
    if (this.performanceHistory.length === 0) {
      return {
        totalSyncs: 0,
        averageExecutionTime: 0,
        frameDropRate: 0,
        worstExecutionTime: 0,
        bestOptimizationRatio: 1,
        memoryLeakDetected: false,
        recommendations: [],
      };
    }

    const history = this.performanceHistory;
    const totalSyncs = history.length;
    const averageExecutionTime = history.reduce((sum, m) => sum + m.executionTime, 0) / totalSyncs;
    const frameDropRate = history.filter(m => m.frameDropped).length / totalSyncs;
    const worstExecutionTime = Math.max(...history.map(m => m.executionTime));
    const bestOptimizationRatio = Math.min(...history.map(m => m.batchOptimizationRatio));

    // Memory leak detection: significant upward trend over time
    const memoryValues = history.map(m => m.memoryUsageKB);
    const memoryLeakDetected = memoryValues.length > 50 &&
      memoryValues.slice(-10).reduce((sum, val) => sum + val, 0) / 10 >
      memoryValues.slice(0, 10).reduce((sum, val) => sum + val, 0) / 10 + 100; // 100KB threshold

    const recommendations: string[] = [];
    if (frameDropRate > 0.1) {
      recommendations.push('High frame drop rate detected. Consider reducing batch size or complexity.');
    }
    if (averageExecutionTime > this.frameBudgetMs * 0.5) {
      recommendations.push('Sync operations taking significant frame time. Optimize shader updates.');
    }
    if (bestOptimizationRatio > 0.8) {
      recommendations.push('Low batch optimization efficiency. Review parameter deduplication logic.');
    }
    if (memoryLeakDetected) {
      recommendations.push('Potential memory leak detected. Check for unreleased resources.');
    }

    return {
      totalSyncs,
      averageExecutionTime,
      frameDropRate,
      worstExecutionTime,
      bestOptimizationRatio,
      memoryLeakDetected,
      recommendations,
    };
  }

  // Clear performance history
  clearPerformanceHistory(): void {
    this.performanceHistory = [];
  }

  // Destroy and cleanup
  destroy(): void {
    this.clearPendingPatches();
    this.syncCallbacks = {};
    this.syncScheduled = false;
    this.performanceHistory = [];
  }
}

// Factory function for creating sync coordinator
export const createSyncCoordinator = (config?: Partial<SyncConfiguration>): SyncCoordinator => {
  return new SyncCoordinator(config);
};

// CSS Custom Property Sync Helper
export const createCSSParameterSync = (
  coordinator: SyncCoordinator,
  sectionId: string,
  rootElement: HTMLElement = document.documentElement
): void => {
  coordinator.registerSyncCallback('css', (patches) => {
    patches.forEach((patch) => {
      Object.entries(patch).forEach(([param, value]) => {
        if (value !== undefined) {
          const cssVar = `--vib3-${sectionId}-${param}`;
          rootElement.style.setProperty(cssVar, value.toString());
        }
      });
    });
  });
};

// WebGL Uniform Sync Helper
export const createWebGLParameterSync = (
  coordinator: SyncCoordinator,
  uniformUpdater: (patches: ParameterPatch[]) => void
): void => {
  coordinator.registerSyncCallback('webgl', uniformUpdater);
};

// Audio Reactivity Sync Helper
export const createAudioParameterSync = (
  coordinator: SyncCoordinator,
  audioContext?: AudioContext
): void => {
  coordinator.registerSyncCallback('audio', (patches) => {
    if (!audioContext) return;

    // Apply audio parameter changes
    patches.forEach((patch) => {
      // This would integrate with your audio processing system
      // Example: modulate frequency, amplitude, etc. based on patches
      Object.entries(patch).forEach(([param, value]) => {
        if (value !== undefined) {
          // Handle audio parameter mapping
          switch (param) {
            case 'density':
              // Modulate audio density/frequency
              break;
            case 'chaos':
              // Modulate audio chaos/distortion
              break;
            case 'timeScale':
              // Modulate audio timing
              break;
          }
        }
      });
    });
  });
};