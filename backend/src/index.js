const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB } = require('./database/postgres');
const initializeDatabase = require('./database/init');

// Connect to database and initialize super admin
connectDB().then(() => {
  console.log('🔗 Database connected, initializing super admin...');
  return initializeDatabase();
}).then(() => {
  console.log('✅ Database initialization complete');
}).catch((error) => {
  console.error('❌ Database initialization failed:', error);
});

const userRoutes = require('./routes/users');
const newsRoutes = require('./routes/news');
const authRoutes = require('./routes/auth');
const eventsRoutes = require('./routes/events');
const shopRoutes = require('./routes/shop');
const donationsRoutes = require('./routes/donations');
const magazineRoutes = require('./routes/magazine');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');
const leadershipRoutes = require('./routes/leadership');
const ordersRoutes = require('./routes/orders');
const newsletterRoutes = require('./routes/newsletter');
const contactRoutes = require('./routes/contact');
const settingsRoutes = require('./routes/settings');
const { errorHandler } = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration: allow localhost, Vercel URL(s), and env-configured origins
const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
const backendUrl = process.env.BACKEND_URL;
const frontendUrl = process.env.FRONTEND_URL;
const extraOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// Default production origins (Vercel) so frontend works even if FRONTEND_URL not set
const defaultProductionOrigins = [
  'https://high-school-observers-frontend.vercel.app'
];

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  vercelUrl,
  backendUrl,
  frontendUrl,
  ...(process.env.NODE_ENV === 'production' ? defaultProductionOrigins : []),
  ...extraOrigins
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // In production, also allow any *.vercel.app (preview deployments)
    if (process.env.NODE_ENV === 'production' && origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    // In development, be more permissive for debugging
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ CORS: Origin not in allowed list: ${origin}`);
      console.warn(`📋 Allowed origins:`, allowedOrigins);
      return callback(null, true);
    }
    
    // In production, reject unknown origins
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
}));

// Rate limiting (temporarily disabled for testing)
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 1000 // limit each IP to 1000 requests per windowMs (increased for testing)
// });
// app.use('/api/', limiter);

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const { pool } = require('./database/postgres');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    
    res.json({ 
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      server: 'HSO Backend API',
      version: '1.0.0',
      database: {
        status: 'connected',
        connected: true,
        time: result.rows[0].now
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: {
        status: 'error',
        connected: false
      }
    });
  }
});

// Enhanced root endpoint with connection info
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'HSO backend API',
    docs: '/api/health',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      shop: '/api/shop',
      events: '/api/events',
      donations: '/api/donations',
      payments: '/api/payments',
      orders: '/api/orders'
    },
    cors: {
      enabled: true,
      allowedOrigins: allowedOrigins.length
    }
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/donations', donationsRoutes);
app.use('/api/magazine', magazineRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/leadership', leadershipRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler (must be last route)
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Avoid starting a listener in serverless environments (e.g., Vercel Functions)
if (!process.env.VERCEL) {
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : undefined;
  app.listen(PORT, host, () => {
    console.log(`🚀 HSO Backend Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 CORS enabled for origins:`, allowedOrigins.length > 0 ? allowedOrigins.join(', ') : 'None configured');
    console.log(`📡 Frontend URL: ${frontendUrl || 'Not configured'}`);
    console.log(`✅ Server ready to accept connections`);
  });
}

module.exports = app; 