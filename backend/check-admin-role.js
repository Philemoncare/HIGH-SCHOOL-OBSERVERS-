const User = require('./src/models/User');
const { connectDB } = require('./src/database/postgres');

async function checkAdminRole() {
  try {
    require('dotenv').config();
    await connectDB();
    console.log('🔗 Connected to PostgreSQL');

    // Find the super admin
    const superAdmin = await User.findByEmail('favmoms440@gmail.com');
    
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
      
      await User.updateById(superAdmin.id || superAdmin._id, { role: 'super_admin' });
      console.log('✅ Role updated to super_admin');
    }
    
  } catch (error) {
    console.error('❌ Error checking admin role:', error);
  }
}

// Run the check
checkAdminRole(); 