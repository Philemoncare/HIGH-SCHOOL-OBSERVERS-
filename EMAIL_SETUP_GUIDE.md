# Email Service Setup Guide

This guide will help you configure email services for the HSO platform.

## Current Status
✅ Backend email service implemented  
✅ Contact form ready  
✅ Password reset emails ready  
✅ Payment receipts ready  
⚠️ Email credentials needed

## Step 1: Configure Gmail SMTP

### Option A: Gmail (Recommended for Development)

1. **Enable 2-Step Verification**
   - Go to [Google Account Settings](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" on device
   - Generate 16-character password
   - Copy this password (you won't see it again)

3. **Update Environment Variables**
   
   In your backend `.env` file:
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-actual-gmail@gmail.com
   SMTP_PASS=your-16-character-app-password
   ```

### Option B: SendGrid (Production Recommended)

1. **Create SendGrid Account**
   - Sign up at [SendGrid](https://sendgrid.com)
   - Verify your sender identity

2. **Get API Key**
   - Go to Settings → API Keys
   - Create new API key
   - Copy the key

3. **Update Environment Variables**
   ```bash
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-api-key
   ```

## Step 2: Test Email Configuration

After updating `.env` file:

1. **Restart Backend**
   ```bash
   # Stop current processes (Ctrl+C)
   npm run dev
   ```

2. **Check Backend Logs**
   Look for these messages:
   - ✅ `📧 Initializing email service with Gmail...`
   - ✅ `✅ Email service initialized and ready to send messages`
   - ❌ `⚠️ Email service not configured` (if still using placeholders)

## Step 3: Test Contact Form

1. Navigate to http://localhost:5173/contact
2. Fill out the contact form with real data
3. Submit the form
4. Check for:
   - ✅ Success message in UI
   - ✅ Email received in your inbox
   - ✅ Auto-reply sent to submitter

## Current Email Features

### ✅ Working Features
- Contact form submissions
- Auto-responses to users
- Password reset emails
- Payment receipts with PDF attachments
- Welcome emails for new users
- Newsletter subscription fallback (database storage)

### 📧 Email Templates Included
- Professional HTML templates
- Responsive design
- Brand consistency
- Security notices
- Clear call-to-actions

## Troubleshooting

### "Email service not configured"
- Check that `SMTP_USER` and `SMTP_PASS` are set
- Ensure no placeholder values remain
- Restart backend after changes

### Gmail Authentication Issues
- Enable "Less secure app access" temporarily
- Use App Password (not regular password)
- Check 2-Step Verification is enabled

### Port Connection Issues
- Try port 465 (SSL) instead of 587 (TLS)
- Check firewall settings
- Verify SMTP host is correct

### Emails Not Sending
- Check backend logs for error messages
- Verify sender email is verified
- Test with different recipient addresses

## Production Considerations

1. **Use Transactional Email Service**
   - SendGrid, Mailgun, or AWS SES
   - Better deliverability rates
   - Analytics and tracking
   - IP warming not required

2. **Domain Authentication**
   - SPF records
   - DKIM signatures
   - DMARC policies
   - Dedicated sending IP

3. **Rate Limiting**
   - Implement sending limits
   - Queue system for bulk emails
   - Monitor bounce rates

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use different credentials per environment
   - Rotate passwords regularly

2. **Email Content**
   - Sanitize user inputs
   - Use HTML escaping
   - Validate email addresses
   - Rate limit form submissions

3. **Error Handling**
   - Log email failures
   - Don't expose sensitive information
   - Graceful degradation when email fails

## Next Steps

1. Choose your email provider (Gmail for development, SendGrid for production)
2. Update environment variables with real credentials
3. Restart the backend server
4. Test the contact form functionality
5. Verify email delivery and auto-responses

The email infrastructure is fully implemented and ready to work once you provide the SMTP credentials!
