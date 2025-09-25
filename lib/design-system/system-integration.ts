import { InteractionCoordinator } from './interaction-coordinator';
import { SyncCoordinator } from './sync-coordinator';
import { AgentInterface } from './agent-interface';
import { ConfigValidator } from './config-validator';
import { DebugTools } from './debug-tools';
import { ParameterInterpolator } from './interpolation';
import { DesignSystemAdvancedTuning, SectionVisualState, ParameterPatch } from './types';

export interface SystemComponents {
  interactionCoordinator: InteractionCoordinator;
  syncCoordinator: SyncCoordinator;
  agentInterface: AgentInterface;
  configValidator: ConfigValidator;
  debugTools: DebugTools;
  interpolator: ParameterInterpolator;
}

export interface SystemConfiguration {
  enableDebugMode: boolean;
  enablePerformanceMonitoring: boolean;
  validateConfiguration: boolean;
  syncConfiguration: {
    batchSize: number;
    maxBatchDelay: number;
    enableAudioSync: boolean;
    enableCSSSync: boolean;
    enableWebGLSync: boolean;
  };
  tuning: DesignSystemAdvancedTuning;
}

/**
 * VIB34D Design System Integration - Complete system orchestration
 *
 * Provides a unified interface for initializing, configuring, and managing
 * all design system components. Handles cross-component communication,
 * error recovery, and performance optimization.
 *
 * @example
 * ```typescript
 * const system = new VIB34DSystem({
 *   enableDebugMode: true,
 *   enablePerformanceMonitoring: true,
 *   validateConfiguration: true
 * });
 *
 * await system.initialize();
 *
 * // Use the integrated system
 * system.updateSectionState('home', { gridDensity: 1.5 });
 * system.triggerInteraction('hover', 'about');
 * ```
 */
export class VIB34DSystem {
  private components: SystemComponents;
  private config: SystemConfiguration;
  private initialized = false;
  private sectionStates: Record<string, SectionVisualState> = {};

  constructor(config: Partial<SystemConfiguration> = {}) {
    this.config = {
      enableDebugMode: false,
      enablePerformanceMonitoring: false, // DISABLED BY DEFAULT to prevent lag
      validateConfiguration: true,
      syncConfiguration: {
        batchSize: 10,
        maxBatchDelay: 16,
        enableAudioSync: true,
        enableCSSSync: true,
        enableWebGLSync: true,
      },
      tuning: {
        speedMultiplier: 1.0,
        interactionSensitivity: 1.0,
        transitionDurationMultiplier: 1.0,
      },
      ...config,
    };

    this.components = this.createComponents();
  }

  /**
   * Initialize the complete system
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      throw new Error('System already initialized');
    }

    try {
      // Enable debug mode if requested
      if (this.config.enableDebugMode) {
        this.components.debugTools.enable();
        this.components.debugTools.logParameterChange('system', { status: 'initializing' } as any, 'system');
      }

      // Validate configuration
      if (this.config.validateConfiguration) {
        await this.validateSystemConfiguration();
      }

      // Initialize components with cross-references
      this.setupComponentIntegration();

      // Setup performance monitoring
      if (this.config.enablePerformanceMonitoring) {
        this.setupPerformanceMonitoring();
      }

      // Register built-in sync callbacks
      this.setupSyncCallbacks();

      // Setup error handling
      this.setupErrorHandling();

      this.initialized = true;

      this.log('VIB34D System initialized successfully', 'info');

    } catch (error) {
      this.log(`System initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      throw error;
    }
  }

  /**
   * Update section visual state
   */
  updateSectionState(sectionId: string, updates: Partial<SectionVisualState>): void {
    this.ensureInitialized();

    const currentState = this.sectionStates[sectionId] || {
      gridDensity: 1.0,
      colorIntensity: 1.0,
      reactivity: 1.0,
      depth: 0,
      lastUpdated: Date.now(),
    };

    const newState: SectionVisualState = {
      ...currentState,
      ...updates,
      lastUpdated: Date.now(),
    };

    this.sectionStates[sectionId] = newState;

    // Update components
    this.components.agentInterface.updateStates(this.sectionStates);
    this.components.interactionCoordinator.updateStates(this.sectionStates);

    this.log(`Section ${sectionId} state updated`, 'info', { sectionId, updates });
  }

  /**
   * Trigger interaction
   */
  triggerInteraction(
    type: 'hover' | 'click' | 'focus' | 'scroll',
    sectionId: string,
    details: any = {}
  ): void {
    this.ensureInitialized();

    try {
      const result = this.components.interactionCoordinator.processInteraction(
        type,
        sectionId,
        details,
        this.sectionStates
      );

      // Apply parameter patches through sync coordinator
      if (result.paramPatches && Object.keys(result.paramPatches).length > 0) {
        this.applySyncPatches('css', Object.values(result.paramPatches));
        this.applySyncPatches('webgl', Object.values(result.paramPatches));
      }

      // Update section states if modified
      if (result.sectionStates) {
        Object.entries(result.sectionStates).forEach(([id, state]) => {
          this.sectionStates[id] = state as SectionVisualState;
        });
        this.components.agentInterface.updateStates(this.sectionStates);
      }

      this.log(`Interaction ${type} processed for ${sectionId}`, 'info', { type, sectionId, result });

    } catch (error) {
      this.log(`Interaction processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  }

  /**
   * Execute agent command
   */
  async executeAgentCommand(command: string, args: any): Promise<any> {
    this.ensureInitialized();

    try {
      const result = await this.components.agentInterface.executeCommand(command, args);
      this.log(`Agent command executed: ${command}`, result.success ? 'info' : 'error', { command, args, result });
      return result;
    } catch (error) {
      this.log(`Agent command failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      throw error;
    }
  }

  /**
   * Apply parameter patch with smooth interpolation
   */
  interpolateParameterPatch(
    sectionId: string,
    targetPatch: ParameterPatch,
    duration: number = 500,
    method: 'linear' | 'cubic' | 'exponential' = 'cubic'
  ): void {
    this.ensureInitialized();

    const currentPatch = this.getCurrentParameterPatch(sectionId);

    this.components.interpolator.animateParameterPatch(
      `section-${sectionId}`,
      currentPatch,
      targetPatch,
      {
        method,
        duration,
        onUpdate: (patch: ParameterPatch) => {
          this.applySyncPatches('css', [patch]);
          this.applySyncPatches('webgl', [patch]);
        },
        onComplete: () => {
          this.log(`Parameter interpolation completed for ${sectionId}`, 'info');
        },
      }
    );
  }

  /**
   * Get system status and health
   */
  getSystemStatus(): {
    initialized: boolean;
    sectionsCount: number;
    activeInterpolations: number;
    performance: any;
    health: any;
  } {
    const syncStats = this.components.syncCoordinator.getSyncStats();
    const performanceReport = this.components.syncCoordinator.getPerformanceReport();
    const healthCheck = this.components.configValidator.quickHealthCheck({
      sections: this.sectionStates,
      tuning: this.config.tuning,
    });

    return {
      initialized: this.initialized,
      sectionsCount: Object.keys(this.sectionStates).length,
      activeInterpolations: Object.keys(this.components.interpolator['activeInterpolations'] || {}).length,
      performance: {
        sync: syncStats.performance,
        overall: performanceReport,
      },
      health: healthCheck,
    };
  }

  /**
   * Export system state for debugging or persistence
   */
  exportSystemState(): {
    config: SystemConfiguration;
    sectionStates: Record<string, SectionVisualState>;
    agentHistory: any[];
    debugEvents: any[];
    performance: any;
  } {
    this.ensureInitialized();

    return {
      config: this.config,
      sectionStates: { ...this.sectionStates },
      agentHistory: this.components.agentInterface.getCommandHistory(),
      debugEvents: this.components.debugTools.getEvents(),
      performance: this.components.syncCoordinator.getPerformanceReport(),
    };
  }

  /**
   * Reset system to initial state
   */
  reset(): void {
    this.ensureInitialized();

    // Clear all state
    this.sectionStates = {};
    this.components.agentInterface.clearHistory();
    this.components.syncCoordinator.clearPendingPatches();
    this.components.syncCoordinator.clearPerformanceHistory();
    this.components.interpolator.stopAllInterpolations();
    this.components.debugTools.clearHistory();

    this.log('System reset to initial state', 'info');
  }

  /**
   * EMERGENCY STOP - Immediately halt all performance-heavy operations
   */
  emergencyStop(): void {
    console.warn('[VIB34D EMERGENCY STOP] Halting all operations to prevent system lag');

    try {
      // Immediately stop all animation loops
      this.components.interpolator.stopAllInterpolations();
      this.components.interpolator.destroy();

      // Disable all performance monitoring
      this.components.syncCoordinator.setPerformanceMonitoring(false);
      this.components.debugTools.disable();

      // Clear all pending operations
      this.components.syncCoordinator.clearPendingPatches();

      console.log('[VIB34D EMERGENCY STOP] All operations halted successfully');
    } catch (error) {
      console.error('[VIB34D EMERGENCY STOP] Error during emergency stop:', error);
    }
  }

  /**
   * Graceful shutdown
   */
  destroy(): void {
    if (!this.initialized) return;

    try {
      // Stop all active operations
      this.components.interpolator.destroy();
      this.components.syncCoordinator.destroy();
      this.components.debugTools.disable();

      this.initialized = false;
      this.log('System destroyed successfully', 'info');

    } catch (error) {
      console.error('Error during system destruction:', error);
    }
  }

  /**
   * Private helper methods
   */
  private createComponents(): SystemComponents {
    return {
      interactionCoordinator: new InteractionCoordinator(),
      syncCoordinator: new SyncCoordinator(this.config.syncConfiguration),
      agentInterface: new AgentInterface(),
      configValidator: new ConfigValidator(),
      debugTools: new DebugTools(),
      interpolator: new ParameterInterpolator(),
    };
  }

  private async validateSystemConfiguration(): Promise<void> {
    // Check browser support - using imported function
    const { checkBrowserSupport } = await import('./config-validator');
    const browserSupport = checkBrowserSupport();

    if (!browserSupport.isValid) {
      throw new Error(`Browser compatibility issues: ${browserSupport.errors.join(', ')}`);
    }

    if (browserSupport.warnings.length > 0) {
      browserSupport.warnings.forEach((warning: string) => {
        this.log(warning, 'warning');
      });
    }

    this.log('Configuration validation passed', 'info');
  }

  private setupComponentIntegration(): void {
    // Update agent interface with current tuning
    this.components.agentInterface.updateTuning(this.config.tuning);

    // Setup debug logging for all components
    if (this.config.enableDebugMode) {
      this.setupDebugLogging();
    }
  }

  private setupDebugLogging(): void {
    // Wrap key methods with debug logging
    const originalProcessInteraction = this.components.interactionCoordinator.processInteraction.bind(this.components.interactionCoordinator);
    this.components.interactionCoordinator.processInteraction = (
      type: 'hover' | 'click' | 'focus' | 'scroll',
      sectionId: string,
      details: any,
      states: Record<string, SectionVisualState>
    ) => {
      this.components.debugTools.logInteraction(type, sectionId, details);
      return originalProcessInteraction(type, sectionId, details, states);
    };

    // Monitor sync operations
    const originalScheduleBatchSync = this.components.syncCoordinator.scheduleBatchSync.bind(this.components.syncCoordinator);
    this.components.syncCoordinator.scheduleBatchSync = async (layerPatches) => {
      const layers = Object.keys(layerPatches);
      const totalPatches = Object.values(layerPatches).reduce((sum, patches) => sum + (patches?.length || 0), 0);

      const startTime = performance.now();
      const result = await originalScheduleBatchSync(layerPatches);
      const executionTime = performance.now() - startTime;

      this.components.debugTools.logSync(layers, totalPatches, executionTime);
      return result;
    };
  }

  private setupPerformanceMonitoring(): void {
    this.components.syncCoordinator.setPerformanceMonitoring(true);

    // Set up periodic performance checks
    setInterval(() => {
      const report = this.components.syncCoordinator.getPerformanceReport();

      if (report.frameDropRate > 0.1) {
        this.components.debugTools.logPerformanceIssue(
          'High frame drop rate detected',
          { frameDropRate: report.frameDropRate }
        );
      }

      if (report.memoryLeakDetected) {
        this.components.debugTools.logPerformanceIssue(
          'Memory leak detected',
          { report }
        );
      }
    }, 5000); // Check every 5 seconds
  }

  private setupSyncCallbacks(): void {
    // Default CSS sync callback
    this.components.syncCoordinator.registerSyncCallback('css', (patches) => {
      // This would be implemented by the consuming application
      if (this.config.enableDebugMode) {
        this.log(`CSS sync: ${patches.length} patches applied`, 'info');
      }
    });

    // Default WebGL sync callback
    this.components.syncCoordinator.registerSyncCallback('webgl', (patches) => {
      // This would be implemented by the consuming application
      if (this.config.enableDebugMode) {
        this.log(`WebGL sync: ${patches.length} patches applied`, 'info');
      }
    });

    // Default Audio sync callback
    this.components.syncCoordinator.registerSyncCallback('audio', (patches) => {
      // This would be implemented by the consuming application
      if (this.config.enableDebugMode) {
        this.log(`Audio sync: ${patches.length} patches applied`, 'info');
      }
    });
  }

  private setupErrorHandling(): void {
    // Global error handler for unhandled system errors
    if (typeof window !== 'undefined') {
      const originalErrorHandler = window.onerror;
      window.onerror = (message, source, lineno, colno, error) => {
        if (source && source.includes('vib3') || (error && error.stack && error.stack.includes('vib3'))) {
          this.components.debugTools.logError(
            error || new Error(String(message)),
            'window.onerror',
            { source, lineno, colno }
          );
        }

        if (originalErrorHandler) {
          return originalErrorHandler(message, source, lineno, colno, error);
        }
        return false;
      };
    }
  }

  private applySyncPatches(layer: 'css' | 'webgl' | 'audio', patches: ParameterPatch[]): void {
    if (patches.length === 0) return;

    this.components.syncCoordinator.scheduleBatchSync({
      [layer]: patches,
    });
  }

  private getCurrentParameterPatch(sectionId: string): ParameterPatch {
    const state = this.sectionStates[sectionId];
    if (!state) return {};

    // Convert visual state to parameter patch
    return {
      density: state.gridDensity,
      morph: Math.max(0, Math.min(1, state.colorIntensity / 4)),
      chaos: Math.max(0, Math.min(1, (4 - state.reactivity) / 4)),
      dispAmp: Math.abs(state.depth) * 0.01,
    };
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('System not initialized. Call initialize() first.');
    }
  }

  private log(message: string, severity: 'info' | 'warning' | 'error', context?: any): void {
    if (this.config.enableDebugMode && this.components.debugTools) {
      this.components.debugTools['log'](message, severity, 'system', context);
    }
  }
}

/**
 * Factory function for creating VIB34D system
 */
export const createVIB34DSystem = (config?: Partial<SystemConfiguration>): VIB34DSystem => {
  return new VIB34DSystem(config);
};

// Global emergency stop function - can be called from browser console
let globalVIB34DSystem: VIB34DSystem | null = null;

export const setGlobalVIB34DSystem = (system: VIB34DSystem): void => {
  globalVIB34DSystem = system;

  // Make emergency stop available globally
  if (typeof window !== 'undefined') {
    (window as any).VIB34D_EMERGENCY_STOP = () => {
      console.warn('🚨 VIB34D EMERGENCY STOP called from browser console');
      system.emergencyStop();
    };

    console.log('🚨 Emergency stop available: VIB34D_EMERGENCY_STOP()');
  }
};

export const globalEmergencyStop = (): void => {
  if (globalVIB34DSystem) {
    globalVIB34DSystem.emergencyStop();
  } else {
    console.warn('No global VIB34D system found');
  }
};

/**
 * Utility functions for system integration
 */
export const SystemUtils = {
  /**
   * Create development system with debug features enabled
   */
  createDevelopmentSystem(): VIB34DSystem {
    return new VIB34DSystem({
      enableDebugMode: true,
      enablePerformanceMonitoring: true,
      validateConfiguration: true,
    });
  },

  /**
   * Create production system with optimized settings
   */
  createProductionSystem(): VIB34DSystem {
    return new VIB34DSystem({
      enableDebugMode: false,
      enablePerformanceMonitoring: false, // Disabled for performance
      validateConfiguration: false,
      syncConfiguration: {
        batchSize: 15, // Larger batches for efficiency
        maxBatchDelay: 16,
        enableAudioSync: true,
        enableCSSSync: true,
        enableWebGLSync: true,
      },
    });
  },

  /**
   * Create lightweight system for low-end devices
   */
  createLightweightSystem(): VIB34DSystem {
    return new VIB34DSystem({
      enableDebugMode: false,
      enablePerformanceMonitoring: false,
      validateConfiguration: false,
      syncConfiguration: {
        batchSize: 5, // Small batches
        maxBatchDelay: 32, // Slower updates
        enableAudioSync: false, // Disable heavy features
        enableCSSSync: true,
        enableWebGLSync: false, // Disable WebGL for performance
      },
    });
  },

  /**
   * Create minimal system for testing
   */
  createTestSystem(): VIB34DSystem {
    return new VIB34DSystem({
      enableDebugMode: false,
      enablePerformanceMonitoring: false,
      validateConfiguration: false,
      syncConfiguration: {
        batchSize: 5,
        maxBatchDelay: 100, // Slower for test stability
        enableAudioSync: false,
        enableCSSSync: true,
        enableWebGLSync: false,
      },
    });
  },
};