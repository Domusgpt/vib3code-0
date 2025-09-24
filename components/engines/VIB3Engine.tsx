/**
 * VIB3 Engine - React Three Fiber Integration
 * 
 * Renders VIB34D geometric systems with real-time parameter updates
 * - 8 geometric types from tetrahedron to crystal fractals
 * - Real-time parameter synchronization from Zustand store
 * - Buffer geometry with vertex colors for performance
 */

'use client';

import { useRef, useEffect, useMemo } from 'react';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createVIB3Geometry, VIB3GeometryParams } from '@/lib/vib34d-geometries';

interface VIB3EngineProps {
  sectionId: string;
  layerType: 'background' | 'shadow' | 'content' | 'highlight' | 'accent';
  params: VIB3GeometryParams;
  opacity?: number;
  pointSize?: number;
  onPointerOver?: (event: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: (event: ThreeEvent<PointerEvent>) => void;
  onClick?: (event: ThreeEvent<MouseEvent>) => void;
}

export function VIB3Engine({
  sectionId,
  layerType,
  params,
  opacity = 1.0,
  pointSize = 2.0,
  onPointerOver,
  onPointerOut,
  onClick
}: VIB3EngineProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  
  // Create geometry based on current parameters
  const geometry = useMemo(() => {
    try {
      return createVIB3Geometry(params);
    } catch (error) {
      console.warn(`[VIB3Engine] Failed to create geometry for ${sectionId}-${layerType}:`, error);
      // Fallback to basic geometry
      const fallbackGeometry = new THREE.BufferGeometry();
      const vertices = new Float32Array([0, 0, 0]);
      const colors = new Float32Array([1, 1, 1]);
      fallbackGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      fallbackGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      return fallbackGeometry;
    }
  }, [params]);

  // Update material properties when parameters change
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.size = pointSize + params.density * 3;
      materialRef.current.opacity = opacity * (0.5 + params.density * 0.5);
      materialRef.current.transparent = true;
      materialRef.current.vertexColors = true;
      materialRef.current.sizeAttenuation = true;
    }
  }, [params.density, opacity, pointSize]);

  // Animation loop for dynamic effects
  useFrame((state) => {
    if (!pointsRef.current) return;

    const time = state.clock.elapsedTime * params.timeScale;
    
    // Rotate based on layer type and parameters
    const rotationSpeed = 0.01 * params.timeScale;
    
    switch (layerType) {
      case 'background':
        pointsRef.current.rotation.y = time * rotationSpeed;
        pointsRef.current.rotation.x = Math.sin(time * 0.5) * 0.1;
        break;
      case 'shadow':
        pointsRef.current.rotation.y = -time * rotationSpeed * 0.8;
        pointsRef.current.rotation.z = Math.cos(time * 0.3) * 0.05;
        break;
      case 'content':
        pointsRef.current.rotation.y = time * rotationSpeed * 1.2;
        pointsRef.current.rotation.x = Math.sin(time * 0.7) * 0.15;
        pointsRef.current.rotation.z = Math.cos(time * 0.4) * 0.08;
        break;
      case 'highlight':
        pointsRef.current.rotation.y = time * rotationSpeed * 1.5;
        pointsRef.current.rotation.x = Math.sin(time * 1.2) * 0.2;
        break;
      case 'accent':
        pointsRef.current.rotation.y = -time * rotationSpeed * 0.6;
        pointsRef.current.rotation.x = Math.cos(time * 0.8) * 0.12;
        pointsRef.current.rotation.z = Math.sin(time * 0.6) * 0.1;
        break;
    }

    // Chaos-based position jitter
    if (params.chaos > 0) {
      const chaosAmount = params.chaos * 0.1;
      pointsRef.current.position.x = Math.sin(time * 2) * chaosAmount;
      pointsRef.current.position.y = Math.cos(time * 1.7) * chaosAmount;
      pointsRef.current.position.z = Math.sin(time * 1.3) * chaosAmount;
    }

    // Morph-based scale animation
    const baseScale = 1.0 + params.morph * 0.3;
    const scaleOscillation = Math.sin(time * 0.5 + params.beatPhase * Math.PI * 2) * 0.1;
    pointsRef.current.scale.setScalar(baseScale + scaleOscillation);
  });

  // Layer-specific positioning
  const layerOffset = useMemo(() => {
    const baseOffset = 0.1;
    switch (layerType) {
      case 'background': return new THREE.Vector3(0, 0, -baseOffset * 2);
      case 'shadow': return new THREE.Vector3(0.05, -0.05, -baseOffset);
      case 'content': return new THREE.Vector3(0, 0, 0);
      case 'highlight': return new THREE.Vector3(-0.02, 0.02, baseOffset);
      case 'accent': return new THREE.Vector3(0.08, 0.08, baseOffset * 1.5);
      default: return new THREE.Vector3(0, 0, 0);
    }
  }, [layerType]);

  return (
    <group
      position={layerOffset}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onClick={onClick}
    >
      <points 
        ref={pointsRef}
        geometry={geometry}
        frustumCulled={false}
      >
        <pointsMaterial
          ref={materialRef}
          size={pointSize}
          transparent
          opacity={opacity}
          vertexColors
          sizeAttenuation
          alphaTest={0.1}
          depthWrite={false}
        />
      </points>
      
      {/* Additional effects for specific layers */}
      {layerType === 'highlight' && params.chaos > 0.5 && (
        <mesh scale={[2, 2, 2]} position={[0, 0, -0.5]}>
          <planeGeometry args={[4, 4, 1, 1]} />
          <meshBasicMaterial 
            transparent 
            opacity={params.chaos * 0.1}
            color={`hsl(${params.hue * 360}, 70%, 50%)`}
            blending={2} // AdditiveBlending
          />
        </mesh>
      )}
      
      {layerType === 'accent' && params.density > 0.7 && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([-2, 0, 0, 2, 0, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial 
            color={`hsl(${(params.hue + 0.5) % 1 * 360}, 80%, 60%)`}
            transparent
            opacity={params.density * 0.3}
          />
        </lineSegments>
      )}
    </group>
  );
}

export default VIB3Engine;