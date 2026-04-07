import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

function AdminExecModal({ open, user, onClose, onSave, mode = 'view' }) {
  const [form, setForm] = useState(user || { role: 'executive' })

  useEffect(() => {
    setForm(user || { role: 'executive' })
  }, [user])

  if (!open) return null

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSubmit = e => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative border border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-6 pr-8">
          {mode === 'add' ? 'Add Admin/Executive' : 'Edit Admin/Executive'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">First Name</label>
            <input
              name="first_name"
              value={form.first_name || ''}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-300"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Last Name</label>
            <input
              name="last_name"
              value={form.last_name || ''}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-300"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
            <input
              name="email"
              type="email"
              value={form.email || ''}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-300 disabled:bg-gray-50 disabled:text-gray-500"
              required={mode === 'add'}
              disabled={mode !== 'add'}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Role</label>
            <select
              name="role"
              value={form.role || ''}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-300"
              required
            >
              <option value="super_admin">Super Admin</option>
              <option value="executive">Executive</option>
            </select>
          </div>
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 text-white font-semibold hover:from-red-700 hover:to-orange-600 transition-all"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminExecModal 