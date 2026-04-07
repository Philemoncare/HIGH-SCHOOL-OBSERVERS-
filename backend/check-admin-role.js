const mongoose = require('mongoose');
const User = require('./src/models/User');

async function checkAdminRole() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hso';
    await mongoose.connect(mongoUri);
    console.log('🔗 Connected to MongoDB');

    // Find the super admin
    const superAdmin = await User.findOne({ email: 'favmoms440@gmail.com' });
    
    if (!superAdmin) {
      console.log('❌ No super admin found with email: favmoms440@gmail.com');
      return;
    }

    console.log('✅ Found admin user:');
    console.log('   📧 Email:', superAdmin.email);
    console.log('   👤 Name:', superAdmin.first_name, superAdmin.last_name);
    console.log('   🎯 Role:', superAdmin.role);
    console.log('   ✅ Verified:', superAdmin.is_verified);
    console.log('   ✅ Approved:', superAdmin.is_approved);
    console.log('');
    
    if (superAdmin.role === 'super_admin') {
      console.log('🎉 User has super_admin role - should work!');
    } else if (superAdmin.role === 'executive') {
      console.log('🎉 User has executive role - should work!');
    } else {
      console.log('❌ User role is not admin:', superAdmin.role);
      console.log('💡 Updating role to super_admin...');
      
      superAdmin.role = 'super_admin';
      await superAdmin.save();
      console.log('✅ Role updated to super_admin');
    }
    
  } catch (error) {
    console.error('❌ Error checking admin role:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the check
checkAdminRole(); 