import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'

function AdminUserModal({ open, user, onClose, onSave, mode = 'view', currentUserRole = 'public' }) {
  const [form, setForm] = useState(user || {
    role: 'public',
    is_verified: false,
    is_approved: false
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setForm(user || {
      role: 'public',
      is_verified: false,
      is_approved: false
    })
  }, [user])

  if (!open) return null

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    
    // Validate required fields
    if (!form.first_name?.trim()) {
      toast.error('First name is required')
      return
    }
    
    if (!form.last_name?.trim()) {
      toast.error('Last name is required')
      return
    }
    
    if (!form.email?.trim()) {
      toast.error('Email is required')
      return
    }
    
    if (mode === 'add' && !form.password?.trim()) {
      toast.error('Password is required')
      return
    }

    // Check role permissions
    if (form.role === 'executive' && currentUserRole !== 'super_admin') {
      toast.error('Only super admin can create executive users')
      return
    }
    
    if (form.role === 'super_admin' && currentUserRole !== 'super_admin') {
      toast.error('Only super admin can create super admin users')
      return
    }

    console.log('Permission check passed - Current user role:', currentUserRole, 'Selected role:', form.role)

    setLoading(true)
    try {
      // Prepare the data to send
      const userData = {
        first_name: form.first_name?.trim(),
        last_name: form.last_name?.trim(),
        email: form.email?.trim(),
        phone: form.phone?.trim() || '',
        school_name: form.school_name?.trim() || '',
        role: form.role || 'public',
        is_verified: !!form.is_verified,
        is_approved: !!form.is_approved
      }
      
      // Add password only for new users
      if (mode === 'add') {
        userData.password = form.password?.trim()
      }
      
      console.log('Submitting user data:', userData)
      onSave(userData)
    } catch (error) {
      console.error('Error in form submission:', error)
      const msg = error.response?.data?.error || error.response?.data?.message
      const details = error.response?.data?.details
      toast.error(details ? `${msg || 'Failed to save user'}: ${details}` : (msg || 'Failed to save user'))
    } finally {
      setLoading(false)
    }
  }

  const roles = [
    { value: 'public', label: 'Public' },
    { value: 'school_rep', label: 'School Representative' },
    ...(currentUserRole === 'super_admin' || currentUserRole === 'executive' ? [
      { value: 'executive', label: 'Executive' }
    ] : []),
    ...(currentUserRole === 'super_admin' ? [
      { value: 'super_admin', label: 'Super Admin' }
    ] : [])
  ]

  console.log('Current user role:', currentUserRole)
  console.log('Available roles:', roles)
  console.log('Roles count:', roles.length)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'add' ? 'Add User' : mode === 'edit' ? 'Edit User' : 'User Details'}
            </h2>
            <button 
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold" 
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input 
              name="first_name" 
              value={form.first_name || ''} 
              onChange={handleChange} 
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
              disabled={mode === 'view'} 
              required 
              placeholder="Enter first name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input 
              name="last_name" 
              value={form.last_name || ''} 
              onChange={handleChange} 
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
              disabled={mode === 'view'} 
              required 
              placeholder="Enter last name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input 
              name="email" 
              type="email" 
              value={form.email || ''} 
              onChange={handleChange} 
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
              disabled={mode !== 'add'} 
              required 
              placeholder="Enter email address"
            />
          </div>
          {mode === 'add' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input 
                name="password" 
                type="password" 
                value={form.password || ''} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                required 
                placeholder="Enter password"
                minLength="6"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input 
              name="phone" 
              value={form.phone || ''} 
              onChange={handleChange} 
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
              disabled={mode === 'view'} 
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              School Name
            </label>
            <input 
              name="school_name" 
              value={form.school_name || ''} 
              onChange={handleChange} 
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
              disabled={mode === 'view'} 
              placeholder="Enter school name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role *
            </label>
            <select 
              name="role" 
              value={form.role || 'public'} 
              onChange={handleChange} 
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
              disabled={mode === 'view'} 
              required
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
            {currentUserRole === 'public' && (
              <p className="text-xs text-gray-500 mt-1">
                Note: You can only create Public and School Representative users
              </p>
            )}
            {currentUserRole === 'school_rep' && (
              <p className="text-xs text-gray-500 mt-1">
                Note: You can only create Public and School Representative users
              </p>
            )}
            {currentUserRole === 'executive' && (
              <p className="text-xs text-gray-500 mt-1">
                Note: You can create Public, School Representative, and Executive users
              </p>
            )}
            {currentUserRole === 'super_admin' && (
              <p className="text-xs text-gray-500 mt-1">
                Note: You can create all user roles
              </p>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                name="is_verified" 
                checked={!!form.is_verified} 
                onChange={handleChange} 
                disabled={mode === 'view'}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">Verified</label>
            </div>
            
            <div className="flex items-center">
              <input 
                type="checkbox" 
                name="is_approved" 
                checked={!!form.is_approved} 
                onChange={handleChange} 
                disabled={mode === 'view'}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">Approved</label>
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
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default AdminUserModal 