const axios = require('axios');

async function testForgotPassword() {
  try {
    console.log('🧪 Quick Forgot Password Test');
    console.log('=============================');
    
    // Test forgot password for existing user
    const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
      email: 'favmoms440@gmail.com'
    });
    
    console.log('✅ Response:', response.data);
    
    if (response.data.success) {
      console.log('🎉 Forgot password request successful!');
      if (response.data.development_link) {
        console.log('🔗 Development reset link:', response.data.development_link);
        console.log('📝 Copy this link and paste it in your browser to test the reset functionality');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testForgotPassword();
