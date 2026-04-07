import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useNavigation } from '../contexts/NavigationContext'

function ShopVerification() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { goBack } = useNavigation()
  const [verifying, setVerifying] = useState(true)
  const [verificationResult, setVerificationResult] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3

  const verifyPayment = async (referenceToVerify = null) => {
    try {
      const reference = referenceToVerify || searchParams.get('reference')
      const trxref = searchParams.get('trxref')

      if (!reference && !trxref) {
        setVerificationResult({ success: false, message: 'No payment reference found. Please check your payment confirmation or contact support.' })
        setVerifying(false)
        return
      }

      const paymentRef = reference || trxref
      console.log('Verifying payment with reference:', paymentRef)

      // Verify the payment
      const response = await axios.post('/api/payments/shop/verify', {
        reference: paymentRef
      })

      if (response.data.success) {
        setVerificationResult({
          success: true,
          message: 'Purchase successful!',
          product_name: response.data.product_name,
          quantity: response.data.quantity,
          amount: response.data.amount,
          reference: paymentRef
        })
        toast.success('Purchase completed successfully! Check your email for the receipt.')
        setVerifying(false)
      } else {
        throw new Error(response.data.error || 'Payment verification failed')
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Payment verification failed'
      
      // Retry logic for network errors or temporary failures
      if (retryCount < maxRetries && (
        errorMessage.includes('network') || 
        errorMessage.includes('timeout') ||
        errorMessage.includes('ECONNREFUSED') ||
        error.response?.status >= 500
      )) {
        const newRetryCount = retryCount + 1
        setRetryCount(newRetryCount)
        console.log(`Retrying verification (attempt ${newRetryCount}/${maxRetries})...`)
        toast.loading(`Retrying verification (${newRetryCount}/${maxRetries})...`, { id: 'retry-toast' })
        
        // Wait 2 seconds before retry
        setTimeout(() => {
          verifyPayment()
        }, 2000)
        return
      }
      
      setVerificationResult({
        success: false,
        message: errorMessage,
        canRetry: retryCount < maxRetries
      })
      toast.error(errorMessage, { id: 'error-toast' })
      setVerifying(false)
    }
  }

  useEffect(() => {
    verifyPayment()
  }, [])

  const handleContinue = () => {
    goBack('/shop')
  }

  const handleTryAgain = () => {
    const reference = searchParams.get('reference') || searchParams.get('trxref')
    if (reference) {
      setRetryCount(0)
      setVerifying(true)
      setVerificationResult(null)
      verifyPayment(reference)
    } else {
      navigate('/shop')
    }
  }

  return (
    <>
      <Helmet>
        <title>Purchase Verification - High School Observer</title>
        <meta name="description" content="Verifying your purchase" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full border border-gray-100">
          {verifying ? (
            <div className="text-center py-8">
              <div className="relative mx-auto mb-6">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-red-100 border-t-red-600 mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-red-600 text-2xl">🛒</span>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Verifying Your Purchase</h2>
              <p className="text-gray-600 text-lg mb-2">Please wait while we confirm your payment...</p>
              <p className="text-sm text-gray-500">This usually takes just a few seconds</p>
            </div>
          ) : verificationResult ? (
            <div>
              {verificationResult.success ? (
                <>
                  <div className="text-center mb-8">
                    <div className="relative mx-auto mb-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg transform transition-transform hover:scale-105">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                      Purchase Successful!
                    </h2>
                    <p className="text-lg text-gray-600 mb-1">
                      🎉 Thank you for your purchase!
                    </p>
                    <p className="text-base text-gray-500">
                      Your order has been confirmed and is being processed
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">📦</span>
                      Order Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-600">Product:</span>
                        <span className="font-semibold text-gray-900">{verificationResult.quantity}x {verificationResult.product_name}</span>
                      </div>
                      {verificationResult.amount && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-gray-600">Amount Paid:</span>
                          <span className="font-bold text-xl text-green-600">₵{verificationResult.amount}</span>
                        </div>
                      )}
                      {verificationResult.reference && (
                        <div className="flex justify-between items-start py-2">
                          <span className="text-gray-600">Order Reference:</span>
                          <span className="font-mono text-sm text-gray-700 bg-white px-2 py-1 rounded border">{verificationResult.reference}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-5 mb-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                      <span className="mr-2">📧</span>
                      What Happens Next?
                    </h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li className="flex items-start">
                        <span className="mr-2 mt-1">✓</span>
                        <span>You will receive a confirmation email with your receipt within the next few minutes</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 mt-1">✓</span>
                        <span>Our team will process your order and prepare it for shipping</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 mt-1">✓</span>
                        <span>You'll receive shipping updates via email once your order is dispatched</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 mt-1">✓</span>
                        <span>Expected delivery time: 3-5 business days (standard shipping)</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                    <p className="text-sm text-gray-600 text-center">
                      <span className="font-semibold">Need Help?</span> If you have any questions about your order, 
                      please contact our support team with your order reference number above.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={handleContinue}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                    >
                      Continue Shopping
                    </button>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium transition-colors"
                    >
                      View My Orders
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Verification Failed</h2>
                    <p className="text-lg text-gray-600 mb-2">
                      {verificationResult.message}
                    </p>
                    {verificationResult.reference && (
                      <div className="mt-4 inline-block bg-gray-100 rounded-lg px-4 py-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Reference:</span>{' '}
                          <span className="font-mono text-gray-800">{verificationResult.reference}</span>
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-5 mb-6">
                    <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center">
                      <span className="mr-2">⚠️</span>
                      Important Notice
                    </h3>
                    <div className="space-y-2 text-sm text-yellow-800">
                      <p>
                        <strong>Don't worry!</strong> If you completed the payment, your transaction may still be processing.
                      </p>
                      <p>
                        Please check your email inbox (and spam folder) for a receipt. Payment processing can sometimes take a few minutes.
                      </p>
                      <p>
                        If you don't receive a receipt within 10-15 minutes, please contact our support team with your payment reference number above.
                      </p>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">What Should You Do?</h3>
                    <ol className="space-y-2 text-sm text-blue-800 list-decimal list-inside">
                      <li>Check your email for a payment confirmation</li>
                      <li>Wait a few minutes and try verifying again</li>
                      <li>If payment was successful, you'll receive your receipt via email</li>
                      <li>Contact support if you need assistance</li>
                    </ol>
                  </div>
                  <div className="space-y-3">
                    {verificationResult.canRetry && (
                      <button
                        onClick={handleTryAgain}
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                      >
                        🔄 Retry Verification
                      </button>
                    )}
                    <button
                      onClick={handleContinue}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-xl font-medium transition-colors"
                    >
                      Back to Shop
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-gray-400 text-3xl">❓</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Verification Error</h2>
              <p className="text-lg text-gray-600 mb-2">Unable to verify your purchase</p>
              <p className="text-sm text-gray-500 mb-8">
                Please check your payment confirmation or contact support for assistance
              </p>
              <button
                onClick={handleContinue}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all transform hover:scale-[1.02] shadow-lg"
              >
                Back to Shop
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ShopVerification 