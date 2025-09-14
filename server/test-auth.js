// Simple test script to verify authentication endpoints
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:4000';

async function testAuthEndpoints() {
  console.log('Testing authentication endpoints...\n');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.ok ? 'PASS' : 'FAIL');
    
    // Test registration with invalid data
    console.log('\n2. Testing registration with invalid data...');
    const invalidRegResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'A', // Too short
        email: 'invalid-email',
        password: '123', // Too weak
        confirmPassword: '456' // Doesn't match
      })
    });
    const invalidRegData = await invalidRegResponse.json();
    console.log('✅ Invalid registration validation:', invalidRegResponse.status === 400 ? 'PASS' : 'FAIL');
    
    // Test registration with valid data
    console.log('\n3. Testing registration with valid data...');
    const testEmail = `test-${Date.now()}@example.com`;
    const validRegResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: testEmail,
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!'
      })
    });
    
    if (validRegResponse.status === 201) {
      const regData = await validRegResponse.json();
      console.log('✅ Valid registration:', 'PASS');
      console.log('   Token received:', !!regData.token);
      console.log('   Requires onboarding:', regData.requiresOnboarding);
      
      // Test login with the registered user
      console.log('\n4. Testing login...');
      const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'TestPassword123!'
        })
      });
      
      if (loginResponse.status === 200) {
        const loginData = await loginResponse.json();
        console.log('✅ Login:', 'PASS');
        console.log('   Token received:', !!loginData.token);
        
        // Test protected endpoint
        console.log('\n5. Testing protected endpoint...');
        const meResponse = await fetch(`${BASE_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${loginData.token}` }
        });
        
        if (meResponse.status === 200) {
          const meData = await meResponse.json();
          console.log('✅ Protected endpoint:', 'PASS');
          console.log('   User data received:', !!meData.user);
          console.log('   Requires onboarding:', meData.requiresOnboarding);
        } else {
          console.log('❌ Protected endpoint: FAIL');
        }
      } else {
        console.log('❌ Login: FAIL');
      }
    } else {
      console.log('❌ Valid registration: FAIL');
      console.log('   Status:', validRegResponse.status);
      const errorData = await validRegResponse.json();
      console.log('   Error:', errorData);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run tests
testAuthEndpoints();