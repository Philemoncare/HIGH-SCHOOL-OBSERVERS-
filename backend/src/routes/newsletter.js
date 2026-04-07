const express = require('express');
const router = express.Router();
const NewsletterSubscriber = require('../models/NewsletterSubscriber');

// Brevo (Sendinblue) setup
let brevoContactsApi = null;
try {
  const SibApiV3Sdk = require('sib-api-v3-sdk');
  const brevoClient = SibApiV3Sdk.ApiClient.instance;
  const brevoApiKey = brevoClient.authentications['api-key'];
  if (process.env.BREVO_API_KEY) {
    brevoApiKey.apiKey = process.env.BREVO_API_KEY;
    brevoContactsApi = new SibApiV3Sdk.ContactsApi();
  }
} catch (e) {
  // SDK not installed or other issue; we'll fallback gracefully
}

// Mailchimp setup
const mailchimp = require('@mailchimp/mailchimp_marketing');

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX; // e.g., 'us21'
const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID; // List ID

if (MAILCHIMP_API_KEY && MAILCHIMP_SERVER_PREFIX) {
  mailchimp.setConfig({
    apiKey: MAILCHIMP_API_KEY,
    server: MAILCHIMP_SERVER_PREFIX
  });
} else {
  console.warn('Mailchimp not fully configured. Set MAILCHIMP_API_KEY and MAILCHIMP_SERVER_PREFIX to enable newsletter subscription.');
}

// Basic email regex
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

async function upsertSubscriber(email, data) {
  const { queryOne } = require('../database/postgres');
  const existing = await queryOne('SELECT id FROM newsletter_subscribers WHERE email = $1', [email]);
  if (existing) {
     return NewsletterSubscriber.updateById(existing.id, data);
  } else {
     return NewsletterSubscriber.create({ email, ...data, is_active: data.status === 'subscribed' });
  }
}

router.post('/subscribe', async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body || {};
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    // Prefer Brevo Double Opt-In if configured
    const hasBrevo = brevoContactsApi && process.env.BREVO_LIST_ID;
    const hasBrevoDOI = hasBrevo && process.env.BREVO_DOI_TEMPLATE_ID && process.env.BREVO_REDIRECT_URL;

    if (hasBrevo) {
      try {
        if (hasBrevoDOI) {
          await brevoContactsApi.createDoiContact({
            email: email.toLowerCase(),
            attributes: { FIRSTNAME: firstName || '', LASTNAME: lastName || '' },
            includeListIds: [Number(process.env.BREVO_LIST_ID)],
            templateId: Number(process.env.BREVO_DOI_TEMPLATE_ID),
            redirectionUrl: process.env.BREVO_REDIRECT_URL
          });
          await upsertSubscriber(email.toLowerCase().trim(), { name: firstName ? `${firstName} ${lastName||''}`.trim() : null, status: 'pending', is_active: false }).catch(() => {});
          return res.status(200).json({ success: true, provider: 'brevo', status: 'pending', message: 'Check your email to confirm subscription.' });
        } else {
          await brevoContactsApi.createContact({
            email: email.toLowerCase(),
            attributes: { FIRSTNAME: firstName || '', LASTNAME: lastName || '' },
            listIds: [Number(process.env.BREVO_LIST_ID)],
            updateEnabled: true
          });
          await upsertSubscriber(email.toLowerCase().trim(), { name: firstName ? `${firstName} ${lastName||''}`.trim() : null, status: 'subscribed', is_active: true }).catch(() => {});
          return res.status(200).json({ success: true, provider: 'brevo', status: 'subscribed', message: 'Thanks! You are subscribed.' });
        }
      } catch (brevoErr) {
        console.warn('Brevo subscribe error, attempting fallback to Mailchimp:', brevoErr?.response?.text || brevoErr?.message || brevoErr);
      }
    }

    // Fallback: Mailchimp with double opt-in (pending)
    if (MAILCHIMP_API_KEY && MAILCHIMP_SERVER_PREFIX && MAILCHIMP_AUDIENCE_ID) {
      const response = await mailchimp.lists.addListMember(MAILCHIMP_AUDIENCE_ID, {
        email_address: email.toLowerCase(),
        status: 'pending',
        merge_fields: { FNAME: firstName || '', LNAME: lastName || '' }
      });
      await upsertSubscriber(email.toLowerCase().trim(), { name: firstName ? `${firstName} ${lastName||''}`.trim() : null, status: 'pending', is_active: false }).catch(() => {});
      return res.json({ success: true, provider: 'mailchimp', id: response.id, status: response.status, message: 'Check your email to confirm subscription.' });
    }

    try {
      const normalized = email.toLowerCase().trim();
      const existing = await NewsletterSubscriber.findByEmail(normalized);
      if (existing) {
        return res.status(200).json({ success: true, message: 'Already subscribed' });
      }
      await NewsletterSubscriber.create({
        email: normalized,
        name: firstName ? `${firstName} ${lastName||''}`.trim() : null,
        is_active: true
      });
      return res.status(200).json({ success: true, message: 'Thanks! You are subscribed.' });
    } catch (dbErr) {
      console.error('Newsletter DB save error:', dbErr);
      return res.status(500).json({ error: 'Subscription failed. Please try again.' });
    }
  } catch (err) {
    // Handle common Mailchimp errors
    const status = err?.status || 500;
    const title = err?.response?.body?.title;
    const detail = err?.response?.body?.detail;

    // If already subscribed or pending
    if (title === 'Member Exists') {
      return res.status(200).json({ success: true, message: 'Already subscribed' });
    }
    if (title === 'Forgotten Email Not Subscribed' || title === 'Member In Compliance State') {
      return res.status(202).json({ success: true, message: 'Subscription pending confirmation' });
    }

    console.error('Newsletter subscribe error:', err?.response?.body || err?.response?.text || err);
    return res.status(status >= 400 && status < 600 ? status : 500).json({ error: detail || 'Subscription failed' });
  }
});

module.exports = router;
