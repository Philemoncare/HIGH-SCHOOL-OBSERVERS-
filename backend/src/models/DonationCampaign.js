const { queryOne, queryMany, transaction } = require('../database/postgres');

class DonationCampaign {
  static async create(campaignData) {
    const {
      title,
      description,
      image,
      goal_amount,
      raised_amount = 0,
      beneficiary,
      category = 'other',
      status = 'active',
      featured = false,
      urgent = false,
      start_date = new Date(),
      end_date,
      created_by
    } = campaignData;

    const result = await queryOne(
      `INSERT INTO donation_campaigns (
        title, description, image, goal_amount, raised_amount, beneficiary,
        category, status, featured, urgent, start_date, end_date, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        title, description, image, goal_amount, raised_amount, beneficiary,
        category, status, featured, urgent, start_date, end_date, created_by
      ]
    );

    return this.transformCampaign(result);
  }

  static async findById(id) {
    const result = await queryOne('SELECT * FROM donation_campaigns WHERE id = $1', [id]);
    return result ? this.transformCampaign(result) : null;
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

    const query = `UPDATE donation_campaigns SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await queryOne(query, values);
    
    return result ? this.transformCampaign(result) : null;
  }

  static async deleteById(id) {
    const result = await queryOne('DELETE FROM donation_campaigns WHERE id = $1 RETURNING *', [id]);
    return result ? this.transformCampaign(result) : null;
  }

  static async find(filter = {}, options = {}) {
    let query = 'SELECT * FROM donation_campaigns WHERE 1=1';
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
    return results.map(campaign => this.transformCampaign(campaign));
  }

  static async findActive(limit = 10) {
    const results = await queryMany(
      'SELECT * FROM donation_campaigns WHERE status = $1 ORDER BY created_at DESC LIMIT $2',
      ['active', limit]
    );
    return results.map(campaign => this.transformCampaign(campaign));
  }

  static async findFeatured(limit = 5) {
    const results = await queryMany(
      'SELECT * FROM donation_campaigns WHERE featured = $1 AND status = $2 ORDER BY created_at DESC LIMIT $3',
      [true, 'active', limit]
    );
    return results.map(campaign => this.transformCampaign(campaign));
  }

  static async findByCategory(category, limit = 10) {
    const results = await queryMany(
      'SELECT * FROM donation_campaigns WHERE category = $1 AND status = $2 ORDER BY created_at DESC LIMIT $3',
      [category, 'active', limit]
    );
    return results.map(campaign => this.transformCampaign(campaign));
  }

  static async updateRaisedAmount(id, amount) {
    const result = await queryOne(
      'UPDATE donation_campaigns SET raised_amount = raised_amount + $1 WHERE id = $2 RETURNING *',
      [amount, id]
    );
    return result ? this.transformCampaign(result) : null;
  }

  static async count(filter = {}) {
    let query = 'SELECT COUNT(*) FROM donation_campaigns WHERE 1=1';
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

  static transformCampaign(campaign) {
    if (!campaign) return null;
    
    return {
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      image: campaign.image,
      goal_amount: parseFloat(campaign.goal_amount),
      raised_amount: parseFloat(campaign.raised_amount),
      beneficiary: campaign.beneficiary,
      category: campaign.category,
      status: campaign.status,
      featured: campaign.featured,
      urgent: campaign.urgent,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      created_by: campaign.created_by,
      created_at: campaign.created_at,
      updated_at: campaign.updated_at
    };
  }
}

module.exports = DonationCampaign; 