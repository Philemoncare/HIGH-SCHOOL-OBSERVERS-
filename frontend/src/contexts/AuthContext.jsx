import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Persist profile images separately so they survive logout/login cycles
  const getProfileImagesMap = () => {
    try {
      return JSON.parse(localStorage.getItem('profile_images') || '{}')
    } catch (_) {
      return {}
    }
  }

  const persistProfileImage = (userId, image) => {
    if (!userId || !image) return
    try {
      const map = getProfileImagesMap()
      map[userId] = image
      localStorage.setItem('profile_images', JSON.stringify(map))
    } catch (_) {}
  }

  useEffect(() => {
    // Use a timeout to ensure loading always resolves, even if there's an error
    const timeoutId = setTimeout(() => {
      setLoading(false)
    }, 1000) // Max 1 second for loading
    
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const parsed = JSON.parse(storedUser)
        // Rehydrate avatar from persistent map if present
        const map = getProfileImagesMap()
        const merged = map[parsed?._id] ? { ...parsed, profile_image: map[parsed._id] } : parsed
        setUser(merged)
      }
    } catch (error) {
      // Log error in development, ignore corrupted storage
      if (import.meta.env.DEV) {
        console.warn('Error loading user from localStorage:', error)
      }
    } finally {
      clearTimeout(timeoutId)
      setLoading(false)
    }
  }, [])

  const login = (nextUser) => {
    // Merge any persisted avatar for this user
    const map = getProfileImagesMap()
    const merged = map[nextUser?._id] ? { ...nextUser, profile_image: map[nextUser._id] } : nextUser
    setUser(merged)
    try {
      localStorage.setItem('user', JSON.stringify(merged))
    } catch (_) {}
  }

  const logout = () => {
    setUser(null)
    try {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    } catch (_) {}
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    try {
      localStorage.setItem('user', JSON.stringify(updatedUser))
      if (updatedUser?._id && updatedUser?.profile_image) {
        persistProfileImage(updatedUser._id, updatedUser.profile_image)
      }
    } catch (_) {}
  }

  const isAdmin = !!(user && (user.role === 'admin' || user.role === 'super_admin'))
  const isExecutive = !!(user && user.role === 'executive')
  const isSchoolRep = !!(user && user.role === 'school_rep')
  const isAuthenticated = !!user

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    updateUser,
    isAdmin,
    isExecutive,
    isSchoolRep,
    isAuthenticated,
  }), [user, loading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

export default AuthContext


