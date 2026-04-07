const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const DonationCampaign = require('../models/DonationCampaign');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const receiptService = require('../services/receiptService');
const emailService = require('../services/emailService');
const router = express.Router();

// Initialize Paystack with error handling
let paystack;
try {
  paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY);
} catch (error) {
  console.error('Paystack initialization error:', error);
}

// Test endpoint to check payment system status
router.get('/status', (req, res) => {
  const status = {
    paystack_initialized: !!paystack,
    api_key_configured: !!(process.env.PAYSTACK_SECRET_KEY && !process.env.PAYSTACK_SECRET_KEY.includes('1234567890')),
    api_key: process.env.PAYSTACK_SECRET_KEY ? 'Configured' : 'Not configured',
    frontend_url: process.env.FRONTEND_URL || 'http://localhost:3000',
    status: 'Payment system ready'
  };

  if (!status.paystack_initialized) {
    status.status = 'Paystack not initialized';
  } else if (!status.api_key_configured) {
    status.status = 'API keys not configured';
  }

  res.json(status);
});

// Initialize Paystack payment for donation
router.post('/donations/initialize', async (req, res) => {
  try {
    // Check if Paystack is properly initialized
    if (!paystack) {
      return res.status(500).json({ 
        error: 'Payment system not configured. Please check Paystack API keys.' 
      });
    }

    // Check if API key is configured
    if (!process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY.includes('1234567890')) {
      return res.status(500).json({ 
        error: 'Paystack API keys not configured. Please update your .env file with real Paystack keys from https://dashboard.paystack.com/#/settings/developers' 
      });
    }

    const { 
      campaignId, 
      amount, 
      email, 
      name, 
      phone, 
      message, 
      anonymous 
    } = req.body;

    // Validate required fields
    if (!campaignId || !amount || !email) {
      return res.status(400).json({ 
        error: 'Campaign ID, amount, and email are required' 
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({ 
        error: 'Amount must be greater than 0' 
      });
    }

    // Check if campaign exists and is active
    const campaign = await DonationCampaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (campaign.status !== 'active') {
      return res.status(400).json({ error: 'Campaign is not active' });
    }

    // Create Paystack transaction
    const transaction = await paystack.transaction.initialize({
      amount: Math.round(amount * 100), // Convert to kobo (smallest currency unit)
      email: email,
      reference: `DON_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/donations/verify`,
      metadata: {
        campaign_id: campaignId,
        campaign_title: campaign.title,
        donor_name: anonymous ? 'Anonymous' : name,
        donor_phone: phone,
        donor_message: message,
        anonymous: anonymous,
        type: 'donation'
      }
    });

    if (transaction.status) {
      res.json({
        success: true,
        authorization_url: transaction.data.authorization_url,
        reference: transaction.data.reference,
        access_code: transaction.data.access_code
      });
    } else {
      res.status(400).json({ error: 'Failed to initialize payment' });
    }

  } catch (error) {
    console.error('Payment initialization error:', error);
    
    // Provide more specific error messages
    if (error.message && error.message.includes('Invalid key')) {
      res.status(500).json({ 
        error: 'Paystack configuration error. Please check your API keys in .env file.' 
      });
    } else if (error.message && error.message.includes('network')) {
      res.status(500).json({ 
        error: 'Network error. Please check your internet connection.' 
      });
    } else {
      res.status(500).json({ 
        error: 'Payment initialization failed. Please try again.' 
      });
    }
  }
});

// Verify Paystack payment for donation
router.post('/donations/verify', async (req, res) => {
  try {
    // Check if Paystack is properly initialized
    if (!paystack) {
      return res.status(500).json({ 
        error: 'Payment system not configured. Please check Paystack API keys.' 
      });
    }

    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ error: 'Reference is required' });
    }

    // Verify payment with Paystack
    const verification = await paystack.transaction.verify(reference);

    if (verification.status && verification.data.status === 'success') {
      const { metadata } = verification.data;
      const { campaign_id, amount } = metadata;

      // Update campaign raised amount
      const campaign = await DonationCampaign.findById(campaign_id);
      if (campaign) {
        campaign.raised_amount += parseFloat(amount) / 100; // Convert from kobo
        await campaign.save();

        // Log successful donation
        const donationAmount = amount / 100;
        const donorEmail = verification.data.customer.email;
        const donorName = metadata.donor_name || verification.data.customer.first_name || 'Donor';
        
        // Create payment record
        try {
          await Payment.create({
            reference: reference,
            type: 'donation',
            status: 'success',
            amount: donationAmount,
            currency: 'GHS',
            customer_name: donorName,
            customer_email: donorEmail,
            customer_phone: metadata.donor_phone || null,
            campaign_id: campaign_id,
            paystack_reference: reference,
            paystack_data: verification.data,
            metadata: metadata || {}
          });
          console.log('✅ Payment record created for donation:', reference);
        } catch (paymentError) {
          console.error('⚠️ Failed to create payment record (payment still successful):', paymentError.message);
        }
        
        console.log('Donation successful:', {
          reference,
          campaign_id,
          amount: donationAmount,
          donor_name: donorName,
          donor_email: donorEmail
        });

        // Generate and send receipt
        try {
          const receiptData = {
            reference: reference,
            type: 'donation',
            amount: donationAmount,
            currency: 'GHS',
            customerName: donorName,
            customerEmail: donorEmail,
            customerPhone: metadata.donor_phone || null,
            paymentDate: new Date(verification.data.paid_at || Date.now()),
            details: {
              campaignTitle: campaign.title,
              message: metadata.message || null
            }
          };

          const receiptPath = await receiptService.generateReceipt(receiptData);
          console.log('✅ Receipt generated:', receiptPath);

          // Send receipt via email
          try {
            await emailService.sendPaymentReceipt(
              donorEmail,
              donorName.split(' ')[0] || donorName,
              receiptData,
              receiptPath
            );
            console.log('✅ Receipt email sent to:', donorEmail);
          } catch (emailError) {
            console.error('⚠️ Failed to send receipt email (payment still successful):', emailError.message);
            // Don't fail the payment if email fails
          }
        } catch (receiptError) {
          console.error('⚠️ Failed to generate receipt (payment still successful):', receiptError.message);
          // Don't fail the payment if receipt generation fails
        }

        res.json({
          success: true,
          message: 'Donation processed successfully',
          amount: donationAmount,
          campaign_title: campaign.title,
          new_raised_amount: campaign.raised_amount
        });
      } else {
        res.status(404).json({ error: 'Campaign not found' });
      }
    } else {
      res.status(400).json({ error: 'Payment verification failed' });
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Initialize Paystack payment for shop purchase
// Note: This route doesn't require authentication to allow guest checkout
// Authentication will be verified when creating the order
router.post('/shop/initialize', async (req, res) => {
  try {
    // Check if Paystack is properly initialized
    if (!paystack) {
      return res.status(500).json({ 
        error: 'Payment system not configured. Please check Paystack API keys.' 
      });
    }

    // Check if API key is configured
    if (!process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY.includes('1234567890')) {
      return res.status(500).json({ 
        error: 'Paystack API keys not configured. Please update your .env file with real Paystack keys from https://dashboard.paystack.com/#/settings/developers' 
      });
    }

    const { 
      productId, 
      quantity, 
      amount, 
      email, 
      name, 
      phone, 
      address,
      orderId 
    } = req.body;

    // Validate required fields
    if (!productId || !quantity || !amount || !email) {
      return res.status(400).json({ 
        error: 'Product ID, quantity, amount, and email are required' 
      });
    }

    // Check if product exists and is in stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.status !== 'active') {
      return res.status(400).json({ error: 'Product is not available' });
    }

    // Stock validation: Only check stock if orderId is NOT provided (guest checkout)
    // If orderId is provided, the order was already created and stock was validated/decremented
    if (!orderId) {
      // For guest checkout without order, check stock availability
      // Use same logic as order creation: only check if stock is explicitly managed
      if (product.stock_quantity !== null && product.stock_quantity !== undefined) {
        // Only enforce stock limit if stock is explicitly set AND insufficient
        // Allow 0 stock purchases (for pre-orders, backorders, etc.)
        if (product.stock_quantity > 0 && product.stock_quantity < quantity) {
          return res.status(400).json({ 
            error: `Insufficient stock. Available: ${product.stock_quantity}, Requested: ${quantity}` 
          });
        }
      }
    }
    // If orderId is provided, trust that the order creation already validated stock

    // Generate unique reference
    const reference = `SHOP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create Paystack transaction
    const transaction = await paystack.transaction.initialize({
      amount: Math.round(amount * 100), // Convert to kobo
      email: email,
      reference: reference,
      callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/shop/verify?reference=${reference}`,
      metadata: {
        product_id: productId,
        product_name: product.name,
        quantity: quantity,
        order_id: orderId || null,
        customer_name: name,
        customer_phone: phone,
        customer_address: address,
        type: 'shop_purchase'
      }
    });

    if (transaction.status) {
      res.json({
        success: true,
        authorization_url: transaction.data.authorization_url,
        reference: transaction.data.reference,
        access_code: transaction.data.access_code
      });
    } else {
      res.status(400).json({ error: 'Failed to initialize payment' });
    }

  } catch (error) {
    console.error('Shop payment initialization error:', error);
    res.status(500).json({ error: 'Payment initialization failed' });
  }
});

// Verify Paystack payment for shop purchase
router.post('/shop/verify', async (req, res) => {
  try {
    // Check if Paystack is properly initialized
    if (!paystack) {
      return res.status(500).json({ 
        error: 'Payment system not configured. Please check Paystack API keys.' 
      });
    }

    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ error: 'Reference is required' });
    }

    // Verify payment with Paystack
    console.log(`[Shop Verify] Verifying payment with reference: ${reference}`);
    const verification = await paystack.transaction.verify(reference);
    console.log(`[Shop Verify] Verification response - Status: ${verification.status}, Payment Status: ${verification.data?.status}`);

    if (verification.status && verification.data.status === 'success') {
      const { metadata } = verification.data;
      const { product_id, quantity, order_id } = metadata;

      // Always get product information for receipt generation
      let product = null;
      if (product_id) {
        product = await Product.findById(product_id);
        if (!product) {
          console.error(`Product not found: ${product_id}`);
        }
      }

      // Update product stock ONLY if order_id is NOT provided (guest checkout)
      // If order_id is provided, stock was already decremented when order was created
      if (!order_id && product) {
        // Only decrement stock if stock is explicitly managed
        if (product.stock_quantity !== null && product.stock_quantity !== undefined && product.stock_quantity > 0) {
          const requestedQuantity = parseInt(quantity) || 1;
          const newStock = Math.max(0, product.stock_quantity - requestedQuantity);
          await Product.findByIdAndUpdate(product_id, {
            stock_quantity: newStock
          });
          console.log(`Stock updated for product ${product_id}: ${product.stock_quantity} -> ${newStock}`);
        }
      } else if (order_id) {
        console.log(`Order ${order_id} payment verified - stock already decremented during order creation`);
      }

      // Update order status if order_id is provided
      if (order_id) {
        try {
          const Order = require('../models/Order');
          const order = await Order.findById(order_id);
          if (order) {
            order.payment_status = 'paid';
            order.payment_reference = reference;
            order.payment_date = new Date();
            order.status = 'confirmed';
            await order.save();
            console.log('Order updated:', order_id);
          }
        } catch (orderError) {
          console.error('Error updating order:', orderError);
          // Don't fail the payment if order update fails
        }
      }

      // Log successful purchase
      const purchaseAmount = verification.data.amount / 100;
      const customerEmail = verification.data.customer.email;
      const customerName = metadata.customer_name || verification.data.customer.first_name || 'Customer';
      
      // Create payment record
      try {
        await Payment.create({
          reference: reference,
          type: 'shop',
          status: 'success',
          amount: purchaseAmount,
          currency: 'GHS',
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: metadata.customer_phone || null,
          product_id: product_id,
          order_id: order_id || null,
          paystack_reference: reference,
          paystack_data: verification.data,
          metadata: new Map(Object.entries(metadata || {}))
        });
        console.log('✅ Payment record created for shop purchase:', reference);
      } catch (paymentError) {
        console.error('⚠️ Failed to create payment record (payment still successful):', paymentError.message);
      }
      
      const productName = product ? product.name : (metadata.product_name || 'Product');
      
      console.log('Shop purchase successful:', {
        reference,
        order_id: order_id || 'N/A',
        product_id,
        product_name: productName,
        quantity,
        customer_name: customerName,
        customer_email: customerEmail,
        amount: purchaseAmount
      });

      // Generate and send receipt
      try {
        const receiptData = {
          reference: reference,
          type: 'shop',
          amount: purchaseAmount,
          currency: 'GHS',
          customerName: customerName,
          customerEmail: customerEmail,
          customerPhone: metadata.customer_phone || null,
          paymentDate: new Date(verification.data.paid_at || Date.now()),
          details: {
            productName: productName,
            quantity: quantity,
            orderId: order_id || null
          }
        };

        const receiptPath = await receiptService.generateReceipt(receiptData);
        console.log('✅ Receipt generated:', receiptPath);

        // Send receipt via email
        try {
          await emailService.sendPaymentReceipt(
            customerEmail,
            customerName.split(' ')[0] || customerName,
            receiptData,
            receiptPath
          );
          console.log('✅ Receipt email sent to:', customerEmail);
        } catch (emailError) {
          console.error('⚠️ Failed to send receipt email (payment still successful):', emailError.message);
        }
      } catch (receiptError) {
        console.error('⚠️ Failed to generate receipt (payment still successful):', receiptError.message);
      }

      res.json({
        success: true,
        message: 'Purchase completed successfully',
        reference,
        order_id: order_id || null,
        product_name: productName,
        quantity: quantity,
        new_stock: product ? product.stock_quantity : null,
        amount: purchaseAmount
      });
    } else {
      // Payment not successful or verification failed
      const paymentStatus = verification.data?.status || 'unknown';
      const gatewayResponse = verification.data?.gateway_response || 'No response';
      console.error(`Payment verification failed - Status: ${paymentStatus}, Gateway: ${gatewayResponse}`);
      
      res.status(400).json({ 
        error: 'Payment verification failed',
        details: `Payment status: ${paymentStatus}. ${gatewayResponse}`
      });
    }

  } catch (error) {
    console.error('Shop payment verification error:', error);
    console.error('Error stack:', error.stack);
    
    // Provide more detailed error information
    let errorMessage = 'Payment verification failed';
    if (error.message) {
      errorMessage = error.message;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    res.status(500).json({ 
      error: errorMessage,
      message: error.message || 'An unexpected error occurred during payment verification'
    });
  }
});

// Initialize Paystack payment for event registration
router.post('/events/initialize', async (req, res) => {
  try {
    // Check if Paystack is properly initialized
    if (!paystack) {
      return res.status(500).json({ 
        error: 'Payment system not configured. Please check Paystack API keys.' 
      });
    }

    // Check if API key is configured
    if (!process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY.includes('1234567890')) {
      return res.status(500).json({ 
        error: 'Paystack API keys not configured. Please update your .env file with real Paystack keys from https://dashboard.paystack.com/#/settings/developers' 
      });
    }

    const { 
      eventId, 
      eventTitle, 
      amount, 
      attendee 
    } = req.body;

    // Validate required fields
    if (!eventId || !amount || !attendee.email || !attendee.name) {
      return res.status(400).json({ 
        error: 'Event ID, amount, attendee name, and email are required' 
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({ 
        error: 'Amount must be greater than 0' 
      });
    }

    // TODO: Check if event exists and has available spots
    // For now, we'll proceed with the payment

    // Create Paystack transaction
    const transaction = await paystack.transaction.initialize({
      amount: Math.round(amount * 100), // Convert to kobo
      email: attendee.email,
      reference: `EVENT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/events/verify`,
      metadata: {
        event_id: eventId,
        event_title: eventTitle,
        attendee_name: attendee.name,
        attendee_email: attendee.email,
        attendee_phone: attendee.phone,
        attendee_organization: attendee.organization,
        attendee_position: attendee.position,
        dietary_restrictions: attendee.dietaryRestrictions,
        special_requirements: attendee.specialRequirements,
        type: 'event_registration'
      }
    });

    if (transaction.status) {
      res.json({
        success: true,
        authorization_url: transaction.data.authorization_url,
        reference: transaction.data.reference,
        access_code: transaction.data.access_code
      });
    } else {
      res.status(400).json({ error: 'Failed to initialize payment' });
    }

  } catch (error) {
    console.error('Event payment initialization error:', error);
    
    // Provide more specific error messages
    if (error.message && error.message.includes('Invalid key')) {
      res.status(500).json({ 
        error: 'Paystack configuration error. Please check your API keys in .env file.' 
      });
    } else if (error.message && error.message.includes('network')) {
      res.status(500).json({ 
        error: 'Network error. Please check your internet connection.' 
      });
    } else {
      res.status(500).json({ 
        error: 'Payment initialization failed. Please try again.' 
      });
    }
  }
});

// Verify Paystack payment for event registration
router.post('/events/verify', async (req, res) => {
  try {
    // Check if Paystack is properly initialized
    if (!paystack) {
      return res.status(500).json({ 
        error: 'Payment system not configured. Please check Paystack API keys.' 
      });
    }

    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ error: 'Reference is required' });
    }

    // Verify payment with Paystack
    const verification = await paystack.transaction.verify(reference);

    if (verification.status && verification.data.status === 'success') {
      const { metadata } = verification.data;
      const { event_id, event_title, attendee_name, attendee_email } = metadata;

      // TODO: Update event registration count and create registration record
      // For now, we'll just log the successful registration

      const eventAmount = verification.data.amount / 100;
      
      // Create payment record
      try {
        await Payment.create({
          reference: reference,
          type: 'events',
          status: 'success',
          amount: eventAmount,
          currency: 'GHS',
          customer_name: attendee_name || 'Attendee',
          customer_email: attendee_email,
          customer_phone: metadata.attendee_phone || null,
          event_id: event_id,
          user_id: metadata.user_id || null,
          paystack_reference: reference,
          paystack_data: verification.data,
          metadata: new Map(Object.entries(metadata || {}))
        });
        console.log('✅ Payment record created for event registration:', reference);
      } catch (paymentError) {
        console.error('⚠️ Failed to create payment record (payment still successful):', paymentError.message);
      }
      
      console.log('Event registration successful:', {
        reference,
        event_id,
        event_title,
        attendee_name,
        attendee_email,
        amount: eventAmount
      });

      // Generate and send receipt
      try {
        const receiptData = {
          reference: reference,
          type: 'events',
          amount: eventAmount,
          currency: 'GHS',
          customerName: attendee_name,
          customerEmail: attendee_email,
          customerPhone: metadata.attendee_phone || null,
          paymentDate: new Date(verification.data.paid_at || Date.now()),
          details: {
            eventTitle: event_title,
            eventId: event_id
          }
        };

        const receiptPath = await receiptService.generateReceipt(receiptData);
        console.log('✅ Receipt generated:', receiptPath);

        // Send receipt via email
        try {
          await emailService.sendPaymentReceipt(
            attendee_email,
            attendee_name.split(' ')[0] || attendee_name,
            receiptData,
            receiptPath
          );
          console.log('✅ Receipt email sent to:', attendee_email);
        } catch (emailError) {
          console.error('⚠️ Failed to send receipt email (payment still successful):', emailError.message);
        }
      } catch (receiptError) {
        console.error('⚠️ Failed to generate receipt (payment still successful):', receiptError.message);
      }

      res.json({
        success: true,
        message: 'Event registration successful',
        event_title: event_title,
        attendee_name: attendee_name,
        amount: eventAmount
      });
    } else {
      res.status(400).json({ error: 'Payment verification failed' });
    }

  } catch (error) {
    console.error('Event payment verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Get payment statistics (admin only)
router.get('/stats', authenticate, requireRole(['super_admin', 'executive']), async (req, res) => {
  try {
    // Get total payments count
    const totalPayments = await Payment.countDocuments();
    
    // Get successful payments count
    const successfulPayments = await Payment.countDocuments({ status: 'success' });
    
    // Get failed payments count
    const failedPayments = await Payment.countDocuments({ status: 'failed' });
    
    // Get total amount from successful payments
    const totalAmountResult = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].total : 0;
    
    // Get donation payments count
    const donationPayments = await Payment.countDocuments({ 
      type: 'donation', 
      status: 'success' 
    });
    
    // Get shop payments count
    const shopPayments = await Payment.countDocuments({ 
      type: 'shop', 
      status: 'success' 
    });
    
    // Get event payments count
    const eventPayments = await Payment.countDocuments({ 
      type: 'events', 
      status: 'success' 
    });
    
    // Get membership payments count
    const membershipPayments = await Payment.countDocuments({ 
      type: 'membership', 
      status: 'success' 
    });

    const stats = {
      totalPayments,
      totalAmount,
      successfulPayments,
      failedPayments,
      donationPayments,
      shopPayments,
      eventPayments,
      membershipPayments
    };

    res.json(stats);

  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({ error: 'Failed to fetch payment statistics' });
  }
});

// Get payment history (admin only)
router.get('/history', authenticate, requireRole(['super_admin', 'executive']), async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, search, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = {};
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { reference: { $regex: search, $options: 'i' } },
        { customer_email: { $regex: search, $options: 'i' } },
        { customer_name: { $regex: search, $options: 'i' } }
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      query.created_at = {};
      if (startDate) {
        query.created_at.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include entire end date
        query.created_at.$lte = end;
      }
    }

    // Get payments with pagination
    const payments = await Payment.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: Math.ceil(total / parseInt(limit)),
        totalItems: total
      }
    });

  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

// Initialize Paystack payment for membership
router.post('/membership/initialize', async (req, res) => {
  try {
    // Check if Paystack is properly initialized
    if (!paystack) {
      return res.status(500).json({ 
        error: 'Payment system not configured. Please check Paystack API keys.' 
      });
    }

    // Check if API key is configured
    if (!process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY.includes('1234567890')) {
      return res.status(500).json({ 
        error: 'Paystack API keys not configured. Please update your .env file with real Paystack keys from https://dashboard.paystack.com/#/settings/developers' 
      });
    }

    const { membershipType, amount, email, name, phone, address, userId } = req.body;

    if (!membershipType || !amount || !email || !name) {
      return res.status(400).json({ error: 'Missing required fields: membershipType, amount, email, and name are required' });
    }

    if (parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    // Generate unique reference
    const reference = `MEMBERSHIP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Prepare metadata
    const metadata = {
      membershipType,
      userId: userId || null,
      memberName: name,
      memberEmail: email,
      memberPhone: phone || null,
      address: address || null
    };

    // Initialize Paystack payment
    const paymentData = {
      email: email,
      amount: Math.round(parseFloat(amount) * 100), // Convert to kobo (smallest currency unit)
      currency: 'GHS',
      reference: reference,
      metadata: metadata,
      callback_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-verification?type=membership&reference=${reference}`,
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
    };

    console.log('Initializing membership payment:', {
      membershipType,
      amount: paymentData.amount,
      email,
      reference
    });

    const response = await paystack.transaction.initialize(paymentData);

    if (response.status && response.data) {
      console.log('Membership payment initialized successfully:', reference);
      
      res.json({
        success: true,
        authorization_url: response.data.authorization_url,
        access_code: response.data.access_code,
        reference: reference
      });
    } else {
      throw new Error('Failed to initialize payment with Paystack');
    }

  } catch (error) {
    console.error('Membership payment initialization error:', error);
    res.status(500).json({ 
      error: error.message || 'Payment initialization failed. Please try again.' 
    });
  }
});

// Verify Paystack payment for membership
router.post('/membership/verify', async (req, res) => {
  try {
    // Check if Paystack is properly initialized
    if (!paystack) {
      return res.status(500).json({ 
        error: 'Payment system not configured. Please check Paystack API keys.' 
      });
    }

    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ error: 'Reference is required' });
    }

    // Verify payment with Paystack
    const verification = await paystack.transaction.verify(reference);

    if (verification.status && verification.data.status === 'success') {
      const { metadata } = verification.data;
      const { membershipType, userId, memberName, memberEmail } = metadata;

      const membershipAmount = verification.data.amount / 100;
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month membership
      
      // Create payment record
      try {
        await Payment.create({
          reference: reference,
          type: 'membership',
          status: 'success',
          amount: membershipAmount,
          currency: 'GHS',
          customer_name: memberName || 'Member',
          customer_email: memberEmail,
          customer_phone: metadata.memberPhone || null,
          user_id: userId || null,
          paystack_reference: reference,
          paystack_data: verification.data,
          metadata: new Map(Object.entries(metadata || {}))
        });
        console.log('✅ Payment record created for membership:', reference);
      } catch (paymentError) {
        console.error('⚠️ Failed to create payment record (payment still successful):', paymentError.message);
      }
      
      console.log('Membership payment successful:', {
        reference,
        membershipType,
        userId,
        memberName,
        memberEmail,
        amount: membershipAmount
      });

      // If user is logged in, update their membership
      if (userId) {
        try {
          const User = require('../models/User');
          const user = await User.findById(userId);
          if (user) {
            // Update user membership
            user.membership_type = membershipType;
            user.membership_status = 'active';
            user.membership_payment_date = new Date();
            user.membership_expiry_date = expiryDate;
            await user.save();
            console.log('User membership updated:', userId);
          }
        } catch (userError) {
          console.error('Error updating user membership:', userError);
          // Don't fail the payment if user update fails
        }
      }

      // Generate and send receipt
      try {
        const receiptData = {
          reference: reference,
          type: 'membership',
          amount: membershipAmount,
          currency: 'GHS',
          customerName: memberName,
          customerEmail: memberEmail,
          customerPhone: metadata.memberPhone || null,
          paymentDate: new Date(verification.data.paid_at || Date.now()),
          details: {
            membershipType: membershipType,
            expiryDate: expiryDate
          }
        };

        const receiptPath = await receiptService.generateReceipt(receiptData);
        console.log('✅ Receipt generated:', receiptPath);

        // Send receipt via email
        try {
          await emailService.sendPaymentReceipt(
            memberEmail,
            memberName.split(' ')[0] || memberName,
            receiptData,
            receiptPath
          );
          console.log('✅ Receipt email sent to:', memberEmail);
        } catch (emailError) {
          console.error('⚠️ Failed to send receipt email (payment still successful):', emailError.message);
        }
      } catch (receiptError) {
        console.error('⚠️ Failed to generate receipt (payment still successful):', receiptError.message);
      }

      res.json({
        success: true,
        message: 'Membership payment successful',
        membershipType: membershipType,
        memberName: memberName,
        amount: membershipAmount
      });
    } else {
      res.status(400).json({ error: 'Payment verification failed' });
    }

  } catch (error) {
    console.error('Membership payment verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Export payments (admin only) - Advanced download with multiple formats
router.get('/export', authenticate, requireRole(['super_admin', 'executive']), async (req, res) => {
  try {
    const { format = 'csv', type, status, search, startDate, endDate } = req.query;

    // Build query (same as history endpoint)
    const query = {};
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { reference: { $regex: search, $options: 'i' } },
        { customer_email: { $regex: search, $options: 'i' } },
        { customer_name: { $regex: search, $options: 'i' } }
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      query.created_at = {};
      if (startDate) {
        query.created_at.$gte = new Date(startDate);
      }
      if (endDate) {
        query.created_at.$lte = new Date(endDate);
      }
    }

    // Get all payments matching the query (no pagination for export)
    const payments = await Payment.find(query)
      .sort({ created_at: -1 })
      .lean();

    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Reference',
        'Type',
        'Status',
        'Amount',
        'Currency',
        'Customer Name',
        'Customer Email',
        'Customer Phone',
        'Payment Date',
        'Paystack Reference',
        'Campaign ID',
        'Product ID',
        'Event ID',
        'Order ID'
      ];

      const csvRows = [
        headers.join(','),
        ...payments.map(payment => [
          `"${payment.reference || ''}"`,
          `"${payment.type || ''}"`,
          `"${payment.status || ''}"`,
          payment.amount || 0,
          `"${payment.currency || 'GHS'}"`,
          `"${(payment.customer_name || '').replace(/"/g, '""')}"`,
          `"${(payment.customer_email || '').replace(/"/g, '""')}"`,
          `"${(payment.customer_phone || '').replace(/"/g, '""')}"`,
          `"${new Date(payment.created_at).toISOString()}"`,
          `"${payment.paystack_reference || ''}"`,
          `"${payment.campaign_id || ''}"`,
          `"${payment.product_id || ''}"`,
          `"${payment.event_id || ''}"`,
          `"${payment.order_id || ''}"`
        ].join(','))
      ];

      const csvContent = csvRows.join('\n');
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="payments_export_${Date.now()}.csv"`);
      res.send('\ufeff' + csvContent); // BOM for Excel UTF-8 support
      
    } else if (format === 'json') {
      // Generate JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="payments_export_${Date.now()}.json"`);
      res.json({
        exportDate: new Date().toISOString(),
        totalRecords: payments.length,
        filters: { type, status, search, startDate, endDate },
        payments
      });
      
    } else if (format === 'pdf') {
      // Generate PDF report
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="payments_report_${Date.now()}.pdf"`);
      
      doc.pipe(res);
      
      // Header
      doc.fontSize(20)
         .fillColor('#d32f2f')
         .text('HSO Platform - Payments Report', { align: 'center' });
      
      doc.fontSize(12)
         .fillColor('#666666')
         .text('High School Observer', { align: 'center' })
         .moveDown();
      
      doc.fontSize(10)
         .fillColor('#000000')
         .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' })
         .text(`Total Records: ${payments.length}`, { align: 'center' })
         .moveDown(2);
      
      // Summary
      const totalAmount = payments
        .filter(p => p.status === 'success')
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      
      doc.fontSize(14)
         .fillColor('#000000')
         .text('Summary', { underline: true })
         .moveDown(0.5);
      
      doc.fontSize(10)
         .fillColor('#333333')
         .text(`Total Payments: ${payments.length}`)
         .text(`Successful Payments: ${payments.filter(p => p.status === 'success').length}`)
         .text(`Total Amount: ₵${totalAmount.toLocaleString()}`)
         .moveDown();
      
      // Payments table
      doc.fontSize(12)
         .fillColor('#000000')
         .text('Payment Details', { underline: true })
         .moveDown(0.5);
      
      let y = doc.y;
      const tableTop = y;
      const itemHeight = 60;
      const pageHeight = doc.page.height - 100;
      
      payments.forEach((payment, index) => {
        if (y + itemHeight > pageHeight) {
          doc.addPage();
          y = 50;
        }
        
        doc.fontSize(9)
           .fillColor('#000000')
           .text(`Reference: ${payment.reference}`, 50, y)
           .text(`Type: ${payment.type} | Status: ${payment.status}`, 50, y + 12)
           .text(`Amount: ₵${payment.amount} | Customer: ${payment.customer_name}`, 50, y + 24)
           .text(`Email: ${payment.customer_email} | Date: ${new Date(payment.created_at).toLocaleString()}`, 50, y + 36);
        
        y += itemHeight;
      });
      
      doc.end();
      
    } else {
      return res.status(400).json({ error: 'Invalid format. Supported formats: csv, json, pdf' });
    }

  } catch (error) {
    console.error('Error exporting payments:', error);
    res.status(500).json({ error: 'Failed to export payments' });
  }
});

module.exports = router; 