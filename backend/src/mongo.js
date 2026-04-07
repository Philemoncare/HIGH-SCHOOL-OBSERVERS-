const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hso_platform';
    console.log('🔗 Attempting to connect to MongoDB:', mongoUri);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Increased to 10 seconds
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });
    console.log('✅ Connected to MongoDB database');
    console.log('📊 Database name:', mongoose.connection.name);
    console.log('🔌 Connection state:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('💡 Make sure MongoDB is running on your system');
    console.error('💡 On Windows, you can:');
    console.error('   1. Check Services (Win+R → services.msc) → Find "MongoDB" → Start');
    console.error('   2. Or run: mongod --dbpath C:\\data\\db');
    console.error('💡 Connection string:', mongoUri);
    
    // In production: log but don't exit - server can still respond to health checks
    // Routes will return 503 when DB is required. Set MONGO_URI on Render to fix.
    console.warn('⚠️ Server will run without database. Set MONGO_URI (e.g. MongoDB Atlas) for full functionality.');
    if (process.env.NODE_ENV !== 'production') {
      // Auto-retry in development so starting MongoDB later "just works"
      setTimeout(() => {
        if (mongoose.connection.readyState !== 1) {
          console.log('🔁 Retrying MongoDB connection...');
          connectDB();
        }
      }, 5000);
    }
  }
};

module.exports = connectDB; 