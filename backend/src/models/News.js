const { queryOne, queryMany, transaction } = require('../database/postgres');

class News {
  static async create(newsData) {
    const {
      title,
      excerpt,
      content,
      category = 'education',
      author,
      slug,
      image,
      tags = [],
      status = 'draft',
      featured = false,
      view_count = 0,
      created_by,
      published_at
    } = newsData;

    // Set published_at if status is published and not already set
    const finalPublishedAt = status === 'published' && !published_at ? new Date() : published_at;

    const result = await queryOne(
      `INSERT INTO news (
        title, excerpt, content, category, author, slug, image, tags,
        status, featured, view_count, created_by, published_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        title, excerpt, content, category, author, slug, image, tags,
        status, featured, view_count, created_by, finalPublishedAt
      ]
    );

    return this.transformNews(result);
  }

  static async findById(id) {
    const result = await queryOne('SELECT * FROM news WHERE id = $1', [id]);
    return result ? this.transformNews(result) : null;
  }

  static async findBySlug(slug) {
    const result = await queryOne('SELECT * FROM news WHERE slug = $1', [slug]);
    return result ? this.transformNews(result) : null;
  }

  static async updateById(id, updateData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (key === 'tags') {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
      } else {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
      }
      paramIndex++;
    }

    // Auto-set published_at when status changes to published
    if (updateData.status === 'published' && !updateData.published_at) {
      fields.push(`published_at = CURRENT_TIMESTAMP`);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE news SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await queryOne(query, values);
    
    return result ? this.transformNews(result) : null;
  }

  static async deleteById(id) {
    const result = await queryOne('DELETE FROM news WHERE id = $1 RETURNING *', [id]);
    return result ? this.transformNews(result) : null;
  }

  static async find(filter = {}, options = {}) {
    let query = 'SELECT * FROM news WHERE 1=1';
    const values = [];
    let paramIndex = 1;

    // Handle MongoDB style $or
    if (filter.$or) {
      const orConditions = [];
      for (const condition of filter.$or) {
        for (const [key, value] of Object.entries(condition)) {
          if (value && value.$regex) {
            orConditions.push(`${key} ILIKE $${paramIndex}`);
            values.push(`%${value.$regex}%`);
            paramIndex++;
          } else {
            orConditions.push(`${key} = $${paramIndex}`);
            values.push(value);
            paramIndex++;
          }
        }
      }
      if (orConditions.length > 0) {
        query += ` AND (${orConditions.join(' OR ')})`;
      }
      delete filter.$or;
    }

    // Build WHERE clause
    for (const [key, value] of Object.entries(filter)) {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          if (value.$exists !== undefined || value.$ne !== undefined) {
            if (value.$exists === true || value.$ne === null) {
              query += ` AND ${key} IS NOT NULL`;
            } else {
              query += ` AND ${key} IS NULL`;
            }
          } else if (value.$regex) {
            query += ` AND ${key} ILIKE $${paramIndex}`;
            values.push(`%${value.$regex}%`);
            paramIndex++;
          }
        } else {
          query += ` AND ${key} = $${paramIndex}`;
          values.push(value);
          paramIndex++;
        }
      }
    }

    // Add sorting
    if (options.sort) {
      const sortField = Object.keys(options.sort)[0];
      const sortOrder = options.sort[sortField] === -1 ? 'DESC' : 'ASC';
      query += ` ORDER BY ${sortField} ${sortOrder}`;
    } else {
      query += ' ORDER BY created_at DESC';
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
    return results.map(news => this.transformNews(news));
  }

  static async findPublished(limit = 10) {
    const results = await queryMany(
      'SELECT * FROM news WHERE status = $1 ORDER BY published_at DESC LIMIT $2',
      ['published', limit]
    );
    return results.map(news => this.transformNews(news));
  }

  static async findFeatured(limit = 5) {
    const results = await queryMany(
      'SELECT * FROM news WHERE featured = $1 AND status = $2 ORDER BY published_at DESC LIMIT $3',
      [true, 'published', limit]
    );
    return results.map(news => this.transformNews(news));
  }

  static async findByCategory(category, limit = 10) {
    const results = await queryMany(
      'SELECT * FROM news WHERE category = $1 AND status = $2 ORDER BY published_at DESC LIMIT $3',
      [category, 'published', limit]
    );
    return results.map(news => this.transformNews(news));
  }

  static async incrementViewCount(id) {
    const result = await queryOne(
      'UPDATE news SET view_count = view_count + 1 WHERE id = $1 RETURNING *',
      [id]
    );
    return result ? this.transformNews(result) : null;
  }

  static async count(filter = {}) {
    let query = 'SELECT COUNT(*) FROM news WHERE 1=1';
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

  static transformNews(news) {
    if (!news) return null;
    
    return {
      id: news.id,
      title: news.title,
      excerpt: news.excerpt,
      content: news.content,
      category: news.category,
      author: news.author,
      slug: news.slug,
      image: news.image,
      tags: news.tags || [],
      status: news.status,
      featured: news.featured,
      view_count: news.view_count,
      created_by: news.created_by,
      created_at: news.created_at,
      updated_at: news.updated_at,
      published_at: news.published_at
    };
  }
}

module.exports = News; 