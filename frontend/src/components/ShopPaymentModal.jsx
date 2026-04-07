import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

function ShopPaymentModal({ open, product, onClose, onSuccess }) {
  const [form, setForm] = useState({
    quantity: 1,
    name: '',
    email: '',
    phone: '',
    address: ''
  })
  const [loading, setLoading] = useState(false)

  if (!open || !product) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleQuantityChange = (e) => {
    const quantity = parseInt(e.target.value)
    if (quantity > 0 && quantity <= product.stock_quantity) {
      setForm(prev => ({ ...prev, quantity }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    toast.dismiss('shop-payment-validation-error')
    
    if (!form.name || !form.email || !form.phone || !form.address) {
      toast.error('Please fill in all required fields', {
        id: 'shop-payment-validation-error'
      })
      return
    }

    if (form.quantity <= 0 || form.quantity > product.stock_quantity) {
      toast.error('Please select a valid quantity', {
        id: 'shop-payment-validation-error'
      })
      return
    }

    const totalAmount = product.price * form.quantity

    setLoading(true)
    try {
      const paymentData = {
        productId: product._id,
        quantity: form.quantity,
        amount: totalAmount,
        email: form.email,
        name: form.name,
        phone: form.phone,
        address: form.address
      }

      console.log('Initializing shop payment:', paymentData)
      
      // Initialize Paystack payment
      const response = await axios.post('/api/payments/shop/initialize', paymentData)
      
      if (response.data.success && response.data.authorization_url) {
        console.log('Payment initialized, redirecting to Paystack...')
        
        // Redirect to Paystack payment page
        window.location.href = response.data.authorization_url
      } else {
        throw new Error('Failed to initialize payment')
      }
    } catch (error) {
      console.error('Payment initialization error:', error)
      toast.dismiss('shop-payment-error')
      const errorMessage = error.response?.data?.error || 'Payment initialization failed. Please try again.'
      toast.error(errorMessage, {
        id: 'shop-payment-error'
      })
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = product.price * form.quantity

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              🛒 Purchase Product
            </h2>
            <button 
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold" 
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-4">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.description}</p>
                <p className="text-lg font-bold text-red-600">₵{product.price}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <select
                name="quantity"
                value={form.quantity}
                onChange={handleQuantityChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                {[...Array(Math.min(10, product.stock_quantity))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Available: {product.stock_quantity} units
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Address *
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter your delivery address"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                <span className="text-2xl font-bold text-red-600">₵{totalAmount}</span>
              </div>
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : `Pay ₵${totalAmount}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ShopPaymentModal 