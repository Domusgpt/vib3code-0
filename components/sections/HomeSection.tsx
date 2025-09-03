/**
 * VIB3CODE-0 Home Section
 * 
 * Implements Home section from PDF specification:
 * - Radial hologram expand transition in
 * - Dissolve into portal field transition out
 * - Base parameter state (hueShift=0, densMul=1, glitchBias=+0.05)
 */

'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, ShaderMaterial } from 'three';
import { useStore, useHomeParams, SECTION_CONFIGS } from '@/lib/store';

// Holographic vertex shader for radial expansion
const holographicVertexShader = `
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
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vGlitch;
  
  // Noise function for displacement
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
    
    // Time scaling from PDF spec
    float time = uTime * uTimeScale;
    
    // Radial hologram expansion effect (Home section specific)
    float radialDistance = length(position.xy);
    float radialExpansion = sin(radialDistance * 3.0 - time * 2.0) * 0.1 * uMorph;
    
    // Noise displacement with chaos control
    vec3 noisePos = position * uNoiseFreq + time;
    float noise = snoise(noisePos) * uChaos;
    
    // Glitch displacement (PDF: glitchBias = +0.05 for Home)
    float glitchNoise = snoise(position * 20.0 + time * 10.0);
    float glitch = step(0.95, glitchNoise) * uGlitch * 0.5;
    
    // Combined displacement
    vec3 displaced = position + normal * (uDispAmp * noise + radialExpansion + glitch);
    
    // Density-based scaling
    vec3 scaled = displaced * (1.0 + uDensity * 0.2);
    
    vPosition = scaled;
    vGlitch = glitch;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(scaled, 1.0);
  }
`;

// Holographic fragment shader with HSV color space
const holographicFragmentShader = `
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
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vGlitch;
  
  // HSV to RGB conversion
  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }
  
  void main() {
    float time = uTime * uTimeScale;
    
    // Base holographic hue (PDF: hue_i = mod(home.hue + hueShift[i], 1.0))
    float hue = mod(uHue + 0.0, 1.0); // hueShift = 0 for Home section
    
    // Radial hologram pattern
    float radialDistance = length(vUv - 0.5);
    float radialPattern = sin(radialDistance * 20.0 - time * 4.0) * 0.5 + 0.5;
    
    // Density affects saturation and brightness
    float saturation = 0.8 + uDensity * 0.2;
    float brightness = 0.6 + uDensity * 0.3 + radialPattern * 0.2;
    
    // Morph affects hue shift
    float morphHue = hue + sin(time + radialDistance * 5.0) * uMorph * 0.1;
    
    // Base holographic color
    vec3 color = hsv2rgb(vec3(morphHue, saturation, brightness));
    
    // Chromatic aberration effect
    vec2 uvR = vUv + vec2(uChromaShift, 0.0);
    vec2 uvB = vUv - vec2(uChromaShift, 0.0);
    
    // Apply chromatic shift to color channels
    float redChannel = hsv2rgb(vec3(morphHue + 0.05, saturation, brightness)).r;
    float blueChannel = hsv2rgb(vec3(morphHue - 0.05, saturation, brightness)).b;
    
    color.r = mix(color.r, redChannel, uChromaShift * 10.0);
    color.b = mix(color.b, blueChannel, uChromaShift * 10.0);
    
    // Glitch effect (sudden brightness spikes)
    color += vec3(vGlitch * 2.0);
    
    // Chaos adds noise to the final color
    float noiseVal = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
    color += (noiseVal - 0.5) * uChaos * 0.3;
    
    // Beat phase affects overall intensity
    float beatPulse = sin(uBeatPhase * 3.14159 * 2.0) * 0.1 + 1.0;
    color *= beatPulse;
    
    // Holographic transparency based on radial distance
    float alpha = (1.0 - radialDistance) * 0.8 + 0.2;
    alpha *= (1.0 - uGlitch * 0.5); // Glitch reduces opacity
    
    gl_FragColor = vec4(color, alpha);
  }
`;

export default function HomeSection() {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const homeParams = useHomeParams();
  const focus = useStore((state) => state.focus);
  const beatPhase = useStore((state) => state.beatPhase);
  
  // Initialize shader material with uniforms
  useEffect(() => {
    if (materialRef.current) {
      const material = materialRef.current;
      
      // Set initial uniform values from home parameters
      material.uniforms = {
        uTime: { value: 0 },
        uHue: { value: homeParams.hue || 0.6 },
        uDensity: { value: homeParams.density || 0.5 },
        uMorph: { value: homeParams.morph || 1.0 },
        uChaos: { value: homeParams.chaos || 0.2 },
        uNoiseFreq: { value: homeParams.noiseFreq || 2.1 },
        uGlitch: { value: homeParams.glitch + 0.05 || 0.15 }, // glitchBias = +0.05
        uDispAmp: { value: homeParams.dispAmp || 0.2 },
        uChromaShift: { value: homeParams.chromaShift || 0.05 },
        uTimeScale: { value: homeParams.timeScale || 1.0 },
        uBeatPhase: { value: beatPhase },
      };
    }
  }, []);
  
  // Update uniforms when parameters change
  useFrame((state, delta) => {
    if (materialRef.current) {
      const uniforms = materialRef.current.uniforms;
      
      // Update time
      uniforms.uTime.value += delta;
      
      // Update parameters (Home section: densMul=1, hueShift=0 from PDF)
      uniforms.uHue.value = (homeParams.hue + 0.0) % 1.0; // hueShift = 0
      uniforms.uDensity.value = Math.max(0.0, Math.min(1.0, homeParams.density * 1.0 + 0.0)); // densMul=1, densAdd=0
      uniforms.uMorph.value = Math.max(0.0, Math.min(1.0, homeParams.morph * 1.0 + 0.0)); // morphMul=1, morphAdd=0
      uniforms.uChaos.value = Math.max(0.0, Math.min(1.0, homeParams.chaos * 1.0 + 0.0)); // chaosMul=1, chaosAdd=0
      uniforms.uGlitch.value = Math.max(0.0, homeParams.glitch + 0.05); // glitchBias = +0.05
      uniforms.uNoiseFreq.value = homeParams.noiseFreq * 1.0; // noiseFreqMul = 1.0
      uniforms.uTimeScale.value = homeParams.timeScale * 1.0; // timeScaleMul = 1.0
      uniforms.uDispAmp.value = homeParams.dispAmp;
      uniforms.uChromaShift.value = homeParams.chromaShift;
      uniforms.uBeatPhase.value = beatPhase;
    }
    
    // Radial hologram rotation effect
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
  });
  
  const isActive = focus === 'home' || focus === undefined;
  
  return (
    <group visible={isActive}>
      {/* Main holographic plane */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <planeGeometry args={[4, 4, 64, 64]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={holographicVertexShader}
          fragmentShader={holographicFragmentShader}
          transparent
          side={2} // DoubleSide
        />
      </mesh>
      
      {/* Additional holographic layers for depth */}
      <mesh position={[0, 0, -0.5]} rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry args={[3, 3, 32, 32]} />
        <shaderMaterial
          vertexShader={holographicVertexShader}
          fragmentShader={holographicFragmentShader}
          transparent
          uniforms={{
            uTime: { value: 0 },
            uHue: { value: (homeParams.hue + 0.1) % 1.0 },
            uDensity: { value: homeParams.density * 0.7 },
            uMorph: { value: homeParams.morph * 0.8 },
            uChaos: { value: homeParams.chaos * 0.6 },
            uNoiseFreq: { value: homeParams.noiseFreq * 0.8 },
            uGlitch: { value: (homeParams.glitch + 0.05) * 0.5 },
            uDispAmp: { value: homeParams.dispAmp * 0.5 },
            uChromaShift: { value: homeParams.chromaShift * 0.7 },
            uTimeScale: { value: homeParams.timeScale },
            uBeatPhase: { value: beatPhase },
          }}
          side={2}
        />
      </mesh>
      
      {/* Particle field for added depth */}
      <points position={[0, 0, -1]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={200}
            array={new Float32Array(Array.from({ length: 600 }, () => (Math.random() - 0.5) * 8))}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color={`hsl(${homeParams.hue * 360}, 70%, 60%)`}
          transparent
          opacity={homeParams.density * 0.6}
        />
      </points>
    </group>
  );
}