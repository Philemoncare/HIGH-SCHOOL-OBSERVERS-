const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const { connectDB } = require('./src/database/postgres');

async function fixAdminPassword() {
  try {
    require('dotenv').config();
    await connectDB();
    console.log('🔗 Connected to PostgreSQL');

    // Find the super admin
    const users = await User.find({ role: 'super_admin' }, { limit: 1 });
    const superAdmin = users?.[0] || null;
    
    if (!superAdmin) {
      console.log('❌ No super admin found. Run npm run init:admin first.');
      return;
    }

    console.log('🔍 Found super admin:', superAdmin.email);
    
    // Check if password is already hashed (bcrypt hashes start with $2a$ or $2b$)
    if (superAdmin.password_hash && (superAdmin.password_hash.startsWith('$2a$') || superAdmin.password_hash.startsWith('$2b$'))) {
      console.log('✅ Password is already properly hashed');
      return;
    }

    // Hash the password properly
    const passwordHash = await bcrypt.hash('@Qwerty1234', 10);
    await User.updateById(superAdmin.id || superAdmin._id, { password_hash: passwordHash });

    console.log('✅ Super admin password fixed!');
    console.log('🔐 You can now log in with:');
    console.log('   📧 Email: favmoms440@gmail.com');
    console.log('   🔑 Password: @Qwerty1234');
    
  } catch (error) {
    console.error('❌ Error fixing password:', error);
  }
}

// Run the fix
fixAdminPassword(); 