const axios = require('axios');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

async function comprehensiveAdminTest() {
  console.log('🔍 Comprehensive Admin Login Test');
  console.log('================================');
  
  try {
    // 1. Test database connection
    console.log('\n1. Testing database connection...');
    await mongoose.connect('mongodb://localhost:27017/hso_platform');
    console.log('✅ Database connected successfully');
    
    // 2. Check if admin user exists
    console.log('\n2. Checking admin user in database...');
    const adminUser = await User.findOne({ email: 'favmoms440@gmail.com' });
    if (!adminUser) {
      console.log('❌ Admin user not found in database');
      console.log('💡 Run: node fix-admin-user.js to create admin user');
      return;
    }
    console.log('✅ Admin user found in database');
    console.log(`   📧 Email: ${adminUser.email}`);
    console.log(`   🎯 Role: ${adminUser.role}`);
    console.log(`   ✅ Verified: ${adminUser.is_verified}`);
    console.log(`   ✅ Approved: ${adminUser.is_approved}`);
    
    // 3. Test password verification
    console.log('\n3. Testing password verification...');
    const isValidPassword = await bcrypt.compare('@Qwerty1234', adminUser.password_hash);
    if (!isValidPassword) {
      console.log('❌ Password verification failed');
      console.log('💡 Run: node fix-admin-user.js to fix password');
      return;
    }
    console.log('✅ Password verification successful');
    
    // 4. Test backend server connectivity
    console.log('\n4. Testing backend server...');
    try {
      const healthResponse = await axios.get('http://localhost:5000/api/health');
      console.log('✅ Backend server is running');
      console.log('   📊 Status:', healthResponse.data.status);
    } catch (error) {
      console.log('❌ Backend server not accessible');
      console.log('💡 Start backend with: npm run dev');
      return;
    }
    
    // 5. Test admin login endpoint
    console.log('\n5. Testing admin login endpoint...');
    const loginData = {
      email: 'favmoms440@gmail.com',
      password: '@Qwerty1234'
    };
    
    const loginResponse = await axios.post('http://localhost:5000/api/auth/admin-login', loginData);
    console.log('✅ Admin login endpoint working');
    console.log('   👤 User:', loginResponse.data.user.first_name, loginResponse.data.user.last_name);
    console.log('   🎯 Role:', loginResponse.data.user.role);
    console.log('   🔐 Token:', loginResponse.data.token ? 'Received' : 'Missing');
    
    // 6. Test frontend proxy (if frontend is running)
    console.log('\n6. Testing frontend proxy...');
    try {
      const frontendResponse = await axios.post('http://localhost:3000/api/auth/admin-login', loginData);
      console.log('✅ Frontend proxy working');
      console.log('   🌐 Frontend accessible at: http://localhost:3000');
    } catch (error) {
      console.log('⚠️ Frontend not accessible (may not be running)');
      console.log('💡 Start frontend with: cd frontend && npm run dev');
    }
    
    console.log('\n🎉 All tests passed!');
    console.log('\n📋 Admin Login Information:');
    console.log('   🌐 Frontend URL: http://localhost:3000/admin-login');
    console.log('   📧 Email: favmoms440@gmail.com');
    console.log('   🔑 Password: @Qwerty1234');
    console.log('   🎯 Role: super_admin');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n💡 Troubleshooting steps:');
    console.log('   1. Make sure MongoDB is running');
    console.log('   2. Start backend: cd backend && npm run dev');
    console.log('   3. Start frontend: cd frontend && npm run dev');
    console.log('   4. Create admin user: node fix-admin-user.js');
  } finally {
    await mongoose.disconnect();
  }
}

comprehensiveAdminTest();
