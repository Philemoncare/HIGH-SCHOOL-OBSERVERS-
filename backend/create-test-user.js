const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

async function createTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/hso_platform');
    console.log('✅ Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@hso.com' });
    if (existingUser) {
      console.log('✅ Test user already exists');
      console.log('📧 Email: test@hso.com');
      console.log('🔑 Password: test123');
      return;
    }

    // Hash the password
    const passwordHash = await bcrypt.hash('test123', 10);
    console.log('🔐 Password hashed successfully');

    // Create test user
    const testUser = new User({
      email: 'test@hso.com',
      password_hash: passwordHash,
      first_name: 'Test',
      last_name: 'User',
      role: 'public',
      is_verified: true,
      is_approved: true,
      school_name: 'Test School',
      created_at: new Date(),
      updated_at: new Date()
    });

    await testUser.save();
    console.log('✅ Test user created successfully');
    console.log('📧 Email: test@hso.com');
    console.log('🔑 Password: test123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createTestUser();
