/**
 * VIB3CODE-0 Info Theory Section
 * 
 * Implements Info Theory section from PDF specification:
 * - Spectral slice intro (chromaShift↑) transition in
 * - Spectral merge transition out  
 * - Offset rules: noiseFreqMul=0.8, dispAmp+0.05
 */

'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, ShaderMaterial } from 'three';
import { useStore, useHomeParams, useSectionParams } from '@/lib/store';

// Info Theory vertex shader with spectral slice mechanics
const infoTheoryVertexShader = `
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
  uniform float uSpectralSlice; // For spectral slice transition
  uniform float uInfoEntropy; // Information theory entropy visualization
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vInformation;
  varying float vEntropy;
  
  // Simplex noise function (3D)
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
    
    // Information theory visualization: entropy and information content
    // Higher entropy = more random, lower entropy = more structured
    vec3 infoPos = position * uNoiseFreq * 0.8; // noiseFreqMul = 0.8
    float entropy = abs(snoise(infoPos + time));
    float information = 1.0 - entropy; // Information is inverse of entropy
    
    vEntropy = entropy;
    vInformation = information;
    
    // Spectral slice transition effect
    float slicePosition = position.x + sin(position.y * 5.0 + time) * 0.2;
    float spectralMask = smoothstep(-1.0, 1.0, slicePosition + uSpectralSlice * 4.0 - 2.0);
    
    // Information density waves
    float infoDensity = sin(position.x * 8.0 + entropy * 10.0 - time * 3.0) * 0.1;
    float infoWaves = cos(position.y * 6.0 + information * 8.0 - time * 2.0) * 0.05;
    
    // Enhanced displacement amplitude (dispAmp + 0.05)
    float enhancedDispAmp = uDispAmp + 0.05;
    
    // Noise displacement with information theory modulation
    vec3 noisePos = position * uNoiseFreq + time;
    float noise = snoise(noisePos) * uChaos;
    
    // Information-based displacement
    vec3 infoDisplacement = normal * (enhancedDispAmp * noise + infoDensity + infoWaves);
    
    // Spectral slice displacement
    vec3 spectralOffset = vec3(0.0, 0.0, spectralMask * 0.3);
    
    // Combined displacement
    vec3 displaced = position + infoDisplacement + spectralOffset;
    
    // Density affects overall scaling
    vec3 scaled = displaced * (1.0 + uDensity * 0.2);
    
    vPosition = scaled;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(scaled, 1.0);
  }
`;

// Info Theory fragment shader with spectral and information visualization
const infoTheoryFragmentShader = `
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
  uniform float uSpectralSlice;
  uniform float uInfoEntropy;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vInformation;
  varying float vEntropy;
  
  // HSV to RGB conversion
  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }
  
  // Information theory color mapping
  vec3 entropyToColor(float entropy, float information, float baseHue) {
    // High entropy = warm colors (red/orange), Low entropy = cool colors (blue/violet)
    float entropyHue = baseHue + (entropy - 0.5) * 0.3;
    
    // Information content affects saturation
    float saturation = 0.5 + information * 0.5;
    
    // Combined intensity
    float intensity = 0.4 + (entropy + information) * 0.3;
    
    return hsv2rgb(vec3(entropyHue, saturation, intensity));
  }
  
  void main() {
    float time = uTime * uTimeScale;
    
    // Info Theory base hue (hueShift = 0 for this section)
    float hue = mod(uHue + 0.0, 1.0);
    
    // Spectral slice effect with enhanced chromaShift
    float spectralIntensity = uSpectralSlice;
    float enhancedChromaShift = uChromaShift + spectralIntensity * 0.1;
    
    // Information theory visualization
    vec3 infoColor = entropyToColor(vEntropy, vInformation, hue);
    
    // Binary/digital information patterns
    float binaryPattern = step(0.5, fract(vUv.x * 20.0 + vEntropy * 10.0));
    float hexPattern = step(0.8, fract(vUv.y * 15.0 + vInformation * 8.0 - time));
    
    // Spectral dispersion effect (chromatic aberration)
    vec2 uvR = vUv + vec2(enhancedChromaShift, 0.0);
    vec2 uvG = vUv;
    vec2 uvB = vUv - vec2(enhancedChromaShift, 0.0);
    
    // Sample colors with spectral shift
    float red = hsv2rgb(vec3(hue + 0.05, 0.8, 0.8)).r;
    float green = hsv2rgb(vec3(hue, 0.8, 0.8)).g;
    float blue = hsv2rgb(vec3(hue - 0.05, 0.8, 0.8)).b;
    
    vec3 spectralColor = vec3(red, green, blue);
    
    // Mix information color with spectral color
    vec3 baseColor = mix(infoColor, spectralColor, spectralIntensity * 0.7);
    
    // Add information patterns
    baseColor += vec3(binaryPattern * 0.2);
    baseColor += vec3(0.0, hexPattern * 0.3, 0.0);
    
    // Information flow visualization
    float infoFlow = sin(vUv.x * 10.0 - time * 4.0) * sin(vUv.y * 8.0 + vEntropy * 5.0);
    baseColor += infoFlow * 0.1 * vec3(1.0, 0.8, 0.6);
    
    // Entropy noise overlay
    float entropyNoise = fract(sin(dot(vUv * 30.0, vec2(12.9898, 78.233)) + vEntropy * 100.0) * 43758.5453);
    baseColor += (entropyNoise - 0.5) * uChaos * 0.3;
    
    // Spectral merge effect (transition out)
    float mergeEffect = 1.0 - spectralIntensity;
    baseColor *= mergeEffect;
    
    // Beat phase affects information pulse
    float beatPulse = sin(uBeatPhase * 3.14159 * 2.0) * 0.1 + 1.0;
    baseColor *= beatPulse;
    
    // Information density affects alpha
    float alpha = 0.6 + vInformation * 0.3 + binaryPattern * 0.1;
    alpha *= mergeEffect;
    
    gl_FragColor = vec4(baseColor, alpha);
  }
`;

export default function InfoTheorySection() {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const homeParams = useHomeParams();
  const sectionParams = useSectionParams('info-theory');
  const focus = useStore((state) => state.focus);
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
        uSpectralSlice: { value: 0.0 },
        uInfoEntropy: { value: 0.5 },
      };
    }
  }, []);
  
  // Update uniforms with Info Theory mechanics
  useFrame((state, delta) => {
    if (materialRef.current && sectionParams) {
      const uniforms = materialRef.current.uniforms;
      
      uniforms.uTime.value += delta;
      
      // Apply Info Theory parameter derivations (PDF spec)
      // noiseFreqMul=0.8, dispAmp+0.05
      uniforms.uHue.value = sectionParams.hue;
      uniforms.uDensity.value = sectionParams.density;
      uniforms.uMorph.value = sectionParams.morph;
      uniforms.uChaos.value = sectionParams.chaos;
      uniforms.uNoiseFreq.value = sectionParams.noiseFreq; // noiseFreqMul=0.8 applied
      uniforms.uGlitch.value = sectionParams.glitch;
      uniforms.uDispAmp.value = sectionParams.dispAmp; // dispAmp+0.05 applied in vertex shader
      uniforms.uChromaShift.value = sectionParams.chromaShift;
      uniforms.uTimeScale.value = sectionParams.timeScale;
      uniforms.uBeatPhase.value = beatPhase;
      
      // Spectral slice transition mechanics
      const isFocused = focus === 'info-theory';
      const time = state.clock.elapsedTime;
      
      if (isFocused) {
        // Spectral slice intro: gradual reveal with chromaShift increase
        uniforms.uSpectralSlice.value = Math.min(1.0, uniforms.uSpectralSlice.value + delta * 2.0);
      } else {
        // Spectral merge: gradual merge back
        uniforms.uSpectralSlice.value = Math.max(0.0, uniforms.uSpectralSlice.value - delta * 1.5);
      }
      
      // Information entropy simulation
      uniforms.uInfoEntropy.value = 0.5 + Math.sin(time * 0.5) * 0.3;
    }
    
    // Info Theory specific animations
    if (meshRef.current) {
      // Spectral wave distortion
      const spectralWave = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
      meshRef.current.rotation.x = spectralWave;
      
      // Information density pulsing
      const infoPulse = 1.0 + Math.sin(state.clock.elapsedTime * 3.0) * 0.03;
      meshRef.current.scale.setScalar(infoPulse);
    }
  });
  
  const isActive = focus === 'info-theory';
  
  return (
    <group visible={isActive}>
      {/* Main Info Theory visualization plane */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <planeGeometry args={[4, 4, 64, 64]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={infoTheoryVertexShader}
          fragmentShader={infoTheoryFragmentShader}
          transparent
          side={2}
        />
      </mesh>
      
      {/* Information flow particles */}
      <points position={[0, 0, -0.5]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={400}
            array={new Float32Array(Array.from({ length: 1200 }, (_, i) => {
              const angle = (i / 400) * Math.PI * 2;
              const radius = 2 + Math.random() * 3;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              const z = (Math.random() - 0.5) * 2;
              return [x, y, z][i % 3];
            }))}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.01}
          color={`hsl(${homeParams.hue * 360}, 60%, 70%)`}
          transparent
          opacity={(sectionParams?.density || 0.5) * 0.6}
        />
      </points>
      
      {/* Binary information grid */}
      <group position={[0, 0, -1]}>
        {Array.from({ length: 64 }, (_, i) => {
          const x = (i % 8 - 3.5) * 0.5;
          const y = (Math.floor(i / 8) - 3.5) * 0.5;
          const binary = Math.random() > 0.5 ? 1 : 0;
          
          return binary ? (
            <mesh
              key={i}
              position={[x, y, 0]}
              scale={[0.03, 0.03, 0.03]}
            >
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial
                color={`hsl(${homeParams.hue * 360}, 70%, 60%)`}
                transparent
                opacity={(sectionParams?.information || 0.5) * 0.8}
              />
            </mesh>
          ) : null;
        })}
      </group>
      
      {/* Spectral wavelength visualization */}
      <group position={[0, 0, -0.8]}>
        {Array.from({ length: 7 }, (_, i) => {
          const wavelength = 380 + i * 40; // Visible spectrum wavelengths
          const hue = (wavelength - 380) / 320; // Map to hue
          
          return (
            <mesh
              key={i}
              position={[(i - 3) * 0.8, 0, 0]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.02, 0.02, 3]} />
              <meshBasicMaterial
                color={`hsl(${hue * 360}, 100%, 60%)`}
                transparent
                opacity={focus === 'info-theory' ? 0.6 : 0.2}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}