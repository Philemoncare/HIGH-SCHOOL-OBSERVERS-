const { queryOne, queryMany } = require('../database/postgres');

class Leadership {
  static async find(filter = {}, options = {}) {
    let query = 'SELECT * FROM leadership WHERE 1=1';
    const values = [];
    let paramIndex = 1;

    // Handle mongoose basic filters
    for (const [key, value] of Object.entries(filter)) {
      if (value !== undefined && value !== null) {
        let dbKey = key;
        if (key === 'title') dbKey = 'position';
        if (key === 'is_featured') dbKey = 'featured';
        if (key === 'order') dbKey = 'order_index';
        
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

  static async findById(id) {
    const result = await queryOne('SELECT * FROM leadership WHERE id = $1', [id]);
    return result ? this.transform(result) : null;
  }

  static transform(doc) {
    if (!doc) return null;
    return {
      id: doc.id,
      _id: doc.id,
      name: doc.name,
      position: doc.position,
      title: doc.position,
      bio: doc.bio,
      image: doc.image,
      email: doc.email,
      order: doc.order_index,
      is_featured: doc.featured,
      featured: doc.featured,
      created_at: doc.created_at,
      updated_at: doc.updated_at
    };
  }
}

module.exports = Leadership; 