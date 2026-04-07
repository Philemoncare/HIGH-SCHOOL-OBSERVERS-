const mongoose = require('mongoose');
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/hso', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function checkCurrentUser() {
  try {
    console.log('🔍 Checking current user state in database...');
    
    // Find the super admin user
    const user = await User.findOne({ role: 'super_admin' });
    if (!user) {
      console.log('❌ No super admin user found');
      return;
    }
    
    console.log('👤 Current user data:', {
      id: user._id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      bio: user.bio,
      phone: user.phone,
      school_name: user.school_name,
      location: user.location,
      website: user.website,
      social_links: user.social_links,
      has_profile_image: !!user.profile_image,
      profile_image_length: user.profile_image ? user.profile_image.length : 0,
      created_at: user.created_at,
      updated_at: user.updated_at
    });
    
    if (user.profile_image) {
      console.log('📸 Profile image found! Length:', user.profile_image.length);
      console.log('🖼️ Image starts with:', user.profile_image.substring(0, 50) + '...');
    } else {
      console.log('❌ No profile image found');
    }
    
  } catch (error) {
    console.error('❌ Error checking user:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkCurrentUser();
