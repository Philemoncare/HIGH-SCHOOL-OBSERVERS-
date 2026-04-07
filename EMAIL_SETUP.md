# 📧 Email Service Setup Guide

## Overview

The HSO Platform email service automatically sends payment receipts to customers after successful payments. This guide will help you configure Gmail (or other email providers) to enable this feature.

## Quick Setup (Gmail)

### Step 1: Get Gmail App Password

1. **Go to App Passwords**: https://myaccount.google.com/apppasswords
   - If you don't see "App Passwords", enable 2-Step Verification first:
     - Go to: https://myaccount.google.com/security
     - Enable "2-Step Verification"
     - Then return to App Passwords page

2. **Generate Password**:
   - Select app: **Mail**
   - Select device: **Other (Custom name)**
   - Type: `HSO Platform`
   - Click **Generate**

3. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)
   - ⚠️ You can only see this password ONCE - copy it immediately!

### Step 2: Update Configuration

**Option A: Using Script (Recommended)**
```bash
cd backend
node update-email-password.js YOUR_16_CHAR_PASSWORD
```
(Remove spaces from the password when running the command)

**Option B: Manual Edit**
1. Open `backend/.env`
2. Find: `SMTP_PASS=...`
3. Replace with: `SMTP_PASS=abcdefghijklmnop` (your 16-char password, no spaces)
4. Save the file

### Step 3: Test Email Service

```bash
cd backend
node test-email-receipt.js
```

This will:
- ✅ Check email configuration
- ✅ Generate a test PDF receipt
- ✅ Send it to your configured email address
- ✅ Show success/failure status

### Step 4: Restart Backend Server

After configuration, restart your backend server:
```bash
cd backend
npm start
# or
npm run dev
```

## Configuration Details

### Required Environment Variables

Add these to your `backend/.env` file:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
```

**Note**: The system automatically uses port 465 (SSL) for Gmail, which is more reliable than port 587.

## How It Works

After every successful payment (donations, membership, shop purchases, event registrations), the system will:

1. ✅ Generate a professional PDF receipt
2. ✅ Send it via email to the customer's email address
3. ✅ Include payment details and transaction information

## Alternative Email Providers

### Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your_email@outlook.com
SMTP_PASS=your_app_password
```

### Custom SMTP Server

```env
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email@domain.com
SMTP_PASS=your_password
```

## Troubleshooting

### ❌ "Email service not configured"
- Check your `.env` file has correct SMTP settings
- Make sure `SMTP_PASS` is not set to a placeholder value
- Restart backend server after updating `.env`

### ❌ "Authentication failed" or "Invalid login"
- Verify you're using an **App Password**, not your regular Gmail password
- For Gmail, make sure 2-Step Verification is enabled
- Regenerate app password if needed
- Check that there are no extra spaces in the password

### ❌ "Connection timeout" or "Unexpected socket close"
- The system automatically uses port 465 (SSL) for Gmail
- Check your internet connection
- Verify SMTP host and port are correct
- Check firewall settings

### ❌ Email not received
- Check spam/junk folder
- Verify the email address in payment is correct
- Check backend console logs for error messages

## Available Utilities

### Update Email Password
```bash
cd backend
node update-email-password.js YOUR_16_CHAR_PASSWORD
```

### Test Email Service
```bash
cd backend
node test-email-receipt.js
```

## Receipt Details

Every payment receipt email includes:
- 📄 **PDF Receipt Attachment** - Professional receipt with all details
- 📧 **HTML Email** - Summary of payment with transaction details
- ✅ **Payment Confirmation** - Receipt number, amount, date, status

### Receipt Information:
- Receipt number (payment reference)
- Payment date and time
- Customer information (name, email, phone)
- Payment type (Donation, Membership, Shop, Events)
- Amount paid
- Transaction-specific details

## Notes

- ✅ Payments will succeed even if email fails (error logged only)
- ✅ Receipts are stored in `backend/receipts/` directory
- ✅ Email service works in both development and production
- ✅ The system uses port 465 (SSL) for Gmail automatically

## Support

If you encounter issues:
1. Check backend console logs
2. Verify `.env` file configuration
3. Test email with `node test-email-receipt.js`
4. Check spam folder for test emails
5. Verify Gmail App Password is correct

