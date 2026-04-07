const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const Audit = require('../models/Audit');
const DonationCampaign = require('../models/DonationCampaign');
const { queryOne, queryMany } = require('../database/postgres');
const router = express.Router();

// Get all donation campaigns (admin/executive only)
router.get('/', authenticate, requireRole(['super_admin','executive']), async (req, res) => {
  try {
    const { search, status, category, page = 1, limit = 10 } = req.query;
    
    let whereClauses = [];
    let params = [];
    let paramIndex = 1;

    if (search) {
      whereClauses.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR beneficiary ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    if (status && status !== 'all') {
      whereClauses.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }
    
    if (category && category !== 'all') {
      whereClauses.push(`category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }
    
    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const skip = (page - 1) * limit;
    
    // Count total
    const { count } = await queryOne(`SELECT COUNT(*) FROM donation_campaigns ${whereStr}`, params);
    const total = parseInt(count);

    // Get items with populated creator
    const campaignsQuery = `
      SELECT d.*, 
        json_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name, 'email', u.email) as created_by_obj
      FROM donation_campaigns d
      LEFT JOIN users u ON d.created_by = u.id
      ${whereStr}
      ORDER BY d.created_at DESC
      OFFSET $${paramIndex} LIMIT $${paramIndex + 1}
    `;
    const campaignsRaw = await queryMany(campaignsQuery, [...params, skip, limit]);

    const campaigns = campaignsRaw.map(c => ({
      ...DonationCampaign.transformCampaign(c),
      created_by: c.created_by_obj?.id ? c.created_by_obj : c.created_by
    }));
    
    res.json({
      campaigns,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Error fetching donation campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch donation campaigns' });
  }
});

// Get public donation campaigns (for users page)
router.get('/public', async (req, res) => {
  try {
    const { search, category, page = 1, limit = 12 } = req.query;
    
    let whereClauses = ["status = 'active'"];
    let params = [];
    let paramIndex = 1;

    if (search) {
      whereClauses.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR beneficiary ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    if (category && category !== 'all') {
      whereClauses.push(`category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }
    
    const whereStr = `WHERE ${whereClauses.join(' AND ')}`;
    const skip = (page - 1) * limit;
    
    const { count } = await queryOne(`SELECT COUNT(*) FROM donation_campaigns ${whereStr}`, params);
    const total = parseInt(count);
    
    const campaignsQuery = `
      SELECT d.*, 
        json_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name, 'email', u.email) as created_by_obj
      FROM donation_campaigns d
      LEFT JOIN users u ON d.created_by = u.id
      ${whereStr}
      ORDER BY d.featured DESC, d.created_at DESC
      OFFSET $${paramIndex} LIMIT $${paramIndex + 1}
    `;
    const campaignsRaw = await queryMany(campaignsQuery, [...params, skip, limit]);

    const campaigns = campaignsRaw.map(c => ({
      ...DonationCampaign.transformCampaign(c),
      created_by: c.created_by_obj?.id ? c.created_by_obj : c.created_by
    }));
    
    res.json({
      campaigns,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Error fetching public donation campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch donation campaigns' });
  }
});

// Get donation campaign by ID
router.get('/:id', authenticate, requireRole(['super_admin','executive']), async (req, res) => {
  try {
    const c = await queryOne(`
      SELECT d.*, 
        json_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name, 'email', u.email) as created_by_obj
      FROM donation_campaigns d
      LEFT JOIN users u ON d.created_by = u.id
      WHERE d.id = $1
    `, [req.params.id]);
    
    if (!c) {
      return res.status(404).json({ error: 'Donation campaign not found' });
    }
    
    res.json({
      ...DonationCampaign.transformCampaign(c),
      created_by: c.created_by_obj?.id ? c.created_by_obj : c.created_by
    });
  } catch (error) {
    console.error('Error fetching donation campaign:', error);
    res.status(500).json({ error: 'Failed to fetch donation campaign' });
  }
});

// Create donation campaign
router.post('/', authenticate, requireRole(['super_admin','executive']), async (req, res) => {
  try {
    const { title, description, image, goal_amount, beneficiary, category, status, featured, urgent, start_date, end_date } = req.body;

    const imageValue = (typeof image === 'string' && image.length > 0) ? (image.startsWith('data:') ? image : image.trim()) : (image || null);
    const goalAmountNum = Number(goal_amount);
    if (!Number.isFinite(goalAmountNum) || goalAmountNum <= 0) {
      return res.status(400).json({ error: 'Goal amount must be a positive number' });
    }

    const startDateVal = (start_date && start_date !== '') ? new Date(start_date) : undefined;
    const endDateVal = (end_date && end_date !== '') ? new Date(end_date) : undefined;

    const campaign = await DonationCampaign.create({
      title: title && String(title).trim(),
      description: description && String(description).trim(),
      image: imageValue,
      goal_amount: goalAmountNum,
      beneficiary: beneficiary && String(beneficiary).trim(),
      category: category || 'other',
      status: status || 'active',
      featured: !!featured,
      urgent: !!urgent,
      start_date: startDateVal,
      end_date: endDateVal,
      created_by: req.user._id || req.user.id
    });
    
    await Audit.create({
      user_id: req.user._id || req.user.id,
      action: 'create_donation_campaign',
      resource: 'DonationCampaign',
      resource_id: campaign.id,
      details: { title: campaign.title, goal_amount: campaign.goal_amount, beneficiary: campaign.beneficiary }
    });
    
    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating donation campaign:', error);
    res.status(500).json({ error: 'Failed to create donation campaign' });
  }
});

// Update donation campaign
router.put('/:id', authenticate, requireRole(['super_admin','executive']), async (req, res) => {
  try {
    const allowed = ['title', 'description', 'image', 'goal_amount', 'beneficiary', 'category', 'status', 'featured', 'urgent', 'start_date', 'end_date'];
    const updateData = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'image') {
          const v = req.body[field];
          updateData[field] = (typeof v === 'string' && v.length > 0) ? (v.startsWith('data:') ? v : v.trim()) : (v || null);
        } else {
          updateData[field] = req.body[field];
        }
      }
    });

    if (updateData.goal_amount !== undefined) {
      const n = Number(updateData.goal_amount);
      if (!Number.isFinite(n) || n <= 0) return res.status(400).json({ error: 'Goal amount must be a positive number' });
      updateData.goal_amount = n;
    }

    const updated = await DonationCampaign.updateById(req.params.id, updateData);
    if (!updated) return res.status(404).json({ error: 'Donation campaign not found' });
    
    await Audit.create({
      user_id: req.user._id || req.user.id,
      action: 'update_donation_campaign',
      resource: 'DonationCampaign',
      resource_id: updated.id,
      details: req.body
    });
    
    res.json(updated);
  } catch (error) {
    console.error('Error updating donation campaign:', error);
    res.status(500).json({ error: 'Failed to update donation campaign' });
  }
});

// Delete donation campaign
router.delete('/:id', authenticate, requireRole(['super_admin','executive']), async (req, res) => {
  try {
    const campaign = await DonationCampaign.deleteById(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Donation campaign not found' });
    
    await Audit.create({
      user_id: req.user._id || req.user.id,
      action: 'delete_donation_campaign',
      resource: 'DonationCampaign',
      resource_id: req.params.id,
      details: { title: campaign.title }
    });
    
    res.json({ message: 'Donation campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting donation campaign:', error);
    res.status(500).json({ error: 'Failed to delete donation campaign' });
  }
});

// Toggle campaign status
router.patch('/:id/toggle-status', authenticate, requireRole(['super_admin','executive']), async (req, res) => {
  try {
    const campaign = await DonationCampaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Donation campaign not found' });
    
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    const updated = await DonationCampaign.updateById(req.params.id, { status: newStatus });
    
    await Audit.create({
      user_id: req.user._id || req.user.id,
      action: 'toggle_campaign_status',
      resource: 'DonationCampaign',
      resource_id: campaign.id,
      details: { status: newStatus }
    });
    
    res.json(updated);
  } catch (error) {
    console.error('Error toggling campaign status:', error);
    res.status(500).json({ error: 'Failed to toggle campaign status' });
  }
});

// Toggle featured status
router.patch('/:id/toggle-featured', authenticate, requireRole(['super_admin','executive']), async (req, res) => {
  try {
    const campaign = await DonationCampaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Donation campaign not found' });
    
    const updated = await DonationCampaign.updateById(req.params.id, { featured: !campaign.featured });
    
    await Audit.create({
      user_id: req.user._id || req.user.id,
      action: 'toggle_campaign_featured',
      resource: 'DonationCampaign',
      resource_id: campaign.id,
      details: { featured: updated.featured }
    });
    
    res.json(updated);
  } catch (error) {
    console.error('Error toggling featured status:', error);
    res.status(500).json({ error: 'Failed to toggle featured status' });
  }
});

// Get donation campaigns statistics
router.get('/stats/overview', authenticate, requireRole(['super_admin','executive']), async (req, res) => {
  try {
    const { count: totalCampaignsStr } = await queryOne('SELECT COUNT(*) FROM donation_campaigns');
    const { count: activeCampaignsStr } = await queryOne(`SELECT COUNT(*) FROM donation_campaigns WHERE status = 'active'`);
    
    const totalCampaigns = parseInt(totalCampaignsStr);
    const activeCampaigns = parseInt(activeCampaignsStr);

    const stats = await queryOne('SELECT SUM(raised_amount) as r, SUM(goal_amount) as g FROM donation_campaigns');
    
    res.json({
      totalCampaigns,
      activeCampaigns,
      totalRaised: parseFloat(stats.r || 0),
      totalGoal: parseFloat(stats.g || 0)
    });
  } catch (error) {
    console.error('Error fetching donation campaigns stats:', error);
    res.status(500).json({ error: 'Failed to fetch donation campaigns statistics' });
  }
});

// Process donation payment
router.post('/:id/donate', async (req, res) => {
  try {
    const { amount, donorName, donorEmail, donorPhone, message, anonymous } = req.body;
    const campaignId = req.params.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid donation amount is required' });
    }

    const campaign = await DonationCampaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    if (campaign.status !== 'active') return res.status(400).json({ error: 'Campaign is not active' });

    const updated = await DonationCampaign.updateRaisedAmount(campaignId, parseFloat(amount));

    res.json({ 
      message: 'Donation processed successfully',
      newRaisedAmount: updated.raised_amount,
      donation: { amount, donorName: anonymous ? 'Anonymous' : donorName, donorEmail, donorPhone, message, anonymous }
    });
  } catch (error) {
    console.error('Donation processing error:', error);
    res.status(500).json({ error: 'Failed to process donation' });
  }
});

module.exports = router;