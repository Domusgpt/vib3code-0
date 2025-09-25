/**
 * Unit tests for Sync Coordinator
 *
 * @jest-environment jsdom
 */

import { SyncCoordinator, createSyncCoordinator } from '../sync-coordinator';
import { ParameterPatch } from '../types';

// Mock requestAnimationFrame for testing
let rafCallback: (() => void) | null = null;
(global as any).requestAnimationFrame = jest.fn((callback: () => void) => {
  rafCallback = callback;
  return 1;
});

describe('SyncCoordinator', () => {
  let coordinator: SyncCoordinator;
  let cssCallback: jest.Mock;
  let webglCallback: jest.Mock;
  let audioCallback: jest.Mock;

  beforeEach(() => {
    coordinator = createSyncCoordinator({
      batchSize: 5,
      maxBatchDelay: 16,
      enableAudioSync: true,
      enableCSSSync: true,
      enableWebGLSync: true,
    });

    cssCallback = jest.fn();
    webglCallback = jest.fn();
    audioCallback = jest.fn();

    coordinator.registerSyncCallback('css', cssCallback);
    coordinator.registerSyncCallback('webgl', webglCallback);
    coordinator.registerSyncCallback('audio', audioCallback);

    // Clear RAF mock
    (global.requestAnimationFrame as jest.Mock).mockClear();
  });

  afterEach(() => {
    coordinator.destroy();
  });

  describe('Sync Callback Registration', () => {
    test('registers callbacks correctly', () => {
      const stats = coordinator.getSyncStats();

      expect(stats.css.hasPending).toBe(false);
      expect(stats.webgl.hasPending).toBe(false);
      expect(stats.audio.hasPending).toBe(false);
      expect(stats.isScheduled).toBe(false);
    });
  });

  describe('Batch Synchronization', () => {
    test('schedules batch sync with requestAnimationFrame', async () => {
      const patches: ParameterPatch[] = [
        { density: 1.0, chaos: 0.5 },
        { density: 0.8, chaos: 0.3 },
      ];

      const syncPromise = coordinator.scheduleBatchSync({
        css: patches,
        webgl: patches,
      });

      // Should schedule RAF
      expect(global.requestAnimationFrame).toHaveBeenCalledTimes(1);

      // Execute the RAF callback
      if (rafCallback) {
        rafCallback();
      }

      const result = await syncPromise;

      expect(result.css).toBe(true);
      expect(result.webgl).toBe(true);
      expect(result.audio).toBe(false); // No audio patches provided
      expect(result.batchSize).toBeGreaterThan(0);

      expect(cssCallback).toHaveBeenCalledTimes(1);
      expect(webglCallback).toHaveBeenCalledTimes(1);
      expect(audioCallback).not.toHaveBeenCalled();
    });

    test('batches multiple sync requests', async () => {
      const patch1: ParameterPatch = { density: 1.0 };
      const patch2: ParameterPatch = { chaos: 0.5 };

      // Schedule first batch
      const syncPromise1 = coordinator.scheduleBatchSync({
        css: [patch1],
      });

      // Schedule second batch before first executes
      const syncPromise2 = coordinator.scheduleBatchSync({
        css: [patch2],
      });

      // Should only schedule RAF once due to batching
      expect(global.requestAnimationFrame).toHaveBeenCalledTimes(1);

      // Execute RAF callback
      if (rafCallback) {
        rafCallback();
      }

      await Promise.all([syncPromise1, syncPromise2]);

      // Should have been called once with optimized patches
      expect(cssCallback).toHaveBeenCalledTimes(1);
      const calledPatches = cssCallback.mock.calls[0][0];

      // Should contain both parameters (merged)
      expect(calledPatches[0]).toMatchObject({
        density: 1.0,
        chaos: 0.5,
      });
    });
  });

  describe('Immediate Synchronization', () => {
    test('executes immediate sync without RAF', () => {
      const patches: ParameterPatch[] = [{ density: 1.0, chaos: 0.5 }];

      const result = coordinator.syncImmediate({
        css: patches,
        audio: patches,
      });

      expect(result.css).toBe(true);
      expect(result.audio).toBe(true);
      expect(result.webgl).toBe(false);
      expect(result.batchSize).toBe(2); // css + audio

      expect(cssCallback).toHaveBeenCalledWith([{ density: 1.0, chaos: 0.5 }]);
      expect(audioCallback).toHaveBeenCalledWith([{ density: 1.0, chaos: 0.5 }]);
      expect(webglCallback).not.toHaveBeenCalled();

      // Should not use RAF
      expect(global.requestAnimationFrame).not.toHaveBeenCalled();
    });
  });

  describe('Patch Optimization', () => {
    test('merges multiple patches correctly', async () => {
      const patches: ParameterPatch[] = [
        { density: 1.0, chaos: 0.3 },
        { density: 0.8, morph: 0.5 }, // Should overwrite density
        { glitch: 0.2 },
      ];

      coordinator.scheduleBatchSync({
        css: patches,
      });

      // Execute RAF callback
      if (rafCallback) {
        rafCallback();
      }

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(cssCallback).toHaveBeenCalledTimes(1);
      const mergedPatch = cssCallback.mock.calls[0][0][0];

      expect(mergedPatch).toMatchObject({
        density: 0.8, // Last value wins
        chaos: 0.3,
        morph: 0.5,
        glitch: 0.2,
      });
    });

    test('handles empty patches gracefully', async () => {
      coordinator.scheduleBatchSync({
        css: [],
      });

      // Execute RAF callback
      if (rafCallback) {
        rafCallback();
      }

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(cssCallback).not.toHaveBeenCalled();
    });
  });

  describe('Configuration Management', () => {
    test('updates configuration correctly', () => {
      coordinator.updateConfiguration({
        batchSize: 10,
        maxBatchDelay: 32,
      });

      // Configuration is private, but we can test it affects behavior
      // by checking that sync still works
      const patches: ParameterPatch[] = [{ density: 1.0 }];
      const result = coordinator.syncImmediate({ css: patches });

      expect(result.css).toBe(true);
    });
  });

  describe('Statistics and Monitoring', () => {
    test('provides accurate sync statistics', () => {
      const patches: ParameterPatch[] = [{ density: 1.0 }];

      // Initially no pending patches
      let stats = coordinator.getSyncStats();
      expect(stats.css.hasPending).toBe(false);
      expect(stats.webgl.hasPending).toBe(false);
      expect(stats.isScheduled).toBe(false);

      // After scheduling, should show pending
      coordinator.scheduleBatchSync({ css: patches });
      stats = coordinator.getSyncStats();
      expect(stats.css.hasPending).toBe(true);
      expect(stats.isScheduled).toBe(true);

      // After execution, should clear pending
      if (rafCallback) {
        rafCallback();
      }

      stats = coordinator.getSyncStats();
      expect(stats.css.hasPending).toBe(false);
      expect(stats.isScheduled).toBe(false);
    });

    test('tracks last update timestamps', () => {
      const beforeTime = Date.now();
      const patches: ParameterPatch[] = [{ density: 1.0 }];

      coordinator.syncImmediate({ css: patches });

      const stats = coordinator.getSyncStats();
      expect(stats.css.lastUpdate).toBeGreaterThanOrEqual(beforeTime);
    });
  });

  describe('Cleanup and Memory Management', () => {
    test('clears pending patches', () => {
      const patches: ParameterPatch[] = [{ density: 1.0 }];

      coordinator.scheduleBatchSync({ css: patches });

      let stats = coordinator.getSyncStats();
      expect(stats.css.hasPending).toBe(true);

      coordinator.clearPendingPatches();

      stats = coordinator.getSyncStats();
      expect(stats.css.hasPending).toBe(false);
    });

    test('destroys coordinator cleanly', () => {
      const patches: ParameterPatch[] = [{ density: 1.0 }];

      coordinator.scheduleBatchSync({ css: patches });
      coordinator.destroy();

      const stats = coordinator.getSyncStats();
      expect(stats.css.hasPending).toBe(false);
      expect(stats.webgl.hasPending).toBe(false);
      expect(stats.audio.hasPending).toBe(false);
      expect(stats.isScheduled).toBe(false);
    });
  });

  describe('Performance Monitoring', () => {
    test('tracks execution time and performance metrics', () => {
      const patches: ParameterPatch[] = [{ density: 1.0 }];
      const result = coordinator.syncImmediate({ css: patches });

      expect(result.performance).toBeDefined();
      expect(result.performance!.executionTime).toBeGreaterThanOrEqual(0);
      expect(result.performance!.batchOptimizationRatio).toBe(1); // Single patch, no optimization
      expect(result.performance!.frameDropped).toBe(false);
      expect(Array.isArray(result.performance!.warnings)).toBe(true);
    });

    test('detects frame drops for slow operations', async () => {
      // Mock a slow callback that exceeds frame budget
      const slowCallback = jest.fn().mockImplementation(() => {
        const start = performance.now();
        while (performance.now() - start < 20) {
          // Busy wait to simulate slow operation
        }
      });

      coordinator.registerSyncCallback('css', slowCallback);

      const patches: ParameterPatch[] = [{ density: 1.0 }];
      const result = coordinator.syncImmediate({ css: patches });

      expect(result.performance!.frameDropped).toBe(true);
      expect(result.performance!.warnings).toContain(
        expect.stringMatching(/Frame budget exceeded/)
      );
    });

    test('tracks batch optimization ratios', () => {
      const patches: ParameterPatch[] = [
        { density: 1.0, chaos: 0.3 },
        { density: 0.8 }, // Should merge with above
        { morph: 0.5 },
      ];

      const result = coordinator.syncImmediate({ css: patches });

      expect(result.performance!.batchOptimizationRatio).toBeCloseTo(1/3); // 3 patches -> 1 merged patch
    });

    test('warns about large batch sizes', () => {
      // Create patches exceeding the batch size configuration
      const largeBatch: ParameterPatch[] = Array(15).fill(0).map((_, i) => ({ density: i / 15 }));

      const result = coordinator.syncImmediate({ css: largeBatch });

      expect(result.performance!.warnings).toContain(
        expect.stringMatching(/Large batch size/)
      );
    });

    test('provides comprehensive sync statistics', () => {
      const patches: ParameterPatch[] = [{ density: 1.0 }];

      coordinator.syncImmediate({ css: patches });
      coordinator.syncImmediate({ webgl: patches });

      const stats = coordinator.getSyncStats();

      expect(stats.performance).toBeDefined();
      expect(stats.performance.averageExecutionTime).toBeGreaterThanOrEqual(0);
      expect(stats.performance.frameDropRate).toBeGreaterThanOrEqual(0);
      expect(stats.performance.averageOptimizationRatio).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(stats.performance.recentWarnings)).toBe(true);

      expect(stats.css.pendingCount).toBe(0);
      expect(stats.webgl.pendingCount).toBe(0);
    });

    test('generates detailed performance reports', () => {
      const patches: ParameterPatch[] = [{ density: 1.0 }];

      // Generate some sync history
      for (let i = 0; i < 5; i++) {
        coordinator.syncImmediate({ css: patches });
      }

      const report = coordinator.getPerformanceReport();

      expect(report.totalSyncs).toBe(5);
      expect(report.averageExecutionTime).toBeGreaterThanOrEqual(0);
      expect(report.frameDropRate).toBeGreaterThanOrEqual(0);
      expect(report.worstExecutionTime).toBeGreaterThanOrEqual(0);
      expect(report.bestOptimizationRatio).toBeGreaterThanOrEqual(0);
      expect(typeof report.memoryLeakDetected).toBe('boolean');
      expect(Array.isArray(report.recommendations)).toBe(true);
    });

    test('can disable performance monitoring', () => {
      coordinator.setPerformanceMonitoring(false);

      const patches: ParameterPatch[] = [{ density: 1.0 }];
      const result = coordinator.syncImmediate({ css: patches });

      expect(result.performance).toBeUndefined();

      // Re-enable for other tests
      coordinator.setPerformanceMonitoring(true);
    });

    test('clears performance history', () => {
      const patches: ParameterPatch[] = [{ density: 1.0 }];
      coordinator.syncImmediate({ css: patches });

      let report = coordinator.getPerformanceReport();
      expect(report.totalSyncs).toBeGreaterThan(0);

      coordinator.clearPerformanceHistory();

      report = coordinator.getPerformanceReport();
      expect(report.totalSyncs).toBe(0);
    });
  });

  describe('Factory Function', () => {
    test('creates coordinator with default configuration', () => {
      const defaultCoordinator = createSyncCoordinator();
      const stats = defaultCoordinator.getSyncStats();

      expect(stats).toBeDefined();
      expect(stats.isScheduled).toBe(false);

      defaultCoordinator.destroy();
    });

    test('creates coordinator with custom configuration', () => {
      const customCoordinator = createSyncCoordinator({
        enableAudioSync: false,
        batchSize: 15,
      });

      const patches: ParameterPatch[] = [{ density: 1.0 }];
      const result = customCoordinator.syncImmediate({
        css: patches,
        audio: patches, // Should be ignored due to config
      });

      expect(result.css).toBe(true);
      expect(result.audio).toBe(false); // Disabled in config

      customCoordinator.destroy();
    });
  });
});