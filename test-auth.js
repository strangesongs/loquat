// Simple test script for authentication endpoints
async function testAuth() {
  const baseUrl = 'http://localhost:8080';
  
  console.log('🧪 Testing Authentication System...\n');
  
  // Test 1: Register new user
  console.log('1️⃣ Testing user registration...');
  try {
    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userName: 'testuser',
        password: 'TestPass123!',
        email: 'test@example.com'
      })
    });
    
    const registerData = await registerResponse.json();
    console.log('Registration response:', registerData);
    
    if (registerData.success) {
      console.log('✅ Registration successful!');
      
      // Test 2: Login with created user
      console.log('\n2️⃣ Testing user login...');
      const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userName: 'testuser',
          password: 'TestPass123!'
        })
      });
      
      const loginData = await loginResponse.json();
      console.log('Login response:', loginData);
      
      if (loginData.success && loginData.token) {
        console.log('✅ Login successful!');
        
        // Test 3: Access protected endpoint
        console.log('\n3️⃣ Testing protected endpoint...');
        const meResponse = await fetch(`${baseUrl}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${loginData.token}`
          }
        });
        
        const meData = await meResponse.json();
        console.log('Protected endpoint response:', meData);
        
        if (meData.success) {
          console.log('✅ Protected endpoint access successful!');
        } else {
          console.log('❌ Protected endpoint access failed');
        }
      } else {
        console.log('❌ Login failed');
      }
    } else {
      console.log('❌ Registration failed:', registerData.message);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAuth();
