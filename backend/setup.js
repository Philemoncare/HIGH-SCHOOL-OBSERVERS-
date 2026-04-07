const fs = require('fs');
const path = require('path');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
const envContent = `# App Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_for_production
JWT_EXPIRES_IN=24h

# Database Configuration (for future use)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hso_database
DB_USER=postgres
DB_PASSWORD=your_password

# Email Configuration (REQUIRED for real email sending)
# Follow these steps to set up Gmail:
# 1. Go to https://myaccount.google.com/
# 2. Enable 2-Factor Authentication
# 3. Go to Security → App passwords
# 4. Generate a new app password for "Mail"
# 5. Use that 16-character password below
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password_16_characters
`;

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file');
} else {
  console.log('ℹ️  .env file already exists');
}

console.log('\n🚀 Backend setup complete!');
console.log('\n📧 EMAIL SETUP REQUIRED:');
console.log('1. Go to https://myaccount.google.com/');
console.log('2. Enable 2-Factor Authentication');
console.log('3. Go to Security → App passwords');
console.log('4. Generate a new app password for "Mail"');
console.log('5. Update the .env file with your email and app password');
console.log('\nNext steps:');
console.log('1. Install dependencies: npm install');
console.log('2. Configure email in .env file');
console.log('3. Start the server: npm start');
console.log('4. Test the API: curl http://localhost:5000/health');
console.log('\nThe backend will now send REAL verification codes via email!');
