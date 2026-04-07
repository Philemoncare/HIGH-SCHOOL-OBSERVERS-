import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

function AdminNewsTable({ articles = [], initialStatus = '', onView, onEdit, onDelete, onToggleStatus, onToggleFeatured }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(initialStatus || '')
  const [categoryFilter, setCategoryFilter] = useState('')

  // Update status filter when initialStatus changes
  useEffect(() => {
    if (initialStatus !== undefined) {
      setStatusFilter(initialStatus || '')
    }
  }, [initialStatus])

  // Ensure we have articles array
  const articlesList = Array.isArray(articles) ? articles : []

  // Filter articles based on search and filters
  const filteredArticles = articlesList.filter(article => {
    if (!article) return false
    
    const title = (article?.title || '').toLowerCase()
    const excerpt = (article?.excerpt || article?.content || '').toLowerCase()
    const author = (article?.author || '').toLowerCase()
    const matchesSearch = !search || search.trim() === '' ||
                         title.includes(search.toLowerCase()) ||
                         excerpt.includes(search.toLowerCase()) ||
                         author.includes(search.toLowerCase())
    
    const matchesStatus = !statusFilter || statusFilter === '' || article?.status === statusFilter
    const matchesCategory = !categoryFilter || categoryFilter === '' || article?.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleDelete = async (article) => {
    if (!window.confirm(`Are you sure you want to delete "${article.title}"? This action cannot be undone.`)) return;
    
    try {
      await onDelete(article._id);
    } catch (err) {
      toast.error('Failed to delete article');
    }
  };

  const handleToggleStatus = async (article) => {
    try {
      await onToggleStatus(article._id);
    } catch (err) {
      toast.error('Failed to update article status');
    }
  };

  const handleToggleFeatured = async (article) => {
    try {
      await onToggleFeatured(article._id);
    } catch (err) {
      toast.error('Failed to update featured status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      archived: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status] || badges.draft}`}>
        {status}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    const badges = {
      policy: 'bg-blue-100 text-blue-800',
      technology: 'bg-green-100 text-green-800',
      wellness: 'bg-purple-100 text-purple-800',
      education: 'bg-orange-100 text-orange-800',
      leadership: 'bg-pink-100 text-pink-800',
      finance: 'bg-indigo-100 text-indigo-800',
      news: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[category] || 'bg-gray-100 text-gray-800'}`}>
        {category}
      </span>
    );
  };

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">All Categories</option>
            <option value="policy">Policy</option>
            <option value="technology">Technology</option>
            <option value="wellness">Wellness</option>
            <option value="education">Education</option>
            <option value="leadership">Leadership</option>
            <option value="finance">Finance</option>
            <option value="news">News</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Article</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Published</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Views</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6 pr-8">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredArticles.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <span className="text-gray-400 text-2xl">📰</span>
                    </div>
                    <p className="text-gray-500 font-medium">No articles found matching your criteria.</p>
                    <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filter options.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredArticles.map((article) => (
              <tr key={article._id || article.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-lg overflow-hidden">
                      {article.image || article.image_url ? (
                        <img
                          className="h-12 w-12 w-full object-cover"
                          src={article.image || article.image_url}
                          alt={article.title}
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.parentElement.innerHTML = '<div class="h-12 w-12 flex items-center justify-center bg-gray-200 text-gray-400 text-xs">📰</div>'
                          }}
                        />
                      ) : (
                        <div className="h-12 w-12 flex items-center justify-center bg-gray-200 text-gray-400 text-lg">
                          📰
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {article.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {(article.excerpt || article.content || '').substring(0, 60)}...
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        {article.__local && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            Local draft
                          </span>
                        )}
                        {article.featured && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⭐ Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getCategoryBadge(article.category)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {article.author || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(article.published_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {article.view_count?.toLocaleString() || '0'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(article.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center justify-start gap-2 pr-4">
                    <button
                      type="button"
                      onClick={() => onView(article)}
                      className="flex-shrink-0 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-all duration-200 rounded-lg border border-transparent hover:border-blue-200"
                      title="View Article"
                    >
                      <span className="text-lg">👁️</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(article)}
                      className="flex-shrink-0 p-2 text-green-600 hover:text-green-800 hover:bg-green-50 transition-all duration-200 rounded-lg border border-transparent hover:border-green-200"
                      title="Edit Article"
                    >
                      <span className="text-lg">✏️</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleStatus(article._id)}
                      className={`flex-shrink-0 p-2 transition-all duration-200 rounded-lg border border-transparent ${
                        article.status === 'published' 
                          ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 hover:border-yellow-200' 
                          : 'text-green-600 hover:text-green-800 hover:bg-green-50 hover:border-green-200'
                      }`}
                      title={article.status === 'published' ? 'Unpublish Article' : 'Publish Article'}
                    >
                      <span className="text-lg">{article.status === 'published' ? '⏸️' : '▶️'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleFeatured(article._id)}
                      className={`flex-shrink-0 p-2 transition-all duration-200 rounded-lg border border-transparent ${
                        article.featured 
                          ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 hover:border-yellow-200' 
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-200'
                      }`}
                      title={article.featured ? 'Remove from Featured' : 'Mark as Featured'}
                    >
                      <span className="text-lg">{article.featured ? '⭐' : '☆'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(article._id)}
                      className="flex-shrink-0 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 transition-all duration-200 rounded-lg border border-transparent hover:border-red-200"
                      title="Delete Article"
                    >
                      <span className="text-lg">🗑️</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>

      {filteredArticles.length === 0 && articlesList.length > 0 && (
        <div className="text-center py-8 mt-4">
          <p className="text-gray-500">No articles found matching your criteria.</p>
          <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filter options.</p>
        </div>
      )}
      
      {articlesList.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">📰</span>
          </div>
          <p className="text-gray-500 text-lg font-medium">No articles available</p>
          <p className="text-sm text-gray-400 mt-2">Create your first article to get started.</p>
        </div>
      )}
    </div>
  )
}

export default AdminNewsTable 