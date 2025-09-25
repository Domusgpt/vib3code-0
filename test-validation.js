// Test Input and Curve Validation
console.log('🛡️ Testing Input and Curve Validation');

// Simulate validation functions
function validateInput(value) {
  if (!isFinite(value)) return 0;
  return Math.max(-1000, Math.min(1000, value));
}

function validateCurve(curve) {
  try {
    const testValues = [0, 0.5, 1.0, -0.5, -1.0];
    for (const testValue of testValues) {
      const result = curve(testValue);
      if (!isFinite(result)) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

function applyRelationshipWithValidation(sourceValue, relationship) {
  const { relationship: type, intensity, curve } = relationship;

  // Validate input to prevent edge cases
  const safeSourceValue = validateInput(sourceValue);
  const safeIntensity = validateInput(intensity);

  if (curve) {
    // Validate curve function first
    if (!validateCurve(curve)) {
      console.warn('Invalid curve function detected, falling back to linear relationship');
      return safeSourceValue * safeIntensity;
    }

    try {
      const curveResult = curve(safeSourceValue);
      return validateInput(curveResult * safeIntensity);
    } catch (error) {
      console.warn('Curve function error, falling back to linear relationship:', error);
      return safeSourceValue * safeIntensity;
    }
  }

  let result;
  switch (type) {
    case 'linear':
      result = safeSourceValue * safeIntensity;
      break;
    case 'inverse':
      result = (1.0 - safeSourceValue) * safeIntensity;
      break;
    case 'exponential':
      result = Math.pow(Math.abs(safeSourceValue), 2) * Math.sign(safeSourceValue) * safeIntensity;
      break;
    case 'logarithmic':
      result = Math.log(Math.max(0.01, Math.abs(safeSourceValue))) * Math.sign(safeSourceValue) * safeIntensity * 0.5;
      break;
    default:
      result = safeSourceValue * safeIntensity;
  }

  return validateInput(result);
}

// Test edge case inputs
console.log('=== INPUT VALIDATION TESTS ===');
const edgeCaseInputs = [
  { name: 'Infinity', value: Infinity, expected: 0 },
  { name: 'NaN', value: NaN, expected: 0 },
  { name: 'Large positive', value: 10000, expected: 1000 },
  { name: 'Large negative', value: -10000, expected: -1000 },
  { name: 'Normal', value: 1.5, expected: 1.5 }
];

edgeCaseInputs.forEach(test => {
  const result = validateInput(test.value);
  const pass = result === test.expected;
  console.log(`${test.name}: ${test.value} -> ${result} ${pass ? '✅' : '❌'}`);
});

// Test curve validation
console.log('\n=== CURVE VALIDATION TESTS ===');
const curveTests = [
  {
    name: 'Valid sine curve',
    curve: (x) => Math.sin(x * Math.PI),
    expected: true
  },
  {
    name: 'Invalid division by zero',
    curve: (x) => 1 / (x - 0.5), // Will cause division by zero at x=0.5
    expected: false
  },
  {
    name: 'Invalid infinity return',
    curve: (x) => x === 0 ? Infinity : x,
    expected: false
  },
  {
    name: 'Valid quadratic',
    curve: (x) => x * x,
    expected: true
  },
  {
    name: 'Throwing function',
    curve: (x) => { throw new Error('Test error'); },
    expected: false
  }
];

curveTests.forEach(test => {
  const result = validateCurve(test.curve);
  const pass = result === test.expected;
  console.log(`${test.name}: ${pass ? '✅' : '❌'} (expected: ${test.expected}, got: ${result})`);
});

// Test full relationship application with edge cases
console.log('\n=== RELATIONSHIP APPLICATION TESTS ===');
const relationshipTests = [
  {
    name: 'Normal linear',
    sourceValue: 1.0,
    relationship: { relationship: 'linear', intensity: 0.5 },
    expectedRange: [0.4, 0.6] // Should be around 0.5
  },
  {
    name: 'Infinity input with exponential',
    sourceValue: Infinity,
    relationship: { relationship: 'exponential', intensity: 1.0 },
    expectedRange: [-1000, 1000] // Should be clamped
  },
  {
    name: 'Valid custom curve',
    sourceValue: 0.5,
    relationship: {
      relationship: 'custom',
      intensity: 1.0,
      curve: (x) => Math.sin(x * Math.PI * 2) * 0.5 + 0.5
    },
    expectedRange: [0.4, 0.6] // Should be around 0.5
  },
  {
    name: 'Invalid custom curve fallback',
    sourceValue: 0.5,
    relationship: {
      relationship: 'custom',
      intensity: 1.0,
      curve: (x) => 1 / (x - 0.5) // Division by zero
    },
    expectedRange: [0.4, 0.6] // Should fallback to linear
  }
];

relationshipTests.forEach(test => {
  const result = applyRelationshipWithValidation(test.sourceValue, test.relationship);
  const inRange = result >= test.expectedRange[0] && result <= test.expectedRange[1];
  console.log(`${test.name}: ${test.sourceValue} -> ${result.toFixed(3)} ${inRange ? '✅' : '❌'}`);
});

console.log('\n✅ Validation testing complete');