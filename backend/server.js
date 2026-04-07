const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration (aligned with main backend src/index.js)
const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
const backendUrl = process.env.BACKEND_URL;
const frontendUrl = process.env.FRONTEND_URL;
const extraOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  vercelUrl,
  backendUrl,
  frontendUrl,
  ...extraOrigins
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman or server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Be permissive in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ CORS (server.js): Origin not in allowed list: ${origin}`);
      console.warn(`📋 Allowed origins:`, allowedOrigins);
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'HSO Platform API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint (visiting the bare Render URL)
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'HSO backend API',
    docs: '/api/health',
    endpoints: {
      health: '/api/health',
      news: '/api/news',
      events: '/api/events',
      products: '/api/products'
    }
  });
});

// Social login endpoints (mock implementation)
app.post('/api/auth/google', (req, res) => {
  try {
    const { email, firstName, lastName, profileImage, googleId } = req.body;
    
    // Mock user data
    const userData = {
      id: googleId || 'google_' + Date.now(),
      email: email,
      firstName: firstName,
      lastName: lastName,
      profileImage: profileImage,
      provider: 'google',
      role: 'user',
      createdAt: new Date().toISOString()
    };
    
    console.log('Google login successful for:', email);
    
    res.json({
      success: true,
      message: 'Google login successful',
      user: userData
    });
    
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      error: 'Google login failed'
    });
  }
});

app.post('/api/auth/facebook', (req, res) => {
  try {
    const { email, firstName, lastName, profileImage, facebookId } = req.body;
    
    // Mock user data
    const userData = {
      id: facebookId || 'facebook_' + Date.now(),
      email: email,
      firstName: firstName,
      lastName: lastName,
      profileImage: profileImage,
      provider: 'facebook',
      role: 'user',
      createdAt: new Date().toISOString()
    };
    
    console.log('Facebook login successful for:', email);
    
    res.json({
      success: true,
      message: 'Facebook login successful',
      user: userData
    });
    
  } catch (error) {
    console.error('Facebook login error:', error);
    res.status(500).json({
      success: false,
      error: 'Facebook login failed'
    });
  }
});

// Mock data endpoints
app.get('/api/news', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        title: "Welcome to HSO Platform",
        content: "This is a sample news article.",
        author: "HSO Team",
        createdAt: new Date().toISOString()
      }
    ]
  });
});

app.get('/api/events', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        title: "Sample Event",
        description: "This is a sample event.",
        date: new Date().toISOString(),
        location: "Sample Location"
      }
    ]
  });
});

app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: "Sample Product",
        price: 29.99,
        description: "This is a sample product.",
        image: "/images/sample.jpg"
      }
    ]
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 HSO Platform API server (server.js) running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 CORS enabled for origins:`, allowedOrigins.length > 0 ? allowedOrigins.join(', ') : 'None configured');
});

module.exports = app;