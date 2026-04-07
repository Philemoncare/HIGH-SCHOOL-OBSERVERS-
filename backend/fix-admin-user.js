const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const { connectDB, query } = require('./src/database/postgres');

async function fixAdminUser() {
  try {
    require('dotenv').config();
    await connectDB();
    console.log('✅ Connected to PostgreSQL');

    // Delete existing admin user
    const existing = await User.findByEmail('favmoms440@gmail.com');
    if (existing) {
      await query('DELETE FROM users WHERE id = $1', [existing.id]);
      console.log('🗑️ Deleted existing admin user');
    } else {
      console.log('ℹ️ No existing admin user found');
    }

    // Hash the password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash('@Qwerty1234', saltRounds);
    console.log('🔐 Password hashed successfully');

    // Create new admin user
    const adminUser = await User.create({
      email: 'favmoms440@gmail.com',
      password_hash: passwordHash,
      first_name: 'Super',
      last_name: 'Admin',
      role: 'super_admin',
      is_verified: true,
      is_approved: true,
      school_name: 'High School Observer'
    });

    console.log('✅ New admin user created successfully');

    // Verify the user was created
    const savedUser = await User.findByEmail('favmoms440@gmail.com');
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
  }
}

fixAdminUser(); 