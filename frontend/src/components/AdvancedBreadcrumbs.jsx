import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ChevronRight, Home, MapPin, Clock, Star, TrendingUp, Sparkles,
  Shield, Newspaper, Calendar, Users, Heart, ShoppingBag, Crown, BookOpen, User
} from 'lucide-react'
import { useNavigation } from '../contexts/NavigationContext'

const AdvancedBreadcrumbs = () => {
  const location = useLocation()
  const { getBreadcrumbs, recentPages, favoritePages, navigationHistory } = useNavigation()
  const breadcrumbs = getBreadcrumbs(location.pathname)

  if (breadcrumbs.length <= 1) return null

  const getBreadcrumbIcon = (path) => {
    const iconMap = {
      '/': Home,
      '/admin': Shield,
      '/admin/news': Newspaper,
      '/admin/events': Calendar,
      '/admin/users': Users,
      '/admin/shop': ShoppingBag,
      '/admin/leadership': Crown,
      '/admin/profile': User,
      '/dashboard': User,
      '/profile': User,
      '/news': Newspaper,
      '/events': Calendar,
      '/shop': ShoppingBag,
      '/magazine': BookOpen,
      '/about': User,
      '/login': User,
      '/register': User
    }
    return iconMap[path] || Home
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/60 backdrop-blur-sm border-b border-gray-200/30"
    >
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <nav className="flex items-center space-x-1" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, index) => {
              const Icon = getBreadcrumbIcon(crumb.path)
              const isLast = index === breadcrumbs.length - 1
              
              return (
                <div key={crumb.path} className="flex items-center">
                  {index > 0 && (
                    <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                  )}
                  
                  {isLast ? (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700 font-medium"
                    >
                      <Icon className="w-4 h-4" />
                      {crumb.name}
                    </motion.span>
                  ) : (
                    <Link
                      to={crumb.path}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all duration-200"
                    >
                      <Icon className="w-4 h-4" />
                      {crumb.name}
                    </Link>
                  )}
                </div>
              )
            })}
          </nav>


        </div>
      </div>
    </motion.div>
  )
}

export default AdvancedBreadcrumbs 