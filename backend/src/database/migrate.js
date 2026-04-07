const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const fs = require('fs');
const { query } = require('./postgres');

function splitSqlStatements(sql) {
  const statements = [];
  let current = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let dollarTag = null; // e.g. $$ or $func$

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    const next2 = sql.slice(i, i + 2);

    // Handle line comments (-- ...)
    if (!inSingleQuote && !inDoubleQuote && !dollarTag && next2 === '--') {
      // skip until newline, but keep newline
      while (i < sql.length && sql[i] !== '\n') i++;
      current += '\n';
      continue;
    }

    // Toggle single quotes (handle escaped '')
    if (!inDoubleQuote && !dollarTag && ch === "'") {
      current += ch;
      if (inSingleQuote) {
        if (sql[i + 1] === "'") {
          // escaped quote
          current += "'";
          i++;
        } else {
          inSingleQuote = false;
        }
      } else {
        inSingleQuote = true;
      }
      continue;
    }

    // Toggle double quotes for identifiers
    if (!inSingleQuote && !dollarTag && ch === '"') {
      inDoubleQuote = !inDoubleQuote;
      current += ch;
      continue;
    }

    // Dollar-quoted blocks ($$...$$ or $tag$...$tag$)
    if (!inSingleQuote && !inDoubleQuote) {
      if (!dollarTag && ch === '$') {
        const match = sql.slice(i).match(/^\$[A-Za-z_0-9]*\$/);
        if (match) {
          dollarTag = match[0];
          current += dollarTag;
          i += dollarTag.length - 1;
          continue;
        }
      } else if (dollarTag && sql.startsWith(dollarTag, i)) {
        current += dollarTag;
        i += dollarTag.length - 1;
        dollarTag = null;
        continue;
      }
    }

    // Statement terminator
    if (!inSingleQuote && !inDoubleQuote && !dollarTag && ch === ';') {
      const stmt = current.trim();
      if (stmt.length > 0) statements.push(stmt);
      current = '';
      continue;
    }

    current += ch;
  }

  const tail = current.trim();
  if (tail.length > 0) statements.push(tail);
  return statements;
}

const runMigration = async () => {
  try {
    console.log('🚀 Starting database migration...');

    // Apply safe schema patches for existing databases (idempotent).
    // This prevents seed/init failures when the DB was created with older schema versions.
    try {
      await query(`ALTER TABLE IF EXISTS events ALTER COLUMN time TYPE VARCHAR(50)`);
      console.log('✅ Patched events.time to VARCHAR(50)');
    } catch (e) {
      console.log('ℹ️  events.time patch skipped:', e.message);
    }
    
    // Leadership columns added after initial migration
    try {
      await query(`ALTER TABLE IF EXISTS leadership ADD COLUMN IF NOT EXISTS slug VARCHAR(255)`);
      await query(`ALTER TABLE IF EXISTS leadership ADD COLUMN IF NOT EXISTS avatar_emoji VARCHAR(10)`);
      await query(`ALTER TABLE IF EXISTS leadership ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb`);
      await query(`ALTER TABLE IF EXISTS leadership ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true`);
      await query(`ALTER TABLE IF EXISTS leadership ADD COLUMN IF NOT EXISTS department VARCHAR(120)`);
      await query(`ALTER TABLE IF EXISTS leadership ADD COLUMN IF NOT EXISTS location VARCHAR(120)`);
      await query(`ALTER TABLE IF EXISTS leadership ADD COLUMN IF NOT EXISTS start_year INTEGER`);
      await query(`ALTER TABLE IF EXISTS leadership ADD COLUMN IF NOT EXISTS highlights TEXT[] DEFAULT '{}'`);
      await query(`ALTER TABLE IF EXISTS leadership ADD COLUMN IF NOT EXISTS focus_areas TEXT[] DEFAULT '{}'`);
      await query(`ALTER TABLE IF EXISTS leadership ADD COLUMN IF NOT EXISTS calendly_link VARCHAR(255)`);
      await query(`CREATE UNIQUE INDEX IF NOT EXISTS leadership_slug_unique ON leadership(slug)`);
      console.log('✅ Patched leadership columns (slug/avatar/social/is_active)');
    } catch (e) {
      console.log('ℹ️  leadership patch skipped:', e.message);
    }
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements (supports $$ functions)
    const statements = splitSqlStatements(schema)
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
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
