import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

function DonationPaymentModal({ open, campaign, onClose, onSuccess }) {
  const [form, setForm] = useState({
    amount: '',
    name: '',
    email: '',
    phone: '',
    message: '',
    anonymous: false
  })
  const [loading, setLoading] = useState(false)

  if (!open || !campaign) return null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    toast.dismiss('donation-payment-validation-error')
    
    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast.error('Please enter a valid donation amount', {
        id: 'donation-payment-validation-error'
      })
      return
    }

    if (!form.anonymous && (!form.name || !form.email)) {
      toast.error('Please provide your name and email', {
        id: 'donation-payment-validation-error'
      })
      return
    }

    setLoading(true)
    try {
      const paymentData = {
        campaignId: campaign._id,
        amount: parseFloat(form.amount),
        email: form.email,
        name: form.name,
        phone: form.phone,
        message: form.message,
        anonymous: form.anonymous
      }

      console.log('Initializing Paystack payment:', paymentData)
      
      // Initialize Paystack payment
      const response = await axios.post('/api/payments/donations/initialize', paymentData)
      
      if (response.data.success && response.data.authorization_url) {
        console.log('Payment initialized, redirecting to Paystack...')
        
        // Redirect to Paystack payment page
        window.location.href = response.data.authorization_url
      } else {
        throw new Error('Failed to initialize payment')
      }
    } catch (error) {
      console.error('Payment initialization error:', error)
      toast.dismiss('donation-payment-error')
      const errorMessage = error.response?.data?.error || 'Payment initialization failed. Please try again.'
      toast.error(errorMessage, {
        id: 'donation-payment-error'
      })
    } finally {
      setLoading(false)
    }
  }

  const suggestedAmounts = [10, 25, 50, 100, 250, 500]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              💝 Make a Donation
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
            <h3 className="font-semibold text-gray-900 mb-2">{campaign.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{campaign.beneficiary}</p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Goal: ₵{campaign.goal_amount?.toLocaleString()}</span>
              <span className="text-green-600 font-medium">Raised: ₵{campaign.raised_amount?.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((campaign.raised_amount / campaign.goal_amount) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-1">
              {((campaign.raised_amount / campaign.goal_amount) * 100).toFixed(1)}% Complete
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Donation Amount (₵) *
              </label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter amount"
                min="1"
                step="0.01"
                required
              />
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-2">Quick select:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedAmounts.map(amount => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, amount: amount.toString() }))}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      ₵{amount}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="anonymous"
                  checked={form.anonymous}
                  onChange={handleChange}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Make this donation anonymous
                </label>
              </div>
              {!form.anonymous && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter your name"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Leave a message with your donation"
                />
              </div>
            </div>
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
                    Processing...
                  </div>
                ) : (
                  `Donate ₵${form.amount || '0'}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default DonationPaymentModal 