import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Calendar, ArrowRight } from 'lucide-react'

function Magazine() {
  const [magazines, setMagazines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    fetch('/api/magazine')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        const list = Array.isArray(data) ? data : (data.magazines || [])
        if (mounted) setMagazines(list)
      })
      .catch(() => mounted && setMagazines([]))
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  const featured = magazines.filter(m => m.is_featured)
  const published = magazines.filter(m => {
    const d = m.publish_date ? new Date(m.publish_date) : null
    return !d || d <= new Date()
  })
  const spotlight = featured[0] || published[0]

  return (
    <>
      <Helmet>
        <title>Magazine - High School Observer</title>
        <meta name="description" content="Read our quarterly magazine featuring insights from educational leaders" />
      </Helmet>

      <div className="min-h-screen bg-[#fafbfc]">
        <section className="relative py-16 sm:py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 text-sm font-medium mb-6">
                <BookOpen className="w-4 h-4" />
                Quarterly Publication
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-4">
                HSO Magazine
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Insights, stories, and perspectives from educational leaders. Our quarterly publication for the High School Observer community.
              </p>
            </motion.div>
          </div>
        </section>
        <section className="pb-20">
          <div className="container mx-auto px-4 max-w-6xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-500 border-t-transparent mb-4" />
                <p className="text-gray-600">Loading magazine...</p>
              </div>
            ) : magazines.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-gray-200 shadow-sm p-12 text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-10 h-10 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Latest Issue Coming Soon</h2>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  We're preparing our next issue with exclusive content from leading educators, policy updates, and success stories from schools across the country.
                </p>
                <p className="text-sm text-gray-500">
                  Subscribe to our newsletter to be notified when new issues are published.
                </p>
              </motion.div>
            ) : (
              <>
                {spotlight && (
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-12"
                  >
                    <Link
                      to={spotlight.pdf_url || spotlight.flipbook_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block bg-white rounded-3xl border border-gray-200 shadow-lg hover:shadow-xl transition-all overflow-hidden"
                    >
                      <div className="grid md:grid-cols-5 gap-0">
                        <div className="md:col-span-2 relative h-64 md:h-auto min-h-[280px] bg-gradient-to-br from-indigo-600 to-purple-700 overflow-hidden">
                          {spotlight.cover_image ? (
                            <img src={spotlight.cover_image} alt={spotlight.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <BookOpen className="w-20 h-20 text-white/30" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          {spotlight.is_featured && (
                            <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-amber-400/95 text-gray-900 text-xs font-bold uppercase">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="md:col-span-3 flex flex-col justify-center p-8 md:p-10">
                          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                            {spotlight.title}
                          </h2>
                          {spotlight.issue_number && (
                            <p className="text-indigo-600 font-semibold text-sm mb-3">Issue {spotlight.issue_number}</p>
                          )}
                          {spotlight.publish_date && (
                            <p className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                              <Calendar className="w-4 h-4" />
                              {new Date(spotlight.publish_date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                            </p>
                          )}
                          {spotlight.description && (
                            <p className="text-gray-600 leading-relaxed line-clamp-3 mb-6">{spotlight.description}</p>
                          )}
                          <span className="inline-flex items-center gap-2 text-indigo-600 font-semibold group-hover:gap-3 transition-all">
                            Read issue
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(spotlight ? magazines.filter(m => m._id !== spotlight._id) : magazines).map((issue, index) => (
                    <motion.div
                      key={issue._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.06 }}
                    >
                      <a
                        href={issue.pdf_url || issue.flipbook_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-xl hover:border-indigo-100 transition-all overflow-hidden h-full"
                      >
                        <div className="relative h-48 bg-gradient-to-br from-indigo-500/90 to-purple-600 overflow-hidden">
                          {issue.cover_image ? (
                            <img src={issue.cover_image} alt={issue.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <BookOpen className="w-14 h-14 text-white/40" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          {issue.is_featured && (
                            <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-400/95 text-gray-900 text-xs font-bold">
                              Featured
                            </span>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <h3 className="font-bold text-lg drop-shadow-md">{issue.title}</h3>
                            {issue.issue_number && <p className="text-sm text-white/90">Issue {issue.issue_number}</p>}
                          </div>
                        </div>
                        <div className="p-4">
                          {issue.publish_date && (
                            <p className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(issue.publish_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          )}
                          {issue.description && <p className="text-sm text-gray-600 line-clamp-2">{issue.description}</p>}
                        </div>
                      </a>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </>
  )
}

export default Magazine
