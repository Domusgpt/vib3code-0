/**
 * VIB3 INTUITIVE PRESETS
 * 
 * Pre-configured effect combinations that create natural, intuitive, "woah" experiences
 * Each preset coordinates multiple visualizers to behave differently but congruently
 */

class VIB3IntuitivePresets {
    constructor(effectsSystem) {
        this.effects = effectsSystem;
        this.createIntuitivePresets();
        
        console.log('🎭 VIB3 Intuitive Presets initialized');
    }
    
    createIntuitivePresets() {
        
        // ============ CARD HOVER PRESETS ============
        
        /**
         * CARD FOCUS IN - Natural focus behavior
         * Focused card comes forward, others fade back in harmony
         */
        this.effects.createCustomPreset('card-focus-in', {
            level: 'system',
            description: 'Card comes into focus, others harmoniously fade back',
            effects: {
                focused: {
                    scale: 1.08,
                    opacity: 1.0,
                    blur: 0,
                    glow: 0.9,
                    dimensional: 0.3,
                    zIndex: 150,
                    chromaticGlow: 0.5,
                    duration: 400
                },
                unfocused: {
                    scale: 0.96,
                    opacity: 0.65,
                    blur: 1.5,
                    glow: 0.0,
                    dimensional: -0.15,
                    zIndex: 10,
                    duration: 400
                },
                boardVisualizer: {
                    intensity: 0.6,
                    complexity: 0.4,
                    blur: 1.0,
                    duration: 400
                },
                cardVisualizers: {
                    focused: {
                        intensity: 1.2,
                        morphFactor: 0.8,
                        rotationSpeed: 1.3,
                        duration: 400
                    },
                    unfocused: {
                        intensity: 0.5,
                        morphFactor: 0.3,
                        rotationSpeed: 0.7,
                        duration: 400
                    }
                },
                system: {
                    globalIntensity: 0.95,
                    focusIntensity: 0.8,
                    backgroundDim: 0.25,
                    coherence: 1.3,
                    duration: 400
                }
            }
        });
        
        /**
         * CARD FOCUS OUT - Return to harmony
         */
        this.effects.createCustomPreset('card-focus-out', {
            level: 'system',
            description: 'All elements return to harmonious baseline',
            effects: {
                all: {
                    scale: 1.0,
                    opacity: 1.0,
                    blur: 0,
                    glow: 0.0,
                    dimensional: 0.0,
                    zIndex: 'auto',
                    duration: 300
                },
                allVisualizers: {
                    intensity: 0.8,
                    morphFactor: 0.5,
                    rotationSpeed: 1.0,
                    duration: 300
                },
                system: {
                    globalIntensity: 0.8,
                    focusIntensity: 0.0,
                    backgroundDim: 0.0,
                    coherence: 1.0,
                    duration: 300
                }
            }
        });
        
        // ============ CLICK REACTION PRESETS ============
        
        /**
         * CARD CLICK PULSE - Ripple through system
         */
        this.effects.createCustomPreset('card-click-pulse', {
            level: 'system',
            description: 'Click creates ripple effect through entire system',
            effects: {
                clicked: {
                    scale: [1.0, 1.2, 1.05],
                    glow: [0.0, 1.0, 0.4],
                    dimensional: [0.0, 0.6, 0.2],
                    chromaticShift: [0, 4, 1],
                    duration: 600
                },
                neighborCards: {
                    scale: [1.0, 1.03, 1.0],
                    glow: [0.0, 0.5, 0.1],
                    dimensional: [0.0, 0.1, 0.0],
                    delay: 100,
                    duration: 500
                },
                distantCards: {
                    scale: [1.0, 0.97, 1.0],
                    opacity: [1.0, 0.85, 1.0],
                    delay: 200,
                    duration: 400
                },
                allVisualizers: {
                    morphFactor: [0.5, 0.9, 0.5],
                    rotationSpeed: [1.0, 1.5, 1.0],
                    intensity: [0.8, 1.3, 0.8],
                    stagger: 50,
                    duration: 700
                },
                system: {
                    portalIntensity: [0.0, 0.7, 0.1],
                    microChaos: [0.0, 0.4, 0.0],
                    globalIntensity: [0.8, 1.1, 0.8],
                    duration: 800
                }
            }
        });
        
        /**
         * REALITY GLITCH CLICK - Reality tears on click
         */
        this.effects.createCustomPreset('reality-glitch-click', {
            level: 'system',
            description: 'Click causes reality glitch that cascades through system',
            effects: {
                clicked: {
                    invert: [0, 1, 0],
                    hueRotate: [0, 180, 0],
                    contrast: [1, 2.5, 1],
                    glitchIntensity: [0, 0.8, 0],
                    duration: 500
                },
                textElements: {
                    glitchIntensity: [0.0, 0.9, 0.0],
                    chromaticShift: [0, 3, 0],
                    textShadowRed: [0, -2, 0],
                    textShadowBlue: [0, 2, 0],
                    stagger: 80,
                    duration: 600
                },
                allVisualizers: {
                    chaosIntensity: [0.0, 0.7, 0.0],
                    glitchAmount: [0.0, 0.5, 0.0],
                    stagger: 100,
                    duration: 700
                },
                system: {
                    realityTear: [0.0, 0.8, 0.0],
                    chaosIntensity: [0.0, 0.6, 0.0],
                    globalIntensity: [0.8, 1.2, 0.8],
                    duration: 800
                }
            }
        });
        
        // ============ NAVIGATION PRESETS ============
        
        /**
         * TESSERACT NAVIGATION - Smooth dimensional fold
         */
        this.effects.createCustomPreset('tesseract-navigate', {
            level: 'face',
            description: 'Smooth tesseract folding with portal transition',
            effects: {
                currentFace: {
                    rotateY: [0, -45, -90],
                    scale: [1.0, 0.9, 0.7],
                    opacity: [1.0, 0.7, 0.0],
                    dimensional: [0.0, -0.3, -0.8],
                    duration: 800
                },
                targetFace: {
                    rotateY: [90, 45, 0],
                    scale: [0.7, 0.9, 1.0],
                    opacity: [0.0, 0.7, 1.0],
                    dimensional: [-0.8, -0.3, 0.0],
                    delay: 200,
                    duration: 800
                },
                allVisualizers: {
                    intensity: [0.8, 1.4, 0.9],
                    morphFactor: [0.5, 0.8, 0.6],
                    dimension: [3.5, 4.2, 3.7],
                    stagger: 50,
                    duration: 1000
                },
                system: {
                    tensionIntensity: [0.0, 1.0, 0.2],
                    portalEnergy: [0.0, 0.9, 0.3],
                    dimensionalDepth: [3.5, 4.5, 3.7],
                    globalIntensity: [0.8, 1.3, 0.9],
                    duration: 1200
                }
            }
        });
        
        /**
         * PORTAL WARP - Chromatic aberration transition
         */
        this.effects.createCustomPreset('portal-warp', {
            level: 'system',
            description: 'Portal-style transition with chromatic distortion',
            effects: {
                all: {
                    chromaticRed: [0, 2, 5, 15, 0],
                    chromaticCyan: [0, -2, -5, -15, 0],
                    scale: [1.0, 1.02, 0.98, 0.85, 1.0],
                    opacity: [1.0, 1.0, 0.9, 0.1, 0.0],
                    blur: [0, 0, 1, 3, 0],
                    duration: 900
                },
                allVisualizers: {
                    chromaticAberration: [0.0, 0.3, 0.6, 1.0, 0.0],
                    portalDistortion: [0.0, 0.2, 0.5, 0.8, 0.0],
                    duration: 900
                },
                system: {
                    portalIntensity: [0.0, 0.3, 0.6, 0.95, 0.0],
                    realityTear: [0.0, 0.1, 0.3, 0.7, 0.0],
                    duration: 900
                }
            }
        });
        
        // ============ CONSCIOUSNESS PRESETS ============
        
        /**
         * UNIFIED BREATHING - System-wide coherent breathing
         */
        this.effects.createCustomPreset('unified-breathing', {
            level: 'system',
            description: 'Synchronized breathing pattern across all elements',
            effects: {
                cards: {
                    scale: { 
                        pattern: 'sine', 
                        amplitude: 0.015, 
                        frequency: 0.4, 
                        phase: [0, 60, 120, 180, 240, 300] // Staggered phases
                    },
                    opacity: { 
                        pattern: 'sine', 
                        amplitude: 0.08, 
                        frequency: 0.4, 
                        phase: 'synchronized' 
                    },
                    dimensional: { 
                        pattern: 'sine', 
                        amplitude: 0.1, 
                        frequency: 0.4, 
                        phase: 'inverse' 
                    },
                    continuous: true
                },
                visualizers: {
                    morphFactor: {
                        pattern: 'sine',
                        amplitude: 0.1,
                        frequency: 0.4,
                        phase: 'staggered'
                    },
                    intensity: {
                        pattern: 'sine',
                        amplitude: 0.15,
                        frequency: 0.4,
                        phase: 'synchronized'
                    },
                    continuous: true
                },
                system: {
                    breathingAmplitude: 0.02,
                    breathingFrequency: 0.4,
                    consciousnessPhase: 'active',
                    coherence: 1.2,
                    continuous: true
                }
            }
        });
        
        /**
         * QUANTUM ENTANGLEMENT - Synchronized mysterious effects
         */
        this.effects.createCustomPreset('quantum-entanglement', {
            level: 'system',
            description: 'Quantum entangled behavior across visualizers',
            effects: {
                visualizers: {
                    morphFactor: {
                        synchronization: 'quantum',
                        entanglementStrength: 0.9,
                        phaseShift: [0, 45, 90, 135, 180, 225], // Quantum phase relationships
                        amplitude: 0.25,
                        frequency: 0.25,
                        continuous: true
                    },
                    rotationSpeed: {
                        synchronization: 'quantum',
                        entanglementStrength: 0.7,
                        phaseShift: [0, 90, 180, 270, 45, 135],
                        amplitude: 0.3,
                        frequency: 0.3,
                        continuous: true
                    },
                    dimension: {
                        synchronization: 'quantum',
                        entanglementStrength: 0.8,
                        phaseShift: [0, 72, 144, 216, 288, 36], // Pentagon relationships
                        amplitude: 0.4,
                        frequency: 0.2,
                        continuous: true
                    }
                },
                cards: {
                    quantumFlicker: {
                        pattern: 'quantum',
                        entanglement: true,
                        amplitude: 0.03,
                        frequency: 0.25,
                        continuous: true
                    }
                },
                system: {
                    quantumCoherence: 0.85,
                    entanglementField: 0.7,
                    microChaos: 0.1,
                    continuous: true
                }
            }
        });
        
        // ============ PRESET COMBINATIONS ============
        
        /**
         * Create combination presets for complex interactions
         */
        this.effects.createPresetCombination('focus-with-breathing', 
            ['card-focus-in', 'unified-breathing'], 
            { overlap: 200, sequence: 'parallel' }
        );
        
        this.effects.createPresetCombination('click-with-quantum', 
            ['card-click-pulse', 'quantum-entanglement'], 
            { overlap: 300, sequence: 'layered' }
        );
        
        this.effects.createPresetCombination('nav-with-portal', 
            ['tesseract-navigate', 'portal-warp'], 
            { overlap: 400, sequence: 'synchronized' }
        );
        
        this.effects.createPresetCombination('reality-glitch-cascade', 
            ['reality-glitch-click', 'vhs-glitch-cascade'], 
            { overlap: 100, sequence: 'cascade' }
        );
        
        // ============ AGENT-FRIENDLY PRESET API ============
        
        /**
         * Simple API for agents to create custom presets
         */
        this.createAgentPreset = (name, config) => {
            const preset = {
                level: config.level || 'element',
                description: config.description || `Agent-created preset: ${name}`,
                effects: this.normalizeAgentConfig(config.effects)
            };
            
            this.effects.createCustomPreset(name, preset);
            console.log(`🤖 Agent preset '${name}' created`);
        };
        
        /**
         * Quick preset shortcuts for common patterns
         */
        this.quickPresets = {
            // Focus patterns
            focusIn: (element) => this.effects.triggerEffect('card-focus-in', element),
            focusOut: () => this.effects.triggerEffect('card-focus-out'),
            
            // Click patterns  
            clickPulse: (element) => this.effects.triggerEffect('card-click-pulse', element),
            clickGlitch: (element) => this.effects.triggerEffect('reality-glitch-click', element),
            
            // Navigation patterns
            navigate: (fromFace, toFace) => this.effects.triggerEffect('tesseract-navigate', { from: fromFace, to: toFace }),
            portal: () => this.effects.triggerEffect('portal-warp'),
            
            // Consciousness patterns
            breathe: () => this.effects.triggerEffect('unified-breathing'),
            entangle: () => this.effects.triggerEffect('quantum-entanglement'),
            
            // Stop all effects
            reset: () => this.effects.triggerEffect('card-focus-out')
        };
    }
    
    /**
     * NORMALIZE AGENT CONFIG
     * Converts agent-friendly config to internal format
     */
    normalizeAgentConfig(agentConfig) {
        const normalized = {};
        
        Object.entries(agentConfig).forEach(([target, effects]) => {
            normalized[target] = {};
            
            Object.entries(effects).forEach(([property, value]) => {
                if (typeof value === 'number') {
                    // Simple value
                    normalized[target][property] = value;
                } else if (Array.isArray(value)) {
                    // Keyframe array
                    normalized[target][property] = value;
                } else if (typeof value === 'object' && value.from !== undefined) {
                    // From-to animation
                    normalized[target][property] = [value.from, value.to];
                    if (value.duration) normalized[target].duration = value.duration;
                } else {
                    // Pass through as-is
                    normalized[target][property] = value;
                }
            });
        });
        
        return normalized;
    }
    
    /**
     * PRESET VALIDATION
     * Ensures presets are well-formed and won't break the system
     */
    validatePreset(preset) {
        const warnings = [];
        
        // Check for conflicting properties
        if (preset.effects.system && preset.effects.system.duration > 2000) {
            warnings.push('System effect duration > 2s may feel sluggish');
        }
        
        // Check for extreme values
        Object.values(preset.effects).forEach(effect => {
            if (effect.scale && (effect.scale > 2 || effect.scale < 0.1)) {
                warnings.push('Scale values outside 0.1-2.0 range may be jarring');
            }
        });
        
        if (warnings.length > 0) {
            console.warn(`⚠️ Preset validation warnings:`, warnings);
        }
        
        return warnings.length === 0;
    }
    
    /**
     * GET ALL AVAILABLE PRESETS
     */
    getAllPresets() {
        return Object.keys(this.effects.effectPresets);
    }
    
    /**
     * GET PRESET DESCRIPTION
     */
    getPresetDescription(presetName) {
        const preset = this.effects.effectPresets[presetName];
        return preset ? preset.description : 'Preset not found';
    }
}

// Export for global access
if (typeof window !== 'undefined') {
    window.VIB3IntuitivePresets = VIB3IntuitivePresets;
    console.log('🎭 VIB3 Intuitive Presets loaded');
}