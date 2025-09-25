import { ParameterPatch, SectionVisualState } from './types';
import { SyncCoordinator } from './sync-coordinator';
import { InteractionCoordinator } from './interaction-coordinator';

export interface DebugEvent {
  timestamp: number;
  type: 'parameter_change' | 'interaction' | 'sync' | 'performance' | 'error';
  source: string;
  data: any;
  severity: 'info' | 'warning' | 'error';
}

export interface DebugSnapshot {
  timestamp: number;
  sections: Record<string, SectionVisualState>;
  pendingPatches: Record<string, ParameterPatch[]>;
  performance: {
    frameRate: number;
    syncLatency: number;
    memoryUsageMB: number;
  };
  activeInteractions: string[];
}

/**
 * Debug Tools - Development and troubleshooting utilities
 *
 * Provides comprehensive debugging capabilities for the VIB34D system including
 * event logging, performance monitoring, visual debugging overlays, and
 * parameter introspection tools.
 *
 * @example
 * ```typescript
 * const debugger = new DebugTools();
 * debugger.enable();
 *
 * // Log parameter changes
 * debugger.logParameterChange('home', { density: 1.2 });
 *
 * // Capture system snapshot
 * const snapshot = debugger.captureSnapshot();
 *
 * // Export debug data for analysis
 * const debugData = debugger.exportDebugData();
 * ```
 */
export class DebugTools {
  private events: DebugEvent[] = [];
  private snapshots: DebugSnapshot[] = [];
  private isEnabled = false;
  private maxEvents = 1000;
  private maxSnapshots = 50;

  // Performance tracking
  private frameRates: number[] = [];
  private lastFrameTime = 0;
  private performanceObserver?: PerformanceObserver;

  // Debug overlay DOM elements
  private overlayContainer?: HTMLElement;
  private isOverlayVisible = false;

  constructor() {
    this.setupPerformanceTracking();
  }

  /**
   * Enable debug mode
   */
  enable(): void {
    this.isEnabled = true;
    this.log('Debug mode enabled', 'info', 'debugger');

    if (typeof window !== 'undefined') {
      this.setupDebugOverlay();
      this.attachKeyboardShortcuts();
    }
  }

  /**
   * Disable debug mode and cleanup
   */
  disable(): void {
    this.isEnabled = false;
    this.cleanupOverlay();
    this.cleanupPerformanceTracking();
    this.log('Debug mode disabled', 'info', 'debugger');
  }

  /**
   * Log a debug event
   */
  private log(message: string, severity: DebugEvent['severity'], source: string, data?: any): void {
    if (!this.isEnabled) return;

    const event: DebugEvent = {
      timestamp: performance.now(),
      type: 'info' as any,
      source,
      data: { message, ...data },
      severity,
    };

    this.events.push(event);

    // Maintain event history limit
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Console output for development
    if (typeof console !== 'undefined') {
      const consoleMethod = severity === 'error' ? 'error' : severity === 'warning' ? 'warn' : 'log';
      console[consoleMethod](`[VIB34D:${source}]`, message, data);
    }

    this.updateDebugOverlay();
  }

  /**
   * Log parameter changes
   */
  logParameterChange(sectionId: string, patch: ParameterPatch, source = 'unknown'): void {
    if (!this.isEnabled) return;

    const event: DebugEvent = {
      timestamp: performance.now(),
      type: 'parameter_change',
      source: `${source}:${sectionId}`,
      data: { sectionId, patch },
      severity: 'info',
    };

    this.events.push(event);
    this.limitEventHistory();
    this.updateDebugOverlay();
  }

  /**
   * Log interaction events
   */
  logInteraction(type: string, sectionId: string, details: any): void {
    if (!this.isEnabled) return;

    const event: DebugEvent = {
      timestamp: performance.now(),
      type: 'interaction',
      source: `interaction:${type}`,
      data: { sectionId, type, details },
      severity: 'info',
    };

    this.events.push(event);
    this.limitEventHistory();
    this.updateDebugOverlay();
  }

  /**
   * Log synchronization events
   */
  logSync(layers: string[], batchSize: number, executionTime: number): void {
    if (!this.isEnabled) return;

    const event: DebugEvent = {
      timestamp: performance.now(),
      type: 'sync',
      source: 'sync-coordinator',
      data: { layers, batchSize, executionTime },
      severity: executionTime > 16 ? 'warning' : 'info',
    };

    this.events.push(event);
    this.limitEventHistory();
    this.updateDebugOverlay();
  }

  /**
   * Log performance warnings
   */
  logPerformanceIssue(issue: string, metrics: any): void {
    if (!this.isEnabled) return;

    const event: DebugEvent = {
      timestamp: performance.now(),
      type: 'performance',
      source: 'performance-monitor',
      data: { issue, metrics },
      severity: 'warning',
    };

    this.events.push(event);
    this.limitEventHistory();
    this.updateDebugOverlay();
  }

  /**
   * Log errors
   */
  logError(error: Error | string, source: string, context?: any): void {
    if (!this.isEnabled) return;

    const event: DebugEvent = {
      timestamp: performance.now(),
      type: 'error',
      source,
      data: {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        context,
      },
      severity: 'error',
    };

    this.events.push(event);
    this.limitEventHistory();
    this.updateDebugOverlay();
  }

  /**
   * Capture a system snapshot
   */
  captureSnapshot(
    sections: Record<string, SectionVisualState>,
    syncCoordinator?: SyncCoordinator,
    interactionCoordinator?: InteractionCoordinator
  ): DebugSnapshot {
    if (!this.isEnabled) return {} as DebugSnapshot;

    const snapshot: DebugSnapshot = {
      timestamp: performance.now(),
      sections: JSON.parse(JSON.stringify(sections)), // Deep clone
      pendingPatches: {},
      performance: {
        frameRate: this.getCurrentFrameRate(),
        syncLatency: this.getAverageSyncLatency(),
        memoryUsageMB: this.getMemoryUsage(),
      },
      activeInteractions: interactionCoordinator ? this.getActiveInteractions(interactionCoordinator) : [],
    };

    // Get pending patches from sync coordinator
    if (syncCoordinator) {
      const stats = syncCoordinator.getSyncStats();
      // This would need to be exposed by SyncCoordinator
      // snapshot.pendingPatches = stats.pendingPatches;
    }

    this.snapshots.push(snapshot);

    // Maintain snapshot history limit
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }

    this.log(`Snapshot captured (${this.snapshots.length} total)`, 'info', 'debugger');
    return snapshot;
  }

  /**
   * Compare two snapshots
   */
  compareSnapshots(snapshot1: DebugSnapshot, snapshot2: DebugSnapshot): {
    sectionChanges: Record<string, Partial<SectionVisualState>>;
    performanceChanges: any;
    timeDelta: number;
  } {
    const timeDelta = snapshot2.timestamp - snapshot1.timestamp;
    const sectionChanges: Record<string, Partial<SectionVisualState>> = {};

    // Compare section states
    Object.keys(snapshot2.sections).forEach(sectionId => {
      const state1 = snapshot1.sections[sectionId];
      const state2 = snapshot2.sections[sectionId];

      if (!state1) {
        sectionChanges[sectionId] = state2;
        return;
      }

      const changes: Partial<SectionVisualState> = {};
      (Object.keys(state2) as (keyof SectionVisualState)[]).forEach(key => {
        if (state1[key] !== state2[key]) {
          (changes as any)[key] = state2[key];
        }
      });

      if (Object.keys(changes).length > 0) {
        sectionChanges[sectionId] = changes;
      }
    });

    // Compare performance metrics
    const performanceChanges = {
      frameRateDelta: snapshot2.performance.frameRate - snapshot1.performance.frameRate,
      syncLatencyDelta: snapshot2.performance.syncLatency - snapshot1.performance.syncLatency,
      memoryDelta: snapshot2.performance.memoryUsageMB - snapshot1.performance.memoryUsageMB,
    };

    return { sectionChanges, performanceChanges, timeDelta };
  }

  /**
   * Export debug data for analysis
   */
  exportDebugData(): {
    events: DebugEvent[];
    snapshots: DebugSnapshot[];
    summary: {
      totalEvents: number;
      errorCount: number;
      warningCount: number;
      averageFrameRate: number;
      memoryTrend: number;
    };
  } {
    const errorCount = this.events.filter(e => e.severity === 'error').length;
    const warningCount = this.events.filter(e => e.severity === 'warning').length;

    return {
      events: [...this.events],
      snapshots: [...this.snapshots],
      summary: {
        totalEvents: this.events.length,
        errorCount,
        warningCount,
        averageFrameRate: this.getCurrentFrameRate(),
        memoryTrend: this.getMemoryTrend(),
      },
    };
  }

  /**
   * Clear debug history
   */
  clearHistory(): void {
    this.events = [];
    this.snapshots = [];
    this.frameRates = [];
    this.log('Debug history cleared', 'info', 'debugger');
  }

  /**
   * Get filtered events
   */
  getEvents(filter?: {
    type?: DebugEvent['type'];
    source?: string;
    severity?: DebugEvent['severity'];
    since?: number;
  }): DebugEvent[] {
    let filtered = this.events;

    if (filter?.type) {
      filtered = filtered.filter(e => e.type === filter.type);
    }

    if (filter?.source) {
      filtered = filtered.filter(e => e.source.includes(filter.source!));
    }

    if (filter?.severity) {
      filtered = filtered.filter(e => e.severity === filter.severity);
    }

    if (filter?.since) {
      filtered = filtered.filter(e => e.timestamp >= filter.since!);
    }

    return filtered;
  }

  /**
   * Setup performance tracking
   */
  private setupPerformanceTracking(): void {
    if (typeof window === 'undefined' || !window.requestAnimationFrame) return;

    const trackFrame = () => {
      const now = performance.now();
      if (this.lastFrameTime > 0) {
        const frameDelta = now - this.lastFrameTime;
        const frameRate = 1000 / frameDelta;

        this.frameRates.push(frameRate);
        if (this.frameRates.length > 60) { // Keep last 60 frame measurements
          this.frameRates.shift();
        }

        // Detect frame drops
        if (frameRate < 45 && this.isEnabled) {
          this.logPerformanceIssue('Frame drop detected', { frameRate, frameDelta });
        }
      }
      this.lastFrameTime = now;

      if (this.isEnabled) {
        requestAnimationFrame(trackFrame);
      }
    };

    requestAnimationFrame(trackFrame);

    // Setup Performance Observer if available
    if ('PerformanceObserver' in window) {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.entryType === 'measure' && entry.name.includes('vib3')) {
              this.logPerformanceIssue('Long task detected', {
                name: entry.name,
                duration: entry.duration,
              });
            }
          });
        });

        this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
      } catch (error) {
        // Performance Observer not supported
      }
    }
  }

  /**
   * Setup debug overlay UI
   */
  private setupDebugOverlay(): void {
    if (this.overlayContainer) return;

    this.overlayContainer = document.createElement('div');
    this.overlayContainer.id = 'vib3d-debug-overlay';
    this.overlayContainer.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      max-height: 400px;
      background: rgba(0, 0, 0, 0.8);
      color: #00ff88;
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 11px;
      padding: 10px;
      border-radius: 5px;
      z-index: 10000;
      overflow-y: auto;
      pointer-events: none;
      display: none;
    `;

    document.body.appendChild(this.overlayContainer);
  }

  /**
   * Update debug overlay content
   */
  private updateDebugOverlay(): void {
    if (!this.overlayContainer || !this.isOverlayVisible) return;

    const recentEvents = this.events.slice(-10);
    const frameRate = this.getCurrentFrameRate();
    const memoryUsage = this.getMemoryUsage();

    const html = `
      <div style="border-bottom: 1px solid #444; margin-bottom: 5px; padding-bottom: 5px;">
        <div>FPS: ${frameRate.toFixed(1)}</div>
        <div>Memory: ${memoryUsage.toFixed(1)}MB</div>
        <div>Events: ${this.events.length}</div>
      </div>
      <div>
        ${recentEvents.map(event => `
          <div style="margin: 2px 0; ${event.severity === 'error' ? 'color: #ff4444;' : event.severity === 'warning' ? 'color: #ffaa44;' : ''}">
            <span style="color: #666;">${event.timestamp.toFixed(0)}ms</span>
            <span style="color: #aaa;">[${event.source}]</span>
            ${typeof event.data === 'object' && event.data.message ? event.data.message : JSON.stringify(event.data).substring(0, 50)}
          </div>
        `).join('')}
      </div>
    `;

    this.overlayContainer.innerHTML = html;
  }

  /**
   * Setup keyboard shortcuts for debug controls
   */
  private attachKeyboardShortcuts(): void {
    document.addEventListener('keydown', (event) => {
      if (!this.isEnabled) return;

      // Ctrl+Shift+D - Toggle debug overlay
      if (event.ctrlKey && event.shiftKey && event.code === 'KeyD') {
        event.preventDefault();
        this.toggleDebugOverlay();
      }

      // Ctrl+Shift+C - Clear debug history
      if (event.ctrlKey && event.shiftKey && event.code === 'KeyC') {
        event.preventDefault();
        this.clearHistory();
      }

      // Ctrl+Shift+S - Capture snapshot
      if (event.ctrlKey && event.shiftKey && event.code === 'KeyS') {
        event.preventDefault();
        // Would need access to system state to capture meaningful snapshot
        this.log('Snapshot shortcut pressed (no system state available)', 'info', 'keyboard');
      }
    });
  }

  /**
   * Toggle debug overlay visibility
   */
  private toggleDebugOverlay(): void {
    if (!this.overlayContainer) return;

    this.isOverlayVisible = !this.isOverlayVisible;
    this.overlayContainer.style.display = this.isOverlayVisible ? 'block' : 'none';

    if (this.isOverlayVisible) {
      this.updateDebugOverlay();
    }
  }

  /**
   * Helper methods
   */
  private limitEventHistory(): void {
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }
  }

  private getCurrentFrameRate(): number {
    if (this.frameRates.length === 0) return 0;
    return this.frameRates.reduce((sum, rate) => sum + rate, 0) / this.frameRates.length;
  }

  private getAverageSyncLatency(): number {
    const syncEvents = this.events.filter(e => e.type === 'sync');
    if (syncEvents.length === 0) return 0;

    const latencies = syncEvents.map(e => e.data.executionTime || 0);
    return latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
  }

  private getMemoryUsage(): number {
    if ('memory' in performance && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / (1024 * 1024);
    }
    return 0;
  }

  private getMemoryTrend(): number {
    const recentSnapshots = this.snapshots.slice(-10);
    if (recentSnapshots.length < 2) return 0;

    const first = recentSnapshots[0].performance.memoryUsageMB;
    const last = recentSnapshots[recentSnapshots.length - 1].performance.memoryUsageMB;
    const timeDelta = recentSnapshots[recentSnapshots.length - 1].timestamp - recentSnapshots[0].timestamp;

    return (last - first) / (timeDelta / 1000); // MB per second
  }

  private getActiveInteractions(coordinator: InteractionCoordinator): string[] {
    // This would need to be exposed by InteractionCoordinator
    return [];
  }

  private cleanupOverlay(): void {
    if (this.overlayContainer && this.overlayContainer.parentNode) {
      this.overlayContainer.parentNode.removeChild(this.overlayContainer);
      this.overlayContainer = undefined;
    }
  }

  private cleanupPerformanceTracking(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = undefined;
    }
  }
}

/**
 * Global debug tools instance
 */
export const debugTools = new DebugTools();

/**
 * Utility functions for common debug operations
 */
export const createParameterInspector = (
  sectionId: string,
  state: SectionVisualState
): {
  inspect: () => void;
  diff: (other: SectionVisualState) => Partial<SectionVisualState>;
  validate: () => string[];
} => {
  return {
    inspect() {
      console.table({
        Section: sectionId,
        'Grid Density': state.gridDensity,
        'Color Intensity': state.colorIntensity,
        'Reactivity': state.reactivity,
        'Depth': state.depth,
        'Last Updated': new Date(state.lastUpdated).toISOString(),
        'Age (ms)': Date.now() - state.lastUpdated,
      });
    },

    diff(other: SectionVisualState): Partial<SectionVisualState> {
      const changes: Partial<SectionVisualState> = {};

      (Object.keys(state) as (keyof SectionVisualState)[]).forEach(key => {
        if (state[key] !== other[key]) {
          (changes as any)[key] = other[key];
        }
      });

      return changes;
    },

    validate(): string[] {
      const issues: string[] = [];

      if (state.gridDensity < 0.1 || state.gridDensity > 4) {
        issues.push(`gridDensity out of range: ${state.gridDensity}`);
      }

      if (state.colorIntensity < 0.2 || state.colorIntensity > 4) {
        issues.push(`colorIntensity out of range: ${state.colorIntensity}`);
      }

      if (state.reactivity < 0.2 || state.reactivity > 4) {
        issues.push(`reactivity out of range: ${state.reactivity}`);
      }

      if (Date.now() - state.lastUpdated > 60000) {
        issues.push(`stale state (${Math.round((Date.now() - state.lastUpdated) / 1000)}s old)`);
      }

      return issues;
    },
  };
};