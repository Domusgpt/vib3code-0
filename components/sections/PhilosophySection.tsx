/**
 * VIB3CODE-0 Philosophy Section
 * 
 * Implements Philosophy section from PDF specification:
 * - Slow portal peel (dispAmp↑) transition in
 * - Reseal with low glitch transition out
 * - Offset rules: glitchBias=-0.03, timeScale=0.9, densAdd=0.05
 */

'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, ShaderMaterial } from 'three';
import { useStore, useHomeParams, useSectionParams } from '@/lib/store';

// Philosophy vertex shader with portal peel mechanics
const philosophyVertexShader = `
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
  uniform float uPortalPeel; // For portal peel transition
  uniform float uPhilosophicalDepth; // For contemplative depth
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vContemplation;
  varying float vPortalDepth;
  
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
    
    // Slowed time for contemplative effect (timeScale = 0.9)
    float time = uTime * uTimeScale; // timeScale = 0.9 applied
    
    // Portal peel effect: slow dimensional peeling
    float radialDistance = length(uv - 0.5);
    float portalMask = smoothstep(0.0, 1.0, radialDistance - uPortalPeel + 0.5);
    vPortalDepth = portalMask;
    
    // Philosophical contemplation waves (slow, deep)
    float contemplativeWave = sin(time * 0.3 + radialDistance * 8.0) * 0.1;
    vContemplation = contemplativeWave;
    
    // Depth layering for philosophical abstraction
    float depthLayers = sin(position.x * 2.0 + time * 0.5) * cos(position.y * 3.0 + time * 0.4);
    vec3 layeredOffset = vec3(0.0, 0.0, depthLayers * uPhilosophicalDepth * 0.2);
    
    // Enhanced displacement for portal effect
    vec3 noisePos = position * uNoiseFreq + time;
    float noise = snoise(noisePos) * uChaos;
    
    // Portal peel displacement (dispAmp enhanced during transition)
    float portalDispAmp = uDispAmp * (1.0 + uPortalPeel * 0.5);
    vec3 portalDisplacement = normal * (portalDispAmp * noise + contemplativeWave);
    
    // Philosophical depth creates inward pull
    vec3 depthPull = normalize(position) * (-uPhilosophicalDepth * 0.1);
    
    // Combined displacement
    vec3 displaced = position + portalDisplacement + layeredOffset + depthPull;
    
    // Density with additive offset (densAdd = 0.05)
    float enhancedDensity = uDensity; // densAdd applied in store derivation
    vec3 scaled = displaced * (1.0 + enhancedDensity * 0.15);
    
    vPosition = scaled;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(scaled, 1.0);
  }
`;

// Philosophy fragment shader with portal and contemplative effects
const philosophyFragmentShader = `
  uniform float uTime;
  uniform float uHue;
  uniform float uDensity;
  uniform float uMorph;
  uniform float uChaos;
  uniform float uNoiseFreq;
  uniform float uGlitch; // Reduced glitch (glitchBias = -0.03)
  uniform float uDispAmp;
  uniform float uChromaShift;
  uniform float uTimeScale;
  uniform float uBeatPhase;
  uniform float uPortalPeel;
  uniform float uPhilosophicalDepth;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vContemplation;
  varying float vPortalDepth;
  
  // HSV to RGB conversion
  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }
  
  // Philosophical color palette (deep, contemplative colors)
  vec3 philosophicalPalette(float baseHue, float contemplation, float depth) {
    // Deep purples, blues, and violets for contemplation
    float philoHue = baseHue + contemplation * 0.1;
    float saturation = 0.4 + depth * 0.4; // Deeper = more saturated
    float intensity = 0.3 + (1.0 - depth) * 0.4; // Depth reduces brightness
    
    return hsv2rgb(vec3(philoHue, saturation, intensity));
  }
  
  void main() {
    float time = uTime * uTimeScale;
    
    // Philosophy base hue (hueShift = 0 for this section)  
    float hue = mod(uHue + 0.0, 1.0);
    
    // Portal peel visual effect
    float portalGlow = 1.0 - vPortalDepth;
    float portalRing = smoothstep(0.02, 0.0, abs(vPortalDepth - 0.5));
    
    // Contemplative color mixing
    vec3 baseColor = philosophicalPalette(hue, vContemplation, uPhilosophicalDepth);
    
    // Portal effects
    vec3 portalColor = vec3(0.5, 0.3, 0.8); // Deep purple portal
    baseColor = mix(baseColor, portalColor, portalGlow * 0.3);
    baseColor += portalRing * vec3(0.8, 0.6, 1.0) * 0.5;
    
    // Philosophical thought patterns (slow, organic)
    float thoughtPattern = sin(vUv.x * 6.0 + time * 0.2) * sin(vUv.y * 4.0 + time * 0.15);
    baseColor += thoughtPattern * 0.1 * vec3(0.6, 0.4, 0.8);
    
    // Reduced glitch effect (glitchBias = -0.03, so less glitch)
    float reducedGlitch = max(0.0, uGlitch); // Already reduced by negative bias
    float glitchNoise = fract(sin(dot(vUv * 20.0, vec2(12.9898, 78.233)) + time * 5.0) * 43758.5453);
    baseColor += (glitchNoise - 0.5) * reducedGlitch * 0.2;
    
    // Contemplative breathing effect
    float breathe = sin(time * 0.8) * 0.1 + 0.9;
    baseColor *= breathe;
    
    // Portal depth affects transparency and luminosity
    float depthAlpha = 0.4 + vPortalDepth * 0.4;
    float contemplativeGlow = 0.5 + vContemplation * 0.3;
    
    // Beat phase with philosophical rhythm (slower, deeper)
    float philoBeat = sin(uBeatPhase * 3.14159 * 2.0 * 0.5) * 0.08 + 1.0;
    baseColor *= philoBeat;
    
    // Reseal effect (when transitioning out)
    float resealEffect = 1.0 - uPortalPeel;
    baseColor *= (0.5 + resealEffect * 0.5);
    
    // Final alpha with contemplative depth
    float alpha = depthAlpha * contemplativeGlow * (0.7 + resealEffect * 0.3);
    
    gl_FragColor = vec4(baseColor, alpha);
  }
`;

export default function PhilosophySection() {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const homeParams = useHomeParams();
  const sectionParams = useSectionParams('philosophy');
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
        uPortalPeel: { value: 0.0 },
        uPhilosophicalDepth: { value: 0.5 },
      };
    }
  }, []);
  
  // Update uniforms with Philosophy mechanics
  useFrame((state, delta) => {
    if (materialRef.current && sectionParams) {
      const uniforms = materialRef.current.uniforms;
      
      uniforms.uTime.value += delta;
      
      // Apply Philosophy parameter derivations (PDF spec)
      // glitchBias=-0.03, timeScale=0.9, densAdd=0.05
      uniforms.uHue.value = sectionParams.hue;
      uniforms.uDensity.value = sectionParams.density; // densAdd=0.05 applied
      uniforms.uMorph.value = sectionParams.morph;
      uniforms.uChaos.value = sectionParams.chaos;
      uniforms.uNoiseFreq.value = sectionParams.noiseFreq;
      uniforms.uGlitch.value = sectionParams.glitch; // glitchBias=-0.03 applied
      uniforms.uDispAmp.value = sectionParams.dispAmp;
      uniforms.uChromaShift.value = sectionParams.chromaShift;
      uniforms.uTimeScale.value = sectionParams.timeScale; // timeScale=0.9 applied
      uniforms.uBeatPhase.value = beatPhase;
      
      // Portal peel transition mechanics
      const isFocused = focus === 'philosophy';
      const time = state.clock.elapsedTime;
      
      if (isFocused) {
        // Slow portal peel: gradual opening with dispAmp increase
        uniforms.uPortalPeel.value = Math.min(1.0, uniforms.uPortalPeel.value + delta * 0.8);
      } else {
        // Reseal with low glitch: gradual closing
        uniforms.uPortalPeel.value = Math.max(0.0, uniforms.uPortalPeel.value - delta * 1.0);
      }
      
      // Philosophical depth oscillation (contemplative breathing)
      uniforms.uPhilosophicalDepth.value = 0.5 + Math.sin(time * 0.3) * 0.3;
    }
    
    // Philosophy specific animations
    if (meshRef.current) {
      // Slow, contemplative rotation
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      
      // Breathing scale effect
      const breathScale = 1.0 + Math.sin(state.clock.elapsedTime * 0.4) * 0.02;
      meshRef.current.scale.setScalar(breathScale);
      
      // Portal dimensional shift
      if (focus === 'philosophy') {
        meshRef.current.position.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      } else {
        meshRef.current.position.z = 0;
      }
    }
  });
  
  const isActive = focus === 'philosophy';
  
  return (
    <group visible={isActive}>
      {/* Main Philosophy visualization plane */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <planeGeometry args={[4, 4, 64, 64]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={philosophyVertexShader}
          fragmentShader={philosophyFragmentShader}
          transparent
          side={2}
        />
      </mesh>
      
      {/* Contemplative thought particles */}
      <points position={[0, 0, -0.5]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={100}
            array={new Float32Array(Array.from({ length: 300 }, (_, i) => {
              const angle = (i / 100) * Math.PI * 2 + Math.random() * 0.5;
              const radius = 1 + Math.random() * 4;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              const z = (Math.random() - 0.5) * 3;
              return [x, y, z][i % 3];
            }))}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          color={`hsl(${homeParams.hue * 360 + 60}, 50%, 70%)`}
          transparent
          opacity={(sectionParams?.density || 0.5) * 0.4}
        />
      </points>
      
      {/* Portal ring structures */}
      <group position={[0, 0, -1]}>
        {Array.from({ length: 3 }, (_, i) => (
          <mesh
            key={i}
            position={[0, 0, i * -0.3]}
            rotation={[0, 0, i * Math.PI / 3]}
            scale={[1 + i * 0.3, 1 + i * 0.3, 0.05]}
          >
            <torusGeometry args={[1.5, 0.05, 8, 32]} />
            <meshBasicMaterial
              color={`hsl(${(homeParams.hue * 360 + i * 20) % 360}, 60%, 50%)`}
              transparent
              opacity={focus === 'philosophy' ? 0.3 - i * 0.1 : 0.1}
            />
          </mesh>
        ))}
      </group>
      
      {/* Philosophical symbol geometry */}
      <group position={[0, 0, -0.8]} visible={focus === 'philosophy'}>
        {/* Spiral of contemplation */}
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <torusGeometry args={[0.8, 0.02, 8, 32]} />
          <meshBasicMaterial
            color={`hsl(${homeParams.hue * 360}, 40%, 60%)`}
            transparent
            opacity={0.6}
          />
        </mesh>
        
        {/* Inner contemplative core */}
        <mesh scale={[0.3, 0.3, 0.3]}>
          <sphereGeometry args={[1, 12, 8]} />
          <meshBasicMaterial
            color={`hsl(${homeParams.hue * 360 + 180}, 70%, 40%)`}
            transparent
            opacity={0.4}
            wireframe
          />
        </mesh>
      </group>
    </group>
  );
}