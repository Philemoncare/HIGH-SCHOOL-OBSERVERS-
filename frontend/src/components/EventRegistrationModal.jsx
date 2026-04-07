import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

function EventRegistrationModal({ open, event, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    position: '',
    dietaryRestrictions: '',
    specialRequirements: ''
  })
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Details, 2: Payment

  if (!open || !event) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    toast.dismiss('event-registration-validation-error')
    
    if (!form.name || !form.email || !form.phone) {
      toast.error('Please fill in all required fields', {
        id: 'event-registration-validation-error'
      })
      return
    }

    setLoading(true)
    try {
      const registrationData = {
        eventId: event.id,
        eventTitle: event.title,
        amount: event.price,
        attendee: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          organization: form.organization,
          position: form.position,
          dietaryRestrictions: form.dietaryRestrictions,
          specialRequirements: form.specialRequirements
        }
      }

      console.log('Initializing event registration payment:', registrationData)
      
      // Initialize Paystack payment for event registration
      const response = await axios.post('/api/payments/events/initialize', registrationData)
      
      if (response.data.success && response.data.authorization_url) {
        console.log('Payment initialized, redirecting to Paystack...')
        
        // Redirect to Paystack payment page
        window.location.href = response.data.authorization_url
      } else {
        throw new Error('Failed to initialize payment')
      }
    } catch (error) {
      console.error('Registration payment error:', error)
      toast.dismiss('event-registration-error')
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.'
      toast.error(errorMessage, {
        id: 'event-registration-error'
      })
    } finally {
      setLoading(false)
    }
  }

  const getRegistrationStatus = () => {
    if (event.registered >= event.capacity) {
      return { status: 'full', text: 'Event Full', color: 'bg-red-100 text-red-800' }
    } else if (event.registered >= event.capacity * 0.8) {
      return { status: 'limited', text: 'Limited Spots', color: 'bg-yellow-100 text-yellow-800' }
    } else {
      return { status: 'available', text: 'Available', color: 'bg-green-100 text-green-800' }
    }
  }

  const registrationStatus = getRegistrationStatus()

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    🎫 Event Registration
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">{event.title}</p>
                </div>
                <button 
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold" 
                  onClick={onClose}
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{event.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${registrationStatus.color}`}>
                    {registrationStatus.text}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <p className="font-medium">{new Date(event.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Time:</span>
                    <p className="font-medium">{event.time}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <p className="font-medium">{event.location}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Price:</span>
                    <p className="font-bold text-red-600">₵{event.price}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{event.registered} registered</span>
                    <span>{event.capacity} capacity</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((event.registered / event.capacity) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization/School
                    </label>
                    <input
                      type="text"
                      name="organization"
                      value={form.organization}
                      onChange={handleChange}
                      placeholder="Enter your organization"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position/Role
                    </label>
                    <input
                      type="text"
                      name="position"
                      value={form.position}
                      onChange={handleChange}
                      placeholder="Enter your position"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dietary Restrictions
                  </label>
                  <select
                    name="dietaryRestrictions"
                    value={form.dietaryRestrictions}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  >
                    <option value="">No restrictions</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="gluten-free">Gluten-free</option>
                    <option value="dairy-free">Dairy-free</option>
                    <option value="nut-free">Nut-free</option>
                    <option value="other">Other (please specify)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requirements
                  </label>
                  <textarea
                    name="specialRequirements"
                    value={form.specialRequirements}
                    onChange={handleChange}
                    placeholder="Any special requirements or accessibility needs..."
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Payment Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Event Registration</span>
                      <span className="font-medium">₵{event.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processing Fee</span>
                      <span className="font-medium">₵0</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="font-bold text-red-600 text-lg">₵{event.price}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the <a href="#" className="text-red-600 hover:underline">Terms and Conditions</a> and 
                    <a href="#" className="text-red-600 hover:underline"> Privacy Policy</a>. I understand that this registration is non-refundable.
                  </label>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || registrationStatus.status === 'full'}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <span>Pay ₵{event.price}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
                <div className="text-center text-xs text-gray-500">
                  <p>🔒 Secure payment powered by Paystack</p>
                  <p>You will be redirected to complete your payment</p>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default EventRegistrationModal 