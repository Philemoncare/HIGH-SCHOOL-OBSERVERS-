const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function createAdminUser() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hso';
    await mongoose.connect(mongoUri);
    console.log('🔗 Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@hso.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('📧 Email: admin@hso.com');
      console.log('🔑 Password: admin123');
      return;
    }

    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    const adminUser = new User({
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@hso.com',
      password_hash: passwordHash,
      role: 'super_admin',
      is_verified: true,
      is_approved: true,
      phone: '+1234567890',
      school_name: 'HSO System',
      position: 'Administrator'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@hso.com');
    console.log('🔑 Password: admin123');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
createAdminUser(); 