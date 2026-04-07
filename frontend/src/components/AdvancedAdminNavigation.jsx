import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Home, 
  Search, 
  Command,
  Bell,
  Settings,
  HelpCircle,
  Zap,
  ChevronRight
} from 'lucide-react'
import { useState, useEffect } from 'react'

function AdvancedAdminNavigation({ 
  title, 
  subtitle, 
  icon: Icon, 
  breadcrumbs = [],
  actions = [],
  onBack,
  showSearch = false,
  searchPlaceholder = "Search...",
  onSearch,
  quickActions = []
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false)
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSearch = (query) => {
    setSearchQuery(query)
    if (onSearch) {
      onSearch(query)
    }
  }

  const defaultBreadcrumbs = [
    { label: 'Admin Dashboard', path: '/admin' },
    ...breadcrumbs
  ]

  return (
    <>
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                  title="Go back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              
              <div className="flex items-center gap-2 text-sm text-gray-500 min-w-0">
                {defaultBreadcrumbs.map((crumb, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {idx > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                    {idx === defaultBreadcrumbs.length - 1 ? (
                      <span className="text-gray-900 font-semibold truncate">{crumb.label}</span>
                    ) : (
                      <button
                        onClick={() => navigate(crumb.path)}
                        className="hover:text-gray-900 transition-colors truncate"
                      >
                        {crumb.label}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {showSearch && (
              <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full pl-10 pr-10 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-300 text-sm transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-gray-400">
                    <Command className="w-3.5 h-3.5" />
                    <span>K</span>
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              {quickActions.length > 0 && (
                <div className="hidden lg:flex items-center gap-2">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={action.onClick}
                      className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                    >
                      {action.icon && <action.icon className="w-4 h-4" />}
                      <span className="hidden xl:inline">{action.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {actions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={action.onClick}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                    action.primary
                      ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                      : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {action.icon && <action.icon className="w-4 h-4" />}
                  <span className="hidden sm:inline">{action.label}</span>
                </button>
              ))}

              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                title="Command Palette (Ctrl+K)"
              >
                <Command className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-6">
            {Icon && (
              <div className="p-4 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl shadow-lg">
                <Icon className="w-8 h-8 text-white" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{title}</h1>
              {subtitle && (
                <p className="text-lg text-gray-600">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      {commandPaletteOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
          onClick={() => setCommandPaletteOpen(false)}
        >
          <div 
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-gray-50">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                autoFocus
                type="text"
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent outline-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setCommandPaletteOpen(false)
                }}
              />
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Command className="w-3.5 h-3.5" />
                <span>K</span>
              </div>
            </div>
            <div className="p-2 max-h-96 overflow-y-auto">
              <div className="text-sm text-gray-500 p-4 text-center">
                Quick actions and navigation commands will appear here
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AdvancedAdminNavigation
