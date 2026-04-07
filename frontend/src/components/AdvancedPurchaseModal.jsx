import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

function AdvancedPurchaseModal({ open, product, onClose, onSuccess }) {
  // Get user from localStorage instead of AuthContext
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  useEffect(() => {
    if (open) {
      const userData = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      
      console.log('Purchase modal opened - checking auth:', {
        hasUser: !!userData,
        hasToken: !!token,
        tokenLength: token?.length
      })
      
      if (userData && token) {
        try {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
          setIsAuthenticated(true)
          console.log('User authenticated for purchase:', parsedUser.email)
        } catch (error) {
          console.error('Error parsing user data:', error)
          setIsAuthenticated(false)
          toast.error('Please log in again')
          onClose()
          setTimeout(() => {
            window.location.href = '/login'
          }, 1000)
        }
      } else {
        // No token or user - redirect to login
        setIsAuthenticated(false)
        console.warn('No authentication found - redirecting to login')
        toast.error('Please log in to make a purchase')
        onClose()
        setTimeout(() => {
          window.location.href = '/login'
        }, 1000)
      }
    }
  }, [open, onClose])
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    // Basic Information
    quantity: 1,
    
    // Customer Details
    name: '',
    email: '',
    phone: '',
    alternate_phone: '',
    date_of_birth: '',
    gender: '',
    occupation: '',
    company: '',
    student_id: '',
    school: '',
    grade_level: '',
    
    // Address Information
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Ghana',
    landmark: '',
    delivery_instructions: '',
    preferred_delivery_time: 'anytime',
    
    // Billing Address (optional - same as shipping)
    use_same_billing: true,
    billing_street_address: '',
    billing_city: '',
    billing_state: '',
    billing_postal_code: '',
    billing_country: 'Ghana',
    
    // Order Details
    shipping_method: 'standard',
    payment_method: 'paystack',
    customer_notes: '',
    
    // Marketing Information
    marketing_source: '',
    campaign: '',
    utm_source: '',
    utm_medium: '',
    utm_campaign: ''
  })

  useEffect(() => {
    if (user && open) {
      setForm(prev => ({
        ...prev,
        name: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : '',
        email: user.email || '',
        phone: user.phone || ''
      }))
    }
  }, [user, open])

  if (!open || !product) return null
  
  // Prevent rendering if not authenticated
  if (!isAuthenticated) {
    return null
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleQuantityChange = (e) => {
    const quantity = parseInt(e.target.value)
    // Allow quantity changes - stock will be validated on submit
    // Only restrict if stock is explicitly managed and quantity exceeds available
    if (quantity > 0) {
      // Check stock limit only if stock is explicitly managed
      if (product.stock_quantity !== null && 
          product.stock_quantity !== undefined && 
          product.stock_quantity > 0 && 
          quantity > product.stock_quantity) {
        toast.dismiss('quantity-limit-error')
        toast.error(`Maximum quantity available: ${product.stock_quantity}`, {
          id: 'quantity-limit-error'
        })
        return
      }
      setForm(prev => ({ ...prev, quantity }))
    }
  }

  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) return
    if (currentStep === 2 && !validateStep2()) return
    if (currentStep === 3 && !validateStep3()) return
    setCurrentStep(prev => Math.min(prev + 1, 4))
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const validateStep1 = () => {
    // Dismiss any existing validation toasts
    toast.dismiss('step1-validation')
    
    if (!form.name || !form.name.trim()) {
      toast.error('Please enter your name', { id: 'step1-validation' })
      return false
    }
    if (!form.email || !form.email.trim()) {
      toast.error('Please enter your email address', { id: 'step1-validation' })
      return false
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email.trim())) {
      toast.error('Please enter a valid email address', { id: 'step1-validation' })
      return false
    }
    if (!form.phone || !form.phone.trim()) {
      toast.error('Please enter your phone number', { id: 'step1-validation' })
      return false
    }
    if (form.quantity <= 0) {
      toast.error('Please select a valid quantity', { id: 'step1-validation' })
      return false
    }
    
    // Only check stock limit if stock is explicitly managed and greater than 0
    if (product.stock_quantity !== null && 
        product.stock_quantity !== undefined && 
        product.stock_quantity > 0 && 
        form.quantity > product.stock_quantity) {
      toast.error(`Maximum quantity available: ${product.stock_quantity}`, { id: 'step1-validation' })
      return false
    }
    return true
  }

  const validateStep2 = () => {
    // Dismiss any existing validation toasts
    toast.dismiss('step2-validation')
    
    if (!form.street_address || !form.street_address.trim()) {
      toast.error('Please enter your street address', { id: 'step2-validation' })
      return false
    }
    if (!form.city || !form.city.trim()) {
      toast.error('Please enter your city', { id: 'step2-validation' })
      return false
    }
    if (!form.state || !form.state.trim()) {
      toast.error('Please enter your state', { id: 'step2-validation' })
      return false
    }
    return true
  }

  const validateStep3 = () => {
    // Step 3 is optional customer details
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Prevent multiple submissions
    if (loading) {
      return
    }
    
    // Validate all steps before submitting
    if (!validateStep1()) {
      // Move to step 1 if validation fails
      setCurrentStep(1)
      return
    }
    
    if (!validateStep2()) {
      // Move to step 2 if validation fails
      setCurrentStep(2)
      return
    }

    // Check authentication before proceeding
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Please log in to make a purchase')
      onClose()
      setTimeout(() => {
        window.location.href = '/login'
      }, 1000)
      return
    }

    setLoading(true)
    try {
      // Validate and prepare clean order data with only essential fields
      // Double-check all required fields are not empty
      const customerName = form.name?.trim() || ''
      const customerEmail = form.email?.trim() || ''
      const customerPhone = form.phone?.trim() || ''
      const streetAddress = form.street_address?.trim() || ''
      const city = form.city?.trim() || ''
      const state = form.state?.trim() || ''
      const quantity = parseInt(form.quantity) || 1
      
      if (!customerName || !customerEmail || !customerPhone || !streetAddress || !city || !state) {
        const missingFields = []
        if (!customerName) missingFields.push('Name')
        if (!customerEmail) missingFields.push('Email')
        if (!customerPhone) missingFields.push('Phone')
        if (!streetAddress) missingFields.push('Street Address')
        if (!city) missingFields.push('City')
        if (!state) missingFields.push('State')
        
        toast.error(`Please fill in: ${missingFields.join(', ')}`)
        if (!customerName || !customerEmail || !customerPhone) {
          setCurrentStep(1)
        } else {
          setCurrentStep(2)
        }
        setLoading(false)
        return
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(customerEmail)) {
        toast.error('Please enter a valid email address')
        setCurrentStep(1)
        setLoading(false)
        return
      }
      
      // Validate quantity
      if (quantity <= 0) {
        toast.error('Please select a valid quantity')
        setCurrentStep(1)
        setLoading(false)
        return
      }
      
      // Pre-check stock availability (informational - backend will do final validation)
      // This helps catch obvious issues before making the API call
      if (product.stock_quantity !== null && 
          product.stock_quantity !== undefined && 
          product.stock_quantity > 0 && 
          product.stock_quantity < quantity) {
        toast.dismiss('stock-check-error')
        toast.error(`Insufficient stock. Available: ${product.stock_quantity}, Requested: ${quantity}`, {
          id: 'stock-check-error'
        })
        setCurrentStep(1)
        setLoading(false)
        return
      }
      
      const orderData = {
        items: [{
          product_id: product._id,
          quantity: quantity
        }],
        customer: {
          name: customerName,
          email: customerEmail.toLowerCase(),
          phone: customerPhone
        },
        shipping_address: {
          street_address: streetAddress,
          city: city,
          state: state,
          country: form.country || 'Ghana'
        },
        shipping_method: form.shipping_method || 'standard',
        payment_method: form.payment_method || 'paystack'
      }
      
      // Add optional customer fields only if they have values
      if (form.alternate_phone && form.alternate_phone.trim()) {
        orderData.customer.alternate_phone = form.alternate_phone.trim()
      }
      
      // Add optional shipping address fields
      if (form.postal_code && form.postal_code.trim()) {
        orderData.shipping_address.postal_code = form.postal_code.trim()
      }
      if (form.landmark && form.landmark.trim()) {
        orderData.shipping_address.landmark = form.landmark.trim()
      }
      if (form.delivery_instructions && form.delivery_instructions.trim()) {
        orderData.shipping_address.delivery_instructions = form.delivery_instructions.trim()
      }
      if (form.preferred_delivery_time && ['morning', 'afternoon', 'evening', 'anytime'].includes(form.preferred_delivery_time)) {
        orderData.shipping_address.preferred_delivery_time = form.preferred_delivery_time
      }
      
      // Add billing address only if different from shipping
      if (!form.use_same_billing && form.billing_street_address && form.billing_street_address.trim()) {
        orderData.billing_address = {
          street_address: form.billing_street_address.trim(),
          city: form.billing_city?.trim() || '',
          state: form.billing_state?.trim() || '',
          country: form.billing_country || 'Ghana'
        }
        if (form.billing_postal_code && form.billing_postal_code.trim()) {
          orderData.billing_address.postal_code = form.billing_postal_code.trim()
        }
      }
      
      // Add customer notes if provided
      if (form.customer_notes && form.customer_notes.trim()) {
        orderData.customer_notes = form.customer_notes.trim()
      }
      
      console.log('Final order data being sent:', JSON.stringify(orderData, null, 2))

      // Get fresh token from localStorage
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Your session has expired. Please log in again.')
        onClose()
        setTimeout(() => {
          window.location.href = '/login'
        }, 1500)
        setLoading(false)
        return
      }

      console.log('Creating advanced order:', orderData)
      console.log('Auth token present:', !!token)
      console.log('Token prefix:', token.substring(0, 20) + '...')
      
      // Create order with authentication
      toast.loading('Creating your order...', { id: 'order-creation' })
      
      const orderResponse = await axios.post('/api/orders', orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (orderResponse.data && orderResponse.data.success) {
        toast.success('Order created successfully!', { id: 'order-creation' })
        const order = orderResponse.data.order
        
        // Initialize payment
        const paymentData = {
          productId: product._id,
          quantity: form.quantity,
          amount: order.total_amount,
          email: form.email,
          name: form.name,
          phone: form.phone,
          address: form.street_address,
          orderId: order._id
        }

        // Initialize payment
        toast.loading('Initializing payment...', { id: 'payment-init' })
        
        const paymentToken = localStorage.getItem('token')
        const paymentResponse = await axios.post('/api/payments/shop/initialize', paymentData, {
          headers: paymentToken ? {
            'Authorization': `Bearer ${paymentToken}`
          } : {}
        })
        
        if (paymentResponse.data && paymentResponse.data.success && paymentResponse.data.authorization_url) {
          toast.success('Redirecting to payment...', { id: 'payment-init' })
          console.log('Payment initialized, redirecting to Paystack...')
          // Small delay to show success message
          setTimeout(() => {
            window.location.href = paymentResponse.data.authorization_url
          }, 500)
        } else {
          throw new Error(paymentResponse.data?.error || 'Failed to initialize payment')
        }
      } else {
        throw new Error(orderResponse.data?.error || 'Failed to create order')
      }
    } catch (error) {
      console.error('Advanced purchase error:', error)
      console.error('Error response:', error.response)
      console.error('Error response data:', error.response?.data)
      
      // Dismiss any loading toasts and existing error toasts
      toast.dismiss('order-creation')
      toast.dismiss('payment-init')
      toast.dismiss('validation-error')
      toast.dismiss('stock-check-error')
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.', {
          id: 'auth-error'
        })
        try {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        } catch (_) {}
        onClose()
        setTimeout(() => {
          window.location.href = '/login'
        }, 1500)
        setLoading(false)
        return
      }
      
      // Handle validation errors (400 status)
      if (error.response?.status === 400) {
        const errorData = error.response.data || {}
        console.error('Validation error details:', errorData)
        
        // Dismiss any existing validation error toast to prevent duplicates
        toast.dismiss('validation-error')
        toast.dismiss('stock-check-error')
        
        let errorMessage = 'Validation failed. Please check all required fields.'
        
        // Extract error message
        if (errorData.details) {
          errorMessage = errorData.details
        } else if (errorData.error) {
          errorMessage = errorData.error
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (typeof errorData === 'string') {
          errorMessage = errorData
        }
        
        // Use specific toast ID for stock errors
        const toastId = errorMessage.toLowerCase().includes('stock') || 
                       errorMessage.toLowerCase().includes('insufficient') 
                       ? 'stock-check-error' 
                       : 'validation-error'
        
        // Show error with details using a unique ID to prevent duplicates
        toast.error(errorMessage, {
          id: toastId,
          duration: 8000,
          style: {
            maxWidth: '500px'
          }
        })
        
        // Navigate to relevant step based on error
        const errorLower = errorMessage.toLowerCase()
        if (errorLower.includes('customer') || errorLower.includes('name') || errorLower.includes('email') || errorLower.includes('phone')) {
          setCurrentStep(1)
        } else if (errorLower.includes('address') || errorLower.includes('shipping') || errorLower.includes('street') || errorLower.includes('city') || errorLower.includes('state')) {
          setCurrentStep(2)
        }
        
        setLoading(false)
        return
      }
      
      // Handle server errors (500)
      if (error.response?.status >= 500) {
        toast.error('Server error. Please try again later.', {
          id: 'server-error',
          duration: 5000
        })
        setLoading(false)
        return
      }
      
      // Handle network errors
      if (!error.response) {
        toast.error('Network error. Please check your connection and try again.', {
          id: 'network-error',
          duration: 5000
        })
        setLoading(false)
        return
      }
      
      // Handle other errors
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Purchase failed. Please try again.'
      toast.error(errorMessage, {
        id: 'general-error',
        duration: 5000
      })
      
      setLoading(false)
    }
  }

  const calculateShippingFee = () => {
    return 0 // Free shipping
  }

  const subtotal = product.price * form.quantity
  const shippingFee = calculateShippingFee()
  const totalAmount = subtotal + shippingFee

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Product & Contact' },
    { number: 2, title: 'Shipping', description: 'Address & Delivery' },
    { number: 3, title: 'Details', description: 'Additional Info' },
    { number: 4, title: 'Review', description: 'Confirm & Pay' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              🛒 Advanced Purchase
            </h2>
            <button 
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold" 
              onClick={onClose}
            >
              ×
            </button>
          </div>
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep >= step.number 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.number}
                </div>
                <div className="ml-2">
                  <div className="text-sm font-medium text-gray-900">{step.title}</div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-red-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600">{product.description}</p>
                    <p className="text-lg font-bold text-red-600">₵{product.price}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    {[...Array(Math.min(10, (product.stock_quantity !== null && product.stock_quantity !== undefined && product.stock_quantity > 0) ? product.stock_quantity : 10))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    {product.stock_quantity !== null && product.stock_quantity !== undefined 
                      ? product.stock_quantity > 0 
                        ? `Available: ${product.stock_quantity} units`
                        : 'Out of stock (pre-order available)'
                      : 'Stock not managed'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method *
                  </label>
                  <select
                    name="payment_method"
                    value={form.payment_method}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="paystack">💳 Paystack (Card/Mobile Money)</option>
                    <option value="mobile_money">📱 Mobile Money</option>
                    <option value="bank_transfer">🏦 Bank Transfer</option>
                    <option value="cash_on_delivery">💵 Cash on Delivery</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    Alternate Phone
                  </label>
                  <input
                    type="tel"
                    name="alternate_phone"
                    value={form.alternate_phone}
                    onChange={handleChange}
                    placeholder="Optional alternate number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="street_address"
                    value={form.street_address}
                    onChange={handleChange}
                    placeholder="Enter your street address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Enter your city"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Region *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="Enter your state"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    value={form.postal_code}
                    onChange={handleChange}
                    placeholder="Enter postal code"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Landmark
                  </label>
                  <input
                    type="text"
                    name="landmark"
                    value={form.landmark}
                    onChange={handleChange}
                    placeholder="Nearby landmark"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Method *
                  </label>
                  <select
                    name="shipping_method"
                    value={form.shipping_method}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="standard">🚚 Standard Delivery (₵25) - 3-5 days</option>
                    <option value="express">⚡ Express Delivery (₵50) - 1-2 days</option>
                    <option value="same_day">🏃 Same Day Delivery (₵100) - Today</option>
                    <option value="pickup">🏪 Pickup from Store (Free)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Delivery Time
                  </label>
                  <select
                    name="preferred_delivery_time"
                    value={form.preferred_delivery_time}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="anytime">🕐 Anytime</option>
                    <option value="morning">🌅 Morning (8AM - 12PM)</option>
                    <option value="afternoon">☀️ Afternoon (12PM - 5PM)</option>
                    <option value="evening">🌆 Evening (5PM - 8PM)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Instructions
                </label>
                <textarea
                  name="delivery_instructions"
                  value={form.delivery_instructions}
                  onChange={handleChange}
                  placeholder="Any special delivery instructions..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details (Optional)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={form.date_of_birth}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select gender</option>
                    <option value="male">👨 Male</option>
                    <option value="female">👩 Female</option>
                    <option value="other">🌈 Other</option>
                    <option value="prefer_not_to_say">🤐 Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Occupation
                  </label>
                  <input
                    type="text"
                    name="occupation"
                    value={form.occupation}
                    onChange={handleChange}
                    placeholder="Your occupation"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company/Organization
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Your company or organization"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student ID (if applicable)
                  </label>
                  <input
                    type="text"
                    name="student_id"
                    value={form.student_id}
                    onChange={handleChange}
                    placeholder="Your student ID number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School/Institution
                  </label>
                  <input
                    type="text"
                    name="school"
                    value={form.school}
                    onChange={handleChange}
                    placeholder="Your school or institution"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade Level
                </label>
                <select
                  name="grade_level"
                  value={form.grade_level}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select grade level</option>
                  <option value="primary">🏫 Primary School</option>
                  <option value="jhs">🏫 Junior High School</option>
                  <option value="shs">🏫 Senior High School</option>
                  <option value="university">🎓 University</option>
                  <option value="college">🎓 College</option>
                  <option value="other">📚 Other</option>
                </select>
              </div>
              <div className="border-t pt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Marketing Information (Optional)</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How did you hear about us?
                    </label>
                    <select
                      name="marketing_source"
                      value={form.marketing_source}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Select source</option>
                      <option value="social_media">📱 Social Media</option>
                      <option value="search_engine">🔍 Search Engine</option>
                      <option value="referral">👥 Referral</option>
                      <option value="email">📧 Email</option>
                      <option value="advertisement">📢 Advertisement</option>
                      <option value="direct">🎯 Direct</option>
                      <option value="other">📋 Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Name
                    </label>
                    <input
                      type="text"
                      name="campaign"
                      value={form.campaign}
                      onChange={handleChange}
                      placeholder="Campaign name (if applicable)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Payment</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">Qty: {form.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900">₵{subtotal}</p>
                  </div>
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total:</span>
                      <span className="text-red-600">₵{totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="customer_notes"
                  value={form.customer_notes}
                  onChange={handleChange}
                  placeholder="Any special requests or notes..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={currentStep === 1 ? onClose : prevStep}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              {currentStep === 1 ? 'Cancel' : 'Previous'}
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Processing Payment...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span className="mr-2">💳</span>
                    <span>Pay ₵{totalAmount}</span>
                  </div>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdvancedPurchaseModal 