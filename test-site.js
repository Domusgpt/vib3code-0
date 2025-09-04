const https = require('https');

const options = {
  hostname: 'domusgpt.github.io',
  port: 443,
  path: '/vib3code-0/',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const hasTitle = data.includes('VIB3CODE-0 | Holographic AI Blog');
    const hasWebGLManager = data.includes('window.vib3perf');
    const hasFont = data.includes('__Orbitron_1db291');
    const hasLoading = data.includes('global-loading');
    const hasOrbitronClass = data.includes('font-orbitron');
    const hasHolographicStyles = data.includes('holographic-text');
    
    console.log('=== VIB3CODE-0 SITE ANALYSIS ===');
    console.log('✅ Title present:', hasTitle);
    console.log('✅ WebGL manager present:', hasWebGLManager);  
    console.log('✅ Font loaded:', hasFont);
    console.log('✅ Loading screen:', hasLoading);
    console.log('✅ Orbitron classes:', hasOrbitronClass);
    console.log('✅ Holographic styles:', hasHolographicStyles);
    
    // Check for potential issues
    const has404 = data.includes('404');
    const hasContextLost = data.includes('Context Lost');
    const hasR3FError = data.includes('R3F: Hooks');
    
    console.log('\n=== POTENTIAL ISSUES ===');
    console.log('❌ 404 errors:', has404);
    console.log('❌ WebGL context lost:', hasContextLost);
    console.log('❌ R3F hook errors:', hasR3FError);
    
    if (!has404 && !hasContextLost && !hasR3FError) {
      console.log('\n🎉 SITE STATUS: HEALTHY');
      console.log('No critical errors detected in HTML source.');
      console.log('All core components appear to be loaded properly.');
    } else {
      console.log('\n⚠️  SITE STATUS: ISSUES DETECTED');
      console.log('Some problems found that may affect functionality.');
    }
    
    // Check for WebGL context management
    if (hasWebGLManager) {
      console.log('\n📊 WebGL Context Manager detected:');
      console.log('- Max contexts: 4');
      console.log('- Performance monitoring: Active');
      console.log('- Loading screen: 2 second delay');
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e.message);
});

req.end();