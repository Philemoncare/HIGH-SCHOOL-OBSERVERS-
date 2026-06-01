require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { query } = require('./src/database/postgres');

const createTables = async () => {
  try {
    console.log('🚀 Creating database objects...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'src/database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split by semicolon but be careful with functions/triggers
    // A simpler way is to use a more robust regex or just run the whole thing if the driver supports it
    // For PostgreSQL via 'pg' pool.query, you can actually run multiple statements in one call.
    
    console.log('Executing schema...');
    await query(schema);
    
    console.log('🎉 Database objects created successfully!');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️ Some objects already exist, but schema execution continued.');
    } else {
      console.error('❌ Table creation failed:', error.message);
      throw error;
    }
  }
};

createTables().then(() => {
  console.log('✅ Table creation completed');
}).catch(error => {
  console.error('❌ Table creation failed:', error);
});
