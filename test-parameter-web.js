// Test Parameter Web Engine mathematical functions
console.log('🧪 Testing Parameter Web Engine Mathematical Functions');

// Simulate the mathematical relationship functions
function testMathematicalRelationships() {
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function applyRelationship(sourceValue, relationship) {
    const { relationship: type, intensity, curve } = relationship;

    if (curve) {
      return curve(sourceValue) * intensity;
    }

    switch (type) {
      case 'linear':
        return sourceValue * intensity;
      case 'inverse':
        return (1.0 - sourceValue) * intensity;
      case 'exponential':
        return Math.pow(sourceValue, 2) * intensity;
      case 'logarithmic':
        return Math.log(Math.max(0.01, sourceValue)) * intensity * 0.5;
      default:
        return sourceValue * intensity;
    }
  }

  // Test cases
  const testValues = [0, 0.5, 1.0, 1.5, 2.0];
  const relationships = [
    { relationship: 'linear', intensity: 0.5 },
    { relationship: 'inverse', intensity: 0.6 },
    { relationship: 'exponential', intensity: 0.3 },
    { relationship: 'logarithmic', intensity: 0.4 }
  ];

  console.log('Testing mathematical relationships:');
  console.log('Input Values:', testValues);

  relationships.forEach(rel => {
    console.log(`\n${rel.relationship.toUpperCase()} (intensity: ${rel.intensity}):`);
    const results = testValues.map(val => {
      const result = applyRelationship(val, rel);
      return { input: val, output: result, clamped: clamp(result, 0.1, 4) };
    });
    console.table(results);
  });

  // Test custom curve function
  const customCurve = {
    relationship: 'custom',
    intensity: 0.5,
    curve: (x) => Math.sin(x * Math.PI * 2) * 0.5 + 0.5
  };

  console.log('\nCUSTOM CURVE (sine wave):');
  const curveResults = testValues.map(val => ({
    input: val,
    output: applyRelationship(val, customCurve),
    sine_component: Math.sin(val * Math.PI * 2) * 0.5 + 0.5
  }));
  console.table(curveResults);

  // Test edge cases
  console.log('\nEDGE CASE TESTING:');
  const edgeCases = [
    { value: -1, desc: 'Negative input' },
    { value: 0, desc: 'Zero input' },
    { value: 0.001, desc: 'Very small positive' },
    { value: 1000, desc: 'Very large input' },
    { value: Infinity, desc: 'Infinity input' },
    { value: NaN, desc: 'NaN input' }
  ];

  edgeCases.forEach(testCase => {
    try {
      const logResult = applyRelationship(testCase.value, { relationship: 'logarithmic', intensity: 1.0 });
      console.log(`${testCase.desc}: ${testCase.value} -> ${logResult} (${isFinite(logResult) ? 'OK' : 'ISSUE'})`);
    } catch (error) {
      console.log(`${testCase.desc}: ERROR - ${error.message}`);
    }
  });
}

testMathematicalRelationships();
console.log('\n✅ Parameter Web mathematical function testing complete');