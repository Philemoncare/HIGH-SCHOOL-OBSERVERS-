const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { authenticate, requireRole } = require('../middleware/auth');

async function populateUsers(orders) {
  const { queryOne } = require('../database/postgres');
  const isArr = Array.isArray(orders);
  const arr = isArr ? orders : [orders];
  for (let o of arr) {
    if (o && o.customer && o.customer.user_id) {
       const u = await queryOne('SELECT first_name, last_name, email FROM users WHERE id = $1', [o.customer.user_id]);
       if (u) {
         o.customer.user_id = {
           _id: u.id,
           username: u.first_name + ' ' + u.last_name,
           email: u.email
         };
       }
    }
  }
  return isArr ? arr : arr[0];
}

// Create new order
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      items, customer, shipping_address, billing_address, shipping_method, payment_method, customer_notes, marketing
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'At least one item is required' });
    if (!customer || !customer.name || !customer.email || !customer.phone) return res.status(400).json({ error: 'Customer info missing' });
    if (!shipping_address || !shipping_address.street_address || !shipping_address.city) return res.status(400).json({ error: 'Shipping address missing' });

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product_id);
      if (!product || product.status === 'inactive') return res.status(400).json({ error: `Product unavailable` });
      const requestedQuantity = parseInt(item.quantity) || 1;
      
      if (product.in_stock === false) {
          return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }

      const itemTotal = product.price * requestedQuantity;
      subtotal += itemTotal;

      orderItems.push({
        product_id: product._id || product.id,
        product_name: product.name,
        quantity: requestedQuantity,
        unit_price: product.price,
        total_price: itemTotal,
        product_image: product.image,
        product_category: product.category
      });
    }

    const orderData = {
      customer: { user_id: req.user._id || req.user.id },
      shipping_address: shipping_address,
      items: orderItems,
      total_amount: subtotal,
      status: 'pending',
      payment_method: payment_method || 'paystack'
    };
    
    let order = await Order.create(orderData);
    
    res.status(201).json({
      success: true,
      order: {
        _id: order.id,
        order_number: order.order_number,
        total_amount: order.total_amount,
        status: order.status,
        payment_status: 'pending'
      }
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

// Get user's orders
router.get('/my-orders', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = { user_id: req.user._id || req.user.id };
    if (status) filter.status = status;

    let orders = await Order.find(filter, { sort: { created_at: -1 }, skip, limit: parseInt(limit) });

    const { queryOne } = require('../database/postgres');
    const totalResult = await queryOne('SELECT COUNT(*) FROM orders WHERE user_id = $1', [filter.user_id]);
    const total = parseInt(totalResult.count);

    res.json({
      success: true,
      orders,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / limit),
        total_orders: total
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order by ID
router.get('/:orderId', authenticate, async (req, res) => {
  try {
    let order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    const uId = req.user._id || req.user.id;
    if (order.user_id !== uId && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order status (admin only)
router.patch('/:orderId/status', authenticate, requireRole(['executive','admin','super_admin']), async (req, res) => {
  try {
    const { status, delivery_notes, tracking_number } = req.body;
    let order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    let updatedOrder = await Order.updateById(req.params.orderId, { status });
    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Get all orders (admin only)
router.get('/', authenticate, requireRole(['executive','admin','super_admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;
    // Search by order_number not supported in simple filter yet

    let orders = await Order.find(filter, { sort: { created_at: -1 }, skip, limit: parseInt(limit) });
    orders = await populateUsers(orders);

    const { queryOne } = require('../database/postgres');
    const totalResult = await queryOne('SELECT COUNT(*) FROM orders');
    const total = parseInt(totalResult.count);

    res.json({
      success: true,
      orders,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / limit),
        total_orders: total
      }
    });

  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order statistics (admin only)
router.get('/stats/overview', authenticate, requireRole(['executive','admin','super_admin']), async (req, res) => {
  try {
    const { queryOne } = require('../database/postgres');
    
    const totalOrdersRes = await queryOne('SELECT COUNT(*) FROM orders');
    const pendingOrdersRes = await queryOne("SELECT COUNT(*) FROM orders WHERE status = 'pending'");
    const completedOrdersRes = await queryOne("SELECT COUNT(*) FROM orders WHERE status = 'delivered'");
    
    // Sum total_amount directly using Postgres
    const totalRevenueRes = await queryOne('SELECT SUM(total_amount) as total FROM orders');

    let recentOrders = await Order.find({}, { sort: { created_at: -1 }, limit: 5 });
    recentOrders = await populateUsers(recentOrders);

    res.json({
      success: true,
      stats: {
        total_orders: parseInt(totalOrdersRes.count),
        pending_orders: parseInt(pendingOrdersRes.count),
        completed_orders: parseInt(completedOrdersRes.count),
        total_revenue: totalRevenueRes.total || 0
      },
      recent_orders: recentOrders
    });

  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ error: 'Failed to fetch order statistics' });
  }
});

module.exports = router; 