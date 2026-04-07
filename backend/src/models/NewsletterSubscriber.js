const { queryOne, queryMany } = require('../database/postgres');

class NewsletterSubscriber {
  static async create(data) {
    try {
      const q = `INSERT INTO newsletter_subscribers (email, name, is_active)
                 VALUES ($1, $2, $3) RETURNING *`;
      // Mongoose status 'subscribed', 'unsubscribed' -> Postgres `is_active`
      const is_active = data.status !== 'unsubscribed';
      const r = await queryOne(q, [data.email.toLowerCase(), data.name || null, is_active]);
      return r ? this.transform(r) : null;
    } catch (err) {
      if (err.code === '23505') { // Postgres unique violation
        const error = new Error('duplicate key error');
        error.code = 11000;
        throw error;
      }
      throw err;
    }
  }

  static async findOne(filter = {}) {
    let q = 'SELECT * FROM newsletter_subscribers WHERE 1=1';
    let vals = [];
    let pi = 1;
    if (filter.email) {
      q += ` AND email = $${pi}`;
      vals.push(filter.email.toLowerCase());
    }
    const r = await queryOne(q, vals);
    return r ? this.transform(r) : null;
  }

  static async find(filter = {}) {
    let q = 'SELECT * FROM newsletter_subscribers WHERE 1=1';
    let vals = [];
    let pi = 1;
    if (filter.email) {
      q += ` AND email = $${pi}`;
      vals.push(filter.email.toLowerCase());
    }
    const results = await queryMany(q, vals);
    return results.map(r => this.transform(r));
  }

  static async update(filter, updateData) {
    if (filter.email) {
       const is_active = updateData.status !== 'unsubscribed';
       const q = 'UPDATE newsletter_subscribers SET is_active = $1 WHERE email = $2 RETURNING *';
       const r = await queryOne(q, [is_active, filter.email.toLowerCase()]);
       return r ? this.transform(r) : null;
    }
  }

  static transform(doc) {
    if (!doc) return null;
    const transformed = {
      id: doc.id,
      _id: doc.id,
      email: doc.email,
      name: doc.name,
      is_active: doc.is_active,
      status: doc.is_active ? 'subscribed' : 'unsubscribed',
      subscribedAt: doc.subscribed_at
    };
    transformed.save = async function() {
      return NewsletterSubscriber.update({ email: doc.email }, this);
    };
    return transformed;
  }
}

module.exports = NewsletterSubscriber;
