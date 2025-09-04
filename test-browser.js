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

console.log('Testing VIB3CODE-0 site with detailed analysis...\n');

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('=== PAGE STRUCTURE ANALYSIS ===');
    
    // Check if simple version is loaded
    const hasSimpleTest = data.includes('Loading Simple Test');
    const hasComplexInterface = data.includes('Initializing Holographic Interface');
    console.log('Simple version loading text:', hasSimpleTest);
    console.log('Complex version loading text:', hasComplexInterface);
    
    // Check main content structure
    const mainMatch = data.match(/<main[^>]*>(.*?)<\/main>/s);
    if (mainMatch) {
      console.log('\n=== MAIN CONTENT ===');
      const mainContent = mainMatch[1];
      console.log('Main content length:', mainContent.length);
      console.log('Contains spinner:', mainContent.includes('spinner'));
      console.log('Contains loading text:', mainContent.includes('Loading'));
      
      // Look for actual content beyond loading
      const hasRealContent = mainContent.includes('VIB3CODE') && 
                            mainContent.includes('Holographic AI Blog') &&
                            !mainContent.includes('spinner');
      console.log('Has actual content (not just loading):', hasRealContent);
    }
    
    // Check for JavaScript errors or React hydration issues
    const hasJSErrors = data.includes('Error:') || data.includes('TypeError:');
    const hasReactErrors = data.includes('Hydration') || data.includes('hydrat');
    console.log('\n=== ERROR ANALYSIS ===');
    console.log('JavaScript errors detected:', hasJSErrors);
    console.log('React hydration errors:', hasReactErrors);
    
    // Check if Next.js is working properly
    const hasNextJS = data.includes('__next') || data.includes('_next');
    const hasReactComponents = data.includes('react') || data.includes('React');
    console.log('\n=== FRAMEWORK STATUS ===');
    console.log('Next.js detected:', hasNextJS);
    console.log('React components detected:', hasReactComponents);
    
    // Look for script tags and potential loading issues
    const scriptCount = (data.match(/<script/g) || []).length;
    console.log('Script tags found:', scriptCount);
    
    if (hasSimpleTest && !hasComplexInterface) {
      console.log('\n✅ SIMPLE VERSION DEPLOYED');
      console.log('The simple fallback version is running.');
      if (mainMatch && mainMatch[1].includes('spinner')) {
        console.log('⚠️  Still showing loading screen - may indicate JS error preventing completion');
      }
    } else if (hasComplexInterface) {
      console.log('\n⚠️  COMPLEX VERSION STILL ACTIVE');
      console.log('The site is still using the complex version that was causing issues');
    } else {
      console.log('\n❓ UNCLEAR VERSION STATE');
      console.log('Unable to determine which version is active');
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e.message);
});

req.end();