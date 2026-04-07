const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

console.log('\n📧 Update Email Password\n');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  process.exit(1);
}

// Get password from command line
const password = process.argv[2];

if (!password) {
  console.log('Current status: SMTP_PASS needs to be updated\n');
  console.log('📋 To update:');
  console.log('1. Get your Gmail App Password from: https://myaccount.google.com/apppasswords');
  console.log('2. Run: node update-email-password.js YOUR_16_CHAR_PASSWORD\n');
  console.log('Example:');
  console.log('   node update-email-password.js abcdefghijklmnop\n');
  console.log('📖 For detailed instructions, see: EMAIL_SETUP.md\n');
  process.exit(0);
}

if (password.length < 16) {
  console.log('❌ Password too short. Gmail App Password should be 16 characters.');
  console.log('   Make sure you copied the full password.\n');
  process.exit(1);
}

// Read and update .env
let envContent = fs.readFileSync(envPath, 'utf8');

// Replace the password
envContent = envContent.replace(
  /SMTP_PASS=.*/g,
  `SMTP_PASS=${password.trim()}`
);

fs.writeFileSync(envPath, envContent);

console.log('✅ Password updated successfully!\n');
console.log('📋 Next steps:');
console.log('1. Restart your backend server (if running)');
console.log('2. Test with: node test-email-receipt.js\n');
console.log('📖 For more information, see: EMAIL_SETUP.md\n');

