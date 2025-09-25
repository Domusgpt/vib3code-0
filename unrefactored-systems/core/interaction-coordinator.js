/**
 * VIB34D Universal Interaction Coordinator
 * 
 * Implements standardized hover/click response patterns:
 * - Hover/Touch: Target density 2x up, others 0.5x down
 * - Click: Full color and variable inversion
 * - Mathematical coordination between all visualizers
 */

class VIB34DInteractionCoordinator {
    constructor(visualizerInstances = []) {
        this.visualizers = visualizerInstances;
        this.activeTarget = null;
        this.inversionState = false;
        this.inversionTimer = null;
        
        // Interaction state tracking
        this.interactionState = {
            hovering: false,
            clicking: false,
            scrolling: false,
            idle: true
        };
        
        // Initialize interaction handlers
        this.initializeInteractionHandlers();
        
        // Store base parameters for reset capability
        this.baseParameters = new Map();
        this.storeBaseParameters();
    }
    
    /**
     * Store original parameters for each visualizer
     */
    storeBaseParameters() {
        this.visualizers.forEach((visualizer, index) => {
            if (visualizer && visualizer.config) {
                this.baseParameters.set(index, {
                    gridDensity: visualizer.config.gridDensity,
                    colorIntensity: visualizer.config.colorIntensity,
                    reactivity: visualizer.config.reactivity,
                    depth: visualizer.config.depth || 0,
                    speed: visualizer.config.speed,
                    colors: [...visualizer.config.colors]
                });
            }
        });
    }
    
    /**
     * Initialize global interaction event handlers
     */
    initializeInteractionHandlers() {
        // Mouse/touch hover handlers
        document.addEventListener('mouseover', this.handleHoverStart.bind(this));
        document.addEventListener('mouseout', this.handleHoverEnd.bind(this));
        
        // Touch equivalents
        document.addEventListener('touchstart', this.handleTouchStart.bind(this));
        document.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // Click handlers
        document.addEventListener('click', this.handleClick.bind(this));
        
        // Scroll handlers
        document.addEventListener('scroll', this.handleScroll.bind(this));
        document.addEventListener('wheel', this.handleWheel.bind(this));
        
        // Idle detection
        this.idleTimer = null;
        this.resetIdleTimer();
        ['mousemove', 'click', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, this.resetIdleTimer.bind(this));
        });
    }
    
    /**
     * Handle hover start - implement density coordination
     */
    handleHoverStart(event) {
        const target = this.findVisualizerTarget(event.target);
        if (!target) return;
        
        this.interactionState.hovering = true;
        this.interactionState.idle = false;
        this.activeTarget = target;
        
        this.applyHoverResponse(target);
    }
    
    /**
     * Handle hover end - reset to base state
     */
    handleHoverEnd(event) {
        if (!this.interactionState.hovering) return;
        
        this.interactionState.hovering = false;
        this.activeTarget = null;
        
        this.resetToBaseState();
    }
    
    /**
     * Handle touch start (mobile hover equivalent)
     */
    handleTouchStart(event) {
        const target = this.findVisualizerTarget(event.target);
        if (!target) return;
        
        this.interactionState.hovering = true;
        this.interactionState.idle = false;
        this.activeTarget = target;
        
        this.applyHoverResponse(target);
    }
    
    /**
     * Handle touch end
     */
    handleTouchEnd(event) {
        this.interactionState.hovering = false;
        this.activeTarget = null;
        
        this.resetToBaseState();
    }
    
    /**
     * Handle click - implement color/variable inversion
     */
    handleClick(event) {
        this.interactionState.clicking = true;
        this.interactionState.idle = false;
        
        // Trigger reality inversion
        this.triggerRealityInversion();
        
        // Generate click feedback effects
        this.generateClickEffects(event.clientX, event.clientY);
        
        setTimeout(() => {
            this.interactionState.clicking = false;
        }, 100);
    }
    
    /**
     * Apply hover response pattern to all visualizers
     */
    applyHoverResponse(targetIndex) {
        this.visualizers.forEach((visualizer, index) => {
            if (!visualizer || !visualizer.config) return;
            
            const baseParams = this.baseParameters.get(index);
            if (!baseParams) return;
            
            if (index === targetIndex) {
                // Target visualizer: increase all parameters
                this.updateVisualizerParameters(visualizer, {
                    gridDensity: baseParams.gridDensity * 2.0,
                    colorIntensity: baseParams.colorIntensity * 1.5,
                    reactivity: baseParams.reactivity * 1.3,
                    depth: (baseParams.depth || 0) + 10,
                    glowIntensity: 1.5
                });
            } else {
                // Other visualizers: decrease parameters
                this.updateVisualizerParameters(visualizer, {
                    gridDensity: baseParams.gridDensity * 0.5,
                    colorIntensity: baseParams.colorIntensity * 0.8,
                    reactivity: baseParams.reactivity * 0.7,
                    depth: (baseParams.depth || 0) - 5,
                    glowIntensity: 0.6
                });
            }
        });
    }
    
    /**
     * Reset all visualizers to base state
     */
    resetToBaseState() {
        this.visualizers.forEach((visualizer, index) => {
            if (!visualizer || !visualizer.config) return;
            
            const baseParams = this.baseParameters.get(index);
            if (!baseParams) return;
            
            this.updateVisualizerParameters(visualizer, {
                gridDensity: baseParams.gridDensity,
                colorIntensity: baseParams.colorIntensity,
                reactivity: baseParams.reactivity,
                depth: baseParams.depth || 0,
                glowIntensity: 1.0
            });
        });
    }
    
    /**
     * Trigger reality inversion effect
     */
    triggerRealityInversion() {
        if (this.inversionTimer) {
            clearTimeout(this.inversionTimer);
        }
        
        this.inversionState = !this.inversionState;
        
        this.visualizers.forEach((visualizer, index) => {
            if (!visualizer || !visualizer.config) return;
            
            const baseParams = this.baseParameters.get(index);
            if (!baseParams) return;
            
            if (this.inversionState) {
                // Apply inversion
                this.updateVisualizerParameters(visualizer, {
                    colors: this.invertColorArray(baseParams.colors),
                    speed: -baseParams.speed, // Reverse animation direction
                    gridDensity: Math.max(32.0, 64.0 - baseParams.gridDensity), // Inverse density
                    colorIntensity: 2.0 - baseParams.colorIntensity, // Flip intensity
                    inverted: true
                });
            } else {
                // Return to normal
                this.updateVisualizerParameters(visualizer, {
                    colors: [...baseParams.colors],
                    speed: baseParams.speed,
                    gridDensity: baseParams.gridDensity,
                    colorIntensity: baseParams.colorIntensity,
                    inverted: false
                });
            }
        });
        
        // Sparkle effect generation
        this.generateSparkleEffects();
        
        // Auto-return to normal after 2 seconds
        this.inversionTimer = setTimeout(() => {
            if (this.inversionState) {
                this.triggerRealityInversion(); // Toggle back to normal
            }
        }, 2000);
    }
    
    /**
     * Generate click feedback effects
     */
    generateClickEffects(x, y) {
        // Create ripple effect element
        const ripple = document.createElement('div');
        ripple.className = 'vib34d-click-ripple';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        document.body.appendChild(ripple);
        
        // Remove after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 1000);
    }
    
    /**
     * Generate sparkle effects during reality inversion
     */
    generateSparkleEffects() {
        const sparkleCount = 8;
        
        for (let i = 0; i < sparkleCount; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'vib34d-sparkle';
            
            sparkle.style.left = Math.random() * window.innerWidth + 'px';
            sparkle.style.top = Math.random() * window.innerHeight + 'px';
            sparkle.style.animationDelay = (Math.random() * 0.5) + 's';
            
            document.body.appendChild(sparkle);
            
            setTimeout(() => {
                if (sparkle.parentNode) {
                    sparkle.parentNode.removeChild(sparkle);
                }
            }, 1500);
        }
    }
    
    /**
     * Invert color array for reality inversion
     */
    invertColorArray(colors) {
        return colors.map(color => {
            if (typeof color === 'string' && color.startsWith('#')) {
                // Hex color inversion
                const hex = color.substring(1);
                const inverted = (0xFFFFFF ^ parseInt(hex, 16)).toString(16).padStart(6, '0');
                return '#' + inverted;
            } else if (Array.isArray(color)) {
                // RGB array inversion
                return color.map(c => 1.0 - c);
            }
            return color;
        });
    }
    
    /**
     * Update visualizer parameters with smooth transitions
     */
    updateVisualizerParameters(visualizer, newParams) {
        if (!visualizer.updateParameters) {
            // Fallback: direct config update
            Object.assign(visualizer.config, newParams);
            return;
        }
        
        // Use visualizer's built-in parameter update method
        visualizer.updateParameters(newParams, {
            duration: 300,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
    }
    
    /**
     * Find which visualizer index corresponds to an element
     */
    findVisualizerTarget(element) {
        // Look for visualizer container or data attributes
        let current = element;
        
        while (current && current !== document.body) {
            if (current.dataset && current.dataset.visualizerIndex !== undefined) {
                return parseInt(current.dataset.visualizerIndex);
            }
            
            if (current.classList && current.classList.contains('holographic-visualizer')) {
                // Try to find index from element position or ID
                const container = current.closest('.holographic-container');
                if (container) {
                    const visualizers = container.querySelectorAll('.holographic-visualizer');
                    return Array.from(visualizers).indexOf(current);
                }
            }
            
            current = current.parentElement;
        }
        
        return null;
    }
    
    /**
     * Handle scroll events for scroll-based effects
     */
    handleScroll(event) {
        this.interactionState.scrolling = true;
        this.interactionState.idle = false;
        
        // Implement scroll-based parameter modifications
        // This can be extended based on specific scroll effects needed
        
        clearTimeout(this.scrollEndTimer);
        this.scrollEndTimer = setTimeout(() => {
            this.interactionState.scrolling = false;
        }, 150);
    }
    
    /**
     * Handle wheel events (mouse wheel)
     */
    handleWheel(event) {
        this.handleScroll(event);
    }
    
    /**
     * Reset idle timer for idle state detection
     */
    resetIdleTimer() {
        this.interactionState.idle = false;
        
        clearTimeout(this.idleTimer);
        this.idleTimer = setTimeout(() => {
            this.interactionState.idle = true;
            this.handleIdleState();
        }, 3000);
    }
    
    /**
     * Handle idle state - return to calm base parameters
     */
    handleIdleState() {
        if (!this.interactionState.hovering && !this.interactionState.clicking) {
            this.resetToBaseState();
        }
    }
    
    /**
     * Add visualizer to coordination system
     */
    addVisualizer(visualizer) {
        const index = this.visualizers.length;
        this.visualizers.push(visualizer);
        
        // Store base parameters for new visualizer
        if (visualizer && visualizer.config) {
            this.baseParameters.set(index, {
                gridDensity: visualizer.config.gridDensity,
                colorIntensity: visualizer.config.colorIntensity,
                reactivity: visualizer.config.reactivity,
                depth: visualizer.config.depth || 0,
                speed: visualizer.config.speed,
                colors: [...visualizer.config.colors]
            });
        }
        
        return index;
    }
    
    /**
     * Remove visualizer from coordination system
     */
    removeVisualizer(index) {
        if (index >= 0 && index < this.visualizers.length) {
            this.visualizers.splice(index, 1);
            this.baseParameters.delete(index);
        }
    }
    
    /**
     * Get current interaction state
     */
    getInteractionState() {
        return { ...this.interactionState };
    }
    
    /**
     * Cleanup event listeners
     */
    destroy() {
        // Remove all event listeners
        document.removeEventListener('mouseover', this.handleHoverStart);
        document.removeEventListener('mouseout', this.handleHoverEnd);
        document.removeEventListener('touchstart', this.handleTouchStart);
        document.removeEventListener('touchend', this.handleTouchEnd);
        document.removeEventListener('click', this.handleClick);
        document.removeEventListener('scroll', this.handleScroll);
        document.removeEventListener('wheel', this.handleWheel);
        
        // Clear timers
        if (this.inversionTimer) clearTimeout(this.inversionTimer);
        if (this.idleTimer) clearTimeout(this.idleTimer);
        if (this.scrollEndTimer) clearTimeout(this.scrollEndTimer);
    }
}

// CSS for click and sparkle effects
const interactionCSS = `
.vib34d-click-ripple {
    position: fixed;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,255,255,0.6) 0%, transparent 70%);
    transform: translate(-50%, -50%) scale(0);
    animation: vib34d-ripple 1s ease-out forwards;
    pointer-events: none;
    z-index: 10000;
}

@keyframes vib34d-ripple {
    0% {
        transform: translate(-50%, -50%) scale(0);
        opacity: 1;
    }
    100% {
        transform: translate(-50%, -50%) scale(3);
        opacity: 0;
    }
}

.vib34d-sparkle {
    position: fixed;
    width: 4px;
    height: 4px;
    background: #fff;
    border-radius: 50%;
    animation: vib34d-sparkle 1.5s ease-out forwards;
    pointer-events: none;
    z-index: 10000;
}

@keyframes vib34d-sparkle {
    0% {
        transform: scale(0) rotate(0deg);
        opacity: 1;
        box-shadow: 0 0 6px #fff;
    }
    50% {
        transform: scale(1) rotate(180deg);
        opacity: 1;
        box-shadow: 0 0 12px #00ffff;
    }
    100% {
        transform: scale(0) rotate(360deg);
        opacity: 0;
        box-shadow: 0 0 0px transparent;
    }
}
`;

// Inject CSS
if (!document.getElementById('vib34d-interaction-styles')) {
    const style = document.createElement('style');
    style.id = 'vib34d-interaction-styles';
    style.textContent = interactionCSS;
    document.head.appendChild(style);
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VIB34DInteractionCoordinator;
}

// Global access
window.VIB34DInteractionCoordinator = VIB34DInteractionCoordinator;