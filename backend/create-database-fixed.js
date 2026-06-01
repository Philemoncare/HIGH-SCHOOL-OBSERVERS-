require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { query } = require('./src/database/postgres');

// Read the schema file
const schemaPath = path.join(__dirname, 'src/database/schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');
const allStatements = schema.split(';').map(stmt => stmt.trim());

// Separate statements by type
const extensionStatements = allStatements.filter(stmt => {
  const upperStmt = stmt.toUpperCase().trim();
  return upperStmt.startsWith('CREATE EXTENSION');
});

const createTypeStatements = allStatements.filter(stmt => {
  const upperStmt = stmt.toUpperCase().trim();
  return upperStmt.startsWith('CREATE TYPE');
});

const createTableStatements = allStatements.filter(stmt => {
  const upperStmt = stmt.toUpperCase().trim();
  return upperStmt.startsWith('CREATE TABLE');
});

const indexStatements = allStatements.filter(stmt => {
  const upperStmt = stmt.toUpperCase().trim();
  return upperStmt.startsWith('CREATE INDEX');
});

const otherStatements = allStatements.filter(stmt => {
  const upperStmt = stmt.toUpperCase().trim();
  return upperStmt.length > 0 &&
         !upperStmt.startsWith('CREATE EXTENSION') &&
         !upperStmt.startsWith('CREATE TYPE') &&
         !upperStmt.startsWith('CREATE TABLE') &&
         !upperStmt.startsWith('CREATE INDEX') &&
         !upperStmt.startsWith('--');
});

console.log(`🚀 Preparation: ${extensionStatements.length} extensions, ${createTypeStatements.length} types, ${createTableStatements.length} tables, ${indexStatements.length} indexes, ${otherStatements.length} other.`);

const executeStatements = async (name, statements) => {
  console.log(`📝 Executing ${name}...`);
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    try {
      await query(statement);
      console.log(`✅ ${name} ${i + 1}/${statements.length} successful`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`ℹ️  ${name} ${i + 1}/${statements.length} already exists (skipping)`);
      } else {
        console.error(`❌ ${name} ${i + 1}/${statements.length} failed:`, error.message);
        // console.error('Statement:', statement);
        // Don't throw for everything, some might be minor
        if (name === 'extensions' || name === 'types' || name === 'tables') throw error;
      }
    }
  }
};

// Execute in sequence
async function run() {
  await executeStatements('extensions', extensionStatements);
  await executeStatements('types', createTypeStatements);
  await executeStatements('tables', createTableStatements);
  await executeStatements('indexes', indexStatements);
  await executeStatements('others', otherStatements);
  console.log('🎉 All database objects processed!');
}

run().catch(error => {
  console.error('❌ Database creation failed:', error);
});
