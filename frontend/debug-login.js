const axios = require('axios');

async function debugLogin() {
  console.log('🔍 Debugging login response...');
  
  try {
    const loginResponse = await axios.post('http://localhost:5000/api/auth/admin-login', {
      email: 'favmoms440@gmail.com',
      password: '@Qwerty1234'
    });
    
    console.log('✅ Login successful');
    console.log('Full response:', JSON.stringify(loginResponse.data, null, 2));
    
    const user = loginResponse.data.user;
    console.log('\nUser object keys:', Object.keys(user));
    console.log('User ID field:', user._id);
    console.log('User ID type:', typeof user._id);
    
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data || error.message);
  }
}

debugLogin(); 