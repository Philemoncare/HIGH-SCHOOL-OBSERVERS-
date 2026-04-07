import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  getSchoolStatistics, 
  getUniqueRegions, 
  getUniqueTypes, 
  getUniqueCategories,
  filterSchoolsByRegion,
  filterSchoolsByType,
  filterSchoolsByCategory
} from '../data/ghanaSchools'

const SchoolAnalytics = () => {
  const [stats, setStats] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [filteredStats, setFilteredStats] = useState(null)

  const regions = getUniqueRegions()
  const types = getUniqueTypes()
  const categories = getUniqueCategories()

  useEffect(() => {
    setStats(getSchoolStatistics())
  }, [])

  useEffect(() => {
    if (stats) {
      let filtered = { ...stats }
      
      if (selectedRegion) {
        const regionSchools = filterSchoolsByRegion(selectedRegion)
        filtered.total = regionSchools.length
        filtered.averageEnrollment = Math.round(
          regionSchools.reduce((sum, school) => sum + school.enrollment, 0) / regionSchools.length
        )
      }
      
      if (selectedType) {
        const typeSchools = filterSchoolsByType(selectedType)
        filtered.total = typeSchools.length
        filtered.averageEnrollment = Math.round(
          typeSchools.reduce((sum, school) => sum + school.enrollment, 0) / typeSchools.length
        )
      }
      
      if (selectedCategory) {
        const categorySchools = filterSchoolsByCategory(selectedCategory)
        filtered.total = categorySchools.length
        filtered.averageEnrollment = Math.round(
          categorySchools.reduce((sum, school) => sum + school.enrollment, 0) / categorySchools.length
        )
      }
      
      setFilteredStats(filtered)
    }
  }, [stats, selectedRegion, selectedType, selectedCategory])

  const clearFilters = () => {
    setSelectedRegion('')
    setSelectedType('')
    setSelectedCategory('')
  }

  if (!stats) return <div>Loading analytics...</div>

  const displayStats = filteredStats || stats

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">School Analytics Dashboard</h3>
        <button
          onClick={clearFilters}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
        >
          Clear Filters
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Region</label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Regions</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            {types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg"
        >
          <div className="text-2xl font-bold">{displayStats.total}</div>
          <div className="text-sm opacity-90">Total Schools</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg"
        >
          <div className="text-2xl font-bold">{displayStats.averageEnrollment}</div>
          <div className="text-sm opacity-90">Avg Enrollment</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg"
        >
          <div className="text-2xl font-bold">{stats.oldestSchool?.established}</div>
          <div className="text-sm opacity-90">Oldest School</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-lg"
        >
          <div className="text-2xl font-bold">{Object.keys(stats.byRegion).length}</div>
          <div className="text-sm opacity-90">Regions</div>
        </motion.div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-3">Schools by Region</h4>
          <div className="space-y-2">
            {Object.entries(stats.byRegion)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 8)
              .map(([region, count]) => (
                <div key={region} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{region}</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(count / stats.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-800">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-3">Schools by Category</h4>
          <div className="space-y-2">
            {Object.entries(stats.byCategory)
              .sort(([,a], [,b]) => b - a)
              .map(([category, count]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{category}</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(count / stats.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-800">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">School Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-700">Oldest School:</span> {stats.oldestSchool?.name} ({stats.oldestSchool?.established})
          </div>
          <div>
            <span className="font-medium text-blue-700">Newest School:</span> {stats.newestSchool?.name} ({stats.newestSchool?.established})
          </div>
          <div>
            <span className="font-medium text-blue-700">Largest Region:</span> {Object.entries(stats.byRegion).sort(([,a], [,b]) => b - a)[0]?.[0]}
          </div>
          <div>
            <span className="font-medium text-blue-700">Most Common Category:</span> {Object.entries(stats.byCategory).sort(([,a], [,b]) => b - a)[0]?.[0]}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SchoolAnalytics 