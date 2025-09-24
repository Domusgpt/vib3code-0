/**
 * VIB34D Hybrid Foundation 2.0 - Interaction Coordinator
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 *
 * Modern TypeScript orchestration of hover, focus, and inversion events.
 * Bridges DOM/React interactions with the Hybrid Foundation parameter web.
 *
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 */

import type { LayerType, ParameterCascadeContext } from './vib34d-home-master';
import { VIB3HomeMaster } from './vib34d-home-master';

export interface VisualizerRegistration {
  id: string;
  sectionId: string;
  layer: LayerType;
  element?: Element | null;
}

interface HoverMeta {
  index?: number;
  total?: number;
}

const DEFAULT_IDLE_THRESHOLD = 8000; // milliseconds

export class VIB34DInteractionCoordinator {
  private readonly master: VIB3HomeMaster;
  private readonly registrations = new Map<string, VisualizerRegistration>();
  private readonly registrationCleanup = new Map<string, () => void>();
  private lastActivity = Date.now();
  private idleThreshold = DEFAULT_IDLE_THRESHOLD;
  private rafHandle: number | null = null;
  private lastFrame = 0;

  constructor(master: VIB3HomeMaster) {
    this.master = master;
  }

  registerVisualizer(registration: VisualizerRegistration): () => void {
    this.registrations.set(registration.id, registration);
    const unregister = this.master
      .getConsciousness()
      .registerElement(registration.sectionId, registration.layer, registration.element ?? null);
    this.registrationCleanup.set(registration.id, unregister);
    return () => {
      this.registrations.delete(registration.id);
      const cleanup = this.registrationCleanup.get(registration.id);
      if (cleanup) {
        cleanup();
        this.registrationCleanup.delete(registration.id);
      }
    };
  }

  setIdleThreshold(milliseconds: number) {
    this.idleThreshold = Math.max(1000, milliseconds);
  }

  handleHoverStart(id: string, meta: HoverMeta = {}) {
    const registration = this.registrations.get(id);
    if (!registration) return;
    this.markActivity();
    this.triggerCascade('cardHoverTarget', {
      sectionId: registration.sectionId,
      layerType: registration.layer,
      targetId: id,
      targetIndex: meta.index,
      magnitude: 1,
      polarity: 1,
    });
    this.triggerCascade('cardHoverSibling', {
      sectionId: registration.sectionId,
      layerType: registration.layer,
      targetId: id,
      targetIndex: meta.index,
      magnitude: Math.max(0.2, 1 - (meta.total ?? 1) * 0.1),
      polarity: -1,
    });
    this.master.getConsciousness().signalInteraction('hover');
  }

  handleHoverEnd(id: string) {
    const registration = this.registrations.get(id);
    if (!registration) return;
    this.markActivity();
    this.triggerCascade('cardHoverTarget', {
      sectionId: registration.sectionId,
      layerType: registration.layer,
      targetId: id,
      magnitude: 1,
      polarity: -1,
    });
    this.triggerCascade('cardHoverSibling', {
      sectionId: registration.sectionId,
      layerType: registration.layer,
      targetId: id,
      magnitude: 1,
      polarity: 1,
    });
  }

  handleFocus(id: string) {
    const registration = this.registrations.get(id);
    if (!registration) return;
    this.markActivity();
    this.triggerCascade('cardFocus', {
      sectionId: registration.sectionId,
      layerType: registration.layer,
      targetId: id,
      magnitude: 1,
      polarity: 1,
    });
    this.master.getConsciousness().signalInteraction('focus');
  }

  handleBlur(id: string) {
    const registration = this.registrations.get(id);
    if (!registration) return;
    this.markActivity();
    this.triggerCascade('cardFocusRelease', {
      sectionId: registration.sectionId,
      layerType: registration.layer,
      targetId: id,
      magnitude: 1,
      polarity: -1,
    });
  }

  handleClick(id: string) {
    const registration = this.registrations.get(id);
    if (!registration) return;
    this.markActivity();
    this.triggerCascade('realityInversion', {
      sectionId: registration.sectionId,
      layerType: registration.layer,
      targetId: id,
      magnitude: 1,
      polarity: 1,
    });
    this.master.getConsciousness().signalInteraction('reality-inversion');
  }

  start() {
    if (typeof window === 'undefined' || this.rafHandle !== null) {
      return;
    }
    const loop = (timestamp: number) => {
      if (this.lastFrame === 0) {
        this.lastFrame = timestamp;
      }
      const delta = timestamp - this.lastFrame;
      this.lastFrame = timestamp;
      this.evaluateIdle(delta);
      this.rafHandle = window.requestAnimationFrame(loop);
    };
    this.rafHandle = window.requestAnimationFrame(loop);
  }

  stop() {
    if (typeof window === 'undefined') {
      return;
    }
    if (this.rafHandle !== null) {
      window.cancelAnimationFrame(this.rafHandle);
      this.rafHandle = null;
    }
    this.lastFrame = 0;
  }

  private triggerCascade(trigger: string, context: ParameterCascadeContext) {
    this.master.triggerParameterCascade(trigger, context);
  }

  private markActivity() {
    this.lastActivity = Date.now();
  }

  private evaluateIdle(deltaMs: number) {
    if (Date.now() - this.lastActivity > this.idleThreshold) {
      this.lastActivity = Date.now();
      this.triggerCascade('idleFlux', {
        layerType: 'background',
        magnitude: Math.min(1, deltaMs / 16000),
        polarity: 1,
      });
      this.master.getConsciousness().signalInteraction('idle');
    }
  }
}
