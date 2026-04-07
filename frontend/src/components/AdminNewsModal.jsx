import { useState, useEffect } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import axios from 'axios'
import toast from 'react-hot-toast'

const slugify = (text = '') => text
  .toString()
  .toLowerCase()
  .trim()
  .replace(/\s+/g, '-')
  .replace(/&/g, '-and-')
  .replace(/[^a-z0-9-]/g, '')
  .replace(/--+/g, '-')
  .slice(0, 120)

function AdminNewsModal({ open, news, onClose, onSave, mode = 'view' }) {
  const [form, setForm] = useState(news || { status: 'draft', featured: false })
  const [image, setImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(news || { status: 'draft', featured: false })
    setImage(null)
  }, [news])

  if (!open) return null

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleContentChange = value => {
    setForm(f => ({ ...f, content: value }))
  }

  const handleImageUpload = async e => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      // Store as base64 so it persists across refresh and works in both admin and public views
      // Save to both fields for compatibility
      setForm(f => ({ ...f, image: base64, image_url: base64 }))
    } catch (_) {
      // ignore
    } finally {
      setUploading(false)
    }
  }

  const handleTagsChange = e => {
    setForm(f => ({ ...f, tags: e.target.value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    if (!form.title || !form.title.trim()) {
      setSaving(false)
      toast.error('Title is required')
      return
    }
    try {
      // Build payload per backend schema
      const validCategories = ['policy', 'technology', 'wellness', 'education', 'leadership', 'finance', 'news']
      const catRaw = (form.category || 'education').toString().toLowerCase().trim()
      const category = validCategories.includes(catRaw) ? catRaw : 'news'

      const plain = (form.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      const excerptVal = (form.excerpt || '').trim() || plain.slice(0, 500)
      if (excerptVal.length < 1) {
        toast.error('Excerpt is required (it can be short).')
        setSaving(false)
        return
      }
      if (plain.length < 1) {
        toast.error('Article content is required (it can be short).')
        setSaving(false)
        return
      }

      const payload = {
        title: form.title?.trim(),
        excerpt: excerptVal.slice(0, 500),
        content: form.content || '',
        category,
        author: form.author || 'HSO Editorial',
        slug: form.slug || slugify(form.title || ''),
        image: form.image || form.image_url || '',
        tags: Array.isArray(form.tags) ? form.tags : (typeof form.tags === 'string' ? form.tags.split(',').map(s=>s.trim()).filter(Boolean) : []),
        status: form.status || 'published',
        featured: !!form.featured,
      }
      let savedArticle
      if (mode === 'add') {
        console.log('[AdminNewsModal] Creating article:', payload)
        const response = await axios.post('/api/news', payload)
        savedArticle = response.data
        console.log('[AdminNewsModal] Article created successfully:', savedArticle?._id)
      } else if (mode === 'edit') {
        console.log('[AdminNewsModal] Updating article:', news._id, payload)
        const response = await axios.put(`/api/news/${news._id}`, payload)
        savedArticle = response.data
        console.log('[AdminNewsModal] Article updated successfully:', savedArticle?._id)
      }
      
      // Verify the article was saved with created_by
      if (savedArticle && !savedArticle.created_by) {
        console.warn('[AdminNewsModal] WARNING: Article saved without created_by field!', savedArticle._id)
      }
      
      setSaving(false)
      onClose()
      onSave && onSave()
    } catch (err) {
      console.error('[AdminNewsModal] Error saving article:', err)
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to save article'
      const details = err.response?.data?.details
      let detailStr = ''
      if (details) {
        detailStr = Array.isArray(details)
          ? details.map(d => (typeof d === 'string' ? d : (d.message || `${d.field}: ${d.value || ''}`))).join('. ')
          : String(details)
      }
      toast.error(detailStr ? `${msg}: ${detailStr}` : msg)
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="relative bg-gradient-to-r from-red-700 to-red-800 text-white px-6 py-4">
          <h2 className="text-xl sm:text-2xl font-bold">
            {mode === 'add' ? 'Create Article' : mode === 'edit' ? 'Edit Article' : 'Article Details'}
          </h2>
          <button 
            className="absolute right-4 top-4 text-white/80 hover:text-white text-2xl leading-none"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 pt-6 pb-2 space-y-6 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input 
              name="title" 
              value={form.title || ''} 
              onChange={handleChange} 
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
              disabled={mode === 'view'} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <ReactQuill 
                value={form.content || ''} 
                onChange={handleContentChange} 
                readOnly={mode === 'view'} 
                theme={mode === 'view' ? 'bubble' : 'snow'} 
                className="min-h-[200px]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
            {form.image_url && (
              <img src={form.image_url} alt="News" className="h-40 rounded-lg mb-3 object-cover w-full" />
            )}
            {mode !== 'view' && (
              <div className="flex items-center gap-3">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  disabled={uploading}
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer"
                />
                {uploading && <div className="text-sm text-gray-500">Uploading...</div>}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
              <input 
                name="tags" 
                value={form.tags || ''} 
                onChange={handleTagsChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                disabled={mode === 'view'} 
                placeholder="education, policy, events" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <input 
                name="category" 
                value={form.category || ''} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                disabled={mode === 'view'} 
                placeholder="policy, events, news" 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SEO Title</label>
              <input 
                name="seo_title" 
                value={form.seo_title || ''} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                disabled={mode === 'view'} 
                placeholder="SEO optimized title" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SEO Description</label>
              <input 
                name="seo_description" 
                value={form.seo_description || ''} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                disabled={mode === 'view'} 
                placeholder="Concise summary for search engines" 
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" name="featured" checked={!!form.featured} onChange={handleChange} disabled={mode === 'view'} className="rounded text-red-600 focus:ring-red-500" />
              Featured
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <span>Status</span>
              <select name="status" value={form.status} onChange={handleChange} className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500" disabled={mode === 'view'}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" name="comments_enabled" checked={!!form.comments_enabled} onChange={handleChange} disabled={mode === 'view'} className="rounded text-red-600 focus:ring-red-500" />
              Enable Comments
            </label>
          </div>
        </form>
        {mode !== 'view' && (
          <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={handleSubmit} className="px-5 py-2.5 rounded-lg bg-red-700 text-white font-semibold shadow hover:bg-red-800 disabled:opacity-60" disabled={saving}>{saving ? 'Saving…' : 'Save Article'}</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminNewsModal 