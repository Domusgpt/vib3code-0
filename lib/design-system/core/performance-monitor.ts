/**
 * VIB34D Design System - Performance Monitor
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 * "The Revolution Will Not be in a Structured Format"
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 * Observes FPS, memory usage, and interaction latency for the engine.
 */

import { PerformanceMetrics } from '@/lib/design-system/types/core';

interface PerformanceWithMemory extends Performance {
  memory?: { usedJSHeapSize: number };
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = { fps: 60, memoryUsage: 0, renderTime: 0, interactionLatency: 0 };
  private lastTimestamp = 0;
  private lastEmit = 0;
  private rafId: number | null = null;
  private running = false;
  private readonly listeners = new Set<(metrics: PerformanceMetrics) => void>();
  private readonly emitInterval = 250;

  start(): void {
    if (this.running || typeof window === 'undefined') return;
    this.running = true;
    this.lastTimestamp = performance.now();
    this.lastEmit = this.lastTimestamp;
    this.rafId = requestAnimationFrame(this.handleFrame);
  }

  stop(): void {
    if (!this.running) return;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.running = false;
  }

  subscribe(listener: (metrics: PerformanceMetrics) => void): () => void {
    this.listeners.add(listener);
    listener(this.getMetrics());
    return () => this.listeners.delete(listener);
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  private handleFrame = (timestamp: number): void => {
    if (!this.running) return;
    const delta = timestamp - this.lastTimestamp || 16.67;
    this.lastTimestamp = timestamp;
    const fps = delta > 0 ? 1000 / delta : 60;
    const smoothedFps = this.metrics.fps * 0.85 + fps * 0.15;
    const renderTime = Number(delta.toFixed(2));
    const interactionLatency = Math.max(0, Number((delta - 16.67).toFixed(2)));
    const memory = (performance as PerformanceWithMemory).memory;
    const memoryUsage = memory ? Number((memory.usedJSHeapSize / 1048576).toFixed(2)) : 0;
    this.metrics = {
      fps: Number(smoothedFps.toFixed(2)),
      memoryUsage,
      renderTime,
      interactionLatency
    };
    if (timestamp - this.lastEmit >= this.emitInterval) {
      const snapshot = this.getMetrics();
      for (const listener of this.listeners) listener(snapshot);
      this.lastEmit = timestamp;
    }
    this.rafId = requestAnimationFrame(this.handleFrame);
  };
}
