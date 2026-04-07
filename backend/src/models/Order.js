const { queryOne, queryMany } = require('../database/postgres');

class Order {
  static async create(data) {
    const q = `INSERT INTO orders (order_number, user_id, total_amount, status, shipping_address, items, payment_id)
               VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
               
    // Generate order number if not provided
    let order_number = data.order_number;
    if (!order_number) {
       const d = new Date();
       const ym = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
       const r = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
       order_number = `HSO-${ym}-${Date.now().toString().slice(-6)}-${r}`;
    }

    const r = await queryOne(q, [
      order_number,
      data.customer?.user_id || data.user_id || null, // from nested Mongoose schema
      data.total_amount || 0,
      data.status || 'pending',
      JSON.stringify(data.shipping_address || {}),
      JSON.stringify(data.items || []),
      data.payment_id || null
    ]);
    return r ? this.transform(r) : null;
  }

  static async find(filter = {}, options = {}) {
     let q = 'SELECT * FROM orders WHERE 1=1';
     let vals = [];
     let pi = 1;
     
     if (filter.user_id) { 
        q += ` AND user_id = $${pi}`; 
        vals.push(filter.user_id); 
        pi++; 
     }
     
     if (filter['customer.user_id']) {
        q += ` AND user_id = $${pi}`; 
        vals.push(filter['customer.user_id']); 
        pi++; 
     }
     
     if (filter.status) { 
        q += ` AND status = $${pi}`; 
        vals.push(filter.status); 
        pi++; 
     }
     
     if (options.sort) {
        q += ' ORDER BY created_at DESC';
     } else {
        q += ' ORDER BY created_at DESC';
     }
     
     const results = await queryMany(q, vals);
     return results.map(r => this.transform(r));
  }

  static async findById(id) {
    if(!id) return null;
    const r = await queryOne('SELECT * FROM orders WHERE id = $1', [id]);
    return r ? this.transform(r) : null;
  }
  
  static async updateById(id, data) {
    const fields = [];
    const vals = [];
    let pi = 1;
    
    if (data.status) { fields.push(`status = $${pi}`); vals.push(data.status); pi++; }
    
    if (fields.length === 0) return this.findById(id);

    vals.push(id);
    const q = `UPDATE orders SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${pi} RETURNING *`;
    const result = await queryOne(q, vals);
    return result ? this.transform(result) : null;
  }

  static async deleteById(id) {
    const result = await queryOne('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);
    return result ? this.transform(result) : null;
  }

  static transform(doc) {
     if(!doc) return null;
     
     let items = doc.items || [];
     if(typeof items === 'string') items = JSON.parse(items);
     
     let shipping = doc.shipping_address || {};
     if(typeof shipping === 'string') shipping = JSON.parse(shipping);

     const t = {
       id: doc.id,
       _id: doc.id,
       order_number: doc.order_number,
       user_id: doc.user_id,
       customer: { user_id: doc.user_id },
       total_amount: parseFloat(doc.total_amount),
       status: doc.status,
       shipping_address: shipping,
       items: items,
       payment_id: doc.payment_id,
       created_at: doc.created_at,
       updated_at: doc.updated_at
     };
     t.save = async function() { return Order.updateById(doc.id, this); };
     return t;
  }
}

module.exports = Order; 