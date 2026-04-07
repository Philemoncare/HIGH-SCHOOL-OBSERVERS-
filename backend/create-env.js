const fs = require('fs');
const path = require('path');

const envContent = `# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=favmoms440@gmail.com
SMTP_PASS=your_app_password_here

# Payment Gateway Configuration
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key

# File Upload Limits
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf
`;

const envPath = path.join(__dirname, '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('📧 Email sender configured as: favmoms440@gmail.com');
  console.log('⚠️  IMPORTANT: You need to set SMTP_PASS to your Gmail app password');
  console.log('📝 Instructions:');
  console.log('   1. Go to your Google Account settings');
  console.log('   2. Enable 2-factor authentication');
  console.log('   3. Generate an App Password for "Mail"');
  console.log('   4. Replace "your_app_password_here" in .env with the generated password');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
}
