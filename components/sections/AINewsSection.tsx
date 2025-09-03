/**
 * VIB3CODE-0 AI News Section
 * 
 * Implements AI News section from PDF specification:
 * - Oppose & Snap transition (hover-driven counter-motion with beat snap)
 * - Spring return with chroma trail transition out
 * - Offset rules: hueShift=+0.07, densMul=0.9
 */

'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, ShaderMaterial } from 'three';
import { useStore, useHomeParams, useSectionParams, SECTION_CONFIGS } from '@/lib/store';

// AI News vertex shader with oppose & snap mechanics
const aiNewsVertexShader = `
  uniform float uTime;
  uniform float uHue;
  uniform float uDensity;
  uniform float uMorph;
  uniform float uChaos;
  uniform float uNoiseFreq;
  uniform float uGlitch;
  uniform float uDispAmp;
  uniform float uChromaShift;
  uniform float uTimeScale;
  uniform float uBeatPhase;
  uniform float uOppose; // For oppose & snap pattern
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vOpposeDensity;
  
  // Simplex noise (same as HomeSection)
  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  
  vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  
  vec4 permute(vec4 x) {
    return mod289(((x*34.0)+1.0)*x);
  }
  
  vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
  }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    
    i = mod289(i);
    vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
           
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  
  void main() {
    vUv = uv;
    vNormal = normal;
    
    float time = uTime * uTimeScale;
    
    // Oppose & Snap mechanics (PDF page 3-4)
    // density_k(t) = lerp(density_k0, 1.0 - density_k0, hoverEase(t))
    float opposeDensity = mix(uDensity, 1.0 - uDensity, uOppose);
    vOpposeDensity = opposeDensity;
    
    // AI News specific pattern: data stream visualization
    float streamPattern = sin(position.y * 8.0 - time * 6.0) * 0.1;
    vec3 streamOffset = vec3(streamPattern, 0.0, streamPattern * 0.5);
    
    // Noise displacement with chaos
    vec3 noisePos = position * uNoiseFreq + time;
    float noise = snoise(noisePos) * uChaos;
    
    // Beat snap effect (meet-in-middle on clock beat)
    float beatSnap = sin(uBeatPhase * 3.14159 * 2.0) * 0.1;
    
    // Combined displacement
    vec3 displaced = position + normal * (uDispAmp * noise + beatSnap) + streamOffset;
    
    // Density affects scale with oppose mechanics
    vec3 scaled = displaced * (1.0 + opposeDensity * 0.3);
    
    vPosition = scaled;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(scaled, 1.0);
  }
`;

// AI News fragment shader with hue inversion for non-focused state
const aiNewsFragmentShader = `
  uniform float uTime;
  uniform float uHue;
  uniform float uDensity;
  uniform float uMorph;
  uniform float uChaos;
  uniform float uNoiseFreq;
  uniform float uGlitch;
  uniform float uDispAmp;
  uniform float uChromaShift;
  uniform float uTimeScale;
  uniform float uBeatPhase;
  uniform float uOppose;
  uniform float uHueInvert; // For hue inversion in non-focused state
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vOpposeDensity;
  
  // HSV to RGB conversion
  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }
  
  void main() {
    float time = uTime * uTimeScale;
    
    // AI News hue with shift: hue_i = mod(home.hue + hueShift[i], 1.0)
    // hueShift = +0.07 for AI News
    float baseHue = mod(uHue + 0.07, 1.0);
    
    // Hue inversion for non-focused state (Oppose & Snap pattern)
    float hue = mix(baseHue, 1.0 - baseHue, uHueInvert);
    
    // AI News data stream pattern
    float streamY = fract(vUv.y * 10.0 - time * 2.0);
    float streamLines = step(0.9, streamY) * 0.5 + 0.5;
    
    // Density affects visual intensity (densMul = 0.9 for AI News)
    float intensity = 0.6 + vOpposeDensity * 0.4 + streamLines * 0.2;
    float saturation = 0.7 + vOpposeDensity * 0.3;
    
    // Morph affects data flow speed
    float morphTime = time + sin(vUv.x * 5.0) * uMorph;
    float flowPattern = sin(vUv.y * 20.0 - morphTime * 4.0) * 0.5 + 0.5;
    
    // Base color with AI News theme
    vec3 color = hsv2rgb(vec3(hue, saturation, intensity));
    
    // Add data flow visualization
    color += vec3(0.0, 0.2, 0.4) * flowPattern * uMorph;
    
    // Chromatic aberration with enhanced effect for AI News
    vec2 uvR = vUv + vec2(uChromaShift + 0.05, 0.0); // chromaShift += 0.05
    vec2 uvB = vUv - vec2(uChromaShift + 0.05, 0.0);
    
    // Apply spring return chroma trail effect
    float chromaTrail = sin(time + vUv.x * 10.0) * 0.3 + 0.7;
    color.r *= chromaTrail;
    color.b *= (2.0 - chromaTrail);
    
    // Chaos adds digital noise
    float digitalNoise = fract(sin(dot(vUv * 10.0, vec2(12.9898, 78.233))) * 43758.5453);
    color += (digitalNoise - 0.5) * uChaos * 0.4;
    
    // Beat phase synchronization
    float beatPulse = sin(uBeatPhase * 3.14159 * 2.0) * 0.15 + 1.0;
    color *= beatPulse;
    
    // Oppose pattern affects alpha
    float alpha = 0.7 + vOpposeDensity * 0.2 + streamLines * 0.1;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

export default function AINewsSection() {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const homeParams = useHomeParams();
  const sectionParams = useSectionParams('ai-news');
  const focus = useStore((state) => state.focus);
  const isHovering = useStore((state) => state.isHovering);
  const hoverSection = useStore((state) => state.hoverSection);
  const beatPhase = useStore((state) => state.beatPhase);
  
  // Initialize shader material
  useEffect(() => {
    if (materialRef.current) {
      const material = materialRef.current;
      
      material.uniforms = {
        uTime: { value: 0 },
        uHue: { value: homeParams.hue || 0.6 },
        uDensity: { value: homeParams.density || 0.5 },
        uMorph: { value: homeParams.morph || 1.0 },
        uChaos: { value: homeParams.chaos || 0.2 },
        uNoiseFreq: { value: homeParams.noiseFreq || 2.1 },
        uGlitch: { value: homeParams.glitch || 0.1 },
        uDispAmp: { value: homeParams.dispAmp || 0.2 },
        uChromaShift: { value: homeParams.chromaShift || 0.05 },
        uTimeScale: { value: homeParams.timeScale || 1.0 },
        uBeatPhase: { value: beatPhase },
        uOppose: { value: 0.0 },
        uHueInvert: { value: 0.0 },
      };
    }
  }, []);
  
  // Update uniforms with AI News section parameters
  useFrame((state, delta) => {
    if (materialRef.current && sectionParams) {
      const uniforms = materialRef.current.uniforms;
      
      uniforms.uTime.value += delta;
      
      // Apply AI News parameter derivations (PDF spec)
      uniforms.uHue.value = sectionParams.hue; // Already has hueShift +0.07 applied
      uniforms.uDensity.value = sectionParams.density; // densMul 0.9 applied
      uniforms.uMorph.value = sectionParams.morph;
      uniforms.uChaos.value = sectionParams.chaos;
      uniforms.uNoiseFreq.value = sectionParams.noiseFreq;
      uniforms.uGlitch.value = sectionParams.glitch;
      uniforms.uDispAmp.value = sectionParams.dispAmp;
      uniforms.uChromaShift.value = sectionParams.chromaShift;
      uniforms.uTimeScale.value = sectionParams.timeScale;
      uniforms.uBeatPhase.value = beatPhase;
      
      // Oppose & Snap mechanics
      const isFocused = focus === 'ai-news';
      const isHoveringThis = hoverSection === 'ai-news';
      
      if (isHoveringThis && !isFocused) {
        // Non-focused: hue_j = 1.0 - hue_j (invert hue)
        uniforms.uHueInvert.value = 1.0;
        // density_j(t) = lerp(density_j0, 1.0 - density_k(t), sideEase(t)) * 0.85
        uniforms.uOppose.value = 0.85;
      } else if (isFocused && isHovering) {
        // Focused: density_k(t) = lerp(density_k0, 1.0 - density_k0, hoverEase(t))
        uniforms.uOppose.value = 0.5; // Hover ease interpolation
        uniforms.uHueInvert.value = 0.0; // No hue inversion on focus
      } else {
        uniforms.uOppose.value = 0.0;
        uniforms.uHueInvert.value = 0.0;
      }
    }
    
    // AI News specific animation: data stream flow
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });
  
  const isActive = focus === 'ai-news';
  
  return (
    <group visible={isActive}>
      {/* Main AI News visualization plane */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <planeGeometry args={[4, 4, 64, 64]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={aiNewsVertexShader}
          fragmentShader={aiNewsFragmentShader}
          transparent
          side={2}
        />
      </mesh>
      
      {/* Data stream particle system */}
      <points position={[0, 0, -0.5]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={150}
            array={new Float32Array(Array.from({ length: 450 }, (_, i) => {
              const x = (Math.random() - 0.5) * 6;
              const y = (Math.random() - 0.5) * 6;
              const z = Math.random() * 2 - 1;
              return [x, y, z][i % 3];
            }))}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          color={`hsl(${((homeParams.hue + 0.07) % 1.0) * 360}, 80%, 70%)`}
          transparent
          opacity={(sectionParams?.density || 0.5) * 0.8}
        />
      </points>
      
      {/* Background grid for data visualization theme */}
      <lineSegments position={[0, 0, -1]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={400}
            array={new Float32Array(Array.from({ length: 1200 }, (_, i) => {
              const gridSize = 8;
              const step = gridSize / 20;
              const x = ((i % 40) - 20) * step;
              const y = (Math.floor(i / 40) - 10) * step;
              return [x, y, 0][i % 3];
            }))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={`hsl(${((homeParams.hue + 0.07) % 1.0) * 360}, 60%, 40%)`}
          transparent
          opacity={(sectionParams?.density || 0.5) * 0.3}
        />
      </lineSegments>
    </group>
  );
}