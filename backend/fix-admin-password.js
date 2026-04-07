const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function fixAdminPassword() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hso';
    await mongoose.connect(mongoUri);
    console.log('🔗 Connected to MongoDB');

    // Find the super admin
    const superAdmin = await User.findOne({ role: 'super_admin' });
    
    if (!superAdmin) {
      console.log('❌ No super admin found. Run npm run init:admin first.');
      return;
    }

    console.log('🔍 Found super admin:', superAdmin.email);
    
    // Check if password is already hashed (bcrypt hashes start with $2a$ or $2b$)
    if (superAdmin.password_hash.startsWith('$2a$') || superAdmin.password_hash.startsWith('$2b$')) {
      console.log('✅ Password is already properly hashed');
      return;
    }

    // Hash the password properly
    const passwordHash = await bcrypt.hash('@Qwerty1234', 10);
    superAdmin.password_hash = passwordHash;
    await superAdmin.save();

    console.log('✅ Super admin password fixed!');
    console.log('🔐 You can now log in with:');
    console.log('   📧 Email: favmoms440@gmail.com');
    console.log('   🔑 Password: @Qwerty1234');
    
  } catch (error) {
    console.error('❌ Error fixing password:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the fix
fixAdminPassword(); 