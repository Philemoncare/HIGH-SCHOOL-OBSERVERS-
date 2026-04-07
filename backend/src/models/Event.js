const { queryOne, queryMany, transaction } = require('../database/postgres');

class Event {
  static async create(eventData) {
    const {
      title,
      description,
      category = 'conference',
      date,
      time,
      location,
      organizer,
      image,
      price = 'Free',
      capacity = 100,
      registered = 0,
      status = 'active',
      featured = false,
      urgent = false,
      created_by
    } = eventData;

    const result = await queryOne(
      `INSERT INTO events (
        title, description, category, date, time, location, organizer,
        image, price, capacity, registered, status, featured, urgent, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        title, description, category, date, time, location, organizer,
        image, price, capacity, registered, status, featured, urgent, created_by
      ]
    );

    return this.transformEvent(result);
  }

  static async findById(id) {
    const result = await queryOne('SELECT * FROM events WHERE id = $1', [id]);
    return result ? this.transformEvent(result) : null;
  }

  static async updateById(id, updateData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updateData)) {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE events SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await queryOne(query, values);
    
    return result ? this.transformEvent(result) : null;
  }

  static async deleteById(id) {
    const result = await queryOne('DELETE FROM events WHERE id = $1 RETURNING *', [id]);
    return result ? this.transformEvent(result) : null;
  }

  static async find(filter = {}, options = {}) {
    let query = 'SELECT * FROM events WHERE 1=1';
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
    return results.map(event => this.transformEvent(event));
  }

  static async findUpcoming(limit = 10) {
    const results = await queryMany(
      'SELECT * FROM events WHERE date >= CURRENT_DATE AND status = $1 ORDER BY date ASC LIMIT $2',
      ['active', limit]
    );
    return results.map(event => this.transformEvent(event));
  }

  static async findFeatured(limit = 5) {
    const results = await queryMany(
      'SELECT * FROM events WHERE featured = $1 AND status = $2 ORDER BY date ASC LIMIT $3',
      [true, 'active', limit]
    );
    return results.map(event => this.transformEvent(event));
  }

  static async incrementRegistered(id) {
    const result = await queryOne(
      'UPDATE events SET registered = registered + 1 WHERE id = $1 RETURNING *',
      [id]
    );
    return result ? this.transformEvent(result) : null;
  }

  static async decrementRegistered(id) {
    const result = await queryOne(
      'UPDATE events SET registered = GREATEST(0, registered - 1) WHERE id = $1 RETURNING *',
      [id]
    );
    return result ? this.transformEvent(result) : null;
  }

  static async count(filter = {}) {
    let query = 'SELECT COUNT(*) FROM events WHERE 1=1';
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

  static transformEvent(event) {
    if (!event) return null;
    
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      category: event.category,
      date: event.date,
      time: event.time,
      location: event.location,
      organizer: event.organizer,
      image: event.image,
      price: event.price,
      capacity: event.capacity,
      registered: event.registered,
      status: event.status,
      featured: event.featured,
      urgent: event.urgent,
      created_by: event.created_by,
      created_at: event.created_at,
      updated_at: event.updated_at
    };
  }
}

module.exports = Event; 