const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');

// Contact form submission
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, school, membership, message } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Prepare email content
    const emailSubject = `New Contact Form Submission from ${name}`;
    const emailContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
      ${school ? `<p><strong>School/Institution:</strong> ${school}</p>` : ''}
      ${membership ? `<p><strong>Membership Type:</strong> ${membership}</p>` : ''}
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <hr>
      <p><small>Submitted on: ${new Date().toLocaleString()}</small></p>
    `;

    // Send email notification
    try {
      await emailService.sendEmail(
        process.env.CONTACT_EMAIL || process.env.SMTP_USER || 'highschoolobserver91@gmail.com',
        emailSubject,
        emailContent
      );
      console.log('✅ Contact form email sent successfully');
    } catch (emailError) {
      console.error('⚠️ Failed to send contact form email:', emailError);
      // Don't fail the request if email fails, but log it
    }

    // Send auto-reply to user
    try {
      const autoReplyContent = `
        <h2>Thank You for Contacting HSO!</h2>
        <p>Dear ${name},</p>
        <p>Thank you for reaching out to High School Observer. We have received your message and will get back to you as soon as possible.</p>
        <p>Your inquiry is important to us, and we appreciate your patience.</p>
        <hr>
        <p><strong>Your Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p>Best regards,<br>HSO Team</p>
      `;
      
      await emailService.sendEmail(
        email,
        'Thank You for Contacting HSO',
        autoReplyContent
      );
      console.log('✅ Auto-reply email sent to user');
    } catch (autoReplyError) {
      console.error('⚠️ Failed to send auto-reply email:', autoReplyError);
      // Don't fail the request if auto-reply fails
    }

    res.json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      error: 'Failed to send message. Please try again later.',
      message: error.message
    });
  }
});

module.exports = router;

