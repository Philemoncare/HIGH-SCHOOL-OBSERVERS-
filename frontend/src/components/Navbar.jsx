import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

function Navbar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'News', href: '/news' },
    { name: 'Events', href: '/events' },
    { name: 'Shop', href: '/shop' },
    { name: 'Magazine', href: '/magazine' },
  ]
  const isActive = (path) => location.pathname === path

  // Advanced scroll detection with throttling
  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          
          // Check if scrolled past threshold
          setIsScrolled(currentScrollY > 20)
          
          // Calculate scroll progress
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight
          const progress = Math.min((currentScrollY / maxScroll) * 100, 100)
          setScrollProgress(progress)
          
          // Determine visibility based on scroll direction
          if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
            // Scrolling down - hide navbar
            setIsVisible(false)
          } else if (currentScrollY < lastScrollY.current) {
            // Scrolling up - show navbar
            setIsVisible(true)
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

  // Reset visibility when route changes
  useEffect(() => {
    setIsVisible(true)
    setIsScrolled(false)
    setScrollProgress(0)
  }, [location.pathname])

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ 
            type: "spring", 
            damping: 25, 
            stiffness: 300,
            duration: 0.3
          }}
          className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
            isScrolled 
              ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50' 
              : 'bg-white shadow-md'
          }`}
        >
      <div className="container mx-auto flex items-center justify-between py-2 px-4">
        <Link to="/" className="flex items-center gap-3" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src="/images/logo.jpg" alt="HSO Logo" className="h-12 w-12 object-cover rounded-xl shadow-md ring-2 ring-red-200" />
          <span className="font-bold text-xl text-red-800">High School Observer</span>
        </Link>
        <div className="hidden md:flex items-center gap-x-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={`hover:text-red-700 font-medium transition-colors ${isActive(item.href) ? 'text-red-800 underline underline-offset-4' : 'text-gray-700'}`}
            >
              {item.name}
            </Link>
          ))}
          <Link to="/admin" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={`hover:text-red-700 font-medium transition-colors ${isActive('/admin') ? 'text-red-800 underline underline-offset-4' : 'text-blue-700'}`}>Admin Dashboard</Link>
          <Link to="/dashboard" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={`hover:text-red-700 font-medium transition-colors ${isActive('/dashboard') ? 'text-red-800 underline underline-offset-4' : 'text-green-700'}`}>Dashboard</Link>
        </div>
        <div className="hidden md:flex items-center gap-x-2">
          <Link to="/login" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-5 py-2 bg-white text-red-800 border-2 border-red-800 rounded-full shadow hover:bg-red-50 hover:text-red-900 transition font-semibold focus:outline-none focus:ring-2 focus:ring-red-300">Login</Link>
          <Link to="/register" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-5 py-2 bg-gradient-to-r from-red-700 to-red-800 text-white rounded-full shadow hover:from-red-800 hover:to-red-900 transition font-semibold border-2 border-white focus:outline-none focus:ring-2 focus:ring-red-300">Register</Link>
        </div>
        <motion.button 
          className="md:hidden p-2 rounded-lg hover:bg-red-50 transition-all duration-200" 
          onClick={()=>setMobileOpen(v=>!v)} 
          aria-label="Open menu"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={mobileOpen ? "open" : "closed"}
            className="w-7 h-7 text-red-800"
          >
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <motion.path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M4 6h16M4 12h16M4 18h16"
                variants={{
                  open: { rotate: 180, opacity: 0 },
                  closed: { rotate: 0, opacity: 1 }
                }}
                transition={{ duration: 0.2 }}
              />
              <motion.path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M6 18L18 6M6 6l12 12"
                variants={{
                  open: { rotate: 0, opacity: 1 },
                  closed: { rotate: -180, opacity: 0 }
                }}
                transition={{ duration: 0.2 }}
                className="absolute"
              />
            </svg>
          </motion.div>
        </motion.button>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-white/95 backdrop-blur-md shadow-lg border-t border-gray-200/50 overflow-hidden"
          >
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="flex flex-col items-center gap-4 py-6"
            >
            {navigation.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ 
                  delay: 0.1 + (index * 0.05), 
                  duration: 0.3,
                  type: "spring",
                  stiffness: 300
                }}
              >
                <Link
                  to={item.href}
                  className={`block w-full text-center py-3 px-4 font-medium rounded-lg transition-all duration-200 ${
                    isActive(item.href) 
                      ? 'text-red-800 bg-red-50 border border-red-200' 
                      : 'text-gray-700 hover:text-red-700 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setMobileOpen(false)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  {item.name}
                </Link>
              </motion.div>
            ))}
            <div className="flex flex-col gap-2 w-full px-4">
              <Link to="/admin" onClick={() => { setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="px-5 py-2 bg-white text-blue-800 border-2 border-blue-800 rounded-full shadow hover:bg-blue-50 hover:text-blue-900 transition font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300">Admin Dashboard</Link>
              <Link to="/dashboard" onClick={() => { setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="px-5 py-2 bg-gradient-to-r from-green-700 to-green-800 text-white rounded-full shadow hover:from-green-800 hover:to-green-900 transition font-semibold border-2 border-white focus:outline-none focus:ring-2 focus:ring-green-300">Dashboard</Link>
              <Link to="/login" onClick={() => { setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="px-5 py-2 bg-white text-red-800 border-2 border-red-800 rounded-full shadow hover:bg-red-50 hover:text-red-900 transition font-semibold focus:outline-none focus:ring-2 focus:ring-red-300">Login</Link>
              <Link to="/register" onClick={() => { setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="px-5 py-2 bg-gradient-to-r from-red-700 to-red-800 text-white rounded-full shadow hover:from-red-800 hover:to-red-900 transition font-semibold border-2 border-white focus:outline-none focus:ring-2 focus:ring-red-300">Register</Link>
            </div>
            </motion.div>
          </motion.div>
      )}
      </AnimatePresence>
        </motion.nav>
      )}
    </AnimatePresence>
  )
}

export default Navbar 