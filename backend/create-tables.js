require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { query } = require('./src/database/postgres');

const createTables = async () => {
  try {
    console.log('🚀 Creating tables...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'src/database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('Schema file length:', schema.length);
    console.log('Schema content preview:', schema.substring(0, 500));
    
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
    console.log('CREATE TABLE statements preview:', statements.slice(0, 3));
    
    // Execute each CREATE TABLE statement
    for (let i = 0; i < statements.length; i++) {
      const tableStatement = statements[i];
      try {
        await query(tableStatement);
        console.log(`✅ Table ${i + 1}/${statements.length} created successfully`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`ℹ️  Table ${i + 1}/${statements.length} already exists (skipping)`);
        } else {
          console.error(`❌ Table ${i + 1}/${createTableStatements.length} failed:`, error.message);
          console.error('Statement:', tableStatement);
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

createTables().then(() => {
  console.log('✅ Table creation completed');
}).catch(error => {
  console.error('❌ Table creation failed:', error);
});
