const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const Product = require('../models/Product');
const router = express.Router();

/** Returns true if DB is reachable (ping PostgreSQL). */
async function isDbReachable() {
  try {
    const { queryOne } = require('../database/postgres');
    await queryOne('SELECT 1');
    return true;
  } catch (_) {
    return false;
  }
}

// Health check endpoint for shop
router.get('/public/health', async (req, res) => {
  try {
    const dbConnected = await isDbReachable();
    let productCount = 0;
    let errorDetails = null;
    
    if (dbConnected) {
      try {
        productCount = await Product.count();
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
        connected: false
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
    const skip = (page - 1) * limit;

    const filter = {};
    if (category && category !== 'all') filter.category = category;

    const products = await Product.findPaginated({
      filter,
      search,
      sort: { created_at: -1 },
      skip,
      limit
    });

    const total = await Product.count(filter, { search });

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
    const totalProducts = await Product.count();
    const inStockProducts = await Product.count({ in_stock: true });
    const outOfStockProducts = await Product.count({ in_stock: false });
    const featuredProducts = await Product.count({ featured: true });

    // TODO: Add sales and revenue tracking when order system is implemented
    const totalSales = 0;
    const totalRevenue = 0;

    res.json({
      totalProducts,
      inStockProducts,
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
      category,
      featured,
      image,
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

    // Prepare product data, only including fields supported by PostgreSQL schema
    const productData = {
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category: category || 'books',
      featured: featured || false,
      image: image && image.trim() ? image.trim() : null,
      // Keep compatibility with old UI that sends status
      in_stock: req.body.status ? req.body.status === 'active' : true,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [])
    };
    
    const product = await Product.create(productData);

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
    const product = await Product.findById(req.params.id);
    
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
      category,
      featured,
      image,
      tags
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updated = await Product.updateById(req.params.id, {
      name: name !== undefined ? name : product.name,
      description: description !== undefined ? description : product.description,
      price: price !== undefined ? price : product.price,
      category: category !== undefined ? category : product.category,
      featured: featured !== undefined ? featured : product.featured,
      image: image !== undefined ? image : product.image,
      in_stock: req.body.status ? req.body.status === 'active' : product.in_stock,
      tags: tags !== undefined ? tags : product.tags
    });

    res.json({ 
      message: 'Product updated successfully', 
      product: updated 
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

    const updated = await Product.updateById(req.params.id, { in_stock: !product.in_stock });

    res.json({ 
      message: 'Product status updated', 
      product: updated 
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

    const updated = await Product.updateById(req.params.id, { featured: !product.featured });

    res.json({ 
      message: 'Product featured status updated', 
      product: updated 
    });
  } catch (error) {
    console.error('Error toggling product featured status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Public routes for frontend shop
router.get('/public/products', async (req, res) => {
  try {
    const dbConnected = await isDbReachable();
    if (!dbConnected) {
      console.error('[Shop Public Products] Database not connected.');
      return res.status(503).json({
        success: false,
        error: 'Database connection not available',
        message: 'The database is not connected. Please try again later.',
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

    const filter = { in_stock: true };
    if (category && category !== 'all') filter.category = category;

    const products = await Product.findPaginated({
      filter,
      search,
      sort: { created_at: -1 },
      skip,
      limit
    });

    const total = await Product.count(filter, { search });

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
    const isConnectionError =
                              error.message?.toLowerCase().includes('connection') ||
                              error.message?.toLowerCase().includes('timeout') ||
                              error.message?.toLowerCase().includes('buffering');
    
    res.status(isConnectionError ? 503 : 500).json({ 
      success: false,
      error: errorMessage,
      message: isConnectionError 
        ? 'Database connection error. Please try again later.'
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
    const product = await Product.findOne({ id: req.params.id, in_stock: true });
    
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