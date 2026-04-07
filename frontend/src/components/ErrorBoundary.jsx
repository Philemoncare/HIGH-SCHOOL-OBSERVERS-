import React from 'react'
import { AlertCircle } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Store error info in state for display
    this.setState({ 
      errorInfo: errorInfo?.componentStack || errorInfo?.toString() || 'No additional info'
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Refresh Page
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.href = '/'
                }}
                className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Go to Home
              </button>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left" open>
                <summary className="cursor-pointer text-sm text-gray-500 font-semibold">Error Details (Dev Only)</summary>
                <div className="mt-2 space-y-2">
                  <div className="text-xs bg-red-50 p-3 rounded border border-red-200">
                    <p className="font-semibold text-red-800 mb-1">Error Message:</p>
                    <p className="text-red-700">{this.state.error.toString()}</p>
                  </div>
                  {this.state.error.stack && (
                    <div className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                      <p className="font-semibold text-gray-800 mb-1">Stack Trace:</p>
                      <pre className="text-gray-700 whitespace-pre-wrap">{this.state.error.stack}</pre>
                    </div>
                  )}
                  {this.state.errorInfo && (
                    <div className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                      <p className="font-semibold text-gray-800 mb-1">Component Stack:</p>
                      <pre className="text-gray-700 whitespace-pre-wrap">{this.state.errorInfo}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

