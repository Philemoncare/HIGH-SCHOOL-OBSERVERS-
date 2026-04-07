const User = require('../models/User');

const normalizeEmail = (email) => {
  return email.trim().toLowerCase();
};

const findUserByEmail = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  return await User.findByEmail(normalizedEmail);
};

module.exports = {
  normalizeEmail,
  findUserByEmail,
};
