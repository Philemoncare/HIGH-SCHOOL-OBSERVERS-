import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'
import DonationPaymentModal from '../components/DonationPaymentModal'
import RealIcon from '../components/RealIcon'

function Events() {
  const [activeTab, setActiveTab] = useState('events') // 'events' or 'donations'
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [events, setEvents] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (activeTab === 'events') {
      fetchEvents()
    } else {
      fetchCampaigns()
    }
  }, [activeTab, page, searchTerm, selectedCategory])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/events/public')
      setEvents(response.data.events || [])
    } catch (error) {
      console.error('Error fetching events:', error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page,
        limit: 12,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory !== 'all' && { category: selectedCategory })
      })

      const response = await axios.get(`/api/donations/public?${params}`)
      setCampaigns(response.data.campaigns || [])
      setTotalPages(response.data.pagination?.total || 1)
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      setCampaigns([])
    } finally {
      setLoading(false)
    }
  }

  const eventCategories = [
    { id: 'all', name: 'All Events', icon: '📅' },
    { id: 'conference', name: 'Conferences', icon: '🎤' },
    { id: 'workshop', name: 'Workshops', icon: '🔧' },
    { id: 'symposium', name: 'Symposiums', icon: '🎓' },
    { id: 'briefing', name: 'Briefings', icon: '📋' },
    { id: 'networking', name: 'Networking', icon: '🤝' },
    { id: 'summit', name: 'Summits', icon: '🏔️' }
  ]

  const donationCategories = [
    { id: 'all', name: 'All Categories' },
    { id: 'education', name: 'Education' },
    { id: 'healthcare', name: 'Healthcare' },
    { id: 'infrastructure', name: 'Infrastructure' },
    { id: 'emergency', name: 'Emergency' },
    { id: 'general', name: 'General' }
  ]

  // Filter events based on search term and selected category
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    if (amount == null || amount === '') return '₵0'
    const str = String(amount).trim()
    if (str.startsWith('₵') || /^GHS\s*/i.test(str)) return str
    const num = parseFloat(str.replace(/[^\d.-]/g, '')) || 0
    return `₵${num.toLocaleString()}`
  }

  const getProgressPercentage = (raised, goal) => {
    return Math.min((raised / goal) * 100, 100)
  }

  const getRegistrationStatus = (event) => {
    const percentage = (event.registered / event.capacity) * 100
    
    if (percentage >= 90) return { status: 'Almost Full', color: 'bg-red-100 text-red-800', bg: 'bg-red-500' }
    if (percentage >= 75) return { status: 'Limited', color: 'bg-yellow-100 text-yellow-800', bg: 'bg-yellow-500' }
    return { status: 'Available', color: 'bg-green-100 text-green-800', bg: 'bg-green-500' }
  }

  const getCategoryColor = (category, type = 'event') => {
    if (type === 'donation') {
      switch (category) {
        case 'education': return 'bg-blue-100 text-blue-800'
        case 'healthcare': return 'bg-green-100 text-green-800'
        case 'infrastructure': return 'bg-purple-100 text-purple-800'
        case 'emergency': return 'bg-red-100 text-red-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }
    
    const colors = {
      conference: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
      workshop: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
      symposium: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
      briefing: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
      networking: { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
      summit: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' }
    }
    return colors[category] || { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
  }

  const handleDonate = (campaign) => {
    setSelectedCampaign(campaign)
    setPaymentModalOpen(true)
  }

  const handlePaymentSuccess = () => {
    fetchCampaigns()
  }

  if (loading && events.length === 0 && campaigns.length === 0) {
    return (
      <>
        <Helmet>
          <title>Events & Donations - High School Observer</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>Events & Donations - High School Observer</title>
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Events & Donations</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover educational events, workshops, and support our mission through donation campaigns.
            </p>
          </motion.div>

          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-xl shadow-lg p-2 inline-flex gap-2">
              <button
                onClick={() => {
                  setActiveTab('events')
                  setSelectedCategory('all')
                  setSearchTerm('')
                }}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'events'
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📅 Events
              </button>
              <button
                onClick={() => {
                  setActiveTab('donations')
                  setSelectedCategory('all')
                  setSearchTerm('')
                }}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'donations'
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                💝 Donations
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full lg:w-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={activeTab === 'events' 
                      ? "Search events by title, description, or location..." 
                      : "Search campaigns by title, description, or beneficiary..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {activeTab === 'events' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {(activeTab === 'events' ? eventCategories : donationCategories).map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-red-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                  }`}
                >
                  {category.icon && (
                    <span className="inline-flex items-center justify-center">
                      <RealIcon symbol={category.icon} className="w-4 h-4" colorClassName="text-current" />
                    </span>
                  )}
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'events' ? (
            // Events Display
            filteredEvents.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </motion.div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                {filteredEvents.map((event, index) => {
                  const registrationStatus = getRegistrationStatus(event)
                  const categoryColors = getCategoryColor(event.category, 'event')
                  
                  return (
                    <motion.div
                      key={event._id || event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={viewMode === 'grid' ? 
                        "bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0" :
                        "bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border-0"
                      }
                    >
                      {viewMode === 'grid' ? (
                        <>
                          <div className="relative h-40 overflow-hidden">
                            <img
                              src={event.image || ''}
                              alt={event.title}
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src = "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=250&fit=crop"
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                            <div className="absolute top-3 right-3">
                              <div className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-red-600 shadow-lg">
                                {formatCurrency(event.price)}
                              </div>
                            </div>
                            <div className="absolute bottom-3 left-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors.bg} ${categoryColors.text} shadow-lg`}>
                                {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                              </span>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                              {event.title}
                            </h3>
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
                                <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formatDate(event.date)}
                              </div>
                              <div className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
                                <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {event.time}
                              </div>
                            </div>
                            <div className="flex items-center text-xs text-gray-500 mb-3">
                              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {event.location}
                            </div>
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${registrationStatus.color}`}>
                                  {registrationStatus.status}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {event.registered}/{event.capacity}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`${registrationStatus.bg} h-2 rounded-full transition-all duration-500`}
                                  style={{ width: `${Math.min((event.registered / event.capacity) * 100, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                            <Link
                              to={`/events/${event._id || event.id}`}
                              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-2.5 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                            >
                              <span>View Details</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </div>
                        </>
                      ) : (
                        <div className="flex bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4">
                          <div className="w-40 h-28 flex-shrink-0 rounded-xl overflow-hidden">
                            <img
                              src={event.image || ''}
                              alt={event.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src = "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=250&fit=crop"
                              }}
                            />
                          </div>
                          <div className="flex-1 ml-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                  {event.title}
                                </h3>
                                <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                                  <div className="flex items-center">
                                    <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {formatDate(event.date)}
                                  </div>
                                  <div className="flex items-center">
                                    <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {event.time}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-lg font-bold text-red-600 mb-1">
                                  {formatCurrency(event.price)}
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${registrationStatus.color}`}>
                                  {registrationStatus.status}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors.bg} ${categoryColors.text}`}>
                                  {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {event.registered}/{event.capacity} registered
                                </span>
                              </div>
                              <Link
                                to={`/events/${event._id || event.id}`}
                                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-semibold text-sm shadow-lg"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            )
          ) : (
            // Donations Display
            campaigns.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-400 text-2xl">💝</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                  {campaigns.map((campaign, index) => (
                    <motion.div
                      key={campaign._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="h-32 overflow-hidden">
                        {campaign.image ? (
                          <img 
                            src={campaign.image} 
                            alt={campaign.title}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop"
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                            <span className="text-white text-2xl">💝</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <div className="flex items-center gap-1 mb-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(campaign.category, 'donation')}`}>
                            {campaign.category}
                          </span>
                          {campaign.featured && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              ⭐ Featured
                            </span>
                          )}
                          {campaign.urgent && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              🔔 Urgent
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                          {campaign.title}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {campaign.description}
                        </p>
                        <p className="text-xs text-gray-500 mb-2">
                          <span className="font-medium">Beneficiary:</span> {campaign.beneficiary}
                        </p>
                        <div className="space-y-1 mb-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Raised</span>
                            <span className="font-semibold text-green-600">{formatCurrency(campaign.raised_amount)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Goal</span>
                            <span className="font-semibold">{formatCurrency(campaign.goal_amount)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-blue-500 h-1 rounded-full transition-all duration-500"
                              style={{ width: `${getProgressPercentage(campaign.raised_amount, campaign.goal_amount)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 text-center">
                            {getProgressPercentage(campaign.raised_amount, campaign.goal_amount).toFixed(1)}% Complete
                          </p>
                        </div>
                        <button 
                          onClick={() => handleDonate(campaign)}
                          className="w-full bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 rounded-lg transition-colors duration-200 font-medium text-xs"
                        >
                          Donate Now
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 text-gray-600">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )
          )}
        </div>
      </div>

      <DonationPaymentModal
        open={paymentModalOpen}
        campaign={selectedCampaign}
        onClose={() => {
          setPaymentModalOpen(false)
          setSelectedCampaign(null)
        }}
        onSuccess={handlePaymentSuccess}
      />
    </>
  )
}

export default Events
