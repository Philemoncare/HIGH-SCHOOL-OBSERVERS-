const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const { connectDB } = require('./src/database/postgres');

async function createAdminUser() {
  try {
    require('dotenv').config();
    await connectDB();
    console.log('🔗 Connected to PostgreSQL');

    // Check if admin user already exists
    const existingAdmin = await User.findByEmail('admin@hso.com');
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('📧 Email: admin@hso.com');
      console.log('🔑 Password: admin123');
      return;
    }

    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    await User.create({
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@hso.com',
      password_hash: passwordHash,
      role: 'super_admin',
      is_verified: true,
      is_approved: true,
      phone: '+1234567890',
      school_name: 'HSO System'
    });
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@hso.com');
    console.log('🔑 Password: admin123');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

// Run the script
createAdminUser(); 