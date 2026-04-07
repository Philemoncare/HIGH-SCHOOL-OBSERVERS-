import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import { useAuth } from '../contexts/AuthContext'

function AdminLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { login } = useAdminAuth()
  const { logout: logoutUser } = useAuth()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    // Dismiss any existing error toasts
    toast.dismiss('admin-login-error')

    try {
      const email = String(formData.email || '').trim().toLowerCase()
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: formData.password })
      })

      const raw = await response.text()
      let data = null
      try {
        data = raw ? JSON.parse(raw) : null
      } catch (_) {
        data = null
      }

      if (!response.ok) {
        const serverMsg = data?.error || data?.message
        const fallback = !raw
          ? 'No response from server. Is the backend running on port 5000?'
          : 'Server returned an unexpected response. Check backend logs.'
        throw new Error(serverMsg || fallback)
      }

      if (data.token && data.user) {
        // Ensure normal user session is cleared so admin session is truly separate
        try {
          logoutUser()
        } catch (_) {
          // ignore if context not ready
        }
        login(data.user, data.token)
        toast.dismiss('admin-login-error')
        toast.success('Admin login successful!', {
          duration: 3000
        })
        navigate('/admin', { replace: true })
        return
      }

      throw new Error('Unexpected response from server')
    } catch (err) {
      const errorMessage = err.message || 'Admin login failed. Please check your credentials and try again.'
      setError(errorMessage)
      
      // Dismiss any existing error toasts and show new one with unique ID
      toast.dismiss('admin-login-error')
      toast.error(errorMessage, {
        id: 'admin-login-error',
        duration: 4000
      })
      
      if (import.meta.env.DEV) {
        console.error('Admin login error:', err)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Admin Login - High School Observer</title>
        <meta name="description" content="Sign in to the HSO admin portal" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-red-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center mb-4">
              <img
                src="/images/logo.jpg"
                alt="HSO Logo"
                className="mx-auto h-16 w-16 object-contain rounded-full border-2 border-red-800 bg-white shadow"
              />
            </div>
            <h2 className="mt-2 text-3xl font-extrabold text-red-800">Admin Portal Login</h2>
            <p className="mt-2 text-sm text-red-700">
              Restricted access for administrators and executives
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-red-800 focus:z-10 sm:text-sm"
                    placeholder="Enter admin email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none relative block w-full pl-10 pr-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-red-800 focus:z-10 sm:text-sm"
                    placeholder="Enter admin password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-semibold rounded-full text-white bg-gradient-to-r from-red-700 to-red-800 shadow hover:from-red-800 hover:to-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Signing in...' : 'Sign in to Admin Portal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default AdminLogin


