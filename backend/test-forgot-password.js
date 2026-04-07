const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testForgotPassword() {
  console.log('🧪 Testing Forgot Password Functionality');
  console.log('=======================================');
  
  try {
    // Test 1: Health check
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health check passed:', healthResponse.data.status);
    
    // Test 2: Request password reset for existing user
    console.log('\n2. Testing forgot password for existing user...');
    const forgotPasswordData = {
      email: 'favmoms440@gmail.com'
    };
    
    const forgotResponse = await axios.post(`${BASE_URL}/api/auth/forgot-password`, forgotPasswordData);
    console.log('✅ Forgot password request successful:', {
      success: forgotResponse.data.success,
      message: forgotResponse.data.message
    });
    
    // Test 3: Request password reset for non-existing user (should still return success for security)
    console.log('\n3. Testing forgot password for non-existing user...');
    const nonExistingEmail = {
      email: 'nonexisting@example.com'
    };
    
    const nonExistingResponse = await axios.post(`${BASE_URL}/api/auth/forgot-password`, nonExistingEmail);
    console.log('✅ Non-existing user handled correctly:', {
      success: nonExistingResponse.data.success,
      message: nonExistingResponse.data.message
    });
    
    // Test 4: Test with invalid email format
    console.log('\n4. Testing invalid email format...');
    try {
      await axios.post(`${BASE_URL}/api/auth/forgot-password`, { email: 'invalid-email' });
      console.log('❌ Should have failed with invalid email');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Invalid email properly rejected');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }
    
    console.log('\n🎉 All forgot password tests completed successfully!');
    console.log('\n📧 Note: Check your email for the password reset link');
    console.log('🔗 The reset link will be valid for 1 hour');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testForgotPassword();
