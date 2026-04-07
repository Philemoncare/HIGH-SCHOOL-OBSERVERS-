import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useNavigation } from '../contexts/NavigationContext'

function PaymentVerification() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { goBack } = useNavigation()
  const [verifying, setVerifying] = useState(true)
  const [verificationResult, setVerificationResult] = useState(null)

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const reference = searchParams.get('reference')
        const trxref = searchParams.get('trxref')
        const type = searchParams.get('type') || 'donations' // Default to donations for backward compatibility

        if (!reference && !trxref) {
          setVerificationResult({ success: false, message: 'No payment reference found' })
          setVerifying(false)
          return
        }

        const paymentRef = reference || trxref

        // Determine the verification endpoint based on payment type
        let verifyEndpoint = '/api/payments/donations/verify'
        if (type === 'membership') {
          verifyEndpoint = '/api/payments/membership/verify'
        } else if (type === 'shop') {
          verifyEndpoint = '/api/payments/shop/verify'
        } else if (type === 'events') {
          verifyEndpoint = '/api/payments/events/verify'
        }

        // Verify the payment
        const response = await axios.post(verifyEndpoint, {
          reference: paymentRef
        })

        if (response.data.success) {
          setVerificationResult({
            success: true,
            message: 'Payment successful!',
            amount: response.data.amount,
            type: type,
            membershipType: response.data.membershipType,
            memberName: response.data.memberName,
            campaign_title: response.data.campaign_title,
            event_title: response.data.event_title
          })
          
          if (type === 'membership') {
            toast.success('Membership payment successful! Welcome to HSO!')
          } else if (type === 'shop') {
            toast.success('Purchase successful! Your order will be processed soon.')
          } else if (type === 'events') {
            toast.success('Event registration successful!')
          } else {
            toast.success('Donation successful! Thank you for your contribution.')
          }
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
    const type = searchParams.get('type')
    if (type === 'membership') {
      navigate('/dashboard')
    } else if (type === 'shop') {
      goBack('/shop')
    } else {
      goBack('/events')
    }
  }

  const handleTryAgain = () => {
    const type = searchParams.get('type')
    if (type === 'membership') {
      navigate('/')
    } else if (type === 'shop') {
      navigate('/shop')
    } else if (type === 'events') {
      navigate('/events')
    } else {
      navigate('/events')
    }
  }

  return (
    <>
      <Helmet>
        <title>Payment Verification - High School Observer</title>
        <meta name="description" content="Verifying your payment" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          {verifying ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
              <p className="text-gray-600">Please wait while we verify your payment...</p>
            </div>
          ) : verificationResult ? (
            <div className="text-center">
              {verificationResult.success ? (
                <>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-600 text-2xl">✓</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                  <p className="text-gray-600 mb-4">
                    {verificationResult.type === 'membership' ? (
                      <>
                        Welcome to HSO, {verificationResult.memberName}! Your {verificationResult.membershipType} membership has been activated.
                        <br />
                        <span className="text-sm">Amount paid: ₵{verificationResult.amount}</span>
                      </>
                    ) : verificationResult.type === 'shop' ? (
                      <>
                        Your purchase of ₵{verificationResult.amount} was successful!
                      </>
                    ) : verificationResult.type === 'events' ? (
                      <>
                        Your event registration for {verificationResult.event_title} was successful!
                        <br />
                        <span className="text-sm">Amount paid: ₵{verificationResult.amount}</span>
                      </>
                    ) : (
                      <>
                        Thank you for your donation of ₵{verificationResult.amount} to {verificationResult.campaign_title}
                      </>
                    )}
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    You will receive a confirmation email shortly.
                  </p>
                  <button
                    onClick={handleContinue}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    {verificationResult.type === 'membership' ? 'Go to Dashboard' : 
                     verificationResult.type === 'shop' ? 'Continue Shopping' :
                     verificationResult.type === 'events' ? 'View Events' :
                     'Continue to Donations'}
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-red-600 text-2xl">✗</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
                  <p className="text-gray-600 mb-6">
                    {verificationResult.message}
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={handleTryAgain}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={handleContinue}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      Back to Donations
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Error</h2>
              <p className="text-gray-600 mb-6">Unable to verify payment</p>
              <button
                onClick={handleContinue}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Back to Donations
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default PaymentVerification 