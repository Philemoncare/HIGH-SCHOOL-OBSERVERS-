const { queryOne } = require('../database/postgres');

class PasswordReset {
  static async create(data) {
    const q = `INSERT INTO password_resets (email, token, expires_at)
               VALUES ($1, $2, $3) RETURNING *`;
    const r = await queryOne(q, [data.email, data.token, data.expiresAt]);
    return r ? this.transform(r) : null;
  }

  static async findOne(filter = {}) {
    let q = 'SELECT * FROM password_resets WHERE 1=1';
    let vals = [];
    let pi = 1;
    
    if (filter.token) {
      q += ` AND token = $${pi}`;
      vals.push(filter.token);
      pi++;
    }
    if (filter.email) {
      q += ` AND email = $${pi}`;
      vals.push(filter.email);
      pi++;
    }
    
    // In Mongoose queries like: expiresAt: { $gt: new Date() }
    if (filter.expiresAt && filter.expiresAt.$gt) {
      q += ` AND expires_at > $${pi}`;
      vals.push(filter.expiresAt.$gt);
      pi++;
    }

    const r = await queryOne(q, vals);
    return r ? this.transform(r) : null;
  }

  static transform(doc) {
    if (!doc) return null;
    const t = {
      id: doc.id,
      _id: doc.id,
      email: doc.email,
      token: doc.token,
      expiresAt: doc.expires_at,
      used: false, // Polyfilled for Mongoose logic
      createdAt: doc.created_at
    };
    t.save = async function() {
      // Mongoose logic sets used = true and saves. For Postgres lacking 'used' column, 
      // the best approach is to simply delete the token to prevent reuse.
      if (this.used === true) {
         await queryOne('DELETE FROM password_resets WHERE id = $1', [doc.id]);
      }
      return this;
    };
    return t;
  }
}

module.exports = PasswordReset;
