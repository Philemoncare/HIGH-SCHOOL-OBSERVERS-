const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Check if email configuration is available
      const placeholders = ['your_app_password_here', 'YOUR_APP_PASSWORD_HERE'];
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS || 
          placeholders.includes(process.env.SMTP_PASS)) {
        console.log('⚠️ Email service not configured. Running in development mode.');
        this.isConfigured = false;
        return;
      }

      console.log('📧 Initializing email service with Gmail...');
      console.log('📧 SMTP User:', process.env.SMTP_USER);
      console.log('📧 SMTP Host:', process.env.SMTP_HOST);

      // Create transporter - use port 465 (SSL) for Gmail, it's more reliable
      // Port 587 often gets closed by Gmail, but 465 works consistently
      const port = process.env.SMTP_HOST === 'smtp.gmail.com' ? 465 : (parseInt(process.env.SMTP_PORT) || 465);
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: port,
        secure: port === 465, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 20000, // 20 seconds
        greetingTimeout: 20000,
        socketTimeout: 20000
      });

      // Set as configured immediately - we'll verify on first send
      this.isConfigured = true;
      console.log('✅ Email service initialized and ready to send messages');

    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
      this.isConfigured = false;
    }
  }

  async sendPasswordResetEmail(email, firstName, resetLink) {
    if (!this.isConfigured) {
      throw new Error('Email service not configured');
    }

    console.log('📧 Attempting to send password reset email to:', email);
    console.log('📧 From:', process.env.SMTP_USER);
    console.log('📧 Reset Link:', resetLink);

    const mailOptions = {
      from: `"HSO Platform" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'HSO Platform - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #d32f2f; margin: 0;">HSO Platform</h1>
              <p style="color: #666; margin: 5px 0;">High School Observer</p>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
            
            <p style="color: #666; margin-bottom: 20px;">Hello ${firstName},</p>
            
            <p style="color: #666; margin-bottom: 20px;">
              We received a request to reset your password for your HSO Platform account.
            </p>
            
            <p style="color: #666; margin-bottom: 20px;">
              Click the button below to reset your password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #d32f2f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #666; margin-bottom: 10px; font-size: 14px;">
                <strong>Or copy and paste this link into your browser:</strong>
              </p>
              <p style="color: #d32f2f; word-break: break-all; margin: 0; font-size: 14px; background-color: white; padding: 10px; border-radius: 3px;">
                ${resetLink}
              </p>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.
              </p>
            </div>
            
            <p style="color: #666; margin-bottom: 20px;">
              If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              HSO Platform - High School Observer<br>
              This is an automated message, please do not reply.
            </p>
          </div>
        </div>
      `
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent successfully:', {
        messageId: result.messageId,
        to: email
      });
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      throw error;
    }
  }

  async sendPasswordResetConfirmation(email, firstName) {
    if (!this.isConfigured) {
      throw new Error('Email service not configured');
    }

    const mailOptions = {
      from: `"HSO Platform" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'HSO Platform - Password Successfully Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #d32f2f; margin: 0;">HSO Platform</h1>
              <p style="color: #666; margin: 5px 0;">High School Observer</p>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Password Successfully Reset</h2>
            
            <p style="color: #666; margin-bottom: 20px;">Hello ${firstName},</p>
            
            <p style="color: #666; margin-bottom: 20px;">
              Your password has been successfully reset for your HSO Platform account.
            </p>
            
            <p style="color: #666; margin-bottom: 20px;">
              You can now log in with your new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
                 style="background-color: #d32f2f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
                Login Now
              </a>
            </div>
            
            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #155724; margin: 0; font-size: 14px;">
                <strong>✅ Security Notice:</strong> If you didn't request this password reset, please contact our support team immediately.
              </p>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              HSO Platform - High School Observer<br>
              This is an automated message, please do not reply.
            </p>
          </div>
        </div>
      `
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset confirmation email sent successfully:', {
        messageId: result.messageId,
        to: email
      });
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Failed to send confirmation email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(email, firstName) {
    if (!this.isConfigured) {
      throw new Error('Email service not configured');
    }

    const mailOptions = {
      from: `"HSO Platform" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to HSO Platform!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #d32f2f; margin: 0;">Welcome to HSO Platform!</h1>
              <p style="color: #666; margin: 5px 0;">High School Observer</p>
            </div>
            
            <p style="color: #666; margin-bottom: 20px;">Hello ${firstName},</p>
            
            <p style="color: #666; margin-bottom: 20px;">
              Welcome to the HSO Platform! We're excited to have you join our community.
            </p>
            
            <p style="color: #666; margin-bottom: 20px;">
              You can now access all the features of our platform including:
            </p>
            
            <ul style="color: #666; margin-bottom: 20px;">
              <li>News and updates from your school</li>
              <li>Event registration and management</li>
              <li>Leadership information</li>
              <li>Donation campaigns</li>
              <li>And much more!</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
                 style="background-color: #d32f2f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
                Get Started
              </a>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              HSO Platform - High School Observer<br>
              This is an automated message, please do not reply.
            </p>
          </div>
        </div>
      `
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent successfully:', {
        messageId: result.messageId,
        to: email
      });
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      throw error;
    }
  }

  isEmailConfigured() {
    return this.isConfigured;
  }

  async sendPaymentReceipt(email, firstName, paymentData, receiptFilePath) {
    if (!this.isConfigured) {
      console.log('⚠️ Email service not configured. Receipt would be sent to:', email);
      console.log('📄 Receipt generated at:', receiptFilePath);
      return { success: false, message: 'Email service not configured' };
    }

    const paymentTypeLabels = {
      'donation': 'Donation',
      'membership': 'Membership Payment',
      'shop': 'Product Purchase',
      'events': 'Event Registration'
    };

    const paymentTypeLabel = paymentTypeLabels[paymentData.type] || 'Payment';

    const mailOptions = {
      from: `"HSO Platform" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `HSO Platform - Payment Receipt for ${paymentTypeLabel}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #d32f2f; margin: 0;">HSO Platform</h1>
              <p style="color: #666; margin: 5px 0;">High School Observer</p>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Payment Receipt</h2>
            
            <p style="color: #666; margin-bottom: 20px;">Hello ${firstName},</p>
            
            <p style="color: #666; margin-bottom: 20px;">
              Thank you for your ${paymentTypeLabel.toLowerCase()}! Your payment has been successfully processed.
            </p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Receipt Number:</strong></td>
                  <td style="padding: 8px 0; color: #333; text-align: right;">${paymentData.reference}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Payment Type:</strong></td>
                  <td style="padding: 8px 0; color: #333; text-align: right;">${paymentTypeLabel}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Amount:</strong></td>
                  <td style="padding: 8px 0; color: #d32f2f; text-align: right; font-size: 18px; font-weight: bold;">${paymentData.currency || 'GHS'} ${paymentData.amount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Date:</strong></td>
                  <td style="padding: 8px 0; color: #333; text-align: right;">${paymentData.paymentDate.toLocaleDateString('en-GB', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Status:</strong></td>
                  <td style="padding: 8px 0; color: #28a745; text-align: right; font-weight: bold;">✓ Paid</td>
                </tr>
              </table>
            </div>

            ${paymentData.details ? `
              <div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0; margin-bottom: 10px;">Transaction Details</h3>
                ${paymentData.type === 'donation' && paymentData.details.campaignTitle ? `
                  <p style="color: #666; margin: 5px 0;"><strong>Campaign:</strong> ${paymentData.details.campaignTitle}</p>
                ` : ''}
                ${paymentData.type === 'membership' && paymentData.details.membershipType ? `
                  <p style="color: #666; margin: 5px 0;"><strong>Membership Type:</strong> ${paymentData.details.membershipType}</p>
                  <p style="color: #666; margin: 5px 0;"><strong>Status:</strong> Active</p>
                ` : ''}
                ${paymentData.type === 'shop' && paymentData.details.productName ? `
                  <p style="color: #666; margin: 5px 0;"><strong>Product:</strong> ${paymentData.details.productName}</p>
                  <p style="color: #666; margin: 5px 0;"><strong>Quantity:</strong> ${paymentData.details.quantity || 1}</p>
                ` : ''}
                ${paymentData.type === 'events' && paymentData.details.eventTitle ? `
                  <p style="color: #666; margin: 5px 0;"><strong>Event:</strong> ${paymentData.details.eventTitle}</p>
                  <p style="color: #666; margin: 5px 0;"><strong>Registration Status:</strong> Confirmed</p>
                ` : ''}
              </div>
            ` : ''}
            
            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #155724; margin: 0; font-size: 14px;">
                <strong>📄 Receipt Attached:</strong> A PDF receipt has been attached to this email for your records.
              </p>
            </div>
            
            <p style="color: #666; margin-bottom: 20px;">
              Please keep this receipt for your records. If you have any questions about this transaction, please contact our support team.
            </p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              HSO Platform - High School Observer<br>
              This is an automated message, please do not reply.
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `receipt_${paymentData.reference}.pdf`,
          path: receiptFilePath
        }
      ]
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Payment receipt email sent successfully:', {
        messageId: result.messageId,
        to: email,
        receipt: receiptFilePath
      });
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Failed to send payment receipt email:', error);
      throw error;
    }
  }

  async sendEmail(to, subject, htmlContent) {
    if (!this.isConfigured || !this.transporter) {
      console.warn('⚠️ Email service not configured. Email not sent.');
      throw new Error('Email service not configured');
    }

    const mailOptions = {
      from: `"HSO Platform" <${process.env.SMTP_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', {
        messageId: result.messageId,
        to: to,
        subject: subject
      });
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      throw error;
    }
  }

  getConfigurationStatus() {
    const placeholders = ['your_app_password_here', 'YOUR_APP_PASSWORD_HERE'];
    return {
      configured: this.isConfigured,
      smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
      smtpPort: process.env.SMTP_PORT || 587,
      smtpUser: process.env.SMTP_USER ? 'Configured' : 'Not configured',
      smtpPass: process.env.SMTP_PASS && !placeholders.includes(process.env.SMTP_PASS) ? 'Configured' : 'Not configured'
    };
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;
