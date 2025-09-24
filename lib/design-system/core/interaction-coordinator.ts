/**
 * VIB34D Design System - Interaction Coordinator
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 * "The Revolution Will Not be in a Structured Format"
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 * Runtime manager for hover, click, and scroll interactions.
 */

import {
  InteractionCoordinator as InteractionCoordinatorContract,
  HoverConfig,
  ClickConfig,
  ScrollConfig,
  PresetDefinition
} from '@/lib/design-system/types/core';
import { clampNumber, extractString } from './state-utils';

type Cleanup = () => void;

interface InteractionPresetDefaults {
  hoverEffect: string;
  clickEffect: string;
  scrollEffect: string;
  sensitivity: number;
}

export class InteractionCoordinator implements InteractionCoordinatorContract {
  private readonly hoverHandlers = new Map<HTMLElement, Cleanup>();
  private readonly clickHandlers = new Map<HTMLElement, Cleanup>();
  private readonly scrollHandlers = new Map<HTMLElement, Cleanup>();
  private readonly listeners = new Set<(count: number) => void>();
  private activeInteractions = 0;
  private defaults: InteractionPresetDefaults = {
    hoverEffect: 'lift_glow',
    clickEffect: 'ripple_expand',
    scrollEffect: 'parallax_smooth',
    sensitivity: 0.5
  };

  applyPreset(preset: PresetDefinition | null): void {
    const parameters = preset?.parameters ?? {};
    this.defaults = {
      hoverEffect: extractString(parameters.hoverEffect, this.defaults.hoverEffect),
      clickEffect: extractString(parameters.clickEffect, this.defaults.clickEffect),
      scrollEffect: extractString(parameters.scrollEffect, this.defaults.scrollEffect),
      sensitivity: clampNumber(parameters.sensitivity, 0, 1, this.defaults.sensitivity)
    };
  }

  getActiveInteractions(): number {
    return this.activeInteractions;
  }

  subscribeActiveInteractions(listener: (count: number) => void): () => void {
    this.listeners.add(listener);
    listener(this.activeInteractions);
    return () => this.listeners.delete(listener);
  }

  registerHoverHandler(element: HTMLElement, config: HoverConfig): void {
    if (typeof window === 'undefined') return;
    this.removeHoverHandler(element);
    const resolved: HoverConfig = {
      effect: config.effect || this.defaults.hoverEffect,
      intensity: clampNumber(config.intensity, 0, 1, this.defaults.sensitivity),
      duration: clampNumber(config.duration, 50, 2000, 250),
      easing: config.easing || 'ease-out'
    };
    const onEnter = () => {
      this.bumpInteractions(1);
      this.applyHoverEffect(element, resolved);
    };
    const onLeave = () => {
      this.bumpInteractions(-1);
      this.clearHoverEffect(element);
    };
    element.addEventListener('pointerenter', onEnter);
    element.addEventListener('pointerleave', onLeave);
    this.hoverHandlers.set(element, () => {
      element.removeEventListener('pointerenter', onEnter);
      element.removeEventListener('pointerleave', onLeave);
      this.clearHoverEffect(element);
    });
  }

  registerClickHandler(element: HTMLElement, config: ClickConfig): void {
    if (typeof window === 'undefined') return;
    this.removeClickHandler(element);
    const resolved: ClickConfig = {
      effect: config.effect || this.defaults.clickEffect,
      feedback: config.feedback ?? 'visual',
      propagation: config.propagation ?? false
    };
    const onClick = (event: Event) => {
      if (!resolved.propagation) event.stopPropagation();
      this.bumpInteractions(1);
      this.applyClickEffect(element, resolved);
      window.setTimeout(() => {
        this.bumpInteractions(-1);
        this.resetClickEffect(element);
      }, 200);
    };
    element.addEventListener('click', onClick);
    this.clickHandlers.set(element, () => {
      element.removeEventListener('click', onClick);
      this.resetClickEffect(element);
    });
  }

  registerScrollHandler(element: HTMLElement, config: ScrollConfig): void {
    if (typeof window === 'undefined') return;
    this.removeScrollHandler(element);
    const resolved: ScrollConfig = {
      direction: config.direction || 'vertical',
      sensitivity: clampNumber(config.sensitivity, 0, 1, this.defaults.sensitivity),
      momentum: config.momentum ?? true
    };
    const onWheel = (event: WheelEvent) => {
      this.bumpInteractions(1);
      const delta = resolved.sensitivity * (resolved.momentum ? event.deltaY * 0.9 : event.deltaY);
      if (resolved.direction !== 'horizontal') element.scrollTop += delta;
      if (resolved.direction !== 'vertical') element.scrollLeft += delta;
      window.setTimeout(() => this.bumpInteractions(-1), 150);
    };
    element.addEventListener('wheel', onWheel, { passive: true });
    this.scrollHandlers.set(element, () => {
      element.removeEventListener('wheel', onWheel);
    });
  }

  cleanup(): void {
    for (const cleanup of this.hoverHandlers.values()) cleanup();
    for (const cleanup of this.clickHandlers.values()) cleanup();
    for (const cleanup of this.scrollHandlers.values()) cleanup();
    this.hoverHandlers.clear();
    this.clickHandlers.clear();
    this.scrollHandlers.clear();
    this.activeInteractions = 0;
    this.notify();
  }

  private bumpInteractions(delta: number): void {
    this.activeInteractions = Math.max(0, this.activeInteractions + delta);
    this.notify();
  }

  private notify(): void {
    for (const listener of this.listeners) listener(this.activeInteractions);
  }

  private removeHoverHandler(element: HTMLElement): void {
    this.hoverHandlers.get(element)?.();
    this.hoverHandlers.delete(element);
  }

  private removeClickHandler(element: HTMLElement): void {
    this.clickHandlers.get(element)?.();
    this.clickHandlers.delete(element);
  }

  private removeScrollHandler(element: HTMLElement): void {
    this.scrollHandlers.get(element)?.();
    this.scrollHandlers.delete(element);
  }

  private applyHoverEffect(element: HTMLElement, config: HoverConfig): void {
    element.style.transition = `transform ${config.duration}ms ${config.easing}`;
    element.style.transform = config.effect.includes('lift')
      ? 'translate3d(0, -4px, 0) scale3d(1.02, 1.02, 1)'
      : 'scale3d(1.01, 1.01, 1)';
    element.style.boxShadow = config.effect.includes('glow')
      ? '0 8px 24px rgba(56, 189, 248, 0.35)'
      : element.style.boxShadow;
  }

  private clearHoverEffect(element: HTMLElement): void {
    element.style.transform = '';
    element.style.boxShadow = '';
  }

  private applyClickEffect(element: HTMLElement, config: ClickConfig): void {
    if (config.effect.includes('ripple')) {
      element.style.transform = 'scale3d(0.97, 0.97, 1)';
      element.style.transition = 'transform 180ms ease-out';
    }
    if (config.feedback === 'audio') {
      void element.dispatchEvent(new CustomEvent('vib34d:interaction-audio'));
    }
  }

  private resetClickEffect(element: HTMLElement): void {
    element.style.transform = '';
  }
}
