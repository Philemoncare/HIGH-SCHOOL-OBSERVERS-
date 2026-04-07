import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

function AdminDonationsModal({ open, donation, onClose, onSave, mode = 'view' }) {
  const [form, setForm] = useState(donation || { 
    status: 'active', 
    featured: false,
    category: 'education',
    urgent: false
  })
  const [image, setImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (donation) {
      setForm({
        ...donation,
        status: donation.status || 'active',
        featured: !!donation.featured,
        category: donation.category || 'education',
        urgent: !!donation.urgent,
        image: donation.image || ''
      })
    } else {
      setForm({
        status: 'active',
        featured: false,
        category: 'education',
        urgent: false,
        image: ''
      })
    }
    setImage(null)
  }, [donation, open])

  if (!open) return null

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }



  const handleImageUpload = async e => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setUploading(true)
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      setForm(f => ({ ...f, image: base64 }))
      toast.success('Image ready – save campaign to store it')
    } catch (error) {
      toast.error('Failed to process image')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    
    if (!form.title?.trim()) {
      toast.error('Campaign title is required')
      return
    }
    
    const goalNum = Number(form.goal_amount)
    if (!Number.isFinite(goalNum) || goalNum <= 0) {
      toast.error('Goal amount must be greater than 0')
      return
    }

    const payload = {
      title: form.title?.trim(),
      description: (form.description || '').trim(),
      image: form.image || null,
      goal_amount: goalNum,
      beneficiary: (form.beneficiary || '').trim(),
      category: form.category || 'education',
      status: form.status || 'active',
      featured: !!form.featured,
      urgent: !!form.urgent,
      start_date: form.start_date || null,
      end_date: form.end_date || null
    }

    setSaving(true)
    try {
      if (mode === 'add') {
        await axios.post('/api/donations', payload)
        toast.success('Donation campaign created successfully')
      } else if (mode === 'edit') {
        await axios.put(`/api/donations/${donation._id}`, payload)
        toast.success('Donation campaign updated successfully')
      }
      setSaving(false)
      onClose()
      onSave()
    } catch (err) {
      setSaving(false)
      const msg = err.response?.data?.error || err.response?.data?.message
      const details = err.response?.data?.details
      toast.error(details ? `${msg}: ${details}` : msg || 'Failed to save campaign')
    }
  }

  const categories = [
    { value: 'education', label: 'Education' },
    { value: 'health', label: 'Health' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'community', label: 'Community' },
    { value: 'other', label: 'Other' }
  ]

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-red-800">
              {mode === 'add' ? '💰 Add New Donation Campaign' : mode === 'edit' ? '✏️ Edit Donation Campaign' : '👁️ Campaign Details'}
            </h2>
            <button 
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold" 
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Title *
              </label>
              <input 
                name="title" 
                value={form.title || ''} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                disabled={mode === 'view'} 
                required 
                placeholder="Enter campaign title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select 
                name="category" 
                value={form.category || 'education'} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                disabled={mode === 'view'}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal Amount (₵) *
              </label>
              <input 
                type="number" 
                name="goal_amount" 
                value={form.goal_amount || ''} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                disabled={mode === 'view'} 
                required
                placeholder="0.00"
                min="0.01"
                step="0.01"
              />
            </div>
            

          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input 
                type="date" 
                name="start_date" 
                value={form.start_date || ''} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                disabled={mode === 'view'}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input 
                type="date" 
                name="end_date" 
                value={form.end_date || ''} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                disabled={mode === 'view'}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beneficiary
              </label>
              <input 
                name="beneficiary" 
                value={form.beneficiary || ''} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                disabled={mode === 'view'} 
                placeholder="Name of person or organization"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Description
              </label>
              <textarea 
                name="description" 
                value={form.description || ''} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                disabled={mode === 'view'} 
                placeholder="Describe the campaign, its purpose, and how the funds will be used..."
                rows="4"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Image
            </label>
            {form.image && (
              <div className="mb-4">
                <img 
                  src={form.image} 
                  alt="Campaign" 
                  className="h-48 w-full object-cover rounded-lg border"
                />
              </div>
            )}
            {mode !== 'view' && (
              <div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  disabled={uploading}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                {uploading && (
                  <div className="mt-2 text-sm text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-800 inline-block mr-2"></div>
                    Uploading image...
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select 
                name="status" 
                value={form.status || 'active'} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                disabled={mode === 'view'}
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
            

          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <input 
                type="checkbox" 
                name="featured" 
                checked={!!form.featured} 
                onChange={handleChange} 
                disabled={mode === 'view'}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">Featured Campaign</label>
            </div>
            
            <div className="flex items-center space-x-3">
              <input 
                type="checkbox" 
                name="urgent" 
                checked={!!form.urgent} 
                onChange={handleChange} 
                disabled={mode === 'view'}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">Urgent Campaign</label>
            </div>
          </div>
          {mode !== 'view' && (
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button 
                type="button" 
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={saving}
                className="px-6 py-3 bg-red-800 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  mode === 'add' ? 'Create Campaign' : 'Update Campaign'
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default AdminDonationsModal 