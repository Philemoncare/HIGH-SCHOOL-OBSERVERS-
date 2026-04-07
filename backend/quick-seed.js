const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./src/models/User');
const Event = require('./src/models/Event');
const News = require('./src/models/News');
const DonationCampaign = require('./src/models/DonationCampaign');
const { connectDB } = require('./src/database/postgres');

const quickSeed = async () => {
  try {
    console.log('🌱 Quick seeding database...');
    
    await connectDB();
    console.log('🔗 Connected to PostgreSQL');

    // Check if data already exists
    const existingEvents = await Event.count();
    const existingNews = await News.count();
    const existingCampaigns = await DonationCampaign.count();
    
    if (existingEvents > 0 && existingNews > 0 && existingCampaigns > 0) {
      console.log('✅ Data already exists! Skipping seed.');
      console.log(`📊 Current data: ${existingEvents} events, ${existingNews} news, ${existingCampaigns} campaigns`);
      process.exit(0);
    }

    // Get or create super admin
    let superAdmins = await User.find({ role: 'super_admin' }, { limit: 1 });
    let superAdmin = superAdmins?.[0] || null;
    if (!superAdmin) {
      console.log('👑 Creating super admin...');
      const hashedPassword = await bcrypt.hash('@Qwerty1234', 12);
      
      superAdmin = await User.create({
        first_name: 'Super',
        last_name: 'Admin',
        email: 'favmoms440@gmail.com',
        password_hash: hashedPassword,
        role: 'super_admin',
        is_verified: true,
        is_approved: true,
        phone: '+233000000000',
        school_name: 'HSO System'
      });
      console.log('✅ Super admin created!');
    }

    // Seed Events (only if none exist)
    if (existingEvents === 0) {
      console.log('📅 Seeding events...');
      const events = [
        {
          title: "Annual Education Leadership Conference",
          description: "Join school representatives from across the region for our annual leadership conference. This year's theme focuses on 'Innovation in Education' with keynote speakers, workshops, and networking opportunities.",
          category: "conference",
          date: new Date("2024-03-15"),
          time: "09:00 AM - 05:00 PM",
          location: "Grand Convention Center, Downtown",
          organizer: "HSO Leadership Team",
          image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=250&fit=crop",
          price: "₵150",
          capacity: 200,
          registered: 145,
          status: "active",
          featured: true,
          created_by: superAdmin.id
        },
        {
          title: "Technology Integration Workshop",
          description: "Learn about the latest educational technologies and how to implement them effectively in your school. Hands-on sessions with experts in digital learning.",
          category: "workshop",
          date: new Date("2024-02-28"),
          time: "10:00 AM - 03:00 PM",
          location: "Tech Innovation Hub",
          organizer: "Digital Learning Institute",
          image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop",
          price: "₵75",
          capacity: 50,
          registered: 32,
          status: "active",
          featured: false,
          created_by: superAdmin.id
        },
        {
          title: "Student Wellness Symposium",
          description: "A comprehensive symposium addressing mental health, physical wellness, and social-emotional learning in schools. Share best practices and learn from experts.",
          category: "symposium",
          date: new Date("2024-04-10"),
          time: "08:30 AM - 04:30 PM",
          location: "Wellness Center",
          organizer: "Student Health Coalition",
          image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop",
          price: "₵100",
          capacity: 150,
          registered: 89,
          status: "active",
          featured: true,
          created_by: superAdmin.id
        }
      ];

      await Promise.all(events.map(e => Event.create(e)));
      console.log(`✅ ${events.length} events created`);
    }

    // Seed News Articles (only if none exist)
    if (existingNews === 0) {
      console.log('📰 Seeding news articles...');
      const newsArticles = [
        {
          title: "New Educational Policy Changes Announced",
          excerpt: "The Department of Education has announced significant changes to curriculum standards that will affect schools nationwide.",
          content: "The Department of Education has announced significant changes to curriculum standards that will affect schools nationwide. These changes focus on modernizing educational approaches and ensuring students are prepared for the future workforce. The new policies emphasize critical thinking, digital literacy, and practical skills development.",
          category: "policy",
          author: "Dr. Sarah Johnson",
          slug: "new-educational-policy-changes",
          image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop",
          tags: ["Education", "Policy"],
          status: "published",
          featured: true,
          view_count: 1250,
          created_by: superAdmin.id,
          published_at: new Date()
        },
        {
          title: "Technology Integration in Modern Classrooms",
          excerpt: "How schools are successfully implementing digital tools to enhance student learning experiences.",
          content: "Schools across the country are successfully implementing digital tools to enhance student learning experiences. From interactive whiteboards to virtual reality simulations, technology is transforming how students engage with educational content. This article explores successful implementation strategies and their impact on student achievement.",
          category: "technology",
          author: "Michael Chen",
          slug: "technology-integration-modern-classrooms",
          image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop",
          tags: ["Technology", "Education"],
          status: "published",
          featured: false,
          view_count: 890,
          created_by: superAdmin.id,
          published_at: new Date()
        },
        {
          title: "Mental Health Support Programs for Students",
          excerpt: "Schools are implementing comprehensive mental health support programs to address student well-being.",
          content: "Schools are implementing comprehensive mental health support programs to address student well-being. These programs include counseling services, stress management workshops, and peer support groups. The focus is on creating a supportive environment where students feel safe to discuss their mental health concerns.",
          category: "wellness",
          author: "Lisa Rodriguez",
          slug: "mental-health-support-programs",
          image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop",
          tags: ["Wellness", "Education"],
          status: "published",
          featured: true,
          view_count: 1560,
          created_by: superAdmin.id,
          published_at: new Date()
        }
      ];

      await Promise.all(newsArticles.map(n => News.create(n)));
      console.log(`✅ ${newsArticles.length} news articles created`);
    }

    // Seed Donation Campaigns (only if none exist)
    if (existingCampaigns === 0) {
      console.log('💝 Seeding donation campaigns...');
      const donationCampaigns = [
        {
          title: "School Infrastructure Improvement",
          description: "Help us improve school infrastructure by providing better facilities, modern equipment, and safe learning environments for students across the region.",
          image: "https://images.unsplash.com/photo-1523050854058-8df90110c9d1?w=400&h=250&fit=crop",
          goal_amount: 50000,
          raised_amount: 32000,
          beneficiary: "Regional Schools Development Fund",
          category: "education",
          status: "active",
          featured: true,
          urgent: true,
          created_by: superAdmin.id
        },
        {
          title: "Student Scholarship Program",
          description: "Support bright students from underprivileged backgrounds by providing scholarships for their education. Every contribution makes a difference in a student's life.",
          image: "https://images.unsplash.com/photo-1523240794102-9ebd0b167b13?w=400&h=250&fit=crop",
          goal_amount: 25000,
          raised_amount: 18500,
          beneficiary: "Student Scholarship Foundation",
          category: "education",
          status: "active",
          featured: false,
          urgent: false,
          created_by: superAdmin.id
        }
      ];

      await Promise.all(donationCampaigns.map(d => DonationCampaign.create(d)));
      console.log(`✅ ${donationCampaigns.length} donation campaigns created`);
    }

    console.log('🎉 Quick seeding completed successfully!');
    console.log('');
    console.log('🔐 LOGIN CREDENTIALS:');
    console.log('   📧 Email: favmoms440@gmail.com');
    console.log('   🔑 Password: @Qwerty1234');
    console.log('');
    console.log('🌐 ADMIN ACCESS:');
    console.log('   Frontend: http://localhost:3000/admin-login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Quick seeding failed:', error);
    process.exit(1);
  }
};

quickSeed(); 