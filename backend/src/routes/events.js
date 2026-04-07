const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const Audit = require('../models/Audit');
const Event = require('../models/Event');
const User = require('../models/User');
const router = express.Router();

// Helper to populate created_by with User info
async function populateCreatedBy(events) {
  const isArr = Array.isArray(events);
  const arr = isArr ? events : [events];
  for (let ev of arr) {
    if (ev && ev.created_by && typeof ev.created_by === 'string') {
       const u = await User.findById(ev.created_by);
       if (u) {
         ev.created_by = {
           _id: u.id,
           id: u.id,
           first_name: u.first_name,
           last_name: u.last_name,
           email: u.email
         };
       }
    }
  }
  return isArr ? arr : arr[0];
}

// Get all events (admin/executive only)
router.get('/', authenticate, requireRole(['super_admin','executive']), async (req, res) => {
  try {
    const { search, status, category, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Search functionality - simple exact fallback or handle in Model
    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    
    const skip = (page - 1) * limit;
    
    let events = await Event.find(query, {
       sort: { date: 1 },
       skip: skip,
       limit: parseInt(limit)
    });
    
    events = await populateCreatedBy(events);
    
    const total = await Event.count(query);
    
    res.json({
      events,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get public events (no authentication required)
router.get('/public', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = { status: 'active' };
    
    if (category && category !== 'all') query.category = category;
    
    let events = await Event.find(query, { sort: { date: 1 } });
    
    events.forEach(e => {
       delete e.created_by;
       delete e.created_at;
       delete e.updated_at;
    });
    
    res.json({ events });
  } catch (error) {
    console.error('Error fetching public events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single event by ID (public, no auth)
router.get('/public/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (event.status !== 'active') return res.status(404).json({ error: 'Event not found' });
    
    delete event.created_by;
    delete event.created_at;
    delete event.updated_at;
    res.json(event);
  } catch (error) {
    console.error('Error fetching public event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Get event by ID (admin only)
router.get('/:id', authenticate, requireRole(['super_admin','executive']), async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    event = await populateCreatedBy(event);
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create event
router.post('/', authenticate, requireRole(['super_admin','executive']), async (req, res) => {
  try {
    const {
      title, description, category, date, time, location, organizer,
      image, price, capacity, status, featured, urgent
    } = req.body;

    const dateVal = date || req.body.event_date;
    if (!dateVal || !String(dateVal).trim()) return res.status(400).json({ error: 'Event date is required' });
    const dateObj = new Date(dateVal);
    if (isNaN(dateObj.getTime())) return res.status(400).json({ error: 'Invalid event date' });

    const timeStr = (time && String(time).trim()) ? String(time).trim() : '09:00 - 17:00';
    const imageValue = (typeof image === 'string' && image.length > 0) ? (image.startsWith('data:') ? image : image.trim()) : (image || null);
    const priceStr = price !== undefined && price !== null ? String(price) : 'Free';
    const capacityNum = Math.max(0, parseInt(Number(capacity), 10) || 100);
    const categoryVal = ['conference', 'workshop', 'symposium', 'briefing', 'networking', 'summit'].includes(category) ? category : 'conference';
    const statusVal = ['active', 'cancelled', 'completed', 'draft'].includes(status) ? status : 'active';

    const eventData = {
      title: title && String(title).trim(),
      description: description && String(description).trim(),
      category: categoryVal,
      date: dateObj,
      time: timeStr,
      location: (location && String(location).trim()) || '',
      organizer: (organizer && String(organizer).trim()) || 'HSO',
      image: imageValue,
      price: priceStr,
      capacity: capacityNum,
      status: statusVal,
      featured: !!featured,
      urgent: !!urgent,
      created_by: req.user.id || req.user._id
    };

    const event = await Event.create(eventData);

    await Audit.create({
      user_id: req.user.id || req.user._id,
      action: 'create_event',
      resource: 'Event',
      resource_id: event.id,
      details: { title: event.title, category: event.category, date: event.date }
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event
router.put('/:id', authenticate, requireRole(['super_admin','executive']), async (req, res) => {
  try {
    const allowed = ['title', 'description', 'category', 'date', 'time', 'location', 'organizer', 'image', 'price', 'capacity', 'status', 'featured', 'urgent'];
    const updateData = {};
    const rawDate = req.body.date || req.body.event_date;
    if (rawDate !== undefined && rawDate !== '') {
      const d = new Date(rawDate);
      updateData.date = isNaN(d.getTime()) ? undefined : d;
    }
    allowed.forEach(field => {
      if (field === 'date') return;
      if (req.body[field] !== undefined) {
        if (field === 'image') {
          const v = req.body[field];
          updateData[field] = (typeof v === 'string' && v.length > 0) ? (v.startsWith('data:') ? v : v.trim()) : (v || null);
        } else if (field === 'capacity') {
          const n = parseInt(Number(req.body[field]), 10);
          updateData[field] = Number.isFinite(n) && n >= 0 ? n : undefined;
        } else if (field === 'price') {
          updateData[field] = req.body[field] !== null ? String(req.body[field]) : undefined;
        } else if (field === 'category') {
          const c = req.body[field];
          if (['conference', 'workshop', 'symposium', 'briefing', 'networking', 'summit'].includes(c)) updateData[field] = c;
        } else if (field === 'status') {
          const s = req.body[field];
          if (['active', 'cancelled', 'completed', 'draft'].includes(s)) updateData[field] = s;
        } else {
          updateData[field] = req.body[field];
        }
      }
    });

    let event = await Event.updateById(req.params.id, updateData);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    event = await populateCreatedBy(event);

    await Audit.create({
      user_id: req.user.id || req.user._id,
      action: 'update_event',
      resource: 'Event',
      resource_id: event.id,
      details: { title: event.title }
    });

    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event
router.delete('/:id', authenticate, requireRole(['super_admin','executive']), async (req, res) => {
  try {
    const event = await Event.deleteById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    try {
      await Audit.create({
        user_id: req.user.id || req.user._id,
        action: 'delete_event',
        resource: 'Event',
        resource_id: req.params.id,
        details: { title: event.title }
      });
    } catch (auditErr) {
      console.warn('Audit log failed:', auditErr.message);
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Toggle event status
router.patch('/:id/toggle-status', authenticate, requireRole(['super_admin','executive']), async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    const newStatus = event.status === 'active' ? 'cancelled' : 'active';
    event = await Event.updateById(event.id, { status: newStatus });
    
    await Audit.create({
      user_id: req.user.id || req.user._id,
      action: 'toggle_event_status',
      resource: 'Event',
      resource_id: event.id,
      details: { status: newStatus }
    });
    
    res.json(event);
  } catch (error) {
    console.error('Error toggling event status:', error);
    res.status(500).json({ error: 'Failed to toggle event status' });
  }
});

// Toggle featured status
router.patch('/:id/toggle-featured', authenticate, requireRole(['super_admin','executive']), async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    event = await Event.updateById(event.id, { featured: !event.featured });
    
    await Audit.create({
      user_id: req.user.id || req.user._id,
      action: 'toggle_event_featured',
      resource: 'Event',
      resource_id: event.id,
      details: { featured: event.featured }
    });
    
    res.json(event);
  } catch (error) {
    console.error('Error toggling featured status:', error);
    res.status(500).json({ error: 'Failed to toggle featured status' });
  }
});

// Get events statistics
router.get('/stats/overview', authenticate, requireRole(['super_admin','executive']), async (req, res) => {
  try {
    const totalEvents = await Event.count({});
    const activeEvents = await Event.count({ status: 'active' });
    
    // For specific date constraints, we can do a direct query or fetch all active and filter
    const activeEventsList = await Event.find({ status: 'active' });
    const now = new Date();
    const upcomingEvents = activeEventsList.filter(e => new Date(e.date) >= now).length;
    
    // Calculate total revenue
    let totalRevenue = 0;
    activeEventsList.forEach(e => {
       if (e.price && e.price !== 'Free') {
          const val = parseFloat(String(e.price).replace('₵', '').trim());
          if (!isNaN(val)) totalRevenue += val;
       }
    });

    res.json({ totalEvents, activeEvents, upcomingEvents, totalRevenue });
  } catch (error) {
    console.error('Error fetching events stats:', error);
    res.status(500).json({ error: 'Failed to fetch events statistics' });
  }
});

module.exports = router; 