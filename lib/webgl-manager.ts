/**
 * VIB3CODE-0 WebGL Context Manager
 * 
 * Smart choreography system for canvas loading/destruction
 * - Maximum 2-4 active WebGL contexts at any time
 * - Intelligent preloading and cleanup based on section visibility
 * - Event-driven lifecycle management
 */

export interface CanvasInstance {
  id: string;
  sectionId: string;
  layerType: 'background' | 'shadow' | 'content' | 'highlight' | 'accent';
  canvas?: HTMLCanvasElement;
  context?: WebGLRenderingContext | WebGL2RenderingContext;
  isActive: boolean;
  isLoading: boolean;
  priority: number; // Higher = more important
  lastUsed: number;
}

export interface WebGLManagerEvents {
  onCanvasLoad: (instance: CanvasInstance) => void;
  onCanvasDestroy: (instance: CanvasInstance) => void;
  onContextLost: (instance: CanvasInstance) => void;
  onContextRestored: (instance: CanvasInstance) => void;
  onMaxContextsReached: (activeCount: number) => void;
}

class WebGLContextManager {
  private static instance: WebGLContextManager;
  private contexts: Map<string, CanvasInstance> = new Map();
  private activeContexts: Set<string> = new Set();
  private activeSections: Set<string> = new Set();
  private loadingQueue: string[] = [];
  private maxActiveContexts = 4;
  private events: Partial<WebGLManagerEvents> = {};
  
  // Priority weights for different layer types
  private readonly LAYER_PRIORITIES = {
    content: 10,     // Most important - main visuals
    background: 8,   // Important for depth
    highlight: 6,    // Interactive feedback
    accent: 4,       // Complementary effects
    shadow: 2,       // Least critical - can be skipped
  };

  private constructor() {
    this.bindEvents();
  }

  static getInstance(): WebGLContextManager {
    if (!WebGLContextManager.instance) {
      WebGLContextManager.instance = new WebGLContextManager();
    }
    return WebGLContextManager.instance;
  }

  /**
   * SMART CHOREOGRAPHY: Register canvas for management
   */
  registerCanvas(
    sectionId: string, 
    layerType: CanvasInstance['layerType'], 
    canvas: HTMLCanvasElement
  ): string {
    const id = `${sectionId}-${layerType}`;
    const priority = this.calculatePriority(sectionId, layerType);
    
    const instance: CanvasInstance = {
      id,
      sectionId,
      layerType,
      canvas,
      isActive: false,
      isLoading: false,
      priority,
      lastUsed: Date.now(),
    };

    this.contexts.set(id, instance);
    this.bindCanvasEvents(instance);
    
    // Smart loading decision
    this.evaluateLoadingNeeds();
    
    return id;
  }

  /**
   * SECTION VISIBILITY CHOREOGRAPHY
   */
  setSectionActive(sectionId: string, isActive: boolean): void {
    // Update active sections tracking
    if (isActive) {
      this.activeSections.add(sectionId);
    } else {
      this.activeSections.delete(sectionId);
    }

    const sectionCanvases = Array.from(this.contexts.values())
      .filter(ctx => ctx.sectionId === sectionId);

    if (isActive) {
      console.log(`[WebGL Manager] Activating section: ${sectionId}`);
      // Load section canvases with priority order
      sectionCanvases
        .sort((a, b) => b.priority - a.priority)
        .forEach(instance => {
          this.requestCanvasLoad(instance.id);
        });
    } else {
      console.log(`[WebGL Manager] Deactivating section: ${sectionId}`);
      // Unload section canvases (but keep in memory for quick reactivation)
      sectionCanvases.forEach(instance => {
        this.scheduleCanvasUnload(instance.id, 2000); // 2s delay for smooth transitions
      });
    }
    
    // Re-evaluate loading needs after section change
    this.evaluateLoadingNeeds();
  }

  /**
   * SMART LOADING WITH CONTEXT LIMITS
   */
  private async requestCanvasLoad(canvasId: string): Promise<void> {
    const instance = this.contexts.get(canvasId);
    if (!instance || instance.isActive || instance.isLoading) return;

    // Check context limits
    if (this.activeContexts.size >= this.maxActiveContexts) {
      await this.freeLowestPriorityContext();
    }

    instance.isLoading = true;
    this.loadingQueue.push(canvasId);
    
    try {
      await this.loadCanvas(instance);
      this.events.onCanvasLoad?.(instance);
    } catch (error) {
      console.warn(`[WebGL Manager] Failed to load canvas ${canvasId}:`, error);
      instance.isLoading = false;
    }
  }

  /**
   * INTELLIGENT CONTEXT CLEANUP
   */
  private async freeLowestPriorityContext(): Promise<void> {
    const activeInstances = Array.from(this.activeContexts)
      .map(id => this.contexts.get(id)!)
      .filter(Boolean)
      .sort((a, b) => {
        // Sort by: priority (asc), lastUsed (asc)
        const priorityDiff = a.priority - b.priority;
        if (priorityDiff !== 0) return priorityDiff;
        return a.lastUsed - b.lastUsed;
      });

    if (activeInstances.length > 0) {
      const victim = activeInstances[0];
      await this.destroyCanvas(victim.id);
      console.log(`[WebGL Manager] Freed context: ${victim.id} (priority: ${victim.priority})`);
    }
  }

  /**
   * CANVAS LOADING WITH ERROR HANDLING
   */
  private async loadCanvas(instance: CanvasInstance): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!instance.canvas) {
        reject(new Error('Canvas element not found'));
        return;
      }

      try {
        // Try WebGL2 first, fallback to WebGL1
        const context = instance.canvas.getContext('webgl2', {
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: false,
        }) || instance.canvas.getContext('webgl', {
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance', 
          preserveDrawingBuffer: false,
        });

        if (!context) {
          reject(new Error('WebGL not supported'));
          return;
        }

        instance.context = context;
        instance.isActive = true;
        instance.isLoading = false;
        instance.lastUsed = Date.now();
        
        this.activeContexts.add(instance.id);
        
        // Remove from loading queue
        const queueIndex = this.loadingQueue.indexOf(instance.id);
        if (queueIndex > -1) {
          this.loadingQueue.splice(queueIndex, 1);
        }

        resolve();
      } catch (error) {
        instance.isLoading = false;
        reject(error);
      }
    });
  }

  /**
   * GRACEFUL CANVAS DESTRUCTION
   */
  private async destroyCanvas(canvasId: string): Promise<void> {
    const instance = this.contexts.get(canvasId);
    if (!instance || !instance.isActive) return;

    this.events.onCanvasDestroy?.(instance);

    // Graceful WebGL cleanup
    if (instance.context) {
      const gl = instance.context;
      
      // Clean up WebGL resources
      const numTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
      for (let unit = 0; unit < numTextureUnits; ++unit) {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
      }
      
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      
      // Lose context gracefully
      const loseContext = gl.getExtension('WEBGL_lose_context');
      if (loseContext) {
        loseContext.loseContext();
      }
    }

    instance.context = undefined;
    instance.isActive = false;
    this.activeContexts.delete(canvasId);
  }

  /**
   * DELAYED UNLOADING FOR SMOOTH TRANSITIONS
   */
  private scheduleCanvasUnload(canvasId: string, delay: number = 0): void {
    setTimeout(() => {
      const instance = this.contexts.get(canvasId);
      if (instance && instance.isActive) {
        // Check if section is still inactive
        const sectionStillInactive = !this.isSectionActive(instance.sectionId);
        if (sectionStillInactive) {
          this.destroyCanvas(canvasId);
        }
      }
    }, delay);
  }

  /**
   * PRIORITY CALCULATION
   */
  private calculatePriority(sectionId: string, layerType: CanvasInstance['layerType']): number {
    let priority = this.LAYER_PRIORITIES[layerType];
    
    // Boost priority for home section
    if (sectionId === 'home') {
      priority += 2;
    }
    
    // Boost priority for currently focused section
    if (this.isSectionActive(sectionId)) {
      priority += 3;
    }
    
    return priority;
  }

  /**
   * CONTEXT EVALUATION AND SMART LOADING
   */
  private evaluateLoadingNeeds(): void {
    // Get all instances sorted by priority
    const instances = Array.from(this.contexts.values())
      .sort((a, b) => b.priority - a.priority);

    // Load highest priority contexts up to limit
    const slotsAvailable = this.maxActiveContexts - this.activeContexts.size;
    const candidatesForLoading = instances
      .filter(instance => !instance.isActive && !instance.isLoading)
      .slice(0, slotsAvailable);

    candidatesForLoading.forEach(instance => {
      if (this.shouldLoadCanvas(instance)) {
        this.requestCanvasLoad(instance.id);
      }
    });
  }

  /**
   * LOADING HEURISTICS
   */
  private shouldLoadCanvas(instance: CanvasInstance): boolean {
    // Always load content layers for active sections
    if (instance.layerType === 'content' && this.isSectionActive(instance.sectionId)) {
      return true;
    }
    
    // Load background for visual continuity
    if (instance.layerType === 'background' && this.isSectionActive(instance.sectionId)) {
      return true;
    }
    
    // Load highlight layers for interactivity
    if (instance.layerType === 'highlight' && this.isSectionActive(instance.sectionId)) {
      return true;
    }
    
    // Skip shadow and accent layers if resources are constrained
    if (this.activeContexts.size >= 3 && ['shadow', 'accent'].includes(instance.layerType)) {
      return false;
    }
    
    return this.isSectionActive(instance.sectionId);
  }

  /**
   * SECTION STATE HELPERS
   */
  private isSectionActive(sectionId: string): boolean {
    return this.activeSections.has(sectionId);
  }

  /**
   * EVENT BINDING
   */
  private bindEvents(): void {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAllContexts();
      } else {
        this.resumeActiveContexts();
      }
    });

    // Handle memory pressure
    if ('memory' in performance) {
      setInterval(() => {
        const memInfo = (performance as any).memory;
        if (memInfo.usedJSHeapSize > memInfo.totalJSHeapSize * 0.9) {
          this.emergencyCleanup();
        }
      }, 5000);
    }
  }

  private bindCanvasEvents(instance: CanvasInstance): void {
    if (!instance.canvas) return;

    // Context lost/restored events
    instance.canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      console.warn(`[WebGL Manager] Context lost: ${instance.id}`);
      this.events.onContextLost?.(instance);
      this.activeContexts.delete(instance.id);
    });

    instance.canvas.addEventListener('webglcontextrestored', () => {
      console.log(`[WebGL Manager] Context restored: ${instance.id}`);
      this.events.onContextRestored?.(instance);
      this.requestCanvasLoad(instance.id);
    });
  }

  /**
   * EMERGENCY CLEANUP
   */
  private emergencyCleanup(): void {
    console.warn('[WebGL Manager] Emergency cleanup triggered');
    
    // Keep only the most important contexts
    const instances = Array.from(this.activeContexts)
      .map(id => this.contexts.get(id)!)
      .filter(Boolean)
      .sort((a, b) => a.priority - b.priority);

    // Destroy lowest priority contexts
    const toDestroy = instances.slice(0, -2); // Keep top 2
    toDestroy.forEach(instance => {
      this.destroyCanvas(instance.id);
    });
  }

  /**
   * PAUSE/RESUME FOR PERFORMANCE
   */
  private pauseAllContexts(): void {
    // Pause rendering loops, reduce GPU usage
    this.activeContexts.forEach(id => {
      const instance = this.contexts.get(id);
      if (instance?.canvas) {
        instance.canvas.style.opacity = '0.3';
      }
    });
  }

  private resumeActiveContexts(): void {
    this.activeContexts.forEach(id => {
      const instance = this.contexts.get(id);
      if (instance?.canvas) {
        instance.canvas.style.opacity = '1';
      }
    });
  }

  /**
   * PUBLIC API
   */
  public setMaxContexts(max: number): void {
    this.maxActiveContexts = Math.max(1, Math.min(max, 8));
  }

  public getActiveContextCount(): number {
    return this.activeContexts.size;
  }

  public getContextInfo(): { active: number, total: number, loading: number } {
    return {
      active: this.activeContexts.size,
      total: this.contexts.size,
      loading: this.loadingQueue.length,
    };
  }

  public addEventListener<K extends keyof WebGLManagerEvents>(
    event: K,
    handler: WebGLManagerEvents[K]
  ): void {
    this.events[event] = handler;
  }

  public destroy(): void {
    // Clean up all contexts
    Array.from(this.activeContexts).forEach(id => {
      this.destroyCanvas(id);
    });
    
    this.contexts.clear();
    this.activeContexts.clear();
    this.loadingQueue.length = 0;
  }
}

export const webglManager = WebGLContextManager.getInstance();