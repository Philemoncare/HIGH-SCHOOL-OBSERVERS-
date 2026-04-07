import { useState } from 'react'
import RealIcon from './RealIcon'

function AdminUserTable({ users, onView, onEdit, onDelete, onApprove, onVerify, onPromote }) {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.first_name?.toLowerCase().includes(search.toLowerCase()) ||
                         user.last_name?.toLowerCase().includes(search.toLowerCase()) ||
                         user.email?.toLowerCase().includes(search.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    return matchesSearch && matchesRole
  })

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage)

  const getRoleBadge = (role) => {
    const roleConfig = {
      super_admin: { color: 'bg-purple-100 text-purple-800', icon: '👑' },
      executive: { color: 'bg-blue-100 text-blue-800', icon: '⭐' },
      school_rep: { color: 'bg-green-100 text-green-800', icon: '🏫' },
      public: { color: 'bg-gray-100 text-gray-800', icon: '👤' }
    }
    
    const config = roleConfig[role] || roleConfig.public
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color} flex items-center gap-1`}>
        <RealIcon symbol={config.icon} className="w-3.5 h-3.5" colorClassName="text-current" />
        {role.replace('_', ' ').charAt(0).toUpperCase() + role.replace('_', ' ').slice(1)}
      </span>
    )
    }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Verified</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Approved</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6 pr-8">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedUsers.map((user, index) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-red-600 font-medium text-sm">
                          {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.school_name || 'No school'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.email}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {getRoleBadge(user.role)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.is_verified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.is_verified ? '✅ Yes' : '❌ No'}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.is_approved 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.is_approved ? '✅ Yes' : '⏳ Pending'}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center justify-start gap-2 pr-4">
                    <button
                      onClick={() => onView(user)}
                      className="flex-shrink-0 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-all duration-200 rounded-lg border border-transparent hover:border-blue-200"
                      title="View User"
                    >
                      <span className="text-lg">👁️</span>
                    </button>
                    <button
                      onClick={() => onEdit(user)}
                      className="flex-shrink-0 p-2 text-green-600 hover:text-green-800 hover:bg-green-50 transition-all duration-200 rounded-lg border border-transparent hover:border-green-200"
                      title="Edit User"
                    >
                      <span className="text-lg">✏️</span>
                    </button>
                    {!user.is_approved && (
                      <button
                        onClick={() => onApprove(user._id)}
                        className="flex-shrink-0 p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 transition-all duration-200 rounded-lg border border-transparent hover:border-yellow-200"
                        title="Approve User"
                      >
                        <span className="text-lg">✅</span>
                      </button>
                    )}
                    {!user.is_verified && (
                      <button
                        onClick={() => onVerify(user._id)}
                        className="flex-shrink-0 p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 transition-all duration-200 rounded-lg border border-transparent hover:border-purple-200"
                        title="Verify User"
                      >
                        <span className="text-lg">🔒</span>
                      </button>
                    )}
                    {user.role !== 'super_admin' && (
                      <button
                        onClick={() => onPromote(user._id, 'executive')}
                        className="flex-shrink-0 p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-all duration-200 rounded-lg border border-transparent hover:border-indigo-200"
                        title="Promote to Executive"
                      >
                        <span className="text-lg">⬆️</span>
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(user._id)}
                      className="flex-shrink-0 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 transition-all duration-200 rounded-lg border border-transparent hover:border-red-200"
                      title="Delete User"
                    >
                      <span className="text-lg">🗑️</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
      {filteredUsers.length === 0 && (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">👥</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  )
}

export default AdminUserTable 