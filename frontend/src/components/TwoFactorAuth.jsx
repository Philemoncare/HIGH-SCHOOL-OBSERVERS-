import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Mail,
  Phone,
  Clock,
  Key,
  ArrowLeft
} from 'lucide-react'
import toast from 'react-hot-toast'

function TwoFactorAuth({ 
  isOpen, 
  onClose, 
  onSuccess, 
  userEmail, 
  verificationMethod = 'email' 
}) {
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [showResend, setShowResend] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const inputRef = useRef(null)

  const MAX_ATTEMPTS = 3
  const LOCKOUT_TIME = 300 // 5 minutes in seconds
  const RESEND_COOLDOWN = 60 // 1 minute in seconds

  useEffect(() => {
    if (isOpen) {
      setVerificationCode('')
      setAttempts(0)
      setIsLocked(false)
      setTimeLeft(0)
      setShowResend(false)
      // Focus on input when modal opens
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    let timer
    if (timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    } else if (timeLeft === 0 && !showResend) {
      setShowResend(true)
    }
    return () => clearTimeout(timer)
  }, [timeLeft, showResend])

  useEffect(() => {
    let timer
    if (isLocked && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    } else if (isLocked && timeLeft === 0) {
      setIsLocked(false)
      setAttempts(0)
    }
    return () => clearTimeout(timer)
  }, [isLocked, timeLeft])

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setVerificationCode(value)
    
    // Auto-submit when 6 digits are entered
    if (value.length === 6) {
      handleVerify()
    }
  }

  const handleVerify = async () => {
    if (isLocked || verificationCode.length !== 6) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: verificationCode,
          email: userEmail
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Verification successful!')
        onSuccess(data.token, data.user)
      } else {
        setAttempts(prev => prev + 1)
        setVerificationCode('')
        inputRef.current?.focus()
        
        if (attempts + 1 >= MAX_ATTEMPTS) {
          setIsLocked(true)
          setTimeLeft(LOCKOUT_TIME)
          toast.error('Too many failed attempts. Please try again in 5 minutes.')
        } else {
          toast.error(`Invalid code. ${MAX_ATTEMPTS - attempts - 1} attempts remaining.`)
        }
      }
    } catch (error) {
      toast.error('Verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (resendLoading || timeLeft > 0) return

    setResendLoading(true)
    try {
      const response = await fetch('/api/auth/resend-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          method: verificationMethod
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Verification code sent successfully!')
        setTimeLeft(RESEND_COOLDOWN)
        setShowResend(false)
      } else {
        toast.error(data.error || 'Failed to send verification code')
      }
    } catch (error) {
      toast.error('Failed to send verification code')
    } finally {
      setResendLoading(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Two-Factor Authentication
            </h2>
            <p className="text-gray-600">
              Enter the 6-digit code sent to your {verificationMethod}
            </p>
            <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500">
              <Mail className="w-4 h-4" />
              <span>{userEmail}</span>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Verification Code
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={verificationCode}
                  onChange={handleCodeChange}
                  disabled={isLocked || isLoading}
                  className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="000000"
                  maxLength={6}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Key className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
            {attempts > 0 && !isLocked && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  {MAX_ATTEMPTS - attempts} attempts remaining
                </span>
              </div>
            )}
            {isLocked && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <Lock className="w-5 h-5 text-red-600" />
                <span className="text-sm text-red-800">
                  Account temporarily locked. Try again in {formatTime(timeLeft)}
                </span>
              </div>
            )}
            <div className="space-y-3">
              <button
                onClick={handleVerify}
                disabled={isLoading || isLocked || verificationCode.length !== 6}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Verify Code
                  </>
                )}
              </button>
              {showResend && !isLocked && (
                <button
                  onClick={handleResendCode}
                  disabled={resendLoading || timeLeft > 0}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {resendLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : timeLeft > 0 ? (
                    <>
                      <Clock className="w-5 h-5" />
                      Resend in {formatTime(timeLeft)}
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Resend Code
                    </>
                  )}
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Security Notice</p>
                <p className="text-xs text-blue-600 mt-1">
                  This extra step helps protect your account from unauthorized access.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default TwoFactorAuth
