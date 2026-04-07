import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

function AdminShopModal({ open, product, onClose, onSave, mode = 'view' }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    stock_quantity: '',
    category: 'books',
    status: 'active',
    featured: false,
    image: '',
    sku: '',
    weight: '',
    dimensions: '',
    tags: ''
  })
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (product && mode !== 'add') {
      setForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        original_price: product.original_price || '',
        stock_quantity: product.stock_quantity || '',
        category: product.category || 'books',
        status: product.status || 'active',
        featured: product.featured || false,
        image: product.image || '',
        sku: product.sku || '',
        weight: product.weight || '',
        dimensions: product.dimensions || '',
        tags: product.tags?.join(', ') || ''
      })
      // Set image preview if product has an image
      if (product.image) {
        setImagePreview(product.image)
      }
    } else {
      setForm({
        name: '',
        description: '',
        price: '',
        original_price: '',
        stock_quantity: '',
        category: 'books',
        status: 'active',
        featured: false,
        image: '',
        sku: '',
        weight: '',
        dimensions: '',
        tags: ''
      })
      setImagePreview(null)
      setImageFile(null)
    }
  }, [product, mode])

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) {
      // Reset file input if no file selected
      e.target.value = ''
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.dismiss('image-type-error')
      toast.error('Please select an image file (JPEG, PNG, GIF, etc.)', {
        id: 'image-type-error'
      })
      e.target.value = '' // Reset input
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.dismiss('image-size-error')
      toast.error('Image size must be less than 5MB', {
        id: 'image-size-error'
      })
      e.target.value = '' // Reset input
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target.result)
      // Also update form image for immediate preview
      setForm(prev => ({ ...prev, image: e.target.result }))
    }
    reader.onerror = (error) => {
      console.error('Error reading file:', error)
      toast.dismiss('image-read-error')
      toast.error('Failed to read image file', {
        id: 'image-read-error'
      })
      e.target.value = '' // Reset input
    }
    reader.readAsDataURL(file)

    setImageFile(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setForm(prev => ({ ...prev, image: '' }))
    // Reset file input
    const fileInput = document.getElementById('product-image-upload')
    if (fileInput) {
      fileInput.value = ''
    }
  }

  if (!open) return null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Dismiss any existing validation toasts
    toast.dismiss('product-name-error')
    toast.dismiss('product-price-error')
    toast.dismiss('product-description-error')
    
    if (!form.name?.trim()) {
      toast.error('Product name is required', {
        id: 'product-name-error'
      })
      return
    }
    
    if (!form.price || parseFloat(form.price) <= 0) {
      toast.error('Valid price is required', {
        id: 'product-price-error'
      })
      return
    }

    // Validate description
    if (!form.description?.trim()) {
      toast.error('Product description is required', {
        id: 'product-description-error'
      })
      return
    }

    setLoading(true)
    try {
      // Handle image upload if there's a new image file
      let imageData = form.image || null
      if (imageFile) {
        setUploadingImage(true)
        try {
          // Convert file to base64 using Promise
          imageData = await new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => {
              resolve(e.target.result)
            }
            reader.onerror = (error) => {
              reject(error)
            }
            reader.readAsDataURL(imageFile)
          })
          console.log('Image converted to base64, length:', imageData?.length)
        } catch (error) {
          console.error('Error processing image:', error)
          toast.dismiss('image-process-error')
          toast.error('Failed to process image', {
            id: 'image-process-error'
          })
          setLoading(false)
          setUploadingImage(false)
          return
        }
        setUploadingImage(false)
      } else if (mode !== 'add' && !form.image) {
        // If editing and no image in form, keep existing product image
        imageData = product?.image || null
      }

      // Prepare product data with proper types and validation
      const productData = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        stock_quantity: form.stock_quantity ? parseInt(form.stock_quantity) : 0,
        category: form.category || 'books',
        status: form.status || 'active',
        featured: form.featured || false,
        tags: form.tags ? form.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      }
      
      // Add image only if it exists (either new upload or existing)
      if (imageData && imageData.trim() && imageData.trim() !== '') {
        productData.image = imageData.trim()
        console.log('Image included in product data')
      } else {
        console.log('No image to include')
      }
      
      if (form.original_price && parseFloat(form.original_price) > 0) {
        productData.original_price = parseFloat(form.original_price)
      }
      
      if (form.sku && form.sku.trim()) {
        productData.sku = form.sku.trim()
      }
      
      // Handle weight - only include if it's a valid number
      if (form.weight && form.weight.toString().trim() !== '' && !isNaN(form.weight) && parseFloat(form.weight) >= 0) {
        productData.weight = parseFloat(form.weight)
      }
      
      // Handle dimensions - only include if it has a value
      if (form.dimensions && form.dimensions.trim() !== '') {
        productData.dimensions = form.dimensions.trim()
      }
      
      console.log('Sending product data:', productData)

      if (mode === 'add') {
        await axios.post('/api/shop/products', productData)
        toast.success('Product created successfully!')
      } else {
        await axios.put(`/api/shop/products/${product._id}`, productData)
        toast.success('Product updated successfully!')
      }
      
      onSave()
    } catch (error) {
      console.error('Error saving product:', error)
      console.error('Error response:', error.response?.data)
      
      // Dismiss any existing error toasts
      toast.dismiss('product-save-error')
      toast.dismiss('product-validation-error')
      
      // Handle validation errors
      if (error.response?.status === 400) {
        const errorData = error.response.data
        if (errorData.details) {
          toast.error(`Validation error: ${errorData.details}`, { 
            id: 'product-validation-error',
            duration: 5000 
          })
        } else {
          toast.error(errorData.error || 'Validation failed', { 
            id: 'product-validation-error',
            duration: 5000 
          })
        }
      } else {
        toast.error(error.response?.data?.error || error.response?.data?.details || 'Failed to save product', {
          id: 'product-save-error'
        })
      }
    } finally {
      setLoading(false)
      setUploadingImage(false)
    }
  }

  const categories = [
    { value: 'books', label: '📚 Books' },
    { value: 'merchandise', label: '🎁 Merchandise' },
    { value: 'electronics', label: '📱 Electronics' },
    { value: 'clothing', label: '👕 Clothing' },
    { value: 'accessories', label: '💍 Accessories' }
  ]

  const statuses = [
    { value: 'active', label: '✅ Active' },
    { value: 'inactive', label: '⏸️ Inactive' },
    { value: 'out_of_stock', label: '⚠️ Out of Stock' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'add' ? 'Add Product' : mode === 'edit' ? 'Edit Product' : 'Product Details'}
            </h2>
            <button 
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold" 
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                disabled={mode === 'view'} 
                required 
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU
              </label>
              <input 
                name="sku" 
                value={form.sku} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                disabled={mode === 'view'} 
                placeholder="Enter SKU"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
              disabled={mode === 'view'} 
              required
              placeholder="Enter product description"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₵) *
              </label>
              <input 
                type="number"
                name="price" 
                value={form.price} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                disabled={mode === 'view'} 
                required 
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Price (₵)
              </label>
              <input 
                type="number"
                name="original_price" 
                value={form.original_price} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                disabled={mode === 'view'} 
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity
              </label>
              <input 
                type="number"
                name="stock_quantity" 
                value={form.stock_quantity} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                disabled={mode === 'view'} 
                min="0"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                disabled={mode === 'view'}
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                disabled={mode === 'view'}
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="featured"
                checked={form.featured}
                onChange={handleChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                disabled={mode === 'view'}
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                Featured Product
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image
            </label>
            {imagePreview && (
              <div className="mb-4 relative">
                <img 
                  src={imagePreview} 
                  alt="Product preview" 
                  className="w-full h-48 object-cover rounded-lg border border-gray-300"
                />
                {mode !== 'view' && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700 transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            )}
            {mode !== 'view' && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="product-image-upload"
                  disabled={uploadingImage || loading}
                />
                <label 
                  htmlFor="product-image-upload" 
                  className="cursor-pointer block"
                >
                  <div className="text-gray-600">
                    {uploadingImage ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mr-2"></div>
                        Uploading...
                      </div>
                    ) : imagePreview ? (
                      <div>
                        <div className="text-sm text-gray-500 mb-2">Click to change image</div>
                        <div className="text-xs text-gray-400">Supports: JPEG, PNG, GIF (Max 5MB)</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-4xl mb-2">📷</div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Click to upload image</div>
                        <div className="text-xs text-gray-500">or drag and drop</div>
                        <div className="text-xs text-gray-400 mt-1">Supports: JPEG, PNG, GIF (Max 5MB)</div>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            )}
            {mode === 'edit' && product?.image && !imageFile && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or enter image URL
                </label>
                <input 
                  name="image" 
                  value={form.image} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <input 
                type="number"
                name="weight" 
                value={form.weight} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                disabled={mode === 'view'} 
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensions (L x W x H cm)
              </label>
              <input 
                name="dimensions" 
                value={form.dimensions} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                disabled={mode === 'view'} 
                placeholder="10 x 5 x 2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input 
              name="tags" 
              value={form.tags} 
              onChange={handleChange} 
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
              disabled={mode === 'view'} 
              placeholder="tag1, tag2, tag3"
            />
          </div>
          {mode !== 'view' && (
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  mode === 'add' ? 'Create Product' : 'Update Product'
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default AdminShopModal 