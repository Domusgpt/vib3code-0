// Test Reality Inversion Bounds Fix
console.log('🔧 Testing Reality Inversion Bounds Fix');

function testBoundsFix() {
  // Original broken logic
  function brokenInversion(state, intensity) {
    return {
      gridDensity: Math.max(0.1, 1 - state.gridDensity) * intensity,
      colorIntensity: Math.max(0.2, 2 - state.colorIntensity) * intensity,
    };
  }

  // Fixed logic
  function fixedInversion(state, intensity) {
    return {
      gridDensity: Math.max(0.1, (1 - state.gridDensity) * intensity),
      colorIntensity: Math.max(0.2, (2 - state.colorIntensity) * intensity),
    };
  }

  const testCases = [
    { name: 'Normal', gridDensity: 1.0, colorIntensity: 1.0 },
    { name: 'High', gridDensity: 2.0, colorIntensity: 2.0 },
    { name: 'Low', gridDensity: 0.5, colorIntensity: 0.5 },
  ];

  const intensities = [0.5, 1.0, 1.5, 2.0];

  console.log('BOUNDS FIX VERIFICATION:');

  intensities.forEach(intensity => {
    console.log(`\n=== INTENSITY: ${intensity} ===`);

    testCases.forEach(state => {
      const broken = brokenInversion(state, intensity);
      const fixed = fixedInversion(state, intensity);

      const brokenValid = broken.gridDensity >= 0.1 && broken.colorIntensity >= 0.2;
      const fixedValid = fixed.gridDensity >= 0.1 && fixed.colorIntensity >= 0.2;

      console.log(`${state.name}:`);
      console.log(`  Broken: grid=${broken.gridDensity.toFixed(3)}, color=${broken.colorIntensity.toFixed(3)} ${brokenValid ? '✅' : '❌'}`);
      console.log(`  Fixed:  grid=${fixed.gridDensity.toFixed(3)}, color=${fixed.colorIntensity.toFixed(3)} ${fixedValid ? '✅' : '❌'}`);
    });
  });

  console.log('\n✅ Bounds fix verification complete');
}

testBoundsFix();