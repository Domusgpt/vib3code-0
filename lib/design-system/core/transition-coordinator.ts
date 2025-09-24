/**
 * VIB34D Design System - Transition Coordinator
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 * "The Revolution Will Not be in a Structured Format"
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 * Manages transition registration and execution for the VIB34D engine.
 */

import {
  TransitionCoordinator as ITransitionCoordinator,
  TransitionConfig,
  TransitionActivity,
  TransitionHistoryEntry
} from '@/lib/design-system/types/core';

type Listener = (activity: TransitionActivity) => void;

export class TransitionCoordinator implements ITransitionCoordinator {
  private readonly registry = new Map<string, TransitionConfig>();
  private readonly listeners = new Set<Listener>();
  private readonly activeTransitions = new Set<string>();
  private current: string | null = null;
  private lastTransition: TransitionHistoryEntry | null = null;

  registerTransition(name: string, config: TransitionConfig): void {
    const normalized = cloneConfig(config);
    this.registry.set(name, normalized);
    this.registry.set(normalized.type, normalized);
    this.registry.set(normalized.type.toLowerCase(), normalized);
  }

  async executeTransition(from: string, to: string, config: TransitionConfig): Promise<void> {
    const resolved = this.resolve(config);
    const transitionKey = `${resolved.type}:${from}->${to}`;
    const startedAt = Date.now();
    this.current = resolved.type;
    this.activeTransitions.add(transitionKey);
    this.lastTransition = { name: transitionKey, from, to, startedAt };
    this.emit();
    await runTimer(resolved.duration);
    this.activeTransitions.delete(transitionKey);
    if (this.current === resolved.type) this.current = null;
    this.lastTransition = { name: transitionKey, from, to, startedAt, completedAt: Date.now() };
    this.emit();
  }

  getCurrentTransition(): string | null {
    return this.current;
  }

  getActiveTransitions(): string[] {
    return Array.from(this.activeTransitions);
  }

  getActivitySnapshot(): TransitionActivity {
    return cloneActivity(this.activeTransitions, this.current, this.lastTransition);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getActivitySnapshot());
    return () => this.listeners.delete(listener);
  }

  cleanup(): void {
    this.registry.clear();
    this.listeners.clear();
    this.activeTransitions.clear();
    this.current = null;
    this.lastTransition = null;
  }

  private resolve(config: TransitionConfig): TransitionConfig {
    const preset =
      this.registry.get(config.type) ??
      this.registry.get(config.type.toLowerCase());
    return cloneConfig(preset ?? config);
  }

  private emit(): void {
    const snapshot = this.getActivitySnapshot();
    for (const listener of this.listeners) listener(snapshot);
  }
}

function cloneConfig(config: TransitionConfig): TransitionConfig {
  return {
    type: config.type,
    duration: config.duration,
    easing: config.easing,
    properties: [...config.properties]
  };
}

function cloneActivity(
  active: Set<string>,
  current: string | null,
  lastTransition: TransitionHistoryEntry | null
): TransitionActivity {
  return {
    activeTransitions: Array.from(active),
    currentTransition: current,
    lastTransition: lastTransition ? { ...lastTransition } : null
  };
}

function runTimer(duration: number): Promise<void> {
  const target = Math.max(0, duration);
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      const origin = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const step = (timestamp: number) => {
        const elapsed = timestamp - origin;
        if (elapsed >= target) {
          resolve();
        } else {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    } else {
      setTimeout(resolve, target);
    }
  });
}
