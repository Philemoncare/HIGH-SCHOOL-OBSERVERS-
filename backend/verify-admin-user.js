const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
require('dotenv').config();
const { connectDB } = require('./src/database/postgres');

async function verifyAdminUser() {
  try {
    await connectDB();
    console.log('✅ Connected to PostgreSQL\n');

    const email = 'favmoms440@gmail.com';
    const normalizedEmail = email.trim().toLowerCase();
    
    // Check if user exists
    let user = await User.findByEmail(normalizedEmail);
    
    if (!user) {
      console.log('❌ Admin user NOT found in database!');
      console.log('📧 Looking for:', normalizedEmail);
      console.log('\n🔧 Creating admin user...\n');
      
      // Create the admin user
      const hashedPassword = await bcrypt.hash('@Qwerty1234', 12);
      const newAdmin = await User.create({
        first_name: 'Super',
        last_name: 'Admin',
        email: normalizedEmail,
        password_hash: hashedPassword,
        role: 'super_admin',
        is_verified: true,
        is_approved: true,
        phone: '+233000000000',
        school_name: 'HSO System'
      });
      console.log('✅ Admin user created successfully!\n');
      
      // Verify password
      const isValid = await bcrypt.compare('@Qwerty1234', newAdmin.password_hash);
      console.log('🔑 Password verification:', isValid ? '✅ Valid' : '❌ Invalid');
      
    } else {
      console.log('✅ Admin user found!');
      console.log('📋 User Details:');
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.first_name} ${user.last_name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Verified: ${user.is_verified}`);
      console.log(`   Approved: ${user.is_approved}`);
      console.log(`   Has Password: ${!!user.password_hash}`);
      
      // Test password
      if (user.password_hash) {
        const testPassword1 = await bcrypt.compare('@Qwerty1234', user.password_hash);
        const testPassword2 = await bcrypt.compare('Qwerty1234', user.password_hash);
        
        console.log('\n🔑 Password Tests:');
        console.log(`   "@Qwerty1234": ${testPassword1 ? '✅ CORRECT' : '❌ Wrong'}`);
        console.log(`   "Qwerty1234": ${testPassword2 ? '✅ CORRECT' : '❌ Wrong'}`);
        
        if (!testPassword1 && !testPassword2) {
          console.log('\n⚠️  Password does not match! Resetting password...\n');
          const hashedPassword = await bcrypt.hash('@Qwerty1234', 12);
          user = await User.updateById(user.id || user._id, { password_hash: hashedPassword });
          console.log('✅ Password reset to: @Qwerty1234');
          
          // Verify new password
          const isValid = await bcrypt.compare('@Qwerty1234', user.password_hash);
          console.log('🔑 New password verification:', isValid ? '✅ Valid' : '❌ Invalid');
        }
      } else {
        console.log('\n⚠️  No password hash found! Setting password...\n');
        const hashedPassword = await bcrypt.hash('@Qwerty1234', 12);
        user = await User.updateById(user.id || user._id, { password_hash: hashedPassword });
        console.log('✅ Password set to: @Qwerty1234');
      }
    }
    
    console.log('\n📋 Login Credentials:');
    console.log('   📧 Email: favmoms440@gmail.com');
    console.log('   🔑 Password: @Qwerty1234');
    console.log('   ⚠️  Note: Password starts with @ symbol!\n');
    
    console.log('✅ Done');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

verifyAdminUser();

