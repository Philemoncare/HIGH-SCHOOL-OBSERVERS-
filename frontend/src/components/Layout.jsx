import { Outlet, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import AdvancedNavigation from './AdvancedNavigation'
import AdvancedBreadcrumbs from './AdvancedBreadcrumbs'
import Footer from './Footer'
import Sidebar from './Sidebar'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { loading } = useAuth()
  const location = useLocation()
  
  // Hide footer on auth pages (login, register, forgot/reset password)
  const hideFooter = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname)

  // Note: Loading state is managed by AuthContext, no need for timeout here

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-red-600 mx-auto mb-4"></div>
            <motion.div
              animate={{ 
                background: [
                  "linear-gradient(45deg, #ef4444, #dc2626)",
                  "linear-gradient(45deg, #dc2626, #b91c1c)",
                  "linear-gradient(45deg, #b91c1c, #ef4444)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full blur-xl opacity-20"
            />
          </div>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-700 font-semibold text-lg"
          >
            Loading HSO Platform...
          </motion.p>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-500 text-sm mt-2"
          >
            Advanced Navigation System
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col overflow-x-hidden">
      <AdvancedNavigation />
      <AdvancedBreadcrumbs />
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="absolute left-0 top-0 h-full w-80 bg-white/95 backdrop-blur-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <main className="flex-1 relative overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10"
        >
          <Outlet />
        </motion.div>
        <div className="hidden"></div>
      </main>

      {!hideFooter && <Footer />}
    </div>
  )
}

export default Layout 