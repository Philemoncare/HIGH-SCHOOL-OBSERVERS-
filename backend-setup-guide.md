# 🚀 Quick Backend Setup Guide

## Step 1: Install Dependencies
Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

## Step 2: Install PostgreSQL
Make sure PostgreSQL is installed and running on your system:

**Windows:**
- Install PostgreSQL (use the official installer)
- Ensure the PostgreSQL service is running (Services → `postgresql-x64-*`)

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl enable --now postgresql
```

## Step 3: Create .env File
Create a file called `.env` in the backend directory (or copy from `env.example`):

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hso_database
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-long-and-random
JWT_EXPIRES_IN=24h

# Email Configuration (Gmail - easiest to set up)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password

# Payment Gateway Configuration (optional)
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key

# Cloudinary Configuration (optional - for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Step 4: Setup Gmail App Password
1. Go to your Google Account settings (https://myaccount.google.com/)
2. Enable 2-factor authentication
3. Go to Security → App passwords
4. Generate a new app password for "Mail"
5. Use that 16-character password in `SMTP_PASS` in your `.env` file

## Step 5: Start the Backend
```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

You should see:
```
✅ Connected to PostgreSQL database
🔗 Database connected, initializing super admin...
✅ Database initialization complete
🚀 HSO Backend Server running on port 5000
📊 Environment: development
🔗 Health check: http://localhost:5000/api/health
```

## Step 6: Test the API
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Or visit in browser
http://localhost:5000/api/health
```

## Step 7: Database Initialization
The backend automatically:
- Creates a super admin user (email: `favmoms440@gmail.com`, password: `@Qwerty1234`)
- Seeds initial data if needed

**⚠️ Important:** Change the default super admin password after first login!

## Step 8: Frontend Configuration
The frontend should be configured to connect to `http://localhost:5000` for API calls.

If using Vite, make sure your `vite.config.js` has the proxy configured, or update your API base URL in the frontend code.

## Troubleshooting

### If you get PostgreSQL connection errors:
- Make sure PostgreSQL service is running
- Check your `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` in `.env`
- Confirm you can connect using `psql` or pgAdmin

### If you get email errors:
- Check your Gmail app password (not your regular password)
- Make sure 2FA is enabled on your Google account
- Verify the email settings in `.env` (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)

### If the frontend can't connect to backend:
- Make sure the backend is running on port 5000
- Check CORS settings in `src/index.js` if needed
- Verify `FRONTEND_URL` in `.env` matches your frontend URL
- Check browser console for CORS errors

### If you see "Super admin already exists":
- This is normal - the super admin was already created
- You can use the existing credentials or modify them via the admin panel
