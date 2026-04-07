const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const Audit = require('../models/Audit');
const Settings = require('../models/Settings');

const DEFAULT_SETTINGS = {
  allowRegistrations: true,
  maintenanceMode: false,
  supportEmail: 'support@hso.com'
};

// GET /api/admin/dashboard - Admin dashboard
router.get('/dashboard', authenticate, requireRole(['super_admin', 'executive']), async (req, res) => {
  try {
    res.json({ success: true, message: 'Admin dashboard coming soon!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get admin dashboard' });
  }
});

// GET /api/admin/metrics - Placeholder for metrics
router.get('/metrics', authenticate, requireRole(['super_admin', 'executive']), async (req, res) => {
  try {
    res.json({ users: 0, events: 0, sales: 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

// GET /api/admin/analytics - Placeholder for analytics
router.get('/analytics', authenticate, requireRole(['super_admin', 'executive']), async (req, res) => {
  try {
    res.json({ data: [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// GET /api/admin/audit-logs - List audit logs
router.get('/audit-logs', authenticate, requireRole(['super_admin', 'executive']), async (req, res) => {
  try {
    // In the future, add pagination, search, filter
    const logs = await Audit.find({}).sort({ created_at: -1 }).limit(100);
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get audit logs' });
  }
});

// GET /api/admin/reports/audit-logs - Download audit logs as CSV
router.get('/reports/audit-logs', authenticate, requireRole(['super_admin', 'executive']), async (req, res) => {
  try {
    const logs = await Audit.find({}).sort({ created_at: -1 });
    
    // Generate CSV content
    const headers = ['ID', 'Action', 'Type', 'Details', 'Timestamp'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        log._id || '',
        `"${log.action || ''}"`,
        `"${log.resource || ''}"`,
        `"${JSON.stringify(log.details || {}).replace(/"/g, '""')}"`,
        `"${new Date(log.created_at).toISOString()}"`
      ].join(','))
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="audit_logs.csv"');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate audit logs report' });
  }
});

// GET /api/admin/reports/user-list - Download user list as CSV
router.get('/reports/user-list', authenticate, requireRole(['super_admin', 'executive']), async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.find({}).sort({ created_at: -1 });
    
    // Generate CSV content
    const headers = ['ID', 'Username', 'Email', 'Role', 'Created At', 'Last Login'];
    const csvContent = [
      headers.join(','),
      ...users.map(user => [
        user._id || '',
        `"${user.username || ''}"`,
        `"${user.email || ''}"`,
        `"${user.role || 'user'}"`,
        `"${new Date(user.created_at).toISOString()}"`,
        `"${user.last_login ? new Date(user.last_login).toISOString() : 'Never'}"`
      ].join(','))
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="user_list.csv"');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate user list report' });
  }
});

// GET /api/admin/settings - Get platform settings (real-time from DB)
router.get('/settings', authenticate, requireRole(['super_admin', 'executive', 'admin']), async (req, res) => {
  try {
    const doc = await Settings.findOne({ key: 'platform' }).lean();
    const settings = doc
      ? {
          allowRegistrations: doc.allowRegistrations ?? DEFAULT_SETTINGS.allowRegistrations,
          maintenanceMode: doc.maintenanceMode ?? DEFAULT_SETTINGS.maintenanceMode,
          supportEmail: doc.supportEmail ?? DEFAULT_SETTINGS.supportEmail,
          updated_at: doc.updated_at
        }
      : DEFAULT_SETTINGS;
    res.json(settings);
  } catch (error) {
    console.error('GET /api/admin/settings error:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

// PUT /api/admin/settings - Update platform settings (persist to DB, real-time)
router.put('/settings', authenticate, requireRole(['super_admin', 'executive', 'admin']), async (req, res) => {
  try {
    const { allowRegistrations, maintenanceMode, supportEmail } = req.body;
    const payload = {
      allowRegistrations: typeof allowRegistrations === 'boolean' ? allowRegistrations : DEFAULT_SETTINGS.allowRegistrations,
      maintenanceMode: typeof maintenanceMode === 'boolean' ? maintenanceMode : DEFAULT_SETTINGS.maintenanceMode,
      supportEmail: typeof supportEmail === 'string' && supportEmail.trim() ? supportEmail.trim() : DEFAULT_SETTINGS.supportEmail
    };
    const doc = await Settings.findOneAndUpdate(
      { key: 'platform' },
      { $set: payload },
      { new: true, upsert: true, runValidators: true }
    ).lean();
    const settings = {
      allowRegistrations: doc.allowRegistrations,
      maintenanceMode: doc.maintenanceMode,
      supportEmail: doc.supportEmail,
      updated_at: doc.updated_at
    };
    res.json(settings);
  } catch (error) {
    console.error('PUT /api/admin/settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router; 