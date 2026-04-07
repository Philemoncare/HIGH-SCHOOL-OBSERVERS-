import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { UserPlus, Edit2, Trash2 } from 'lucide-react'

function AdminExecTable({ onEdit, onDelete, onAdd }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchExecs() {
      setLoading(true)
      setError('')
      try {
        const res = await axios.get('/api/users', { params: { role: ['super_admin', 'executive'] } })
        setUsers(res.data.users || res.data)
      } catch (err) {
        setError('Failed to load admins/executives')
      } finally {
        setLoading(false)
      }
    }
    fetchExecs()
  }, [])

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="text-sm text-gray-600">Manage platform administrators and executives</div>
        <button
          type="button"
          onClick={onAdd}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 text-white font-semibold hover:from-red-700 hover:to-orange-600 transition-all flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add Admin/Executive
        </button>
      </div>
      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 text-center">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-700 border-b border-gray-200">
                <th className="py-3 px-4 font-semibold">Name</th>
                <th className="py-3 px-4 font-semibold">Email</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">No admins/executives found.</td>
                </tr>
              ) : users.map(user => (
                <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="py-3 px-4 text-gray-900 font-medium">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="py-3 px-4 text-gray-700">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'super_admin' 
                        ? 'bg-red-50 text-red-700' 
                        : 'bg-purple-50 text-purple-700'
                    }`}>
                      {user.role === 'super_admin' ? 'Super Admin' : 'Executive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(user)}
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-all"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(user)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminExecTable 