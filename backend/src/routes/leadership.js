const express = require('express');
const router = express.Router();
const Leadership = require('../models/Leadership');
const { authenticate, requireRole } = require('../middleware/auth');

// Get all leadership members (public)
router.get('/', async (req, res) => {
  try {
    const leadership = await Leadership.find({ is_active: true }, { sort: { order: 1 } });
    res.json(leadership);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leadership team', error: error.message });
  }
});

// Get all leadership members (admin only)
router.get('/admin', authenticate, requireRole(['executive','admin','super_admin']), async (req, res) => {
  try {
    const leadership = await Leadership.find({}, { sort: { order: 1 } });
    res.json(leadership);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leadership team', error: error.message });
  }
});

// Get single leadership member by slug (public) – must be before /:id
router.get('/by-slug/:slug', async (req, res) => {
  try {
    const leadership = await Leadership.findOne({ slug: req.params.slug, is_active: true });
    if (!leadership) {
      return res.status(404).json({ message: 'Leadership member not found' });
    }
    res.json(leadership);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leadership member', error: error.message });
  }
});

// Get single leadership member by id (public)
router.get('/:id', async (req, res) => {
  try {
    const leadership = await Leadership.findById(req.params.id);
    if (!leadership) {
      return res.status(404).json({ message: 'Leadership member not found' });
    }
    res.json(leadership);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leadership member', error: error.message });
  }
});

// Create new leadership member (admin only) – unique by name+title
router.post('/', authenticate, requireRole(['executive','admin','super_admin']), async (req, res) => {
  try {
    const {
      name, title, slug, email, bio, image, avatar_emoji, social_links, order, is_featured,
      department, location, start_year, highlights, focus_areas, calendly_link
    } = req.body;
    if (!name || !title || !bio) {
      return res.status(400).json({ message: 'Name, title, and bio are required', error: 'Validation failed' });
    }
    const nameTrim = String(name).trim();
    const titleTrim = String(title).trim();
    const existing = await Leadership.findOne({ name: nameTrim, title: titleTrim });
    if (existing) {
      return res.status(409).json({ message: 'A leadership member with this name and title already exists', error: 'Duplicate entry' });
    }
    const slugVal = slug ? String(slug).trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : undefined;
    if (slugVal) {
      const slugExists = await Leadership.findOne({ slug: slugVal });
      if (slugExists) {
        return res.status(409).json({ message: 'This URL slug is already in use', error: 'Duplicate slug' });
      }
    }
    const emailVal = email ? String(email).trim().toLowerCase() : undefined;
    if (emailVal) {
      const emailExists = await Leadership.findOne({ email: emailVal });
      if (emailExists) {
        return res.status(409).json({ message: 'This email is already used by another member', error: 'Duplicate email' });
      }
    }
    const created = await Leadership.create({
      name: nameTrim,
      title: titleTrim,
      slug: slugVal || null,
      email: emailVal || null,
      bio: String(bio).trim(),
      image: image || null,
      avatar_emoji: avatar_emoji || '👤',
      social_links: social_links || {},
      department: department ? String(department).trim() : null,
      location: location ? String(location).trim() : null,
      start_year: start_year != null && start_year !== '' ? Number(start_year) : null,
      highlights: Array.isArray(highlights) ? highlights : [],
      focus_areas: Array.isArray(focus_areas) ? focus_areas : [],
      calendly_link: calendly_link ? String(calendly_link).trim() : null,
      order: order != null ? Number(order) : 0,
      is_featured: !!is_featured,
      is_active: true
    });
    res.status(201).json(created);
  } catch (error) {
    if (String(error.message || '').toLowerCase().includes('duplicate') || error.code === '23505') {
      return res.status(409).json({ message: 'A leadership member with this email or slug already exists', error: 'Duplicate entry' });
    }
    res.status(400).json({ message: 'Error creating leadership member', error: error.message });
  }
});

// Reorder leadership members (admin only) – must be before PUT /:id
router.put('/reorder', authenticate, requireRole(['executive','admin','super_admin']), async (req, res) => {
  try {
    const { orderData } = req.body; // Array of { id, order }
    if (!Array.isArray(orderData) || orderData.length === 0) {
      return res.status(400).json({ message: 'orderData array is required' });
    }
    for (const item of orderData) {
      await Leadership.findByIdAndUpdate(item.id, { order: item.order });
    }
    res.json({ message: 'Leadership team reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error reordering leadership team', error: error.message });
  }
});

// Update leadership member (admin only) – enforce unique name+title (excluding self)
router.put('/:id', authenticate, requireRole(['executive','admin','super_admin']), async (req, res) => {
  try {
    const {
      name, title, slug, email, bio, image, avatar_emoji, social_links, order, is_active, is_featured,
      department, location, start_year, highlights, focus_areas, calendly_link
    } = req.body;
    const nameTrim = name != null ? String(name).trim() : undefined;
    const titleTrim = title != null ? String(title).trim() : undefined;
    if (nameTrim && titleTrim) {
      const duplicate = await Leadership.findOne({ name: nameTrim, title: titleTrim });
      if (duplicate && String(duplicate.id) !== String(req.params.id)) {
        return res.status(409).json({ message: 'Another member already has this name and title', error: 'Duplicate entry' });
      }
    }
    const slugVal = slug !== undefined ? (slug ? String(slug).trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : null) : undefined;
    if (slugVal) {
      const slugExists = await Leadership.findOne({ slug: slugVal });
      if (slugExists && String(slugExists.id) !== String(req.params.id)) {
        return res.status(409).json({ message: 'This URL slug is already in use', error: 'Duplicate slug' });
      }
    }
    const emailVal = email !== undefined ? (email ? String(email).trim().toLowerCase() : null) : undefined;
    if (emailVal) {
      const emailExists = await Leadership.findOne({ email: emailVal });
      if (emailExists && String(emailExists.id) !== String(req.params.id)) {
        return res.status(409).json({ message: 'This email is already used by another member', error: 'Duplicate email' });
      }
    }
    const update = {
      ...(nameTrim !== undefined && { name: nameTrim }),
      ...(titleTrim !== undefined && { title: titleTrim }),
      ...(slugVal !== undefined && { slug: slugVal || null }),
      ...(emailVal !== undefined && { email: emailVal || null }),
      ...(bio !== undefined && { bio: String(bio).trim() }),
      ...(image !== undefined && { image: image || null }),
      ...(avatar_emoji !== undefined && { avatar_emoji: avatar_emoji || '👤' }),
      ...(social_links !== undefined && { social_links: social_links || {} }),
      ...(department !== undefined && { department: department ? String(department).trim() : null }),
      ...(location !== undefined && { location: location ? String(location).trim() : null }),
      ...(start_year !== undefined && { start_year: start_year != null && start_year !== '' ? Number(start_year) : null }),
      ...(highlights !== undefined && { highlights: Array.isArray(highlights) ? highlights : [] }),
      ...(focus_areas !== undefined && { focus_areas: Array.isArray(focus_areas) ? focus_areas : [] }),
      ...(calendly_link !== undefined && { calendly_link: calendly_link ? String(calendly_link).trim() : null }),
      ...(order !== undefined && { order: Number(order) }),
      ...(typeof is_active === 'boolean' && { is_active }),
      ...(typeof is_featured === 'boolean' && { is_featured }),
    };
    const leadership = await Leadership.findByIdAndUpdate(req.params.id, update);
    if (!leadership) {
      return res.status(404).json({ message: 'Leadership member not found' });
    }
    res.json(leadership);
  } catch (error) {
    if (String(error.message || '').toLowerCase().includes('duplicate') || error.code === '23505') {
      return res.status(409).json({ message: 'Email or slug already in use', error: 'Duplicate entry' });
    }
    res.status(400).json({ message: 'Error updating leadership member', error: error.message });
  }
});

// Delete leadership member (admin only)
router.delete('/:id', authenticate, requireRole(['executive','admin','super_admin']), async (req, res) => {
  try {
    const leadership = await Leadership.findByIdAndDelete(req.params.id);
    if (!leadership) {
      return res.status(404).json({ message: 'Leadership member not found' });
    }
    res.json({ message: 'Leadership member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting leadership member', error: error.message });
  }
});

module.exports = router; 