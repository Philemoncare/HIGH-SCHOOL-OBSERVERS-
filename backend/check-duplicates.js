const User = require('./src/models/User');
const { connectDB } = require('./src/database/postgres');

async function checkDuplicates() {
  try {
    require('dotenv').config();
    await connectDB();
    console.log('✅ Connected to PostgreSQL');

    // Find all users with the admin email
    const u = await User.findByEmail('favmoms440@gmail.com');
    const users = u ? [u] : [];
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
      console.log(`   ID: ${user.id || user._id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Name: ${user.first_name} ${user.last_name}`);
      console.log(`   Verified: ${user.is_verified}`);
      console.log(`   Approved: ${user.is_approved}`);
      console.log(`   Created: ${user.created_at}`);
      console.log(`   Updated: ${user.updated_at}`);
    });

    // Check for other admin users
    const allUsers = await User.find({});
    const allAdmins = allUsers.filter(u2 => ['super_admin', 'executive', 'admin'].includes(u2.role));
    console.log(`\n👑 Total admin users in database: ${allAdmins.length}`);
    
    allAdmins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.email} (${admin.role})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDuplicates(); 