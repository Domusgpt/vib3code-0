// Test Reality Inversion Engine
console.log('🌀 Testing Reality Inversion Engine');

function testRealityInversion() {
  // Simulate inversion logic
  function invertSection(state, intensity = 1.0) {
    return {
      original: { ...state },
      inverted: {
        gridDensity: Math.max(0.1, 1 - state.gridDensity) * intensity,
        colorIntensity: Math.max(0.2, 2 - state.colorIntensity) * intensity,
        reactivity: Math.max(0.2, 1.5 - state.reactivity) * intensity,
        depth: -state.depth * intensity,
      },
      paramPatch: {
        density: Math.max(0, 1 - (state.gridDensity * intensity)),
        chaos: Math.min(1, 0.5 * intensity),
        glitch: Math.min(1, 0.3 * intensity),
        chromaShift: Math.max(-1, -0.5 * intensity),
        timeScale: -Math.abs(1.0) * intensity,
      }
    };
  }

  // Test various input states
  const testStates = [
    { name: 'Normal', gridDensity: 1.0, colorIntensity: 1.0, reactivity: 1.0, depth: 0 },
    { name: 'High', gridDensity: 2.0, colorIntensity: 2.0, reactivity: 2.0, depth: 10 },
    { name: 'Low', gridDensity: 0.5, colorIntensity: 0.5, reactivity: 0.5, depth: -5 },
    { name: 'Edge_Min', gridDensity: 0.1, colorIntensity: 0.2, reactivity: 0.2, depth: -50 },
    { name: 'Edge_Max', gridDensity: 4.0, colorIntensity: 4.0, reactivity: 4.0, depth: 50 }
  ];

  console.log('Testing inversion with different intensity levels:');

  [0.5, 1.0, 1.5, 2.0].forEach(intensity => {
    console.log(`\n=== INTENSITY: ${intensity} ===`);

    testStates.forEach(state => {
      const result = invertSection(state, intensity);
      console.log(`\n${state.name}:`);
      console.log('  Original:', result.original);
      console.log('  Inverted:', result.inverted);
      console.log('  Patches: ', result.paramPatch);

      // Validate bounds
      const bounds = {
        gridDensity: result.inverted.gridDensity >= 0.1 && result.inverted.gridDensity <= 4,
        colorIntensity: result.inverted.colorIntensity >= 0.2 && result.inverted.colorIntensity <= 4,
        reactivity: result.inverted.reactivity >= 0.2 && result.inverted.reactivity <= 4,
        density: result.paramPatch.density >= 0 && result.paramPatch.density <= 1,
        chaos: result.paramPatch.chaos >= 0 && result.paramPatch.chaos <= 1,
        glitch: result.paramPatch.glitch >= 0 && result.paramPatch.glitch <= 1,
        chromaShift: result.paramPatch.chromaShift >= -1 && result.paramPatch.chromaShift <= 1
      };

      const boundsOk = Object.values(bounds).every(v => v);
      console.log(`  Bounds Check: ${boundsOk ? '✅' : '❌'}`, bounds);
    });
  });

  // Test sparkle calculations
  console.log('\n=== SPARKLE EFFECT CALCULATIONS ===');
  [0.5, 1.0, 1.5, 2.0].forEach(intensity => {
    const sparkleCount = Math.floor(8 * intensity);
    const sparkleDuration = 1500 * intensity;
    console.log(`Intensity ${intensity}: ${sparkleCount} sparkles for ${sparkleDuration}ms`);
  });
}

testRealityInversion();
console.log('\n✅ Reality Inversion testing complete');