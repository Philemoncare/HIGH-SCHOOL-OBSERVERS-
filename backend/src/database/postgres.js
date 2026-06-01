const { Pool } = require('pg');

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'hso_database',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'your_password',
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      }
);

const connectDB = async () => {
  try {
    // Test the connection
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    console.log('📊 Database info:', {
      host: client.host,
      port: client.port,
      database: client.database,
      user: client.user
    });
    client.release();
  } catch (err) {
    console.error('❌ PostgreSQL connection error:', err.message);
    console.error('💡 Make sure PostgreSQL is running on your system');
    console.error('💡 On Windows, you can:');
    console.error('   1. Check Services (Win+R → services.msc) → Find "postgresql-x64-XX" → Start');
    console.error('   2. Or use pgAdmin to start the service');
    console.error('💡 Connection string:', process.env.DATABASE_URL || 'postgresql://postgres:your_password@localhost:5432/hso_database');
    
    // In production: log but don't exit - server can still respond to health checks
    console.warn('⚠️ Server will run without database. Set DATABASE_URL for full functionality.');
    if (process.env.NODE_ENV !== 'production') {
      // Auto-retry in development so starting PostgreSQL later "just works"
      setTimeout(() => {
        console.log('🔁 Retrying PostgreSQL connection...');
        connectDB();
      }, 5000);
    }
  }
};

// Helper function to execute queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 Query executed', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Query error', { text, error: error.message });
    throw error;
  }
};

// Helper function to get a single row
const queryOne = async (text, params) => {
  const res = await query(text, params);
  return res.rows[0];
};

// Helper function to get multiple rows
const queryMany = async (text, params) => {
  const res = await query(text, params);
  return res.rows;
};

// Transaction helper
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Close the connection pool
const closeDB = async () => {
  await pool.end();
  console.log('🔌 PostgreSQL connection pool closed');
};

module.exports = {
  pool,
  connectDB,
  query,
  queryOne,
  queryMany,
  transaction,
  closeDB
};
