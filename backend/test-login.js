const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testLoginEndpoints() {
  console.log('🧪 Testing Login Endpoints');
  console.log('==========================');
  
  try {
    // Test 1: Health check
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test 2: Admin login
    console.log('\n2. Testing admin login...');
    const adminLoginData = {
      email: 'favmoms440@gmail.com',
      password: '@Qwerty1234'
    };
    
    const adminResponse = await axios.post(`${BASE_URL}/api/auth/admin-login`, adminLoginData);
    console.log('✅ Admin login successful:', {
      message: adminResponse.data.message,
      user: {
        email: adminResponse.data.user.email,
        role: adminResponse.data.user.role,
        first_name: adminResponse.data.user.first_name
      },
      hasToken: !!adminResponse.data.token
    });
    
    // Test 3: Regular login (should work for admin too)
    console.log('\n3. Testing regular login...');
    const regularLoginData = {
      email: 'favmoms440@gmail.com',
      password: '@Qwerty1234'
    };
    
    const regularResponse = await axios.post(`${BASE_URL}/api/auth/login`, regularLoginData);
    console.log('✅ Regular login successful:', {
      message: regularResponse.data.message,
      user: {
        email: regularResponse.data.user.email,
        role: regularResponse.data.user.role,
        first_name: regularResponse.data.user.first_name
      },
      hasToken: !!regularResponse.data.token
    });
    
    // Test 4: Test with invalid credentials
    console.log('\n4. Testing invalid credentials...');
    try {
      await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'invalid@email.com',
        password: 'wrongpassword'
      });
      console.log('❌ Should have failed with invalid credentials');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid credentials properly rejected');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }
    
    console.log('\n🎉 All login tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testLoginEndpoints();
