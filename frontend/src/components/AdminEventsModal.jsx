import { useState, useEffect } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import axios from 'axios'
import toast from 'react-hot-toast'

function AdminEventsModal({ open, event, onClose, onSave, mode = 'view' }) {
  const [form, setForm] = useState(event || { 
    status: 'draft', 
    featured: false,
    category: 'academic',
    registration_required: false,
    is_free: true
  })
  const [image, setImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (event) {
      setForm({
        ...event,
        status: event.status || 'draft',
        featured: !!event.featured,
        category: event.category || 'academic',
        registration_required: !!event.registration_required,
        is_free: event.is_free !== false,
        image: event.image || event.image_url || ''
      })
    } else {
      setForm({
        status: 'active',
        featured: false,
        category: 'academic',
        registration_required: false,
        is_free: true,
        image: ''
      })
    }
    setImage(null)
  }, [event, open])

  if (!open) return null

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleContentChange = value => {
    setForm(f => ({ ...f, description: value }))
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
      toast.success('Image ready – save event to store it')
    } catch (error) {
      toast.error('Failed to process image')
    } finally {
      setUploading(false)
    }
  }

  // Map frontend category/status to backend enum
  const categoryToApi = (c) => {
    const map = { academic: 'conference', sports: 'conference', cultural: 'symposium', social: 'networking', workshop: 'workshop', conference: 'conference', competition: 'conference', seminar: 'workshop' }
    return map[c] || 'conference'
  }
  const statusToApi = (s) => (s === 'published' || s === 'active' ? 'active' : (s || 'active'))

  const handleSubmit = async e => {
    e.preventDefault()

    if (!form.title?.trim()) {
      toast.error('Event title is required')
      return
    }
    const eventDate = form.event_date || form.date
    if (!eventDate) {
      toast.error('Event date is required')
      return
    }

    const startTime = form.start_time || '09:00'
    const endTime = form.end_time || '17:00'
    const timeStr = `${startTime} - ${endTime}`

    const payload = {
      title: form.title?.trim(),
      description: (form.description || '').trim(),
      category: categoryToApi(form.category),
      date: eventDate,
      time: timeStr,
      location: (form.location || '').trim(),
      organizer: (form.organizer_name || form.organizer || '').trim() || 'HSO',
      image: form.image || form.image_url || null,
      price: form.is_free ? 'Free' : String(form.price ?? '0'),
      capacity: Math.max(1, Number(form.capacity) || 100),
      status: statusToApi(form.status),
      featured: !!form.featured,
      urgent: !!form.urgent
    }

    setSaving(true)
    try {
      if (mode === 'add') {
        await axios.post('/api/events', payload)
        toast.success('Event created successfully')
      } else {
        await axios.put(`/api/events/${event._id}`, payload)
        toast.success('Event updated successfully')
      }
      onClose()
      onSave()
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message
      const details = err.response?.data?.details
      toast.error(details ? `${msg}: ${details}` : msg || 'Failed to save event')
    } finally {
      setSaving(false)
    }
  }

  const categories = [
    { value: 'academic', label: 'Academic' },
    { value: 'sports', label: 'Sports' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'social', label: 'Social' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'conference', label: 'Conference' },
    { value: 'competition', label: 'Competition' },
    { value: 'seminar', label: 'Seminar' }
  ]

  const statuses = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'completed', label: 'Completed' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-red-800">
              {mode === 'add' ? '➕ Add New Event' : mode === 'edit' ? '✏️ Edit Event' : '👁️ Event Details'}
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
                Event Title *
              </label>
              <input 
                name="title" 
                value={form.title || ''} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                disabled={mode === 'view'} 
                required 
                placeholder="Enter event title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select 
                name="category" 
                value={form.category || 'academic'} 
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Date *
              </label>
              <input 
                type="date" 
                name="event_date" 
                value={form.event_date || ''} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                disabled={mode === 'view'} 
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input 
                type="time" 
                name="start_time" 
                value={form.start_time || ''} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                disabled={mode === 'view'}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input 
                type="time" 
                name="end_time" 
                value={form.end_time || ''} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                disabled={mode === 'view'}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input 
                name="location" 
                value={form.location || ''} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                disabled={mode === 'view'} 
                placeholder="Event venue or location"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Capacity
              </label>
              <input 
                type="number" 
                name="capacity" 
                value={form.capacity || ''} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                disabled={mode === 'view'} 
                placeholder="Maximum number of attendees"
                min="1"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <input 
                type="checkbox" 
                name="is_free" 
                checked={!!form.is_free} 
                onChange={handleChange} 
                disabled={mode === 'view'}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">Free Event</label>
            </div>
            
            {!form.is_free && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ticket Price ($)
                </label>
                <input 
                  type="number" 
                  name="price" 
                  value={form.price || ''} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                  disabled={mode === 'view'} 
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <input 
              type="checkbox" 
              name="registration_required" 
              checked={!!form.registration_required} 
              onChange={handleChange} 
              disabled={mode === 'view'}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-gray-700">Registration Required</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Description
            </label>
            <ReactQuill 
              value={form.description || ''} 
              onChange={handleContentChange} 
              readOnly={mode === 'view'} 
              theme={mode === 'view' ? 'bubble' : 'snow'}
              placeholder="Describe the event details, agenda, speakers, etc..."
              modules={{
                toolbar: mode === 'view' ? false : [
                  [{ 'header': [1, 2, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['link', 'image'],
                  ['clean']
                ]
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Image
            </label>
            {(form.image || form.image_url) && (
              <div className="mb-4">
                <img 
                  src={form.image || form.image_url} 
                  alt="Event" 
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
                Organizer Name
              </label>
              <input 
                name="organizer_name" 
                value={form.organizer_name || ''} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                disabled={mode === 'view'} 
                placeholder="Event organizer or host"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <input 
                type="email" 
                name="contact_email" 
                value={form.contact_email || ''} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                disabled={mode === 'view'} 
                placeholder="contact@example.com"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Title
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma separated)
              </label>
              <input 
                name="tags" 
                value={form.tags || ''} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                disabled={mode === 'view'} 
                placeholder="education, workshop, students"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select 
                name="status" 
                value={form.status || 'draft'} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                disabled={mode === 'view'}
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-3">
              <input 
                type="checkbox" 
                name="featured" 
                checked={!!form.featured} 
                onChange={handleChange} 
                disabled={mode === 'view'}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">Featured Event</label>
            </div>
            
            <div className="flex items-center space-x-3">
              <input 
                type="checkbox" 
                name="comments_enabled" 
                checked={!!form.comments_enabled} 
                onChange={handleChange} 
                disabled={mode === 'view'}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">Enable Comments</label>
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
                  mode === 'add' ? 'Create Event' : 'Update Event'
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default AdminEventsModal 