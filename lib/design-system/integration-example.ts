// Integration Example - Demonstrating how all refactored legacy concepts work together
// This shows the complete integration of Parameter Web, Reality Inversion,
// Sophisticated Presets, Unified Synchronization, and Agent Commands

import { ParameterWebEngine } from './interaction-coordinator';
import { RealityInversionEngine } from './interaction-coordinator';
import { SyncCoordinator, createSyncCoordinator } from './sync-coordinator';
import { AgentInterface, createAgentInterface } from './agent-interface';
import { coordinatedPresets } from './presets';
import {
  SectionVisualState,
  ParameterPatch,
  DesignSystemAdvancedTuning,
  CoordinatedPreset
} from './types';

export interface IntegratedSystemConfig {
  enableParameterWebs: boolean;
  enableRealityInversion: boolean;
  enableSyncCoordination: boolean;
  enableAgentInterface: boolean;
  sectionIds: string[];
}

export interface SystemState {
  sections: Record<string, SectionVisualState>;
  tuning: DesignSystemAdvancedTuning;
  activePreset?: string;
  inversionActive: boolean;
  lastUpdate: number;
}

// Integrated VIB34D System - Combines all legacy concepts in modern architecture
export class IntegratedVIB34DSystem {
  private parameterWebEngine?: ParameterWebEngine;
  private realityInversionEngine?: RealityInversionEngine;
  private syncCoordinator?: SyncCoordinator;
  private agentInterface?: AgentInterface;

  private systemState: SystemState;
  private config: IntegratedSystemConfig;

  constructor(config: IntegratedSystemConfig) {
    this.config = config;

    // Initialize system state
    this.systemState = {
      sections: {},
      tuning: {
        speedMultiplier: 1.0,
        interactionSensitivity: 1.0,
        transitionDurationMultiplier: 1.0,
      },
      inversionActive: false,
      lastUpdate: Date.now(),
    };

    // Initialize sections
    config.sectionIds.forEach((sectionId) => {
      this.systemState.sections[sectionId] = {
        gridDensity: 1,
        colorIntensity: 1,
        reactivity: 1,
        depth: 0,
        lastUpdated: Date.now(),
      };
    });

    this.initializeSubsystems();
  }

  private initializeSubsystems(): void {
    // Initialize Parameter Web Engine
    if (this.config.enableParameterWebs) {
      const hoverWeb = ParameterWebEngine.createHoverWeb();
      this.parameterWebEngine = new ParameterWebEngine(hoverWeb);
    }

    // Initialize Reality Inversion Engine
    if (this.config.enableRealityInversion) {
      this.realityInversionEngine = new RealityInversionEngine();
    }

    // Initialize Sync Coordinator
    if (this.config.enableSyncCoordination) {
      this.syncCoordinator = createSyncCoordinator({
        batchSize: 10,
        maxBatchDelay: 16,
        enableAudioSync: true,
        enableCSSSync: true,
        enableWebGLSync: true,
      });

      this.setupSyncCallbacks();
    }

    // Initialize Agent Interface
    if (this.config.enableAgentInterface) {
      this.agentInterface = createAgentInterface();
      this.setupAgentCommands();
    }
  }

  private setupSyncCallbacks(): void {
    if (!this.syncCoordinator) return;

    // CSS sync callback - updates CSS custom properties
    this.syncCoordinator.registerSyncCallback('css', (patches) => {
      patches.forEach((patch) => {
        Object.entries(patch).forEach(([param, value]) => {
          if (value !== undefined) {
            document.documentElement.style.setProperty(
              `--vib3-${param}`,
              value.toString()
            );
          }
        });
      });
    });

    // WebGL sync callback - would update shader uniforms
    this.syncCoordinator.registerSyncCallback('webgl', (patches) => {
      // This would integrate with your WebGL/Three.js system
      console.log('WebGL sync:', patches);
    });

    // Audio sync callback - would update audio parameters
    this.syncCoordinator.registerSyncCallback('audio', (patches) => {
      // This would integrate with your audio processing system
      console.log('Audio sync:', patches);
    });
  }

  private setupAgentCommands(): void {
    if (!this.agentInterface) return;

    // Custom command: Apply coordinated preset with system integration
    this.agentInterface.registerCommand({
      name: 'system.preset.apply',
      description: 'Apply coordinated preset with full system integration',
      args: { presetName: 'string', intensity: 'number' },
      handler: async (args: any) => {
        const { presetName, intensity = 1.0 } = args;
        return this.applyCoordinatedPreset(presetName, intensity);
      },
    });

    // Custom command: Trigger reality inversion with sync coordination
    this.agentInterface.registerCommand({
      name: 'system.reality.invert',
      description: 'Trigger coordinated reality inversion across all systems',
      args: { intensity: 'number' },
      handler: async (args: any) => {
        const { intensity = 1.0 } = args;
        return this.triggerCoordinatedInversion(intensity);
      },
    });

    // Custom command: Update parameter web relationships
    this.agentInterface.registerCommand({
      name: 'system.web.update',
      description: 'Update parameter web relationships',
      args: { webType: 'string' },
      handler: async (args: any) => {
        const { webType } = args;
        return this.updateParameterWeb(webType);
      },
    });
  }

  // Apply coordinated preset with full system integration
  async applyCoordinatedPreset(presetName: string, intensity: number = 1.0) {
    const preset = coordinatedPresets[presetName];
    if (!preset) {
      return {
        success: false,
        message: `Preset '${presetName}' not found`,
        timestamp: Date.now(),
      };
    }

    // Update system tuning
    this.systemState.tuning = {
      ...this.systemState.tuning,
      ...preset.effects.system.globalMultipliers,
    };

    // Apply visual effects to all sections
    Object.keys(this.systemState.sections).forEach((sectionId) => {
      const currentState = this.systemState.sections[sectionId];

      // Apply focused or unfocused effects based on some logic
      const isFocused = sectionId === this.config.sectionIds[0]; // Example: first section is focused
      const effect = isFocused ? preset.effects.focused : preset.effects.unfocused;

      // Scale effect with intensity
      const scaledVisual: Partial<SectionVisualState> = {};
      Object.entries(effect.visual).forEach(([key, value]) => {
        if (typeof value === 'number') {
          const propertyKey = key as keyof SectionVisualState;
          if (propertyKey === 'gridDensity' || propertyKey === 'colorIntensity' ||
              propertyKey === 'reactivity' || propertyKey === 'depth' ||
              propertyKey === 'lastUpdated') {
            const currentValue = currentState[propertyKey] as number;
            (scaledVisual as any)[propertyKey] = currentValue + (value - 1) * intensity;
          }
        }
      });

      this.systemState.sections[sectionId] = {
        ...currentState,
        ...scaledVisual,
        lastUpdated: Date.now(),
      };
    });

    // Update parameter web if preset includes one
    if (preset.effects.system.parameterWeb && this.parameterWebEngine) {
      this.parameterWebEngine = new ParameterWebEngine(preset.effects.system.parameterWeb);
    }

    // Sync changes across all layers
    if (this.syncCoordinator) {
      const patches = this.generateParameterPatches();
      await this.syncCoordinator.scheduleBatchSync({
        css: patches,
        webgl: patches,
        audio: patches,
      });
    }

    this.systemState.activePreset = presetName;
    this.systemState.lastUpdate = Date.now();

    return {
      success: true,
      message: `Applied coordinated preset '${presetName}' with intensity ${intensity}`,
      data: {
        preset: presetName,
        intensity,
        sectionsUpdated: Object.keys(this.systemState.sections).length,
        tuning: this.systemState.tuning,
      },
      timestamp: Date.now(),
    };
  }

  // Trigger coordinated reality inversion
  async triggerCoordinatedInversion(intensity: number = 1.0) {
    if (!this.realityInversionEngine) {
      return {
        success: false,
        message: 'Reality inversion engine not available',
        timestamp: Date.now(),
      };
    }

    // Trigger reality inversion
    const inversionResult = this.realityInversionEngine.triggerRealityInversion(
      this.systemState.sections,
      intensity
    );

    // Update system state
    this.systemState.sections = inversionResult.sectionStates;
    this.systemState.inversionActive = true;

    // Apply parameter web cascades if available
    if (this.parameterWebEngine) {
      const firstSectionId = Object.keys(this.systemState.sections)[0];
      if (firstSectionId) {
        const cascades = this.parameterWebEngine.calculateCascade(
          firstSectionId,
          'gridDensity',
          this.systemState.sections[firstSectionId].gridDensity,
          this.systemState.sections
        );

        // Apply cascades
        Object.entries(cascades).forEach(([sectionId, cascade]) => {
          if (this.systemState.sections[sectionId]) {
            this.systemState.sections[sectionId] = {
              ...this.systemState.sections[sectionId],
              ...cascade,
              lastUpdated: Date.now(),
            };
          }
        });
      }
    }

    // Sync all changes
    if (this.syncCoordinator) {
      await this.syncCoordinator.syncImmediate({
        css: Object.values(inversionResult.paramPatches),
        webgl: Object.values(inversionResult.paramPatches),
        audio: Object.values(inversionResult.paramPatches),
      });
    }

    this.systemState.lastUpdate = Date.now();

    return {
      success: true,
      message: `Reality inversion triggered with intensity ${intensity}`,
      data: {
        intensity,
        sectionsInverted: Object.keys(inversionResult.sectionStates).length,
        sparkleEffects: inversionResult.sparkleEffects?.length || 0,
        realityInversion: inversionResult.realityInversion,
      },
      timestamp: Date.now(),
    };
  }

  // Update parameter web configuration
  async updateParameterWeb(webType: string) {
    if (!this.parameterWebEngine) {
      return {
        success: false,
        message: 'Parameter web engine not available',
        timestamp: Date.now(),
      };
    }

    let newWeb;
    switch (webType) {
      case 'hover':
        newWeb = ParameterWebEngine.createHoverWeb();
        break;
      case 'click':
        newWeb = ParameterWebEngine.createClickWeb();
        break;
      default:
        return {
          success: false,
          message: `Unknown web type: ${webType}`,
          timestamp: Date.now(),
        };
    }

    this.parameterWebEngine = new ParameterWebEngine(newWeb);

    return {
      success: true,
      message: `Parameter web updated to ${webType} configuration`,
      data: { webType, relationships: newWeb.relationships.length },
      timestamp: Date.now(),
    };
  }

  // Generate parameter patches from current visual states
  private generateParameterPatches(): ParameterPatch[] {
    return Object.values(this.systemState.sections).map((state) => ({
      density: state.gridDensity,
      chromaShift: (state.colorIntensity - 1) * 0.1,
      timeScale: state.reactivity,
      dispAmp: Math.abs(state.depth * 0.002),
      chaos: state.inversionActiveUntil ? 0.3 : 0.1,
      glitch: state.inversionActiveUntil ? 0.2 : 0.05,
    }));
  }

  // Public API methods

  getSystemState(): SystemState {
    return { ...this.systemState };
  }

  async executeAgentCommand(commandName: string, args: any) {
    if (!this.agentInterface) {
      throw new Error('Agent interface not available');
    }

    // Update agent interface with current state
    this.agentInterface.updateStates(this.systemState.sections);
    this.agentInterface.updateTuning(this.systemState.tuning);

    return await this.agentInterface.executeCommand(commandName, args);
  }

  getSyncStats() {
    return this.syncCoordinator?.getSyncStats();
  }

  getAvailableCommands() {
    return this.agentInterface?.getAvailableCommands() || [];
  }

  // Cleanup
  destroy(): void {
    this.syncCoordinator?.destroy();
    this.realityInversionEngine?.clearInversion();
    this.agentInterface?.clearHistory();
  }
}

// Factory function for creating integrated system
export const createIntegratedVIB34DSystem = (config: IntegratedSystemConfig): IntegratedVIB34DSystem => {
  return new IntegratedVIB34DSystem(config);
};

// Example usage and integration demo
export const demonstrateIntegration = async (): Promise<void> => {
  console.log('🚀 VIB34D Legacy Concept Integration Demo');

  // Create integrated system
  const system = createIntegratedVIB34DSystem({
    enableParameterWebs: true,
    enableRealityInversion: true,
    enableSyncCoordination: true,
    enableAgentInterface: true,
    sectionIds: ['home', 'about', 'projects', 'contact'],
  });

  console.log('✅ System initialized with all legacy concepts integrated');

  // Demonstrate coordinated preset application
  console.log('\n🎨 Applying coordinated preset...');
  const presetResult = await system.executeAgentCommand('system.preset.apply', {
    presetName: 'dimensional_focus',
    intensity: 1.2,
  });
  console.log('Preset result:', presetResult);

  // Demonstrate reality inversion with coordination
  console.log('\n🌀 Triggering coordinated reality inversion...');
  const inversionResult = await system.executeAgentCommand('system.reality.invert', {
    intensity: 1.5,
  });
  console.log('Inversion result:', inversionResult);

  // Demonstrate parameter web update
  console.log('\n🕸️ Updating parameter web...');
  const webResult = await system.executeAgentCommand('system.web.update', {
    webType: 'click',
  });
  console.log('Web update result:', webResult);

  // Show system state
  console.log('\n📊 Final system state:');
  const finalState = system.getSystemState();
  console.log('Sections:', Object.keys(finalState.sections).length);
  console.log('Active preset:', finalState.activePreset);
  console.log('Inversion active:', finalState.inversionActive);
  console.log('Sync stats:', system.getSyncStats());

  console.log('\n🎯 Integration demonstration complete!');
  console.log('All legacy concepts successfully working together in modern TypeScript architecture');

  // Cleanup
  system.destroy();
};