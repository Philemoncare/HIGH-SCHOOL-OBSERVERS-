import { useState } from 'react'

function AdminShopTable({ products, onView, onEdit, onDelete, onToggleStatus, onToggleFeatured }) {
  const [expandedProduct, setExpandedProduct] = useState(null)

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">✅ Active</span>
      case 'inactive':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">⏸️ Inactive</span>
      case 'out_of_stock':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">⚠️ Out of Stock</span>
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>
    }
  }

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'books':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">📚 Books</span>
      case 'merchandise':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">🎁 Merchandise</span>
      case 'electronics':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">📱 Electronics</span>
      case 'clothing':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">👕 Clothing</span>
      case 'accessories':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">💍 Accessories</span>
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{category}</span>
    }
  }

  const formatCurrency = (amount) => {
    return `₵${amount?.toLocaleString()}`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Product
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-lg">🛍️</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {product.name}
                      {product.featured && (
                        <span className="ml-2 text-yellow-500">⭐</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 line-clamp-2">
                      {product.description}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getCategoryBadge(product.category)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {formatCurrency(product.price)}
                </div>
                {product.original_price && product.original_price > product.price && (
                  <div className="text-sm text-gray-500 line-through">
                    {formatCurrency(product.original_price)}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {product.stock_quantity || 0}
                </div>
                {product.stock_quantity <= 10 && product.stock_quantity > 0 && (
                  <div className="text-xs text-yellow-600">Low stock</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(product.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(product.created_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onView(product)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 rounded"
                    title="View Product"
                  >
                    <span className="text-lg">👁️</span>
                  </button>
                  <button
                    onClick={() => onEdit(product)}
                    className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-1 rounded"
                    title="Edit Product"
                  >
                    <span className="text-lg">✏️</span>
                  </button>
                  <button
                    onClick={() => onToggleStatus(product._id)}
                    className="text-green-600 hover:text-green-800 hover:bg-green-50 p-1 rounded"
                    title={product.status === 'active' ? 'Deactivate' : 'Activate'}
                  >
                    <span className="text-lg">
                      {product.status === 'active' ? '⏸️' : '▶️'}
                    </span>
                  </button>
                  <button
                    onClick={() => onToggleFeatured(product._id)}
                    className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 p-1 rounded"
                    title={product.featured ? 'Remove from Featured' : 'Add to Featured'}
                  >
                    <span className="text-lg">
                      {product.featured ? '⭐' : '☆'}
                    </span>
                  </button>
                  <button
                    onClick={() => onDelete(product._id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded"
                    title="Delete Product"
                  >
                    <span className="text-lg">🗑️</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminShopTable 