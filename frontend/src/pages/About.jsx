import { Helmet } from 'react-helmet-async'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import LeadershipDisplay from '../components/LeadershipDisplay'
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  Award, 
  Globe, 
  Heart,
  ArrowRight,
  Play,
  ChevronDown,
  Star,
  Target,
  Lightbulb,
  Shield,
  Zap,
  X,
  Volume2,
  VolumeX,
  Maximize2,
  Settings
} from 'lucide-react'

function About() {
  const [activeTab, setActiveTab] = useState('story')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTimelineIndex, setCurrentTimelineIndex] = useState(0)
  const [videoModal, setVideoModal] = useState({ isOpen: false, videoId: null, title: '' })
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, -50])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0])

  // Video player functions
  const openVideo = (videoId, title) => {
    setVideoModal({ isOpen: true, videoId, title })
    setIsMuted(false)
    setIsFullscreen(false)
  }

  const closeVideo = () => {
    setVideoModal({ isOpen: false, videoId: null, title: '' })
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Smooth scroll function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Timeline data
  const timelineData = [
    {
      year: '2022',
      title: 'Foundation',
      description: 'HSO was founded with a vision to connect students across Ghana',
      icon: <Heart className="w-6 h-6" />,
      color: 'from-red-500 to-pink-500',
      achievements: ['First 100 members', '5 schools joined', 'First event organized']
    },
    {
      year: '2023',
      title: 'Expansion',
      description: 'Rapid growth and establishment of key initiatives',
      icon: <Globe className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      achievements: ['500+ members', '15 schools', 'Social media presence']
    },
    {
      year: '2024',
      title: 'Innovation',
      description: 'Launch of advanced programs and digital platforms',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      achievements: ['Digital platform', 'Advanced programs', 'National reach']
    },
    {
      year: '2025',
      title: 'Leadership',
      description: 'Becoming the leading student organization in Ghana',
      icon: <Award className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      achievements: ['2500+ members', '150+ schools', 'National recognition']
    }
  ]

  // Core values
  const coreValues = [
    {
      title: 'Excellence',
      description: 'We strive for excellence in everything we do',
      icon: <Star className="w-8 h-8" />,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      title: 'Innovation',
      description: 'Embracing new ideas and creative solutions',
      icon: <Lightbulb className="w-8 h-8" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Integrity',
      description: 'Maintaining the highest standards of honesty and ethics',
      icon: <Shield className="w-8 h-8" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Empowerment',
      description: 'Empowering students to reach their full potential',
      icon: <Target className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-500'
    }
  ]

  // Team structure
  const teamStructure = [
    {
      role: 'Executive Board',
      members: 5,
      description: 'Strategic leadership and decision making',
      color: 'from-red-600 to-red-800'
    },
    {
      role: 'School Representatives',
      members: 150,
      description: 'Direct connection to member schools',
      color: 'from-blue-600 to-blue-800'
    },
    {
      role: 'Event Coordinators',
      members: 25,
      description: 'Organizing and managing events',
      color: 'from-green-600 to-green-800'
    },
    {
      role: 'Content Creators',
      members: 15,
      description: 'Creating engaging digital content',
      color: 'from-purple-600 to-purple-800'
    }
  ]

  return (
    <>
      <Helmet>
        <title>About - High School Observer</title>
        <meta name="description" content="Discover the story, mission, and impact of High School Observer (HSO) - Ghana's leading student organization" />
      </Helmet>
      
      <div className="min-h-screen" ref={containerRef}>
        <section className="relative min-h-[75vh] md:min-h-[85vh] overflow-hidden">
          <motion.img
            src="/images/t6.jpg"
            alt="HSO Students and Activities"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ scale: 1.1, opacity: 0.9 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            onError={(e) => { e.currentTarget.src = '/images/main.jpg' }}
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />
          <div className="relative z-10 container mx-auto px-4 flex items-end md:items-center min-h-[75vh] md:min-h-[85vh] pb-10 md:pb-0">
            <div className="max-w-3xl">
              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                Our Story
              </motion.h1>
              <motion.p
                className="mt-4 text-base sm:text-lg md:text-xl text-white/90 leading-relaxed"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                From a passionate student group to Ghana's largest pre-tertiary edutainment society.
              </motion.p>
              <motion.div
                className="mt-6 flex gap-3"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <motion.button onClick={() => scrollToSection('timeline')} whileHover={{ y: -2, scale: 1.03 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center px-6 py-3 rounded-lg bg-white text-gray-900 font-semibold shadow hover:bg-gray-100">Explore Journey</motion.button>
                <motion.button onClick={() => scrollToSection('values')} whileHover={{ y: -2, scale: 1.03 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center px-6 py-3 rounded-lg border border-white/70 text-white font-semibold hover:bg-white/10">Our Values</motion.button>
              </motion.div>
            </div>
          </div>
        </section>
        <section id="timeline" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl font-bold text-gray-800 mb-6">Our Journey</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From humble beginnings to becoming Ghana's leading student organization
              </p>
            </motion.div>
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                  {timelineData.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2, duration: 0.8 }}
                      className={`relative ${index !== timelineData.length - 1 ? 'pb-8' : ''}`}
                    >
                      {index !== timelineData.length - 1 && (
                        <div className="absolute left-8 top-16 w-0.5 h-full bg-gradient-to-b from-gray-300 to-transparent"></div>
                      )}
                      <div className="flex items-start gap-6">
                        <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <div className="text-3xl font-bold text-gray-800 mb-2">{item.year}</div>
                          <h3 className="text-xl font-semibold text-gray-700 mb-3">{item.title}</h3>
                          <p className="text-gray-600 leading-relaxed mb-4">{item.description}</p>
                          <ul className="space-y-2">
                            {item.achievements.map((achievement, idx) => (
                              <li key={idx} className="flex items-center gap-3 text-gray-600">
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                {achievement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="relative">
                  <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-3xl shadow-xl">
                    <div className="grid grid-cols-2 gap-4">
                      {timelineData.map((item, index) => (
                        <motion.button
                          key={index}
                          onClick={() => setCurrentTimelineIndex(index)}
                          className={`p-4 rounded-xl text-center transition-all ${
                            currentTimelineIndex === index
                              ? `bg-gradient-to-br ${item.color} text-white shadow-lg`
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="text-2xl font-bold">{item.year}</div>
                          <div className="text-sm">{item.title}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="relative z-0 py-12 bg-gradient-to-b from-white to-gray-50/60">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8"
            >
              <h2 className="text-5xl font-bold text-gray-800 mb-6">Watch Our Story</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                See HSO in action and hear from our members about their experiences
              </p>
            </motion.div>

            <div className="relative z-10 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative group z-10"
              >
                <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden ring-1 ring-gray-100">
                  <button
                    type="button"
                    aria-label="Play video: HSO Connecting Minds Across Ghana"
                    className="relative aspect-video min-h-[220px] sm:min-h-[260px] w-full cursor-pointer group"
                    onClick={() => openVideo('oPVbeJ0B7HQ', 'HSO: Connecting Minds Across Ghana')}
                  >
                    <img
                      src={`https://img.youtube.com/vi/oPVbeJ0B7HQ/hqdefault.jpg`}
                      alt="HSO video thumbnail"
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = '/images/main.jpg' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-transparent transition-opacity duration-300 group-hover:from-black/60 group-hover:via-black/40"></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg ring-1 ring-white/30 group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-10 h-10 sm:w-12 sm:h-12 text-white ml-1" />
                      </div>
                      <span className="mt-4 text-sm sm:text-base text-gray-200/90">Click to play video</span>
                    </div>
                  </button>
                </div>
                <div className="mt-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">HSO: Connecting Minds Across Ghana</h3>
                  <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Discover how High School Observer has grown from a small group of passionate students 
                    to Ghana's largest pre-tertiary edutainment society, impacting thousands of students across the country.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        <section id="values" className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 sm:mb-6 px-4">Our Core Values</h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                The principles that guide everything we do and shape our community
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {coreValues.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                  className="group cursor-pointer"
                >
                  <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-lg transform group-hover:scale-105 transition-all duration-300 border border-gray-100">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center text-white mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform`}>
                      {value.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">{value.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 text-center leading-relaxed">{value.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl font-bold mb-6">Our Team Structure</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                A well-organized team that ensures smooth operations and maximum impact
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamStructure.map((team, index) => (
                <motion.div
                  key={team.role}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                  className="group cursor-pointer"
                >
                  <div className={`bg-gradient-to-br ${team.color} p-8 rounded-3xl shadow-xl transform group-hover:scale-105 transition-all duration-300`}>
                    <div className="text-4xl font-bold mb-4">{team.members}+</div>
                    <h3 className="text-xl font-bold mb-4">{team.role}</h3>
                    <p className="text-white/90 leading-relaxed">{team.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        <LeadershipDisplay />
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl font-bold text-gray-800 mb-6">Our Impact</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Numbers that tell the story of our growth and influence
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: <Users className="w-8 h-8" />, number: '2500+', label: 'Members', color: 'from-blue-500 to-purple-600' },
                { icon: <GraduationCap className="w-8 h-8" />, number: '150+', label: 'Schools', color: 'from-green-500 to-teal-600' },
                { icon: <Calendar className="w-8 h-8" />, number: '75+', label: 'Events', color: 'from-purple-500 to-pink-600' },
                { icon: <Award className="w-8 h-8" />, number: '3', label: 'Years', color: 'from-orange-500 to-red-600' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="text-center group"
                >
                  <div className={`bg-gradient-to-br ${stat.color} p-8 rounded-3xl shadow-xl transform group-hover:scale-105 transition-all duration-300`}>
                    <div className="text-white mb-4 flex justify-center">
                      {stat.icon}
                    </div>
                    <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
                    <div className="text-white/90">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        <section className="py-20 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-5xl font-bold mb-6">Join Our Story</h2>
              <p className="text-2xl mb-12 max-w-3xl mx-auto">
                Be part of the next chapter in HSO's journey and help us create an even greater impact
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link to="/contact">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-3 px-10 py-4 bg-white text-gray-800 rounded-xl font-bold text-lg shadow-lg hover:bg-gray-100 transition-all"
                  >
                    <span>Contact Us</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                <Link to="/payment?type=official-member">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-3 px-10 py-4 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white hover:text-gray-800 transition-all"
                  >
                    <span>Join HSO</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
              </div>
              <div className="mt-8 text-gray-300">
                <p className="text-sm">
                  <span className="font-semibold">School Representative:</span> GHC 25 (Pre-tertiary students)
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Official Member:</span> GHC 50 (Graduates & Tertiary students)
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
      {videoModal.isOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative bg-black rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl max-h-[70vh]">
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={closeVideo}
                className="p-2 text-white hover:bg-red-600 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${videoModal.videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&rel=0&modestbranding=1&controls=1&showinfo=0`}
                title={videoModal.title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default About 