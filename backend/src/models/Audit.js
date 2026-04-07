const { queryOne, queryMany } = require('../database/postgres');

class Audit {
  static async create(data) {
    const q = `INSERT INTO audit (user_id, action, resource_type, resource_id, new_values, ip_address, user_agent)
               VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
    // Map Mongoose 'resource' -> 'resource_type', 'details' -> 'new_values'
    const r = await queryOne(q, [
      data.user_id || null,
      data.action,
      data.resource || data.resource_type || 'unknown',
      data.resource_id || null,
      JSON.stringify(data.details || data.new_values || {}),
      data.ip_address || null,
      data.user_agent || null
    ]);
    return r ? this.transform(r) : null;
  }

  static async find(filter = {}) {
    let q = 'SELECT * FROM audit WHERE 1=1';
    let vals = [];
    let pi = 1;
    for (const [k, v] of Object.entries(filter)) {
      if (v !== undefined) {
        let dbKey = k;
        if (k === 'resource') dbKey = 'resource_type';
        q += ` AND ${dbKey} = $${pi}`;
        vals.push(v);
        pi++;
      }
    }
    q += ' ORDER BY created_at DESC';
    const results = await queryMany(q, vals);
    return results.map(r => this.transform(r));
  }

  static transform(doc) {
    if (!doc) return null;
    return {
      id: doc.id,
      _id: doc.id,
      user_id: doc.user_id,
      action: doc.action,
      resource: doc.resource_type,
      resource_type: doc.resource_type,
      resource_id: doc.resource_id,
      details: doc.new_values,
      old_values: doc.old_values,
      new_values: doc.new_values,
      ip_address: doc.ip_address,
      user_agent: doc.user_agent,
      created_at: doc.created_at
    };
  }
}

module.exports = Audit; 