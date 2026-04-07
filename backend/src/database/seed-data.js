const mongoose = require('mongoose');
const Event = require('../models/Event');
const News = require('../models/News');
const DonationCampaign = require('../models/DonationCampaign');
const User = require('../models/User');

// Published content (events, donations, news) is permanent: we never wipe.
// We only insert sample data when a collection is empty (first run).
// Only admin delete in the app, or `node seed-database.js --wipe`, can remove data.

const seedData = async () => {
  try {
    console.log('🌱 Checking if seed data is needed...');

    const eventCount = await Event.countDocuments();
    const newsCount = await News.countDocuments();
    const donationCount = await DonationCampaign.countDocuments();

    if (eventCount > 0 && newsCount > 0 && donationCount > 0) {
      console.log('✅ Database already has data - skipping seed (events:', eventCount, 'news:', newsCount, 'donations:', donationCount, ')');
      return;
    }

    console.log('🌱 Seeding initial data (some collections are empty)...');

    const superAdmin = await User.findOne({ role: 'super_admin' });
    const createdBy = superAdmin?._id || null;

    // Seed Events
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
        featured: true
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
        featured: false
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
        featured: true
      }
    ];

    // Seed News Articles
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
        view_count: 1250
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
        view_count: 890
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
        view_count: 1560
      }
    ];

    // Seed Donation Campaigns
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
        urgent: true
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
        urgent: false
      }
    ];

    // Only insert into empty collections - NEVER wipe existing data
    if (eventCount === 0) {
      const eventsWithCreatedBy = events.map(e => ({ ...e, created_by: createdBy }));
      await Event.insertMany(eventsWithCreatedBy);
      console.log(`📅 ${events.length} events seeded`);
    }
    if (newsCount === 0) {
      const newsWithCreatedBy = newsArticles.map(n => ({ ...n, created_by: createdBy }));
      await News.insertMany(newsWithCreatedBy);
      console.log(`📰 ${newsArticles.length} news articles seeded`);
    }
    if (donationCount === 0) {
      const donationsWithCreatedBy = donationCampaigns.map(d => ({ ...d, created_by: createdBy }));
      await DonationCampaign.insertMany(donationsWithCreatedBy);
      console.log(`💝 ${donationCampaigns.length} donation campaigns seeded`);
    }

    console.log('✅ Seed completed');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
};

module.exports = seedData; 