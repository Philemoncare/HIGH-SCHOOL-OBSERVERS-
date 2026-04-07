import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import Sidebar from './Sidebar'

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mainScrolled, setMainScrolled] = useState(false)
  const { loading, user, logout, isAdmin, isExecutive, isAuthenticated } = useAdminAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Close mobile sidebar when route changes (e.g. after clicking a link)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Advanced: hide sidebar when scrolling down, show when scrolling up (no visible scrollbar on sidebar)
  const [sidebarHidden, setSidebarHidden] = useState(false)
  const [sidebarPeek, setSidebarPeek] = useState(false) // hover/peek to show when hidden
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    const main = document.querySelector('[data-admin-main]')
    if (!main) return
    const threshold = 80
    const onScroll = () => {
      const top = main.scrollTop ?? 0
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const scrollingDown = top > lastScrollY.current
          const nearTop = top < 40
          if (nearTop) {
            setSidebarHidden(false)
            setMainScrolled(false)
          } else {
            setMainScrolled(true)
            if (scrollingDown && top > threshold) setSidebarHidden(true)
            else if (!scrollingDown) setSidebarHidden(false)
          }
          lastScrollY.current = top
          ticking.current = false
        })
        ticking.current = true
      }
    }
    main.addEventListener('scroll', onScroll, { passive: true })
    return () => main.removeEventListener('scroll', onScroll)
  }, [location.pathname])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-800 mx-auto mb-4"></div>
          <p className="text-red-800 font-semibold">Loading Admin Portal...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated as admin/executive (separate from normal user login)
  if (!loading && (!isAuthenticated || (!isAdmin && !isExecutive))) {
    navigate('/admin-login', { replace: true })
    return null
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex overflow-x-hidden">
      <div className="hidden lg:block lg:sticky lg:top-0 lg:self-start lg:shrink-0 lg:h-screen lg:overflow-hidden">
        <motion.div
          initial={false}
          animate={{
            x: sidebarHidden && !sidebarPeek ? -256 : 0,
            opacity: sidebarHidden && !sidebarPeek ? 0 : 1,
          }}
          transition={{ type: 'tween', duration: 0.25, ease: 'easeInOut' }}
          className="absolute left-0 top-0 h-full w-64 z-20 flex flex-col bg-transparent"
        >
          <div
            className="h-full w-64 flex flex-col overflow-y-auto overflow-x-hidden shadow-xl"
            style={{
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            onMouseEnter={() => setSidebarPeek(true)}
            onMouseLeave={() => setSidebarPeek(false)}
          >
            <style>{`
              .admin-sidebar-inner::-webkit-scrollbar { display: none; }
            `}</style>
            <div className="admin-sidebar-inner min-h-full flex flex-col">
              <Sidebar admin onNavigate={() => setSidebarOpen(false)} />
            </div>
          </div>
        </motion.div>
        <AnimatePresence>
          {sidebarHidden && !sidebarPeek && (
            <motion.button
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              type="button"
              onClick={() => setSidebarHidden(false)}
              onMouseEnter={() => setSidebarPeek(true)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-7 h-14 rounded-r-lg bg-red-800 text-white shadow-lg flex items-center justify-center hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label="Show sidebar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden={!sidebarOpen}
          >
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="absolute left-0 top-0 h-full w-64 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar admin onNavigate={() => setSidebarOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex-1 flex flex-col min-h-0 overflow-x-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
                aria-label="Open menu"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link to="/admin" className="flex items-center gap-2 flex-shrink-0">
                <img src="/images/logo.jpg" alt="HSO Logo" className="h-8 w-8 rounded-full border-2 border-red-800" />
                <span className="font-bold text-lg text-red-800">Admin Portal</span>
              </Link>
              {location.pathname !== '/admin' && (
                <Link
                  to="/admin"
                  className="ml-2 text-sm font-medium text-red-700 hover:text-red-800 hover:underline hidden sm:inline"
                >
                  Dashboard
                </Link>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100">
                <div className="w-6 h-6 bg-red-800 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {user?.first_name?.charAt(0) || 'A'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.first_name} {user?.last_name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        <main data-admin-main className="flex-1 overflow-x-hidden overflow-y-auto min-h-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            key={location.pathname}
            className="min-h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout 