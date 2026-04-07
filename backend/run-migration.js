require('dotenv').config();
const { query } = require('./src/database/postgres');

// Create UUID extension first
const createExtension = async () => {
  try {
    console.log('🔧 Creating UUID extension...');
    await query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('✅ UUID extension created');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️ UUID extension already exists');
    } else {
      console.error('❌ Failed to create UUID extension:', error.message);
      throw error;
    }
  }
};

// Then run the main migration
createExtension().then(() => {
  console.log('🚀 Now running main migration...');
  const { spawn } = require('child_process');
  const migrate = spawn('"C:\\\\Program Files\\nodejs\\node.exe"', ['database/migrate.js'], {
    stdio: 'inherit'
  });
  
  migrate.stdout.on('data', (data) => {
    process.stdout.write(data);
  });
  
  migrate.stderr.on('data', (data) => {
    process.stderr.write(data);
  });
  
  migrate.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Migration completed successfully!');
    } else {
      console.log('❌ Migration failed with code:', code);
    }
  });
}).catch(error => {
  console.error('❌ Failed to run migration:', error);
});
