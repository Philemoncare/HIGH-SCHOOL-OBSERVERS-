require('dotenv').config();
const emailService = require('./src/services/emailService');
const receiptService = require('./src/services/receiptService');

async function testEmailReceipt() {
  console.log('\n🧪 Testing Email Receipt Service\n');

  // Check email configuration
  const emailStatus = emailService.getConfigurationStatus();
  console.log('📧 Email Service Status:');
  console.log(`   Configured: ${emailStatus.configured ? '✅ Yes' : '❌ No'}`);
  console.log(`   SMTP Host: ${emailStatus.smtpHost}`);
  console.log(`   SMTP Port: ${emailStatus.smtpPort}`);
  console.log(`   SMTP User: ${emailStatus.smtpUser}`);
  console.log(`   SMTP Pass: ${emailStatus.smtpPass}\n`);

  if (!emailStatus.configured) {
    console.log('❌ Email service is not configured!');
    console.log('\n📋 To configure:');
    console.log('1. Get your Gmail App Password: https://myaccount.google.com/apppasswords');
    console.log('2. Run: node update-email-password.js YOUR_16_CHAR_PASSWORD');
    console.log('3. See EMAIL_SETUP.md for detailed instructions\n');
    process.exit(1);
  }

  // Test receipt generation
  console.log('📄 Generating test receipt...');
  try {
    const testReceiptData = {
      reference: 'TEST_' + Date.now(),
      type: 'membership',
      amount: 50.00,
      currency: 'GHS',
      customerName: 'Test User',
      customerEmail: process.env.SMTP_USER, // Send to your own email
      customerPhone: '+233 XX XXX XXXX',
      paymentDate: new Date(),
      details: {
        membershipType: 'Official Membership',
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    };

    const receiptPath = await receiptService.generateReceipt(testReceiptData);
    console.log('✅ Receipt generated:', receiptPath);

    // Test email sending
    console.log('\n📧 Sending test email with receipt...');
    const result = await emailService.sendPaymentReceipt(
      testReceiptData.customerEmail,
      'Test',
      testReceiptData,
      receiptPath
    );

    if (result.success) {
      console.log('✅ Test email sent successfully!');
      console.log(`   Message ID: ${result.messageId}`);
      console.log(`   Check your inbox: ${testReceiptData.customerEmail}\n`);
    } else {
      console.log('❌ Failed to send email:', result.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testEmailReceipt();

