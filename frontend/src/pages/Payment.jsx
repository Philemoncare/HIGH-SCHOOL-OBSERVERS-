import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { PAYSTACK_PUBLIC_KEY } from '../utils/paystackConfig'
import { 
  CreditCard, 
  Smartphone, 
  Shield, 
  CheckCircle,
  ArrowLeft,
  User,
  School,
  Mail,
  Phone
} from 'lucide-react'

function Payment() {
  const [searchParams] = useSearchParams()
  const membershipType = searchParams.get('type') // 'school-representative' or 'official-member'
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  
  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    schoolName: '',
    role: 'student'
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [paystackLoaded, setPaystackLoaded] = useState(false)

  // Load Paystack script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.async = true
    script.onload = () => setPaystackLoaded(true)
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const membershipDetails = {
    'school-representative': {
      title: 'School Representative',
      price: 25,
      description: 'For pre-tertiary students',
      benefits: ['Brand T-shirt', 'All events access', 'Monthly renewal: GHC 20']
    },
    'official-member': {
      title: 'Official Member',
      price: 50,
      description: 'For graduates and tertiary students',
      benefits: ['Brand T-shirt', 'All events access', 'Priority support', 'Monthly renewal: GHC 20']
    }
  }

  const currentMembership = membershipDetails[membershipType] || membershipDetails['school-representative']

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method)
    setStep(3)
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    setIsProcessing(true)
    
    if (!paystackLoaded) {
      toast.error('Payment system is loading, please try again')
      setIsProcessing(false)
      return
    }

    try {
      // Validate Paystack public key
      if (!PAYSTACK_PUBLIC_KEY || !PAYSTACK_PUBLIC_KEY.startsWith('pk_')) {
        toast.error('Payment system not configured. Please contact support.')
        console.error('Invalid Paystack public key')
        setIsProcessing(false)
        return
      }

      // Initialize Paystack payment
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY, // Use configured public key
        email: formData.email,
        amount: currentMembership.price * 100, // Convert to kobo (smallest currency unit)
        currency: 'GHS',
        ref: `MEMBERSHIP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique reference
        callback: function(response) {
          // Payment successful
          setIsProcessing(false)
          setStep(4)
          toast.success('Payment successful! Welcome to HSO!')
          
          // Here you would typically send the payment reference to your backend
          console.log('Payment reference:', response.reference)
          
          // TODO: Send payment verification to backend
          // axios.post('/api/payments/verify', { reference: response.reference })
        },
        onClose: function() {
          // Payment cancelled
          setIsProcessing(false)
          toast.error('Payment was cancelled')
        }
      })
      handler.openIframe()
    } catch (error) {
      setIsProcessing(false)
      toast.error('Payment failed. Please try again.')
      console.error('Payment error:', error)
    }
  }

  const handleCompleteRegistration = () => {
    // Here you would typically create the user account
    toast.success('Registration completed successfully!')
    navigate('/dashboard')
  }

  if (!membershipType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Invalid Membership Type</h2>
          <p className="text-gray-600 mb-6">Please select a membership type to continue.</p>
          <BackButton
            fallbackPath="/about"
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Go Back to About
          </BackButton>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Payment - High School Observer</title>
        <meta name="description" content="Complete your HSO membership payment" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <BackButton
              fallbackPath="/about"
              className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4"
            >
              Back to About
            </BackButton>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Complete Your Membership</h1>
            <p className="text-gray-600">Join HSO and start your journey with us</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                {step === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Information</h2>
                    <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            placeholder="Enter your first name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            placeholder="Enter your last name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            placeholder="Enter your email"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            placeholder="Enter your phone number"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">School Name *</label>
                          <input
                            type="text"
                            name="schoolName"
                            value={formData.schoolName}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            placeholder="Enter your school name"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full mt-6 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                      >
                        Continue to Payment
                      </button>
                    </form>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose Payment Method</h2>
                    <div className="space-y-4">
                      <button
                        onClick={() => handlePaymentMethodSelect('mobile-money')}
                        className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                      >
                        <div className="flex items-center">
                          <Smartphone className="w-6 h-6 text-blue-600 mr-3" />
                          <div>
                            <h3 className="font-semibold text-gray-800">Mobile Money</h3>
                            <p className="text-sm text-gray-600">Pay with MTN, Vodafone, or AirtelTigo</p>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => handlePaymentMethodSelect('card')}
                        className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
                      >
                        <div className="flex items-center">
                          <CreditCard className="w-6 h-6 text-green-600 mr-3" />
                          <div>
                            <h3 className="font-semibold text-gray-800">Credit/Debit Card</h3>
                            <p className="text-sm text-gray-600">Pay with Visa, Mastercard, or other cards</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                      {paymentMethod === 'mobile-money' ? 'Mobile Money Payment' : 'Card Payment'}
                    </h2>
                    <form onSubmit={handlePaymentSubmit}>
                      {paymentMethod === 'mobile-money' ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Money Number</label>
                            <input
                              type="tel"
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                              placeholder="Enter your mobile money number"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                              <option>MTN Mobile Money</option>
                              <option>Vodafone Cash</option>
                              <option>AirtelTigo Money</option>
                            </select>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                            <input
                              type="text"
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                              placeholder="1234 5678 9012 3456"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                              <input
                                type="text"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                placeholder="MM/YY"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                              <input
                                type="text"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                placeholder="123"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full mt-6 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {isProcessing ? 'Processing Payment...' : `Pay GHC ${currentMembership.price}`}
                      </button>
                    </form>
                  </div>
                )}

                {step === 4 && (
                  <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Successful!</h2>
                    <p className="text-gray-600 mb-6">Welcome to HSO! Your membership has been activated.</p>
                    <button
                      onClick={handleCompleteRegistration}
                      className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                      Continue to Dashboard
                    </button>
                  </div>
                )}
              </div>
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{currentMembership.title}</h2>
                  <p className="text-gray-600">{currentMembership.description}</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 mb-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-red-600 mb-2">GHC {currentMembership.price}</div>
                    <p className="text-gray-600">One-time registration fee</p>
                    <p className="text-sm text-gray-500 mt-2">Monthly renewal: GHC 20</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Membership Benefits:</h3>
                  <ul className="space-y-2">
                    {currentMembership.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <Shield className="w-5 h-5 text-blue-600 mr-2" />
                    <h4 className="font-semibold text-blue-800">Secure Payment</h4>
                  </div>
                  <p className="text-sm text-blue-700">
                    Your payment information is encrypted and secure. We use industry-standard security protocols.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Payment 