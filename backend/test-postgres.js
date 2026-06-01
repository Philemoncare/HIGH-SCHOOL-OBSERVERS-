require('dotenv').config();
const { connectDB, queryOne, queryMany } = require('./src/database/postgres');
const bcrypt = require('bcryptjs');

const testPostgreSQL = async () => {
  try {
    console.log('🧪 Testing PostgreSQL connection and basic operations...');
    
    // Test connection
    await connectDB();
    console.log('✅ Database connection successful');
    
    // Test basic query
    const timeResult = await queryOne('SELECT NOW() as current_time');
    console.log('✅ Basic query successful:', timeResult.current_time);
    
    // Test user creation
    const testPassword = await bcrypt.hash('test123', 12);
    const testUser = await queryOne(
      `INSERT INTO users (first_name, last_name, email, password_hash, role, is_verified, is_approved)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, first_name, last_name, role`,
      ['Test', 'User', 'test@example.com', testPassword, 'user', true, true]
    );
    console.log('✅ User creation successful:', testUser.email);
    
    // Test user retrieval
    const retrievedUser = await queryOne('SELECT * FROM users WHERE email = $1', ['test@example.com']);
    console.log('✅ User retrieval successful:', retrievedUser.email);
    
    // Test event creation
    const testEvent = await queryOne(
      `INSERT INTO events (title, description, category, date, time, location, organizer, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, title, status`,
      ['Test Event', 'This is a test event', 'conference', new Date(), '10:00 AM', 'Test Location', 'Test Organizer', 'active']
    );
    console.log('✅ Event creation successful:', testEvent.title);
    
    // Test news creation
    const testNews = await queryOne(
      `INSERT INTO news (title, excerpt, content, category, author, slug, status, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, title, slug, status`,
      ['Test News', 'Test excerpt', 'Test content', 'education', 'Test Author', 'test-news', 'published', new Date()]
    );
    console.log('✅ News creation successful:', testNews.title);
    
    // Test complex query with JOIN
    const newsWithAuthor = await queryMany(
      `SELECT n.title, n.author, n.status, u.first_name, u.last_name 
       FROM news n 
       LEFT JOIN users u ON n.created_by = u.id 
       WHERE n.status = $1`,
      ['published']
    );
    console.log('✅ Complex query successful, found', newsWithAuthor.length, 'news items');
    
    // Test cleanup
    await queryOne('DELETE FROM users WHERE email = $1', ['test@example.com']);
    await queryOne('DELETE FROM events WHERE title = $1', ['Test Event']);
    await queryOne('DELETE FROM news WHERE slug = $1', ['test-news']);
    console.log('✅ Cleanup successful');
    
    console.log('🎉 All PostgreSQL tests passed!');
    
  } catch (error) {
    console.error('❌ PostgreSQL test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

// Run test if this file is executed directly
if (require.main === module) {
  testPostgreSQL().then(() => {
    console.log('✅ Test completed successfully');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
}

module.exports = { testPostgreSQL };
