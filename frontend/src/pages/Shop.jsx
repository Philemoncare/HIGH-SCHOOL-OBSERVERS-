import { useMemo, useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import axios from 'axios'
import toast from 'react-hot-toast'
import AdvancedPurchaseModal from '../components/AdvancedPurchaseModal'
import { ListFilter, LayoutGrid, LayoutList, Search, SlidersHorizontal, Star, CheckCircle2, ShoppingBag } from 'lucide-react'
import { motion } from 'framer-motion'
import RealIcon from '../components/RealIcon'

function Shop() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('relevance')
  const [onlyInStock, setOnlyInStock] = useState(false)
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async (showToast = true) => {
    try {
      setLoading(true)
      setError(null)
      
      // First check if backend is reachable
      try {
        const healthCheck = await axios.get('/api/health', { timeout: 5000 })
        console.log('Backend health check:', healthCheck.data)
        
        // Check database connection when backend reports it
        if (healthCheck.data.database && !healthCheck.data.database.connected) {
          console.warn('Database not connected:', healthCheck.data.database)
          throw new Error('Database is not connected. Please try again later or contact support.')
        }
      } catch (healthError) {
        console.error('Backend health check failed:', healthError)
        
        if (healthError.code === 'ECONNREFUSED' || healthError.code === 'ERR_NETWORK') {
          throw new Error('Cannot connect to backend server. Please check your internet connection or try again in a moment.')
        } else if (healthError.code === 'ECONNABORTED' || healthError.message?.includes('timeout')) {
          throw new Error('Backend server is taking too long to respond. Please try again.')
        } else if (healthError.message.includes('Database')) {
          throw healthError
        } else {
          throw new Error('Backend server is not responding. Please try again shortly.')
        }
      }
      
      const response = await axios.get('/api/shop/public/products', {
        timeout: 10000 // 10 second timeout
      })
      console.log('Products response:', response.data)
      
      // Handle different response formats
      if (response.data) {
        if (response.data.success === false) {
          // Backend returned an error response
          throw new Error(response.data.error || 'Failed to load products')
        }
        
        if (response.data.products !== undefined) {
          const productsList = Array.isArray(response.data.products) ? response.data.products : []
          setProducts(productsList)
          
          if (productsList.length === 0 && showToast) {
            toast.success('No products available at the moment', {
              id: 'products-empty',
              duration: 3000
            })
          }
        } else if (Array.isArray(response.data)) {
          // Handle case where response is directly an array
          setProducts(response.data)
        } else {
          setProducts([])
          console.warn('Unexpected response format:', response.data)
        }
      } else {
        setProducts([])
        console.warn('Empty response received')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        code: error.code
      })
      
      // Determine error message based on error type
      let errorMessage = 'Failed to load products'
      let errorType = 'unknown'
      
      if (!error.response) {
        // Network error or server not reachable
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
          errorMessage = 'Cannot connect to server. Please check your connection and try again.'
          errorType = 'network'
        } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.'
          errorType = 'timeout'
        } else if (error.message) {
          errorMessage = error.message
        }
      } else if (error.response.status === 404) {
        errorMessage = 'Products endpoint not found. Please contact support.'
        errorType = 'notfound'
      } else if (error.response.status >= 500) {
        errorMessage = 'Server error. Please try again in a moment.'
        errorType = 'server'
      } else if (error.response.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message
      }
      
      setError({ message: errorMessage, type: errorType })
      setProducts([])
      
      // Only show toast if explicitly requested (not on retry)
      if (showToast) {
        toast.dismiss('products-load-error')
        toast.error(errorMessage, {
          id: 'products-load-error',
          duration: 5000
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = (product) => {
    setSelectedProduct(product)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    setSelectedProduct(null)
    fetchProducts() // Refresh products to update stock
  }

  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category).filter(Boolean))
    return ['all', ...Array.from(set)]
  }, [products])

  const filteredAndSorted = useMemo(() => {
    let list = [...products]

    // Filters
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      list = list.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (Array.isArray(p.tags) ? p.tags.join(' ') : '').toLowerCase().includes(q)
      )
    }
    if (category !== 'all') {
      list = list.filter(p => p.category === category)
    }
    if (onlyInStock) {
      list = list.filter(p => (p.stock_quantity || 0) > 0)
    }
    if (featuredOnly) {
      list = list.filter(p => !!p.featured)
    }
    const min = priceMin === '' ? -Infinity : Number(priceMin)
    const max = priceMax === '' ? Infinity : Number(priceMax)
    if (!(Number.isNaN(min) && Number.isNaN(max))) {
      list = list.filter(p => {
        const price = Number(p.price) || 0
        return price >= (Number.isNaN(min) ? -Infinity : min) && price <= (Number.isNaN(max) ? Infinity : max)
      })
    }

    // Sorting
    switch (sortBy) {
      case 'price_asc':
        list.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case 'price_desc':
        list.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case 'stock_desc':
        list.sort((a, b) => (b.stock_quantity || 0) - (a.stock_quantity || 0))
        break
      case 'newest':
        list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        break
      default:
        // relevance: featured first, then newest
        list.sort((a, b) => (b.featured === true) - (a.featured === true) || (new Date(b.created_at || 0) - new Date(a.created_at || 0)))
    }

    return list
  }, [products, searchQuery, category, onlyInStock, featuredOnly, priceMin, priceMax, sortBy])

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Shop - High School Observer</title>
        <meta name="description" content="Educational resources and merchandise from High School Observer" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/20 to-purple-50/20 py-6 sm:py-8">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-8 sm:mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-3 mb-4">
              <ShoppingBag className="w-10 h-10 text-red-600 flex-shrink-0" />
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                HSO Shop
              </h1>
            </div>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 font-medium px-4">
              Educational resources, books, and exclusive merchandise
            </p>
          </motion.div>
          <motion.div
            className="bg-white/90 backdrop-blur-xl border-2 border-gray-200/50 rounded-2xl p-4 sm:p-5 mb-6 shadow-xl shadow-gray-500/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              <div className="flex-1 flex items-center gap-2">
                <div className="relative w-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-red-600"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 w-full">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-red-500 focus:border-red-500">
                  {categories.map(c => (
                    <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>
                  ))}
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-red-500 focus:border-red-500">
                  <option value="relevance">Sort: Relevance</option>
                  <option value="newest">Sort: Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="stock_desc">Stock: High to Low</option>
                </select>
                <div className="flex items-center gap-1.5 sm:gap-2 border border-gray-300 rounded-lg px-2 py-1.5 sm:py-2 focus-within:ring-2 focus-within:ring-red-500 focus-within:border-red-500">
                  <SlidersHorizontal className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <input 
                    inputMode="numeric" 
                    pattern="[0-9]*" 
                    className="w-14 sm:w-16 py-1 sm:py-2 outline-none text-sm sm:text-base" 
                    placeholder="Min" 
                    value={priceMin} 
                    onChange={(e)=>setPriceMin(e.target.value)} 
                  />
                  <span className="text-gray-400 text-sm sm:text-base">-</span>
                  <input 
                    inputMode="numeric" 
                    pattern="[0-9]*" 
                    className="w-14 sm:w-16 py-1 sm:py-2 outline-none text-sm sm:text-base" 
                    placeholder="Max" 
                    value={priceMax} 
                    onChange={(e)=>setPriceMax(e.target.value)} 
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button 
                    onClick={() => setViewMode('grid')} 
                    className={`p-2 sm:p-2.5 rounded-lg border transition-all duration-200 ${viewMode==='grid' ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`} 
                    title="Grid view"
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')} 
                    className={`p-2 sm:p-2.5 rounded-lg border transition-all duration-200 ${viewMode==='list' ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`} 
                    title="List view"
                    aria-label="List view"
                  >
                    <LayoutList className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 sm:mt-0">
                <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-700 cursor-pointer hover:text-gray-900 transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 cursor-pointer" 
                    checked={onlyInStock} 
                    onChange={(e)=>setOnlyInStock(e.target.checked)} 
                  />
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 flex-shrink-0" /> 
                  <span className="whitespace-nowrap">In stock</span>
                </label>
                <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-700 cursor-pointer hover:text-gray-900 transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 cursor-pointer" 
                    checked={featuredOnly} 
                    onChange={(e)=>setFeaturedOnly(e.target.checked)} 
                  />
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 flex-shrink-0" /> 
                  <span className="whitespace-nowrap">Featured</span>
                </label>
              </div>
            </div>
          </motion.div>

          {error && !loading ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 p-8 rounded-lg max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Unable to Load Products
                </h2>
                <p className="text-gray-600 mb-4">
                  {error.message}
                </p>
                {import.meta.env.DEV && error.message.includes('backend server') && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
                    <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                      <RealIcon symbol="💡" className="w-4 h-4" colorClassName="text-yellow-700" />
                      How to Fix
                    </h3>
                    <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                      <li>Open a terminal/command prompt</li>
                      <li>Navigate to the backend folder: <code className="bg-yellow-100 px-1 rounded">cd backend</code></li>
                      <li>Start the server: <code className="bg-yellow-100 px-1 rounded">npm run dev</code></li>
                      <li>Wait for \"HSO Backend Server running on port 5000\" message</li>
                      <li>Then click "Try Again" below</li>
                    </ol>
                  </div>
                )}
                
                {error.message.includes('MongoDB') && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
                    <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                      <RealIcon symbol="💡" className="w-4 h-4" colorClassName="text-yellow-700" />
                      How to Fix
                    </h3>
                    <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                      <li>Make sure MongoDB is installed and running</li>
                      <li>On Windows, check Services or run: <code className="bg-yellow-100 px-1 rounded">mongod</code></li>
                      <li>Check backend logs for MongoDB connection status</li>
                      <li>Ensure MongoDB is running on the default port (27017)</li>
                    </ol>
                  </div>
                )}
                
                <button
                  onClick={() => fetchProducts(true)}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
                >
                  <span className="inline-flex items-center gap-2">
                    <RealIcon symbol="🔄" className="w-4 h-4" colorClassName="text-white" />
                    Try Again
                  </span>
                </button>
              </div>
            </div>
          ) : filteredAndSorted.length === 0 && !loading ? (
            <div className="text-center py-12">
              <div className="bg-blue-50 p-8 rounded-lg max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  No matching products
                </h2>
                <p className="text-gray-600 mb-4">
                  Try adjusting filters or search terms.
                </p>
                {(searchQuery || category !== 'all' || onlyInStock || featuredOnly || priceMin || priceMax) && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setCategory('all')
                      setOnlyInStock(false)
                      setFeaturedOnly(false)
                      setPriceMin('')
                      setPriceMax('')
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6' : 'space-y-4 sm:space-y-5'}>
              {filteredAndSorted.map((product, idx) => (
                viewMode === 'grid' ? (
                <motion.div
                  key={product._id}
                  className="group bg-white rounded-2xl shadow-lg shadow-gray-500/10 overflow-hidden border-2 border-gray-100 hover:border-red-200 hover:shadow-xl hover:shadow-red-500/20 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                >
                  <div className="relative overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-40 sm:h-48 md:h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.featured && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" />
                        Featured
                      </div>
                    )}
                    {product.stock_quantity === 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className="font-bold text-gray-900 mb-2 text-base sm:text-lg line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-gray-100">
                      <span className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">₵{product.price}</span>
                      <span className="text-xs sm:text-sm font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">Stock: {product.stock_quantity}</span>
                    </div>
                    <motion.button
                      onClick={() => handlePurchase(product)}
                      disabled={product.stock_quantity === 0}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-bold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300"
                      whileHover={{ scale: product.stock_quantity > 0 ? 1.02 : 1 }}
                      whileTap={{ scale: product.stock_quantity > 0 ? 0.98 : 1 }}
                    >
                      {product.stock_quantity === 0 ? 'Out of Stock' : 'Buy Now'}
                    </motion.button>
                  </div>
                </motion.div>
                ) : (
                  <motion.div
                    key={product._id}
                    className="bg-white rounded-2xl shadow-lg shadow-gray-500/10 border-2 border-gray-100 overflow-hidden hover:border-red-200 hover:shadow-xl transition-all duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    whileHover={{ scale: 1.01, x: 5 }}
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative w-full sm:w-64 h-48 sm:h-48 overflow-hidden">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                        {product.featured && (
                          <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                            <Star className="w-3 h-3 fill-white" />
                            Featured
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg sm:text-xl font-bold text-gray-900">{product.name}</h3>
                            </div>
                            <p className="text-sm text-gray-600 mt-2 line-clamp-3">{product.description}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {product.category && (
                                <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-lg text-xs font-semibold border border-blue-300">
                                  {product.category}
                                </span>
                              )}
                              {product.sku && (
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                                  SKU: {product.sku}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right min-w-[140px] sm:min-w-[160px]">
                            <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent mb-1">₵{product.price}</div>
                            <div className="text-sm font-semibold text-gray-600 mb-4 bg-gray-100 px-2 py-1 rounded-lg inline-block">Stock: {product.stock_quantity}</div>
                            <motion.button
                              onClick={() => handlePurchase(product)}
                              disabled={product.stock_quantity === 0}
                              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-bold shadow-lg shadow-red-500/30 hover:shadow-xl transition-all duration-300"
                              whileHover={{ scale: product.stock_quantity > 0 ? 1.05 : 1 }}
                              whileTap={{ scale: product.stock_quantity > 0 ? 0.95 : 1 }}
                            >
                              {product.stock_quantity === 0 ? 'Out of Stock' : 'Buy Now'}
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              ))}
            </div>
          )}
        </div>
        <AdvancedPurchaseModal
          open={showPaymentModal}
          product={selectedProduct}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      </div>
    </>
  )
}

export default Shop 