import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Clock, MapPin, Star, Users, Activity, Target, Sparkles, Zap } from 'lucide-react'
import { useNavigation } from '../contexts/NavigationContext'

const NavigationAnalytics = () => {
  const { 
    navigationHistory, 
    recentPages, 
    favoritePages, 
    navigationAnalytics, 
    getNavigationStats 
  } = useNavigation()
  const [timeRange, setTimeRange] = useState('7d')
  const stats = getNavigationStats()

  const getTimeRangeData = () => {
    const now = Date.now()
    const ranges = {
      '24h': now - (24 * 60 * 60 * 1000),
      '7d': now - (7 * 24 * 60 * 60 * 1000),
      '30d': now - (30 * 24 * 60 * 60 * 1000)
    }
    
    return navigationHistory.filter(nav => nav.timestamp > ranges[timeRange])
  }

  const timeRangeData = getTimeRangeData()

  const getMostVisitedPages = () => {
    const pageCounts = {}
    timeRangeData.forEach(nav => {
      pageCounts[nav.path] = (pageCounts[nav.path] || 0) + 1
    })
    
    return Object.entries(pageCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  const getAverageSessionTime = () => {
    if (timeRangeData.length < 2) return 0
    
    const totalTime = timeRangeData[timeRangeData.length - 1].timestamp - timeRangeData[0].timestamp
    return Math.round(totalTime / (timeRangeData.length - 1) / 1000) // Convert to seconds
  }

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getPageName = (path) => {
    const nameMap = {
      '/': 'Home',
      '/admin': 'Admin Dashboard',
      '/admin/news': 'News Management',
      '/admin/events': 'Events Management',
      '/admin/users': 'User Management',
      '/admin/shop': 'Shop Management',
      '/admin/leadership': 'Leadership Team',
      '/admin/profile': 'Admin Profile',
      '/dashboard': 'User Dashboard',
      '/profile': 'User Profile',
      '/news': 'News',
      '/events': 'Events',
      '/shop': 'Shop',
      '/magazine': 'Magazine',
      '/about': 'About',
      '/login': 'Login',
      '/register': 'Register'
    }
    return nameMap[path] || path
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <BarChart3 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Navigation Analytics</h2>
            <p className="text-gray-600">Advanced insights and patterns</p>
          </div>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 font-medium">Total Visits</p>
              <p className="text-3xl font-bold">{timeRangeData.length}</p>
            </div>
            <TrendingUp className="w-10 h-10 opacity-80" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 font-medium">Unique Pages</p>
              <p className="text-3xl font-bold">{new Set(timeRangeData.map(nav => nav.path)).size}</p>
            </div>
            <MapPin className="w-10 h-10 opacity-80" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 font-medium">Avg Session</p>
              <p className="text-3xl font-bold">{formatTime(getAverageSessionTime())}</p>
            </div>
            <Clock className="w-10 h-10 opacity-80" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 font-medium">Favorites</p>
              <p className="text-3xl font-bold">{favoritePages.length}</p>
            </div>
            <Star className="w-10 h-10 opacity-80" />
          </div>
        </motion.div>
      </div>
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
          <Target className="w-6 h-6 text-red-600" />
          Most Visited Pages
        </h3>
        <div className="space-y-4">
          {getMostVisitedPages().map((page, index) => (
            <motion.div
              key={page.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50/80 backdrop-blur-sm rounded-xl hover:bg-gray-100/80 transition-all duration-300 border border-gray-200/50"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{getPageName(page.path)}</p>
                  <p className="text-sm text-gray-500">{page.path}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <motion.div 
                    className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${(page.count / Math.max(...getMostVisitedPages().map(p => p.count))) * 100}%` 
                    }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                </div>
                <span className="text-lg font-bold text-gray-700">{page.count}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
          <Activity className="w-6 h-6 text-blue-600" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {recentPages.slice(0, 5).map((page, index) => (
            <motion.div
              key={page.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-3 hover:bg-gray-50/80 rounded-xl transition-all duration-300"
            >
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-sm" />
              <div className="flex-1">
                <p className="font-medium text-gray-800">{getPageName(page.path)}</p>
                <p className="text-sm text-gray-500">
                  {new Date(page.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default NavigationAnalytics 