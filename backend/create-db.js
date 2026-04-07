const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '@Godismysalvarion',
  port: 5432,
});

pool.connect()
  .then(client => {
    console.log('Connected to postgres database!');
    return client.query('CREATE DATABASE "High School Observers"');
  })
  .then(res => {
    console.log('Database created successfully!');
    return client.query('GRANT ALL PRIVILEGES ON DATABASE "High School Observers" TO hso_user');
  })
  .then(res => {
    console.log('Permissions granted successfully!');
    client.release();
    pool.end();
  })
  .catch(err => {
    console.error('Error:', err.message);
    if (client) {
      client.release();
    }
    pool.end();
  });
