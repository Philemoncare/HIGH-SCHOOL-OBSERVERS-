import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ChevronDown, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import LeadershipDisplay from '../components/LeadershipDisplay'
import MembershipPaymentModal from '../components/MembershipPaymentModal'
import RealIcon from '../components/RealIcon'

function Home() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [selectedMembership, setSelectedMembership] = useState(null)
  const [stats, setStats] = useState({
    members: 0,
    schools: 0,
    events: 0,
    years: 0
  })

  // Show loading state if auth is still loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-red-600"></div>
      </div>
    )
  }

  useEffect(() => {
    // Animate statistics
    let timer = null
    const timeoutId = setTimeout(() => {
      const targetStats = { members: 2500, schools: 150, events: 75, years: 3 }
      const duration = 2000
      const steps = 60
      const increment = duration / steps
      
      let currentStep = 0
      timer = setInterval(() => {
        currentStep++
        const progress = currentStep / steps
        
        setStats({
          members: Math.floor(targetStats.members * progress),
          schools: Math.floor(targetStats.schools * progress),
          events: Math.floor(targetStats.events * progress),
          years: Math.floor(targetStats.years * progress)
        })
        
        if (currentStep >= steps) {
          clearInterval(timer)
          timer = null
        }
      }, increment)
    }, 1000)
    
    return () => {
      clearTimeout(timeoutId)
      if (timer) {
        clearInterval(timer)
      }
    }
  }, [])

  const scrollToStats = () => {
    const el = document.getElementById('home-stats')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Social media platforms data with proper SVG icons and animations
  const socialMediaPlatforms = [
    {
      name: 'Instagram',
      handle: '@Highschool_observer',
      color: 'from-pink-500 to-purple-600',
      url: 'https://instagram.com/Highschool_observer',
      followers: '78.9K',
      icon: (
        <motion.svg 
          className="w-12 h-12" 
          fill="currentColor" 
          viewBox="0 0 24 24"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <path d="M12 2.16c3.2 0 3.584.012 4.85.07 1.17.056 1.97.24 2.43.41a4.92 4.92 0 0 1 1.69 1.09 4.92 4.92 0 0 1 1.09 1.69c.17.46.354 1.26.41 2.43.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.056 1.17-.24 1.97-.41 2.43a4.92 4.92 0 0 1-1.09 1.69 4.92 4.92 0 0 1-1.69 1.09c-.46.17-1.26.354-2.43.41-1.266.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.056-1.97-.24-2.43-.41a4.92 4.92 0 0 1-1.69-1.09 4.92 4.92 0 0 1-1.09-1.69c-.17-.46-.354-1.26-.41-2.43C2.172 15.584 2.16 15.2 2.16 12s.012-3.584.07-4.85c.056-1.17.24-1.97.41-2.43a4.92 4.92 0 0 1 1.09-1.69 4.92 4.92 0 0 1 1.69-1.09c.46-.17 1.26-.354 2.43-.41C8.416 2.172 8.8 2.16 12 2.16zm0-2.16C8.736 0 8.332.012 7.052.07 5.78.128 4.89.312 4.13.54a6.92 6.92 0 0 0-2.5 1.64A6.92 6.92 0 0 0 .54 4.13c-.228.76-.412 1.65-.47 2.92C.012 8.332 0 8.736 0 12c0 3.264.012 3.668.07 4.948.058 1.27.242 2.16.47 2.92a6.92 6.92 0 0 0 1.64 2.5 6.92 6.92 0 0 0 2.5 1.64c.76.228 1.65.412 2.92.47C8.332 23.988 8.736 24 12 24s3.668-.012 4.948-.07c1.27-.058 2.16-.242 2.92-.47a6.92 6.92 0 0 0 2.5-1.64 6.92 6.92 0 0 0 1.64-2.5c.228-.76.412-1.65.47-2.92.058-1.28.07-1.684.07-4.948s-.012-3.668-.07-4.948c-.058-1.27-.242-2.16-.47-2.92a6.92 6.92 0 0 0-1.64-2.5A6.92 6.92 0 0 0 19.87.54c-.76-.228-1.65-.412-2.92-.47C15.668.012 15.264 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm7.844-10.406a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/>
        </motion.svg>
      )
    },
    {
      name: 'Facebook',
      handle: 'High School Observer',
      color: 'from-blue-500 to-blue-700',
      url: 'https://web.facebook.com/profile.php?id=100064857963229',
      followers: '226K',
      icon: (
        <motion.svg 
          className="w-12 h-12" 
          fill="currentColor" 
          viewBox="0 0 24 24"
          whileHover={{ scale: 1.1, rotate: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <path d="M22 12c0-5.522-4.478-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.632.771-1.632 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/>
        </motion.svg>
      )
    },
    {
      name: 'TikTok',
      handle: '@Highschobserver',
      color: 'from-black to-gray-800',
      url: 'https://tiktok.com/@Highschobserver',
      followers: '50.3K',
      icon: (
        <motion.svg 
          className="w-12 h-12" 
          fill="currentColor" 
          viewBox="0 0 24 24"
          whileHover={{ scale: 1.1, y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </motion.svg>
      )
    },
    {
      name: 'Threads',
      handle: '@Highschool_observer',
      color: 'from-gray-800 to-black',
      url: 'https://threads.net/@Highschool_observer',
      followers: '3.8K',
      icon: (
        <motion.svg 
          className="w-12 h-12" 
          fill="currentColor" 
          viewBox="0 0 24 24"
          whileHover={{ scale: 1.1, rotate: 10 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.5 12.06v-.12c.018-4.287 2.346-7.371 6.5-9.02V2.5C8.018.567 9.35 0 11.5 0h.5c2.15 0 3.482.567 4.5 2.5v.42c4.154 1.649 6.482 4.733 6.5 9.02v.12c-.018 3.526-.85 6.38-2.495 8.431-1.85 2.304-4.603 3.485-8.184 3.509h-.115zM11.5 2.5c-1.4 0-2.5.6-2.5 2v.5c1.4 0 2.5-.6 2.5-2v-.5zm1 0v.5c0 1.4.6 2 2 2v-.5c0-1.4-.6-2-2-2z"/>
        </motion.svg>
      )
    },
    {
      name: 'YouTube',
      handle: '@Highschoolobservergh',
      color: 'from-red-500 to-red-700',
      url: 'https://youtube.com/@Highschoolobservergh',
      followers: '5.2K',
      icon: (
        <motion.svg 
          className="w-12 h-12" 
          fill="currentColor" 
          viewBox="0 0 24 24"
          whileHover={{ scale: 1.1, y: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </motion.svg>
      )
    }
  ]

  const initiatives = [
    {
      id: 'students-internet',
      title: 'Students and Internet',
      tagline: 'Digital citizenship for the next generation',
      description: 'We equip students with digital literacy, online safety, and responsible use of the internet—so they lead, not just browse.',
      icon: '🌐',
      color: 'from-violet-500 to-indigo-600',
      glowColor: 'violet',
      pill: 'Digital',
      participants: '1,500+',
      impact: '10 schools',
      instagram: 'https://www.instagram.com/studentsandinternet/',
      featured: true
    },
    {
      id: 'green-wave',
      title: 'Green Wave',
      tagline: 'Environment and climate action',
      description: 'From tree planting to climate literacy, we advocate for a greener future and conservation of natural resources.',
      icon: '🌱',
      color: 'from-emerald-500 to-teal-600',
      glowColor: 'emerald',
      pill: 'Environment',
      participants: '1,800+',
      impact: '12 schools',
      featured: false
    },
    {
      id: 'sada',
      title: 'Students Against Drug Abuse (SADA)',
      tagline: 'Awareness, education, support',
      description: 'We combat substance abuse among students through peer-led awareness, education, and safe spaces for conversation.',
      icon: '🚫',
      color: 'from-rose-500 to-pink-600',
      glowColor: 'rose',
      pill: 'Wellness',
      participants: '3,200+',
      impact: '20 schools',
      featured: false
    }
  ]

  // Benefits data
  const benefits = [
    {
      title: 'Connect',
      description: 'Connect with your peers from different high schools across Ghana.',
      icon: '🤝',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      title: 'Learn',
      description: 'Gain valuable life skills in digital technology, climate change and the environment, drug abuse awareness campaigns, and life mentorship programs.',
      icon: '📚',
      color: 'from-green-500 to-teal-500'
    },
    {
      title: 'Grow',
      description: 'Develop your talents in music, dance, poetry, fashion, and modeling through our support and promotion programs.',
      icon: '🌟',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      title: 'Empowerment',
      description: 'Gain the confidence and skills to take control of your life, make decisions, and become self-sufficient.',
      icon: '💪',
      color: 'from-purple-500 to-pink-500'
    }
  ]

  // Membership types
  const membershipTypes = [
    {
      title: 'School Representatives',
      description: 'For pre-tertiary students',
      price: 25,
      features: ['Monthly renewal: GHC 20', 'Brand T-shirt', 'All events access'],
      color: 'from-blue-500 to-indigo-500'
    },
    {
      title: 'Official Membership',
      description: 'For graduates and tertiary students',
      price: 50,
      features: ['Monthly renewal: GHC 20', 'Brand T-shirt', 'Priority support'],
      color: 'from-green-500 to-teal-500'
    }
  ]

  return (
    <>
      <Helmet>
        <title>Home - High School Observer</title>
        <meta name="description" content="Welcome to High School Observer (HSO) - a vibrant community of active young schoolers from various high schools and TVET institutions across Ghana" />
      </Helmet>
      <div className="min-h-screen">
        <motion.section 
          className="relative text-white pt-20 sm:pt-24 md:pt-28 pb-20 sm:pb-24 flex flex-col items-center justify-center overflow-hidden px-4"
          style={{
            backgroundImage: 'url(/images/main.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
          initial={{ opacity: 0, y: 40 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/30 to-black/65" />
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/25 via-transparent to-purple-900/25 mix-blend-overlay" />

          <div className="relative z-10 max-w-5xl mx-auto text-center">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white/90 text-sm font-semibold shadow-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.7)]" />
              <span>Trusted by 150+ schools • 2,500+ members</span>
            </motion.div>

            <motion.h1 
              className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 sm:mb-6 drop-shadow-lg tracking-tight px-4"
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2, duration: 0.7 }}
            >
              {isAuthenticated && user && user.first_name ? (
                <span className="inline-flex items-center gap-3 justify-center">
                  <span>Welcome back, {user.first_name}!</span>
                  <motion.span
                    className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white/10 backdrop-blur border border-white/20"
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                    aria-hidden="true"
                  >
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                  </motion.span>
                </span>
              ) : (
                <span className="inline-block">
                  <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                    High School Observer
                  </span>
                </span>
              )}
            </motion.h1>
            <motion.p 
              className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 drop-shadow font-medium px-4 max-w-3xl mx-auto text-white/90 leading-relaxed"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.4, duration: 0.7 }}
            >
              {isAuthenticated && user ? (
                <>Ready to explore events, connect with peers, and make a difference in your community?</>
              ) : (
                <>A vibrant community of active young schoolers from various high schools and TVET institutions across Ghana</>
              )}
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4"
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.6, duration: 0.7 }}
            >
              {isAuthenticated && user ? (
                <>
                  <Link to="/events">
                    <button className="w-full sm:w-auto px-7 sm:px-9 py-3.5 bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white rounded-2xl font-bold text-base sm:text-lg shadow-xl shadow-red-500/35 hover:shadow-2xl hover:shadow-red-500/45 transition-all duration-300 hover:-translate-y-0.5">
                      Browse Events
                    </button>
                  </Link>
                  <Link to="/dashboard">
                    <button className="w-full sm:w-auto px-7 sm:px-9 py-3.5 rounded-2xl font-bold text-base sm:text-lg border-2 border-white/70 bg-white/10 backdrop-blur shadow-xl hover:bg-white hover:text-gray-900 transition-all duration-300 hover:-translate-y-0.5">
                      Go to Dashboard
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/about">
                    <button className="w-full sm:w-auto px-7 sm:px-9 py-3.5 bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white rounded-2xl font-bold text-base sm:text-lg shadow-xl shadow-red-500/35 hover:shadow-2xl hover:shadow-red-500/45 transition-all duration-300 hover:-translate-y-0.5">
                      Learn More
                    </button>
                  </Link>
                  <Link to="/register">
                    <button className="w-full sm:w-auto px-7 sm:px-9 py-3.5 rounded-2xl font-bold text-base sm:text-lg border-2 border-white/70 bg-white/10 backdrop-blur shadow-xl hover:bg-white hover:text-gray-900 transition-all duration-300 hover:-translate-y-0.5">
                      Join HSO Today
                    </button>
                  </Link>
                </>
              )}
            </motion.div>

            <motion.button
              type="button"
              onClick={scrollToStats}
              className="mt-10 inline-flex items-center gap-2 text-white/85 hover:text-white transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.6 }}
              aria-label="Scroll to highlights"
            >
              <span className="text-sm font-semibold tracking-wide">Explore highlights</span>
              <motion.span
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ChevronDown className="w-5 h-5" />
              </motion.span>
            </motion.button>
          </div>
        </motion.section>

        <motion.section 
          id="home-stats"
          className="py-12 sm:py-16 bg-white"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              <motion.div 
                className="text-center group"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 sm:p-6 rounded-2xl shadow-lg transform group-hover:scale-105 transition-all duration-300">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">{stats.members}+</div>
                  <div className="text-white opacity-90 text-sm sm:text-base">Members</div>
                </div>
              </motion.div>
              <motion.div 
                className="text-center group"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="bg-gradient-to-br from-green-500 to-teal-600 p-4 sm:p-6 rounded-2xl shadow-lg transform group-hover:scale-105 transition-all duration-300">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">{stats.schools}+</div>
                  <div className="text-white opacity-90 text-sm sm:text-base">Schools</div>
                </div>
              </motion.div>
              <motion.div 
                className="text-center group"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 sm:p-6 rounded-2xl shadow-lg transform group-hover:scale-105 transition-all duration-300">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">{stats.events}+</div>
                  <div className="text-white opacity-90 text-sm sm:text-base">Events</div>
                </div>
              </motion.div>
              <motion.div 
                className="text-center group"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <div className="bg-gradient-to-br from-orange-500 to-red-600 p-4 sm:p-6 rounded-2xl shadow-lg transform group-hover:scale-105 transition-all duration-300">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">{stats.years}</div>
                  <div className="text-white opacity-90 text-sm sm:text-base">Years</div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        <motion.section 
          className="py-16 sm:py-20 bg-gradient-to-br from-blue-50 to-purple-50"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6 px-4">
                About High School Observer
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4">
                We're a pre-tertiary edutainment society dedicated to empowering students through education, entertainment, socialization, and networking opportunities.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
              <motion.div 
                className="space-y-4 sm:space-y-6 px-4 lg:px-0"
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">Our Mission</h3>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  Our community comprises high school students, graduates, and tertiary students united by a common goal: making a positive impact. By joining us, you'll connect with peers from different high schools, gain valuable life skills, and develop your talents.
                </p>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  We're also a pre-tertiary media outlet, providing credible news updates on the latest happenings in our schools. Our media platforms reach thousands of students across Ghana.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {isAuthenticated && user ? (
                    <>
                      <Link to="/events">
                        <button className="w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-blue-700 transition-all transform hover:scale-105">
                          View Events
                        </button>
                      </Link>
                      <Link to="/profile">
                        <button className="w-full sm:w-auto border-2 border-blue-600 text-blue-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-blue-600 hover:text-white transition-all transform hover:scale-105">
                          My Profile
                        </button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/about">
                        <button className="w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-blue-700 transition-all transform hover:scale-105">
                          Learn More
                        </button>
                      </Link>
                      <Link to="/register">
                        <button className="w-full sm:w-auto border-2 border-blue-600 text-blue-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-blue-600 hover:text-white transition-all transform hover:scale-105">
                          Join Now
                        </button>
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>

              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 sm:p-8 rounded-3xl shadow-xl overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {benefits.slice(0, 4).map((benefit, index) => (
                      <motion.div 
                        key={index}
                        className="text-center p-5 sm:p-6 bg-white rounded-2xl shadow-md transform hover:scale-105 transition-all"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                      >
                        <div className="mx-auto mb-3 sm:mb-4">
                          <RealIcon
                            symbol={benefit.icon}
                            badge
                            className="w-7 h-7 sm:w-8 sm:h-8"
                            colorClassName="text-white"
                            badgeClassName={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${benefit.color} shadow-lg shadow-black/10 ring-1 ring-white/40 flex items-center justify-center`}
                            title={benefit.title}
                          />
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">{benefit.title}</h3>
                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed text-balance">{benefit.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        <LeadershipDisplay />

        <motion.section
          className="relative py-24 overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-red-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <motion.h2
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
              >
                Initiatives that define us
              </motion.h2>
              <motion.p
                className="text-lg sm:text-xl text-gray-600"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                Three pillars driving real impact in schools and communities across Ghana.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
              {initiatives.map((initiative, index) => {
                const isFeatured = initiative.featured
                return (
                  <motion.article
                    key={initiative.id}
                    className={`relative rounded-2xl overflow-hidden border border-gray-200/80 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group ${
                      isFeatured ? 'lg:col-span-2' : ''
                    }`}
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.12, duration: 0.6 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${initiative.color} opacity-90`} />
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${initiative.color} opacity-[0.08] rounded-bl-full`} />

                    <div className={`relative pl-8 pr-6 py-6 sm:pl-10 sm:pr-8 sm:py-8 ${isFeatured ? 'flex flex-col md:flex-row md:items-center md:gap-10' : ''}`}>
                      <div className={`flex items-start gap-4 ${isFeatured ? 'md:flex-shrink-0' : ''}`}>
                        <span className="text-5xl sm:text-6xl font-black text-gray-200/90 tabular-nums leading-none">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className={`rounded-2xl bg-gradient-to-br ${initiative.color} p-4 shadow-lg ring-2 ring-white/50 flex items-center justify-center ${isFeatured ? 'w-20 h-20' : 'w-16 h-16'}`}>
                          <RealIcon
                            symbol={initiative.icon}
                            className={isFeatured ? 'w-10 h-10' : 'w-8 h-8'}
                            colorClassName="text-white"
                            title={initiative.title}
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 mt-4 md:mt-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide bg-gradient-to-r ${initiative.color} text-white`}>
                            {initiative.pill}
                          </span>
                          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-gray-800">
                            {initiative.title}
                          </h3>
                        </div>
                        <p className="text-sm font-medium text-gray-500 mb-2">{initiative.tagline}</p>
                        <p className={`text-gray-600 ${isFeatured ? 'text-base sm:text-lg max-w-2xl' : 'text-sm'} leading-relaxed`}>
                          {initiative.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mt-5">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <RealIcon symbol="👥" className="w-4 h-4" colorClassName="text-gray-500" />
                            <span className="font-semibold text-gray-800">{initiative.participants}</span>
                            <span>participants</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <RealIcon symbol="🏫" className="w-4 h-4" colorClassName="text-gray-500" />
                            <span className="font-semibold text-gray-800">{initiative.impact}</span>
                          </div>
                          {initiative.instagram && (
                            <a
                              href={initiative.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r ${initiative.color} shadow-md hover:shadow-lg transition-all ml-auto`}
                            >
                              <RealIcon symbol="📷" className="w-4 h-4" colorClassName="text-white" />
                              Follow on Instagram
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.article>
                )
              })}
            </div>
          </div>
        </motion.section>

        <motion.section 
          className="py-20 bg-gradient-to-br from-green-50 to-blue-50"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Join Our Community
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Choose the membership plan that's right for you and start your journey with HSO.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {membershipTypes.map((membership, index) => (
                <motion.div
                  key={index}
                  className={`bg-gradient-to-br ${membership.color} rounded-3xl p-8 text-white shadow-xl transform hover:scale-105 transition-all duration-300 group cursor-pointer`}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.7 }}
                >
                  <h3 className="text-2xl font-bold mb-2">{membership.title}</h3>
                  <p className="text-white opacity-90 mb-4">{membership.description}</p>
                  <div className="text-4xl font-bold mb-6">GHC {membership.price}</div>
                  <ul className="space-y-2 mb-8">
                    {membership.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <span className="mr-2">✓</span>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => {
                      setSelectedMembership(membership)
                      setPaymentModalOpen(true)
                    }}
                    className="w-full bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all transform group-hover:scale-105"
                  >
                    Select This Plan
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section 
          className="py-20 bg-gradient-to-br from-gray-50 to-white"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Follow Us on Social Media
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Stay connected with our community and get the latest updates from HSO.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {socialMediaPlatforms.map((platform, index) => (
                <motion.a
                  key={index}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.8, type: "spring", stiffness: 100 }}
                  whileHover={{ 
                    scale: 1.05,
                    y: -10,
                    transition: { type: "spring", stiffness: 300, damping: 10 }
                  }}
                >
                  <div className={`bg-gradient-to-br ${platform.color} rounded-3xl p-8 shadow-2xl transform transition-all duration-500 text-white relative overflow-hidden group-hover:shadow-3xl`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10 mb-6 group-hover:scale-110 transition-transform duration-500">
                      {platform.icon}
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold mb-3 group-hover:text-white transition-colors duration-300">{platform.name}</h3>
                      <p className="text-white/90 mb-3 text-lg font-medium">{platform.handle}</p>
                      <div className="text-sm text-white/75 mb-6 flex items-center">
                        <span className="mr-2">👥</span>
                        <span>{platform.followers} followers</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-white/75 group-hover:text-white transition-colors duration-300">
                        <span>Click to visit</span>
                        <motion.span 
                          className="ml-2"
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                          →
                        </motion.span>
                      </div>
                    </div>
                    
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </motion.a>
              ))}
            </div>
            
            <motion.div
              className="mt-16 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              <div className="bg-white rounded-2xl p-8 shadow-xl max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Why Follow HSO?</h3>
                <div className="grid md:grid-cols-3 gap-6 text-gray-600">
                  <div className="flex items-center justify-center">
                    <span className="text-2xl mr-3">📱</span>
                    <span>Latest news and updates</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-2xl mr-3">🎉</span>
                    <span>Event announcements</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-2xl mr-3">💡</span>
                    <span>Educational content</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <motion.section 
          className="py-20 bg-gradient-to-r from-red-700 via-red-800 to-purple-800 text-white"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              {isAuthenticated && user && user.first_name ? (
                <>Welcome to HSO, {user.first_name}! 🎉</>
              ) : (
                <>Ready to Join HSO?</>
              )}
            </h2>
            <p className="text-2xl mb-8 max-w-3xl mx-auto font-medium">
              {isAuthenticated && user ? (
                <>Explore events, connect with peers, and make a positive impact in your community.</>
              ) : (
                <>Connect with thousands of students across Ghana and start your journey with High School Observer.</>
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated && user ? (
                <>
                  <Link to="/events">
                    <button className="px-10 py-4 bg-white text-red-800 rounded-lg font-bold text-lg shadow hover:bg-red-100 transition transform hover:scale-105">
                      Browse Events
                    </button>
                  </Link>
                  <Link to="/dashboard">
                    <button className="px-10 py-4 border-2 border-white text-white rounded-lg font-bold text-lg shadow hover:bg-white hover:text-red-800 transition transform hover:scale-105">
                      Go to Dashboard
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register">
                    <button className="px-10 py-4 bg-white text-red-800 rounded-lg font-bold text-lg shadow hover:bg-red-100 transition transform hover:scale-105">
                      Create Account
                    </button>
                  </Link>
                  <Link to="/login">
                    <button className="px-10 py-4 border-2 border-white text-white rounded-lg font-bold text-lg shadow hover:bg-white hover:text-red-800 transition transform hover:scale-105">
                      Sign In
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.section>
      </div>

      <MembershipPaymentModal
        open={paymentModalOpen}
        membership={selectedMembership}
        onClose={() => {
          setPaymentModalOpen(false)
          setSelectedMembership(null)
        }}
        onSuccess={() => {
          setPaymentModalOpen(false)
          setSelectedMembership(null)
        }}
      />
    </>
  )
}

export default Home 