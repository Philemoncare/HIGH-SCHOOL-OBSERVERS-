import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import { 
  Home, Menu, X, Bell, User, LogOut, Shield, Users, Calendar, 
  Newspaper, ShoppingBag, Heart, BookOpen, Building2, 
  Megaphone, Gift, FileText, ArrowUp
} from 'lucide-react'

const AdvancedNavigation = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const { isAuthenticated: isAdminAuthenticated, isAdmin: isAdminRole, isExecutive: isExecutiveRole } = useAdminAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notificationOpen, setNotificationOpen] = useState(false)
  
  // Scroll state management
  const [isVisible, setIsVisible] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [scrollDirection, setScrollDirection] = useState('up')
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  // Simple notifications
  useEffect(() => {
    if (isAuthenticated) {
      setNotifications([
        {
          id: 1,
          title: 'New Event Posted',
          message: 'Ghana Students Social Media Day registration is now open!',
          time: '2 minutes ago',
          type: 'event',
          read: false
        },
        {
          id: 2,
          title: 'Donation Received',
          message: 'Thank you for your donation of GHC 50 to HSO initiatives.',
          time: '1 hour ago',
          type: 'donation',
          read: false
        }
      ])
    }
  }, [isAuthenticated])

  // Simple scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          
          // Check if scrolled past threshold
          setIsScrolled(currentScrollY > 50)
          
          // Calculate scroll progress
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight
          const progress = Math.min((currentScrollY / maxScroll) * 100, 100)
          setScrollProgress(progress)
          
          // Simple hide/show based on scroll direction
          const scrollDelta = currentScrollY - lastScrollY.current
          
          if (Math.abs(scrollDelta) > 5) {
            if (scrollDelta > 0 && currentScrollY > 100) {
              // Scrolling down - hide navbar
              setScrollDirection('down')
              setIsVisible(false)
            } else if (scrollDelta < 0) {
              // Scrolling up - show navbar
              setScrollDirection('up')
              setIsVisible(true)
            }
          }
          
          lastScrollY.current = currentScrollY
          ticking.current = false
        })
        ticking.current = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Reset scroll state when route changes
  useEffect(() => {
    setIsVisible(true)
    setIsScrolled(false)
    setScrollProgress(0)
    setScrollDirection('up')
  }, [location.pathname])

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const isActive = (path) => location.pathname === path

  const handleLogout = useCallback(() => {
    logout()
    setMobileOpen(false)
    navigate('/')
  }, [logout, navigate])

  const handleNotificationClick = (notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    )
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'event':
        navigate('/events')
        break
      case 'donation':
        navigate('/events')
        break
      default:
        break
    }
    
    setNotificationOpen(false)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  // Navigation items
  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'About', href: '/about', icon: Building2 },
    { name: 'News', href: '/news', icon: Newspaper },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Shop', href: '/shop', icon: ShoppingBag },
    { name: 'Magazine', href: '/magazine', icon: BookOpen },
  ]

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.nav 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
              isScrolled 
                ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
                : 'bg-white/90 backdrop-blur-sm border-b border-gray-200'
            }`}
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-14 lg:h-16">
                <Link to="/" className="flex items-center gap-2 group flex-shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  <img 
                    src="/images/logo.jpg" 
                    alt="HSO Logo" 
                    className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300 border-2 border-red-800 ring-1 ring-red-100"
                  />
                  <span className="font-bold text-sm sm:text-base lg:text-lg text-gray-900 group-hover:text-red-700 transition-colors whitespace-nowrap">
                    HSO
                  </span>
                </Link>
                <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center max-w-2xl mx-6">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    const isActiveState = isActive(item.href)
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-300 font-medium text-sm whitespace-nowrap ${
                          isActiveState 
                            ? 'bg-red-50 text-red-700 border border-red-200' 
                            : 'text-gray-600 hover:bg-red-50 hover:text-red-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
                <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
                  {isAuthenticated ? (
                    <>
                      <Link
                        to="/shop"
                        className="relative p-2 rounded-lg hover:bg-red-50 transition-all duration-200 group"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        title="Special Offers"
                      >
                        <Gift className="w-5 h-5 text-red-600 group-hover:text-red-700 transition-colors" />
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-white" />
                      </Link>
                      <div className="relative">
                        <button 
                          onClick={() => setNotificationOpen(!notificationOpen)}
                          className="relative p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
                        >
                          <Bell className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
                          {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center shadow-md font-bold">
                              {unreadCount}
                            </span>
                          )}
                        </button>
                        <AnimatePresence>
                          {notificationOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
                            >
                              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-red-50 to-red-100">
                                <h3 className="font-bold text-gray-900">Notifications</h3>
                                {unreadCount > 0 && (
                                  <p className="text-xs text-gray-600 mt-1">{unreadCount} new notification{unreadCount > 1 ? 's' : ''}</p>
                                )}
                              </div>
                              <div className="max-h-80 overflow-y-auto">
                                {notifications.length > 0 ? (
                                  <div className="p-2">
                                    {notifications.map((notification) => (
                                      <div
                                        key={notification.id}
                                        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 mb-2 ${
                                          notification.read 
                                            ? 'bg-gray-50 hover:bg-gray-100' 
                                            : 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500'
                                        }`}
                                        onClick={() => handleNotificationClick(notification)}
                                      >
                                        <h4 className="font-semibold text-sm text-gray-900">
                                          {notification.title}
                                        </h4>
                                        <p className="text-xs text-gray-600 mt-1">
                                          {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2">
                                          {notification.time}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="p-8 text-center text-gray-500">
                                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No notifications</p>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <Link 
                        to="/profile" 
                        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200 group border border-transparent hover:border-gray-200"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      >
                        {user?.profile_image ? (
                          <img 
                            src={user.profile_image} 
                            alt={user?.first_name} 
                            className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 group-hover:border-red-300 transition-colors shadow-sm" 
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-xs shadow-md ring-2 ring-purple-100">
                            {user?.first_name?.charAt(0)?.toUpperCase() || user?.last_name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        )}
                        <span className="font-semibold text-gray-800 group-hover:text-red-700 transition-colors text-sm">
                          {user?.first_name || 'User'}
                        </span>
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="relative px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white hover:from-red-600 hover:via-red-700 hover:to-red-800 transition-all duration-300 font-semibold shadow-md hover:shadow-lg flex items-center gap-1.5 text-sm group overflow-hidden"
                        title="Sign Out"
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                        <LogOut className="w-4 h-4 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                        <span className="relative z-10 hidden xl:inline">Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                  <Link 
                    to="/login" 
                    className="px-3 py-1.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-sm whitespace-nowrap"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold shadow-sm hover:shadow-md text-sm whitespace-nowrap"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    Register
                  </Link>
                    </>
                  )}
                </div>
              <button 
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 flex-shrink-0"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>
      </motion.nav>
    )}
  </AnimatePresence>
  <AnimatePresence>
    {mobileOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        onClick={() => setMobileOpen(false)}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          className="absolute right-0 top-0 h-full w-80 bg-white/95 backdrop-blur-xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <img 
                  src="/images/logo.jpg" 
                  alt="HSO Logo" 
                  className="w-10 h-10 object-cover rounded-lg border-2 border-red-800"
                />
                <h2 className="text-xl font-bold text-gray-800">HSO Platform</h2>
              </div>
              <button 
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-2 mb-6">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActiveState = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-base ${
                      isActiveState 
                        ? 'bg-red-50 text-red-700 border border-red-200 shadow-sm' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setMobileOpen(false)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                )
              })}
              <Link
                to="/shop"
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-base bg-red-50 text-red-700 border border-red-200 shadow-sm hover:bg-red-100"
                onClick={() => {
                  setMobileOpen(false)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                <Gift className="w-5 h-5 flex-shrink-0" />
                Special Offers
              </Link>
            </div>
            {isAuthenticated ? (
              <div className="pt-6 border-t-2 border-gray-200">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-4 border border-purple-100">
                  <div className="flex items-center gap-3">
                    {user?.profile_image ? (
                      <img 
                        src={user.profile_image} 
                        alt={user?.first_name} 
                        className="w-14 h-14 rounded-full object-cover border-4 border-white shadow-md" 
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg shadow-md ring-2 ring-purple-200">
                        {user?.first_name?.charAt(0)?.toUpperCase() || user?.last_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-bold text-gray-800 text-base">{user?.first_name} {user?.last_name}</div>
                      <div className="text-sm text-gray-600 capitalize">{user?.role?.replace('_', ' ') || 'Member'}</div>
                      {user?.email && (
                        <div className="text-xs text-gray-500 mt-0.5 truncate">{user.email}</div>
                      )}
                    </div>
                  </div>
                  {(isAdminAuthenticated && (isAdminRole || isExecutiveRole)) && (
                    <div className="mt-3 pt-3 border-t border-purple-200">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-sm">
                        <Shield className="w-3.5 h-3.5" />
                        {isAdminRole ? 'Administrator' : 'Executive'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 transition-all duration-200 text-base font-medium"
                    onClick={() => {
                      setMobileOpen(false)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  >
                    <User className="w-5 h-5 text-gray-600" />
                    <span>My Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileOpen(false)
                    }}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white transition-all duration-300 text-base font-semibold shadow-lg hover:shadow-xl relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                    
                    <LogOut className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="relative z-10">Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-6 border-t border-gray-200 space-y-3">
                <Link
                  to="/login"
                  className="block w-full px-4 py-3 text-center border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold text-base"
                  onClick={() => {
                    setMobileOpen(false)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block w-full px-4 py-3 text-center bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold text-base"
                  onClick={() => {
                    setMobileOpen(false)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
  {isScrolled && scrollProgress > 20 && (
    <motion.button
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center z-50"
      title="Scroll to Top"
    >
      <ArrowUp className="w-5 h-5" />
    </motion.button>
  )}
</>
)
}

export default AdvancedNavigation 
