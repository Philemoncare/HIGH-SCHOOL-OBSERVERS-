require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { query } = require('./src/database/postgres');

const runMigrationWithoutIndexes = async () => {
  try {
    console.log('🚀 Starting database migration (tables only)...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'src/database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
      .filter(stmt => {
        const upperStmt = stmt.toUpperCase().replace(/\s+/g, ' ');
        return upperStmt.includes('CREATE TABLE') || upperStmt.startsWith('CREATE TABLE')
      });
    
    console.log(`📝 Found ${statements.length} CREATE TABLE statements`);
    
    // Execute each CREATE TABLE statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await query(statement);
        console.log(`✅ Table ${i + 1}/${statements.length} created successfully`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`ℹ️  Table ${i + 1}/${statements.length} already exists (skipping)`);
        } else {
          console.error(`❌ Table ${i + 1}/${statements.length} failed:`, error.message);
          console.error('Statement:', statement);
          throw error;
        }
      }
    }
    
    console.log('🎉 Tables created successfully!');
  } catch (error) {
    console.error('❌ Table creation failed:', error);
    throw error;
  }
};

runMigrationWithoutIndexes().then(() => {
  console.log('✅ Table creation completed');
}).catch(error => {
  console.error('❌ Table creation failed:', error);
});
