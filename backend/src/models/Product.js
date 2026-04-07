const { queryOne, queryMany } = require('../database/postgres');

class Product {
  static async create(data) {
    const q = `INSERT INTO products (name, description, price, image, category, in_stock, featured) 
               VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
    const r = await queryOne(q, [
      data.name, 
      data.description || '', 
      data.price, 
      data.image || null,
      data.category || 'books', 
      data.in_stock !== false, 
      data.featured || false
    ]);
    return r ? this.transform(r) : null;
  }

  static async count(filter = {}, { search } = {}) {
    let q = 'SELECT COUNT(*) FROM products WHERE 1=1';
    const vals = [];
    let pi = 1;

    for (const [k, v] of Object.entries(filter)) {
      if (v !== undefined) {
        q += ` AND ${k} = $${pi}`;
        vals.push(v);
        pi++;
      }
    }

    if (search && search.trim()) {
      q += ` AND (name ILIKE $${pi} OR description ILIKE $${pi})`;
      vals.push(`%${search.trim()}%`);
    }

    const result = await queryOne(q, vals);
    return parseInt(result.count, 10) || 0;
  }

  static async find(filter = {}) {
    let q = 'SELECT * FROM products WHERE 1=1';
    let vals = [];
    let pi = 1;
    for (const [k, v] of Object.entries(filter)) {
      if (v !== undefined) {
        q += ` AND ${k} = $${pi}`;
        vals.push(v);
        pi++;
      }
    }
    const results = await queryMany(q, vals);
    return results.map(r => this.transform(r));
  }

  static async findPaginated({
    filter = {},
    search,
    sort = { created_at: -1 },
    limit = 12,
    skip = 0
  } = {}) {
    let q = 'SELECT * FROM products WHERE 1=1';
    const vals = [];
    let pi = 1;

    for (const [k, v] of Object.entries(filter)) {
      if (v !== undefined) {
        q += ` AND ${k} = $${pi}`;
        vals.push(v);
        pi++;
      }
    }

    if (search && search.trim()) {
      q += ` AND (name ILIKE $${pi} OR description ILIKE $${pi})`;
      vals.push(`%${search.trim()}%`);
      pi++;
    }

    const sortField = Object.keys(sort)[0] || 'created_at';
    const sortOrder = sort[sortField] === -1 ? 'DESC' : 'ASC';
    q += ` ORDER BY ${sortField} ${sortOrder}`;

    q += ` LIMIT $${pi} OFFSET $${pi + 1}`;
    vals.push(limit);
    vals.push(skip);

    const results = await queryMany(q, vals);
    return results.map(r => this.transform(r));
  }

  static async findOne(filter = {}) {
    const results = await this.findPaginated({ filter, limit: 1, skip: 0 });
    return results[0] || null;
  }

  static async findById(id) {
    if (!id) return null;
    const result = await queryOne('SELECT * FROM products WHERE id = $1', [id]);
    return result ? this.transform(result) : null;
  }

  static async updateById(id, data) {
    const fields = [];
    const vals = [];
    let pi = 1;
    for (const [k, v] of Object.entries(data)) {
      if (k === 'id' || k === '_id' || k === 'created_at' || k === 'updated_at') continue;
      fields.push(`${k} = $${pi}`);
      vals.push(v);
      pi++;
    }
    if (fields.length === 0) return this.findById(id);
    
    vals.push(id);
    const q = `UPDATE products SET ${fields.join(', ')} WHERE id = $${pi} RETURNING *`;
    const result = await queryOne(q, vals);
    return result ? this.transform(result) : null;
  }

  static async deleteById(id) {
    const result = await queryOne('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    return result ? this.transform(result) : null;
  }
  
  static async findByIdAndUpdate(id, data) {
    return this.updateById(id, data);
  }
  
  static async findByIdAndDelete(id) {
    return this.deleteById(id);
  }

  static transform(doc) {
    if (!doc) return null;
    const transformed = {
      id: doc.id,
      _id: doc.id,
      name: doc.name,
      description: doc.description,
      price: doc.price,
      image: doc.image,
      category: doc.category,
      in_stock: doc.in_stock,
      featured: doc.featured,
      created_at: doc.created_at,
      updated_at: doc.updated_at
    };
    transformed.save = async function() { return Product.updateById(doc.id, this); };
    return transformed;
  }
}

module.exports = Product; 