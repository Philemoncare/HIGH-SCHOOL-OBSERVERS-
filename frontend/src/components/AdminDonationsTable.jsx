import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import RealIcon from './RealIcon'

function AdminDonationsTable({ 
  campaigns, 
  onView, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onToggleFeatured 
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.beneficiary.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || campaign.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCampaigns = filteredCampaigns.slice(startIndex, startIndex + itemsPerPage)

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: '✅' },
      paused: { color: 'bg-yellow-100 text-yellow-800', icon: '⏸️' },
      completed: { color: 'bg-blue-100 text-blue-800', icon: '✅' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: '❌' }
    }
    
    const config = statusConfig[status] || statusConfig.active
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color} flex items-center gap-1`}>
        <RealIcon symbol={config.icon} className="w-3.5 h-3.5" colorClassName="text-current" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getCategoryBadge = (category) => {
    const categoryConfig = {
      education: { color: 'bg-blue-100 text-blue-800', icon: '📚' },
      health: { color: 'bg-red-100 text-red-800', icon: '🏥' },
      emergency: { color: 'bg-orange-100 text-orange-800', icon: '🚨' },
      community: { color: 'bg-purple-100 text-purple-800', icon: '🏘️' },
      other: { color: 'bg-gray-100 text-gray-800', icon: '📋' }
    }
    
    const config = categoryConfig[category] || categoryConfig.other
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color} flex items-center gap-1`}>
        <RealIcon symbol={config.icon} className="w-3.5 h-3.5" colorClassName="text-current" />
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </span>
    )
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getProgressPercentage = (raised, goal) => {
    return Math.min((raised / goal) * 100, 100)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full divide-y divide-gray-200 table-fixed">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">Campaign</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">Progress</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Category</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Created</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6 pr-8">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredCampaigns.map((campaign) => (
            <tr key={campaign._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden relative">
                    <span className={`text-gray-500 text-lg absolute inset-0 flex items-center justify-center ${campaign.image && !String(campaign.image).startsWith('blob:') ? 'hidden' : ''}`} aria-hidden>💝</span>
                    {campaign.image && !String(campaign.image).startsWith('blob:') && (
                      <img 
                        src={campaign.image} 
                        alt={campaign.title} 
                        className="w-12 h-12 rounded-lg object-cover absolute inset-0"
                        onError={(e) => { e.target.style.display = 'none'; e.target.previousElementSibling?.classList.remove('hidden'); }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{campaign.title}</p>
                      {campaign.featured && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          ⭐ Featured
                        </span>
                      )}
                      {campaign.urgent && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          🔔 Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{campaign.beneficiary}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{campaign.description}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Raised ₵{campaign.raised_amount?.toLocaleString()}</span>
                    <span className="text-gray-600">Goal ₵{campaign.goal_amount?.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((campaign.raised_amount / campaign.goal_amount) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {((campaign.raised_amount / campaign.goal_amount) * 100).toFixed(1)}%
                  </p>
                </div>
              </td>
              <td className="px-4 py-4">
                {getCategoryBadge(campaign.category)}
              </td>
              <td className="px-4 py-4">
                {getStatusBadge(campaign.status)}
              </td>
              <td className="px-4 py-4 text-sm text-gray-500">
                {formatDate(campaign.created_at)}
              </td>
              <td className="px-4 py-4 table-cell-actions">
                <div className="action-buttons-container flex items-center justify-start gap-2">
                  <button
                    onClick={() => onView(campaign)}
                    className="action-button text-blue-600 hover:text-blue-800 hover:bg-blue-50 hover:border-blue-200"
                    title="View Campaign"
                  >
                    <span className="text-lg">👁️</span>
                  </button>
                  <button
                    onClick={() => onEdit(campaign)}
                    className="action-button text-green-600 hover:text-green-800 hover:bg-green-50 hover:border-green-200"
                    title="Edit Campaign"
                  >
                    <span className="text-lg">✏️</span>
                  </button>
                  <button
                    onClick={() => onToggleStatus(campaign._id)}
                    className={`action-button ${
                      campaign.status === 'active' 
                        ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 hover:border-yellow-200' 
                        : 'text-green-600 hover:text-green-800 hover:bg-green-50 hover:border-green-200'
                    }`}
                    title={campaign.status === 'active' ? 'Pause Campaign' : 'Activate Campaign'}
                  >
                    <span className="text-lg">{campaign.status === 'active' ? '⏸️' : '▶️'}</span>
                  </button>
                  <button
                    onClick={() => onToggleFeatured(campaign._id)}
                    className={`action-button ${
                      campaign.featured 
                        ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 hover:border-yellow-200' 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-200'
                    }`}
                    title={campaign.featured ? 'Remove from Featured' : 'Mark as Featured'}
                  >
                    <span className="text-lg">{campaign.featured ? '⭐' : '☆'}</span>
                  </button>
                  <button
                    onClick={() => onDelete(campaign._id)}
                    className="action-button text-red-600 hover:text-red-800 hover:bg-red-50 hover:border-red-200"
                    title="Delete Campaign"
                  >
                    <span className="text-lg">🗑️</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminDonationsTable 