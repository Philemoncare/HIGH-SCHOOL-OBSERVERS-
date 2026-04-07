import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

const GSI_SCRIPT = 'https://accounts.google.com/gsi/client'

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(script)
  })
}

const SocialLogin = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false)
  const googleButtonRef = useRef(null)
  const handlerRef = useRef(null)
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  const handleGoogleCredential = async (credential) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        const msg = data.error || 'Social login failed. Please try again.'
        toast.error(msg, { id: 'social-login-error' })
        if (onError) onError(new Error(msg))
        return
      }
      if (data.token && data.user) {
        toast.success('Signed in with Google!', { id: 'social-login' })
        if (onSuccess) onSuccess({ token: data.token, user: data.user })
      } else {
        throw new Error('Unexpected response from server')
      }
    } catch (err) {
      const msg = err.message || 'Social login failed. Please try again.'
      toast.error(msg, { id: 'social-login-error' })
      if (onError) onError(err)
    } finally {
      setLoading(false)
    }
  }

  const simulateNotConfigured = (provider) => {
    toast.error(`${provider} login is not configured yet`, { id: 'social-not-configured' })
    if (onError) onError(new Error(`${provider} login not configured`))
  }

  handlerRef.current = handleGoogleCredential

  useEffect(() => {
    if (!clientId || !googleButtonRef.current) return
    loadScript(GSI_SCRIPT)
      .then(() => {
        if (typeof window.google === 'undefined' || !window.google.accounts) return
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (res) => {
            if (res.credential && handlerRef.current) handlerRef.current(res.credential)
          }
        })
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          width: googleButtonRef.current?.offsetWidth || 320
        })
      })
      .catch(() => {
        toast.error('Failed to load Google Sign-In', { id: 'social-load-error' })
      })
  }, [clientId])

  return (
    <div className="space-y-3">
      {clientId ? (
        <div
          ref={googleButtonRef}
          className="w-full min-h-[44px] flex items-center justify-center rounded-lg border border-gray-300 bg-white overflow-hidden"
          style={{ maxWidth: '100%' }}
        />
      ) : (
        <button
          type="button"
          disabled={loading}
          onClick={() => simulateNotConfigured('Google')}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.954,4,4,12.954,4,24 s8.954,20,20,20s20-8.954,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,19.013,13,24,13c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C34.046,6.053,29.268,4,24,4C16.318,4,9.781,8.337,6.306,14.691z"/>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.192,0-9.607-3.317-11.248-7.946l-6.542,5.036C9.635,39.556,16.337,44,24,44z"/>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.094,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
          </svg>
          <span>Continue with Google</span>
        </button>
      )}
    </div>
  )
}

export default SocialLogin
