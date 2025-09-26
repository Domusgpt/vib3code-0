/**
 * Global Motion Telemetry System
 * Inspired by Clear Seas Solutions' card synergy choreography
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 *
 * Broadcasts ranked group synergy cues and global bend telemetry
 * Coordinates visibility-driven card synergy across the entire page
 */

export interface MotionTelemetry {
  // Global motion signals
  globalFocus: number;      // 0-1 overall focus intensity
  globalTilt: number;       // -1 to 1 tilt direction
  globalBend: number;       // 0-1 bend/warp amount
  globalWarp: number;       // 0-1 distortion intensity
  scrollVelocity: number;   // Current scroll speed
  scrollMomentum: number;   // Smoothed scroll momentum

  // Per-group telemetry
  groupFocus: Record<string, number>;     // Focus per group ID
  groupSupport: Record<string, number>;   // Support weight per group
  groupDistance: Record<string, number>;  // Distance from focus

  // Ranked groups for synergy
  rankedGroups: string[];                 // Groups ordered by activity
  primaryGroup: string | null;            // Most active group
  supportGroups: string[];                // Supporting groups

  // Interaction signals
  pointerX: number;         // Normalized pointer X (-1 to 1)
  pointerY: number;         // Normalized pointer Y (-1 to 1)
  clickEnergy: number;      // Click burst energy (0-1)
  hoverTarget: string | null; // Current hover element ID
}

export interface CardState {
  id: string;
  groupId: string;
  visible: boolean;
  focusLevel: number;       // 0-1 focus intensity
  supportLevel: number;     // 0-1 support role weight
  distance: number;         // Distance from primary
  tiltBias: number;         // Card-specific tilt preference
  accentHue: number;        // Card accent color
  bendResponse: number;     // Response to global bend
}

export interface BrandAsset {
  id: string;
  type: 'image' | 'video' | 'canvas';
  url: string;
  palette: {
    primary: string;
    accent: string;
    glow: string;
  };
  tiltBias: number;         // -1 to 1 preferred tilt
  playbackRange?: [number, number]; // For videos
  tags: string[];
}

export class GlobalMotionTelemetry {
  private telemetry: MotionTelemetry;
  private cards: Map<string, CardState> = new Map();
  private brandAssets: Map<string, BrandAsset> = new Map();
  private observers: Map<string, IntersectionObserver> = new Map();
  private rafId: number | null = null;
  private lastScrollTime = 0;
  private lastScrollY = 0;

  // Smoothing factors
  private readonly MOMENTUM_DECAY = 0.95;
  private readonly TILT_SMOOTHING = 0.1;
  private readonly FOCUS_SMOOTHING = 0.15;
  private readonly BEND_SMOOTHING = 0.08;

  constructor() {
    this.telemetry = this.createInitialTelemetry();
    this.initialize();
  }

  private createInitialTelemetry(): MotionTelemetry {
    return {
      globalFocus: 0,
      globalTilt: 0,
      globalBend: 0,
      globalWarp: 0,
      scrollVelocity: 0,
      scrollMomentum: 0,
      groupFocus: {},
      groupSupport: {},
      groupDistance: {},
      rankedGroups: [],
      primaryGroup: null,
      supportGroups: [],
      pointerX: 0,
      pointerY: 0,
      clickEnergy: 0,
      hoverTarget: null,
    };
  }

  private initialize() {
    this.setupEventListeners();
    this.startTelemetryLoop();
    this.injectGlobalStyles();
    this.publishToWindow();
  }

  private setupEventListeners() {
    // Scroll tracking
    let scrollTimer: number;
    window.addEventListener('scroll', () => {
      const now = performance.now();
      const scrollY = window.scrollY;
      const deltaTime = Math.max(1, now - this.lastScrollTime);
      const deltaScroll = scrollY - this.lastScrollY;

      this.telemetry.scrollVelocity = deltaScroll / deltaTime;
      this.lastScrollTime = now;
      this.lastScrollY = scrollY;

      // Clear momentum decay timer
      clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        this.telemetry.scrollVelocity = 0;
      }, 100);
    }, { passive: true });

    // Pointer tracking
    window.addEventListener('pointermove', (e) => {
      this.telemetry.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      this.telemetry.pointerY = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    // Click energy
    window.addEventListener('click', () => {
      this.telemetry.clickEnergy = 1;
      setTimeout(() => {
        this.telemetry.clickEnergy = 0;
      }, 300);
    });

    // Hover tracking
    document.addEventListener('mouseenter', (e) => {
      const target = e.target as HTMLElement;
      if (target.dataset.cardId) {
        this.telemetry.hoverTarget = target.dataset.cardId;
      }
    }, true);

    document.addEventListener('mouseleave', (e) => {
      const target = e.target as HTMLElement;
      if (target.dataset.cardId === this.telemetry.hoverTarget) {
        this.telemetry.hoverTarget = null;
      }
    }, true);
  }

  private startTelemetryLoop() {
    const loop = () => {
      this.updateTelemetry();
      this.broadcastTelemetry();
      this.rafId = requestAnimationFrame(loop);
    };
    loop();
  }

  private updateTelemetry() {
    // Update scroll momentum with decay
    this.telemetry.scrollMomentum =
      this.telemetry.scrollMomentum * this.MOMENTUM_DECAY +
      this.telemetry.scrollVelocity * (1 - this.MOMENTUM_DECAY);

    // Calculate global tilt from scroll and pointer
    const scrollTilt = Math.tanh(this.telemetry.scrollMomentum * 0.001);
    const pointerTilt = this.telemetry.pointerX * 0.3;
    this.telemetry.globalTilt = this.smoothValue(
      this.telemetry.globalTilt,
      scrollTilt + pointerTilt,
      this.TILT_SMOOTHING
    );

    // Calculate global bend from interaction energy
    const targetBend = Math.abs(this.telemetry.scrollMomentum * 0.0005) +
                      Math.abs(this.telemetry.pointerY) * 0.2 +
                      this.telemetry.clickEnergy * 0.3;
    this.telemetry.globalBend = this.smoothValue(
      this.telemetry.globalBend,
      Math.min(1, targetBend),
      this.BEND_SMOOTHING
    );

    // Update global warp based on combined factors
    this.telemetry.globalWarp =
      Math.sin(performance.now() * 0.0001) * 0.1 +
      this.telemetry.globalBend * 0.3;

    // Update card states and calculate group metrics
    this.updateCardStates();
    this.calculateGroupSynergy();
    this.rankGroups();
  }

  private smoothValue(current: number, target: number, factor: number): number {
    return current + (target - current) * factor;
  }

  private updateCardStates() {
    // Update visibility and focus for each card
    this.cards.forEach(card => {
      // Calculate focus based on hover and proximity
      const isHovered = card.id === this.telemetry.hoverTarget;
      const targetFocus = isHovered ? 1 : card.visible ? 0.3 : 0;

      card.focusLevel = this.smoothValue(
        card.focusLevel,
        targetFocus,
        this.FOCUS_SMOOTHING
      );

      // Calculate support level based on group relationship
      if (this.telemetry.primaryGroup) {
        if (card.groupId === this.telemetry.primaryGroup) {
          card.supportLevel = 1;
        } else if (this.telemetry.supportGroups.includes(card.groupId)) {
          card.supportLevel = 0.5;
        } else {
          card.supportLevel = 0.1;
        }
      }

      // Calculate bend response
      card.bendResponse = this.telemetry.globalBend * (1 + card.tiltBias * 0.3);
    });

    // Update global focus
    const maxFocus = Math.max(...Array.from(this.cards.values()).map(c => c.focusLevel));
    this.telemetry.globalFocus = this.smoothValue(
      this.telemetry.globalFocus,
      maxFocus,
      this.FOCUS_SMOOTHING
    );
  }

  private calculateGroupSynergy() {
    // Reset group metrics
    this.telemetry.groupFocus = {};
    this.telemetry.groupSupport = {};
    this.telemetry.groupDistance = {};

    // Calculate per-group metrics
    const groups = new Map<string, CardState[]>();

    this.cards.forEach(card => {
      if (!groups.has(card.groupId)) {
        groups.set(card.groupId, []);
      }
      groups.get(card.groupId)!.push(card);
    });

    groups.forEach((cards, groupId) => {
      // Average focus for the group
      const avgFocus = cards.reduce((sum, c) => sum + c.focusLevel, 0) / cards.length;
      this.telemetry.groupFocus[groupId] = avgFocus;

      // Support weight
      const avgSupport = cards.reduce((sum, c) => sum + c.supportLevel, 0) / cards.length;
      this.telemetry.groupSupport[groupId] = avgSupport;

      // Distance from primary (if exists)
      if (this.telemetry.primaryGroup) {
        const distance = groupId === this.telemetry.primaryGroup ? 0 :
          this.telemetry.supportGroups.indexOf(groupId) !== -1 ?
          (this.telemetry.supportGroups.indexOf(groupId) + 1) * 0.3 : 1;
        this.telemetry.groupDistance[groupId] = distance;
      }
    });
  }

  private rankGroups() {
    // Rank groups by combined activity score
    const groupScores = Object.entries(this.telemetry.groupFocus)
      .map(([id, focus]) => ({
        id,
        score: focus + (this.telemetry.groupSupport[id] || 0) * 0.5
      }))
      .sort((a, b) => b.score - a.score);

    this.telemetry.rankedGroups = groupScores.map(g => g.id);
    this.telemetry.primaryGroup = groupScores[0]?.id || null;
    this.telemetry.supportGroups = groupScores.slice(1, 4).map(g => g.id);
  }

  private broadcastTelemetry() {
    // Publish CSS variables
    const root = document.documentElement;

    // Global motion variables
    root.style.setProperty('--global-focus', `${this.telemetry.globalFocus}`);
    root.style.setProperty('--global-tilt', `${this.telemetry.globalTilt}`);
    root.style.setProperty('--global-bend', `${this.telemetry.globalBend}`);
    root.style.setProperty('--global-warp', `${this.telemetry.globalWarp}`);
    root.style.setProperty('--scroll-velocity', `${this.telemetry.scrollVelocity}`);
    root.style.setProperty('--scroll-momentum', `${this.telemetry.scrollMomentum}`);
    root.style.setProperty('--pointer-x', `${this.telemetry.pointerX}`);
    root.style.setProperty('--pointer-y', `${this.telemetry.pointerY}`);
    root.style.setProperty('--click-energy', `${this.telemetry.clickEnergy}`);

    // Ranked group variables
    this.telemetry.rankedGroups.forEach((groupId, index) => {
      root.style.setProperty(`--group-${index}-id`, groupId);
      root.style.setProperty(`--group-${index}-focus`, `${this.telemetry.groupFocus[groupId] || 0}`);
      root.style.setProperty(`--group-${index}-support`, `${this.telemetry.groupSupport[groupId] || 0}`);
      root.style.setProperty(`--group-${index}-distance`, `${this.telemetry.groupDistance[groupId] || 1}`);
    });

    // Card-specific variables
    this.cards.forEach(card => {
      const element = document.querySelector(`[data-card-id="${card.id}"]`) as HTMLElement;
      if (element) {
        element.style.setProperty('--card-focus', `${card.focusLevel}`);
        element.style.setProperty('--card-support', `${card.supportLevel}`);
        element.style.setProperty('--card-distance', `${card.distance}`);
        element.style.setProperty('--card-tilt-bias', `${card.tiltBias}`);
        element.style.setProperty('--card-bend-response', `${card.bendResponse}`);
        element.style.setProperty('--card-accent-hue', `${card.accentHue}`);
      }
    });

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('motionTelemetry', {
      detail: this.telemetry
    }));
  }

  private publishToWindow() {
    // Make telemetry available globally
    (window as any).__VIBE3CODE_GLOBAL_MOTION = this.telemetry;
    (window as any).__VIBE3CODE_MOTION_SYSTEM = this;
  }

  private injectGlobalStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Global Motion Telemetry Styles */
      :root {
        --global-focus: 0;
        --global-tilt: 0;
        --global-bend: 0;
        --global-warp: 0;
        --scroll-velocity: 0;
        --scroll-momentum: 0;
        --pointer-x: 0;
        --pointer-y: 0;
        --click-energy: 0;
      }

      /* Card synergy transforms */
      [data-card-id] {
        --card-transform:
          rotateY(calc(var(--global-tilt) * 10deg * var(--card-tilt-bias)))
          rotateX(calc(var(--pointer-y) * 5deg))
          scale(calc(1 + var(--card-focus) * 0.05))
          translateZ(calc(var(--card-support) * 20px));

        transform: var(--card-transform);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Global bend distortion */
      body::after {
        content: '';
        position: fixed;
        inset: 0;
        pointer-events: none;
        background: radial-gradient(
          circle at calc(50% + var(--pointer-x) * 20%),
          transparent calc(40% - var(--global-bend) * 20%),
          rgba(var(--accent-rgb), calc(var(--global-bend) * 0.1)) 100%
        );
        mix-blend-mode: screen;
        z-index: 9999;
      }

      /* Scroll momentum backdrop */
      .background-canvas {
        transform:
          translateY(calc(var(--scroll-momentum) * -0.5px))
          skewY(calc(var(--scroll-velocity) * 0.01deg));
      }

      /* Group synergy glow */
      [data-group-id] {
        --group-glow:
          0 0 calc(var(--global-focus) * 40px)
          rgba(var(--accent-rgb), calc(var(--card-support) * 0.3));

        box-shadow: var(--group-glow);
      }
    `;
    document.head.appendChild(style);
  }

  // Public API
  public registerCard(card: CardState): void {
    this.cards.set(card.id, card);
    this.setupVisibilityObserver(card.id);
  }

  public unregisterCard(cardId: string): void {
    this.cards.delete(cardId);
    const observer = this.observers.get(cardId);
    if (observer) {
      observer.disconnect();
      this.observers.delete(cardId);
    }
  }

  public registerBrandAsset(asset: BrandAsset): void {
    this.brandAssets.set(asset.id, asset);
  }

  private setupVisibilityObserver(cardId: string) {
    const element = document.querySelector(`[data-card-id="${cardId}"]`);
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const card = this.cards.get(cardId);
          if (card) {
            card.visible = entry.isIntersecting;
            card.distance = 1 - entry.intersectionRatio;
          }
        });
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    observer.observe(element);
    this.observers.set(cardId, observer);
  }

  public getTelemetry(): MotionTelemetry {
    return { ...this.telemetry };
  }

  public destroy(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.cards.clear();
    this.brandAssets.clear();
  }
}

// Auto-initialize on import
export const globalMotion = new GlobalMotionTelemetry();