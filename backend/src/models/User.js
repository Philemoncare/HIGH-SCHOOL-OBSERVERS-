const { queryOne, queryMany, transaction } = require('../database/postgres');

class User {
  static async create(userData) {
    const {
      email,
      first_name,
      last_name,
      role = 'user',
      school_name,
      school_location,
      phone,
      profile_image,
      bio,
      location,
      website,
      social_links = {},
      badges = [],
      password_hash,
      is_verified = false,
      is_approved = false,
      google_id,
      facebook_id,
      twitter_id,
      provider = 'local',
      two_fa_enabled = false,
      two_fa_code,
      two_fa_code_expires,
      preferences = {}
    } = userData;

    const result = await queryOne(
      `INSERT INTO users (
        email, first_name, last_name, role, school_name, school_location,
        phone, profile_image, bio, location, website, social_links, badges,
        password_hash, is_verified, is_approved, google_id, facebook_id,
        twitter_id, provider, two_fa_enabled, two_fa_code, two_fa_code_expires, preferences
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      RETURNING *`,
      [
        email, first_name, last_name, role, school_name, school_location,
        phone, profile_image, bio, location, website, JSON.stringify(social_links), badges,
        password_hash, is_verified, is_approved, google_id, facebook_id,
        twitter_id, provider, two_fa_enabled, two_fa_code, two_fa_code_expires, JSON.stringify(preferences)
      ]
    );

    return this.transformUser(result);
  }

  static async findById(id) {
    const result = await queryOne('SELECT * FROM users WHERE id = $1', [id]);
    return result ? this.transformUser(result) : null;
  }

  static async findByEmail(email) {
    const result = await queryOne('SELECT * FROM users WHERE email = $1', [email]);
    return result ? this.transformUser(result) : null;
  }

  static async findByGoogleId(googleId) {
    const result = await queryOne('SELECT * FROM users WHERE google_id = $1', [googleId]);
    return result ? this.transformUser(result) : null;
  }

  static async findByFacebookId(facebookId) {
    const result = await queryOne('SELECT * FROM users WHERE facebook_id = $1', [facebookId]);
    return result ? this.transformUser(result) : null;
  }

  static async updateById(id, updateData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (key === 'social_links' || key === 'preferences') {
        fields.push(`${key} = $${paramIndex}`);
        values.push(JSON.stringify(value));
      } else if (key === 'badges') {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
      } else {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
      }
      paramIndex++;
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await queryOne(query, values);
    
    return result ? this.transformUser(result) : null;
  }

  static async deleteById(id) {
    const result = await queryOne('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    return result ? this.transformUser(result) : null;
  }

  static async find(filter = {}, options = {}) {
    let query = 'SELECT * FROM users WHERE 1=1';
    const values = [];
    let paramIndex = 1;

    // Build WHERE clause
    for (const [key, value] of Object.entries(filter)) {
      if (value !== undefined && value !== null) {
        query += ` AND ${key} = $${paramIndex}`;
        values.push(value);
        paramIndex++;
      }
    }

    // Add sorting
    if (options.sort) {
      const sortField = Object.keys(options.sort)[0];
      const sortOrder = options.sort[sortField] === -1 ? 'DESC' : 'ASC';
      query += ` ORDER BY ${sortField} ${sortOrder}`;
    }

    // Add pagination
    if (options.limit) {
      query += ` LIMIT $${paramIndex}`;
      values.push(options.limit);
      paramIndex++;
    }

    if (options.skip) {
      query += ` OFFSET $${paramIndex}`;
      values.push(options.skip);
    }

    const results = await queryMany(query, values);
    return results.map(user => this.transformUser(user));
  }

  static async count(filter = {}) {
    let query = 'SELECT COUNT(*) FROM users WHERE 1=1';
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(filter)) {
      if (value !== undefined && value !== null) {
        query += ` AND ${key} = $${paramIndex}`;
        values.push(value);
        paramIndex++;
      }
    }

    const result = await queryOne(query, values);
    return parseInt(result.count);
  }

  static async createSession(userId, token, userAgent, ip) {
    const result = await queryOne(
      'INSERT INTO user_sessions (user_id, token, user_agent, ip) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, token, userAgent, ip]
    );
    return result;
  }

  static async findSessionByToken(token) {
    const result = await queryOne('SELECT * FROM user_sessions WHERE token = $1', [token]);
    return result;
  }

  static async deleteSessionByToken(token) {
    const result = await queryOne('DELETE FROM user_sessions WHERE token = $1 RETURNING *', [token]);
    return result;
  }

  static async deleteAllSessions(userId) {
    const result = await queryMany('DELETE FROM user_sessions WHERE user_id = $1 RETURNING *', [userId]);
    return result;
  }

  static transformUser(user) {
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      school_name: user.school_name,
      school_location: user.school_location,
      phone: user.phone,
      profile_image: user.profile_image,
      bio: user.bio,
      location: user.location,
      website: user.website,
      social_links: user.social_links || {},
      badges: user.badges || [],
      password_hash: user.password_hash,
      is_verified: user.is_verified,
      is_approved: user.is_approved,
      google_id: user.google_id,
      facebook_id: user.facebook_id,
      twitter_id: user.twitter_id,
      provider: user.provider,
      two_fa_enabled: user.two_fa_enabled,
      two_fa_code: user.two_fa_code,
      two_fa_code_expires: user.two_fa_code_expires,
      preferences: user.preferences || {},
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  }
}

module.exports = User;