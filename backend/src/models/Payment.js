const { queryOne, queryMany } = require('../database/postgres');

class Payment {
  static async create(data) {
    const q = `INSERT INTO payments (order_id, user_id, amount, currency, status, payment_method, transaction_id, gateway_response)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
    
    // Gateway response stores ALL Mongoose schema properties that don't fit into the Postgres exact schema
    const gatewayResponse = {
      type: data.type,
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      campaign_id: data.campaign_id,
      product_id: data.product_id,
      event_id: data.event_id,
      metadata: data.metadata,
      paystack_reference: data.paystack_reference,
      paystack_data: data.paystack_data,
      receipt_generated: data.receipt_generated,
      receipt_path: data.receipt_path,
      email_sent: data.email_sent
    };

    const r = await queryOne(q, [
      data.order_id || null,
      data.user_id || null,
      data.amount || 0,
      data.currency || 'GHS',
      data.status || 'pending',
      data.payment_method || null,
      data.reference || null, 
      JSON.stringify(gatewayResponse)
    ]);
    return r ? this.transform(r) : null;
  }

  static async findOne(filter = {}) {
    let q = 'SELECT * FROM payments WHERE 1=1';
    let vals = [];
    let pi = 1;

    if (filter.reference) {
       q += ` AND transaction_id = $${pi}`;
       vals.push(filter.reference);
       pi++;
    }
    
    if (filter.paystack_reference) {
       q += ` AND gateway_response->>'paystack_reference' = $${pi}`;
       vals.push(filter.paystack_reference);
       pi++;
    }

    const r = await queryOne(q, vals);
    return r ? this.transform(r) : null;
  }

  static async find(filter = {}) {
    let q = 'SELECT * FROM payments WHERE 1=1';
    let vals = [];
    let pi = 1;

    if (filter.user_id) {
       q += ` AND user_id = $${pi}`;
       vals.push(filter.user_id);
       pi++;
    }
    
    if (filter.status) {
       q += ` AND status = $${pi}`;
       vals.push(filter.status);
       pi++;
    }

    const r = await queryMany(q, vals);
    return r.map(doc => this.transform(doc));
  }

  static async updateById(id, data) {
    const existing = await queryOne('SELECT * FROM payments WHERE id = $1', [id]);
    if (!existing) return null;
    
    const fields = [];
    const vals = [];
    let pi = 1;
    
    if (data.status) { fields.push(`status = $${pi}`); vals.push(data.status); pi++; }
    
    let updatedGateway = { ...existing.gateway_response };
    let jsonModified = false;
    
    [
      'type', 'customer_name', 'customer_email', 'customer_phone', 
      'campaign_id', 'product_id', 'event_id', 'metadata', 
      'paystack_reference', 'paystack_data', 'receipt_generated', 
      'receipt_path', 'email_sent'
    ].forEach(k => {
      if (data[k] !== undefined) {
        updatedGateway[k] = data[k];
        jsonModified = true;
      }
    });

    if (jsonModified) {
      fields.push(`gateway_response = $${pi}`);
      vals.push(JSON.stringify(updatedGateway));
      pi++;
    }

    if (fields.length === 0) return this.transform(existing);

    vals.push(id);
    const q = `UPDATE payments SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${pi} RETURNING *`;
    const result = await queryOne(q, vals);
    return result ? this.transform(result) : null;
  }

  static transform(doc) {
    if (!doc) return null;
    let dr = doc.gateway_response || {};
    if (typeof dr === 'string') dr = JSON.parse(dr);

    const t = {
      id: doc.id,
      _id: doc.id,
      order_id: doc.order_id,
      user_id: doc.user_id,
      amount: parseFloat(doc.amount),
      currency: doc.currency,
      status: doc.status,
      payment_method: doc.payment_method,
      reference: doc.transaction_id,
      transaction_id: doc.transaction_id,

      type: dr.type,
      customer_name: dr.customer_name,
      customer_email: dr.customer_email,
      customer_phone: dr.customer_phone,
      campaign_id: dr.campaign_id,
      product_id: dr.product_id,
      event_id: dr.event_id,
      metadata: dr.metadata,
      paystack_reference: dr.paystack_reference,
      paystack_data: dr.paystack_data,
      receipt_generated: dr.receipt_generated,
      receipt_path: dr.receipt_path,
      email_sent: dr.email_sent,

      created_at: doc.created_at,
      updated_at: doc.updated_at
    };
    t.save = async function() { return Payment.updateById(doc.id, this); };
    return t;
  }
}

module.exports = Payment;

