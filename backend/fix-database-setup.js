const { Client } = require('pg');
require('dotenv').config();

const postgresConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '@Godismysalvarion', // Assuming this is the postgres password as well
  port: 5432,
};

async function setup() {
  const client = new Client(postgresConfig);
  try {
    console.log('Connecting to PostgreSQL as "postgres" user...');
    await client.connect();
    console.log('Connected!');

    // Check if role exists
    const roleRes = await client.query("SELECT 1 FROM pg_roles WHERE rolname = 'hso_user'");
    if (roleRes.rowCount === 0) {
      console.log('Creating role "hso_user"...');
      await client.query("CREATE ROLE hso_user WITH LOGIN PASSWORD '@Godismysalvarion'");
      await client.query("ALTER ROLE hso_user CREATEDB");
      console.log('Role "hso_user" created.');
    } else {
      console.log('Role "hso_user" already exists.');
      // Update password just in case
      await client.query("ALTER ROLE hso_user WITH PASSWORD '@Godismysalvarion'");
    }

    // Check if database exists
    const dbRes = await client.query("SELECT 1 FROM pg_database WHERE datname = 'High School Observers'");
    if (dbRes.rowCount === 0) {
      console.log('Creating database "High School Observers"...');
      await client.query('CREATE DATABASE "High School Observers"');
      console.log('Database "High School Observers" created.');
    } else {
      console.log('Database "High School Observers" already exists.');
    }

    // Grant privileges
    console.log('Granting privileges...');
    await client.query('GRANT ALL PRIVILEGES ON DATABASE "High School Observers" TO hso_user');

    // Connect to the target database to grant schema permissions
    const targetDbClient = new Client({ ...postgresConfig, database: 'High School Observers' });
    await targetDbClient.connect();
    await targetDbClient.query('GRANT ALL ON SCHEMA public TO hso_user');
    await targetDbClient.query('GRANT ALL ON SCHEMA public TO public'); // Sometimes needed
    await targetDbClient.end();

    console.log('Privileges granted.');

  } catch (err) {
    console.error('Error during setup:', err.message);
    if (err.message.includes('password authentication failed')) {
      console.log('💡 Try without password if your local postgres has no password...');
      try {
        const noPassClient = new Client({ ...postgresConfig, password: '' });
        await noPassClient.connect();
        console.log('Connected without password!');
        // ... repeat logic or just tell user
        console.log('Please update the script with the correct postgres password or no password.');
        await noPassClient.end();
      } catch (e) {
        console.error('Still failed without password.');
      }
    }
  } finally {
    await client.end();
  }
}

setup();
