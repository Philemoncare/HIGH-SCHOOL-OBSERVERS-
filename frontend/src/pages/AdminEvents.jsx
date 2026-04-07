import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  CheckCircle, 
  PartyPopper, 
  DollarSign, 
  Plus, 
  Star, 
  BarChart3, 
  Search,
  Clock,
  MapPin,
  Users,
  TrendingUp,
  Award,
  Settings,
  Eye,
  Edit,
  Trash2,
  Heart,
  Zap,
  Gift
} from 'lucide-react'
import AdminEventsTable from '../components/AdminEventsTable'
import AdminEventsModal from '../components/AdminEventsModal'
import AdminDonationsTable from '../components/AdminDonationsTable'
import AdminDonationsModal from '../components/AdminDonationsModal'
import AdvancedAdminNavigation from '../components/AdvancedAdminNavigation'
import { useNavigation } from '../contexts/NavigationContext'

function AdminEvents() {
  const navigate = useNavigate()
  const { goBack } = useNavigation()
  const [activeTab, setActiveTab] = useState('events') // 'events' or 'donations'
  const [events, setEvents] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [currentEvent, setCurrentEvent] = useState(null)
  const [currentCampaign, setCurrentCampaign] = useState(null)
  const [modalMode, setModalMode] = useState('add')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    upcomingEvents: 0,
    totalRevenue: 0
  })
  const [donationStats, setDonationStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalRaised: 0,
    totalGoal: 0
  })

  useEffect(() => {
    if (activeTab === 'events') {
      fetchEvents()
      fetchStats()
    } else {
      fetchCampaigns()
      fetchDonationStats()
    }
  }, [activeTab, currentPage, searchTerm, statusFilter, categoryFilter])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/events')
      setEvents(response.data.events || [])
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.dismiss('events-load-error')
      toast.error('Failed to load events', {
        id: 'events-load-error'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/events/stats/overview')
      if (response.data) {
        setStats({
          totalEvents: response.data.totalEvents || 0,
          activeEvents: response.data.activeEvents || 0,
          upcomingEvents: response.data.upcomingEvents || 0,
          totalRevenue: response.data.totalRevenue || 0
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Keep stats at 0 if API fails - don't show fake data
      setStats({
        totalEvents: 0,
        activeEvents: 0,
        upcomingEvents: 0,
        totalRevenue: 0
      })
    }
  }

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(categoryFilter !== 'all' && { category: categoryFilter })
      })

      const response = await axios.get(`/api/donations?${params}`)
      setCampaigns(response.data.campaigns || [])
      setTotalPages(response.data.pagination?.total || 1)
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      toast.dismiss('campaigns-load-error')
      toast.error('Failed to load donation campaigns', {
        id: 'campaigns-load-error'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchDonationStats = async () => {
    try {
      const response = await axios.get('/api/donations/stats/overview')
      if (response.data) {
        setDonationStats({
          totalCampaigns: response.data.totalCampaigns || 0,
          activeCampaigns: response.data.activeCampaigns || 0,
          totalRaised: response.data.totalRaised || 0,
          totalGoal: response.data.totalGoal || 0
        })
      }
    } catch (error) {
      console.error('Error fetching donation stats:', error)
      // Keep stats at 0 if API fails - don't show fake data
      setDonationStats({
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalRaised: 0,
        totalGoal: 0
      })
    }
  }

  const handleAddEvent = () => {
    setCurrentEvent(null)
    setModalMode('add')
    setShowModal(true)
  }

  const handleViewEvent = (event) => {
    setCurrentEvent(event)
    setModalMode('view')
    setShowModal(true)
  }

  const handleEditEvent = (event) => {
    setCurrentEvent(event)
    setModalMode('edit')
    setShowModal(true)
  }

  const handleEventSaved = () => {
    setShowModal(false)
    fetchEvents()
    fetchStats()
  }

  const handleDeleteEvent = async (eventId) => {
    try {
      await axios.delete(`/api/events/${eventId}`)
      setShowModal(false)
      toast.success('Event deleted successfully')
      fetchEvents()
      fetchStats()
    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.message || 'Failed to delete event'
      toast.dismiss('event-delete-error')
      toast.error(msg, { id: 'event-delete-error' })
      fetchEvents()
    }
  }

  const handleToggleStatus = async (eventId) => {
    try {
      await axios.patch(`/api/events/${eventId}/toggle-status`)
      toast.success('Event status updated!')
      fetchEvents()
    } catch (error) {
      toast.dismiss('event-status-error')
      toast.error('Failed to update event status', {
        id: 'event-status-error'
      })
    }
  }

  const handleToggleFeatured = async (eventId) => {
    try {
      await axios.patch(`/api/events/${eventId}/toggle-featured`)
      toast.success('Featured status updated!')
      fetchEvents()
    } catch (error) {
      toast.dismiss('event-featured-error')
      toast.error('Failed to update event featured status', {
        id: 'event-featured-error'
      })
    }
  }

  // Donation handlers
  const handleAddCampaign = () => {
    setCurrentCampaign(null)
    setModalMode('add')
    setShowModal(true)
  }

  const handleViewCampaign = (campaign) => {
    setCurrentCampaign(campaign)
    setModalMode('view')
    setShowModal(true)
  }

  const handleEditCampaign = (campaign) => {
    setCurrentCampaign(campaign)
    setModalMode('edit')
    setShowModal(true)
  }

  const handleSaveCampaign = async (campaignData) => {
    try {
      if (modalMode === 'add') {
        await axios.post('/api/donations', campaignData)
        toast.success('Campaign created successfully!')
      } else {
        await axios.put(`/api/donations/${currentCampaign._id}`, campaignData)
        toast.success('Campaign updated successfully!')
      }
      setShowModal(false)
      fetchCampaigns()
      fetchDonationStats()
    } catch (error) {
      toast.dismiss('campaign-save-error')
      toast.error(error.response?.data?.message || 'Failed to save campaign', {
        id: 'campaign-save-error'
      })
    }
  }

  const handleDeleteCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return

    try {
      await axios.delete(`/api/donations/${campaignId}`)
      toast.success('Campaign deleted successfully!')
      fetchCampaigns()
      fetchDonationStats()
    } catch (error) {
      toast.dismiss('campaign-delete-error')
      toast.error('Failed to delete campaign', {
        id: 'campaign-delete-error'
      })
    }
  }

  const handleToggleCampaignStatus = async (campaignId) => {
    try {
      await axios.patch(`/api/donations/${campaignId}/toggle-status`)
      toast.success('Campaign status updated!')
      fetchCampaigns()
      fetchDonationStats()
    } catch (error) {
      toast.dismiss('campaign-status-error')
      toast.error('Failed to update campaign status', {
        id: 'campaign-status-error'
      })
    }
  }

  const handleToggleCampaignFeatured = async (campaignId) => {
    try {
      await axios.patch(`/api/donations/${campaignId}/toggle-featured`)
      toast.success('Featured status updated!')
      fetchCampaigns()
    } catch (error) {
      toast.dismiss('campaign-featured-error')
      toast.error('Failed to update campaign featured status', {
        id: 'campaign-featured-error'
      })
    }
  }

  const formatCurrency = (amount) => {
    return `₵${amount?.toLocaleString()}`
  }

  return (
    <>
      <Helmet>
        <title>Events & Donations Management - HSO Admin</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <AdvancedAdminNavigation
          title={activeTab === 'events' ? 'Events Management' : 'Donations Management'}
          subtitle={activeTab === 'events' 
            ? 'Create, schedule, and manage events and registrations'
            : 'Manage donation campaigns and track fundraising progress'}
          icon={activeTab === 'events' ? Calendar : Gift}
          breadcrumbs={[{ 
            label: activeTab === 'events' ? 'Events Management' : 'Donations Management', 
            path: '/admin/events' 
          }]}
          onBack={() => goBack('/admin')}
          showSearch={true}
          searchPlaceholder={activeTab === 'events' 
            ? 'Search events by title, location, or description...'
            : 'Search campaigns by title, category, or description...'}
          onSearch={setSearchTerm}
          actions={[
            {
              label: activeTab === 'events' ? 'Create Event' : 'Add Campaign',
              icon: Plus,
              primary: true,
              onClick: activeTab === 'events' ? handleAddEvent : handleAddCampaign
            }
          ]}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
          >
            <div className="bg-white rounded-2xl shadow-xl p-2 inline-flex gap-2 border border-gray-200">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveTab('events')
                  setSearchTerm('')
                  setStatusFilter('all')
                  setCategoryFilter('all')
                  setCurrentPage(1)
                }}
                className={`px-8 py-4 rounded-xl font-bold transition-all duration-200 flex items-center gap-3 ${
                  activeTab === 'events'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>Events</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveTab('donations')
                  setSearchTerm('')
                  setStatusFilter('all')
                  setCategoryFilter('all')
                  setCurrentPage(1)
                }}
                className={`px-8 py-4 rounded-xl font-bold transition-all duration-200 flex items-center gap-3 ${
                  activeTab === 'donations'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Gift className="w-5 h-5" />
                <span>Donations</span>
              </motion.button>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            {activeTab === 'events' ? (
              <>
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Total Events</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalEvents}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200 hover:border-green-400 transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Active Events</p>
                      <p className="text-3xl font-bold text-green-600">{stats.activeEvents}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Upcoming Events</p>
                      <p className="text-3xl font-bold text-purple-600">{stats.upcomingEvents}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                      <PartyPopper className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Total Revenue</p>
                      <p className="text-3xl font-bold text-orange-600">₵{stats.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Total Campaigns</p>
                      <p className="text-3xl font-bold text-gray-900">{donationStats.totalCampaigns}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200 hover:border-green-400 transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Active Campaigns</p>
                      <p className="text-3xl font-bold text-green-600">{donationStats.activeCampaigns}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-yellow-200 hover:border-yellow-400 transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Total Raised</p>
                      <p className="text-3xl font-bold text-yellow-600">{formatCurrency(donationStats.totalRaised)}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Total Goal</p>
                      <p className="text-3xl font-bold text-purple-600">{formatCurrency(donationStats.totalGoal)}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
          {activeTab === 'donations' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="education">Education</option>
                  <option value="health">Health</option>
                  <option value="emergency">Emergency</option>
                  <option value="community">Community</option>
                  <option value="other">Other</option>
                </select>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                    setCategoryFilter('all')
                    setCurrentPage(1)
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </motion.div>
          )}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
          >
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Loading {activeTab}...</p>
              </div>
            ) : activeTab === 'events' ? (
              events.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <PartyPopper className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No events yet</h3>
                  <p className="text-gray-600 mb-6 text-lg">Create your first event to get started</p>
                  <button
                    onClick={handleAddEvent}
                    className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3 mx-auto"
                  >
                    <Plus className="w-6 h-6" />
                    Create First Event
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <AdminEventsTable
                    events={events}
                    onView={handleViewEvent}
                    onEdit={handleEditEvent}
                    onDelete={handleDeleteEvent}
                    onToggleStatus={handleToggleStatus}
                    onToggleFeatured={handleToggleFeatured}
                  />
                </div>
              )
            ) : (
              campaigns.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No campaigns yet</h3>
                  <p className="text-gray-600 mb-6 text-lg">Create your first donation campaign to get started</p>
                  <button
                    onClick={handleAddCampaign}
                    className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3 mx-auto"
                  >
                    <Plus className="w-6 h-6" />
                    Create First Campaign
                  </button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <AdminDonationsTable
                      campaigns={campaigns}
                      onView={handleViewCampaign}
                      onEdit={handleEditCampaign}
                      onDelete={handleDeleteCampaign}
                      onToggleStatus={handleToggleCampaignStatus}
                      onToggleFeatured={handleToggleCampaignFeatured}
                    />
                  </div>
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-6 pb-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        >
                          Previous
                        </button>
                        <span className="px-4 py-2 text-gray-600">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
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
          </motion.div>
        </div>
        <AnimatePresence>
          {showModal && activeTab === 'events' && (
            <AdminEventsModal
              open={showModal}
              event={currentEvent}
              mode={modalMode}
              onSave={handleEventSaved}
              onClose={() => setShowModal(false)}
            />
          )}
          {showModal && activeTab === 'donations' && (
            <AdminDonationsModal
              open={showModal}
              donation={currentCampaign}
              mode={modalMode}
              onSave={handleSaveCampaign}
              onClose={() => setShowModal(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export default AdminEvents 