/**
 * VIB3 Geometry Renderer - Simple R3F Component
 * 
 * Renders VIB34D geometric systems within Canvas context
 * - No external hooks to prevent R3F errors
 * - Direct geometry integration
 * - Layer-specific rendering
 */

'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createVIB3Geometry } from '@/lib/vib34d-geometries';

interface VIB3GeometryRendererProps {
  sectionId: string;
  layerType: string;
  params: any;
}

export function VIB3GeometryRenderer({ 
  sectionId, 
  layerType, 
  params 
}: VIB3GeometryRendererProps) {
  const meshRef = useRef<THREE.Points>(null);
  
  // Create VIB3 geometry with safe parameters
  const geometry = useMemo(() => {
    try {
      const vib3Params = {
        geometry: params?.geometry || 0,
        morph: params?.morph || 1,
        chaos: params?.chaos || 0.2,
        density: params?.density || 0.5,
        hue: params?.hue || 0.6,
        noiseFreq: params?.noiseFreq || 2.1,
        dispAmp: params?.dispAmp || 0.2,
        timeScale: params?.timeScale || 1.0,
        beatPhase: params?.beatPhase || 0.0,
      };
      return createVIB3Geometry(vib3Params);
    } catch (error) {
      console.warn(`[VIB3Renderer] Failed to create geometry for ${sectionId}-${layerType}:`, error);
      // Simple fallback geometry
      const fallback = new THREE.BufferGeometry();
      const positions = new Float32Array([
        0, 1, 0,  -1, -1, 0,  1, -1, 0
      ]);
      const colors = new Float32Array([
        1, 0, 1,  0, 1, 1,  1, 1, 0
      ]);
      fallback.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      fallback.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      return fallback;
    }
  }, [
    sectionId,
    layerType,
    params?.geometry,
    params?.morph,
    params?.chaos,
    params?.density,
    params?.hue,
    params?.noiseFreq,
    params?.dispAmp,
    params?.timeScale,
    params?.beatPhase,
  ]);

  // Layer-specific properties
  const layerProps = useMemo(() => {
    const baseSize = 2.0;
    const baseOpacity = 0.8;
    
    switch (layerType) {
      case 'background':
        return { 
          size: baseSize * 0.8, 
          opacity: baseOpacity * 0.6,
          position: [0, 0, -0.2] as [number, number, number]
        };
      case 'shadow':
        return { 
          size: baseSize * 0.9, 
          opacity: baseOpacity * 0.4,
          position: [0.1, -0.1, -0.1] as [number, number, number]
        };
      case 'content':
        return { 
          size: baseSize * 1.2, 
          opacity: baseOpacity * 1.0,
          position: [0, 0, 0] as [number, number, number]
        };
      case 'highlight':
        return { 
          size: baseSize * 1.0, 
          opacity: baseOpacity * 0.7,
          position: [-0.02, 0.02, 0.1] as [number, number, number]
        };
      case 'accent':
        return { 
          size: baseSize * 0.7, 
          opacity: baseOpacity * 0.5,
          position: [0.08, 0.08, 0.15] as [number, number, number]
        };
      default:
        return { 
          size: baseSize, 
          opacity: baseOpacity,
          position: [0, 0, 0] as [number, number, number]
        };
    }
  }, [layerType]);

  // Animation
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.elapsedTime * (params?.timeScale || 1.0);
    
    // Layer-specific rotation
    const rotSpeed = 0.01;
    switch (layerType) {
      case 'background':
        meshRef.current.rotation.y = time * rotSpeed;
        break;
      case 'shadow':
        meshRef.current.rotation.y = -time * rotSpeed * 0.8;
        break;
      case 'content':
        meshRef.current.rotation.y = time * rotSpeed * 1.2;
        meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.1;
        break;
      case 'highlight':
        meshRef.current.rotation.y = time * rotSpeed * 1.5;
        break;
      case 'accent':
        meshRef.current.rotation.y = -time * rotSpeed * 0.6;
        break;
    }

    // Scale with morph parameter
    const scale = 1.0 + (params?.morph || 0) * 0.2 + Math.sin(time * 0.3) * 0.05;
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <group position={layerProps.position}>
      <points 
        ref={meshRef}
        geometry={geometry}
      >
        <pointsMaterial
          size={layerProps.size}
          transparent
          opacity={layerProps.opacity}
          vertexColors
          sizeAttenuation
        />
      </points>
    </group>
  );
}

export default VIB3GeometryRenderer;