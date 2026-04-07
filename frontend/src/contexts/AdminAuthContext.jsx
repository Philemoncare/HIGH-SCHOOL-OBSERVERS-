import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AdminAuthContext = createContext(null)

// Separate admin auth context so admin login does NOT affect normal user session
export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('admin_user')
      const storedToken = localStorage.getItem('admin_token')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
      if (storedToken) {
        setToken(storedToken)
      }
    } catch (_) {
      // ignore corrupted storage
    } finally {
      setLoading(false)
    }
  }, [])

  const login = (nextUser, nextToken) => {
    setUser(nextUser || null)
    setToken(nextToken || null)
    try {
      if (nextUser) {
        localStorage.setItem('admin_user', JSON.stringify(nextUser))
      } else {
        localStorage.removeItem('admin_user')
      }
      if (nextToken) {
        localStorage.setItem('admin_token', nextToken)
      } else {
        localStorage.removeItem('admin_token')
      }
    } catch (_) {}
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    try {
      localStorage.removeItem('admin_user')
      localStorage.removeItem('admin_token')
    } catch (_) {}
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    try {
      localStorage.setItem('admin_user', JSON.stringify(updatedUser))
    } catch (_) {}
  }

  const isAdmin = !!(user && (user.role === 'admin' || user.role === 'super_admin'))
  const isExecutive = !!(user && user.role === 'executive')
  const isAuthenticated = !!user

  const value = useMemo(() => ({
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    isAdmin,
    isExecutive,
    isAuthenticated,
  }), [user, token, loading, isAdmin, isExecutive, isAuthenticated])

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  return ctx
}

export default AdminAuthContext


