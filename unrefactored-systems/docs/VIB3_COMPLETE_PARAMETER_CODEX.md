# VIB3STYLEPACK COMPLETE PARAMETER CODEX
## The Full Cascading Interlocked System Architecture

**Based on REAL HyperAV system analysis:**
- GeometryManager.js - 3 geometry classes with full parameter mapping
- ProjectionManager.js - 3 projection classes with dynamic modulation  
- visualizer-main.js - Complete audio→visual parameter cascade system

---

## 🏗️ CLASS ARCHITECTURE HIERARCHY

### Base Classes & Inheritance Chain
```javascript
// GEOMETRY SYSTEM
BaseGeometry (abstract)
├── HypercubeGeometry extends BaseGeometry
├── HypersphereGeometry extends BaseGeometry  
├── HypertetrahedronGeometry extends BaseGeometry
└── [Extensible for more geometries]

// PROJECTION SYSTEM  
BaseProjection (abstract)
├── PerspectiveProjection extends BaseProjection
├── OrthographicProjection extends BaseProjection
├── StereographicProjection extends BaseProjection  
└── [Extensible for more projections]

// CORE MANAGEMENT
GeometryManager {
    geometries: Map<string, BaseGeometry>
    registerGeometry(name, instance)
    getGeometry(name): BaseGeometry
}

ProjectionManager {
    projections: Map<string, BaseProjection>  
    registerProjection(name, instance)
    getProjection(name): BaseProjection
}

// VISUALIZER COORDINATION
HypercubeCore {
    state: VisualizerState
    geometryManager: GeometryManager
    projectionManager: ProjectionManager
    shaderManager: ShaderManager
    updateParameters(params)
}
```

---

## 🎛️ COMPLETE SHADER UNIFORM SYSTEM

### Core Mathematics & Timing
```glsl
uniform vec2 u_resolution;      // Canvas dimensions
uniform float u_time;           // Animation time
uniform vec2 u_mouse;           // Mouse position [0-1]
uniform float u_dimension;      // 3.0→5.0 (3D to 4D+ hypercube)
uniform float u_morphFactor;    // 0.0→1.5 (morph intensity)
uniform float u_rotationSpeed;  // 0.0→3.0 (4D rotation speed)
```

### Grid & Lattice Parameters
```glsl
uniform float u_gridDensity;    // 1.0→25.0 (lattice density)
uniform float u_lineThickness;  // 0.002→0.1 (line width)
uniform float u_universeModifier; // 0.3→2.5 (universe scaling power)
uniform float u_patternIntensity; // 0.0→3.0 (overall brightness/contrast)
```

### Geometry-Specific Parameters
```glsl
// Hypersphere specific
uniform float u_shellWidth;     // 0.005→0.08 (shell thickness)

// Hypertetrahedron specific  
uniform float u_tetraThickness; // 0.003→0.1 (plane thickness)

// General effects
uniform float u_glitchIntensity; // 0.0→0.15 (RGB glitch amount)
uniform float u_colorShift;     // -1.0→1.0 (hue rotation)
```

### Audio Reactivity (Now User Interaction)
```glsl
uniform float u_audioBass;      // 0.0→1.0 (bass level → interaction intensity)
uniform float u_audioMid;       // 0.0→1.0 (mid level → morph modulation)  
uniform float u_audioHigh;      // 0.0→1.0 (high level → glitch/detail)
```

---

## 🎨 GEOMETRY CLASS PARAMETER MAPPINGS

### HypercubeGeometry Parameters
```javascript
// Primary uniforms used in calculateLattice()
- u_gridDensity: Base grid size, modulated by u_audioBass (interaction intensity)
- u_lineThickness: Base line width, inversely modulated by u_audioMid
- u_dimension: Controls 3D→4D transition (3.0-4.5 range)
- u_morphFactor: Controls lattice3D→lattice4D blending (0.0-1.0)
- u_rotationSpeed: Base speed for 4D rotations (XW, YZ, ZW, YW planes)
- u_universeModifier: Final power curve adjustment
- u_time: Animation timing for rotations and phase shifts

// 4D Rotation Matrix Application:
rotXW(time_rot1) * rotYZ(time_rot2) * rotZW(time_rot3) * rotYW(time_rot4)
where each rotation incorporates audio modulation and morphFactor

// Dynamic Parameter Calculation:
dynamicGridDensity = max(0.1, u_gridDensity * (1.0 + u_audioBass * 0.7))
dynamicLineThickness = max(0.002, u_lineThickness * (1.0 - u_audioMid * 0.6))
```

### HypersphereGeometry Parameters  
```javascript
// Spherical shell system
- u_gridDensity: Controls shell frequency (densityFactor * 0.7)
- u_shellWidth: Shell thickness, modulated by u_audioMid * 1.5
- u_rotationSpeed: Phase animation speed (* 0.85 factor)
- u_dimension: 4D radius extension (cos/sin modulation)
- u_morphFactor: Blend shells3D→shells4D_proj

// Shell Calculation:
phase = radius3D * densityFactor * 6.28318 - u_time * u_rotationSpeed * 0.8 + u_audioHigh * 3.0
shells3D = smoothstep(1.0 - dynamicShellWidth, 1.0, 0.5 + 0.5 * sin(phase))

// 4D Extension:
w_coord = cos(radius3D * 2.5 - u_time * 0.55) * sin(p.x*1.0 + p.y*1.3 - p.z*0.7 + u_time*0.2)
         * dim_factor * (0.5 + u_morphFactor * 0.5 + u_audioMid * 0.5)
```

### HypertetrahedronGeometry Parameters
```javascript
// Tetrahedral plane system  
- u_gridDensity: Controls tetra scale (density * 0.65)
- u_tetraThickness: Plane distance threshold, modulated by u_audioMid * 0.7
- u_rotationSpeed: Enhanced rotation (* 1.15 factor)
- u_dimension: 4D coordinate mixing
- u_morphFactor: Blend lattice3D→lattice4D_proj

// Plane Distance Calculation:
vec3 corners = [normalize(vec3(1,1,1)), normalize(vec3(-1,-1,1)), 
                normalize(vec3(-1,1,-1)), normalize(vec3(1,-1,-1))]
minDistToPlane3D = min(min(abs(d1), abs(d2)), min(abs(d3), abs(d4)))
lattice3D = 1.0 - smoothstep(0.0, dynamicThickness, minDistToPlane3D)

// 4D Coordinate:
w_coord = cos(p.x*1.8 - p.y*1.5 + p.z*1.2 + u_time*0.24) * 
          sin(length(p)*1.4 + u_time*0.18 - u_audioMid*2.0) * 
          dim_factor * (0.45 + u_morphFactor*0.55 + u_audioHigh*0.4)
```

---

## 📐 PROJECTION CLASS SYSTEM

### PerspectiveProjection  
```glsl
vec3 project4Dto3D(vec4 p) {
    float baseDistance = 2.5; // Constructor parameter
    float dynamicDistance = max(0.2, baseDistance * (1.0 + u_morphFactor * 0.4 - u_audioMid * 0.35));
    float w_factor = dynamicDistance / max(0.1, dynamicDistance + p.w);
    return p.xyz * w_factor;
}
```

### OrthographicProjection
```glsl
vec3 project4Dto3D(vec4 p) {
    // Blends orthographic (no W division) with perspective
    vec3 orthoP = p.xyz;
    float basePerspectiveDistance = 2.5;
    float dynamicPerspectiveDistance = max(0.2, basePerspectiveDistance * (1.0 - u_audioMid * 0.4));
    float perspDenominator = dynamicPerspectiveDistance + p.w;
    float persp_w_factor = dynamicPerspectiveDistance / max(0.1, perspDenominator);
    vec3 perspP = p.xyz * persp_w_factor;
    float morphT = smoothstep(0.0, 1.0, u_morphFactor);
    return mix(orthoP, perspP, morphT);
}
```

### StereographicProjection
```glsl
vec3 project4Dto3D(vec4 p) {
    float basePoleW = -1.5; // Constructor parameter  
    float dynamicPoleW = sign(basePoleW) * max(0.1, abs(basePoleW + u_audioHigh * 0.4 * sign(basePoleW)));
    float denominator = p.w - dynamicPoleW;
    
    if (abs(denominator) < 0.001) {
        return normalize(p.xyz + vec3(0.001)) * 1000.0; // Avoid division by zero
    } else {
        float scale = (-dynamicPoleW) / denominator;
        vec3 projectedP = p.xyz * scale;
        vec3 orthoP = p.xyz;
        float morphT = smoothstep(0.0, 1.0, u_morphFactor * 0.8);
        return mix(projectedP, orthoP, morphT);
    }
}
```

---

## 🎵 AUDIO→INTERACTION PARAMETER MAPPING SYSTEM

### Base Visual Parameters (Slider Values)
```javascript
visualParams = {
    morphFactor: 0.7,         // Base morph intensity
    dimension: 4.0,           // Base dimension value
    rotationSpeed: 0.5,       // Base rotation speed
    gridDensity: 8.0,         // Base grid density
    lineThickness: 0.03,      // Base line thickness
    patternIntensity: 1.3,    // Base pattern brightness
    universeModifier: 1.0,    // Base universe scaling
    colorShift: 0.0,          // Base color shift
    glitchIntensity: 0.02,    // Base glitch amount
    shellWidth: 0.025,        // Derived from lineThickness * 0.8
    tetraThickness: 0.035     // Derived from lineThickness * 1.1
}
```

### Audio Analysis Data Structure
```javascript
analysisData = {
    // Raw frequency bands (now interaction intensity)
    bass: 0,        // Low frequency → interaction strength
    mid: 0,         // Mid frequency → morph modulation  
    high: 0,        // High frequency → detail/glitch level
    
    // Smoothed values for stable animation
    bassSmooth: 0,  // Smoothed bass → primary interaction
    midSmooth: 0,   // Smoothed mid → secondary modulation
    highSmooth: 0,  // Smoothed high → effect intensity
    
    // Pitch detection (now interaction type)
    dominantPitch: 0,         // Dominant frequency → interaction mode
    dominantPitchValue: 0,    // Pitch strength → intensity
    pitch: {
        frequency: 0,         // Detected frequency → parameter selection
        note: 'A',           // Musical note → geometry selection
        octave: 4,           // Octave → scale factor
        cents: 0,            // Tuning → fine adjustment
        inTune: false        // Tuning accuracy → stability
    }
}
```

### Parameter Mapping Functions
```javascript
paramMappings = {
    morphFactor: {
        // Pitch octave drives morph + transient spikes
        factor: analysisData.pitch.frequency > 0 
            ? 0.4 + (analysisData.pitch.octave / 6) * 0.8 + transientFactor * 0.5
            : 0.8 + analysisData.midSmooth * 1.8 + transientFactor * 0.7,
        primary: 'pitch',     // Primary driver
        secondary: 'transient', // Secondary driver
        pulseThreshold: 0.3   // UI activation threshold
    },
    
    dimension: {
        // Note maps to dimension (C=3, B=5)
        factor: analysisData.pitch.frequency > 0
            ? 3.0 + (noteMap[analysisData.pitch.note] || 0) * 2.0
            : 0.65 + analysisData.bassSmooth * 0.6 + analysisData.midSmooth * 0.3,
        primary: 'pitch',
        secondary: 'bass',
        pulseThreshold: 0.4
    },
    
    rotationSpeed: {
        // Higher octaves = faster rotation
        factor: analysisData.pitch.frequency > 0
            ? 0.2 + (analysisData.pitch.octave / 8) * 2.0 + analysisData.midSmooth * 1.0
            : 0.8 + analysisData.midSmooth * 3.0 + analysisData.highSmooth * 2.0,
        primary: 'pitch',
        secondary: 'mid',
        pulseThreshold: 0.25
    },
    
    gridDensity: {
        // Density varies with octave cycles
        factor: analysisData.pitch.frequency > 0
            ? 4.0 + ((analysisData.pitch.octave % 3) * 3.0) + analysisData.bassSmooth * 6.0
            : 0.5 + analysisData.bassSmooth * 2.2 + transientFactor * 0.7,
        primary: 'pitch',
        secondary: 'bass',
        pulseThreshold: 0.4
    },
    
    lineThickness: {
        // Inverse relationship: high notes = thin lines
        factor: analysisData.pitch.frequency > 0
            ? 1.5 - ((analysisData.pitch.octave - 2) / 6) * 0.8
            : 1.5 - analysisData.highSmooth * 1.0 + analysisData.bassSmooth * 0.3,
        primary: 'pitch',
        secondary: 'high',
        pulseThreshold: 0.5,
        inverse: true
    },
    
    patternIntensity: {
        // Detuning increases intensity (out-of-tune = more visual)
        factor: analysisData.pitch.frequency > 0
            ? 0.7 + Math.abs(analysisData.pitch.cents / 50.0) * 1.5 + transientFactor * 0.5
            : 0.8 + analysisData.midSmooth * 1.5 + transientFactor * 1.1,
        primary: 'tuning',
        secondary: 'transient',
        pulseThreshold: 0.25
    },
    
    universeModifier: {
        // Note scale degree modifies universe
        factor: analysisData.pitch.frequency > 0
            ? 0.5 + (noteMap[analysisData.pitch.note] || 0) * 1.5
            : 0.7 + analysisData.bassSmooth * 1.2 + dissonanceFactor * 0.4,
        primary: 'note',
        secondary: 'bass',
        pulseThreshold: 0.4
    },
    
    glitchIntensity: {
        // Out-of-tune = more glitch
        factor: analysisData.pitch.frequency > 0
            ? 0.01 + (analysisData.pitch.inTune ? 0 : (Math.abs(analysisData.pitch.cents) / 50.0) * 0.08)
            : 0.02 + analysisData.highSmooth * 0.08 + transientFactor * 0.1,
        primary: 'tuning',
        secondary: 'transient',
        pulseThreshold: 0.2,
        additive: true
    },
    
    colorShift: {
        // Sharp/flat tuning = positive/negative color shift
        factor: analysisData.pitch.frequency > 0
            ? analysisData.pitch.cents / 50.0  // -1.0 to 1.0 range
            : 1.2 + (dissonanceFactor * 1.5) + (energyFactor - 0.1) * 0.8,
        primary: 'tuning',
        secondary: 'energy',
        pulseThreshold: 0.3,
        bipolar: true
    }
}
```

### Derived Parameters
```javascript
effectiveParams = {
    // Geometry-specific derived params
    shellWidth: visualParams.shellWidth * (0.7 + analysisData.midSmooth * 1.8 + analysisData.bassSmooth * 0.4),
    tetraThickness: visualParams.tetraThickness * (1.3 - analysisData.highSmooth * 0.9 + analysisData.bassSmooth * 0.3),
    
    // Audio level pass-through (now interaction levels)
    audioLevels: { 
        bass: analysisData.bassSmooth,   // Primary interaction intensity
        mid: analysisData.midSmooth,     // Secondary modulation
        high: analysisData.highSmooth    // Detail/effect level
    },
    
    // Pitch-based color system
    hue: pitchHue,                       // Note → hue mapping
    saturation: pitchSaturation,         // Strength → saturation
    brightness: pitchBrightness,         // Octave → brightness
    rgbOffset: tuningOffset,             // Tuning → RGB shift
    
    // Projection modulation
    projectionDistance: analysisData.pitch.frequency > 0 
        ? 2.0 + (analysisData.pitch.octave - 3) * 0.5
        : 2.0 + analysisData.bassSmooth * 1.0,
        
    projectionAngle: analysisData.pitch.frequency > 0
        ? (noteMap[analysisData.pitch.note] || 0) * Math.PI * 2
        : (Date.now() * 0.0005) % (Math.PI * 2)
}
```

---

## 🎛️ CASCADING PARAMETER CALCULATION

### Update Flow Architecture
```javascript
// 1. Base parameter values (from sliders/presets)
visualParams[key] = sliderValue

// 2. Audio analysis (now interaction analysis)  
calculateAudioLevels() // Updates analysisData

// 3. Parameter mapping calculation
for (const key in paramMappings) {
    const mapping = paramMappings[key];
    
    if (mapping.additive) {
        effectiveParams[key] = visualParams[key] + audioModulation
    } else if (mapping.bipolar) {
        effectiveParams[key] = visualParams[key] + bipolarOffset
    } else {
        effectiveParams[key] = visualParams[key] * mapping.factor
    }
}

// 4. Range clamping
effectiveParams.morphFactor = Math.max(0, Math.min(1.5, effectiveParams.morphFactor))
effectiveParams.dimension = Math.max(3, Math.min(5, effectiveParams.dimension))
// ... etc for all parameters

// 5. Core update
hypercubeCore.updateParameters(effectiveParams)

// 6. Shader uniform update (automatic via dirty flags)
_setUniforms() // Updates GPU uniforms
```

### Visual Feedback System
```javascript
// UI slider visual updates (non-interfering)
for (const key in sliders) {
    const value = effectiveParams[key];
    const progress = (value - min) / (max - min);
    
    // Update slider track position
    wrapper.style.setProperty('--slider-progress', progress.toFixed(3));
    
    // Update value display
    display.textContent = value.toFixed(decimals);
    
    // Pulse intensity based on mapping
    const pulseIntensity = calculatePulseIntensity(paramMappings[key]);
    wrapper.style.setProperty('--pulse-intensity', pulseIntensity.toFixed(2));
    
    // Active state for threshold crossing
    if (pulseIntensity > mapping.pulseThreshold) {
        controlGroup.classList.add('active');
    }
}
```

---

## 🔗 INTEGRATION WITH VIB3STYLEPACK

### VIB3HomeMaster Bridge
```javascript
// Convert HyperAV parameter system to VIB3 architecture
class VIB3HyperAVBridge {
    constructor(hypercubeCore, homeMaster, reactivityBridge) {
        this.core = hypercubeCore;
        this.homeMaster = homeMaster;
        this.reactivityBridge = reactivityBridge;
        
        // Map HyperAV parameters to VIB3 system
        this.parameterMap = {
            // Direct mappings
            'morphFactor': 'u_morphFactor',
            'dimension': 'u_dimension', 
            'rotationSpeed': 'u_rotationSpeed',
            'gridDensity': 'u_gridDensity',
            
            // Derived mappings
            'lineThickness': ['u_lineThickness', 'u_shellWidth', 'u_tetraThickness'],
            'audioLevels.bass': 'u_audioBass',
            'audioLevels.mid': 'u_audioMid',
            'audioLevels.high': 'u_audioHigh'
        };
    }
    
    updateVIB3Parameters(params) {
        // Update HyperAV core
        this.core.updateParameters(params);
        
        // Sync with VIB3 master system
        this.homeMaster.registerInteraction('hyperav_update', params.intensity || 1.0);
        this.reactivityBridge.triggerReaction('parameter_cascade', params);
    }
}
```

### Hypercube Face Geometry Integration
```javascript
// Map hypercube faces to geometry types
hypercubeFaceGeometries = {
    'face-0': { geometry: 'hypercube', params: { gridDensity: 12.0, lineThickness: 0.03 }},
    'face-1': { geometry: 'hypertetrahedron', params: { gridDensity: 8.0, tetraThickness: 0.04 }},
    'face-2': { geometry: 'hypersphere', params: { gridDensity: 10.0, shellWidth: 0.025 }},
    'face-3': { geometry: 'hypercube', params: { dimension: 4.5, morphFactor: 0.8 }},
    // ... etc for all 8 faces
}

// Section transition system
transitionToSection(sectionId) {
    const faceConfig = this.hypercubeFaceGeometries[`face-${sectionId}`];
    
    // Update geometry
    this.core.updateParameters({
        geometryType: faceConfig.geometry,
        ...faceConfig.params
    });
    
    // Trigger VIB3 transition
    this.homeMaster.transitionToSection(sectionId);
    this.reactivityBridge.syncAllLayers();
}
```

---

## 📋 COMPLETE EDITOR CONTROL SYSTEM

### Master Control Panel Structure
```javascript
editorControls = {
    // Geometry Selection
    geometryType: {
        type: 'dropdown',
        options: ['hypercube', 'hypersphere', 'hypertetrahedron'],
        default: 'hypercube',
        callback: (value) => core.updateParameters({ geometryType: value })
    },
    
    // Projection Selection  
    projectionMethod: {
        type: 'dropdown',
        options: ['perspective', 'orthographic', 'stereographic'],
        default: 'perspective',
        callback: (value) => core.updateParameters({ projectionMethod: value })
    },
    
    // Core Parameters
    dimension: {
        type: 'range',
        min: 3.0, max: 5.0, step: 0.01, default: 4.0,
        mapping: 'u_dimension',
        description: '3D to 4D+ transition'
    },
    
    morphFactor: {
        type: 'range', 
        min: 0.0, max: 1.5, step: 0.01, default: 0.7,
        mapping: 'u_morphFactor',
        description: 'Morphing intensity'
    },
    
    rotationSpeed: {
        type: 'range',
        min: 0.0, max: 3.0, step: 0.01, default: 0.5,
        mapping: 'u_rotationSpeed', 
        description: '4D rotation speed'
    },
    
    gridDensity: {
        type: 'range',
        min: 1.0, max: 25.0, step: 0.1, default: 8.0,
        mapping: 'u_gridDensity',
        description: 'Lattice density'
    },
    
    lineThickness: {
        type: 'range',
        min: 0.002, max: 0.1, step: 0.001, default: 0.03,
        mapping: ['u_lineThickness', 'u_shellWidth', 'u_tetraThickness'],
        description: 'Line/edge thickness',
        derived: {
            shellWidth: (value) => value * 0.8,
            tetraThickness: (value) => value * 1.1
        }
    },
    
    // ... continue for all parameters
}
```

### Preset System Architecture
```javascript
presetSystem = {
    // Geometry-specific presets
    presets: {
        'hypercube_default': {
            geometryType: 'hypercube',
            dimension: 4.0,
            morphFactor: 0.7,
            gridDensity: 8.0,
            lineThickness: 0.03,
            rotationSpeed: 0.5
        },
        
        'hypersphere_flow': {
            geometryType: 'hypersphere', 
            dimension: 3.8,
            morphFactor: 0.9,
            gridDensity: 12.0,
            shellWidth: 0.02,
            rotationSpeed: 0.3
        },
        
        'tetrahedron_technical': {
            geometryType: 'hypertetrahedron',
            dimension: 4.2,
            morphFactor: 0.4,
            gridDensity: 6.0,
            tetraThickness: 0.035,
            rotationSpeed: 0.8
        }
    },
    
    applyPreset(name) {
        const preset = this.presets[name];
        if (preset) {
            hypercubeCore.updateParameters(preset);
            updateSliderPositions(preset);
        }
    }
}
```

---

**This is the COMPLETE parameter system with full class structure, cascading relationships, and editor integration. Every parameter maps to actual shader uniforms and follows the proper inheritance chain through GeometryManager → ProjectionManager → HypercubeCore → ShaderManager.**