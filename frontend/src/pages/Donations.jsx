import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import axios from 'axios'
import { motion } from 'framer-motion'
import DonationPaymentModal from '../components/DonationPaymentModal'

function Donations() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState(null)

  useEffect(() => {
    fetchCampaigns()
  }, [page, searchTerm, categoryFilter])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page,
        limit: 12,
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter && { category: categoryFilter })
      })

      const response = await axios.get(`/api/donations/public?${params}`)
      setCampaigns(response.data.campaigns)
      setTotalPages(response.data.pagination.total)
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      // Fallback to mock data if API fails
      setCampaigns([
        {
          _id: 1,
          title: "School Infrastructure Improvement",
          description: "Help us improve school infrastructure by providing better facilities, modern equipment, and safe learning environments for students across the region.",
          category: "education",
          beneficiary: "Regional Schools Development Fund",
          raised_amount: 32000,
          goal_amount: 50000,
          image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop",
          featured: true,
          urgent: true
        },
        {
          _id: 2,
          title: "Student Scholarship Program",
          description: "Support bright students from underprivileged backgrounds by providing scholarships for their education. Every contribution makes a difference in a student's life.",
          category: "education",
          beneficiary: "Student Scholarship Foundation",
          raised_amount: 18500,
          goal_amount: 25000,
          image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop",
          featured: false,
          urgent: false
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return `₵${amount?.toLocaleString()}`
  }

  const getProgressPercentage = (raised, goal) => {
    return Math.min((raised / goal) * 100, 100)
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'education': return 'bg-blue-100 text-blue-800'
      case 'healthcare': return 'bg-green-100 text-green-800'
      case 'infrastructure': return 'bg-purple-100 text-purple-800'
      case 'emergency': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDonate = (campaign) => {
    setSelectedCampaign(campaign)
    setPaymentModalOpen(true)
  }

  const handlePaymentSuccess = () => {
    // Refresh campaigns to update raised amounts
    fetchCampaigns()
  }

  return (
    <>
      <Helmet>
        <title>Donations - High School Observer</title>
        <meta name="description" content="Support High School Observer's mission to empower school representatives" />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-6 sm:mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4"
            >
              Support Our Mission
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4"
            >
              Help us continue empowering school representatives and fostering educational excellence through our donation campaigns.
            </motion.p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-200">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search campaigns by title, description, or beneficiary..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="">All Categories</option>
                <option value="education">Education</option>
                <option value="healthcare">Healthcare</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="emergency">Emergency</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading donation campaigns...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : campaigns.length === 0 ? (
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
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(campaign.category)}`}>
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

export default Donations 