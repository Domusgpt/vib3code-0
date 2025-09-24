/**
 * VIB34D Design System - Transition Coordinator
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 * "The Revolution Will Not be in a Structured Format"
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 * Orchestrates component and page transitions with runtime monitoring.
 */

import {
  TransitionCoordinator as TransitionCoordinatorContract,
  TransitionConfig,
  PresetDefinition
} from '@/lib/design-system/types/core';
import { clampNumber, extractString } from './state-utils';

type TransitionListener = (activeTransitions: string[]) => void;

interface TransitionPresetDefaults {
  duration: number;
  easing: string;
  pageTransition: string;
  cardTransition: string;
  properties: string[];
}

export class TransitionCoordinator implements TransitionCoordinatorContract {
  private readonly transitions = new Map<string, TransitionConfig>();
  private readonly listeners = new Set<TransitionListener>();
  private readonly active = new Set<string>();
  private current: string | null = null;
  private defaults: TransitionPresetDefaults = {
    duration: 800,
    easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    pageTransition: 'dimensional_slide',
    cardTransition: 'portal_expand',
    properties: ['opacity', 'transform']
  };

  applyPreset(preset: PresetDefinition | null): void {
    const parameters = preset?.parameters ?? {};
    const duration = clampNumber(parameters.duration, 100, 6000, this.defaults.duration);
    const easing = extractString(parameters.easing, this.defaults.easing);
    const pageTransition = extractString(parameters.pageTransition, this.defaults.pageTransition);
    const cardTransition = extractString(parameters.cardTransition, this.defaults.cardTransition);
    const properties = this.resolveProperties(parameters.properties);
    this.defaults = { duration, easing, pageTransition, cardTransition, properties };
    this.registerTransition('page', {
      type: pageTransition,
      duration,
      easing,
      properties
    });
    this.registerTransition('card', {
      type: cardTransition,
      duration: Math.max(100, Math.round(duration * 0.65)),
      easing,
      properties
    });
  }

  registerTransition(name: string, config: TransitionConfig): void {
    this.transitions.set(name, { ...config, properties: [...config.properties] });
  }

  getCurrentTransition(): string | null {
    return this.current;
  }

  getActiveTransitions(): string[] {
    return Array.from(this.active.values());
  }

  subscribeActiveTransitions(listener: TransitionListener): () => void {
    this.listeners.add(listener);
    listener(this.getActiveTransitions());
    return () => this.listeners.delete(listener);
  }

  async executeTransition(from: string, to: string, config: TransitionConfig): Promise<void> {
    const key = `${from}->${to}:${config.type}`;
    const effective: TransitionConfig = {
      type: config.type || this.defaults.pageTransition,
      duration: clampNumber(config.duration, 16, 10000, this.defaults.duration),
      easing: config.easing || this.defaults.easing,
      properties: config.properties.length ? [...config.properties] : [...this.defaults.properties]
    };
    this.current = key;
    this.active.add(key);
    this.notify();
    if (typeof window === 'undefined') {
      this.finishTransition(key);
      return;
    }
    await new Promise<void>((resolve) => {
      const start = performance.now();
      const step = (timestamp: number) => {
        if (timestamp - start >= effective.duration) {
          this.finishTransition(key);
          resolve();
        } else {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
    });
  }

  cleanup(): void {
    this.transitions.clear();
    this.active.clear();
    this.current = null;
    this.notify();
  }

  private finishTransition(key: string): void {
    this.active.delete(key);
    if (this.current === key) this.current = null;
    this.notify();
  }

  private notify(): void {
    const snapshot = this.getActiveTransitions();
    for (const listener of this.listeners) listener(snapshot);
  }

  private resolveProperties(value: unknown): string[] {
    if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
      return [...value];
    }
    if (typeof value === 'string') {
      return value.split(',').map((part) => part.trim()).filter(Boolean);
    }
    return [...this.defaults.properties];
  }
}
