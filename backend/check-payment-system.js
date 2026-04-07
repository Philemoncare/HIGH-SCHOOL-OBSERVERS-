const axios = require('axios');

async function checkPaymentSystem() {
  console.log('🔍 Checking HSO Payment System Status...\n');
  
  const baseURL = 'http://localhost:5000';
  
  try {
    // Check if server is running
    console.log('1️⃣ Checking server connectivity...');
    try {
      await axios.get(`${baseURL}/api/health`);
      console.log('   ✅ Server is running');
    } catch (error) {
      console.log('   ❌ Server is not running. Please start the backend server first.');
      console.log('   💡 Run: npm run dev (from backend directory)');
      return;
    }
    
    // Check payment system status
    console.log('\n2️⃣ Checking payment system configuration...');
    try {
      const statusResponse = await axios.get(`${baseURL}/api/payments/status`);
      const status = statusResponse.data;
      
      console.log(`   Paystack Initialized: ${status.paystack_initialized ? '✅ Yes' : '❌ No'}`);
      console.log(`   API Key Configured: ${status.api_key_configured ? '✅ Yes' : '❌ No'}`);
      console.log(`   Frontend URL: ${status.frontend_url}`);
      console.log(`   System Status: ${status.status}`);
      
      if (!status.paystack_initialized) {
        console.log('\n   🚨 ISSUE: Paystack is not initialized');
        console.log('   💡 SOLUTION: Check your .env file and ensure PAYSTACK_SECRET_KEY is set correctly');
      }
      
      if (!status.api_key_configured) {
        console.log('\n   🚨 ISSUE: API keys are not properly configured');
        console.log('   💡 SOLUTION: Get real Paystack keys from https://dashboard.paystack.com/#/settings/developers');
        console.log('   💡 Update your backend/.env file with the real keys');
      }
      
    } catch (error) {
      console.log('   ❌ Could not check payment system status');
      console.log(`   Error: ${error.message}`);
    }
    
    // Test donation initialization
    console.log('\n3️⃣ Testing donation payment initialization...');
    try {
      const testData = {
        campaignId: '507f1f77bcf86cd799439011', // Test campaign ID
        amount: 100,
        email: 'test@example.com',
        name: 'Test User',
        phone: '1234567890',
        message: 'Test donation',
        anonymous: false
      };
      
      const response = await axios.post(`${baseURL}/api/payments/donations/initialize`, testData);
      
      if (response.data.success) {
        console.log('   ✅ Donation payment initialization works');
        console.log(`   Authorization URL: ${response.data.authorization_url}`);
      } else {
        console.log('   ❌ Donation payment initialization failed');
        console.log(`   Error: ${response.data.error}`);
      }
    } catch (error) {
      console.log('   ❌ Donation payment initialization failed');
      console.log(`   Error: ${error.response?.data?.error || error.message}`);
    }
    
    // Test shop payment initialization
    console.log('\n4️⃣ Testing shop payment initialization...');
    try {
      const testData = {
        productId: '507f1f77bcf86cd799439012', // Test product ID
        quantity: 1,
        amount: 50,
        email: 'test@example.com',
        name: 'Test Customer',
        phone: '1234567890',
        address: 'Test Address'
      };
      
      const response = await axios.post(`${baseURL}/api/payments/shop/initialize`, testData);
      
      if (response.data.success) {
        console.log('   ✅ Shop payment initialization works');
        console.log(`   Authorization URL: ${response.data.authorization_url}`);
      } else {
        console.log('   ❌ Shop payment initialization failed');
        console.log(`   Error: ${response.data.error}`);
      }
    } catch (error) {
      console.log('   ❌ Shop payment initialization failed');
      console.log(`   Error: ${error.response?.data?.error || error.message}`);
    }
    
    // Check environment variables
    console.log('\n5️⃣ Checking environment variables...');
    const requiredVars = [
      'PAYSTACK_SECRET_KEY',
      'PAYSTACK_PUBLIC_KEY',
      'FRONTEND_URL',
      'MONGODB_URI',
      'JWT_SECRET'
    ];
    
    for (const varName of requiredVars) {
      const value = process.env[varName];
      if (value) {
        if (varName.includes('KEY') && value.includes('1234567890')) {
          console.log(`   ⚠️  ${varName}: Set (but using dummy keys)`);
        } else {
          console.log(`   ✅ ${varName}: Set`);
        }
      } else {
        console.log(`   ❌ ${varName}: Not set`);
      }
    }
    
    console.log('\n📋 SUMMARY:');
    console.log('   If you see ❌ or ⚠️ above, please fix those issues first.');
    console.log('   The most common issue is using dummy Paystack API keys.');
    console.log('   Get real keys from: https://dashboard.paystack.com/#/settings/developers');
    console.log('\n🧪 TESTING:');
    console.log('   1. Go to: http://localhost:3000/donations');
    console.log('   2. Click "Donate Now" on any campaign');
    console.log('   3. Fill the form and click "Donate"');
    console.log('   4. Use test card: 4084 0840 8408 4081');
    console.log('   5. Complete the payment');
    console.log('\n🎯 Expected Result:');
    console.log('   - Redirect to Paystack payment page');
    console.log('   - Payment completes successfully');
    console.log('   - Redirect back to verification page');
    console.log('   - Shows success message');
    
  } catch (error) {
    console.error('❌ Error checking payment system:', error.message);
  }
}

// Run the check
checkPaymentSystem(); 