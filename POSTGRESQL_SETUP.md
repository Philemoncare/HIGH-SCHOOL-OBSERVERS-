# PostgreSQL Setup Guide for HSO Platform

This guide will help you migrate from MongoDB to PostgreSQL for the High School Observer platform.

## Prerequisites

1. **PostgreSQL Server** installed on your system
2. **Node.js** and **npm** installed
3. **pgAdmin** (optional, for database management)

## Step 1: Install PostgreSQL

### Windows
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and remember your password
3. Make sure to install pgAdmin (included in installer)

### macOS
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql

# Create database user
createuser -s postgres
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Step 2: Create Database

### Using pgAdmin (GUI)
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on "Databases" → "Create" → "Database"
4. Name it `hso_database`
5. Click "Save"

### Using Command Line
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE hso_database;

# Exit
\q
```

## Step 3: Configure Environment Variables

Update your `.env` file with PostgreSQL connection details:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/hso_database

# Alternative format (if above doesn't work)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hso_database
DB_USER=postgres
DB_PASSWORD=your_password
```

**Important**: Replace `your_password` with your actual PostgreSQL password.

## Step 4: Run Database Migration

The migration will create all necessary tables and set up the database schema:

```bash
# Navigate to backend directory
cd backend

# Run migration
npm run migrate

# Or run both migration and initialization
npm run setup:db
```

## Step 5: Start the Application

```bash
# Start development server
npm run dev

# Or production server
npm start
```

## Step 6: Verify Installation

1. Check the server logs for successful database connection
2. Visit `http://localhost:5000/api/health` to verify database status
3. The super admin user should be created automatically

## Troubleshooting

### Connection Issues

**Error**: `ECONNREFUSED 127.0.0.1:5432`
- **Solution**: Make sure PostgreSQL service is running
- **Windows**: Check Services → Find "postgresql-x64-XX" → Start
- **macOS/Linux**: `brew services start postgresql` or `sudo systemctl start postgresql`

**Error**: `password authentication failed for user "postgres"`
- **Solution**: Verify your PostgreSQL password in `.env` file
- **Reset password**: `ALTER USER postgres PASSWORD 'new_password';`

### Migration Issues

**Error**: `relation "users" does not exist`
- **Solution**: Run `npm run migrate` to create tables
- **Force recreate**: Drop database and recreate, then migrate again

**Error**: `permission denied for database hso_database`
- **Solution**: Grant permissions to your user:
  ```sql
  GRANT ALL PRIVILEGES ON DATABASE hso_database TO postgres;
  ```

### Performance Tips

1. **Enable Connection Pooling**: Already configured in `postgres.js`
2. **Add Indexes**: Already included in schema
3. **Monitor Performance**: Use pgAdmin's dashboard

## Database Schema

The migration creates the following tables:

- `users` - User accounts and profiles
- `user_sessions` - User login sessions
- `events` - Events and conferences
- `news` - News articles and posts
- `donation_campaigns` - Fundraising campaigns
- `leadership` - Leadership team members
- `newsletter_subscribers` - Email subscribers
- `password_resets` - Password reset tokens
- `products` - Shop products
- `orders` - Customer orders
- `payments` - Payment records
- `settings` - Application settings
- `audit` - Audit logs

## Next Steps

1. **Test all API endpoints** to ensure they work with PostgreSQL
2. **Update any custom queries** in your routes if needed
3. **Set up regular backups** of your PostgreSQL database
4. **Consider setting up replication** for production

## Migration from MongoDB Data

If you have existing MongoDB data you want to migrate:

1. Export data from MongoDB using `mongoexport`
2. Transform the data format to match PostgreSQL schema
3. Import using `psql` or Node.js scripts
4. Update ID references (MongoDB ObjectId → UUID)

## Production Considerations

1. **Use PostgreSQL on cloud** (AWS RDS, Google Cloud SQL, etc.)
2. **Set up SSL connections** for security
3. **Configure connection pooling** for high traffic
4. **Set up read replicas** for better performance
5. **Regular backups and point-in-time recovery**

## Support

If you encounter issues:

1. Check PostgreSQL logs: `postgresql.log` in your data directory
2. Verify network connectivity: `telnet localhost 5432`
3. Test connection manually: `psql -U postgres -h localhost -d hso_database`
4. Review application logs for detailed error messages
