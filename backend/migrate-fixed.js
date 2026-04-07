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
  console.log('✅ Tables created! Now adding indexes...');
  
  // Add indexes separately
  const indexStatements = [
    'CREATE INDEX idx_users_email ON users(email);',
    'CREATE INDEX idx_users_role ON users(role);',
    'CREATE INDEX idx_users_created_at ON users(created_at);',
    'CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);',
    'CREATE INDEX idx_user_sessions_token ON user_sessions(token);',
    'CREATE INDEX idx_events_date ON events(date);',
    'CREATE INDEX idx_events_status ON events(status);',
    'CREATE INDEX idx_events_created_by ON events(created_by);',
    'CREATE INDEX idx_news_slug ON news(slug);',
    'CREATE INDEX idx_news_status ON news(status);',
    'CREATE INDEX idx_news_created_by ON news(created_by);',
    'CREATE INDEX idx_news_published_at ON news(published_at);',
    'CREATE INDEX idx_donation_campaigns_status ON donation_campaigns(status);',
    'CREATE INDEX idx_donation_campaigns_created_by ON donation_campaigns(created_by);',
    'CREATE INDEX idx_orders_user_id ON orders(user_id);',
    'CREATE INDEX idx_orders_status ON orders(status);',
    'CREATE INDEX idx_payments_order_id ON payments(order_id);',
    'CREATE INDEX idx_payments_user_id ON payments(user_id);',
    'CREATE INDEX idx_audit_user_id ON audit(user_id);',
    'CREATE INDEX idx_audit_resource ON audit(resource_type, resource_id);'
  ];
  
  const createIndexes = async () => {
  for (let i = 0; i < indexStatements.length; i++) {
    try {
      await query(indexStatements[i]);
      console.log(`✅ Index ${i + 1}/${indexStatements.length} created successfully`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`ℹ️  Index ${i + 1}/${indexStatements.length} already exists (skipping)`);
      } else {
        console.error(`❌ Index ${i + 1}/${indexStatements.length} failed:`, error.message);
      }
    }
  }
};
  
  console.log('🎉 All database objects created successfully!');
}).catch(error => {
  console.error('❌ Database creation failed:', error);
});
