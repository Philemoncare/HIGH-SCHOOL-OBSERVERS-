import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import axios from 'axios'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

function EventVerification() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [verifying, setVerifying] = useState(true)
  const [verificationResult, setVerificationResult] = useState(null)

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const reference = searchParams.get('reference')
        const trxref = searchParams.get('trxref')

        if (!reference && !trxref) {
          setVerificationResult({ success: false, message: 'No payment reference found' })
          setVerifying(false)
          return
        }

        const paymentRef = reference || trxref

        // Verify the payment
        const response = await axios.post('/api/payments/events/verify', {
          reference: paymentRef
        })

        if (response.data.success) {
          setVerificationResult({
            success: true,
            message: 'Event registration successful!',
            event_title: response.data.event_title,
            attendee_name: response.data.attendee_name,
            amount: response.data.amount
          })
          toast.success('Event registration successful! Check your email for confirmation.')
        } else {
          setVerificationResult({
            success: false,
            message: 'Payment verification failed'
          })
          toast.error('Payment verification failed')
        }
      } catch (error) {
        console.error('Payment verification error:', error)
        setVerificationResult({
          success: false,
          message: error.response?.data?.error || 'Payment verification failed'
        })
        toast.error('Payment verification failed')
      } finally {
        setVerifying(false)
      }
    }

    verifyPayment()
  }, [searchParams])

  const handleContinue = () => {
    navigate('/events')
  }

  const handleViewEvents = () => {
    navigate('/events')
  }

  return (
    <>
      <Helmet>
        <title>Event Registration Verification - High School Observer</title>
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center py-8">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            {verifying ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Payment</h2>
                <p className="text-gray-600">Please wait while we verify your event registration payment...</p>
              </div>
            ) : verificationResult ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                {verificationResult.success ? (
                  <>
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <span className="text-green-600 text-2xl">✓</span>
                    </motion.div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
                    <p className="text-gray-600 mb-4">
                      Thank you for registering for <strong>{verificationResult.event_title}</strong>
                    </p>
                    <div className="bg-green-50 rounded-lg p-4 mb-6">
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Attendee:</strong> {verificationResult.attendee_name}</p>
                        <p><strong>Amount Paid:</strong> ₵{verificationResult.amount}</p>
                        <p><strong>Event:</strong> {verificationResult.event_title}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">
                      You will receive a confirmation email with event details and instructions shortly.
                    </p>
                    <div className="space-y-3">
                      <button
                        onClick={handleContinue}
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition-all duration-200"
                      >
                        Continue to Events
                      </button>
                      <button
                        onClick={() => navigate('/')}
                        className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      >
                        Go to Homepage
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <span className="text-red-600 text-2xl">✕</span>
                    </motion.div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Failed</h2>
                    <p className="text-gray-600 mb-6">
                      {verificationResult.message}
                    </p>
                    <div className="space-y-3">
                      <button
                        onClick={handleViewEvents}
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition-all duration-200"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={() => navigate('/')}
                        className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      >
                        Go to Homepage
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default EventVerification 