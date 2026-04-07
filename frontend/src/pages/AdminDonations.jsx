import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import axios from 'axios'
import toast from 'react-hot-toast'
import AdminDonationsTable from '../components/AdminDonationsTable'
import AdminDonationsModal from '../components/AdminDonationsModal'

function AdminDonations() {
  const [campaigns, setCampaigns] = useState([])
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalRaised: 0,
    totalGoal: 0
  })
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [modalMode, setModalMode] = useState('view')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchCampaigns()
    fetchStats()
  }, [currentPage, searchTerm, statusFilter, categoryFilter])

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
      setCampaigns(response.data.campaigns)
      setTotalPages(response.data.pagination.total)
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      toast.dismiss('donations-load-error')
      toast.error('Failed to load donation campaigns', {
        id: 'donations-load-error'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/donations/stats/overview')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleView = (campaign) => {
    setSelectedCampaign(campaign)
    setModalMode('view')
    setModalOpen(true)
  }

  const handleEdit = (campaign) => {
    setSelectedCampaign(campaign)
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleAdd = () => {
    setSelectedCampaign(null)
    setModalMode('add')
    setModalOpen(true)
  }

  const handleDelete = async (campaignId) => {
    if (!window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return
    }

    try {
      await axios.delete(`/api/donations/${campaignId}`)
      toast.success('Campaign deleted successfully')
      fetchCampaigns()
      fetchStats()
    } catch (error) {
      console.error('Error deleting campaign:', error)
      toast.dismiss('donation-delete-error')
      toast.error('Failed to delete campaign', {
        id: 'donation-delete-error'
      })
    }
  }

  const handleToggleStatus = async (campaignId) => {
    try {
      await axios.patch(`/api/donations/${campaignId}/toggle-status`)
      toast.success('Campaign status updated successfully')
      fetchCampaigns()
      fetchStats()
    } catch (error) {
      console.error('Error toggling status:', error)
      toast.dismiss('donation-status-error')
      toast.error('Failed to update campaign status', {
        id: 'donation-status-error'
      })
    }
  }

  const handleToggleFeatured = async (campaignId) => {
    try {
      await axios.patch(`/api/donations/${campaignId}/toggle-featured`)
      toast.success('Featured status updated successfully')
      fetchCampaigns()
    } catch (error) {
      console.error('Error toggling featured:', error)
      toast.dismiss('donation-featured-error')
      toast.error('Failed to update featured status', {
        id: 'donation-featured-error'
      })
    }
  }

  const handleModalSave = () => {
    fetchCampaigns()
    fetchStats()
  }

  const formatCurrency = (amount) => {
    return `₵${amount?.toLocaleString()}`
  }

  return (
    <>
      <Helmet>
        <title>Donations Management - HSO Admin</title>
        <meta name="description" content="Manage donation campaigns and track fundraising progress" />
      </Helmet>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Donations Management</h1>
                <p className="text-gray-600">Manage donation campaigns and track fundraising progress</p>
              </div>
              <button
                onClick={handleAdd}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <span>➕</span>
                Add Campaign
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCampaigns}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeCampaigns}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Raised</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRaised)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Goal</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalGoal)}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
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
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Donation Campaigns</h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading campaigns...</p>
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-gray-400 text-2xl">💝</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
                  <button
                    onClick={handleAdd}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Create First Campaign
                  </button>
                </div>
              ) : (
                <>
                  <AdminDonationsTable
                    campaigns={campaigns}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                    onToggleFeatured={handleToggleFeatured}
                  />
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-6">
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
              )}
            </div>
          </div>
        </div>
      </div>
      <AdminDonationsModal
        open={modalOpen}
        donation={selectedCampaign}
        onClose={() => setModalOpen(false)}
        onSave={handleModalSave}
        mode={modalMode}
      />
    </>
  )
}

export default AdminDonations 