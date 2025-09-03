/**
 * VIB3CODE-0 Vibe Coding Section
 * 
 * Implements Vibe Coding section from PDF specification:
 * - Morph/Chaos Swap transition (focused clarity, peripheral frenzy)
 * - Peripheral frenzy decay transition out
 * - Offset rules: chaosMul=1.1, morphMul=1.2
 */

'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, ShaderMaterial } from 'three';
import { useStore, useHomeParams, useSectionParams } from '@/lib/store';

// Vibe Coding vertex shader with morph/chaos swap mechanics
const vibeCodingVertexShader = `
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
  uniform float uFocusedCalm; // For morph/chaos swap pattern
  uniform float uPeripheralFrenzy; // For background eruption
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vCodeFlow;
  
  // Simplex noise function
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
    
    // Morph/Chaos Swap mechanics (PDF page 4-5)
    // Focused: morph_k → 0.0, chaos_k → 0.0 (crystalline calm)
    float calmMorph = mix(uMorph, 0.0, uFocusedCalm);
    float calmChaos = mix(uChaos, 0.0, uFocusedCalm);
    
    // Peripheral frenzy: chaos_P ← min(1.0, chaos_P + 0.7)
    float frenzyMorph = mix(uMorph, uMorph + 0.05, uPeripheralFrenzy);
    float frenzyChaos = mix(uChaos, min(1.0, uChaos + 0.7), uPeripheralFrenzy);
    
    // Code flow pattern (represents programming/coding)
    float codeFlow = sin(position.x * 12.0 + time * 4.0) * cos(position.y * 8.0 + time * 3.0);
    vCodeFlow = codeFlow;
    
    // Matrix/terminal pattern
    float matrixPattern = step(0.8, fract(position.y * 20.0 - time * 6.0));
    vec3 matrixOffset = vec3(matrixPattern * 0.1, 0.0, matrixPattern * 0.05);
    
    // Noise displacement with swapped chaos/morph
    vec3 noisePos = position * uNoiseFreq + time;
    float noise = snoise(noisePos) * frenzyChaos;
    
    // Morph creates geometric deformation
    vec3 morphTarget = position + normalize(position) * 0.3;
    vec3 morphedPos = mix(position, morphTarget, calmMorph);
    
    // Combined displacement
    vec3 displaced = morphedPos + normal * (uDispAmp * noise) + matrixOffset;
    
    // Density scaling
    vec3 scaled = displaced * (1.0 + uDensity * 0.25);
    
    vPosition = scaled;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(scaled, 1.0);
  }
`;

// Vibe Coding fragment shader with code/matrix theme
const vibeCodingFragmentShader = `
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
  uniform float uFocusedCalm;
  uniform float uPeripheralFrenzy;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vCodeFlow;
  
  // HSV to RGB conversion
  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }
  
  // Digital/matrix pattern
  float digitalPattern(vec2 uv, float time) {
    vec2 id = floor(uv * 20.0);
    float random = fract(sin(dot(id, vec2(12.9898, 78.233))) * 43758.5453);
    float blink = step(0.9, fract(random * 100.0 + time * 3.0));
    return blink;
  }
  
  void main() {
    float time = uTime * uTimeScale;
    
    // Vibe Coding base hue (hueShift = 0 for this section)
    float hue = mod(uHue + 0.0, 1.0);
    
    // Digital matrix overlay
    float matrix = digitalPattern(vUv, time);
    float codeLines = step(0.95, fract(vUv.y * 40.0 - time * 8.0));
    
    // Focused calm vs peripheral frenzy color mixing
    float calmIntensity = 0.4 + uFocusedCalm * 0.3; // Calm = lower intensity
    float frenzyIntensity = 0.8 + uPeripheralFrenzy * 0.2; // Frenzy = higher intensity
    
    float intensity = mix(frenzyIntensity, calmIntensity, uFocusedCalm);
    float saturation = 0.6 + (1.0 - uFocusedCalm) * 0.4; // Calm = less saturated
    
    // Code flow affects hue variation
    float codeHue = hue + vCodeFlow * 0.1 * (1.0 - uFocusedCalm);
    
    // Base color with vibe coding theme (green/cyan coding colors)
    vec3 baseColor = hsv2rgb(vec3(codeHue, saturation, intensity));
    
    // Add matrix/terminal green when calm (focused coding state)
    vec3 terminalGreen = vec3(0.0, 1.0, 0.3);
    baseColor = mix(baseColor, terminalGreen, uFocusedCalm * 0.4);
    
    // Add chaotic color shifts when in frenzy mode
    vec3 chaosColor = hsv2rgb(vec3(hue + 0.3, 1.0, 0.9));
    baseColor = mix(baseColor, chaosColor, uPeripheralFrenzy * 0.3);
    
    // Digital effects
    baseColor += vec3(matrix * 0.5);
    baseColor += vec3(codeLines * 0.3);
    
    // Morph/Chaos swap visual effects
    // When focused: clean, stable lines
    // When peripheral: rapid eruption of chaos
    float stabilityFactor = uFocusedCalm;
    float eruptionFactor = uPeripheralFrenzy;
    
    // Stable focused state - clean geometric patterns
    float geometricPattern = sin(vUv.x * 10.0) * sin(vUv.y * 10.0);
    baseColor += vec3(geometricPattern * 0.2 * stabilityFactor);
    
    // Chaotic eruption - rapid noise bursts
    float chaosNoise = fract(sin(dot(vUv * 50.0, vec2(12.9898, 78.233)) + time * 10.0) * 43758.5453);
    baseColor += (chaosNoise - 0.5) * eruptionFactor * 0.6;
    
    // Beat phase synchronization
    float beatPulse = sin(uBeatPhase * 3.14159 * 2.0) * 0.1 + 1.0;
    baseColor *= beatPulse;
    
    // timeScale affects rapid changes in peripheral state
    float rapidChange = sin(time * 20.0) * uPeripheralFrenzy * 0.1;
    baseColor += vec3(rapidChange);
    
    // Alpha based on coding intensity
    float alpha = 0.6 + intensity * 0.3 + matrix * 0.1;
    
    gl_FragColor = vec4(baseColor, alpha);
  }
`;

export default function VibeCodingSection() {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const homeParams = useHomeParams();
  const sectionParams = useSectionParams('vibe-coding');
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
        uFocusedCalm: { value: 0.0 },
        uPeripheralFrenzy: { value: 0.0 },
      };
    }
  }, []);
  
  // Update uniforms with Morph/Chaos Swap mechanics
  useFrame((state, delta) => {
    if (materialRef.current && sectionParams) {
      const uniforms = materialRef.current.uniforms;
      
      uniforms.uTime.value += delta;
      
      // Apply Vibe Coding parameter derivations (PDF spec)
      // chaosMul=1.1, morphMul=1.2
      uniforms.uHue.value = sectionParams.hue;
      uniforms.uDensity.value = sectionParams.density;
      uniforms.uMorph.value = sectionParams.morph; // morphMul=1.2 applied in store
      uniforms.uChaos.value = sectionParams.chaos; // chaosMul=1.1 applied in store
      uniforms.uNoiseFreq.value = sectionParams.noiseFreq;
      uniforms.uGlitch.value = sectionParams.glitch;
      uniforms.uDispAmp.value = sectionParams.dispAmp;
      uniforms.uChromaShift.value = sectionParams.chromaShift;
      uniforms.uTimeScale.value = sectionParams.timeScale;
      uniforms.uBeatPhase.value = beatPhase;
      
      // Morph/Chaos Swap mechanics (PDF page 4-5)
      const isFocused = focus === 'vibe-coding';
      const isHoveringThis = hoverSection === 'vibe-coding';
      
      if (isFocused && isHovering) {
        // Focused: morph_k → 0.0, chaos_k → 0.0 over 150-300ms (crystalline calm)
        uniforms.uFocusedCalm.value = Math.min(1.0, uniforms.uFocusedCalm.value + delta * 4.0);
        uniforms.uPeripheralFrenzy.value = Math.max(0.0, uniforms.uPeripheralFrenzy.value - delta * 3.0);
      } else if (!isFocused && isHoveringThis) {
        // Background/parent: chaos_P ← min(1.0, chaos_P + 0.7) and timeScale_P += 0.25
        uniforms.uPeripheralFrenzy.value = Math.min(1.0, uniforms.uPeripheralFrenzy.value + delta * 5.0);
        uniforms.uFocusedCalm.value = Math.max(0.0, uniforms.uFocusedCalm.value - delta * 4.0);
        
        // Rapid eruption: timeScale += 0.25
        uniforms.uTimeScale.value = sectionParams.timeScale + 0.25;
      } else {
        // Decay back with τ≈1.2s after hover end
        uniforms.uFocusedCalm.value = Math.max(0.0, uniforms.uFocusedCalm.value - delta * 0.8);
        uniforms.uPeripheralFrenzy.value = Math.max(0.0, uniforms.uPeripheralFrenzy.value - delta * 0.8);
        uniforms.uTimeScale.value = sectionParams.timeScale;
      }
    }
    
    // Vibe coding specific animation: matrix scroll effect
    if (meshRef.current) {
      // Subtle rotation for coding flow
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
      
      // Scale pulsing based on focus state
      const focusScale = focus === 'vibe-coding' ? 1.1 : 1.0;
      const targetScale = focusScale + Math.sin(state.clock.elapsedTime * 2.0) * 0.02;
      meshRef.current.scale.setScalar(targetScale);
    }
  });
  
  const isActive = focus === 'vibe-coding';
  
  return (
    <group visible={isActive}>
      {/* Main Vibe Coding visualization plane */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <planeGeometry args={[4, 4, 64, 64]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vibeCodingVertexShader}
          fragmentShader={vibeCodingFragmentShader}
          transparent
          side={2}
        />
      </mesh>
      
      {/* Matrix code rain effect */}
      <points position={[0, 0, -0.3]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={300}
            array={new Float32Array(Array.from({ length: 900 }, (_, i) => {
              const x = (Math.random() - 0.5) * 8;
              const y = Math.random() * 10 - 5;
              const z = Math.random() * 1;
              return [x, y, z][i % 3];
            }))}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          color={focus === 'vibe-coding' ? '#00ff88' : `hsl(${homeParams.hue * 360}, 60%, 50%)`}
          transparent
          opacity={(sectionParams?.density || 0.5) * 0.7}
        />
      </points>
      
      {/* Geometric code structures */}
      <group position={[0, 0, -0.8]}>
        {Array.from({ length: 5 }, (_, i) => (
          <mesh
            key={i}
            position={[
              (i - 2) * 1.5,
              Math.sin(i * 0.5) * 0.5,
              0
            ]}
            rotation={[0, 0, i * 0.3]}
          >
            <boxGeometry args={[0.1, 2, 0.1]} />
            <meshBasicMaterial
              color={`hsl(${((homeParams.hue + i * 0.1) % 1.0) * 360}, 70%, 60%)`}
              transparent
              opacity={(sectionParams?.morph || 1.0) * 0.4}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}