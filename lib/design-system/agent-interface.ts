import { CoordinatedPreset, ParameterPatch, SectionVisualState, DesignSystemAdvancedTuning } from './types';
import { coordinatedPresets } from './presets';

// Type-safe agent command system
export interface AgentCommand<T = any> {
  name: string;
  description: string;
  args: Record<string, 'string' | 'number' | 'boolean'>;
  handler: (args: T) => Promise<AgentCommandResult>;
}

export interface AgentCommandResult {
  success: boolean;
  message: string;
  data?: any;
  timestamp: number;
}

// Specific argument types for built-in commands
export interface PresetApplyArgs {
  presetName: string;
  intensity?: number;
}

export interface ParameterSetArgs {
  sectionId: string;
  parameter: keyof ParameterPatch;
  value: number;
}

export interface TransitionTriggerArgs {
  from: string;
  to: string;
  duration?: number;
}

export interface SystemTuningArgs {
  speedMultiplier?: number;
  interactionSensitivity?: number;
  transitionDurationMultiplier?: number;
}

export interface SectionStateArgs {
  sectionId: string;
  gridDensity?: number;
  colorIntensity?: number;
  reactivity?: number;
  depth?: number;
}

/**
 * Agent Interface - Type-safe command execution system
 *
 * Provides a robust command-line interface for programmatic control of the VIB34D system.
 * All commands are type-safe with automatic validation, error handling, and history tracking.
 *
 * @example
 * ```typescript
 * const agent = createAgentInterface();
 *
 * // Execute a preset application
 * const result = await agent.executeCommand('preset.apply', {
 *   presetName: 'dimensional_focus',
 *   intensity: 1.2
 * });
 *
 * // Check command history
 * const history = agent.getCommandHistory();
 * ```
 */
export class AgentInterface {
  private commands: Map<string, AgentCommand> = new Map();
  private commandHistory: Array<{
    command: string;
    args: any;
    result: AgentCommandResult;
    timestamp: number;
  }> = [];

  private currentStates: Record<string, SectionVisualState> = {};
  private currentTuning: DesignSystemAdvancedTuning = {
    speedMultiplier: 1.0,
    interactionSensitivity: 1.0,
    transitionDurationMultiplier: 1.0,
  };

  constructor() {
    this.registerBuiltInCommands();
  }

  // Register a new command
  registerCommand<T>(command: AgentCommand<T>): void {
    this.commands.set(command.name, command);
  }

  // Execute a command with validation
  async executeCommand(commandName: string, args: any): Promise<AgentCommandResult> {
    const command = this.commands.get(commandName);
    if (!command) {
      const result: AgentCommandResult = {
        success: false,
        message: `Unknown command: ${commandName}`,
        timestamp: Date.now(),
      };
      return result;
    }

    try {
      // Validate arguments
      this.validateArgs(args, command.args);

      // Execute command
      const result = await command.handler(args);

      // Store in history
      this.commandHistory.push({
        command: commandName,
        args,
        result,
        timestamp: Date.now(),
      });

      return result;
    } catch (error) {
      const result: AgentCommandResult = {
        success: false,
        message: `Command execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now(),
      };

      this.commandHistory.push({
        command: commandName,
        args,
        result,
        timestamp: Date.now(),
      });

      return result;
    }
  }

  // Validate arguments against command schema
  private validateArgs(args: any, schema: Record<string, 'string' | 'number' | 'boolean'>): void {
    Object.entries(schema).forEach(([key, type]) => {
      if (!(key in args)) {
        throw new Error(`Missing required argument: ${key}`);
      }

      const value = args[key];
      const actualType = typeof value;

      if (actualType !== type) {
        throw new Error(`Argument ${key} expected ${type}, got ${actualType}`);
      }
    });
  }

  // Register built-in commands
  private registerBuiltInCommands(): void {
    // Preset application command
    this.registerCommand<PresetApplyArgs>({
      name: 'preset.apply',
      description: 'Apply a coordinated design system preset',
      args: { presetName: 'string', intensity: 'number' },
      handler: async ({ presetName, intensity = 1.0 }: PresetApplyArgs) => {
        const preset = coordinatedPresets[presetName];
        if (!preset) {
          return {
            success: false,
            message: `Preset '${presetName}' not found`,
            timestamp: Date.now(),
          };
        }

        // Apply preset effects with intensity scaling
        const appliedEffects = this.applyPresetWithIntensity(preset, intensity);

        return {
          success: true,
          message: `Applied preset '${presetName}' with intensity ${intensity}`,
          data: appliedEffects,
          timestamp: Date.now(),
        };
      },
    });

    // Parameter setting command
    this.registerCommand<ParameterSetArgs>({
      name: 'parameter.set',
      description: 'Set a specific parameter for a section',
      args: { sectionId: 'string', parameter: 'string', value: 'number' },
      handler: async ({ sectionId, parameter, value }: ParameterSetArgs) => {
        const patch: ParameterPatch = { [parameter]: value };

        return {
          success: true,
          message: `Set ${parameter} to ${value} for section ${sectionId}`,
          data: { sectionId, patch },
          timestamp: Date.now(),
        };
      },
    });

    // System tuning command
    this.registerCommand<SystemTuningArgs>({
      name: 'system.tune',
      description: 'Adjust global system parameters',
      args: {
        speedMultiplier: 'number',
        interactionSensitivity: 'number',
        transitionDurationMultiplier: 'number',
      },
      handler: async (tuning: SystemTuningArgs) => {
        const updatedTuning = { ...this.currentTuning, ...tuning };
        this.currentTuning = updatedTuning;

        return {
          success: true,
          message: 'System tuning updated',
          data: updatedTuning,
          timestamp: Date.now(),
        };
      },
    });

    // Section state command
    this.registerCommand<SectionStateArgs>({
      name: 'section.state',
      description: 'Set visual state for a specific section',
      args: {
        sectionId: 'string',
        gridDensity: 'number',
        colorIntensity: 'number',
        reactivity: 'number',
        depth: 'number',
      },
      handler: async ({ sectionId, ...visualState }: SectionStateArgs) => {
        const currentState = this.currentStates[sectionId] || {
          gridDensity: 1,
          colorIntensity: 1,
          reactivity: 1,
          depth: 0,
          lastUpdated: Date.now(),
        };

        const updatedState: SectionVisualState = {
          ...currentState,
          ...visualState,
          lastUpdated: Date.now(),
        };

        this.currentStates[sectionId] = updatedState;

        return {
          success: true,
          message: `Updated state for section ${sectionId}`,
          data: updatedState,
          timestamp: Date.now(),
        };
      },
    });

    // Reality inversion command
    this.registerCommand<{ intensity: number }>({
      name: 'reality.invert',
      description: 'Trigger reality inversion effect',
      args: { intensity: 'number' },
      handler: async ({ intensity }) => {
        // This would integrate with the RealityInversionEngine
        return {
          success: true,
          message: `Reality inversion triggered with intensity ${intensity}`,
          data: { intensity, timestamp: Date.now() },
          timestamp: Date.now(),
        };
      },
    });

    // Get system status command
    this.registerCommand<{}>({
      name: 'system.status',
      description: 'Get current system status',
      args: {},
      handler: async () => {
        return {
          success: true,
          message: 'System status retrieved',
          data: {
            sections: Object.keys(this.currentStates).length,
            tuning: this.currentTuning,
            commandHistory: this.commandHistory.length,
            availablePresets: Object.keys(coordinatedPresets),
          },
          timestamp: Date.now(),
        };
      },
    });
  }

  // Apply preset with intensity scaling
  private applyPresetWithIntensity(preset: CoordinatedPreset, intensity: number): any {
    const scaleValue = (value: number, base: number = 1): number => {
      return base + (value - base) * intensity;
    };

    return {
      focused: {
        visual: Object.fromEntries(
          Object.entries(preset.effects.focused.visual).map(([key, value]) => [
            key,
            typeof value === 'number' ? scaleValue(value) : value,
          ])
        ),
        parameters: Object.fromEntries(
          Object.entries(preset.effects.focused.parameters).map(([key, value]) => [
            key,
            typeof value === 'number' ? scaleValue(value, 0) : value,
          ])
        ),
        timing: preset.effects.focused.timing,
      },
      unfocused: {
        visual: Object.fromEntries(
          Object.entries(preset.effects.unfocused.visual).map(([key, value]) => [
            key,
            typeof value === 'number' ? scaleValue(value) : value,
          ])
        ),
        parameters: Object.fromEntries(
          Object.entries(preset.effects.unfocused.parameters).map(([key, value]) => [
            key,
            typeof value === 'number' ? scaleValue(value, 0) : value,
          ])
        ),
        timing: preset.effects.unfocused.timing,
      },
      system: preset.effects.system,
    };
  }

  // Get command history
  getCommandHistory(): typeof this.commandHistory {
    return [...this.commandHistory];
  }

  // Get available commands
  getAvailableCommands(): Array<{name: string; description: string; args: Record<string, string>}> {
    return Array.from(this.commands.values()).map((cmd) => ({
      name: cmd.name,
      description: cmd.description,
      args: cmd.args,
    }));
  }

  // Clear command history
  clearHistory(): void {
    this.commandHistory = [];
  }

  // Update current states (called by external systems)
  updateStates(states: Record<string, SectionVisualState>): void {
    this.currentStates = { ...states };
  }

  // Update current tuning (called by external systems)
  updateTuning(tuning: DesignSystemAdvancedTuning): void {
    this.currentTuning = { ...tuning };
  }

  // Batch execute multiple commands
  async executeBatch(commands: Array<{name: string; args: any}>): Promise<AgentCommandResult[]> {
    const results: AgentCommandResult[] = [];

    for (const cmd of commands) {
      const result = await this.executeCommand(cmd.name, cmd.args);
      results.push(result);

      // Stop batch execution if a command fails
      if (!result.success) {
        break;
      }
    }

    return results;
  }
}

// Factory function
export const createAgentInterface = (): AgentInterface => {
  return new AgentInterface();
};

// Command parser utility for string-based commands
export const parseAgentCommand = (commandString: string): {name: string; args: Record<string, any>} | null => {
  // Parse commands like: "preset.apply presetName=dimensional_focus intensity=1.2"
  const parts = commandString.trim().split(' ');
  if (parts.length === 0) return null;

  const name = parts[0];
  const args: Record<string, any> = {};

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const [key, value] = part.split('=');

    if (key && value) {
      // Try to parse as number, boolean, or keep as string
      if (!isNaN(Number(value))) {
        args[key] = Number(value);
      } else if (value === 'true' || value === 'false') {
        args[key] = value === 'true';
      } else {
        args[key] = value;
      }
    }
  }

  return { name, args };
};