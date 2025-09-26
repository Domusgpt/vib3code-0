/**
 * VIB34D Interaction Engine
 * Advanced parameter mapping layer inspired by Clear Seas Solutions
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 *
 * Maps pointer, scroll, and click energy to normalized visualizer values
 * Drives global averages and feeds real-time uniforms to holographic canvases
 */

import { globalMotion, type MotionTelemetry } from './global-motion-telemetry';

export interface VIB34DParameters {
  // Core parameters
  hue: number;              // 0-1 color hue
  density: number;          // 0-1 particle density
  morph: number;            // 0-2 shape morphing
  chaos: number;            // 0-1 turbulence
  noiseFreq: number;        // 0.5-5 noise frequency
  glitch: number;           // 0-0.5 glitch intensity
  dispAmp: number;          // 0-1 displacement amplitude
  chromaShift: number;      // 0-0.2 chromatic aberration
  timeScale: number;        // 0.1-3 animation speed
  beatPhase: number;        // 0-1 rhythmic phase

  // Advanced 4D parameters
  rot4dXW: number;          // 4D rotation X-W plane
  rot4dYW: number;          // 4D rotation Y-W plane
  rot4dZW: number;          // 4D rotation Z-W plane
  perspectiveFactor: number; // 4D perspective intensity

  // Synergy parameters
  groupSynergy: number;     // 0-1 group cohesion
  supportWeight: number;    // 0-1 support role intensity
  focusGradient: number;    // 0-1 focus falloff
  ambientLevel: number;     // 0-1 ambient activity
}

export interface InteractionMapping {
  source: 'pointer' | 'scroll' | 'click' | 'hover' | 'focus' | 'time';
  target: keyof VIB34DParameters;
  factor: number;           // Multiplication factor
  offset: number;          // Base offset
  smoothing: number;       // 0-1 smoothing factor
  clamp: [number, number]; // Min/max bounds
}

export class VIB34DInteractionEngine {
  private parameters: VIB34DParameters;
  private mappings: InteractionMapping[] = [];
  private smoothedParams: VIB34DParameters;
  private canvases: Map<string, HTMLCanvasElement> = new Map();
  private uniforms: Map<string, WebGLUniformLocation> = new Map();
  private rafId: number | null = null;
  private startTime = performance.now();
  private beatClock = 0;
  private beatInterval = 2000; // 2 seconds per beat

  constructor() {
    this.parameters = this.createDefaultParameters();
    this.smoothedParams = { ...this.parameters };
    this.setupDefaultMappings();
    this.initialize();
  }

  private createDefaultParameters(): VIB34DParameters {
    return {
      hue: 0.5,
      density: 0.5,
      morph: 0.5,
      chaos: 0.2,
      noiseFreq: 2.0,
      glitch: 0.05,
      dispAmp: 0.2,
      chromaShift: 0.05,
      timeScale: 1.0,
      beatPhase: 0,
      rot4dXW: 0,
      rot4dYW: 0,
      rot4dZW: 0,
      perspectiveFactor: 1.0,
      groupSynergy: 0.5,
      supportWeight: 0.5,
      focusGradient: 0.5,
      ambientLevel: 0.3,
    };
  }

  private setupDefaultMappings() {
    // Pointer-driven mappings
    this.addMapping({
      source: 'pointer',
      target: 'rot4dXW',
      factor: Math.PI / 4,
      offset: 0,
      smoothing: 0.1,
      clamp: [-Math.PI, Math.PI]
    });

    this.addMapping({
      source: 'pointer',
      target: 'rot4dYW',
      factor: Math.PI / 4,
      offset: 0,
      smoothing: 0.1,
      clamp: [-Math.PI, Math.PI]
    });

    // Scroll-driven mappings
    this.addMapping({
      source: 'scroll',
      target: 'morph',
      factor: 0.001,
      offset: 0.5,
      smoothing: 0.08,
      clamp: [0, 2]
    });

    this.addMapping({
      source: 'scroll',
      target: 'chaos',
      factor: 0.0005,
      offset: 0.2,
      smoothing: 0.05,
      clamp: [0, 1]
    });

    this.addMapping({
      source: 'scroll',
      target: 'rot4dZW',
      factor: 0.0002,
      offset: 0,
      smoothing: 0.12,
      clamp: [-Math.PI / 2, Math.PI / 2]
    });

    // Click-driven mappings
    this.addMapping({
      source: 'click',
      target: 'glitch',
      factor: 0.3,
      offset: 0.05,
      smoothing: 0.02,
      clamp: [0, 0.5]
    });

    this.addMapping({
      source: 'click',
      target: 'chromaShift',
      factor: 0.15,
      offset: 0.05,
      smoothing: 0.03,
      clamp: [0, 0.2]
    });

    // Focus-driven mappings
    this.addMapping({
      source: 'focus',
      target: 'density',
      factor: 0.5,
      offset: 0.3,
      smoothing: 0.15,
      clamp: [0, 1]
    });

    this.addMapping({
      source: 'focus',
      target: 'perspectiveFactor',
      factor: 0.5,
      offset: 1.0,
      smoothing: 0.1,
      clamp: [0.5, 2]
    });

    // Time-driven mappings
    this.addMapping({
      source: 'time',
      target: 'beatPhase',
      factor: 1,
      offset: 0,
      smoothing: 0,
      clamp: [0, 1]
    });

    this.addMapping({
      source: 'time',
      target: 'hue',
      factor: 0.1,
      offset: 0.5,
      smoothing: 0.2,
      clamp: [0, 1]
    });
  }

  private initialize() {
    this.startUpdateLoop();
    this.injectStyles();
    this.publishToWindow();
    this.listenToMotionTelemetry();
  }

  private listenToMotionTelemetry() {
    window.addEventListener('motionTelemetry', (event: CustomEvent<MotionTelemetry>) => {
      const telemetry = event.detail;

      // Update synergy parameters from telemetry
      this.parameters.groupSynergy = telemetry.globalFocus;
      this.parameters.supportWeight = telemetry.globalBend;
      this.parameters.focusGradient = Math.abs(telemetry.globalTilt);
      this.parameters.ambientLevel = 0.3 + telemetry.globalWarp * 0.4;
    });
  }

  private startUpdateLoop() {
    const loop = () => {
      this.updateParameters();
      this.applySmoothing();
      this.broadcastParameters();
      this.updateCanvases();
      this.rafId = requestAnimationFrame(loop);
    };
    loop();
  }

  private updateParameters() {
    const telemetry = globalMotion.getTelemetry();
    const currentTime = performance.now();
    const elapsed = (currentTime - this.startTime) / 1000;

    // Update beat clock
    this.beatClock = (this.beatClock + 16 / this.beatInterval) % 1;

    // Apply mappings
    this.mappings.forEach(mapping => {
      let sourceValue = 0;

      switch (mapping.source) {
        case 'pointer':
          sourceValue = Math.hypot(telemetry.pointerX, telemetry.pointerY);
          break;
        case 'scroll':
          sourceValue = telemetry.scrollMomentum;
          break;
        case 'click':
          sourceValue = telemetry.clickEnergy;
          break;
        case 'hover':
          sourceValue = telemetry.hoverTarget ? 1 : 0;
          break;
        case 'focus':
          sourceValue = telemetry.globalFocus;
          break;
        case 'time':
          sourceValue = mapping.target === 'beatPhase' ? this.beatClock :
                       Math.sin(elapsed * 0.5) * 0.5 + 0.5;
          break;
      }

      const targetValue = sourceValue * mapping.factor + mapping.offset;
      const clampedValue = Math.max(mapping.clamp[0], Math.min(mapping.clamp[1], targetValue));

      this.parameters[mapping.target] = clampedValue;
    });

    // Apply 4D rotations from pointer position
    if (telemetry.pointerX !== 0 || telemetry.pointerY !== 0) {
      this.parameters.rot4dXW = telemetry.pointerY * Math.PI / 4;
      this.parameters.rot4dYW = telemetry.pointerX * Math.PI / 4;
    }
  }

  private applySmoothing() {
    // Smooth all parameters
    Object.keys(this.parameters).forEach(key => {
      const paramKey = key as keyof VIB34DParameters;
      const mapping = this.mappings.find(m => m.target === paramKey);
      const smoothing = mapping?.smoothing || 0.1;

      this.smoothedParams[paramKey] = this.lerp(
        this.smoothedParams[paramKey] as number,
        this.parameters[paramKey] as number,
        smoothing
      );
    });
  }

  private lerp(current: number, target: number, factor: number): number {
    return current + (target - current) * factor;
  }

  private broadcastParameters() {
    // Publish CSS variables
    const root = document.documentElement;

    Object.entries(this.smoothedParams).forEach(([key, value]) => {
      const cssName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--vib34d-${cssName}`, `${value}`);
    });

    // Calculate derived values
    const intensity = (this.smoothedParams.density + this.smoothedParams.morph) / 2;
    const activity = this.smoothedParams.chaos * this.smoothedParams.timeScale;
    const distortion = this.smoothedParams.glitch + this.smoothedParams.chromaShift;

    root.style.setProperty('--vib34d-intensity', `${intensity}`);
    root.style.setProperty('--vib34d-activity', `${activity}`);
    root.style.setProperty('--vib34d-distortion', `${distortion}`);

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('vib34dParameters', {
      detail: this.smoothedParams
    }));
  }

  private updateCanvases() {
    // Update WebGL uniforms for registered canvases
    this.canvases.forEach((canvas, id) => {
      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
      if (!gl) return;

      // Assuming shader programs are already set up
      // This would update uniforms in real implementation
      const updateUniform = (name: string, value: number) => {
        const location = this.uniforms.get(`${id}_${name}`);
        if (location) {
          gl.uniform1f(location, value);
        }
      };

      // Update all parameter uniforms
      Object.entries(this.smoothedParams).forEach(([key, value]) => {
        updateUniform(`u${key.charAt(0).toUpperCase() + key.slice(1)}`, value as number);
      });
    });
  }

  private injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* VIB34D Interaction Engine Styles */
      :root {
        /* Core parameters */
        --vib34d-hue: 0.5;
        --vib34d-density: 0.5;
        --vib34d-morph: 0.5;
        --vib34d-chaos: 0.2;
        --vib34d-noise-freq: 2;
        --vib34d-glitch: 0.05;
        --vib34d-disp-amp: 0.2;
        --vib34d-chroma-shift: 0.05;
        --vib34d-time-scale: 1;
        --vib34d-beat-phase: 0;

        /* 4D parameters */
        --vib34d-rot4d-xw: 0;
        --vib34d-rot4d-yw: 0;
        --vib34d-rot4d-zw: 0;
        --vib34d-perspective-factor: 1;

        /* Synergy parameters */
        --vib34d-group-synergy: 0.5;
        --vib34d-support-weight: 0.5;
        --vib34d-focus-gradient: 0.5;
        --vib34d-ambient-level: 0.3;

        /* Derived values */
        --vib34d-intensity: 0.5;
        --vib34d-activity: 0.2;
        --vib34d-distortion: 0.1;
      }

      /* Holographic canvas reactions */
      .vib34d-canvas {
        filter:
          hue-rotate(calc(var(--vib34d-hue) * 360deg))
          saturate(calc(1 + var(--vib34d-intensity) * 0.5))
          contrast(calc(1 + var(--vib34d-chaos) * 0.2));

        transform:
          perspective(calc(1000px / var(--vib34d-perspective-factor)))
          rotateX(calc(var(--vib34d-rot4d-xw) * 1rad))
          rotateY(calc(var(--vib34d-rot4d-yw) * 1rad))
          scale(calc(1 + var(--vib34d-morph) * 0.1));

        opacity: calc(0.7 + var(--vib34d-density) * 0.3);
        mix-blend-mode: screen;
      }

      /* Glitch distortion overlay */
      .vib34d-glitch {
        animation: vib34d-glitch calc(1s / var(--vib34d-time-scale)) steps(10) infinite;
        animation-play-state: running;
        opacity: var(--vib34d-glitch);
      }

      @keyframes vib34d-glitch {
        0%, 90% { transform: translate(0); }
        91% { transform: translate(calc(var(--vib34d-glitch) * 5px), 0); }
        92% { transform: translate(calc(var(--vib34d-glitch) * -3px), calc(var(--vib34d-glitch) * 2px)); }
        93% { transform: translate(calc(var(--vib34d-glitch) * 2px), calc(var(--vib34d-glitch) * -1px)); }
        94% { transform: translate(calc(var(--vib34d-glitch) * -4px), 0); }
        100% { transform: translate(0); }
      }

      /* Beat pulse */
      .vib34d-beat {
        animation: vib34d-beat 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        animation-delay: calc(var(--vib34d-beat-phase) * -2s);
      }

      @keyframes vib34d-beat {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(calc(1 + var(--vib34d-intensity) * 0.05)); }
      }
    `;
    document.head.appendChild(style);
  }

  private publishToWindow() {
    (window as any).__VIB34D_PARAMETERS = this.smoothedParams;
    (window as any).__VIB34D_ENGINE = this;
  }

  // Public API
  public addMapping(mapping: InteractionMapping): void {
    this.mappings.push(mapping);
  }

  public removeMapping(target: keyof VIB34DParameters): void {
    this.mappings = this.mappings.filter(m => m.target !== target);
  }

  public registerCanvas(id: string, canvas: HTMLCanvasElement): void {
    this.canvases.set(id, canvas);
    canvas.classList.add('vib34d-canvas');
  }

  public unregisterCanvas(id: string): void {
    this.canvases.delete(id);
  }

  public getParameters(): VIB34DParameters {
    return { ...this.smoothedParams };
  }

  public setParameter(key: keyof VIB34DParameters, value: number): void {
    this.parameters[key] = value;
  }

  public setBeatInterval(ms: number): void {
    this.beatInterval = ms;
  }

  public destroy(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    this.canvases.clear();
    this.uniforms.clear();
  }
}

// Auto-initialize
export const vib34dEngine = new VIB34DInteractionEngine();