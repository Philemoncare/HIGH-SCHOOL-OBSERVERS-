import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

function AdminMagazinesModal({ open, magazine, onClose, mode = 'view' }) {
  const [form, setForm] = useState(magazine || { is_featured: false })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(magazine || { is_featured: false })
  }, [magazine])

  if (!open) return null

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      if (mode === 'add') {
        await axios.post('/api/magazine', form)
      } else if (mode === 'edit') {
        await axios.put(`/api/magazine/${magazine._id}`, form)
      }
      setSaving(false)
      toast.success(mode === 'add' ? 'Magazine created successfully!' : 'Magazine updated successfully!')
      onSave?.()
      onClose()
    } catch (err) {
      setSaving(false)
      const msg = err.response?.data?.error || err.response?.data?.message
      const details = err.response?.data?.details
      toast.error(details ? `${msg || 'Failed to save magazine'}: ${details}` : (msg || 'Failed to save magazine'))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-4">{mode === 'add' ? 'Add Magazine' : mode === 'edit' ? 'Edit Magazine' : 'Magazine Details'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input name="title" value={form.title || ''} onChange={handleChange} className="border rounded px-3 py-2 w-full" disabled={mode === 'view'} required />
          </div>
          <div>
            <label className="block text-sm font-medium">Issue Number</label>
            <input name="issue_number" value={form.issue_number || ''} onChange={handleChange} className="border rounded px-3 py-2 w-full" disabled={mode === 'view'} />
          </div>
          <div>
            <label className="block text-sm font-medium">Cover Image URL</label>
            <input name="cover_image" value={form.cover_image || ''} onChange={handleChange} className="border rounded px-3 py-2 w-full" disabled={mode === 'view'} />
          </div>
          <div>
            <label className="block text-sm font-medium">PDF URL</label>
            <input name="pdf_url" value={form.pdf_url || ''} onChange={handleChange} className="border rounded px-3 py-2 w-full" disabled={mode === 'view'} />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea name="description" value={form.description || ''} onChange={handleChange} className="border rounded px-3 py-2 w-full" disabled={mode === 'view'} />
          </div>
          <div>
            <label className="block text-sm font-medium">Publish Date</label>
            <input name="publish_date" type="date" value={form.publish_date ? form.publish_date.substring(0,10) : ''} onChange={handleChange} className="border rounded px-3 py-2 w-full" disabled={mode === 'view'} />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="is_featured" checked={!!form.is_featured} onChange={handleChange} disabled={mode === 'view'} /> Featured
            </label>
          </div>
          {mode !== 'view' && (
            <button type="submit" className="bg-red-700 text-white px-4 py-2 rounded font-bold" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          )}
        </form>
      </div>
    </div>
  )
}

export default AdminMagazinesModal 