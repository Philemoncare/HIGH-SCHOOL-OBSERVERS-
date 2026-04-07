import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ghanaSchools, 
  getUniqueRegions, 
  getUniqueTypes, 
  getUniqueCategories, 
  getUniquePrograms, 
  getUniqueFacilities
} from '../data/ghanaSchools'

const AdvancedSchoolSearch = ({ onSchoolSelect, placeholder = "Search for your school..." }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [filteredSchools, setFilteredSchools] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    region: '',
    type: '',
    category: '',
    program: '',
    facility: ''
  })
  // Get filter options
  const regions = getUniqueRegions()
  const types = getUniqueTypes()
  const categories = getUniqueCategories()
  const programs = getUniquePrograms()
  const facilities = getUniqueFacilities()

  const handleSearch = (value) => {
    setSearchTerm(value)
    
    if (value.length > 0) {
      // Search in school names first (most relevant)
      let results = ghanaSchools.filter(school => 
        school.name.toLowerCase().includes(value.toLowerCase())
      )
      
      // If no results, search in regions and districts
      if (results.length === 0) {
        results = ghanaSchools.filter(school => 
          school.region.toLowerCase().includes(value.toLowerCase()) ||
          school.district.toLowerCase().includes(value.toLowerCase())
        )
      }
      
      // Apply filters if any are active
      if (Object.values(filters).some(filter => filter !== '')) {
        results = results.filter(school => {
          if (filters.region && school.region !== filters.region) return false
          if (filters.type && school.type !== filters.type) return false
          if (filters.category && school.category !== filters.category) return false
          if (filters.program && !school.programs.includes(filters.program)) return false
          if (filters.facility && !school.facilities.includes(filters.facility)) return false
          return true
        })
      }
      
      setFilteredSchools(results.slice(0, 8))
      setShowDropdown(results.length > 0)
    } else {
      setFilteredSchools([])
      setShowDropdown(false)
    }
  }

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value }
    setFilters(newFilters)
    
    // Re-run search with new filters
    if (searchTerm.length > 0) {
      let results = ghanaSchools.filter(school => 
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.district.toLowerCase().includes(searchTerm.toLowerCase())
      )
      
      // Apply new filters
      results = results.filter(school => {
        if (newFilters.region && school.region !== newFilters.region) return false
        if (newFilters.type && school.type !== newFilters.type) return false
        if (newFilters.category && school.category !== newFilters.category) return false
        if (newFilters.program && !school.programs.includes(newFilters.program)) return false
        if (newFilters.facility && !school.facilities.includes(newFilters.facility)) return false
        return true
      })
      
      setFilteredSchools(results.slice(0, 10))
      setShowDropdown(results.length > 0)
    }
  }

  const handleSchoolSelect = (school) => {
    onSchoolSelect(school)
    setSearchTerm(school.name)
    setShowDropdown(false)
    setFilteredSchools([])
  }

  const clearFilters = () => {
    setFilters({
      region: '',
      type: '',
      category: '',
      program: '',
      facility: ''
    })
  }

  const getFilterCount = () => {
    return Object.values(filters).filter(value => value !== '').length
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-blue-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
          </svg>
          {getFilterCount() > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {getFilterCount()}
            </span>
          )}
        </button>
      </div>
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <select
                  value={filters.region}
                  onChange={(e) => handleFilterChange('region', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Regions</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                <select
                  value={filters.program}
                  onChange={(e) => handleFilterChange('program', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Programs</option>
                  {programs.map(program => (
                    <option key={program} value={program}>{program}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facility</label>
                <select
                  value={filters.facility}
                  onChange={(e) => handleFilterChange('facility', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Facilities</option>
                  {facilities.map(facility => (
                    <option key={facility} value={facility}>{facility}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>


          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showDropdown && filteredSchools.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl max-h-96 overflow-y-auto"
          >
                         {filteredSchools.map((school, index) => (
               <motion.div
                 key={index}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: index * 0.05 }}
                 onClick={() => handleSchoolSelect(school)}
                 className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
               >
                 <div className="flex justify-between items-start">
                   <div className="flex-1">
                     <div className="font-medium text-gray-800">{school.name}</div>
                     <div className="text-sm text-gray-500 mt-1">
                       {school.region} • {school.type} • {school.category}
                     </div>
                     <div className="text-xs text-gray-400 mt-1">
                       {school.enrollment} students • Est. {school.established}
                     </div>
                   </div>
                   <div className="text-right text-xs text-gray-400">
                     <div className="font-medium">{school.programs.length} programs</div>
                   </div>
                 </div>
                 <div className="mt-2 flex flex-wrap gap-1">
                   {school.programs.slice(0, 2).map((program, idx) => (
                     <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                       {program}
                     </span>
                   ))}
                   {school.programs.length > 2 && (
                     <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                       +{school.programs.length - 2} more
                     </span>
                   )}
                 </div>
               </motion.div>
             ))}
            {filteredSchools.length === 0 && searchTerm.length > 1 && (
              <div className="px-4 py-8 text-center text-gray-500">
                <div className="text-lg mb-2">No schools found</div>
                <div className="text-sm">Try adjusting your search terms or filters</div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdvancedSchoolSearch 