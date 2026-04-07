import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Eye, EyeOff, Clock, Star, BarChart3, Trash2, Save, X } from 'lucide-react'
import { useNavigation } from '../contexts/NavigationContext'

const NavigationSettings = ({ isOpen, onClose }) => {
  const { 
    navigationPreferences, 
    updateNavigationPreferences, 
    searchHistory, 
    clearSearchHistory,
    favoritePages,
    removeFromFavorites
  } = useNavigation()
  
  const [activeTab, setActiveTab] = useState('preferences')

  const tabs = [
    { id: 'preferences', name: 'Preferences', icon: Settings },
    { id: 'history', name: 'History', icon: Clock },
    { id: 'favorites', name: 'Favorites', icon: Star },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 }
  ]

  const handlePreferenceChange = (key, value) => {
    updateNavigationPreferences({ [key]: value })
  }

  const handleClearHistory = () => {
    clearSearchHistory()
  }

  const handleRemoveFavorite = (path) => {
    removeFromFavorites(path)
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Navigation Settings</h2>
              <p className="text-sm text-gray-600">Customize your navigation experience</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            )
          })}
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Display Options</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Show Breadcrumbs</p>
                      <p className="text-sm text-gray-600">Display navigation breadcrumbs at the top</p>
                    </div>
                    <button
                      onClick={() => handlePreferenceChange('showBreadcrumbs', !navigationPreferences.showBreadcrumbs)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        navigationPreferences.showBreadcrumbs ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          navigationPreferences.showBreadcrumbs ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Show Suggestions</p>
                      <p className="text-sm text-gray-600">Display smart navigation suggestions</p>
                    </div>
                    <button
                      onClick={() => handlePreferenceChange('showSuggestions', !navigationPreferences.showSuggestions)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        navigationPreferences.showSuggestions ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          navigationPreferences.showSuggestions ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Compact Mode</p>
                      <p className="text-sm text-gray-600">Use a more compact navigation layout</p>
                    </div>
                    <button
                      onClick={() => handlePreferenceChange('compactMode', !navigationPreferences.compactMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        navigationPreferences.compactMode ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          navigationPreferences.compactMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Auto Save History</p>
                      <p className="text-sm text-gray-600">Automatically save navigation history</p>
                    </div>
                    <button
                      onClick={() => handlePreferenceChange('autoSaveHistory', !navigationPreferences.autoSaveHistory)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        navigationPreferences.autoSaveHistory ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          navigationPreferences.autoSaveHistory ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Search History</h3>
                <button
                  onClick={handleClearHistory}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              </div>
              
              {searchHistory.length > 0 ? (
                <div className="space-y-2">
                  {searchHistory.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{item.query}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No search history yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Favorite Pages</h3>
              
              {favoritePages.length > 0 ? (
                <div className="space-y-2">
                  {favoritePages.map((page) => (
                    <div key={page.path} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{page.title || page.path}</p>
                        <p className="text-sm text-gray-500">{page.path}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveFavorite(page.path)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No favorite pages yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Navigation Analytics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {favoritePages.length}
                      </p>
                      <p className="text-sm text-blue-600">Favorite Pages</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {searchHistory.length}
                      </p>
                      <p className="text-sm text-green-600">Search Queries</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default NavigationSettings 