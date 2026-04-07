import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const NavigationContext = createContext()

export const useNavigation = () => {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}

export const NavigationProvider = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [navigationHistory, setNavigationHistory] = useState([])
  const [favoritePages, setFavoritePages] = useState([])
  const [recentPages, setRecentPages] = useState([])
  const [navigationAnalytics, setNavigationAnalytics] = useState({
    totalVisits: 0,
    uniquePages: 0,
    averageSessionTime: 0,
    mostVisitedPages: []
  })
  const [searchHistory, setSearchHistory] = useState([])
  const [navigationPreferences, setNavigationPreferences] = useState({
    showBreadcrumbs: true,
    showSuggestions: true,
    compactMode: false,
    autoSaveHistory: true
  })

  // Track page visits
  useEffect(() => {
    const currentPage = {
      path: location.pathname,
      timestamp: Date.now(),
      title: document.title
    }

    setNavigationHistory(prev => {
      const newHistory = [...prev, currentPage]
      return newHistory.slice(-50) // Keep last 50 navigations
    })

    setRecentPages(prev => {
      const filtered = prev.filter(page => page.path !== location.pathname)
      return [currentPage, ...filtered].slice(0, 10)
    })

    // Update analytics
    setNavigationAnalytics(prev => ({
      ...prev,
      totalVisits: prev.totalVisits + 1,
      uniquePages: new Set([...prev.mostVisitedPages, location.pathname]).size,
      mostVisitedPages: updateMostVisitedPages(prev.mostVisitedPages, location.pathname)
    }))
  }, [location.pathname])

  const updateMostVisitedPages = (currentPages, newPath) => {
    const pageCounts = {}
    
    // Count existing pages
    currentPages.forEach(page => {
      pageCounts[page.path] = (pageCounts[page.path] || 0) + page.count
    })
    
    // Add new page
    pageCounts[newPath] = (pageCounts[newPath] || 0) + 1
    
    // Convert back to array and sort
    return Object.entries(pageCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }

  const addToFavorites = useCallback((page) => {
    setFavoritePages(prev => {
      const exists = prev.find(p => p.path === page.path)
      if (exists) return prev
      return [...prev, { ...page, addedAt: Date.now() }]
    })
  }, [])

  const removeFromFavorites = useCallback((path) => {
    setFavoritePages(prev => prev.filter(page => page.path !== path))
  }, [])

  const addSearchQuery = useCallback((query) => {
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item.query !== query)
      return [{ query, timestamp: Date.now() }, ...filtered].slice(0, 20)
    })
  }, [])

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([])
  }, [])

  const updateNavigationPreferences = useCallback((preferences) => {
    setNavigationPreferences(prev => ({ ...prev, ...preferences }))
  }, [])

  const getNavigationSuggestions = useCallback((currentPath, userRole) => {
    const suggestions = []
    
    // Role-based suggestions
    if (userRole === 'super_admin' || userRole === 'executive') {
      suggestions.push(
        { name: 'Admin Dashboard', path: '/admin', priority: 'high' },
        { name: 'User Management', path: '/admin/users', priority: 'medium' },
        { name: 'News Management', path: '/admin/news', priority: 'medium' },
        { name: 'Events Management', path: '/admin/events', priority: 'medium' }
      )
    }
    
    if (userRole === 'school_rep') {
      suggestions.push(
        { name: 'My Dashboard', path: '/dashboard', priority: 'high' },
        { name: 'My Profile', path: '/profile', priority: 'medium' }
      )
    }
    
    // Context-aware suggestions
    if (currentPath.includes('/admin')) {
      suggestions.push(
        { name: 'Leadership Team', path: '/admin/leadership', priority: 'low' },
        { name: 'Payment Management', path: '/admin/payments', priority: 'low' }
      )
    }
    
    // Recent pages suggestions
    recentPages.slice(0, 3).forEach(page => {
      if (page.path !== currentPath) {
        suggestions.push({
          name: `Recent: ${page.title || page.path}`,
          path: page.path,
          priority: 'low'
        })
      }
    })
    
    return suggestions.slice(0, 6)
  }, [recentPages])

  const getBreadcrumbs = useCallback((path) => {
    const segments = path.split('/').filter(Boolean)
    const breadcrumbs = [{ name: 'Home', path: '/', icon: 'home' }]
    
    let currentPath = ''
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ')
      breadcrumbs.push({
        name,
        path: currentPath,
        icon: getIconForPath(currentPath)
      })
    })
    
    return breadcrumbs
  }, [])

  const getIconForPath = (path) => {
    const iconMap = {
      '/admin': 'shield',
      '/admin/news': 'newspaper',
      '/admin/events': 'calendar',
      '/admin/users': 'users',
      '/admin/shop': 'shopping-bag',
      '/admin/leadership': 'crown',
      '/admin/profile': 'user',
      '/dashboard': 'user',
      '/profile': 'user',
      '/news': 'newspaper',
      '/events': 'calendar',
      '/shop': 'shopping-bag',
      '/magazine': 'book-open',
      '/about': 'user',
      '/login': 'user',
      '/register': 'user'
    }
    return iconMap[path] || 'home'
  }

  const getNavigationStats = useCallback(() => {
    const uniquePaths = new Set(navigationHistory.map(nav => nav.path))
    const totalTime = navigationHistory.length > 1 
      ? navigationHistory[navigationHistory.length - 1].timestamp - navigationHistory[0].timestamp
      : 0
    
    return {
      totalVisits: navigationHistory.length,
      uniquePages: uniquePaths.size,
      averageSessionTime: navigationHistory.length > 1 ? totalTime / (navigationHistory.length - 1) : 0,
      favoritePagesCount: favoritePages.length,
      recentPagesCount: recentPages.length
    }
  }, [navigationHistory, favoritePages, recentPages])

  /** Returns the previous in-app path (last different path in history), or null if none. */
  const getPreviousPath = useCallback(() => {
    const current = location.pathname
    for (let i = navigationHistory.length - 1; i >= 0; i--) {
      if (navigationHistory[i].path !== current) return navigationHistory[i].path
    }
    return null
  }, [location.pathname, navigationHistory])

  /**
   * Navigate to the previous location in session history, or to fallbackPath if no previous.
   * Use this for "Back" buttons so users return to where they came from, not always home/parent.
   */
  const goBack = useCallback((fallbackPath = '/') => {
    const previous = getPreviousPath()
    if (previous) {
      navigate(previous)
    } else {
      navigate(fallbackPath)
    }
  }, [navigate, getPreviousPath])

  const value = {
    navigationHistory,
    favoritePages,
    recentPages,
    navigationAnalytics,
    searchHistory,
    navigationPreferences,
    addToFavorites,
    removeFromFavorites,
    addSearchQuery,
    clearSearchHistory,
    updateNavigationPreferences,
    getNavigationSuggestions,
    getBreadcrumbs,
    getNavigationStats,
    getPreviousPath,
    goBack
  }

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
} 