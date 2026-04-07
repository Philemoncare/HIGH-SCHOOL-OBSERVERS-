import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { 
  Users, 
  Calendar, 
  Bell, 
  TrendingUp, 
  Award,
  BookOpen,
  MapPin,
  Mail,
  Phone,
  Clock,
  Star,
  Activity,
  Settings,
  LogOut,
  Plus,
  Search,
  Filter,
  Download,
  Share2,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

function Dashboard() {
  // Get user from localStorage instead of AuthContext
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      // Not logged in → no dashboard
      navigate('/')
      return
    }
    const parsed = JSON.parse(userData)
    setUser(parsed)
    const role = (parsed?.role || '').toLowerCase()
    // Allow only admin or executive
    if (role !== 'admin' && role !== 'executive') {
      navigate('/')
    }
  }, [navigate])
  
  const [activeTab, setActiveTab] = useState('overview')
  const [notifications, setNotifications] = useState([])
  const [recentActivities, setRecentActivities] = useState([])
  const [stats, setStats] = useState({
    totalMembers: 2500,
    activeEvents: 8,
    upcomingEvents: 12,
    totalSchools: 150
  })

  useEffect(() => {
    // Simulate loading notifications and activities
    setNotifications([
      {
        id: 1,
        type: 'event',
        title: 'New Event: Ghana Students Social Media Day',
        message: 'Registration is now open for the upcoming event',
        time: '2 hours ago',
        read: false
      },
      {
        id: 2,
        type: 'payment',
        title: 'Payment Successful',
        message: 'Your membership renewal has been processed',
        time: '1 day ago',
        read: true
      },
      {
        id: 3,
        type: 'news',
        title: 'New Article Published',
        message: 'Check out the latest news about student initiatives',
        time: '2 days ago',
        read: true
      }
    ])

    setRecentActivities([
      {
        id: 1,
        type: 'event',
        title: 'Attended HSO Leadership Workshop',
        description: 'Participated in the leadership development program',
        time: '3 hours ago',
        icon: <Award className="w-4 h-4" />
      },
      {
        id: 2,
        type: 'payment',
        title: 'Renewed Membership',
        description: 'Successfully renewed your HSO membership',
        time: '1 day ago',
        icon: <CheckCircle className="w-4 h-4" />
      },
      {
        id: 3,
        type: 'profile',
        title: 'Updated Profile',
        description: 'Updated your school information',
        time: '2 days ago',
        icon: <Edit className="w-4 h-4" />
      }
    ])
  }, [])

  const handleLogout = () => {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } catch (_) {}
    navigate('/', { replace: true })
  }

  const markNotificationAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'event': return <Calendar className="w-4 h-4" />
      case 'payment': return <CheckCircle className="w-4 h-4" />
      case 'news': return <BookOpen className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'event': return 'text-blue-600 bg-blue-50'
      case 'payment': return 'text-green-600 bg-green-50'
      case 'news': return 'text-purple-600 bg-purple-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - High School Observer</title>
        <meta name="description" content="HSO Dashboard - Manage your membership and activities" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-purple-50/30">
        <div className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>{user?.school_name || 'Your School'}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors">
                  <Bell className="w-5 h-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.first_name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-800">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-gray-500">{user?.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-8">
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 rounded-2xl shadow-lg shadow-blue-500/20 p-6 border-2 border-blue-200/50 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-blue-700 mb-1">Total Members</p>
                      <p className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">{stats.totalMembers.toLocaleString()}</p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-gradient-to-br from-green-50 via-emerald-100 to-green-50 rounded-2xl shadow-lg shadow-green-500/20 p-6 border-2 border-green-200/50 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300 hover:-translate-y-1"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-green-700 mb-1">Active Events</p>
                      <p className="text-3xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-800 bg-clip-text text-transparent">{stats.activeEvents}</p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                      <Calendar className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-gradient-to-br from-purple-50 via-pink-100 to-purple-50 rounded-2xl shadow-lg shadow-purple-500/20 p-6 border-2 border-purple-200/50 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-purple-700 mb-1">Upcoming Events</p>
                      <p className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-800 bg-clip-text text-transparent">{stats.upcomingEvents}</p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-700 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                      <TrendingUp className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-gradient-to-br from-orange-50 via-amber-100 to-orange-50 rounded-2xl shadow-lg shadow-orange-500/20 p-6 border-2 border-orange-200/50 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-1"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-orange-700 mb-1">Total Schools</p>
                      <p className="text-3xl font-extrabold bg-gradient-to-r from-orange-600 to-amber-800 bg-clip-text text-transparent">{stats.totalSchools}</p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-700 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                      <Award className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
              <motion.div 
                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-500/10 p-6 border-2 border-gray-100/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/events" className="flex flex-col items-center p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-3">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-bold text-gray-800">Events</span>
                    </Link>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/news" className="flex flex-col items-center p-5 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30 mb-3">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-bold text-gray-800">News</span>
                    </Link>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/profile" className="flex flex-col items-center p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-100 border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-700 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 mb-3">
                        <Settings className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-bold text-gray-800">Profile</span>
                    </Link>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/events" className="flex flex-col items-center p-5 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-100 border-2 border-orange-200 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-700 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 mb-3">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-bold text-gray-800">Donate</span>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
              <motion.div 
                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-500/10 p-6 border-2 border-gray-100/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Recent Activities</h2>
                  <Link to="/profile" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">View All →</Link>
                </div>
                
                <div className="space-y-3">
                  {recentActivities.map((activity, idx) => (
                    <motion.div
                      key={activity.id}
                      className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border-2 border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-800">{activity.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
            <div className="space-y-6">
              <motion.div 
                className="bg-gradient-to-br from-white via-red-50/30 to-purple-50/30 rounded-2xl shadow-xl shadow-gray-500/10 p-6 border-2 border-gray-100/50 backdrop-blur-xl"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="text-center mb-6">
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-br from-red-500 via-pink-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-xl shadow-purple-500/40"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {user?.first_name?.charAt(0) || 'U'}
                  </motion.div>
                  <h3 className="text-lg font-bold text-gray-800">{user?.first_name} {user?.last_name}</h3>
                  <p className="text-sm font-semibold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent mt-1">{user?.role}</p>
                  <p className="text-xs text-gray-500 mt-2">{user?.school_name}</p>
                </div>
                
                <div className="space-y-3 pt-4 border-t-2 border-gray-100">
                  <div className="flex items-center text-sm text-gray-700 bg-white/50 rounded-lg p-2">
                    <Mail className="w-4 h-4 mr-2 text-red-600" />
                    <span className="font-medium">{user?.email}</span>
                  </div>
                  {user?.phone && (
                    <div className="flex items-center text-sm text-gray-700 bg-white/50 rounded-lg p-2">
                      <Phone className="w-4 h-4 mr-2 text-purple-600" />
                      <span className="font-medium">{user.phone}</span>
                    </div>
                  )}
                </div>
              </motion.div>
              <motion.div 
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-700">Mark All Read</button>
                </div>
                
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        notification.read ? 'bg-gray-50' : 'bg-blue-50 border border-blue-200'
                      }`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                          <p className="text-xs text-gray-600">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
              <motion.div 
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Stats</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Events Attended</span>
                    <span className="text-sm font-semibold text-gray-800">12</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Days as Member</span>
                    <span className="text-sm font-semibold text-gray-800">45</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Achievement Points</span>
                    <span className="text-sm font-semibold text-gray-800">1,250</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Next Renewal</span>
                    <span className="text-sm font-semibold text-red-600">15 days</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Dashboard 