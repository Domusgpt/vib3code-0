/**
 * PresetManager.js - The Configuration Brain
 * Loads, manages, and applies visual style and interaction presets
 */
class PresetManager {
    constructor() {
        this.visualStyles = null;
        this.reactivityPresets = null;
        this.themeCollections = null;
        this.loadedTheme = null;
        this.isLoaded = false;
    }

    /**
     * Load all preset configurations
     * @param {string} basePath - Base path to preset files
     * @returns {Promise} Resolves when all presets are loaded
     */
    async loadPresets(basePath = './presets/') {
        try {
            const [visualStyles, reactivityPresets, themeCollections] = await Promise.all([
                fetch(`${basePath}visual-styles.json`).then(r => r.json()),
                fetch(`${basePath}reactivity-presets.json`).then(r => r.json()),
                fetch(`${basePath}theme-collections.json`).then(r => r.json())
            ]);

            this.visualStyles = visualStyles;
            this.reactivityPresets = reactivityPresets;
            this.themeCollections = themeCollections;
            this.isLoaded = true;

            console.log('[PresetManager] All presets loaded successfully');
            return true;
        } catch (error) {
            console.error('[PresetManager] Failed to load presets:', error);
            this.createFallbackPresets();
            return false;
        }
    }

    /**
     * Get a visual style preset by name
     * @param {string} styleName - Name of the style
     * @returns {Object|null} Style configuration or null if not found
     */
    getVisualStyle(styleName) {
        if (!this.visualStyles || !this.visualStyles[styleName]) {
            console.warn(`[PresetManager] Visual style "${styleName}" not found`);
            return this.getFallbackStyle();
        }
        return this.visualStyles[styleName];
    }

    /**
     * Get a reactivity preset by name
     * @param {string} presetName - Name of the reactivity preset
     * @returns {Object|null} Reactivity configuration or null if not found
     */
    getReactivityPreset(presetName) {
        if (!this.reactivityPresets || !this.reactivityPresets[presetName]) {
            console.warn(`[PresetManager] Reactivity preset "${presetName}" not found`);
            return this.getFallbackReactivity();
        }
        return this.reactivityPresets[presetName];
    }

    /**
     * Get a complete theme collection
     * @param {string} themeName - Name of the theme
     * @returns {Object|null} Theme configuration or null if not found
     */
    getThemeCollection(themeName) {
        if (!this.themeCollections || !this.themeCollections[themeName]) {
            console.warn(`[PresetManager] Theme collection "${themeName}" not found`);
            return this.getFallbackTheme();
        }
        return this.themeCollections[themeName];
    }

    /**
     * Apply a complete theme to a container
     * @param {string} themeName - Name of theme to apply
     * @param {HTMLElement} container - Container element
     * @returns {Object} Applied theme configuration
     */
    applyTheme(themeName, container) {
        const theme = this.getThemeCollection(themeName);
        if (!theme) return null;

        this.loadedTheme = {
            name: themeName,
            config: theme,
            container: container,
            appliedAt: Date.now()
        };

        // Add theme class to container
        container.classList.add(`vib3-theme-${themeName}`);
        
        // Store theme data for CSS access
        container.dataset.vib3Theme = themeName;
        container.dataset.vib3Sections = JSON.stringify(Object.keys(theme.sections));

        console.log(`[PresetManager] Applied theme "${themeName}" to container`);
        return this.loadedTheme;
    }

    /**
     * Get style configuration for a specific section within current theme
     * @param {string} sectionName - Name of the section
     * @returns {Object} Combined style and reactivity configuration
     */
    getSectionConfiguration(sectionName) {
        if (!this.loadedTheme) {
            console.warn('[PresetManager] No theme loaded');
            return this.getFallbackConfiguration();
        }

        const themeConfig = this.loadedTheme.config;
        const sectionConfig = themeConfig.sections[sectionName];
        
        if (!sectionConfig) {
            console.warn(`[PresetManager] Section "${sectionName}" not found in theme`);
            return this.getFallbackConfiguration();
        }

        // Combine visual style and reactivity preset
        const visualStyle = this.getVisualStyle(sectionConfig.style);
        const reactivityPreset = this.getReactivityPreset(sectionConfig.reactivity);

        return {
            section: sectionName,
            visual: visualStyle,
            reactivity: reactivityPreset,
            layout: sectionConfig.layout || 'default',
            contentZones: sectionConfig.content_zones || [],
            transitions: this.getSectionTransitions(sectionName)
        };
    }

    /**
     * Get transition configurations for a section
     * @param {string} sectionName - Name of the section
     * @returns {Object} Transition configurations
     */
    getSectionTransitions(sectionName) {
        if (!this.loadedTheme) return {};
        
        const transitions = this.loadedTheme.config.transitions || {};
        const sectionTransitions = {};

        // Extract transitions relevant to this section
        Object.keys(transitions).forEach(transitionKey => {
            if (transitionKey.includes(sectionName) || transitionKey.includes('global')) {
                sectionTransitions[transitionKey] = transitions[transitionKey];
            }
        });

        return sectionTransitions;
    }

    /**
     * Get interaction presets filtered by event type
     * @param {string} eventType - Type of event (hover, click, scroll, etc.)
     * @returns {Array} Array of matching presets
     */
    getInteractionPresetsByEvent(eventType) {
        if (!this.reactivityPresets) return [];
        
        return Object.keys(this.reactivityPresets)
            .filter(presetName => {
                const preset = this.reactivityPresets[presetName];
                return preset.event === eventType || preset.event === 'all_interactions';
            })
            .map(presetName => this.reactivityPresets[presetName]);
    }

    /**
     * Create a custom preset configuration
     * @param {string} name - Name for the custom preset
     * @param {Object} config - Configuration object
     * @param {string} type - Type of preset (visual, reactivity, theme)
     * @returns {boolean} Success status
     */
    createCustomPreset(name, config, type = 'visual') {
        try {
            switch (type) {
                case 'visual':
                    this.visualStyles[name] = config;
                    break;
                case 'reactivity':
                    this.reactivityPresets[name] = config;
                    break;
                case 'theme':
                    this.themeCollections[name] = config;
                    break;
                default:
                    throw new Error(`Invalid preset type: ${type}`);
            }
            
            console.log(`[PresetManager] Created custom ${type} preset: ${name}`);
            return true;
        } catch (error) {
            console.error('[PresetManager] Failed to create custom preset:', error);
            return false;
        }
    }

    /**
     * Auto-detect appropriate theme based on content analysis
     * @param {HTMLElement} container - Container to analyze
     * @returns {string} Recommended theme name
     */
    autoDetectTheme(container) {
        // Analyze content structure and purpose
        const hasArticles = container.querySelectorAll('article, .article').length > 0;
        const hasCode = container.querySelectorAll('pre, code, .code').length > 0;
        const hasPortfolio = container.querySelectorAll('.portfolio, .project').length > 0;
        const hasMarketing = container.querySelectorAll('.cta, .pricing, .features').length > 0;
        const hasDocumentation = container.querySelectorAll('.docs, .documentation').length > 0;

        // Decision logic
        if (hasDocumentation) return 'minimal-documentation';
        if (hasMarketing) return 'parserator-marketing';
        if (hasPortfolio) return 'portfolio-showcase';
        if (hasArticles || hasCode) return 'vib3code-blog';
        
        return 'vib3code-blog'; // Default fallback
    }

    /**
     * Performance optimization: Get lightweight versions of presets
     * @param {string} preset - Original preset name
     * @returns {Object} Optimized preset configuration
     */
    getOptimizedPreset(preset) {
        const original = this.getVisualStyle(preset);
        if (!original) return null;

        // Create optimized version with reduced complexity
        return {
            ...original,
            parameters: {
                ...original.parameters,
                density: Math.min(original.parameters.density * 0.6, 8),
                speed: original.parameters.speed * 0.8,
                morphFactor: original.parameters.morphFactor * 0.7,
                opacity: Math.min(original.parameters.opacity * 0.8, 0.6)
            },
            optimized: true,
            originalPreset: preset
        };
    }

    // === FALLBACK METHODS ===

    createFallbackPresets() {
        console.log('[PresetManager] Creating fallback presets');
        
        this.visualStyles = {
            'default': this.getFallbackStyle()
        };
        
        this.reactivityPresets = {
            'default': this.getFallbackReactivity()
        };
        
        this.themeCollections = {
            'default': this.getFallbackTheme()
        };
        
        this.isLoaded = true;
    }

    getFallbackStyle() {
        return {
            name: "Fallback Default",
            type: "Background",
            geometry: "hypercube",
            parameters: {
                density: 8.0,
                speed: 0.3,
                dimension: 3.2,
                morphFactor: 0.3,
                lineThickness: 0.03,
                baseColor: "#0066cc",
                opacity: 0.5
            }
        };
    }

    getFallbackReactivity() {
        return {
            name: "Fallback Reactivity",
            description: "Basic interaction preset",
            event: "all_interactions",
            parameters: {
                mouse: { sensitivity: 0.5, decay: 1000 },
                scroll: { sensitivity: 0.3, accumulation: false },
                click: { intensity: 1.0, duration: 500 }
            }
        };
    }

    getFallbackTheme() {
        return {
            name: "Fallback Theme",
            sections: {
                default: {
                    style: "default",
                    reactivity: "default"
                }
            }
        };
    }

    getFallbackConfiguration() {
        return {
            section: "default",
            visual: this.getFallbackStyle(),
            reactivity: this.getFallbackReactivity(),
            layout: "default",
            contentZones: [],
            transitions: {}
        };
    }

    // === UTILITY METHODS ===

    /**
     * List all available presets by category
     * @returns {Object} Object containing arrays of preset names
     */
    listAvailablePresets() {
        return {
            visualStyles: Object.keys(this.visualStyles || {}),
            reactivityPresets: Object.keys(this.reactivityPresets || {}),
            themeCollections: Object.keys(this.themeCollections || {})
        };
    }

    /**
     * Export current configuration as JSON
     * @returns {string} JSON string of current presets
     */
    exportConfiguration() {
        return JSON.stringify({
            visualStyles: this.visualStyles,
            reactivityPresets: this.reactivityPresets,
            themeCollections: this.themeCollections,
            loadedTheme: this.loadedTheme
        }, null, 2);
    }

    /**
     * Import configuration from JSON
     * @param {string} jsonConfig - JSON configuration string
     * @returns {boolean} Success status
     */
    importConfiguration(jsonConfig) {
        try {
            const config = JSON.parse(jsonConfig);
            
            if (config.visualStyles) this.visualStyles = config.visualStyles;
            if (config.reactivityPresets) this.reactivityPresets = config.reactivityPresets;
            if (config.themeCollections) this.themeCollections = config.themeCollections;
            
            console.log('[PresetManager] Configuration imported successfully');
            return true;
        } catch (error) {
            console.error('[PresetManager] Failed to import configuration:', error);
            return false;
        }
    }
}

// PresetManager class available globally