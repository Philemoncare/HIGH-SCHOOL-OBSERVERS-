import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { CreditCard, User, Mail, Phone, CheckCircle } from 'lucide-react'

function MembershipPaymentModal({ open, membership, onClose, onSuccess }) {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && membership) {
      // Pre-fill form if user is logged in
      if (isAuthenticated && user) {
        setForm({
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
          email: user.email || '',
          phone: user.phone || '',
          address: ''
        })
      } else {
        setForm({
          name: '',
          email: '',
          phone: '',
          address: ''
        })
      }
    }
  }, [open, membership, isAuthenticated, user])

  if (!open || !membership) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    toast.dismiss('membership-payment-auth-error')
    toast.dismiss('membership-payment-validation-error')
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error('Please login or register to continue with membership payment', {
        id: 'membership-payment-auth-error'
      })
      onClose()
      navigate('/login', { state: { redirect: '/', membership: membership.title } })
      return
    }

    if (!form.name || !form.email || !form.phone) {
      toast.error('Please fill in all required fields', {
        id: 'membership-payment-validation-error'
      })
      return
    }

    setLoading(true)
    try {
      const paymentData = {
        membershipType: membership.title,
        amount: membership.price,
        email: form.email,
        name: form.name,
        phone: form.phone,
        address: form.address,
        userId: user?._id || null
      }

      console.log('Initializing membership payment:', paymentData)
      
      // Initialize Paystack payment
      const response = await axios.post('/api/payments/membership/initialize', paymentData)
      
      if (response.data.success && response.data.authorization_url) {
        console.log('Payment initialized, redirecting to Paystack...')
        
        // Redirect to Paystack payment page
        window.location.href = response.data.authorization_url
      } else {
        throw new Error('Failed to initialize payment')
      }
    } catch (error) {
      console.error('Payment initialization error:', error)
      toast.dismiss('membership-payment-error')
      const errorMessage = error.response?.data?.error || 'Payment initialization failed. Please try again.'
      toast.error(errorMessage, {
        id: 'membership-payment-error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              💳 Membership Payment
            </h2>
            <button 
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold" 
              onClick={onClose}
              disabled={loading}
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className={`bg-gradient-to-br ${membership.color} rounded-xl p-6 text-white mb-6`}>
            <h3 className="text-xl font-bold mb-2">{membership.title}</h3>
            <p className="text-white/90 mb-4">{membership.description}</p>
            <div className="text-3xl font-bold mb-4">GHC {membership.price}</div>
            <div className="space-y-2">
              {membership.features.map((feature, idx) => (
                <div key={idx} className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {!isAuthenticated && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> You need to be logged in to complete membership payment. 
                You'll be redirected to login after clicking "Proceed to Payment".
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address (Optional)
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter your address (optional)"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-medium">Total Amount:</span>
                <span className="text-2xl font-bold text-gray-900">GHC {membership.price}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                You'll be redirected to Paystack to complete the payment securely.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Proceed to Payment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default MembershipPaymentModal

