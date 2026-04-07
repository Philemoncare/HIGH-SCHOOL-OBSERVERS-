const { queryOne } = require('../database/postgres');

class Settings {
  static async findOne(filter = {}) {
    let query = 'SELECT * FROM settings WHERE 1=1';
    const values = [];
    let paramIndex = 1;

    if (filter.key) {
      query += ` AND key = $${paramIndex}`;
      values.push(filter.key);
      paramIndex++;
    }

    const result = await queryOne(query, values);
    if (!result) return null;
    
    const transformed = this.transform(result);
    // Support mongoose .lean() chained calls transparently
    transformed.lean = () => transformed;
    return transformed;
  }

  static async updateSettings(key, valueObj) {
    const existing = await this.findOne({ key });
    if (existing) {
      const merged = { ...existing.value, ...valueObj };
      const q = 'UPDATE settings SET value = $1 WHERE key = $2 RETURNING *';
      const r = await queryOne(q, [JSON.stringify(merged), key]);
      return r ? this.transform(r) : null;
    } else {
      const q = 'INSERT INTO settings (key, value) VALUES ($1, $2) RETURNING *';
      const r = await queryOne(q, [key, JSON.stringify(valueObj)]);
      return r ? this.transform(r) : null;
    }
  }

  static transform(doc) {
    if (!doc) return null;
    const val = typeof doc.value === 'string' ? JSON.parse(doc.value) : doc.value || {};
    return {
      id: doc.id,
      _id: doc.id,
      key: doc.key,
      value: val,
      allowRegistrations: val.allowRegistrations !== undefined ? val.allowRegistrations : true,
      maintenanceMode: val.maintenanceMode !== undefined ? val.maintenanceMode : false,
      supportEmail: val.supportEmail || 'support@hso.com',
      description: doc.description,
      created_at: doc.created_at,
      updated_at: doc.updated_at
    };
  }
}

module.exports = Settings;
