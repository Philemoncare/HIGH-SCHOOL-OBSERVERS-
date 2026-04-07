import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import AdminUserTable from '../components/AdminUserTable'
import AdminUserModal from '../components/AdminUserModal'
import RealIcon from '../components/RealIcon'
import { Users, Plus, Shield, UserCheck, UserX, Crown } from 'lucide-react'
import AdvancedAdminNavigation from '../components/AdvancedAdminNavigation'
import { useNavigation } from '../contexts/NavigationContext'

function AdminUsers() {
  const navigate = useNavigate()
  const { goBack } = useNavigation()
  const { user, token, isAuthenticated, isAdmin, isExecutive } = useAdminAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [modalMode, setModalMode] = useState('add')
  const [showPromoteModal, setShowPromoteModal] = useState(false)
  const [userToPromote, setUserToPromote] = useState(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    verifiedUsers: 0,
    pendingApproval: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (isAuthenticated && token) {
      console.log('User authenticated:', user)
      console.log('User role:', user?.role)
      console.log('Is admin:', isAdmin)
      console.log('Is executive:', isExecutive)
      console.log('Token available:', !!token)
      fetchUsers()
      fetchStats()
    } else {
      console.log('User not authenticated or no token')
    }
  }, [isAuthenticated, token, user, isAdmin, isExecutive])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      console.log('Fetching users with token:', !!token)
      console.log('Auth headers:', axios.defaults.headers.common['Authorization'])
      const response = await axios.get('/api/users')
      console.log('Users fetched successfully:', response.data)
      setUsers(response.data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      console.error('Error response:', error.response?.data)
      toast.dismiss('users-load-error')
      toast.error('Failed to load users', {
        id: 'users-load-error'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/users/stats/overview')
      if (response.data) {
        setStats({
          totalUsers: response.data.totalUsers || 0,
          activeUsers: response.data.activeUsers || 0,
          verifiedUsers: response.data.verifiedUsers || 0,
          pendingApproval: response.data.pendingApproval || 0
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Keep stats at 0 if API fails - don't show fake data
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        verifiedUsers: 0,
        pendingApproval: 0
      })
    }
  }

  const handleAddUser = () => {
    setCurrentUser(null)
    setModalMode('add')
    setShowModal(true)
  }

  const handleViewUser = (user) => {
    setCurrentUser(user)
    setModalMode('view')
    setShowModal(true)
  }

  const handleEditUser = (user) => {
    setCurrentUser(user)
    setModalMode('edit')
    setShowModal(true)
  }

  const handleSaveUser = async (userData) => {
    try {
      console.log('Saving user data:', userData)
      console.log('Current user:', user)
      console.log('Token available:', !!token)
      console.log('Auth headers:', axios.defaults.headers.common['Authorization'])
      
      if (modalMode === 'add') {
        const response = await axios.post('/api/users', userData)
        console.log('User created successfully:', response.data)
        toast.success('User created successfully!')
      } else {
        const response = await axios.put(`/api/users/${currentUser._id}`, userData)
        console.log('User updated successfully:', response.data)
        toast.success('User updated successfully!')
      }
      setShowModal(false)
      fetchUsers()
      fetchStats()
    } catch (error) {
      console.error('Error saving user:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      toast.dismiss('user-save-error')
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to save user', {
        id: 'user-save-error'
      })
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

    try {
      await axios.delete(`/api/users/${userId}`)
      toast.success('User deleted successfully!')
      fetchUsers()
      fetchStats()
    } catch (error) {
      toast.dismiss('user-delete-error')
      toast.error('Failed to delete user', {
        id: 'user-delete-error'
      })
    }
  }

  const handleApproveUser = async (userId) => {
    try {
      await axios.patch(`/api/users/${userId}/approve`)
      toast.success('User approved successfully!')
      fetchUsers()
      fetchStats()
    } catch (error) {
      toast.dismiss('user-approve-error')
      toast.error('Failed to approve user', {
        id: 'user-approve-error'
      })
    }
  }

  const handleVerifyUser = async (userId) => {
    try {
      await axios.patch(`/api/users/${userId}/verify`)
      toast.success('User verified successfully!')
      fetchUsers()
      fetchStats()
    } catch (error) {
      toast.dismiss('user-verify-error')
      toast.error('Failed to verify user', {
        id: 'user-verify-error'
      })
    }
  }

  const handlePromoteUser = async (userId, newRole) => {
    try {
      console.log('Promoting user:', userId, 'to role:', newRole)
      const response = await axios.patch(`/api/users/${userId}/promote`, { role: newRole })
      console.log('Promotion successful:', response.data)
      toast.success(`User promoted to ${newRole} successfully!`)
      setShowPromoteModal(false)
      setUserToPromote(null)
      fetchUsers()
      fetchStats()
    } catch (error) {
      console.error('Error promoting user:', error)
      console.error('Error response:', error.response?.data)
      toast.dismiss('user-promote-error')
      toast.error(error.response?.data?.error || 'Failed to promote user', {
        id: 'user-promote-error'
      })
    }
  }

  const openPromoteModal = (user) => {
    setUserToPromote(user)
    setShowPromoteModal(true)
  }

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.school_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'approved' && user.is_approved) ||
                         (statusFilter === 'pending' && !user.is_approved) ||
                         (statusFilter === 'verified' && user.is_verified) ||
                         (statusFilter === 'unverified' && !user.is_verified)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  return (
    <>
      <Helmet>
        <title>Manage Users - HSO Admin</title>
        <meta name="description" content="Manage users, roles, and permissions" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <AdvancedAdminNavigation
          title="User Management"
          subtitle="Manage users, roles, permissions, and access control"
          icon={Users}
          breadcrumbs={[{ label: 'User Management', path: '/admin/users' }]}
          onBack={() => goBack('/admin')}
          showSearch={true}
          searchPlaceholder="Search users by name, email, or school..."
          onSearch={setSearchTerm}
          actions={[
            {
              label: 'Add New User',
              icon: Plus,
              primary: true,
              onClick: handleAddUser
            }
          ]}
          quickActions={[
            { label: 'Pending', icon: UserX, onClick: () => setStatusFilter('pending') },
            { label: 'Verified', icon: UserCheck, onClick: () => setStatusFilter('verified') },
            { label: 'Admins', icon: Crown, onClick: () => setRoleFilter('super_admin') }
          ]}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <RealIcon symbol="👥" className="w-7 h-7" colorClassName="text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200 hover:border-green-400 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                  <RealIcon symbol="✅" className="w-7 h-7" colorClassName="text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600">Active Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.activeUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                  <RealIcon symbol="🔒" className="w-7 h-7" colorClassName="text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600">Verified Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.verifiedUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                  <RealIcon symbol="⏳" className="w-7 h-7" colorClassName="text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600">Pending Approval</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pendingApproval}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <button
                onClick={handleAddUser}
                className="p-6 border-2 border-red-200 rounded-xl hover:border-red-400 hover:bg-red-50 transition-all duration-300 text-left transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                <div className="mb-3">
                  <RealIcon symbol="👤" badge className="w-6 h-6" colorClassName="text-white" badgeClassName="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-500/25" />
                </div>
                <div className="font-bold text-red-800 text-lg">Add User</div>
                <div className="text-sm text-gray-600">Create new</div>
              </button>
              
              <button
                onClick={() => setStatusFilter('pending')}
                className="p-6 border-2 border-yellow-200 rounded-xl hover:border-yellow-400 hover:bg-yellow-50 transition-all duration-300 text-left transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                <div className="mb-3">
                  <RealIcon symbol="🔒" badge className="w-6 h-6" colorClassName="text-white" badgeClassName="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/25" />
                </div>
                <div className="font-bold text-yellow-800 text-lg">Pending Approval</div>
                <div className="text-sm text-gray-600">Review pending</div>
              </button>
              
              <button
                onClick={() => setStatusFilter('unverified')}
                className="p-6 border-2 border-orange-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all duration-300 text-left transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                <div className="mb-3">
                  <RealIcon symbol="🔍" badge className="w-6 h-6" colorClassName="text-white" badgeClassName="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/25" />
                </div>
                <div className="font-bold text-orange-800 text-lg">Unverified Users</div>
                <div className="text-sm text-gray-600">Verify users</div>
              </button>
              
              <button
                onClick={() => setRoleFilter('super_admin')}
                className="p-6 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 text-left transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                <div className="mb-3">
                  <RealIcon symbol="👑" badge className="w-6 h-6" colorClassName="text-white" badgeClassName="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-700 flex items-center justify-center shadow-lg shadow-purple-500/25" />
                </div>
                <div className="font-bold text-purple-800 text-lg">Admin Users</div>
                <div className="text-sm text-gray-600">Manage admins</div>
              </button>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Search & Filter Users</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search Users</label>
                <input
                  type="text"
                  placeholder="Search by name, email, or school..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role Filter</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-lg"
                >
                  <option value="all">All Roles</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="executive">Executive</option>
                  <option value="school_rep">School Rep</option>
                  <option value="public">Public</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status Filter</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-lg"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setRoleFilter('all')
                    setStatusFilter('all')
                  }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-2xl font-bold text-gray-900">Users List</h2>
              <p className="text-gray-600 mt-2">Showing {filteredUsers.length} of {users.length} users</p>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RealIcon symbol="👥" className="w-7 h-7" colorClassName="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
                  <button
                    onClick={handleAddUser}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Add First User
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NAME</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EMAIL</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROLE</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VERIFIED</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">APPROVED</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
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
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                              user.role === 'executive' ? 'bg-blue-100 text-blue-800' :
                              user.role === 'school_rep' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role === 'super_admin' && <span className="mr-1 inline-flex"><RealIcon symbol="👑" className="w-3.5 h-3.5" colorClassName="text-current" /></span>}
                              {user.role === 'executive' && <span className="mr-1 inline-flex"><RealIcon symbol="⭐" className="w-3.5 h-3.5" colorClassName="text-current" /></span>}
                              {user.role === 'school_rep' && <span className="mr-1 inline-flex"><RealIcon symbol="🏫" className="w-3.5 h-3.5" colorClassName="text-current" /></span>}
                              {user.role === 'public' && <span className="mr-1 inline-flex"><RealIcon symbol="👤" className="w-3.5 h-3.5" colorClassName="text-current" /></span>}
                              {user.role.replace('_', ' ').charAt(0).toUpperCase() + user.role.replace('_', ' ').slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.is_verified 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.is_verified ? '✓ Yes' : '✗ No'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.is_approved 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {user.is_approved ? '✓ Yes' : '⏳ Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center justify-start gap-2">
                              <button
                                onClick={() => handleViewUser(user)}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 rounded"
                                title="View User"
                              >
                                <span className="text-lg">👁️</span>
                              </button>
                              <button
                                onClick={() => handleEditUser(user)}
                                className="text-green-600 hover:text-green-800 hover:bg-green-50 p-1 rounded"
                                title="Edit User"
                              >
                                <span className="text-lg">✏️</span>
                              </button>
                              {!user.is_approved && (
                                <button
                                  onClick={() => handleApproveUser(user._id)}
                                  className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 p-1 rounded"
                                  title="Approve User"
                                >
                                  <span className="text-lg">✅</span>
                                </button>
                              )}
                              {!user.is_verified && (
                                <button
                                  onClick={() => handleVerifyUser(user._id)}
                                  className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 p-1 rounded"
                                  title="Verify User"
                                >
                                  <span className="text-lg">🔒</span>
                                </button>
                              )}
                              {user.role !== 'super_admin' && isAdmin && (
                                <button
                                  onClick={() => openPromoteModal(user)}
                                  className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-1 rounded"
                                  title="Promote User"
                                >
                                  <span className="text-lg">⬆️</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteUser(user._id)}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded"
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
              )}
            </div>
          </div>
        </div>
        <AdminUserModal
          open={showModal}
          user={currentUser}
          mode={modalMode}
          onSave={handleSaveUser}
          onClose={() => setShowModal(false)}
          currentUserRole={user?.role}
        />
        {console.log('Passing currentUserRole to modal:', user?.role)}
        {showPromoteModal && userToPromote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Promote User
                  </h2>
                  <button 
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold" 
                    onClick={() => setShowPromoteModal(false)}
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <p className="text-gray-600 mb-4">
                    Promote <strong>{userToPromote.first_name} {userToPromote.last_name}</strong> to a new role:
                  </p>
                </div>

                <div className="space-y-3">
                  {userToPromote.role === 'public' && (
                    <button
                      onClick={() => handlePromoteUser(userToPromote._id, 'school_rep')}
                      className="w-full p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all duration-200 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🏫</span>
                        <div>
                          <div className="font-semibold text-green-800">School Representative</div>
                          <div className="text-sm text-gray-600">Can manage school-specific content</div>
                        </div>
                      </div>
                    </button>
                  )}

                  {userToPromote.role === 'public' && isAdmin && (
                    <button
                      onClick={() => handlePromoteUser(userToPromote._id, 'executive')}
                      className="w-full p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">⭐</span>
                        <div>
                          <div className="font-semibold text-blue-800">Executive</div>
                          <div className="text-sm text-gray-600">Can manage all content and users</div>
                        </div>
                      </div>
                    </button>
                  )}

                  {userToPromote.role === 'school_rep' && isAdmin && (
                    <button
                      onClick={() => handlePromoteUser(userToPromote._id, 'executive')}
                      className="w-full p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">⭐</span>
                        <div>
                          <div className="font-semibold text-blue-800">Executive</div>
                          <div className="text-sm text-gray-600">Can manage all content and users</div>
                        </div>
                      </div>
                    </button>
                  )}

                  {userToPromote.role === 'executive' && isAdmin && (
                    <button
                      onClick={() => handlePromoteUser(userToPromote._id, 'super_admin')}
                      className="w-full p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">👑</span>
                        <div>
                          <div className="font-semibold text-purple-800">Super Admin</div>
                          <div className="text-sm text-gray-600">Full system access and control</div>
                        </div>
                      </div>
                    </button>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button 
                    onClick={() => setShowPromoteModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default AdminUsers 