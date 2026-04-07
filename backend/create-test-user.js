const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const { connectDB } = require('./src/database/postgres');

async function createTestUser() {
  try {
    require('dotenv').config();
    await connectDB();
    console.log('✅ Connected to PostgreSQL');

    // Check if test user already exists
    const existingUser = await User.findByEmail('test@hso.com');
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
    await User.create({
      email: 'test@hso.com',
      password_hash: passwordHash,
      first_name: 'Test',
      last_name: 'User',
      role: 'public',
      is_verified: true,
      is_approved: true,
      school_name: 'Test School'
    });

    console.log('✅ Test user created successfully');
    console.log('📧 Email: test@hso.com');
    console.log('🔑 Password: test123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTestUser();
