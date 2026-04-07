const Event = require('../models/Event');
const News = require('../models/News');
const DonationCampaign = require('../models/DonationCampaign');
const User = require('../models/User');
const Leadership = require('../models/Leadership');
const { queryOne } = require('./postgres');

// Published content (events, donations, news) is permanent: we never wipe.
// We only insert sample data when a collection is empty (first run).
// Only admin delete in the app, or `node seed-database.js --wipe`, can remove data.

const seedData = async () => {
  try {
    console.log('🌱 Checking if seed data is needed...');

    const eventCount = await Event.count();
    const newsCount = await News.count();
    const donationCount = await DonationCampaign.count();
    const leadershipCount = await queryOne('SELECT COUNT(*) FROM leadership');
    const leadershipTotal = parseInt(leadershipCount?.count || '0', 10);

    if (eventCount > 0 && newsCount > 0 && donationCount > 0 && leadershipTotal > 0) {
      console.log('✅ Database already has data - skipping seed (events:', eventCount, 'news:', newsCount, 'donations:', donationCount, 'leadership:', leadershipTotal, ')');
      return;
    }

    console.log('🌱 Seeding initial data (some collections are empty)...');

    const superAdmins = await User.find({ role: 'super_admin' }, { limit: 1 });
    const createdBy = superAdmins?.[0]?.id || null;

    // Seed Leadership
    const leadershipMembers = [
      {
        name: 'Philemon Care',
        title: 'Founder & Program Lead',
        slug: 'philemon-care',
        bio: 'Leads platform strategy, partnerships, and youth programs across schools.',
        avatar_emoji: '🧭',
        department: 'Executive',
        location: 'Ghana',
        start_year: 2022,
        highlights: ['Partnership development', 'Program design', 'School outreach'],
        focus_areas: ['Student leadership', 'Education access', 'Community building'],
        is_featured: true,
        social_links: { email: 'info@hso.com' },
        order: 1,
        is_active: true
      },
      {
        name: 'Programs Team',
        title: 'Community & Outreach',
        slug: 'programs-team',
        bio: 'Coordinates school outreach, events, and community engagement.',
        avatar_emoji: '🤝',
        department: 'Programs',
        location: 'Ghana',
        start_year: 2023,
        highlights: ['School reps network', 'Events coordination', 'Volunteer onboarding'],
        focus_areas: ['Outreach', 'Events', 'Volunteer management'],
        is_featured: false,
        social_links: {},
        order: 2,
        is_active: true
      },
      {
        name: 'Editorial Desk',
        title: 'News & Publications',
        slug: 'editorial-desk',
        bio: 'Curates stories, school news, and long-form publications for students and partners.',
        avatar_emoji: '📰',
        department: 'Editorial',
        location: 'Ghana',
        start_year: 2023,
        highlights: ['Newsroom workflow', 'Publishing standards', 'Student stories'],
        focus_areas: ['Journalism', 'Storytelling', 'Publications'],
        is_featured: false,
        social_links: {},
        order: 3,
        is_active: true
      }
    ];

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
      await Promise.all(eventsWithCreatedBy.map(e => Event.create(e)));
      console.log(`📅 ${events.length} events seeded`);
    }
    if (newsCount === 0) {
      const newsWithCreatedBy = newsArticles.map(n => ({ ...n, created_by: createdBy }));
      await Promise.all(newsWithCreatedBy.map(n => News.create(n)));
      console.log(`📰 ${newsArticles.length} news articles seeded`);
    }
    if (donationCount === 0) {
      const donationsWithCreatedBy = donationCampaigns.map(d => ({ ...d, created_by: createdBy }));
      await Promise.all(donationsWithCreatedBy.map(d => DonationCampaign.create(d)));
      console.log(`💝 ${donationCampaigns.length} donation campaigns seeded`);
    }
    if (leadershipTotal === 0) {
      await Promise.all(leadershipMembers.map(m => Leadership.create(m)));
      console.log(`👥 ${leadershipMembers.length} leadership members seeded`);
    }

    console.log('✅ Seed completed');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
};

module.exports = seedData; 