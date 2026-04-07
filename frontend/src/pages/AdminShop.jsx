import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ShoppingBag, Plus, Package, TrendingUp, DollarSign, Filter } from 'lucide-react'
import AdminShopTable from '../components/AdminShopTable'
import AdminShopModal from '../components/AdminShopModal'
import AdvancedAdminNavigation from '../components/AdvancedAdminNavigation'
import { useNavigation } from '../contexts/NavigationContext'

function AdminShop() {
  const navigate = useNavigate()
  const { goBack } = useNavigation()
  const [products, setProducts] = useState([])
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalSales: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [modalMode, setModalMode] = useState('view')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchProducts()
    fetchStats()
  }, [currentPage, searchTerm, categoryFilter, statusFilter])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(statusFilter && { status: statusFilter })
      })

      const response = await axios.get(`/api/shop/products?${params}`)
      setProducts(response.data.products)
      setTotalPages(response.data.pagination?.total || 1)
    } catch (error) {
      console.error('Error fetching products:', error)
      // Dismiss any existing error toast to prevent duplicates
      toast.dismiss('admin-products-load-error')
      // Show error with unique ID to prevent duplicates
      toast.error('Failed to load products', {
        id: 'admin-products-load-error'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/shop/stats/overview')
      if (response.data) {
        setStats({
          totalProducts: response.data.totalProducts || 0,
          activeProducts: response.data.activeProducts || 0,
          totalSales: response.data.totalSales || 0,
          totalRevenue: response.data.totalRevenue || 0
        })
      }
    } catch (error) {
      console.error('Error fetching shop stats:', error)
      // Keep stats at 0 if API fails - don't show fake data
      setStats({
        totalProducts: 0,
        activeProducts: 0,
        totalSales: 0,
        totalRevenue: 0
      })
    }
  }

  const handleView = (product) => {
    setSelectedProduct(product)
    setModalMode('view')
    setModalOpen(true)
  }

  const handleEdit = (product) => {
    setSelectedProduct(product)
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleAdd = () => {
    setSelectedProduct(null)
    setModalMode('add')
    setModalOpen(true)
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      await axios.delete(`/api/shop/products/${productId}`)
      toast.success('Product deleted successfully')
      fetchProducts()
      fetchStats()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.dismiss('delete-product-error')
      toast.error('Failed to delete product', {
        id: 'delete-product-error'
      })
    }
  }

  const handleToggleStatus = async (productId) => {
    try {
      await axios.patch(`/api/shop/products/${productId}/toggle-status`)
      toast.success('Product status updated')
      fetchProducts()
      fetchStats()
    } catch (error) {
      console.error('Error updating product status:', error)
      toast.dismiss('update-status-error')
      toast.error('Failed to update product status', {
        id: 'update-status-error'
      })
    }
  }

  const handleToggleFeatured = async (productId) => {
    try {
      await axios.patch(`/api/shop/products/${productId}/toggle-featured`)
      toast.success('Product featured status updated')
      fetchProducts()
      fetchStats()
    } catch (error) {
      console.error('Error updating product featured status:', error)
      toast.dismiss('update-featured-error')
      toast.error('Failed to update product featured status', {
        id: 'update-featured-error'
      })
    }
  }

  const handleModalSave = () => {
    setModalOpen(false)
    fetchProducts()
    fetchStats()
  }

  const formatCurrency = (amount) => {
    return `₵${amount?.toLocaleString()}`
  }

  return (
    <>
      <Helmet>
        <title>Shop Management - HSO Admin</title>
        <meta name="description" content="Manage HSO shop products and inventory" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
        <AdvancedAdminNavigation
          title="Shop Management"
          subtitle="Manage products, inventory, pricing, and sales analytics"
          icon={ShoppingBag}
          breadcrumbs={[{ label: 'Shop Management', path: '/admin/shop' }]}
          onBack={() => goBack('/admin')}
          showSearch={true}
          searchPlaceholder="Search products by name, description, or SKU..."
          onSearch={setSearchTerm}
          actions={[
            {
              label: 'Add Product',
              icon: Plus,
              primary: true,
              onClick: handleAdd
            }
          ]}
          quickActions={[
            { label: 'Active', icon: Package, onClick: () => setStatusFilter('active') },
            { label: 'Sales', icon: TrendingUp, onClick: () => {} },
            { label: 'Revenue', icon: DollarSign, onClick: () => {} }
          ]}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200 hover:border-blue-400 transition-all transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Total Products</p>
                  <p className="text-3xl font-extrabold text-gray-900">{stats.totalProducts}</p>
                </div>
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-blue-600 text-2xl">📦</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200 hover:border-green-400 transition-all transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Active Products</p>
                  <p className="text-3xl font-extrabold text-green-600">{stats.activeProducts}</p>
                </div>
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-green-600 text-2xl">✅</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-yellow-200 hover:border-yellow-400 transition-all transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Total Sales</p>
                  <p className="text-3xl font-extrabold text-yellow-600">{stats.totalSales}</p>
                </div>
                <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <span className="text-yellow-600 text-2xl">🛒</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200 hover:border-purple-400 transition-all transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-3xl font-extrabold text-purple-600">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                  <span className="text-purple-600 text-2xl">💰</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔎</span>
              Search & Filter Products
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Search products by name, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              >
                <option value="">All Status</option>
                <option value="active">✅ Active</option>
                <option value="inactive">⏸️ Inactive</option>
                <option value="out_of_stock">📦 Out of Stock</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              >
                <option value="">All Categories</option>
                <option value="books">📚 Books</option>
                <option value="merchandise">🎁 Merchandise</option>
                <option value="electronics">💻 Electronics</option>
                <option value="clothing">👕 Clothing</option>
                <option value="accessories">👜 Accessories</option>
              </select>
            </div>
            <div className="mt-4">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setCategoryFilter('')
                  setStatusFilter('')
                }}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
              >
                Clear All Filters
              </button>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-pink-50">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span>📋</span>
                Products Inventory
              </h2>
              <p className="text-sm text-gray-600 mt-1">Manage your product catalog</p>
            </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">🛍️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <AdminShopTable
              products={products}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onToggleFeatured={handleToggleFeatured}
            />
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
          <AdminShopModal
            open={modalOpen}
            product={selectedProduct}
            mode={modalMode}
            onSave={handleModalSave}
            onClose={() => setModalOpen(false)}
          />
        </div>
      </div>
    </>
  )
}

export default AdminShop 