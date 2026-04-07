import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import SocialLogin from '../components/SocialLogin'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import TwoFactorAuth from '../components/TwoFactorAuth'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [is2FAOpen, setIs2FAOpen] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')
  const navigate = useNavigate()
  const { login: setAuthUser } = useAuth()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    // Dismiss any existing error toasts
    toast.dismiss('login-error')
    
    try {
      const email = String(formData.email || '').trim().toLowerCase()
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: formData.password })
      })

      // Some failure modes (backend down, proxy error, HTML error pages) won't be valid JSON.
      // Read as text first, then parse if possible so we can show a helpful error message.
      const raw = await response.text()
      let data = null
      try {
        data = raw ? JSON.parse(raw) : null
      } catch (_) {
        data = null
      }

      if (!response.ok) {
        // Prefer server-provided message, otherwise provide a clear hint.
        const serverMsg = data?.error || data?.message
        const hint = !raw
          ? 'No response from server. Is the backend running on port 5000?'
          : 'Server returned an unexpected response. Check backend logs.'
        throw new Error(serverMsg || hint)
      }

      if (data.requires2FA) {
        setPendingEmail(email)
        setIs2FAOpen(true)
        toast.dismiss('login-error')
        toast.success('Enter the 2FA code sent to your email', {
          duration: 4000
        })
        return
      }

      if (data.token && data.user) {
        try { 
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
        } catch (_) {}
        setAuthUser(data.user)
        toast.dismiss('login-error')
        toast.success('Login successful!', {
          duration: 3000
        })
        // Small delay to ensure state is updated before navigation
        setTimeout(() => {
          // Redirect admins/executives to admin dashboard, others to homepage
          const isAdmin = data.user.role === 'super_admin' || data.user.role === 'admin' || data.user.role === 'executive'
          navigate(isAdmin ? '/admin' : '/', { replace: true })
        }, 100)
        return
      }

      throw new Error('Unexpected response from server')
    } catch (error) {
      // Show proper error message
      const errorMessage = error.message || 'Login failed. Please check your credentials and try again.'
      setError(errorMessage)
      
      // Dismiss any existing error toasts and show new one with unique ID
      toast.dismiss('login-error')
      toast.error(errorMessage, {
        id: 'login-error',
        duration: 4000
      })
      
      // Log error for debugging (only in development)
      if (import.meta.env.DEV) {
        console.error('Login error:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLoginSuccess = ({ token, user: userData }) => {
    if (!userData) return
    try {
      if (token) localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (_) {}
    setAuthUser(userData)
    const isAdmin = userData.role === 'super_admin' || userData.role === 'admin' || userData.role === 'executive'
    navigate(isAdmin ? '/admin' : '/', { replace: true })
  }

  const handleSocialLoginError = (error) => {
    const errorMessage = error?.message || 'Social login failed. Please try again.'
    setError(errorMessage)
    toast.dismiss('login-error')
    // SocialLogin already shows a toast; only show here if we didn't (e.g. network error)
    if (!error?.message?.toLowerCase().includes('not configured')) {
      toast.error(errorMessage, { id: 'login-error', duration: 4000 })
    }
  }

  return (
    <>
      <Helmet>
        <title>Login - High School Observer</title>
        <meta name="description" content="Sign in to your High School Observer account" />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -30, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
            animate={{
              scale: [1, 1.1, 1],
              x: [0, 40, 0],
              y: [0, -40, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="max-w-md w-full space-y-8 relative z-10">
          <TwoFactorAuth
            isOpen={is2FAOpen}
            onClose={() => setIs2FAOpen(false)}
            userEmail={pendingEmail}
            onSuccess={(token, user) => {
              try { localStorage.setItem('token', token) } catch (_) {}
              setAuthUser(user)
              setIs2FAOpen(false)
              toast.dismiss('login-error')
              toast.success('Login successful!', {
                duration: 3000
              })
              // Redirect admins/executives to admin dashboard, others to homepage
              const isAdmin = user.role === 'super_admin' || user.role === 'admin' || user.role === 'executive'
              navigate(isAdmin ? '/admin' : '/')
            }}
          />
          <motion.div
            className="space-y-6 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-red-500/20 border border-white/50 p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center">
              <div className="inline-block">
                <img src="/images/logo.jpg" alt="HSO Logo" className="mx-auto h-20 w-20 object-contain rounded-2xl border-4 border-white shadow-2xl shadow-red-500/30 bg-white p-2" />
              </div>
              <h2 className="mt-6 text-4xl font-extrabold bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Sign in to your account
              </h2>
              <p className="mt-3 text-base text-gray-600 font-medium">
                Welcome back to High School Observer
              </p>
            </div>
            <div className="pt-2">
              <SocialLogin
                onSuccess={handleSocialLoginSuccess}
                onError={handleSocialLoginError}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white/80 text-gray-500 font-medium">Or continue with email</span>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-md">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-red-600" />
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:shadow-lg focus:shadow-red-500/20 transition-all duration-300 bg-white/50 backdrop-blur-sm sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-red-600" />
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-4 py-3 pr-12 border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:shadow-lg focus:shadow-red-500/20 transition-all duration-300 bg-white/50 backdrop-blur-sm sm:text-sm"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-red-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 font-medium cursor-pointer">
                    Remember me
                  </label>
                </div>
                <Link to="/forgot-password" className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center items-center gap-2 py-4 px-6 border border-transparent text-base font-bold rounded-2xl text-white bg-gradient-to-r from-red-600 via-red-700 to-red-800 shadow-xl shadow-red-500/40 hover:shadow-2xl hover:shadow-red-500/50 focus:outline-none focus:ring-4 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02]"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Sign in</span>
                  </div>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          <motion.div
            className="text-center pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-red-600 hover:text-red-700 transition-colors inline-flex items-center gap-1">
                Sign up here
                <ArrowRight className="w-4 h-4" />
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default Login
