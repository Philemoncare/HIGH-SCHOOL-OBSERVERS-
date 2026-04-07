const { queryOne, queryMany } = require('../database/postgres');

class Leadership {
  static async create(data) {
    const q = `INSERT INTO leadership (name, position, slug, bio, image, email, avatar_emoji, social_links, order_index, featured, is_active)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`;
    const r = await queryOne(q, [
      data.name,
      data.title || data.position,
      data.slug || null,
      data.bio || null,
      data.image || null,
      data.email || null,
      data.avatar_emoji || null,
      JSON.stringify(data.social_links || {}),
      data.order != null ? Number(data.order) : 0,
      !!(data.is_featured ?? data.featured),
      data.is_active !== false
    ]);
    return r ? this.transform(r) : null;
  }

  static async find(filter = {}, options = {}) {
    let query = 'SELECT * FROM leadership WHERE 1=1';
    const values = [];
    let paramIndex = 1;

    // Handle legacy filter aliases
    for (const [key, value] of Object.entries(filter)) {
      if (value !== undefined && value !== null) {
        let dbKey = key;
        if (key === 'title') dbKey = 'position';
        if (key === 'is_featured') dbKey = 'featured';
        if (key === 'order') dbKey = 'order_index';
        if (key === 'is_active') dbKey = 'is_active';
        
        query += ` AND ${dbKey} = $${paramIndex}`;
        values.push(value);
        paramIndex++;
      }
    }

    if (options.sort) {
      if (options.sort.order) {
         const sortOrder = options.sort.order === -1 ? 'DESC' : 'ASC';
         query += ` ORDER BY order_index ${sortOrder}`;
      }
    } else {
      query += ' ORDER BY order_index ASC';
    }

    const results = await queryMany(query, values);
    return results.map(l => this.transform(l));
  }

  static async findOne(filter = {}) {
    const results = await this.find(filter, { limit: 1 });
    return results[0] || null;
  }

  static async findById(id) {
    const result = await queryOne('SELECT * FROM leadership WHERE id = $1', [id]);
    return result ? this.transform(result) : null;
  }

  static async updateById(id, data) {
    const fields = [];
    const vals = [];
    let pi = 1;

    const map = {
      name: 'name',
      title: 'position',
      position: 'position',
      slug: 'slug',
      bio: 'bio',
      image: 'image',
      email: 'email',
      avatar_emoji: 'avatar_emoji',
      social_links: 'social_links',
      order: 'order_index',
      is_featured: 'featured',
      featured: 'featured',
      is_active: 'is_active'
    };

    for (const [k, v] of Object.entries(data)) {
      if (!(k in map)) continue;
      const col = map[k];
      fields.push(`${col} = $${pi}`);
      if (col === 'social_links') vals.push(JSON.stringify(v || {}));
      else if (col === 'order_index') vals.push(v != null ? Number(v) : 0);
      else vals.push(v);
      pi++;
    }

    if (fields.length === 0) return this.findById(id);
    vals.push(id);

    const q = `UPDATE leadership SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${pi} RETURNING *`;
    const r = await queryOne(q, vals);
    return r ? this.transform(r) : null;
  }

  static async deleteById(id) {
    const r = await queryOne('DELETE FROM leadership WHERE id = $1 RETURNING *', [id]);
    return r ? this.transform(r) : null;
  }

  static async findByIdAndUpdate(id, data) {
    return this.updateById(id, data);
  }

  static async findByIdAndDelete(id) {
    return this.deleteById(id);
  }

  static transform(doc) {
    if (!doc) return null;
    const social = typeof doc.social_links === 'string' ? JSON.parse(doc.social_links) : (doc.social_links || {});
    return {
      id: doc.id,
      _id: doc.id,
      name: doc.name,
      position: doc.position,
      title: doc.position,
      slug: doc.slug,
      bio: doc.bio,
      image: doc.image,
      email: doc.email,
      avatar_emoji: doc.avatar_emoji,
      social_links: social,
      order: doc.order_index,
      is_featured: doc.featured,
      featured: doc.featured,
      is_active: doc.is_active,
      created_at: doc.created_at,
      updated_at: doc.updated_at
    };
  }
}

module.exports = Leadership; 