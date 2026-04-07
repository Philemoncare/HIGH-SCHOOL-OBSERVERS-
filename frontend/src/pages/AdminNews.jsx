import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import axios from 'axios'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Newspaper, Plus, Search, Filter, TrendingUp, Eye, FileText, Star, Calendar } from 'lucide-react'
import AdminNewsTable from '../components/AdminNewsTable'
import AdminNewsModal from '../components/AdminNewsModal'
import AdvancedAdminNavigation from '../components/AdvancedAdminNavigation'
import { useNavigation } from '../contexts/NavigationContext'

function AdminNews() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { goBack } = useNavigation()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [currentArticle, setCurrentArticle] = useState(null)
  const [modalMode, setModalMode] = useState('add')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState(searchParams.get('filter') || 'all')
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalViews: 0
  })
  const [localDraftCount, setLocalDraftCount] = useState(0)

  useEffect(() => {
    fetchArticles()
    fetchStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Fetch on mount

  // Refetch when filter changes
  useEffect(() => {
    if (filterStatus) {
      const timeoutId = setTimeout(() => {
        fetchArticles()
      }, 100) // Small delay to avoid double fetch on mount
      return () => clearTimeout(timeoutId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus])
  
  // Note: localStorage cleanup is handled in fetchArticles() to avoid double fetching

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const params = {
        limit: 1000 // Get all articles for admin view
      }
      // Only add status filter if it's not 'all'
      if (filterStatus && filterStatus !== 'all') {
        params.status = filterStatus
      }
      
      const response = await axios.get('/api/news', { params })
      const apiArticles = (response.data.articles || []).map(article => ({
        ...article,
        image: article.image || article.image_url || null,
        image_url: article.image || article.image_url || null,
        status: article.status || 'draft',
        view_count: article.view_count || 0,
        _id: article._id || article.id
      }))
      
      console.log('[Admin News] Fetched', apiArticles.length, 'articles from API')
      
      const isLocalDraft = (a) => {
        const id = String(a?._id || a?.id || '')
        return !!a?.__local || id.startsWith('local-')
      }

      // Only merge local drafts that don't exist in API (truly local-only drafts)
      // CRITICAL: local drafts are NEVER treated as "published" (DB is the source of truth for published)
      const localDraftsRaw = JSON.parse(localStorage.getItem('admin_news_drafts') || '[]')
      const localDrafts = (Array.isArray(localDraftsRaw) ? localDraftsRaw : [])
        .filter(isLocalDraft)
        .map(d => ({
          ...d,
          __local: true,
          status: 'draft'
        }))
      // Get IDs from API to check against
      const apiIds = new Set((apiArticles || []).map(a => String(a._id || a.id).toLowerCase()))
      const apiSlugs = new Set((apiArticles || []).map(a => (a.slug || '').toLowerCase()))
      const apiTitles = new Set((apiArticles || []).map(a => (a.title || '').toLowerCase()))
      
      // Filter out drafts that match API articles (already saved) or deleted articles
      const dedupDrafts = (localDrafts || []).filter(d => {
        const id = String(d._id || '').toLowerCase()
        const slug = (d.slug || '').toLowerCase()
        const title = (d.title || '').toLowerCase()
        // Keep only if it doesn't exist in API (truly local draft)
        return !(apiIds.has(id) || apiSlugs.has(slug) || apiTitles.has(title))
      })
      
      // Clean up localStorage - remove drafts that are now in API (saved) or deleted
      if (dedupDrafts.length !== localDrafts.length) {
        localStorage.setItem('admin_news_drafts', JSON.stringify(dedupDrafts))
        console.log('[Admin News] Cleaned', localDrafts.length - dedupDrafts.length, 'items from localStorage')
      }
      
      setLocalDraftCount(dedupDrafts.length)

      // Only show local drafts in "All" and "Draft" views.
      const shouldIncludeLocalDrafts = filterStatus === 'all' || filterStatus === 'draft'

      // Sort merged articles by created_at (newest first)
      const merged = [...(shouldIncludeLocalDrafts ? dedupDrafts : []), ...apiArticles].sort((a, b) => {
        const dateA = new Date(a.created_at || a.date || 0)
        const dateB = new Date(b.created_at || b.date || 0)
        return dateB - dateA
      })
      
      console.log('[Admin News] Total articles (API + local drafts):', merged.length)
      setArticles(merged)
    } catch (error) {
      console.error('Error fetching articles:', error)
      // Fall back to local drafts only
      const localDrafts = JSON.parse(localStorage.getItem('admin_news_drafts') || '[]')
      setArticles(localDrafts)
      setLocalDraftCount(Array.isArray(localDrafts) ? localDrafts.length : 0)
      if (localDrafts.length === 0) {
        toast.dismiss('news-load-error')
        toast.error('Failed to load news articles', {
          id: 'news-load-error'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      console.log('[Admin News] Fetching stats...')
      const response = await axios.get('/api/news/stats/overview')
      console.log('[Admin News] Stats response:', response.data)
      
      if (response.data) {
        const statsData = {
          totalArticles: Number(response.data.totalArticles) || 0,
          publishedArticles: Number(response.data.publishedArticles) || 0,
          draftArticles: Number(response.data.draftArticles) || 0,
          totalViews: Number(response.data.totalViews) || 0
        }
        
        console.log('[Admin News] Setting stats:', statsData)
        setStats(statsData)
      } else {
        console.warn('[Admin News] No stats data in response')
        setStats({
          totalArticles: 0,
          publishedArticles: 0,
          draftArticles: 0,
          totalViews: 0
        })
      }
    } catch (error) {
      console.error('[Admin News] Error fetching stats:', error)
      console.error('[Admin News] Error response:', error.response?.data)
      // Keep stats at 0 if API fails - don't show fake data
      setStats({
        totalArticles: 0,
        publishedArticles: 0,
        draftArticles: 0,
        totalViews: 0
      })
    }
  }

  const handleAddArticle = () => {
    setCurrentArticle(null)
    setModalMode('add')
    setShowModal(true)
  }

  const handleViewArticle = (article) => {
    setCurrentArticle(article)
    setModalMode('view')
    setShowModal(true)
  }

  const handleEditArticle = (article) => {
    setCurrentArticle(article)
    setModalMode('edit')
    setShowModal(true)
  }

  // Saving happens inside AdminNewsModal to avoid double-create. This callback just refreshes UI.
  const handleSaveArticle = () => {
    setShowModal(false)
    // Refresh articles - localStorage cleanup happens in fetchArticles
    fetchArticles()
    fetchStats()
  }

  const handleDeleteArticle = async (articleId) => {
    if (!window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) return

    try {
      const response = await axios.delete(`/api/news/${articleId}`)
      
      if (response.data && response.data.deletedId) {
        toast.success('Article deleted successfully!')
        
        // Immediately remove from UI (optimistic update)
        setArticles(prev => prev.filter(a => {
          const id = String(a._id || a.id)
          const deleteId = String(articleId)
          return id !== deleteId
        }))
        
        // Clean localStorage
        try {
          const key = 'admin_news_drafts'
          const drafts = JSON.parse(localStorage.getItem(key) || '[]')
          const filteredDrafts = drafts.filter(d => {
            const id = String(d._id || '')
            const deleteId = String(articleId)
            return id !== deleteId
          })
          localStorage.setItem(key, JSON.stringify(filteredDrafts))
        } catch (err) {
          console.warn('Could not clean localStorage:', err)
        }
        
        // Refresh data from server to ensure consistency
        await Promise.all([fetchArticles(), fetchStats()])
      } else {
        throw new Error('Invalid delete response')
      }
    } catch (error) {
      console.error('[Admin News] Delete error:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete article'
      
      // Fallback: delete from local drafts and UI
      try {
        const key = 'admin_news_drafts'
        const drafts = JSON.parse(localStorage.getItem(key) || '[]')
        const next = drafts.filter(d => {
          const id = String(d._id || '')
          const deleteId = String(articleId)
          return id !== deleteId
        })
        localStorage.setItem(key, JSON.stringify(next))
        // Remove from UI immediately
        setArticles(prev => prev.filter(a => {
          const id = String(a._id || a.id)
          const deleteId = String(articleId)
          return id !== deleteId
        }))
        toast.success('Deleted local draft')
      } catch (_) {
        toast.dismiss('news-delete-error')
        toast.error(errorMessage, {
          id: 'news-delete-error'
        })
      }
    }
  }

  const handleToggleStatus = async (articleId) => {
    try {
      const a = articles.find(x => String(x?._id || x?.id) === String(articleId))
      const isLocal = !!a?.__local || String(a?._id || a?.id || '').startsWith('local-')
      if (isLocal) {
        toast.error('This is a local draft. Save it to the server before publishing.')
        return
      }
      await axios.patch(`/api/news/${articleId}/toggle-status`)
      toast.success('Article status updated!')
      fetchArticles()
    } catch (error) {
      // Fallback: toggle status in local drafts
      try {
        const key = 'admin_news_drafts'
        const drafts = JSON.parse(localStorage.getItem(key) || '[]')
        const next = drafts.map(d => d._id === articleId ? { ...d, status: d.status === 'published' ? 'draft' : 'published' } : d)
        localStorage.setItem(key, JSON.stringify(next))
        setArticles(prev => prev.map(a => a._id === articleId ? { ...a, status: a.status === 'published' ? 'draft' : 'published' } : a))
        toast.success('Article status updated locally')
      } catch (_) {
        toast.dismiss('news-status-error')
        toast.error('Failed to update article status', {
          id: 'news-status-error'
        })
      }
    }
  }

  const handleToggleFeatured = async (articleId) => {
    try {
      const a = articles.find(x => String(x?._id || x?.id) === String(articleId))
      const isLocal = !!a?.__local || String(a?._id || a?.id || '').startsWith('local-')
      if (isLocal) {
        toast.error('This is a local draft. Save it to the server before featuring.')
        return
      }
      await axios.patch(`/api/news/${articleId}/toggle-featured`)
      toast.success('Featured status updated!')
      fetchArticles()
    } catch (error) {
      // Fallback: toggle featured in local drafts
      try {
        const key = 'admin_news_drafts'
        const drafts = JSON.parse(localStorage.getItem(key) || '[]')
        const next = drafts.map(d => d._id === articleId ? { ...d, featured: !d.featured } : d)
        localStorage.setItem(key, JSON.stringify(next))
        setArticles(prev => prev.map(a => a._id === articleId ? { ...a, featured: !a.featured } : a))
        toast.success('Featured status updated locally')
      } catch (_) {
        toast.dismiss('news-featured-error')
        toast.error('Failed to update featured status', {
          id: 'news-featured-error'
        })
      }
    }
  }

  // Note: Filtering is now handled by AdminNewsTable component

  return (
    <>
      <Helmet>
        <title>Manage News - HSO Admin</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <AdvancedAdminNavigation
          title="News Management"
          subtitle="Create, edit, and manage news articles and content"
          icon={Newspaper}
          breadcrumbs={[{ label: 'News Management', path: '/admin/news' }]}
          onBack={() => goBack('/admin')}
          showSearch={true}
          searchPlaceholder="Search articles by title, author, or content..."
          onSearch={setSearchQuery}
          actions={[
            {
              label: 'Create Article',
              icon: Plus,
              primary: true,
              onClick: handleAddArticle
            }
          ]}
          quickActions={[
            { label: 'Published', icon: Eye, onClick: () => setFilterStatus('published') },
            { label: 'Drafts', icon: FileText, onClick: () => setFilterStatus('draft') },
            { label: 'Featured', icon: Star, onClick: () => setFilterStatus('featured') }
          ]}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-2">Total Articles</p>
                  <p className="text-4xl font-extrabold">{stats.totalArticles}</p>
                </div>
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Newspaper className="w-8 h-8" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium mb-2">Published</p>
                  <p className="text-4xl font-extrabold">{stats.publishedArticles}</p>
                </div>
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Eye className="w-8 h-8" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium mb-2">Drafts</p>
                  <p className="text-4xl font-extrabold">{stats.draftArticles}</p>
                </div>
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <FileText className="w-8 h-8" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium mb-2">Total Views</p>
                  <p className="text-4xl font-extrabold">{stats.totalViews.toLocaleString()}</p>
                </div>
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-8 h-8" />
                </div>
              </div>
            </motion.div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg mb-6"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">Filter Articles</h3>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {['all', 'published', 'draft', 'featured'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      filterStatus === status
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddArticle}
              className="p-6 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all text-left group"
            >
              <Plus className="w-8 h-8 mb-3 group-hover:rotate-90 transition-transform" />
              <div className="font-bold text-lg mb-1">Create Article</div>
              <div className="text-red-100 text-sm">Write a new article</div>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterStatus('published')}
              className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all text-left"
            >
              <Eye className="w-8 h-8 mb-3" />
              <div className="font-bold text-lg mb-1">Published</div>
              <div className="text-green-100 text-sm">View published articles</div>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterStatus('draft')}
              className="p-6 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all text-left"
            >
              <FileText className="w-8 h-8 mb-3" />
              <div className="font-bold text-lg mb-1">Drafts</div>
              <div className="text-yellow-100 text-sm">Continue editing</div>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterStatus('featured')}
              className="p-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all text-left"
            >
              <Star className="w-8 h-8 mb-3" />
              <div className="font-bold text-lg mb-1">Featured</div>
              <div className="text-purple-100 text-sm">Manage featured</div>
            </motion.button>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden"
          >
            <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Articles</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {stats.totalArticles > 0 || localDraftCount > 0
                      ? `Database: ${stats.totalArticles} • Local drafts: ${localDraftCount}`
                      : 'No articles found'
                    }
                  </p>
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Clear search
                  </button>
                )}
              </div>
            </div>
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Loading articles...</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Newspaper className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No articles found</h3>
                <p className="text-gray-600 mb-6 text-lg">
                  Create your first article to get started
                </p>
                <button
                  onClick={handleAddArticle}
                  className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Create First Article
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <AdminNewsTable
                  articles={articles}
                  initialStatus={filterStatus === 'all' ? '' : filterStatus}
                  onView={handleViewArticle}
                  onEdit={handleEditArticle}
                  onDelete={handleDeleteArticle}
                  onToggleStatus={handleToggleStatus}
                  onToggleFeatured={handleToggleFeatured}
                />
              </div>
            )}
          </motion.div>
        </div>
        <AnimatePresence>
          {showModal && (
            <AdminNewsModal
              open={showModal}
              news={currentArticle}
              mode={modalMode}
              onSave={handleSaveArticle}
              onClose={() => setShowModal(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export default AdminNews 