import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, User, Tag, ArrowLeft, Eye, Clock, MessageCircle, Share2, Bookmark, 
  Heart, Printer, Download, Copy, Facebook, Twitter, Linkedin, Mail, 
  ChevronUp, TrendingUp, BookOpen, Sparkles
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import BackButton from '../components/BackButton'

function NewsDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [relatedArticles, setRelatedArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const contentRef = useRef(null)
  const articleRef = useRef(null)

  // Reading progress indicator
  useEffect(() => {
    const handleScroll = () => {
      if (!articleRef.current) return
      
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100
      
      setReadingProgress(Math.min(100, Math.max(0, scrollPercent)))
      setShowScrollTop(scrollTop > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    async function fetchArticle() {
      setLoading(true)
      setError('')
      try {
        // Try public endpoint first (no auth required)
        const res = await axios.get(`/api/news/slug/${slug}`, {
          validateStatus: function (status) {
            return status < 500
          }
        })
        
        if (res.status === 200 && res.data) {
          const articleData = {
            ...res.data,
            id: res.data._id || res.data.id,
            image: res.data.image || res.data.image_url || null,
            content: res.data.content || '',
            date: res.data.published_at || res.data.date || res.data.created_at
          }
          setArticle(articleData)
          
          // Fetch related articles
          fetchRelatedArticles(articleData.category, articleData.id)
        } else {
          setError('Article not found')
        }
      } catch (err) {
        console.error('Error fetching article:', err)
        setError('Failed to load article. It may have been deleted.')
      } finally {
        setLoading(false)
      }
    }
    fetchArticle()
  }, [slug])

  const fetchRelatedArticles = async (category, currentId) => {
    try {
      const response = await axios.get('/api/news/public', {
        params: { category, limit: 4 }
      })
      if (response.data?.articles) {
        const related = response.data.articles
          .filter(a => (a._id || a.id) !== currentId)
          .slice(0, 3)
          .map(a => ({
            id: a._id || a.id,
            title: a.title,
            excerpt: a.excerpt,
            slug: a.slug,
            image: a.image || a.image_url,
            date: a.published_at || a.created_at,
            views: a.view_count || 0
          }))
        setRelatedArticles(related)
      }
    } catch (err) {
      console.error('Error fetching related articles:', err)
    }
  }

  const handleShare = async (platform) => {
    const url = window.location.href
    const title = article?.title || ''
    const text = article?.excerpt || ''

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`
    }

    if (platform === 'copy') {
      navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateReadTime = (content) => {
    if (!content) return '3 min read'
    const text = content.replace(/<[^>]+>/g, '')
    const words = text.split(/\s+/).length
    const minutes = Math.ceil(words / 200)
    return `${minutes} min read`
  }

  if (loading) {
    return (
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
            Loading Article...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-3xl">📄</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Article Not Found</h3>
          <p className="text-gray-600 mb-6">
            {error || 'The article you\'re looking for doesn\'t exist or may have been deleted.'}
          </p>
          <BackButton
            fallbackPath="/news"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-medium"
          >
            Back to News
          </BackButton>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{article.title} - HSO Platform</title>
        <meta name="description" content={article.excerpt || article.content?.replace(/<[^>]+>/g, '').slice(0, 160) || ''} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt || ''} />
        <meta property="og:image" content={article.image || ''} />
        <meta property="og:url" content={window.location.href} />
      </Helmet>
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-40 p-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full shadow-2xl hover:from-red-700 hover:to-red-800 transition-all"
          >
            <ChevronUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100" ref={articleRef}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <BackButton
              fallbackPath="/news"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-sm"
            >
              Back to News
            </BackButton>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden mb-8"
          >
            <div className="relative h-[500px] overflow-hidden bg-gray-200">
              {article.image && article.image.trim() !== '' && !article.image.includes('placeholder') && !article.image.includes('default-news') ? (
              <img
                src={article.image}
                  alt={article.title || 'Article image'}
                className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    const placeholder = e.target.parentElement.querySelector('.image-placeholder')
                    if (placeholder) placeholder.style.display = 'flex'
                  }}
                />
              ) : null}
              <div className={`image-placeholder absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 ${article.image && article.image.trim() !== '' && !article.image.includes('placeholder') && !article.image.includes('default-news') ? 'hidden' : ''}`}>
                <span className="text-gray-400 text-8xl">📰</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute top-6 left-6 flex gap-3">
                <span className="px-4 py-2 bg-red-600 text-white rounded-full text-sm font-medium shadow-lg">
                  {article.category?.charAt(0).toUpperCase() + article.category?.slice(1) || 'News'}
                </span>
              {article.featured && (
                  <span className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full text-sm font-medium shadow-lg">
                    ⭐ Featured
                  </span>
              )}
            </div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
                {article.title}
              </h1>
                <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{article.author || 'HSO Editorial'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                  <span>{formatDate(article.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{calculateReadTime(article.content)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{article.views?.toLocaleString() || article.view_count?.toLocaleString() || '0'} views</span>
                  </div>
                </div>
                </div>
              </div>
            <div className="p-6 border-b border-gray-200">
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setLiked(!liked)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                    liked 
                      ? 'bg-red-100 text-red-700 border-2 border-red-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                  <span className="font-medium">{liked ? 'Liked' : 'Like'}</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setBookmarked(!bookmarked)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                    bookmarked 
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                  <span className="font-medium">{bookmarked ? 'Saved' : 'Save'}</span>
                </motion.button>
                <div className="relative group">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 border-2 border-transparent"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="font-medium">Share</span>
                  </motion.button>
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <button onClick={() => handleShare('facebook')} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left">
                      <Facebook className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Facebook</span>
                    </button>
                    <button onClick={() => handleShare('twitter')} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left">
                      <Twitter className="w-4 h-4 text-blue-400" />
                      <span className="text-sm">Twitter</span>
                    </button>
                    <button onClick={() => handleShare('linkedin')} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left">
                      <Linkedin className="w-4 h-4 text-blue-700" />
                      <span className="text-sm">LinkedIn</span>
                    </button>
                    <button onClick={() => handleShare('email')} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left">
                      <Mail className="w-4 h-4 text-gray-600" />
                      <span className="text-sm">Email</span>
                    </button>
                    <button onClick={() => handleShare('copy')} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left">
                      <Copy className="w-4 h-4 text-gray-600" />
                      <span className="text-sm">Copy Link</span>
                    </button>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 border-2 border-transparent"
                >
                  <Printer className="w-4 h-4" />
                  <span className="font-medium">Print</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-8" ref={contentRef}>
                <div 
                  className="prose prose-lg prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-red-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:list-disc prose-ol:list-decimal max-w-none"
                  dangerouslySetInnerHTML={{ __html: article.content || '<p>No content available.</p>' }}
                />
              </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
                className="mt-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-8"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MessageCircle className="w-6 h-6" />
                  Comments ({comments.length})
                </h3>
                
                <form onSubmit={(e) => {
                  e.preventDefault()
                  if (commentText.trim()) {
                    setComments([...comments, { 
                      id: Date.now(), 
                      author: 'You', 
                      text: commentText, 
                      status: 'pending',
                      date: new Date().toISOString()
                    }])
                    setCommentText('')
                    toast.success('Comment submitted for moderation')
                  }
                }} className="mb-6">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 resize-none"
                    rows={4}
                    required
                    disabled={submitting}
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={submitting}
                    className="mt-3 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium disabled:opacity-50"
                  >
                    {submitting ? 'Posting...' : 'Post Comment'}
                  </motion.button>
            </form>

                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
                  ) : (
                    comments.map((comment) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                    >
                      <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                            {comment.author.charAt(0).toUpperCase()}
                          </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-gray-900">{comment.author}</span>
                            <span className="text-xs text-gray-500">{formatDate(comment.date)}</span>
                            {comment.status === 'pending' && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                  Pending Moderation
                              </span>
                            )}
                            </div>
                            <p className="text-gray-700 leading-relaxed">{comment.text}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                      </div>
                    </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  About the Author
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {(article.author || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">{article.author || 'HSO Editorial'}</p>
                    <p className="text-sm text-gray-600">Education Expert</p>
                  </div>
                </div>
              </div>
              {relatedArticles.length > 0 && (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Related Articles
                  </h3>
                  <div className="space-y-4">
                    {relatedArticles.map((related) => (
                      <Link
                        key={related.id}
                        to={`/news/${related.slug}`}
                        className="block group"
                      >
                        <div className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          {related.image ? (
                            <img
                              src={related.image}
                              alt={related.title}
                              className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 text-sm">
                              {related.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(related.date)}</p>
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {related.views || 0} views
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Article Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Views</span>
                    <span className="font-bold text-gray-900">{article.views?.toLocaleString() || article.view_count?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Read Time</span>
                    <span className="font-bold text-gray-900">{calculateReadTime(article.content)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Published</span>
                    <span className="font-bold text-gray-900">{formatDate(article.date)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}

export default NewsDetail 
