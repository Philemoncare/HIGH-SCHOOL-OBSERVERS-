const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

const DEFAULTS = { allowRegistrations: true, maintenanceMode: false, supportEmail: 'support@hso.com' };

// Public: get settings for frontend (maintenance banner, allow register, support email)
router.get('/', async (req, res) => {
  try {
    const doc = await Settings.findOne({ key: 'platform' }).lean();
    const settings = doc
      ? {
          allowRegistrations: doc.allowRegistrations ?? DEFAULTS.allowRegistrations,
          maintenanceMode: doc.maintenanceMode ?? DEFAULTS.maintenanceMode,
          supportEmail: doc.supportEmail ?? DEFAULTS.supportEmail,
        }
      : DEFAULTS;
    res.json(settings);
  } catch (error) {
    res.json(DEFAULTS);
  }
});

module.exports = router;
