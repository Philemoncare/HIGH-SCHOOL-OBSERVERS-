const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const { queryOne, queryMany, transaction } = require('./postgres');
const seedData = require('./seed-data');

// Startup never wipes events, news, or donations. Published content stays until
// an admin deletes or edits it. Seed only fills empty tables (first run).

const initializeDatabase = async () => {
  try {
    console.log('🚀 Initializing database...');

    // Check if super admin already exists
    const existingSuperAdmin = await queryOne(
      'SELECT * FROM users WHERE role = $1',
      ['super_admin']
    );
    
    if (!existingSuperAdmin) {
      console.log('👑 Creating super admin...');
      
      const hashedPassword = await bcrypt.hash('@Qwerty1234', 12);
      
      await queryOne(
        `INSERT INTO users (first_name, last_name, email, password_hash, role, is_verified, is_approved, phone, school_name, position)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
        [
          'Super',
          'Admin',
          'favmoms440@gmail.com',
          hashedPassword,
          'super_admin',
          true,
          true,
          '+233000000000',
          'HSO System',
          'System Administrator'
        ]
      );
      
      console.log('✅ Super admin created successfully!');
    } else {
      console.log('✅ Super admin already exists');
    }

    // Seed initial data
    await seedData();

    console.log('🎉 Database initialization completed!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
};

module.exports = initializeDatabase; 