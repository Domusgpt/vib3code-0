/**
 * VIB34D Geometry Systems
 * 
 * Advanced geometric visualization engines implementing VIB3 specification
 * - 8 geometric types from tetrahedron to crystal fractals
 * - 4D polytope projections and lattice systems
 * - Real-time parameter-driven deformation
 */

import { Mesh, BufferGeometry, Vector3, BufferAttribute } from 'three';

export interface VIB3GeometryParams {
  geometry: number;      // 0-7: Geometry type selector
  morph: number;        // 0-2: Shape morphing factor
  chaos: number;        // 0-1: Chaos/turbulence amount
  density: number;      // 0-1: Vertex/particle density
  hue: number;          // 0-1: Base hue for coloring
  noiseFreq: number;    // 1-5: Noise frequency scale
  dispAmp: number;      // 0-1: Displacement amplitude
  timeScale: number;    // 0.1-3: Animation speed
  beatPhase: number;    // 0-1: Beat synchronization phase
}

/**
 * TETRAHEDRON LATTICE (Geometry 0)
 * Basic 4-vertex lattice with simplex noise displacement
 */
export function createTetrahedronLattice(params: VIB3GeometryParams): BufferGeometry {
  const geometry = new BufferGeometry();
  
  // Base tetrahedron vertices
  const baseVertices = [
    new Vector3(1, 1, 1),
    new Vector3(-1, -1, 1), 
    new Vector3(-1, 1, -1),
    new Vector3(1, -1, -1)
  ];
  
  // Generate lattice points based on density
  const latticeSize = Math.floor(5 + params.density * 15); // 5-20 points per axis
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  
  for (let i = 0; i < latticeSize; i++) {
    for (let j = 0; j < latticeSize; j++) {
      for (let k = 0; k < latticeSize; k++) {
        const x = (i / (latticeSize - 1) - 0.5) * 4;
        const y = (j / (latticeSize - 1) - 0.5) * 4;
        const z = (k / (latticeSize - 1) - 0.5) * 4;
        
        // Apply morph to base tetrahedron shape
        const morphedPos = new Vector3(x, y, z);
        baseVertices.forEach((vertex, idx) => {
          const influence = Math.exp(-morphedPos.distanceTo(vertex) * (1 - params.morph));
          morphedPos.add(vertex.clone().multiplyScalar(influence * 0.3));
        });
        
        // Add chaos displacement
        if (params.chaos > 0) {
          const noiseX = Math.sin(x * params.noiseFreq + params.beatPhase * Math.PI * 2) * params.chaos;
          const noiseY = Math.cos(y * params.noiseFreq + params.beatPhase * Math.PI * 2) * params.chaos;
          const noiseZ = Math.sin(z * params.noiseFreq + params.beatPhase * Math.PI * 2) * params.chaos;
          
          morphedPos.x += noiseX * params.dispAmp;
          morphedPos.y += noiseY * params.dispAmp;
          morphedPos.z += noiseZ * params.dispAmp;
        }
        
        positions.push(morphedPos.x, morphedPos.y, morphedPos.z);
        
        // Color based on position and hue
        const hue = (params.hue + morphedPos.length() * 0.1) % 1.0;
        const r = Math.abs(Math.sin(hue * Math.PI * 2));
        const g = Math.abs(Math.sin((hue + 0.33) * Math.PI * 2));
        const b = Math.abs(Math.sin((hue + 0.66) * Math.PI * 2));
        colors.push(r, g, b);
      }
    }
  }
  
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
  
  return geometry;
}

/**
 * HYPERCUBE LATTICE (Geometry 1)  
 * 4D hypercube projected to 3D with perspective
 */
export function createHypercubeLattice(params: VIB3GeometryParams): BufferGeometry {
  const geometry = new BufferGeometry();
  
  // 4D hypercube vertices (16 vertices)
  const hypercubeVertices4D: number[][] = [];
  for (let i = 0; i < 16; i++) {
    hypercubeVertices4D.push([
      (i & 1) ? 1 : -1,
      (i & 2) ? 1 : -1,
      (i & 4) ? 1 : -1,
      (i & 8) ? 1 : -1
    ]);
  }
  
  const positions: number[] = [];
  const colors: number[] = [];
  
  // Generate lattice grid
  const gridSize = Math.floor(8 + params.density * 16); // 8-24 points
  
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      for (let k = 0; k < gridSize; k++) {
        const x4d = (i / (gridSize - 1) - 0.5) * 4;
        const y4d = (j / (gridSize - 1) - 0.5) * 4;
        const z4d = (k / (gridSize - 1) - 0.5) * 4;
        const w4d = Math.sin(params.beatPhase * Math.PI * 2) * 2;
        
        // 4D to 3D projection with perspective
        const perspective = 3 / (3 + w4d * params.morph);
        
        let x3d = x4d * perspective;
        let y3d = y4d * perspective;
        let z3d = z4d * perspective;
        
        // Apply hypercube lattice influence
        hypercubeVertices4D.forEach(vertex => {
          const dist4d = Math.sqrt(
            (x4d - vertex[0]) ** 2 + 
            (y4d - vertex[1]) ** 2 +
            (z4d - vertex[2]) ** 2 +
            (w4d - vertex[3]) ** 2
          );
          
          const influence = Math.exp(-dist4d * (2 - params.morph)) * 0.3;
          
          x3d += vertex[0] * influence;
          y3d += vertex[1] * influence; 
          z3d += vertex[2] * influence;
        });
        
        // Chaos distortion
        if (params.chaos > 0) {
          const chaosScale = params.chaos * params.dispAmp * 2;
          x3d += (Math.random() - 0.5) * chaosScale;
          y3d += (Math.random() - 0.5) * chaosScale;
          z3d += (Math.random() - 0.5) * chaosScale;
        }
        
        positions.push(x3d, y3d, z3d);
        
        // 4D color mapping
        const hue = (params.hue + w4d * 0.1) % 1.0;
        const sat = 0.7 + params.density * 0.3;
        const val = 0.6 + Math.abs(w4d) * 0.2;
        
        // HSV to RGB
        const c = val * sat;
        const x = c * (1 - Math.abs((hue * 6) % 2 - 1));
        const m = val - c;
        
        let r = 0, g = 0, b = 0;
        const h = hue * 6;
        if (h < 1) { r = c; g = x; b = 0; }
        else if (h < 2) { r = x; g = c; b = 0; }
        else if (h < 3) { r = 0; g = c; b = x; }
        else if (h < 4) { r = 0; g = x; b = c; }
        else if (h < 5) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }
        
        colors.push(r + m, g + m, b + m);
      }
    }
  }
  
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
  
  return geometry;
}

/**
 * HYPERSPHERE LATTICE (Geometry 2)
 * 4D hypersphere cross-sections with smooth transitions
 */
export function createHypersphereLattice(params: VIB3GeometryParams): BufferGeometry {
  const geometry = new BufferGeometry();
  
  const positions: number[] = [];
  const colors: number[] = [];
  
  // Generate hypersphere cross-sections
  const slices = Math.floor(16 + params.density * 32); // 16-48 slices
  const ringsPerSlice = Math.floor(8 + params.density * 16); // 8-24 rings
  const pointsPerRing = Math.floor(8 + params.density * 24); // 8-32 points
  
  for (let slice = 0; slice < slices; slice++) {
    const w = (slice / (slices - 1) - 0.5) * 4; // 4D coordinate
    const radiusAtW = Math.sqrt(Math.max(0, 4 - w * w)); // Hypersphere radius at this w
    
    if (radiusAtW <= 0) continue;
    
    for (let ring = 0; ring < ringsPerSlice; ring++) {
      const phi = (ring / (ringsPerSlice - 1)) * Math.PI; // Latitude
      const ringRadius = Math.sin(phi) * radiusAtW * (1 + params.morph * 0.5);
      const y = Math.cos(phi) * radiusAtW * (1 + params.morph * 0.5);
      
      for (let point = 0; point < pointsPerRing; point++) {
        const theta = (point / pointsPerRing) * Math.PI * 2; // Longitude
        
        let x = Math.cos(theta) * ringRadius;
        let z = Math.sin(theta) * ringRadius;
        
        // Beat phase rotation in 4D
        const beatRotation = params.beatPhase * Math.PI * 2;
        const newX = x * Math.cos(beatRotation) - w * Math.sin(beatRotation);
        const newW = x * Math.sin(beatRotation) + w * Math.cos(beatRotation);
        
        // 4D to 3D projection
        const perspective = 3 / (3 + newW * 0.3);
        x = newX * perspective;
        const projectedY = y * perspective;
        z = z * perspective;
        
        // Apply chaos
        if (params.chaos > 0) {
          const noiseScale = params.chaos * params.dispAmp;
          const noise1 = Math.sin(x * params.noiseFreq + params.beatPhase * 4) * noiseScale;
          const noise2 = Math.sin(projectedY * params.noiseFreq + params.beatPhase * 4) * noiseScale;
          const noise3 = Math.sin(z * params.noiseFreq + params.beatPhase * 4) * noiseScale;
          
          x += noise1;
          const finalY = projectedY + noise2;
          z += noise3;
          
          positions.push(x, finalY, z);
        } else {
          positions.push(x, projectedY, z);
        }
        
        // Color based on 4D position
        const hue = (params.hue + newW * 0.2 + phi * 0.1) % 1.0;
        const intensity = 0.5 + Math.abs(newW) * 0.3 + params.density * 0.2;
        
        colors.push(
          intensity * (0.5 + 0.5 * Math.sin(hue * Math.PI * 2)),
          intensity * (0.5 + 0.5 * Math.sin((hue + 0.33) * Math.PI * 2)),
          intensity * (0.5 + 0.5 * Math.sin((hue + 0.66) * Math.PI * 2))
        );
      }
    }
  }
  
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
  
  return geometry;
}

/**
 * CRYSTAL FRACTAL (Geometry 7) 
 * Self-similar crystal structures with recursive detail
 */
export function createCrystalFractal(params: VIB3GeometryParams): BufferGeometry {
  const geometry = new BufferGeometry();
  
  const positions: number[] = [];
  const colors: number[] = [];
  
  // Recursive crystal generation
  function generateCrystalLevel(center: Vector3, size: number, level: number, maxLevel: number) {
    if (level > maxLevel || size < 0.1) return;
    
    // Crystal vertices (octahedron base)
    const vertices = [
      new Vector3(size, 0, 0),
      new Vector3(-size, 0, 0),
      new Vector3(0, size, 0),
      new Vector3(0, -size, 0),
      new Vector3(0, 0, size),
      new Vector3(0, 0, -size)
    ];
    
    vertices.forEach(vertex => {
      const pos = vertex.clone().add(center);
      
      // Apply morph deformation
      const morphFactor = params.morph * (level / maxLevel);
      pos.multiplyScalar(1 + morphFactor);
      
      // Chaos displacement
      if (params.chaos > 0) {
        const chaosScale = params.chaos * params.dispAmp * size * 0.5;
        pos.x += (Math.random() - 0.5) * chaosScale;
        pos.y += (Math.random() - 0.5) * chaosScale;
        pos.z += (Math.random() - 0.5) * chaosScale;
      }
      
      // Beat phase oscillation
      const beatOscillation = Math.sin(params.beatPhase * Math.PI * 2 + level) * 0.1 * size;
      pos.y += beatOscillation;
      
      positions.push(pos.x, pos.y, pos.z);
      
      // Fractal level coloring
      const levelHue = (params.hue + level * 0.15) % 1.0;
      const intensity = 0.6 + level * 0.2 + params.density * 0.2;
      
      colors.push(
        intensity * Math.abs(Math.sin(levelHue * Math.PI * 2)),
        intensity * Math.abs(Math.sin((levelHue + 0.33) * Math.PI * 2)),
        intensity * Math.abs(Math.sin((levelHue + 0.66) * Math.PI * 2))
      );
    });
    
    // Recursive sub-crystals
    if (level < maxLevel) {
      const subSize = size * (0.4 + params.morph * 0.2);
      const positions = [
        new Vector3(size * 0.7, size * 0.7, 0),
        new Vector3(-size * 0.7, size * 0.7, 0),
        new Vector3(size * 0.7, -size * 0.7, 0),
        new Vector3(-size * 0.7, -size * 0.7, 0)
      ];
      
      positions.forEach(subCenter => {
        generateCrystalLevel(center.clone().add(subCenter), subSize, level + 1, maxLevel);
      });
    }
  }
  
  // Start crystal generation
  const maxLevels = Math.floor(2 + params.density * 3); // 2-5 levels
  generateCrystalLevel(new Vector3(0, 0, 0), 2, 0, maxLevels);
  
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
  
  return geometry;
}

/**
 * HYPERTETRAHEDRON LATTICE (Geometry 3)
 * 4D hypertetrahedron with simplex noise and 4D to 3D projection
 */
export function createHypertetrahedronLattice(params: VIB3GeometryParams): BufferGeometry {
  const geometry = new BufferGeometry();
  
  // 4D hypertetrahedron vertices (5 vertices in 4D space)
  const hyperTetraVertices4D: number[][] = [
    [1, 1, 1, 1],
    [-1, -1, 1, 1],
    [-1, 1, -1, 1],
    [1, -1, -1, 1],
    [0, 0, 0, -1.5] // 4D apex
  ];
  
  const positions: number[] = [];
  const colors: number[] = [];
  
  const gridSize = Math.floor(6 + params.density * 18); // 6-24 points per axis
  
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      for (let k = 0; k < gridSize; k++) {
        const x4d = (i / (gridSize - 1) - 0.5) * 4;
        const y4d = (j / (gridSize - 1) - 0.5) * 4;
        const z4d = (k / (gridSize - 1) - 0.5) * 4;
        const w4d = Math.cos(params.beatPhase * Math.PI * 2) * 2;
        
        // 4D hypertetrahedron influence
        let morphedPos = new Vector3(x4d, y4d, z4d);
        let totalInfluence = 0;
        
        hyperTetraVertices4D.forEach(vertex => {
          const dist4d = Math.sqrt(
            (x4d - vertex[0]) ** 2 + 
            (y4d - vertex[1]) ** 2 +
            (z4d - vertex[2]) ** 2 +
            (w4d - vertex[3]) ** 2
          );
          
          const influence = Math.exp(-dist4d * (1.5 - params.morph * 0.5)) * 0.4;
          totalInfluence += influence;
          
          morphedPos.x += vertex[0] * influence;
          morphedPos.y += vertex[1] * influence;
          morphedPos.z += vertex[2] * influence;
        });
        
        // Normalize by total influence
        if (totalInfluence > 0.01) {
          morphedPos.multiplyScalar(1 + totalInfluence * 0.3);
        }
        
        // 4D to 3D projection with perspective
        const perspective = 3 / (3 + w4d * 0.2);
        morphedPos.multiplyScalar(perspective);
        
        // Chaos displacement
        if (params.chaos > 0) {
          const chaosScale = params.chaos * params.dispAmp;
          morphedPos.x += Math.sin(x4d * params.noiseFreq + params.beatPhase * 6) * chaosScale;
          morphedPos.y += Math.sin(y4d * params.noiseFreq + params.beatPhase * 6) * chaosScale;
          morphedPos.z += Math.sin(z4d * params.noiseFreq + params.beatPhase * 6) * chaosScale;
        }
        
        positions.push(morphedPos.x, morphedPos.y, morphedPos.z);
        
        // 4D color based on w-coordinate
        const hue = (params.hue + w4d * 0.15 + totalInfluence * 0.1) % 1.0;
        const intensity = 0.6 + Math.abs(w4d) * 0.2 + totalInfluence * 0.2;
        
        colors.push(
          intensity * (0.5 + 0.5 * Math.sin(hue * Math.PI * 2)),
          intensity * (0.5 + 0.5 * Math.sin((hue + 0.33) * Math.PI * 2)),
          intensity * (0.5 + 0.5 * Math.sin((hue + 0.66) * Math.PI * 2))
        );
      }
    }
  }
  
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
  
  return geometry;
}

/**
 * TORUS LATTICE (Geometry 4)
 * 4D torus projection with toroidal coordinate system
 */
export function createTorusLattice(params: VIB3GeometryParams): BufferGeometry {
  const geometry = new BufferGeometry();
  
  const positions: number[] = [];
  const colors: number[] = [];
  
  // Torus parameters
  const majorRadius = 2 + params.morph;
  const minorRadius = 0.8 + params.morph * 0.5;
  const majorSegments = Math.floor(16 + params.density * 32); // 16-48 segments
  const minorSegments = Math.floor(8 + params.density * 16); // 8-24 segments
  
  for (let i = 0; i < majorSegments; i++) {
    for (let j = 0; j < minorSegments; j++) {
      const u = (i / majorSegments) * Math.PI * 2;
      const v = (j / minorSegments) * Math.PI * 2;
      
      // Basic torus coordinates
      const x = (majorRadius + minorRadius * Math.cos(v)) * Math.cos(u);
      const y = (majorRadius + minorRadius * Math.cos(v)) * Math.sin(u);
      const z = minorRadius * Math.sin(v);
      
      // 4D extension with beat phase rotation
      const w = Math.sin(u + params.beatPhase * Math.PI * 4) * Math.cos(v + params.beatPhase * Math.PI * 2) * 1.5;
      
      // 4D to 3D projection
      const perspective = 3 / (3 + w * 0.3);
      const projectedPos = new Vector3(x, y, z).multiplyScalar(perspective);
      
      // Apply chaos as torus deformation
      if (params.chaos > 0) {
        const deformationScale = params.chaos * params.dispAmp * 2;
        const deformU = Math.sin(u * params.noiseFreq + params.beatPhase * 8) * deformationScale;
        const deformV = Math.cos(v * params.noiseFreq + params.beatPhase * 8) * deformationScale;
        
        projectedPos.x += deformU;
        projectedPos.y += deformV;
        projectedPos.z += Math.sin((u + v) * params.noiseFreq) * deformationScale;
      }
      
      positions.push(projectedPos.x, projectedPos.y, projectedPos.z);
      
      // Torus surface coloring
      const hue = (params.hue + u / (Math.PI * 2) * 0.3 + v / (Math.PI * 2) * 0.2) % 1.0;
      const intensity = 0.7 + Math.abs(w) * 0.2 + Math.abs(Math.sin(v)) * 0.1;
      
      colors.push(
        intensity * Math.abs(Math.cos(hue * Math.PI * 2)),
        intensity * Math.abs(Math.cos((hue + 0.33) * Math.PI * 2)),
        intensity * Math.abs(Math.cos((hue + 0.66) * Math.PI * 2))
      );
    }
  }
  
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
  
  return geometry;
}

/**
 * KLEIN BOTTLE LATTICE (Geometry 5)
 * 4D Klein bottle immersion with self-intersection
 */
export function createKleinBottleLattice(params: VIB3GeometryParams): BufferGeometry {
  const geometry = new BufferGeometry();
  
  const positions: number[] = [];
  const colors: number[] = [];
  
  const uSegments = Math.floor(20 + params.density * 40); // 20-60 segments
  const vSegments = Math.floor(15 + params.density * 25); // 15-40 segments
  
  for (let i = 0; i < uSegments; i++) {
    for (let j = 0; j < vSegments; j++) {
      const u = (i / uSegments) * Math.PI * 2;
      const v = (j / vSegments) * Math.PI * 2;
      
      // Klein bottle parametric equations (figure-8 immersion)
      const r = 4 * (1 - Math.cos(u) / 2);
      
      let x, y, z;
      
      if (u < Math.PI) {
        // First half of Klein bottle
        x = 6 * Math.cos(u) * (1 + Math.sin(u)) + r * Math.cos(v + Math.PI);
        y = 16 * Math.sin(u) + r * Math.sin(v + Math.PI);
      } else {
        // Second half with self-intersection
        x = 6 * Math.cos(u) * (1 + Math.sin(u)) + r * Math.cos(u) * Math.cos(v);
        y = 16 * Math.sin(u);
      }
      
      z = r * Math.sin(v);
      
      // Scale down and apply morph
      const scale = (0.3 + params.morph * 0.2);
      x *= scale;
      y *= scale;
      z *= scale;
      
      // 4D extension with Klein bottle topology
      const w = Math.sin(u * 2 + params.beatPhase * Math.PI * 3) * Math.cos(v + params.beatPhase * Math.PI) * 2;
      
      // Apply 4D perspective
      const perspective = 3 / (3 + w * 0.4);
      const pos = new Vector3(x, y, z).multiplyScalar(perspective);
      
      // Chaos as topological distortion
      if (params.chaos > 0) {
        const chaosScale = params.chaos * params.dispAmp * 1.5;
        pos.x += Math.sin(u * params.noiseFreq + v * params.noiseFreq) * chaosScale;
        pos.y += Math.cos(v * params.noiseFreq + params.beatPhase * 10) * chaosScale;
        pos.z += Math.sin((u + v) * params.noiseFreq * 0.5) * chaosScale;
      }
      
      positions.push(pos.x, pos.y, pos.z);
      
      // Klein bottle coloring with topology-aware hue
      const topologyHue = (u < Math.PI) ? 0.0 : 0.5; // Different colors for each half
      const hue = (params.hue + topologyHue + w * 0.1) % 1.0;
      const intensity = 0.6 + Math.abs(w) * 0.3 + (u < Math.PI ? 0.1 : 0.0);
      
      colors.push(
        intensity * Math.abs(Math.sin(hue * Math.PI * 2 + u)),
        intensity * Math.abs(Math.sin((hue + 0.33) * Math.PI * 2 + v)),
        intensity * Math.abs(Math.sin((hue + 0.66) * Math.PI * 2 + u + v))
      );
    }
  }
  
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
  
  return geometry;
}

/**
 * WAVE LATTICE (Geometry 6)
 * Dynamic wave interference patterns with 4D phase modulation
 */
export function createWaveLattice(params: VIB3GeometryParams): BufferGeometry {
  const geometry = new BufferGeometry();
  
  const positions: number[] = [];
  const colors: number[] = [];
  
  const gridResolution = Math.floor(25 + params.density * 50); // 25-75 points per axis
  
  for (let i = 0; i < gridResolution; i++) {
    for (let j = 0; j < gridResolution; j++) {
      const x = (i / (gridResolution - 1) - 0.5) * 8;
      const z = (j / (gridResolution - 1) - 0.5) * 8;
      
      // Multiple wave sources with different frequencies
      const wave1 = Math.sin(x * 0.5 + params.beatPhase * Math.PI * 4) * Math.cos(z * 0.5);
      const wave2 = Math.cos(x * 0.8 + params.beatPhase * Math.PI * 3) * Math.sin(z * 0.8 + Math.PI / 4);
      const wave3 = Math.sin((x + z) * 0.3 + params.beatPhase * Math.PI * 2) * 0.7;
      
      // Wave interference with morph factor
      let y = (wave1 + wave2 * params.morph + wave3) * (1 + params.morph);
      
      // 4D wave extension
      const w = Math.sin(Math.sqrt(x * x + z * z) * 0.4 + params.beatPhase * Math.PI * 6) * 2;
      
      // Apply 4D influence to height
      y += w * 0.3;
      
      // Chaos as wave turbulence
      if (params.chaos > 0) {
        const turbulence = params.chaos * params.dispAmp * 2;
        const noiseX = Math.sin(x * params.noiseFreq + params.beatPhase * 8) * turbulence;
        const noiseZ = Math.cos(z * params.noiseFreq + params.beatPhase * 8) * turbulence;
        const noiseY = Math.sin((x + z) * params.noiseFreq * 0.5 + params.beatPhase * 12) * turbulence;
        
        y += noiseY;
        positions.push(x + noiseX, y, z + noiseZ);
      } else {
        positions.push(x, y, z);
      }
      
      // Wave-based coloring
      const waveIntensity = Math.abs(y) / 3; // Normalize wave height
      const hue = (params.hue + waveIntensity * 0.2 + w * 0.1) % 1.0;
      const intensity = 0.5 + waveIntensity * 0.4 + Math.abs(w) * 0.1;
      
      // Create wave color patterns
      const r = intensity * (0.5 + 0.5 * Math.sin(hue * Math.PI * 2 + y));
      const g = intensity * (0.5 + 0.5 * Math.sin((hue + 0.33) * Math.PI * 2 + x * 0.1));
      const b = intensity * (0.5 + 0.5 * Math.sin((hue + 0.66) * Math.PI * 2 + z * 0.1));
      
      colors.push(r, g, b);
    }
  }
  
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
  
  return geometry;
}

/**
 * GEOMETRY FACTORY
 * Creates geometry based on type selector
 */
export function createVIB3Geometry(params: VIB3GeometryParams): BufferGeometry {
  const geometryType = Math.floor(params.geometry) % 8;
  
  switch (geometryType) {
    case 0:
      return createTetrahedronLattice(params);
    case 1:
      return createHypercubeLattice(params);
    case 2:
      return createHypersphereLattice(params);
    case 3:
      return createHypertetrahedronLattice(params);
    case 4:
      return createTorusLattice(params);
    case 5:
      return createKleinBottleLattice(params);
    case 6:
      return createWaveLattice(params);
    case 7:
      return createCrystalFractal(params);
    default:
      return createTetrahedronLattice(params);
  }
}

/**
 * GEOMETRY NAMES FOR UI
 */
export const VIB3_GEOMETRY_NAMES = [
  'Tetrahedron Lattice',
  'Hypercube Lattice', 
  'Hypersphere Lattice',
  'Hypertetrahedron Lattice',
  'Torus Lattice',
  'Klein Bottle Lattice',
  'Wave Lattice',
  'Crystal Fractal'
];