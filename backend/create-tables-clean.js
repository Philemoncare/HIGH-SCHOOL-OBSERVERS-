require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { query } = require('./src/database/postgres');

// Read the schema file and extract CREATE TABLE statements
const schemaPath = path.join(__dirname, 'src/database/schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');
const allStatements = schema.split(';').map(stmt => stmt.trim());

// Filter only CREATE TABLE statements
const createTableStatements = allStatements.filter(stmt => {
  const upperStmt = stmt.toUpperCase().replace(/\s+/g, ' ');
  return upperStmt.includes('CREATE TABLE') || upperStmt.startsWith('CREATE TABLE')
});

console.log(`🚀 Creating ${createTableStatements.length} tables...`);

// Execute each CREATE TABLE statement
const createTables = async () => {
  for (let i = 0; i < createTableStatements.length; i++) {
    const statement = createTableStatements[i];
    try {
      await query(statement);
      console.log(`✅ Table ${i + 1}/${createTableStatements.length} created successfully`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`ℹ️  Table ${i + 1}/${createTableStatements.length} already exists (skipping)`);
      } else {
        console.error(`❌ Table ${i + 1}/${createTableStatements.length} failed:`, error.message);
        console.error('Statement:', statement);
        throw error;
      }
    }
  }
};

createTables().then(() => {
  console.log('🎉 All tables created successfully!');
}).catch(error => {
  console.error('❌ Table creation failed:', error);
});
