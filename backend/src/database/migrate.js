require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { query, queryOne } = require('./postgres');

const runMigration = async () => {
  try {
    console.log('🚀 Starting database migration...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await query(statement);
        console.log(`✅ Statement ${i + 1}/${statements.length} executed successfully`);
      } catch (error) {
        // Ignore errors for statements that might already exist (like CREATE EXTENSION)
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate key value') ||
            error.message.includes('relation') && error.message.includes('already exists')) {
          console.log(`ℹ️  Statement ${i + 1}/${statements.length} already exists (skipping)`);
        } else {
          console.error(`❌ Statement ${i + 1}/${statements.length} failed:`, error.message);
          console.error('Statement:', statement);
          throw error;
        }
      }
    }
    
    console.log('🎉 Database migration completed successfully!');
    
    // Verify tables were created
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📊 Created tables:');
    tables.rows.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  runMigration().then(() => {
    console.log('✅ Migration script completed');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
}

module.exports = { runMigration };
