const mongoose = require('mongoose');
const User = require('./src/models/User');

async function checkDuplicates() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/hso_platform');
    console.log('✅ Connected to MongoDB');

    // Find all users with the admin email
    const users = await User.find({ email: 'favmoms440@gmail.com' });
    console.log(`\n📊 Found ${users.length} users with email: favmoms440@gmail.com`);

    if (users.length === 0) {
      console.log('❌ No admin users found!');
      return;
    }

    if (users.length > 1) {
      console.log('⚠️  DUPLICATE USERS FOUND!');
    } else {
      console.log('✅ Only one admin user found');
    }

    // Display details for each user
    users.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Name: ${user.first_name} ${user.last_name}`);
      console.log(`   Verified: ${user.is_verified}`);
      console.log(`   Approved: ${user.is_approved}`);
      console.log(`   Created: ${user.created_at}`);
      console.log(`   Updated: ${user.updated_at}`);
    });

    // Check for other admin users
    const allAdmins = await User.find({ 
      role: { $in: ['super_admin', 'executive'] } 
    });
    console.log(`\n👑 Total admin users in database: ${allAdmins.length}`);
    
    allAdmins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.email} (${admin.role})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkDuplicates(); 