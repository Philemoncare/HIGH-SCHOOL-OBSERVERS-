const express = require('express');
const mongoose = require('mongoose');
const { authenticate, requireRole } = require('../middleware/auth');
const Product = require('../models/Product');
const router = express.Router();

// Helper function to check database connection
const checkDatabaseConnection = () => {
  const state = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (state === 1) {
    return true;
  }
  console.warn(`[Shop] Database connection state: ${state} (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)`);
  return false;
};

// Health check endpoint for shop
router.get('/public/health', async (req, res) => {
  try {
    const dbConnected = checkDatabaseConnection();
    let productCount = 0;
    let errorDetails = null;
    
    if (dbConnected) {
      try {
        productCount = await Product.countDocuments().exec();
      } catch (countError) {
        errorDetails = {
          message: countError.message,
          name: countError.name,
          code: countError.code
        };
      }
    }
    
    res.json({
      success: true,
      database: {
        connected: dbConnected,
        state: mongoose.connection.readyState,
        stateName: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
        productCount: productCount,
        error: errorDetails
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      database: {
        connected: false,
        state: mongoose.connection.readyState,
        stateName: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown'
      },
      timestamp: new Date().toISOString()
    });
  }
});

// Get all products (admin)
router.get('/products', authenticate, requireRole(['super_admin', 'executive']), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const category = req.query.category;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }

    // Get products with pagination
    const products = await Product.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .populate('created_by', 'first_name last_name');

    // Get total count
    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get shop statistics
router.get('/stats/overview', authenticate, requireRole(['super_admin', 'executive']), async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ status: 'active' });
    const outOfStockProducts = await Product.countDocuments({ status: 'out_of_stock' });
    const featuredProducts = await Product.countDocuments({ featured: true });

    // TODO: Add sales and revenue tracking when order system is implemented
    const totalSales = 0;
    const totalRevenue = 0;

    res.json({
      totalProducts,
      activeProducts,
      outOfStockProducts,
      featuredProducts,
      totalSales,
      totalRevenue
    });
  } catch (error) {
    console.error('Error fetching shop stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new product
router.post('/products', authenticate, requireRole(['super_admin', 'executive']), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      original_price,
      stock_quantity,
      category,
      status,
      featured,
      image,
      sku,
      weight,
      dimensions,
      tags
    } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Product name is required' });
    }
    
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Product description is required' });
    }
    
    if (!price || isNaN(price) || parseFloat(price) <= 0) {
      return res.status(400).json({ error: 'Valid price is required' });
    }

    // Check if SKU already exists (only if SKU is provided)
    if (sku && sku.trim()) {
      const existingProduct = await Product.findOne({ sku: sku.trim() });
      if (existingProduct) {
        return res.status(400).json({ error: 'SKU already exists' });
      }
    }

    // Prepare product data, only including fields that have values
    const productData = {
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      stock_quantity: stock_quantity ? parseInt(stock_quantity) : 0,
      category: category || 'books',
      status: status || 'active',
      featured: featured || false,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(t => t) : []),
      created_by: req.user._id
    };
    
    // Add optional fields only if they have values
    if (original_price && !isNaN(original_price) && parseFloat(original_price) > 0) {
      productData.original_price = parseFloat(original_price);
    }
    
    if (image && image.trim()) {
      productData.image = image.trim();
    }
    
    if (sku && sku.trim()) {
      productData.sku = sku.trim();
    }
    
    if (weight && !isNaN(weight) && parseFloat(weight) >= 0) {
      productData.weight = parseFloat(weight);
    }
    
    if (dimensions && dimensions.trim()) {
      productData.dimensions = dimensions.trim();
    }

    const product = new Product(productData);

    await product.save();

    res.status(201).json({ 
      message: 'Product created successfully', 
      product 
    });
  } catch (error) {
    console.error('Error creating product:', error);
    console.error('Error stack:', error.stack);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      console.error('Validation errors:', JSON.stringify(errors, null, 2));
      const errorMessages = errors.map(e => `${e.field}: ${e.message}`).join(', ');
      return res.status(400).json({ 
        error: 'Validation error', 
        details: errorMessages,
        fields: errors.map(e => e.field)
      });
    }
    
    // Handle duplicate key errors (e.g., SKU)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        error: `${field} already exists`,
        details: `A product with this ${field} already exists`
      });
    }
    
    // Return detailed error message
    res.status(500).json({ 
      error: 'Failed to create product',
      details: error.message || 'Unknown error occurred'
    });
  }
});

// Get single product
router.get('/products/:id', authenticate, requireRole(['super_admin', 'executive']), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('created_by', 'first_name last_name');
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update product
router.put('/products/:id', authenticate, requireRole(['super_admin', 'executive']), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      original_price,
      stock_quantity,
      category,
      status,
      featured,
      image,
      sku,
      weight,
      dimensions,
      tags
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if SKU already exists (if changed)
    if (sku && sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku });
      if (existingProduct) {
        return res.status(400).json({ error: 'SKU already exists' });
      }
    }

    // Update fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.original_price = original_price !== undefined ? original_price : product.original_price;
    product.stock_quantity = stock_quantity !== undefined ? stock_quantity : product.stock_quantity;
    product.category = category || product.category;
    product.status = status || product.status;
    product.featured = featured !== undefined ? featured : product.featured;
    product.image = image !== undefined ? image : product.image;
    product.sku = sku !== undefined ? sku : product.sku;
    product.weight = weight !== undefined ? weight : product.weight;
    product.dimensions = dimensions !== undefined ? dimensions : product.dimensions;
    product.tags = tags || product.tags;

    await product.save();

    res.json({ 
      message: 'Product updated successfully', 
      product 
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete product
router.delete('/products/:id', authenticate, requireRole(['super_admin', 'executive']), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle product status
router.patch('/products/:id/toggle-status', authenticate, requireRole(['super_admin', 'executive']), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Toggle between active and inactive
    product.status = product.status === 'active' ? 'inactive' : 'active';
    await product.save();

    res.json({ 
      message: 'Product status updated', 
      product 
    });
  } catch (error) {
    console.error('Error toggling product status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle featured status
router.patch('/products/:id/toggle-featured', authenticate, requireRole(['super_admin', 'executive']), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    product.featured = !product.featured;
    await product.save();

    res.json({ 
      message: 'Product featured status updated', 
      product 
    });
  } catch (error) {
    console.error('Error toggling product featured status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Public routes for frontend shop
router.get('/public/products', async (req, res) => {
  try {
    // Check database connection first
    const dbConnected = checkDatabaseConnection();
    if (!dbConnected) {
      console.error('[Shop Public Products] Database not connected. State:', mongoose.connection.readyState);
      return res.status(503).json({
        success: false,
        error: 'Database connection not available',
        message: 'The database is not connected. Please ensure MongoDB is running and the backend server has connected to it.',
        products: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          pages: 0
        }
      });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 12));
    const search = req.query.search;
    const category = req.query.category;
    const skip = Math.max(0, (page - 1) * limit);

    // Build query - start with simplest possible
    let query = {};
    
    // Add status filter if it exists in the schema
    query.status = 'active';
    
    // Add search if provided
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex }
      ];
    }
    
    // Add category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Simple sort - always works
    const sortObj = { _id: -1 };

    // Execute query with timeout
    let products = [];
    let total = 0;
    
    try {
      // Set a timeout for the query
      const queryPromise = Product.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 10000)
      );
      
      products = await Promise.race([queryPromise, timeoutPromise]);
      products = Array.isArray(products) ? products : [];
      
      console.log(`[Shop Public Products] Successfully fetched ${products.length} products`);
    } catch (findError) {
      console.error('[Shop Public Products] Find error:', findError.message);
      console.error('[Shop Public Products] Error type:', findError.name);
      
      // If status filter causes issues, try without it
      if (findError.message?.includes('status') || findError.code === 2) {
        try {
          delete query.status;
          products = await Product.find(query)
            .sort(sortObj)
            .skip(skip)
            .limit(limit)
            .lean()
            .exec();
          products = Array.isArray(products) ? products : [];
          console.log('[Shop Public Products] Retry without status filter succeeded');
        } catch (retryError) {
          console.error('[Shop Public Products] Retry also failed:', retryError.message);
          products = [];
        }
      } else {
        products = [];
      }
    }

    // Get total count
    try {
      total = await Product.countDocuments(query).exec();
      total = isNaN(total) ? 0 : Math.max(0, total);
    } catch (countError) {
      console.error('[Shop Public Products] Count error:', countError.message);
      total = products.length;
    }

    const pages = limit > 0 ? Math.ceil(total / limit) : 0;

    res.json({
      success: true,
      products: products,
      pagination: {
        page: page,
        limit: limit,
        total: total,
        pages: pages
      }
    });
  } catch (error) {
    console.error('[Shop Public Products] Unexpected error:', error);
    console.error('[Shop Public Products] Full error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    });
    
    const errorMessage = error.message || 'Failed to fetch products';
    const isConnectionError = error.name === 'MongoServerError' || 
                              error.name === 'MongooseError' ||
                              error.message?.toLowerCase().includes('connection') ||
                              error.message?.toLowerCase().includes('timeout') ||
                              error.message?.toLowerCase().includes('buffering');
    
    res.status(isConnectionError ? 503 : 500).json({ 
      success: false,
      error: errorMessage,
      message: isConnectionError 
        ? 'Database connection error. Please ensure MongoDB is running and the backend server is connected.'
        : 'An error occurred while fetching products. Please try again later.',
      products: [],
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        pages: 0
      }
    });
  }
});

// Get single public product
router.get('/public/products/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ 
      _id: req.params.id, 
      status: 'active' 
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Error fetching public product:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 