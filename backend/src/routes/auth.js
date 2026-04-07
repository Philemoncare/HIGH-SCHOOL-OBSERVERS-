const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const Settings = require('../models/Settings');
const { generateToken } = require('../middleware/auth');
const { normalizeEmail, findUserByEmail } = require('../utils/authUtils');

const router = express.Router();

/** Returns true if DB is reachable (ping PostgreSQL). */
async function isDbReachable() {
  try {
    const { queryOne } = require('../database/postgres');
    await queryOne('SELECT 1');
    return true;
  } catch (_) {
    return false;
  }
}

router.post('/register', async (req, res) => {
  try {
    // Check platform settings: allow registrations (real-time)
    const platformSettings = await Settings.findOne({ key: 'platform' }).lean();
    const allowRegistrations = platformSettings?.allowRegistrations !== false;
    if (!allowRegistrations) {
      return res.status(503).json({ error: 'Registration is currently disabled. Please try again later or contact support.' });
    }

    // Log database connection info
    const dbName = mongoose.connection.db?.databaseName;
    console.log('=== REGISTRATION REQUEST ===');
    console.log('Database:', dbName);
    console.log('Connection state:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected');
    console.log('Request body:', { body: req.body });
    
    const { email, password, firstName, lastName } = req.body;
    
    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      console.log('Validation failed - missing fields:', { email: !!email, password: !!password, firstName: !!firstName, lastName: !!lastName });
      return res.status(400).json({ error: 'Email, password, first name, and last name are required' });
    }

    // Normalize email
    const normalizedEmail = normalizeEmail(email);
    console.log('Original email:', email);
    console.log('Normalized email:', normalizedEmail);

    // Validate password length
    if (password.length < 6) {
      console.log('Validation failed - password too short');
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if email already exists
    console.log('Checking for existing user...');
    let existingUser = await findUserByEmail(email);
    console.log('User lookup result:', existingUser ? 'Found' : 'Not found');
    
    if (existingUser) {
      console.log('⚠️  Registration failed - email already exists');
      console.log('Existing user details:', { 
        id: existingUser._id, 
        email: existingUser.email,
        normalized_existing: existingUser.email?.toLowerCase().trim(),
        normalized_new: normalizedEmail,
        match: existingUser.email?.toLowerCase().trim() === normalizedEmail,
        first_name: existingUser.first_name,
        last_name: existingUser.last_name,
        has_password: !!existingUser.password_hash,
        role: existingUser.role,
        created_at: existingUser.created_at
      });
      
      // If user exists but has no password, allow re-registration by updating
      if (!existingUser.password_hash) {
        console.log('User exists but has no password - updating user instead of creating new one');
        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);
        
        // Update existing user
        existingUser.password_hash = passwordHash;
        existingUser.first_name = firstName.trim();
        existingUser.last_name = lastName.trim();
        existingUser.email = normalizedEmail; // Ensure normalized email
        await existingUser.save();
        
        console.log('✅ User updated successfully with password');
        
        const userResponse = existingUser.toObject();
        delete userResponse.password_hash;
        
        return res.status(200).json({ 
          success: true, 
          message: 'Registration successful! Your account has been updated. Please login to continue.',
          user: userResponse 
        });
      }
      
      return res.status(400).json({ error: 'Email already registered. Please use a different email or try logging in.' });
    }
    
    console.log('✅ Email check passed - no existing user found');

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    // Create new user (use normalized email)
    const newUser = new User({
      email: normalizedEmail,
      password_hash: passwordHash,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      role: 'user', // Default role for new registrations
      is_verified: false, // Users need to verify their email
      is_approved: false // Users need admin approval (if required)
    });

    console.log('Attempting to save user:', { email: normalizedEmail, first_name: firstName.trim(), last_name: lastName.trim() });
    console.log('Database before save:', dbName);
    
    await newUser.save();
    console.log('✅ User saved successfully with ID:', newUser._id);
    
    // Verify the user was actually saved
    const verifyUser = await User.findById(newUser._id);
    if (!verifyUser) {
      console.error('❌ CRITICAL: User was not saved to database!');
      return res.status(500).json({ error: 'Failed to save user. Please try again.' });
    }
    console.log('✅ Verified: User exists in database');

    // Return user without password
    const userResponse = newUser.toObject();
    delete userResponse.password_hash;

    return res.status(201).json({ 
      success: true, 
      message: 'Registration successful! Please login to continue.',
      user: userResponse 
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack
    });
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    return res.status(500).json({ error: error.message || 'Server error during registration' });
  }
});

router.post('/login', async (req, res) => {
  try {
    // Log database connection info
    const dbName = mongoose.connection.db?.databaseName;
    console.log('=== LOGIN REQUEST ===');
    console.log('Database:', dbName);
    console.log('Connection state:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected');

    const dbOk = await isDbReachable();
    if (!dbOk) {
      console.warn('⚠️ Login blocked - database not reachable');
      return res.status(503).json({ error: 'Database not connected. Start MongoDB and try again.' });
    }

    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      console.log('Login failed - missing credentials');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Normalize email
    const normalizedEmail = normalizeEmail(email);
    console.log('Login attempt for email:', normalizedEmail);
    
    // Find user
    let user = await findUserByEmail(email);
    console.log('User lookup result:', user ? 'Found' : 'Not found');
    
    if (!user) {
      console.log('❌ Login failed - user not found');
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    console.log('User found:', { 
      id: user._id, 
      email: user.email,
      has_password: !!user.password_hash,
      role: user.role
    });
    
    if (!user.password_hash) {
      console.log('❌ Login failed - user has no password');
      return res.status(401).json({ error: 'Account not properly set up. Please register again.' });
    }

    // Verify password
    console.log('Verifying password...');
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      console.log('❌ Login failed - invalid password');
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    console.log('✅ Password verified successfully');

    if (user.twoFAEnabled || user.two_fa_enabled) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await User.updateById(user.id || user._id, {
        two_fa_code: code,
        two_fa_code_expires: new Date(Date.now() + 10 * 60 * 1000)
      });
      return res.json({ requires2FA: true, email: user.email });
    }

    const userId = user.id || user._id;
    const token = generateToken({ id: userId, role: user.role });
    const safeUser = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete safeUser.password_hash;
    
    console.log('✅ Login successful for user:', user.email);
    return res.json({ success: true, message: 'Login successful', token, user: safeUser });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      name: error.name
    });
    return res.status(500).json({ error: 'Server error during login. Please try again.' });
  }
});

router.post('/admin-login', async (req, res) => {
  try {
    // Log database connection info
    const dbName = mongoose.connection.db?.databaseName;
    console.log('=== ADMIN LOGIN REQUEST ===');
    console.log('Database:', dbName);
    console.log('Connection state:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected');

    const dbOk = await isDbReachable();
    if (!dbOk) {
      console.warn('⚠️ Admin login blocked - database not reachable');
      return res.status(503).json({ error: 'Database not connected. Start MongoDB and try again.' });
    }

    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      console.log('Admin login failed - missing credentials');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Normalize email
    const normalizedEmail = normalizeEmail(email);
    console.log('Admin login attempt for email:', normalizedEmail);

    // Find user
    let user = await findUserByEmail(email);
    console.log('User lookup result:', user ? 'Found' : 'Not found');

    if (!user || !user.password_hash) {
      console.log('❌ Admin login failed - user not found or no password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('User found:', {
      id: user._id,
      email: user.email,
      role: user.role,
      has_password: !!user.password_hash
    });

    // Check if user has admin role
    if (!['executive', 'admin', 'super_admin'].includes(user.role)) {
      console.log('❌ Admin login failed - insufficient role:', user.role);
      return res.status(403).json({ error: 'Not authorized for admin access' });
    }

    // Verify password
    console.log('Verifying password...');
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      console.log('❌ Admin login failed - invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ Password verified successfully');

    // Handle 2FA if enabled
    if (user.twoFAEnabled || user.two_fa_enabled) {
      console.log('2FA enabled, generating code...');
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await User.updateById(user.id || user._id, {
        two_fa_code: code,
        two_fa_code_expires: new Date(Date.now() + 10 * 60 * 1000)
      });
      console.log('✅ 2FA code generated');
      return res.json({ requires2FA: true, email: user.email });
    }

    // Generate token and return success
    const userId = user.id || user._id;
    const token = generateToken({ id: userId, role: user.role });
    const safeUser = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete safeUser.password_hash;

    console.log('✅ Admin login successful for user:', user.email);
    return res.json({ success: true, message: 'Admin login successful', token, user: safeUser });
  } catch (error) {
    console.error('Admin login error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack
    });
    return res.status(500).json({ 
      error: 'Server error during admin login. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/verify-2fa', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email and code required' });
    const user = await findUserByEmail(email);
    if (!user || !user.twoFACode || !user.twoFACodeExpires) {
      return res.status(400).json({ error: '2FA not initiated' });
    }
    if (user.twoFACodeExpires < new Date() || user.twoFACode !== code) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }
    user.twoFACode = undefined;
    user.twoFACodeExpires = undefined;
    await user.save();

    const token = generateToken({ id: user._id, role: user.role });
    const safeUser = user.toObject();
    delete safeUser.password_hash;
    return res.json({ success: true, token, user: safeUser });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/resend-2fa', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.twoFACode = code;
    user.twoFACodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Google Sign-In: verify ID token, find or create user, return JWT + user
router.post('/google', async (req, res) => {
  try {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId || googleClientId === 'your-google-client-id.apps.googleusercontent.com') {
      return res.status(503).json({ error: 'Google login is not configured yet' });
    }

    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(googleClientId);
    const ticket = await client.verifyIdToken({ idToken: credential, audience: googleClientId });
    const payload = ticket.getPayload();
    const email = (payload.email || '').toLowerCase().trim();
    const googleId = payload.sub;
    const firstName = payload.given_name || payload.name || 'User';
    const lastName = payload.family_name || '';
    const profileImage = payload.picture || null;

    if (!email) {
      return res.status(400).json({ error: 'Google account did not provide an email' });
    }

    const normalizedEmail = normalizeEmail(email);
    let user = await User.findOne({ $or: [{ googleId }, { email: normalizedEmail }] });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.provider = 'google';
        if (profileImage) user.profile_image = profileImage;
        user.first_name = user.first_name || firstName;
        user.last_name = user.last_name || lastName;
        await user.save();
      }
    } else {
      user = new User({
        email: normalizedEmail,
        first_name: firstName,
        last_name: lastName || ' ',
        googleId,
        provider: 'google',
        profile_image: profileImage,
        role: 'user',
        is_verified: true,
        is_approved: true
      });
      await user.save();
    }

    const token = generateToken({ id: user._id, role: user.role });
    const safeUser = user.toObject();
    delete safeUser.password_hash;
    return res.json({ success: true, message: 'Login successful', token, user: safeUser });
  } catch (error) {
    console.error('Google login error:', error);
    const msg = error.message || 'Google login failed';
    return res.status(500).json({ error: msg });
  }
});

// Forgot password - send reset email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await findUserByEmail(email);
    // Don't reveal if user exists or not for security
    if (!user) {
      return res.json({ success: true, message: 'If an account exists with this email, a password reset link has been sent.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token to PasswordReset model
    const PasswordReset = require('../models/PasswordReset');
    await PasswordReset.create({
      email: user.email,
      token: resetToken,
      expiresAt: expiresAt,
      used: false
    });

    // Send reset email
    const emailService = require('../services/emailService');
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    try {
      await emailService.sendPasswordResetEmail(
        user.email,
        user.first_name || 'User',
        resetLink
      );
      return res.json({ success: true, message: 'Password reset instructions sent to your email' });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Still return success to not reveal if email exists
      return res.json({ success: true, message: 'If an account exists with this email, a password reset link has been sent.' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, new_password, password } = req.body;
    const newPassword = new_password || password;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const PasswordReset = require('../models/PasswordReset');
    const resetRecord = await PasswordReset.findOne({ 
      token, 
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!resetRecord) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Find user and update password (use findUserByEmail for consistent lookup)
    const user = await findUserByEmail(resetRecord.email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(user._id, { password_hash: passwordHash });

    // Mark token as used
    resetRecord.used = true;
    await resetRecord.save();

    // Send confirmation email
    const emailService = require('../services/emailService');
    try {
      await emailService.sendPasswordResetConfirmation(
        user.email,
        user.first_name || 'User'
      );
    } catch (emailError) {
      console.error('Confirmation email error:', emailError);
      // Don't fail the request if email fails
    }

    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;


