const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

async function fixAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/hso_platform');
    console.log('✅ Connected to MongoDB');

    // Delete existing admin user
    const deleteResult = await User.deleteMany({ email: 'favmoms440@gmail.com' });
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing admin users`);

    // Hash the password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash('@Qwerty1234', saltRounds);
    console.log('🔐 Password hashed successfully');

    // Create new admin user
    const adminUser = new User({
      email: 'favmoms440@gmail.com',
      password_hash: passwordHash,
      first_name: 'Super',
      last_name: 'Admin',
      role: 'super_admin',
      is_verified: true,
      is_approved: true,
      school_name: 'High School Observer',
      created_at: new Date(),
      updated_at: new Date()
    });

    await adminUser.save();
    console.log('✅ New admin user created successfully');

    // Verify the user was created
    const savedUser = await User.findOne({ email: 'favmoms440@gmail.com' });
    console.log('📋 Admin user details:');
    console.log(`   Email: ${savedUser.email}`);
    console.log(`   Role: ${savedUser.role}`);
    console.log(`   Verified: ${savedUser.is_verified}`);
    console.log(`   Approved: ${savedUser.is_approved}`);

    // Test password verification
    const isValidPassword = await bcrypt.compare('@Qwerty1234', savedUser.password_hash);
    console.log(`🔑 Password verification: ${isValidPassword ? '✅ Valid' : '❌ Invalid'}`);

    console.log('\n🎉 Admin user fixed successfully!');
    console.log('📋 Login credentials:');
    console.log('   Email: favmoms440@gmail.com');
    console.log('   Password: @Qwerty1234');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fixAdminUser(); 