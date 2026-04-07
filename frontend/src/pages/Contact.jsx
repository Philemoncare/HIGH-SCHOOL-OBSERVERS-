import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import RealIcon from '../components/RealIcon'
import { Sparkles } from 'lucide-react'

function Contact() {
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('contact')
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    school: '',
    membership: '',
    message: ''
  })

  // Pre-fill form for authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name || '',
        email: user.email || '',
        phone: user.phone || '',
        school: user.school || ''
      }))
    }
  }, [isAuthenticated, user])

  // Social media platforms data
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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (submitting) return
    
    setSubmitting(true)
    toast.loading('Sending your message...', { id: 'contact-submit' })
    
    try {
      const response = await axios.post('/api/contact', formData)
      
      if (response.data.success) {
        toast.success('Message sent successfully! We\'ll get back to you soon.', { id: 'contact-submit' })
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          school: '',
          membership: '',
          message: ''
        })
      } else {
        throw new Error(response.data.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Contact form error:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Failed to send message. Please try again.'
      toast.error(errorMessage, { id: 'contact-submit' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Contact - High School Observer</title>
        <meta name="description" content="Get in touch with High School Observer (HSO) - Contact us for membership, events, or general inquiries" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <motion.section 
          className="pt-28 pb-16 bg-gradient-to-r from-red-800 to-purple-800 text-white"
          initial={{ opacity: 0, y: 40 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.7 }}
        >
          <div className="container mx-auto px-4 text-center">
            <motion.h1 
              className="text-5xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2, duration: 0.7 }}
            >
              Contact Us
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl max-w-4xl mx-auto"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.4, duration: 0.7 }}
            >
              Get in touch with us for membership, events, or any general inquiries. We'd love to hear from you!
            </motion.p>
          </div>
        </motion.section>
        <motion.section 
          className="py-8 bg-gray-100"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { id: 'contact', label: 'Contact Form' },
                { id: 'social-media', label: 'Social Media' },
                { id: 'locations', label: 'Our Locations' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                    activeTab === tab.id
                      ? 'bg-red-800 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </motion.section>
        <motion.section 
          className="py-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="container mx-auto px-4">
            {activeTab === 'contact' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
              >
                <div className="grid lg:grid-cols-2 gap-12">
                  <div className="bg-white p-8 rounded-2xl shadow-xl">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Send us a Message</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                            placeholder="Enter your email"
                          />
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                            placeholder="Enter your phone number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">School/Institution</label>
                          <input
                            type="text"
                            name="school"
                            value={formData.school}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                            placeholder="Enter your school name"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Membership Type</label>
                        <select
                          name="membership"
                          value={formData.membership}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        >
                          <option value="">Select membership type</option>
                          <option value="school-representative">School Representative</option>
                          <option value="official-membership">Official Membership</option>
                          <option value="general-inquiry">General Inquiry</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          rows={6}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                          placeholder="Tell us about your inquiry..."
                        ></textarea>
                      </div>
                      
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-red-800 text-white py-4 rounded-lg font-semibold text-lg hover:bg-red-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            <span>Sending...</span>
                          </>
                        ) : (
                          'Send Message'
                        )}
                      </button>
                    </form>
                  </div>
                  <div className="space-y-8">
                    <div className="bg-gradient-to-br from-red-50 to-purple-50 p-8 rounded-2xl shadow-xl">
                      <h3 className="text-2xl font-bold text-gray-800 mb-6">Get in Touch</h3>
                      <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-red-800 rounded-full flex items-center justify-center text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">Email</h4>
                            <p className="text-gray-600">highschoolobserver91@gmail.com</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-red-800 rounded-full flex items-center justify-center text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">Phone</h4>
                            <p className="text-gray-600">+233 20 XXX XXXX</p>
                            <p className="text-gray-600">+233 24 XXX XXXX</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-red-800 rounded-full flex items-center justify-center text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">Address</h4>
                            <p className="text-gray-600">Accra, Ghana</p>
                            <p className="text-gray-600">Greater Accra Region</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-xl">
                      <h3 className="text-2xl font-bold text-gray-800 mb-6">Office Hours</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monday - Friday</span>
                          <span className="font-semibold">9:00 AM - 6:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Saturday</span>
                          <span className="font-semibold">10:00 AM - 4:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sunday</span>
                          <span className="font-semibold">Closed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === 'social-media' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-gray-800 mb-6">Follow Us on Social Media</h2>
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
                            <span className="mr-2 inline-flex">
                              <RealIcon symbol="👥" className="w-4 h-4" colorClassName="text-white" />
                            </span>
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
              </motion.div>
            )}
            {activeTab === 'locations' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Locations</h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Find us in various locations across Ghana where we have active chapters and members.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[
                    {
                      city: 'Accra',
                      region: 'Greater Accra',
                      members: '500+',
                      schools: '25+',
                      description: 'Our main headquarters and largest chapter with active members from various schools.'
                    },
                    {
                      city: 'Kumasi',
                      region: 'Ashanti Region',
                      members: '300+',
                      schools: '15+',
                      description: 'Growing chapter with strong presence in the Ashanti region schools.'
                    },
                    {
                      city: 'Tamale',
                      region: 'Northern Region',
                      members: '200+',
                      schools: '10+',
                      description: 'Northern chapter serving schools in the Northern region of Ghana.'
                    },
                    {
                      city: 'Cape Coast',
                      region: 'Central Region',
                      members: '250+',
                      schools: '12+',
                      description: 'Coastal chapter with members from schools in the Central region.'
                    },
                    {
                      city: 'Ho',
                      region: 'Volta Region',
                      members: '180+',
                      schools: '8+',
                      description: 'Volta region chapter connecting students from the eastern part of Ghana.'
                    },
                    {
                      city: 'Sunyani',
                      region: 'Bono Region',
                      members: '150+',
                      schools: '6+',
                      description: 'Bono region chapter serving schools in the western part of Ghana.'
                    }
                  ].map((location, index) => (
                    <motion.div
                      key={location.city}
                      className="bg-white p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 group cursor-pointer"
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.7 }}
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 group-hover:scale-110 transition-transform">
                          {location.city.charAt(0)}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">{location.city}</h3>
                        <p className="text-gray-600 mb-4">{location.region}</p>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-xl font-bold text-red-800">{location.members}</div>
                            <div className="text-sm text-gray-600">Members</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-red-800">{location.schools}</div>
                            <div className="text-sm text-gray-600">Schools</div>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm">{location.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.section>
        <motion.section 
          className="py-20 bg-gradient-to-r from-red-800 to-purple-800 text-white"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="container mx-auto px-4 text-center">
            {isAuthenticated ? (
              <>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 inline-flex items-center justify-center gap-3 flex-wrap">
                  <span>Welcome back, {user?.first_name || 'Member'}!</span>
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white/10 border border-white/20">
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                  </span>
                </h2>
                <p className="text-2xl mb-8 max-w-3xl mx-auto">
                  Thank you for being part of the HSO community. Explore more opportunities and connect with fellow members.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/dashboard">
                    <button className="px-10 py-4 bg-white text-red-800 rounded-lg font-bold text-lg shadow hover:bg-red-100 transition transform hover:scale-105">
                      Go to Dashboard
                    </button>
                  </Link>
                  <Link to="/events">
                    <button className="px-10 py-4 border-2 border-white text-white rounded-lg font-bold text-lg shadow hover:bg-white hover:text-red-800 transition transform hover:scale-105">
                      Browse Events
                    </button>
                  </Link>
                  <Link to="/shop">
                    <button className="px-10 py-4 border-2 border-white text-white rounded-lg font-bold text-lg shadow hover:bg-white hover:text-red-800 transition transform hover:scale-105">
                      Visit Shop
                    </button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Join HSO?</h2>
                <p className="text-2xl mb-8 max-w-3xl mx-auto">
                  Connect with thousands of students across Ghana and start your journey with High School Observer.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/register">
                    <button className="px-10 py-4 bg-white text-red-800 rounded-lg font-bold text-lg shadow hover:bg-red-100 transition transform hover:scale-105">
                      Create Account
                    </button>
                  </Link>
                  <Link to="/about">
                    <button className="px-10 py-4 border-2 border-white text-white rounded-lg font-bold text-lg shadow hover:bg-white hover:text-red-800 transition transform hover:scale-105">
                      Learn More
                    </button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </motion.section>
      </div>
    </>
  )
}

export default Contact 