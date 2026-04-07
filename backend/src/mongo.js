/**
 * Backwards-compatible export kept for older code paths.
 * The platform now uses PostgreSQL (see `./database/postgres`).
 */
const { connectDB } = require('./database/postgres');

module.exports = connectDB;