import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import axios from 'axios'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import AdminMagazinesTable from '../components/AdminMagazinesTable'
import AdminMagazinesModal from '../components/AdminMagazinesModal'

function AdminMagazines() {
  const [magazines, setMagazines] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [currentMagazine, setCurrentMagazine] = useState(null)
  const [modalMode, setModalMode] = useState('add')
  const [stats, setStats] = useState({
    totalMagazines: 0,
    publishedMagazines: 0,
    draftMagazines: 0,
    totalDownloads: 0
  })

  useEffect(() => {
    fetchMagazines()
    fetchStats()
  }, [])

  const fetchMagazines = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/magazine')
      const data = response.data
      setMagazines(Array.isArray(data) ? data : (data.magazines || []))
    } catch (error) {
      console.error('Error fetching magazines:', error)
      toast.dismiss('magazines-load-error')
      toast.error('Failed to load magazines', {
        id: 'magazines-load-error'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/magazine/stats/overview')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleAddMagazine = () => {
    setCurrentMagazine(null)
    setModalMode('add')
    setShowModal(true)
  }

  const handleViewMagazine = (magazine) => {
    setCurrentMagazine(magazine)
    setModalMode('view')
    setShowModal(true)
  }

  const handleEditMagazine = (magazine) => {
    setCurrentMagazine(magazine)
    setModalMode('edit')
    setShowModal(true)
  }

  const handleSaveMagazine = async (magazineData) => {
    try {
      if (magazineData != null) {
        if (modalMode === 'add') {
          await axios.post('/api/magazine', magazineData)
          toast.success('Magazine created successfully!')
        } else if (currentMagazine) {
          await axios.put(`/api/magazine/${currentMagazine._id}`, magazineData)
          toast.success('Magazine updated successfully!')
        }
      }
      setShowModal(false)
      fetchMagazines()
      fetchStats()
    } catch (error) {
      toast.dismiss('magazine-save-error')
      toast.error(error.response?.data?.message || 'Failed to save magazine', {
        id: 'magazine-save-error'
      })
    }
  }

  const handleDeleteMagazine = async (magazineId) => {
    if (!window.confirm('Are you sure you want to delete this magazine?')) return

    try {
      await axios.delete(`/api/magazine/${magazineId}`)
      toast.success('Magazine deleted successfully!')
      fetchMagazines()
      fetchStats()
    } catch (error) {
      toast.dismiss('magazine-delete-error')
      toast.error('Failed to delete magazine', {
        id: 'magazine-delete-error'
      })
    }
  }

  const handleToggleStatus = async (magazineId) => {
    try {
      await axios.patch(`/api/magazine/${magazineId}/toggle-status`)
      toast.success('Magazine status updated!')
      fetchMagazines()
    } catch (error) {
      toast.dismiss('magazine-status-error')
      toast.error('Failed to update magazine status', {
        id: 'magazine-status-error'
      })
    }
  }

  const handleToggleFeatured = async (magazineId) => {
    try {
      await axios.patch(`/api/magazine/${magazineId}/toggle-featured`)
      toast.success('Featured status updated!')
      fetchMagazines()
    } catch (error) {
      toast.dismiss('magazine-featured-error')
      toast.error('Failed to update featured status', {
        id: 'magazine-featured-error'
      })
    }
  }

  return (
    <>
      <Helmet>
        <title>Manage Magazines - HSO Admin</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Magazine Management</h1>
                <p className="text-sm text-gray-600">Manage digital magazines and publications</p>
              </div>
              <button
                onClick={handleAddMagazine}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm flex items-center gap-2"
              >
                <span>+</span>
                Add Magazine
              </button>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            {[
              { label: 'Total Magazines', value: stats.totalMagazines ?? 0, icon: '📚', bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-100' },
              { label: 'Published', value: stats.publishedMagazines ?? 0, icon: '✅', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-100' },
              { label: 'Drafts', value: stats.draftMagazines ?? 0, icon: '📝', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-100' },
              { label: 'Total Downloads', value: stats.totalDownloads ?? 0, icon: '⬇️', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-100' },
            ].map((card, i) => (
              <div
                key={card.label}
                className={`bg-white rounded-2xl p-5 border ${card.border} shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{card.label}</p>
                    <p className={`mt-1 text-2xl font-extrabold tabular-nums ${card.text}`}>
                      {typeof card.value === 'number' && card.label === 'Total Downloads' ? card.value.toLocaleString() : card.value}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      Live count
                    </span>
                  </div>
                  <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center text-xl`}>
                    {card.icon}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm mb-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={handleAddMagazine}
                className="p-4 border-2 border-red-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-all duration-200 text-left"
              >
                <div className="text-2xl mb-2">📚</div>
                <div className="font-semibold text-red-800">Add Magazine</div>
                <div className="text-sm text-gray-600">Create new magazine</div>
              </button>
              
              <button
                onClick={() => window.open('/admin/magazines?filter=published', '_self')}
                className="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all duration-200 text-left"
              >
                <div className="text-2xl mb-2">✅</div>
                <div className="font-semibold text-green-800">Published</div>
                <div className="text-sm text-gray-600">View published</div>
              </button>
              
              <button
                onClick={() => window.open('/admin/magazines?filter=draft', '_self')}
                className="p-4 border-2 border-yellow-200 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-all duration-200 text-left"
              >
                <div className="text-2xl mb-2">📄</div>
                <div className="font-semibold text-yellow-800">Drafts</div>
                <div className="text-sm text-gray-600">View drafts</div>
              </button>
              
              <button
                onClick={() => window.open('/admin/magazines?filter=featured', '_self')}
                className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 text-left"
              >
                <div className="text-2xl mb-2">⭐</div>
                <div className="font-semibold text-purple-800">Featured</div>
                <div className="text-sm text-gray-600">Manage featured</div>
              </button>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
          >
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading magazines...</p>
              </div>
            ) : magazines.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-400 text-2xl">📚</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No magazines yet</h3>
                <p className="text-gray-600 mb-4">Add your first magazine to get started</p>
                <button
                  onClick={handleAddMagazine}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Add First Magazine
                </button>
              </div>
            ) : (
              <AdminMagazinesTable
                magazines={magazines}
                onView={handleViewMagazine}
                onEdit={handleEditMagazine}
                onDelete={handleDeleteMagazine}
                onToggleStatus={handleToggleStatus}
                onToggleFeatured={handleToggleFeatured}
              />
            )}
          </motion.div>
        </div>
        <AnimatePresence>
          {showModal && (
            <AdminMagazinesModal
              open={showModal}
              magazine={currentMagazine}
              mode={modalMode}
              onSave={handleSaveMagazine}
              onClose={() => setShowModal(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export default AdminMagazines 