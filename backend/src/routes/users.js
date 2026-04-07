const express = require('express');
const multer = require('multer');
const User = require('../models/User');
const { authenticate, requireRole } = require('../middleware/auth');
const router = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Audit = require('../models/Audit');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get all users (admin only)
router.get('/', authenticate, requireRole(['super_admin', 'executive']), async (req, res) => {
  try {
    const users = await User.find({});
    users.forEach(u => delete u.password_hash);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update profile information (must be before /:id routes)
router.put('/profile', authenticate, async (req, res) => {
  try {
    const uid = req.user._id || req.user.id;
    const { first_name, last_name, email, phone, school_name, bio, location, website, social_links, profile_image } = req.body;
    
    if (email && email !== req.user.email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }
    }

    const updateData = { first_name, last_name, email, phone, school_name, bio, location, website, social_links, profile_image };

    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === null) {
        delete updateData[key];
      }
    });

    const user = await User.updateById(uid, updateData);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    delete user.password_hash;
    res.json({ success: true, user });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
});

// Update profile image
router.put('/profile-image', authenticate, upload.single('profile_image'), async (req, res) => {
  try {
    const uid = req.user._id || req.user.id;
    if (!req.file) return res.status(400).json({ error: 'No image file uploaded' });

    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    const user = await User.updateById(uid, { profile_image: base64Image });
    if (!user) return res.status(404).json({ error: 'User not found' });

    delete user.password_hash;
    res.json({ success: true, user });
  } catch (error) {
    console.error('Profile image update error:', error);
    res.status(500).json({ error: 'Failed to update profile image' });
  }
});

// Change password
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const uid = req.user._id || req.user.id;
    const { current_password, new_password } = req.body;

    const user = await User.findById(uid);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isValidPassword = await bcrypt.compare(current_password, user.password_hash);
    if (!isValidPassword) return res.status(400).json({ error: 'Current password is incorrect' });

    const newPasswordHash = await bcrypt.hash(new_password, 10);
    await User.updateById(uid, { password_hash: newPasswordHash });

    await Audit.create({
      user_id: uid,
      action: 'change_password',
      resource: 'User',
      resource_id: user.id,
      details: { password_changed: true }
    });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Get user profile by ID
router.get('/:id', authenticate, requireRole(['super_admin', 'executive']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    delete user.password_hash;
    res.json(user);
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Update user profile by ID
router.put('/:id', authenticate, requireRole(['super_admin', 'executive']), async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password_hash;
    
    if ((updates.role === 'super_admin' || updates.role === 'executive') && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only the super admin can create or promote admins/executives.' });
    }
    
    if (updates.role === 'super_admin') {
      const existingSuperAdminList = await User.find({ role: 'super_admin' });
      const existingSuperAdmin = existingSuperAdminList.length > 0 ? existingSuperAdminList[0] : null;
      if (existingSuperAdmin && existingSuperAdmin.id !== req.params.id) {
        return res.status(400).json({ error: 'A super admin already exists.' });
      }
    }
    
    const user = await User.updateById(req.params.id, updates);
    if (!user) return res.status(404).json({ error: 'User not found' });
    delete user.password_hash;

    await Audit.create({
      user_id: req.user._id || req.user.id,
      action: 'update_user',
      resource: 'User',
      resource_id: user.id,
      details: updates
    });
    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create user (admin only)
router.post('/', authenticate, requireRole(['super_admin', 'executive']), async (req, res) => {
  try {
    const { role, password, email, first_name, last_name, phone, school_name } = req.body;
    
    if (!email || !password || !first_name || !last_name || !role) {
      return res.status(400).json({ error: 'Email, password, first name, last name, and role are required.' });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) return res.status(400).json({ error: 'Email already registered.' });

    if ((role === 'super_admin' || role === 'executive') && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only the super admin can create admins/executives.' });
    }
    
    if (role === 'super_admin') {
      const existingSuperAdminList = await User.find({ role: 'super_admin' });
      if (existingSuperAdminList.length > 0) {
        return res.status(400).json({ error: 'A super admin already exists.' });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    const newUser = await User.create({
      email,
      password_hash: passwordHash,
      first_name,
      last_name,
      phone,
      school_name,
      role,
      is_verified: true,
      is_approved: true
    });

    await Audit.create({
      user_id: req.user._id || req.user.id,
      action: 'create_user',
      resource: 'User',
      resource_id: newUser.id,
      details: { email, role, first_name, last_name }
    });

    const userResponse = { ...newUser };
    delete userResponse.password_hash;
    res.status(201).json({ message: 'User created successfully', user: userResponse });
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user by ID
router.delete('/:id', authenticate, requireRole(['super_admin', 'executive']), async (req, res) => {
  try {
    const user = await User.deleteById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete own account
router.post('/:id/delete', authenticate, async (req, res) => {
  try {
    if ((req.user._id || req.user.id) !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
    const { password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: 'Incorrect password' });
    
    await User.deleteById(req.params.id);
    res.json({ message: 'Account deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete account.' });
  }
});

// 2FA: Send verification code to email
router.post('/:id/2fa/send-code', authenticate, async (req, res) => {
  try {
    if ((req.user._id || req.user.id) !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    
    await User.updateById(user.id, { two_fa_code: code, two_fa_code_expires: expires });
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: 'Your 2FA Verification Code',
      text: `Your verification code is: ${code}`,
    });
    res.json({ message: 'Verification code sent.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send code.' });
  }
});

// 2FA: Verify code and enable 2FA
router.post('/:id/2fa/verify', authenticate, async (req, res) => {
  try {
    if ((req.user._id || req.user.id) !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
    const { code } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if (!user.two_fa_code || !user.two_fa_code_expires || new Date(user.two_fa_code_expires) < new Date()) {
      return res.status(400).json({ error: 'Code expired or not sent.' });
    }
    if (user.two_fa_code !== code) {
      return res.status(400).json({ error: 'Invalid code.' });
    }
    
    const updatedUser = await User.updateById(user.id, { 
      two_fa_enabled: true, 
      two_fa_code: null, 
      two_fa_code_expires: null 
    });
    delete updatedUser.password_hash;
    res.json({ message: '2FA enabled.', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify code.' });
  }
});

// 2FA: Disable 2FA
router.post('/:id/2fa/disable', authenticate, async (req, res) => {
  try {
    if ((req.user._id || req.user.id) !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const updatedUser = await User.updateById(user.id, { 
      two_fa_enabled: false, 
      two_fa_code: null, 
      two_fa_code_expires: null 
    });
    delete updatedUser.password_hash;
    res.json({ message: '2FA disabled.', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Failed to disable 2FA.' });
  }
});

// List all sessions
router.get('/:id/sessions', authenticate, async (req, res) => {
  try {
    if ((req.user._id || req.user.id) !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
    const { queryMany } = require('../database/postgres');
    const sessions = await queryMany('SELECT id, token, created_at, user_agent, ip FROM user_sessions WHERE user_id = $1', [req.params.id]);
    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions.' });
  }
});

// Revoke a session
router.delete('/:id/sessions/:token', authenticate, async (req, res) => {
  try {
    if ((req.user._id || req.user.id) !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
    const { queryOne, queryMany } = require('../database/postgres');
    await queryOne('DELETE FROM user_sessions WHERE token = $1 AND user_id = $2', [req.params.token, req.params.id]);
    const sessions = await queryMany('SELECT id, token, created_at, user_agent, ip FROM user_sessions WHERE user_id = $1', [req.params.id]);
    res.json({ message: 'Session revoked.', sessions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to revoke session.' });
  }
});

// Export user data
router.get('/:id/export', authenticate, async (req, res) => {
  try {
    if ((req.user._id || req.user.id) !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    delete user.password_hash;
    res.setHeader('Content-Disposition', 'attachment; filename="hso-profile-export.json"');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ profile: user }, null, 2));
  } catch (error) {
    res.status(500).json({ error: 'Failed to export data.' });
  }
});

// Link social account
router.post('/:id/connect/:provider', authenticate, async (req, res) => {
  try {
    if ((req.user._id || req.user.id) !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
    const { provider } = req.params;
    let user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    let updates = {};
    if (provider === 'google') updates.google_id = 'mock-google-id';
    if (provider === 'facebook') updates.facebook_id = 'mock-facebook-id';
    if (provider === 'twitter') updates.twitter_id = 'mock-twitter-id';
    
    user = await User.updateById(user.id, updates);
    delete user.password_hash;
    res.json({ message: `${provider} account connected.`, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to connect account.' });
  }
});

// Unlink social account
router.post('/:id/disconnect/:provider', authenticate, async (req, res) => {
  try {
    if ((req.user._id || req.user.id) !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
    const { provider } = req.params;
    let user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    let updates = {};
    if (provider === 'google') updates.google_id = null;
    if (provider === 'facebook') updates.facebook_id = null;
    if (provider === 'twitter') updates.twitter_id = null;
    
    user = await User.updateById(user.id, updates);
    delete user.password_hash;
    res.json({ message: `${provider} account disconnected.`, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to disconnect account.' });
  }
});

// Reset password
router.post('/:id/reset-password', authenticate, requireRole(['super_admin', 'executive']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    
    await User.updateById(user.id, { password_hash: passwordHash });
    
    await Audit.create({
      user_id: req.user._id || req.user.id,
      action: 'reset_password',
      resource: 'User',
      resource_id: user.id,
      details: { email: user.email }
    });
    
    res.json({ 
      message: 'Password reset successfully.',
      tempPassword: tempPassword
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// Update security settings
router.put('/security-settings', authenticate, async (req, res) => {
  try {
    const uid = req.user._id || req.user.id;
    const { two_factor_enabled, email_notifications, login_notifications, session_timeout } = req.body;
    
    const user = await User.findById(uid);
    let prefs = user.preferences || {};
    prefs.email_notifications = email_notifications;
    prefs.login_notifications = login_notifications;
    prefs.session_timeout = session_timeout;

    const updatedUser = await User.updateById(uid, {
      two_fa_enabled: two_factor_enabled,
      preferences: prefs
    });

    if (!updatedUser) return res.status(404).json({ error: 'User not found' });

    delete updatedUser.password_hash;
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update security settings' });
  }
});

// Update preferences
router.put('/preferences', authenticate, async (req, res) => {
  try {
    const uid = req.user._id || req.user.id;
    const { theme, language, timezone, date_format, time_format, dashboard_layout, notifications } = req.body;

    const updatedUser = await User.updateById(uid, {
      preferences: { theme, language, timezone, date_format, time_format, dashboard_layout, notifications }
    });

    if (!updatedUser) return res.status(404).json({ error: 'User not found' });

    delete updatedUser.password_hash;
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Get user activity
router.get('/activity', authenticate, async (req, res) => {
  try {
    const uid = req.user._id || req.user.id;
    const activities = await Audit.find({ user_id: uid }, { sort: { created_at: -1 }, limit: 20 });
    res.json({ activities });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// Approve user
router.patch('/:id/approve', authenticate, requireRole(['super_admin','executive']), async (req, res) => {
  try {
    const user = await User.updateById(req.params.id, { is_approved: true });
    if (!user) return res.status(404).json({ error: 'User not found' });

    delete user.password_hash;
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve user' });
  }
});

// Verify user
router.patch('/:id/verify', authenticate, requireRole(['super_admin','executive']), async (req, res) => {
  try {
    const user = await User.updateById(req.params.id, { is_verified: true });
    if (!user) return res.status(404).json({ error: 'User not found' });

    delete user.password_hash;
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify user' });
  }
});

// Promote user
router.patch('/:id/promote', authenticate, requireRole(['super_admin']), async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !['executive', 'school_rep', 'public'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.updateById(req.params.id, { role });
    if (!user) return res.status(404).json({ error: 'User not found' });

    delete user.password_hash;
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to promote user' });
  }
});

// Get user statistics
router.get('/stats/overview', authenticate, requireRole(['super_admin','executive']), async (req, res) => {
  try {
    const totalUsers = await User.count({});
    const activeUsers = await User.count({ is_approved: true });
    const verifiedUsers = await User.count({ is_verified: true });
    const pendingApproval = await User.count({ is_approved: false });
    
    res.json({ totalUsers, activeUsers, verifiedUsers, pendingApproval });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

module.exports = router;