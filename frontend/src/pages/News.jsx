import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Calendar, User, Tag, ArrowRight, Eye, Clock, TrendingUp, BookOpen, Sparkles } from 'lucide-react'
import axios from 'axios'

function News() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid') // grid or list
  const [sortBy, setSortBy] = useState('latest') // latest, popular, oldest

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      setLoading(true)
      console.log('[News Page] Fetching public news articles...')
      
      // Fetch from public API endpoint
      const response = await axios.get('/api/news/public', {
        validateStatus: function (status) {
          return status < 500; // Resolve only if the status code is less than 500
        }
      })
      
      console.log('[News Page] API Response status:', response.status)
      console.log('[News Page] API Response data:', response.data)
      
      if (response.status === 200 && response.data) {
        const apiArticles = (response.data.articles || [])
          .filter(a => {
            // CRITICAL: Only include manually created articles (data consistency check)
            if (!a.created_by) {
              console.warn('[News Page] Article missing created_by - excluding:', a._id || a.id)
              return false
            }
            return true
          })
          .map(a => ({
            id: a._id || a.id,
            title: a.title || 'Untitled Article',
            excerpt: a.excerpt || a.summary || (a.content ? a.content.replace(/<[^>]+>/g, '').slice(0, 160) : '') || 'No excerpt available',
            category: a.category || 'education',
            author: a.author || 'HSO Editorial',
            date: a.published_at || a.date || a.created_at || new Date().toISOString(),
            slug: a.slug,
            image: a.image || a.image_url || null,
            tags: Array.isArray(a.tags) ? a.tags : (typeof a.tags === 'string' ? a.tags.split(',').map(s => s.trim()).filter(Boolean) : []),
            readTime: a.readTime || '3 min read',
            views: a.views || a.view_count || 0,
            featured: !!a.featured,
            created_by: a.created_by // Ensure created_by is preserved
          }))
        
        console.log('[News Page] Processed', apiArticles.length, 'manually created articles from API')
        
        // Only merge locally created drafts that are published (manual posts from admin)
        // Also filter out any drafts that match articles already in API (to avoid duplicates)
        const drafts = JSON.parse(localStorage.getItem('admin_news_drafts') || '[]')
        const apiIds = new Set((apiArticles || []).map(a => String(a.id || a._id).toLowerCase()))
        const apiSlugs = new Set((apiArticles || []).map(a => (a.slug || '').toLowerCase()))
        
        const publishedDrafts = drafts.filter(d => {
          const isPublished = (d.status || 'published') === 'published'
          const hasId = !!d._id
          const hasCreatedBy = !!d.created_by // Only include manually created drafts
          const notInAPI = !apiIds.has(String(d._id || '').toLowerCase()) && 
                          !apiSlugs.has((d.slug || '').toLowerCase())
          return isPublished && hasId && hasCreatedBy && notInAPI
        })
        
        // Normalize fields to match public view expectations
        const normalizedDrafts = publishedDrafts.map(d => ({
          id: d._id,
          title: d.title,
          excerpt: d.excerpt || (d.content ? d.content.replace(/<[^>]+>/g, '').slice(0, 160) : '') || '—',
          category: d.category || 'education',
          author: d.author || 'HSO Editorial',
          date: d.published_at || new Date().toISOString(),
          slug: d.slug || `draft-${d._id}`,
          image: d.image || d.image_url || null,
          tags: Array.isArray(d.tags) ? d.tags : (typeof d.tags === 'string' ? d.tags.split(',').map(s=>s.trim()).filter(Boolean) : []),
          readTime: d.readTime || '3 min read',
          views: d.views || 0,
          featured: !!d.featured
        }))
        
        const allArticles = [...normalizedDrafts, ...apiArticles]
        console.log('[News Page] Total articles to display:', allArticles.length)
        setArticles(allArticles)
      } else {
        // If API fails, show empty state (no fallback data)
        console.warn('[News Page] API returned status:', response.status, 'showing empty state')
        setArticles([])
      }
    } catch (error) {
      console.error('[News Page] Error fetching news:', error)
      console.error('[News Page] Error details:', error.response?.data || error.message)
      
      // Only use local drafts if API fails, but no fallback articles
      try {
        const drafts = JSON.parse(localStorage.getItem('admin_news_drafts') || '[]')
        const publishedDrafts = drafts.filter(d => {
          const isPublished = (d.status || 'published') === 'published'
          const hasId = !!d._id
          return isPublished && hasId
        })
        const normalizedDrafts = publishedDrafts.map(d => ({
          id: d._id,
          title: d.title,
          excerpt: d.excerpt || (d.content ? d.content.replace(/<[^>]+>/g, '').slice(0, 160) : '') || '—',
          category: d.category || 'education',
          author: d.author || 'HSO Editorial',
          date: d.published_at || new Date().toISOString(),
          slug: d.slug || `draft-${d._id}`,
          image: d.image || d.image_url || null,
          tags: Array.isArray(d.tags) ? d.tags : (typeof d.tags === 'string' ? d.tags.split(',').map(s=>s.trim()).filter(Boolean) : []),
          readTime: d.readTime || '3 min read',
          views: d.views || 0,
          featured: !!d.featured
        }))
        setArticles(normalizedDrafts) // No fallback articles
      } catch (err) {
        console.error('[News Page] Error processing drafts:', err)
        setArticles([]) // Show empty state instead of fallback
      }
    } finally {
      setLoading(false)
    }
  }

  // Removed getFallbackArticles - no more fake/fallback data
  // Articles will only show if they exist in the database or localStorage

  const categories = [
    { id: 'all', name: 'All Categories', icon: BookOpen, color: 'gray' },
    { id: 'technology', name: 'Technology', icon: TrendingUp, color: 'blue' },
    { id: 'wellness', name: 'Student Wellness', icon: Sparkles, color: 'green' },
    { id: 'policy', name: 'Policy Updates', icon: Eye, color: 'red' },
    { id: 'sustainability', name: 'Sustainability', icon: Clock, color: 'emerald' },
    { id: 'community', name: 'Community', icon: User, color: 'purple' },
    { id: 'leadership', name: 'Leadership', icon: TrendingUp, color: 'orange' }
  ]

  // Filter and sort news
  const filteredNews = articles
    .filter(article =>
    (categoryFilter === 'all' || !categoryFilter || article.category === categoryFilter) &&
      (tagFilter === '' || (article.tags && article.tags.includes(tagFilter))) &&
      (searchTerm === '' || 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.author.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.date) - new Date(a.date)
        case 'oldest':
          return new Date(a.date) - new Date(b.date)
        case 'popular':
          return (b.views || 0) - (a.views || 0)
        default:
          return 0
      }
    })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getCategoryColor = (category) => {
    const colorMap = {
      technology: 'blue',
      wellness: 'green',
      policy: 'red',
      sustainability: 'emerald',
      community: 'purple',
      leadership: 'orange'
    }
    return colorMap[category] || 'gray'
  }

  if (loading) {
    return (
      <>
        <Helmet>
          <title>News - HSO Platform</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-red-600 mx-auto mb-4"></div>
              <motion.div
                animate={{ 
                  background: [
                    "linear-gradient(45deg, #ef4444, #dc2626)",
                    "linear-gradient(45deg, #dc2626, #b91c1c)",
                    "linear-gradient(45deg, #b91c1c, #ef4444)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full blur-xl opacity-20"
              />
            </div>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-700 font-semibold text-lg"
            >
              Loading Latest News...
            </motion.p>
          </motion.div>
        </div>
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>News - HSO Platform</title>
        <meta name="description" content="Stay informed with the latest updates in education, policy changes, and insights from the education community." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="container mx-auto px-6 py-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-900 via-red-800 to-gray-900 bg-clip-text text-transparent">
              Latest News
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Stay informed with the latest updates in education, policy changes, and insights from the education community.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search news articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  >
                    <option value="latest">Latest</option>
                    <option value="popular">Most Popular</option>
                    <option value="oldest">Oldest</option>
                  </select>

                  <div className="flex bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-4 py-3 rounded-lg transition-all duration-200 ${
                        viewMode === 'grid' 
                          ? 'bg-white shadow-sm text-gray-900' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-4 py-3 rounded-lg transition-all duration-200 ${
                        viewMode === 'list' 
                          ? 'bg-white shadow-sm text-gray-900' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      List
                    </button>
                </div>
              </div>
            </div>
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => {
                  const Icon = category.icon
                  return (
                    <motion.button
                  key={category.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                  onClick={() => setCategoryFilter(category.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    categoryFilter === category.id
                          ? `bg-${category.color}-600 text-white shadow-lg`
                          : 'bg-white/80 text-gray-700 hover:bg-gray-50 border border-gray-200/50 backdrop-blur-sm'
                  }`}
                >
                      <Icon className="w-4 h-4" />
                  {category.name}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </motion.div>
          <AnimatePresence mode="wait">
            {filteredNews.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">No articles found</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Try adjusting your search criteria or browse different categories to discover relevant content.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  : "space-y-6"
                }
              >
                {filteredNews.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden hover:shadow-2xl transition-all duration-300 ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    <div className={`relative overflow-hidden bg-gray-200 ${
                      viewMode === 'list' ? 'w-80 h-48' : 'h-48'
                    }`}>
                    {article.image && article.image.trim() !== '' && !article.image.includes('placeholder') ? (
                      <img
                        src={article.image}
                        alt={article.title || 'Article image'}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        onError={(e) => {
                          // If image fails to load, show placeholder
                          e.target.style.display = 'none'
                          const placeholder = e.target.parentElement.querySelector('.image-placeholder')
                          if (placeholder) placeholder.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div className={`image-placeholder absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 ${article.image && article.image.trim() !== '' && !article.image.includes('placeholder') && !article.image.includes('default-news') ? 'hidden' : ''}`}>
                      <span className="text-gray-400 text-4xl">📰</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 bg-${getCategoryColor(article.category)}-600 text-white rounded-full text-xs font-medium`}>
                        {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                      </span>
                      </div>
                      {article.featured && (
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full text-xs font-medium">
                            Featured
                          </span>
                        </div>
                      )}
                  </div>
                    <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-red-700 transition-colors">
                      {article.title}
                    </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <User className="w-4 h-4" />
                        {article.author}
                      </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                        {formatDate(article.date)}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {article.readTime}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {article.views?.toLocaleString() || '0'} views
                          </div>
                      </div>
                    </div>
                    {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {article.tags.map((tag, tagIndex) => (
                          <span
                              key={tagIndex}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <Link
                      to={`/news/${article.slug}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                    >
                      Read More
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  </motion.div>
              ))}
              </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}

export default News 