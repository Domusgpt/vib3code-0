/**
 * Unit tests for Agent Interface
 *
 * @jest-environment jsdom
 */

import { AgentInterface, createAgentInterface, parseAgentCommand } from '../agent-interface';

describe('AgentInterface', () => {
  let agent: AgentInterface;

  beforeEach(() => {
    agent = createAgentInterface();
  });

  afterEach(() => {
    agent.clearHistory();
  });

  describe('Command Registration and Execution', () => {
    test('registers custom commands correctly', () => {
      agent.registerCommand({
        name: 'test.command',
        description: 'Test command',
        args: { value: 'number' },
        handler: async ({ value }) => ({
          success: true,
          message: `Received value: ${value}`,
          timestamp: Date.now(),
        }),
      });

      const commands = agent.getAvailableCommands();
      const testCommand = commands.find(cmd => cmd.name === 'test.command');

      expect(testCommand).toBeDefined();
      expect(testCommand?.description).toBe('Test command');
      expect(testCommand?.args).toEqual({ value: 'number' });
    });

    test('executes commands with validation', async () => {
      const result = await agent.executeCommand('preset.apply', {
        presetName: 'dimensional_focus',
        intensity: 1.2,
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('dimensional_focus');
      expect(result.data).toBeDefined();
      expect(result.timestamp).toBeGreaterThan(0);
    });

    test('validates command arguments', async () => {
      const result = await agent.executeCommand('preset.apply', {
        presetName: 'test', // Missing intensity (should default)
      });

      expect(result.success).toBe(true);
    });

    test('rejects invalid command arguments', async () => {
      const result = await agent.executeCommand('preset.apply', {
        intensity: 1.0, // Missing required presetName
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Missing required argument');
    });

    test('rejects unknown commands', async () => {
      const result = await agent.executeCommand('unknown.command', {});

      expect(result.success).toBe(false);
      expect(result.message).toContain('Unknown command');
    });

    test('handles command execution errors', async () => {
      agent.registerCommand({
        name: 'error.command',
        description: 'Command that throws error',
        args: {},
        handler: async () => {
          throw new Error('Test error');
        },
      });

      const result = await agent.executeCommand('error.command', {});

      expect(result.success).toBe(false);
      expect(result.message).toContain('Test error');
    });
  });

  describe('Built-in Commands', () => {
    test('preset.apply command works', async () => {
      const result = await agent.executeCommand('preset.apply', {
        presetName: 'zen_equilibrium',
        intensity: 0.8,
      });

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        focused: expect.objectContaining({
          visual: expect.any(Object),
          parameters: expect.any(Object),
        }),
        unfocused: expect.objectContaining({
          visual: expect.any(Object),
          parameters: expect.any(Object),
        }),
      });
    });

    test('parameter.set command works', async () => {
      const result = await agent.executeCommand('parameter.set', {
        sectionId: 'home',
        parameter: 'density',
        value: 1.5,
      });

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        sectionId: 'home',
        patch: { density: 1.5 },
      });
    });

    test('system.tune command works', async () => {
      const result = await agent.executeCommand('system.tune', {
        speedMultiplier: 1.5,
        interactionSensitivity: 0.8,
      });

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        speedMultiplier: 1.5,
        interactionSensitivity: 0.8,
      });
    });

    test('section.state command works', async () => {
      const result = await agent.executeCommand('section.state', {
        sectionId: 'hero',
        gridDensity: 1.2,
        colorIntensity: 0.8,
      });

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        gridDensity: 1.2,
        colorIntensity: 0.8,
        lastUpdated: expect.any(Number),
      });
    });

    test('reality.invert command works', async () => {
      const result = await agent.executeCommand('reality.invert', {
        intensity: 1.5,
      });

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        intensity: 1.5,
        timestamp: expect.any(Number),
      });
    });

    test('system.status command works', async () => {
      const result = await agent.executeCommand('system.status', {});

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        sections: expect.any(Number),
        tuning: expect.any(Object),
        commandHistory: expect.any(Number),
        availablePresets: expect.any(Array),
      });
    });
  });

  describe('Command History', () => {
    test('tracks command history', async () => {
      await agent.executeCommand('system.status', {});
      await agent.executeCommand('preset.apply', {
        presetName: 'zen_equilibrium',
        intensity: 1.0,
      });

      const history = agent.getCommandHistory();

      expect(history).toHaveLength(2);
      expect(history[0].command).toBe('system.status');
      expect(history[1].command).toBe('preset.apply');
      expect(history[1].args).toEqual({
        presetName: 'zen_equilibrium',
        intensity: 1.0,
      });
    });

    test('clears command history', async () => {
      await agent.executeCommand('system.status', {});

      let history = agent.getCommandHistory();
      expect(history).toHaveLength(1);

      agent.clearHistory();

      history = agent.getCommandHistory();
      expect(history).toHaveLength(0);
    });
  });

  describe('Batch Execution', () => {
    test('executes multiple commands in sequence', async () => {
      const commands = [
        { name: 'system.tune', args: { speedMultiplier: 1.2 } },
        { name: 'preset.apply', args: { presetName: 'zen_equilibrium', intensity: 1.0 } },
        { name: 'system.status', args: {} },
      ];

      const results = await agent.executeBatch(commands);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      const history = agent.getCommandHistory();
      expect(history).toHaveLength(3);
    });

    test('stops batch execution on error', async () => {
      const commands = [
        { name: 'system.status', args: {} },
        { name: 'unknown.command', args: {} }, // This should fail
        { name: 'system.tune', args: { speedMultiplier: 1.0 } }, // This should not execute
      ];

      const results = await agent.executeBatch(commands);

      expect(results).toHaveLength(2); // Should stop after the error
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
    });
  });

  describe('State Management', () => {
    test('updates states correctly', () => {
      const mockStates = {
        home: {
          gridDensity: 1.0,
          colorIntensity: 1.0,
          reactivity: 1.0,
          depth: 0,
          lastUpdated: Date.now(),
        },
      };

      agent.updateStates(mockStates);

      // State updates are internal, but we can test that it doesn't crash
      // and that subsequent commands work
      expect(() => {
        agent.updateStates(mockStates);
      }).not.toThrow();
    });

    test('updates tuning correctly', () => {
      const mockTuning = {
        speedMultiplier: 1.5,
        interactionSensitivity: 0.8,
        transitionDurationMultiplier: 1.2,
      };

      agent.updateTuning(mockTuning);

      // Tuning updates are internal, but we can test that it doesn't crash
      expect(() => {
        agent.updateTuning(mockTuning);
      }).not.toThrow();
    });
  });

  describe('Command List Retrieval', () => {
    test('returns all available commands', () => {
      const commands = agent.getAvailableCommands();

      expect(commands.length).toBeGreaterThan(0);

      const commandNames = commands.map(cmd => cmd.name);
      expect(commandNames).toContain('preset.apply');
      expect(commandNames).toContain('parameter.set');
      expect(commandNames).toContain('system.tune');
      expect(commandNames).toContain('system.status');

      commands.forEach(cmd => {
        expect(cmd.name).toBeTruthy();
        expect(cmd.description).toBeTruthy();
        expect(cmd.args).toBeDefined();
      });
    });
  });
});

describe('parseAgentCommand', () => {
  test('parses simple commands correctly', () => {
    const result = parseAgentCommand('preset.apply presetName=zen_equilibrium intensity=1.2');

    expect(result).toEqual({
      name: 'preset.apply',
      args: {
        presetName: 'zen_equilibrium',
        intensity: 1.2,
      },
    });
  });

  test('parses boolean arguments', () => {
    const result = parseAgentCommand('test.command enabled=true disabled=false');

    expect(result).toEqual({
      name: 'test.command',
      args: {
        enabled: true,
        disabled: false,
      },
    });
  });

  test('handles string arguments', () => {
    const result = parseAgentCommand('test.command name=testValue type=string');

    expect(result).toEqual({
      name: 'test.command',
      args: {
        name: 'testValue',
        type: 'string',
      },
    });
  });

  test('handles commands without arguments', () => {
    const result = parseAgentCommand('system.status');

    expect(result).toEqual({
      name: 'system.status',
      args: {},
    });
  });

  test('returns null for invalid commands', () => {
    const result = parseAgentCommand('');

    expect(result).toBeNull();
  });

  test('handles malformed arguments gracefully', () => {
    const result = parseAgentCommand('test.command invalidarg name=value');

    expect(result).toEqual({
      name: 'test.command',
      args: {
        name: 'value',
      },
    });
  });
});