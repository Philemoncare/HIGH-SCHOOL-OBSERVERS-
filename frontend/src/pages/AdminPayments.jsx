import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Download, FileText, FileSpreadsheet, FileJson, Calendar, Filter, ChevronDown } from 'lucide-react'
import RealIcon from '../components/RealIcon'
import AdvancedAdminNavigation from '../components/AdvancedAdminNavigation'
import { useNavigation } from '../contexts/NavigationContext'

function AdminPayments() {
  const navigate = useNavigate()
  const { goBack } = useNavigation()
  const [payments, setPayments] = useState([])
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalAmount: 0,
    successfulPayments: 0,
    failedPayments: 0,
    donationPayments: 0,
    shopPayments: 0
  })
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false)
  const [systemStatus, setSystemStatus] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchPayments()
    fetchStats()
    checkSystemStatus()
  }, [currentPage, searchTerm, typeFilter, statusFilter, startDate, endDate])

  // Close download menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (downloadMenuOpen && !event.target.closest('.download-menu-container')) {
        setDownloadMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [downloadMenuOpen])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const response = await axios.get(`/api/payments/history?${params}`)
      setPayments(response.data.payments || [])
      setTotalPages(response.data.pagination?.total || 1)
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast.dismiss('payments-load-error')
      toast.error('Failed to load payment history', {
        id: 'payments-load-error'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/payments/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching payment stats:', error)
    }
  }

  const checkSystemStatus = async () => {
    try {
      const response = await axios.get('/api/payments/status')
      setSystemStatus(response.data)
    } catch (error) {
      console.error('Error checking payment system status:', error)
      setSystemStatus({
        status: 'Error checking status',
        paystack_initialized: false,
        api_key_configured: false
      })
    }
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      success: { color: 'bg-green-100 text-green-800', icon: '✅' },
      failed: { color: 'bg-red-100 text-red-800', icon: '❌' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: '🚫' }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color} flex items-center gap-1`}>
        <RealIcon symbol={config.icon} className="w-3.5 h-3.5" colorClassName="text-current" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getTypeBadge = (type) => {
    const typeConfig = {
      donation: { color: 'bg-blue-100 text-blue-800', icon: '💝', label: 'Donation' },
      shop: { color: 'bg-purple-100 text-purple-800', icon: '🛒', label: 'Shop Purchase' },
      events: { color: 'bg-green-100 text-green-800', icon: '📅', label: 'Event Registration' },
      membership: { color: 'bg-orange-100 text-orange-800', icon: '👤', label: 'Membership' }
    }
    
    const config = typeConfig[type] || { color: 'bg-gray-100 text-gray-800', icon: '💰', label: type }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color} flex items-center gap-1`}>
        <RealIcon symbol={config.icon} className="w-3.5 h-3.5" colorClassName="text-current" />
        {config.label}
      </span>
    )
  }

  const handleDownload = async (format) => {
    try {
      setDownloading(true)
      setDownloadMenuOpen(false)
      
      const params = new URLSearchParams({
        format,
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const response = await axios.get(`/api/payments/export?${params}`, {
        responseType: format === 'pdf' ? 'blob' : 'blob'
      })

      // Create download link
      const blob = new Blob([response.data], {
        type: format === 'pdf' 
          ? 'application/pdf' 
          : format === 'json' 
          ? 'application/json' 
          : 'text/csv;charset=utf-8;'
      })
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `payments_export_${timestamp}.${format}`
      link.setAttribute('download', filename)
      
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success(`Payments exported as ${format.toUpperCase()} successfully!`)
    } catch (error) {
      console.error('Error downloading payments:', error)
      toast.error('Failed to download payments. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const setDateRange = (range) => {
    const today = new Date()
    const end = new Date(today)
    end.setHours(23, 59, 59, 999)
    
    switch (range) {
      case 'today':
        setStartDate(today.toISOString().split('T')[0])
        setEndDate(today.toISOString().split('T')[0])
        break
      case 'week':
        const weekAgo = new Date(today)
        weekAgo.setDate(today.getDate() - 7)
        setStartDate(weekAgo.toISOString().split('T')[0])
        setEndDate(today.toISOString().split('T')[0])
        break
      case 'month':
        const monthAgo = new Date(today)
        monthAgo.setMonth(today.getMonth() - 1)
        setStartDate(monthAgo.toISOString().split('T')[0])
        setEndDate(today.toISOString().split('T')[0])
        break
      case 'year':
        const yearAgo = new Date(today)
        yearAgo.setFullYear(today.getFullYear() - 1)
        setStartDate(yearAgo.toISOString().split('T')[0])
        setEndDate(today.toISOString().split('T')[0])
        break
      case 'all':
        setStartDate('')
        setEndDate('')
        break
      default:
        break
    }
  }

  return (
    <>
      <Helmet>
        <title>Payment Management - HSO Admin</title>
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <AdvancedAdminNavigation
          title="Payment Management"
          subtitle="Monitor and manage all financial transactions and payment records"
          icon={Download}
          breadcrumbs={[{ label: 'Payment Management', path: '/admin/payments' }]}
          onBack={() => goBack('/admin')}
          showSearch={true}
          searchPlaceholder="Search payments by reference, email, or name..."
          onSearch={setSearchTerm}
          actions={[
            {
              label: downloading ? 'Downloading...' : 'Download',
              icon: Download,
              primary: true,
              onClick: () => setDownloadMenuOpen(!downloadMenuOpen),
              disabled: downloading
            }
          ]}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          {downloadMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="download-menu-container fixed right-8 top-24 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 min-w-[320px] max-w-[400px]"
            >
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Export Format</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleDownload('csv')}
                    disabled={downloading}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left border border-gray-200"
                  >
                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-semibold text-gray-900">CSV (Excel)</div>
                      <div className="text-xs text-gray-500">Spreadsheet format</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDownload('json')}
                    disabled={downloading}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left border border-gray-200"
                  >
                    <FileJson className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-semibold text-gray-900">JSON</div>
                      <div className="text-xs text-gray-500">Structured data format</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDownload('pdf')}
                    disabled={downloading}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left border border-gray-200"
                  >
                    <FileText className="w-5 h-5 text-red-600" />
                    <div>
                      <div className="font-semibold text-gray-900">PDF Report</div>
                      <div className="text-xs text-gray-500">Printable document</div>
                    </div>
                  </button>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Date Range</h3>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    onClick={() => setDateRange('today')}
                    className="px-3 py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setDateRange('week')}
                    className="px-3 py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Last 7 Days
                  </button>
                  <button
                    onClick={() => setDateRange('month')}
                    className="px-3 py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Last Month
                  </button>
                  <button
                    onClick={() => setDateRange('year')}
                    className="px-3 py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Last Year
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Start Date"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="End Date"
                  />
                </div>
                <button
                  onClick={() => setDateRange('all')}
                  className="w-full mt-2 px-3 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  Clear Date Range
                </button>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-xs text-gray-500">
                  Export will include all payments matching your current filters
                </p>
              </div>
            </motion.div>
          )}
          {systemStatus && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-red-800">Payment System Status</h2>
                <button
                  onClick={checkSystemStatus}
                  className="px-4 py-2 text-sm bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-2"
                >
                  <RealIcon symbol="🔄" className="w-4 h-4" colorClassName="text-emerald-600" />
                  Refresh
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${systemStatus.paystack_initialized ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium">Paystack</span>
                  <span className="text-xs text-gray-500">
                    {systemStatus.paystack_initialized ? 'Initialized' : 'Not Initialized'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${systemStatus.api_key_configured ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium">API Keys</span>
                  <span className="text-xs text-gray-500">
                    {systemStatus.api_key_configured ? 'Configured' : 'Not Configured'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Frontend URL</span>
                  <span className="text-xs text-gray-500">{systemStatus.frontend_url}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${systemStatus.status === 'Payment system ready' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-sm font-medium">Status</span>
                  <span className="text-xs text-gray-500">{systemStatus.status}</span>
                </div>
              </div>
            </motion.div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-6 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-transform"
            >
              <div className="flex items-center justify-between mb-4">
                <RealIcon symbol="💰" className="w-8 h-8" colorClassName="text-white" />
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <RealIcon symbol="📊" className="w-6 h-6" colorClassName="text-white" />
                </div>
              </div>
              <div className="text-sm font-medium opacity-90 mb-1">Total Payments</div>
              <div className="text-4xl font-extrabold mb-2">{stats.totalPayments}</div>
              <div className="text-sm opacity-80">₵{stats.totalAmount?.toLocaleString()}</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 p-6 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-transform"
            >
              <div className="flex items-center justify-between mb-4">
                <RealIcon symbol="✅" className="w-8 h-8" colorClassName="text-white" />
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl">✓</span>
                </div>
              </div>
              <div className="text-sm font-medium opacity-90 mb-1">Successful</div>
              <div className="text-4xl font-extrabold mb-2">{stats.successfulPayments}</div>
              <div className="text-sm opacity-80">Payments completed</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 p-6 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-transform"
            >
              <div className="flex items-center justify-between mb-4">
                <RealIcon symbol="💝" className="w-8 h-8" colorClassName="text-white" />
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <RealIcon symbol="💝" className="w-6 h-6" colorClassName="text-white" />
                </div>
              </div>
              <div className="text-sm font-medium opacity-90 mb-1">Donations</div>
              <div className="text-4xl font-extrabold mb-2">{stats.donationPayments}</div>
              <div className="text-sm opacity-80">Campaign donations</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 p-6 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-transform"
            >
              <div className="flex items-center justify-between mb-4">
                <RealIcon symbol="🛒" className="w-8 h-8" colorClassName="text-white" />
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <RealIcon symbol="🛍️" className="w-6 h-6" colorClassName="text-white" />
                </div>
              </div>
              <div className="text-sm font-medium opacity-90 mb-1">Shop Sales</div>
              <div className="text-4xl font-extrabold mb-2">{stats.shopPayments}</div>
              <div className="text-sm opacity-80">Product purchases</div>
            </motion.div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Filter className="w-5 h-5 text-emerald-600" />
                Search & Filter Transactions
              </h3>
              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate('')
                    setEndDate('')
                  }}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Clear Date Range
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="lg:col-span-2">
                <input
                  type="text"
                  placeholder="Search by reference, email, or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              >
                <option value="all">All Types</option>
                <option value="donation">Donations</option>
                <option value="shop">Shop Purchases</option>
                <option value="events">Event Registrations</option>
                <option value="membership">Memberships</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              >
                <option value="all">All Status</option>
                <option value="success">Successful</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                  placeholder="Start Date"
                />
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                  placeholder="End Date"
                />
              </div>
            </div>
            {(startDate || endDate) && (
              <div className="mt-3 text-sm text-gray-600">
                <span className="font-medium">Date Range:</span>{' '}
                {startDate ? new Date(startDate).toLocaleDateString() : 'All time'} -{' '}
                {endDate ? new Date(endDate).toLocaleDateString() : 'Today'}
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mr-2"></div>
                        Loading payments...
                      </div>
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      <div className="mb-3 flex justify-center">
                        <RealIcon
                          symbol="💰"
                          badge
                          className="w-7 h-7"
                          colorClassName="text-white"
                          badgeClassName="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25 flex items-center justify-center"
                          title="Payments"
                        />
                      </div>
                      <p>No payment transactions found</p>
                      <p className="text-sm">Payment history will appear here once transactions are made</p>
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.reference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTypeBadge(payment.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {formatAmount(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{payment.customer_name || 'Anonymous'}</div>
                          <div className="text-gray-500">{payment.customer_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="bg-white px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminPayments 