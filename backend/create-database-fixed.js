require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { query } = require('./src/database/postgres');

// Read the schema file
const schemaPath = path.join(__dirname, 'src/database/schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');
const allStatements = schema.split(';').map(stmt => stmt.trim());

// Separate CREATE TYPE and CREATE TABLE statements
const createTypeStatements = allStatements.filter(stmt => {
  const upperStmt = stmt.toUpperCase().replace(/\s+/g, ' ');
  return upperStmt.includes('CREATE TYPE') || upperStmt.startsWith('CREATE TYPE');
});

const createTableStatements = allStatements.filter(stmt => {
  const upperStmt = stmt.toUpperCase().replace(/\s+/g, ' ');
  return upperStmt.includes('CREATE TABLE') || upperStmt.startsWith('CREATE TABLE');
});

console.log(`🚀 Creating ${createTypeStatements.length} types and ${createTableStatements.length} tables...`);

// Execute CREATE TYPE statements first
const createTypes = async () => {
  console.log('📝 Creating types...');
  for (let i = 0; i < createTypeStatements.length; i++) {
    const statement = createTypeStatements[i];
    try {
      await query(statement);
      console.log(`✅ Type ${i + 1}/${createTypeStatements.length} created successfully`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`ℹ️  Type ${i + 1}/${createTypeStatements.length} already exists (skipping)`);
      } else {
        console.error(`❌ Type ${i + 1}/${createTypeStatements.length} failed:`, error.message);
        console.error('Statement:', statement);
        throw error;
      }
    }
  }
};

// Then execute CREATE TABLE statements
const createTables = async () => {
  console.log('📝 Creating tables...');
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

// Execute in sequence
createTypes().then(() => {
  return createTables();
}).then(() => {
  console.log('🎉 All database objects created successfully!');
}).catch(error => {
  console.error('❌ Database creation failed:', error);
});
