/**
 * VIB34D Hybrid Foundation 2.0 - Visual Consciousness System
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 *
 * Captures awareness metrics, attention mapping, and emergent flux readings.
 * Lightweight modern TypeScript facade inspired by the legacy
 * ReactiveHolographicInterface.js architecture.
 *
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 */

import type { LayerType } from './vib34d-home-master';
import type { VIB3GeometryParams } from './vib34d-geometries';

export interface VisualConsciousnessSnapshot {
  awareness: number;
  emergence: number;
  coherence: number;
  flux: number;
  attention: Map<string, number>;
  memory: string[];
}

interface RegisteredElement {
  key: string;
  sectionId: string;
  layer: LayerType;
  element: Element | null;
}

const MAX_MEMORY = 32;

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export class VisualConsciousnessSystem {
  private awareness = 0.5;
  private emergence = 0.2;
  private coherence = 1.0;
  private flux = 0.25;
  private readonly attention = new Map<string, number>();
  private readonly registry = new Map<string, RegisteredElement>();
  private readonly memory: string[] = [];
  private readonly listeners = new Set<() => void>();
  private revision = 0;

  registerElement(sectionId: string, layer: LayerType, element: Element | null) {
    const key = this.composeKey(sectionId, layer);
    const entry: RegisteredElement = { key, sectionId, layer, element };
    this.registry.set(key, entry);
    this.attention.set(key, 0.5);
    this.remember(`register:${key}`);
    this.emit();
    return () => {
      this.registry.delete(key);
      this.attention.delete(key);
      this.remember(`unregister:${key}`);
      this.emit();
    };
  }

  observe(sectionId: string, layer: LayerType, params: VIB3GeometryParams) {
    const key = this.composeKey(sectionId, layer);
    const weight = clamp01(0.35 + params.density * 0.45 + params.chaos * 0.2);
    this.attention.set(key, weight);
  }

  signalInteraction(event: string) {
    this.remember(`interaction:${event}:${Date.now()}`);
    this.awareness = clamp01(this.awareness + 0.05);
    this.flux = clamp01(this.flux + 0.08);
    this.emit();
  }

  step(delta: number) {
    const attentionMean = this.computeAttentionMean();
    const awarenessTarget = clamp01(0.4 + attentionMean * 0.6);
    const emergenceTarget = clamp01(0.3 + attentionMean * 0.7);
    const coherenceTarget = clamp01(0.85 + (attentionMean - 0.5) * 0.2);

    const lerpFactor = (rate: number) => 1 - Math.exp(-delta * rate);

    const awarenessPrev = this.awareness;
    const emergencePrev = this.emergence;
    const coherencePrev = this.coherence;
    const fluxPrev = this.flux;

    this.awareness += (awarenessTarget - this.awareness) * lerpFactor(2.2);
    this.emergence += (emergenceTarget - this.emergence) * lerpFactor(1.5);
    this.coherence += (coherenceTarget - this.coherence) * lerpFactor(1.1);
    this.flux += (this.emergence - 0.5) * delta * 0.3;
    this.flux = clamp01(this.flux);

    if (
      Math.abs(this.awareness - awarenessPrev) > 1e-4 ||
      Math.abs(this.emergence - emergencePrev) > 1e-4 ||
      Math.abs(this.coherence - coherencePrev) > 1e-4 ||
      Math.abs(this.flux - fluxPrev) > 1e-4
    ) {
      this.emit();
    }
  }

  getSnapshot(): VisualConsciousnessSnapshot {
    return {
      awareness: this.awareness,
      emergence: this.emergence,
      coherence: this.coherence,
      flux: this.flux,
      attention: new Map(this.attention),
      memory: [...this.memory],
    };
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getRevision(): number {
    return this.revision;
  }

  private computeAttentionMean(): number {
    if (this.attention.size === 0) {
      return 0.5;
    }
    let total = 0;
    this.attention.forEach((value) => {
      total += value;
    });
    return total / this.attention.size;
  }

  private composeKey(sectionId: string, layer: LayerType): string {
    return `${sectionId}:${layer}`;
  }

  private remember(entry: string) {
    this.memory.unshift(entry);
    if (this.memory.length > MAX_MEMORY) {
      this.memory.length = MAX_MEMORY;
    }
  }

  private emit() {
    this.revision += 1;
    this.listeners.forEach((listener) => listener());
  }
}
