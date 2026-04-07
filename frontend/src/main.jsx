import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'
import axios from 'axios'
import App from './App.jsx'
import { testAPIConnection } from './utils/apiHealth'
import { AdminAuthProvider } from './contexts/AdminAuthContext'
import './index.css'

// Configure axios - use environment variable for production
// In development, use Vite proxy (empty baseURL). In production, require VITE_API_URL
// to be set to your Render backend URL (e.g. https://hso-backend.onrender.com).
const isDevelopment = import.meta.env.DEV
const API_URL = import.meta.env.VITE_API_URL

// In development, Vite proxy handles /api requests, so use relative URLs.
// In production, use the full API URL when provided; otherwise fall back to relative
// URLs and log a warning so misconfiguration is obvious.
if (!isDevelopment && !API_URL) {
  console.warn(
    '⚠️ VITE_API_URL is not set. API requests will use relative paths. ' +
    'On Vercel, set VITE_API_URL to your Render backend URL.'
  )
}

axios.defaults.baseURL = isDevelopment ? '' : (API_URL || '')
axios.defaults.withCredentials = false

// Log API configuration
if (import.meta.env.DEV) {
  console.log('🔧 Development mode: Using Vite proxy for API requests')
  console.log('📡 API requests will be proxied to: http://localhost:5000')
  
  // Test API connection in development
  testAPIConnection().catch(err => {
    console.warn('⚠️ Initial API health check failed (this is OK if backend is starting):', err)
  })
} else {
  console.log('🔧 Production mode: API Base URL:', API_URL || 'Not configured')
}

// Request interceptor to always add latest token
axios.interceptors.request.use((config) => {
  try {
    const path = window.location.pathname || ''
    const isAdminRoute = path.startsWith('/admin')
    const storageKey = isAdminRoute ? 'admin_token' : 'token'
    const token = localStorage.getItem(storageKey)
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    } else {
      delete config.headers['Authorization']
    }
  } catch (_) {}
  return config
})

// Response interceptor for error handling
axios.interceptors.response.use(
  (res) => res,
  (error) => {
    // Handle network errors (no response from server)
    if (!error.response) {
      console.error('🌐 Network Error:', {
        message: error.message,
        code: error.code,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL
        }
      })
      
      // Log helpful debugging info in development
      if (import.meta.env.DEV) {
        console.warn('⚠️ Backend connection issue detected')
        console.warn('💡 Make sure the backend server is running on port 5000')
        console.warn('💡 Check: http://localhost:5000/api/health')
      }
    }
    
    // Handle authentication errors (401)
    if (error?.response?.status === 401) {
      // Clear auth data
      try {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        // Only redirect if not on auth pages (login, register, forgot/reset password)
        const currentPath = window.location.pathname
        const isAuthPage = currentPath.includes('/login') || currentPath.includes('/register') ||
          currentPath === '/forgot-password' || currentPath === '/reset-password'
        if (!isAuthPage) {
          window.location.href = '/login'
        }
      } catch (_) {}
    }
    
    return Promise.reject(error)
  }
)

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AdminAuthProvider>
            <App />
          </AdminAuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>,
) 