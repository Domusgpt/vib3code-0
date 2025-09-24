/**
 * VIB34D Design System - Interaction Coordinator
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 * "The Revolution Will Not be in a Structured Format"
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 * Manages hover, click, and scroll interactions for the VIB34D engine.
 */

import {
  InteractionCoordinator as IInteractionCoordinator,
  InteractionCoordinatorSettings,
  HoverConfig,
  ClickConfig,
  ScrollConfig,
  InteractionActivity,
  InteractionEventType
} from '@/lib/design-system/types/core';

type TimeoutHandle = ReturnType<typeof setTimeout>;

type Listener = (activity: InteractionActivity) => void;

const DEFAULT_ACTIVITY: InteractionActivity = { activeCount: 0, lastEvent: null };

export class InteractionCoordinator implements IInteractionCoordinator {
  private activity: InteractionActivity = DEFAULT_ACTIVITY;
  private readonly listeners = new Set<Listener>();
  private readonly cleanups = new Set<() => void>();
  private readonly timeouts = new Set<TimeoutHandle>();
  private sensitivity = 0.5;

  registerHoverHandler(element: HTMLElement, config: HoverConfig): () => void {
    const enter = () => this.increment('hover');
    const leave = () => this.decrement('hover');
    const move = () => this.touch('hover');
    element.addEventListener('pointerenter', enter, { passive: true });
    element.addEventListener('pointerleave', leave, { passive: true });
    if (config.intensity > 0.6) element.addEventListener('pointermove', move, { passive: true });
    return this.trackCleanup(() => {
      element.removeEventListener('pointerenter', enter);
      element.removeEventListener('pointerleave', leave);
      if (config.intensity > 0.6) element.removeEventListener('pointermove', move);
      this.touch('hover');
    });
  }

  registerClickHandler(element: HTMLElement, config: ClickConfig): () => void {
    const handler = (event: MouseEvent) => {
      if (!config.propagation) event.stopPropagation();
      this.pulse('click', basePulseDuration(220, this.sensitivity));
    };
    element.addEventListener('click', handler);
    return this.trackCleanup(() => element.removeEventListener('click', handler));
  }

  registerScrollHandler(element: HTMLElement, config: ScrollConfig): () => void {
    const handler = (event: WheelEvent) => {
      const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      if ((config.direction === 'horizontal' && !horizontal) || (config.direction === 'vertical' && horizontal)) return;
      const magnitude = Math.min(3, Math.max(1, Math.round(Math.abs(horizontal ? event.deltaX : event.deltaY) / 40)));
      this.pulse('scroll', basePulseDuration(config.momentum ? 520 : 320, this.sensitivity), magnitude);
    };
    element.addEventListener('wheel', handler, { passive: true });
    return this.trackCleanup(() => element.removeEventListener('wheel', handler));
  }

  configure(settings: InteractionCoordinatorSettings): void {
    if (typeof settings.sensitivity === 'number') this.sensitivity = clamp(settings.sensitivity, 0, 1);
  }

  getActiveInteractions(): number {
    return this.activity.activeCount;
  }

  getActivitySnapshot(): InteractionActivity {
    return cloneActivity(this.activity);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(cloneActivity(this.activity));
    return () => this.listeners.delete(listener);
  }

  cleanup(): void {
    for (const cleanup of Array.from(this.cleanups)) cleanup();
    this.cleanups.clear();
    for (const timeout of Array.from(this.timeouts)) clearTimeout(timeout);
    this.timeouts.clear();
    this.activity = { activeCount: 0, lastEvent: null };
    this.emit();
  }

  private increment(type: InteractionEventType, amount = 1): void {
    const next = Math.max(0, this.activity.activeCount + amount);
    this.activity = { activeCount: next, lastEvent: { type, timestamp: Date.now() } };
    this.emit();
  }

  private decrement(type: InteractionEventType, amount = 1): void {
    const next = Math.max(0, this.activity.activeCount - amount);
    this.activity = { activeCount: next, lastEvent: { type, timestamp: Date.now() } };
    this.emit();
  }

  private pulse(type: InteractionEventType, duration: number, amount = 1): void {
    this.increment(type, amount);
    const scheduler = typeof window !== 'undefined' ? window.setTimeout.bind(window) : setTimeout;
    const timeout = scheduler(() => {
      this.decrement(type, amount);
      this.timeouts.delete(timeout as TimeoutHandle);
    }, duration) as TimeoutHandle;
    this.timeouts.add(timeout);
  }

  private touch(type: InteractionEventType): void {
    this.activity = {
      activeCount: this.activity.activeCount,
      lastEvent: { type, timestamp: Date.now() }
    };
    this.emit();
  }

  private emit(): void {
    const snapshot = cloneActivity(this.activity);
    for (const listener of this.listeners) listener(snapshot);
  }

  private trackCleanup(cleanup: () => void): () => void {
    this.cleanups.add(cleanup);
    return () => {
      cleanup();
      this.cleanups.delete(cleanup);
    };
  }
}

function cloneActivity(activity: InteractionActivity): InteractionActivity {
  return {
    activeCount: activity.activeCount,
    lastEvent: activity.lastEvent ? { ...activity.lastEvent } : null
  };
}

function basePulseDuration(base: number, sensitivity: number): number {
  const scaled = base * (1.25 - 0.5 * sensitivity);
  return Math.max(140, Math.round(scaled));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
