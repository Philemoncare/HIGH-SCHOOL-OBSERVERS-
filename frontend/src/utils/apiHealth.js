import axios from 'axios'

/**
 * Check if the backend API is accessible
 * @returns {Promise<{connected: boolean, message: string, details?: any}>}
 */
export async function checkAPIHealth() {
  try {
    const response = await axios.get('/api/health', {
      timeout: 5000 // 5 second timeout
    })
    
    return {
      connected: true,
      message: 'Backend API is accessible',
      details: response.data
    }
  } catch (error) {
    const isNetworkError = !error.response
    const isTimeout = error.code === 'ECONNABORTED'
    
    return {
      connected: false,
      message: isNetworkError 
        ? 'Cannot connect to backend server. Please check your internet connection and API URL.'
        : isTimeout
        ? 'Backend server is not responding. It may be overloaded or temporarily unavailable.'
        : `Backend server returned error: ${error.response?.status}`,
      error: {
        code: error.code,
        message: error.message,
        status: error.response?.status
      }
    }
  }
}

/**
 * Test API connection and log results
 */
export async function testAPIConnection() {
  const result = await checkAPIHealth()
  
  if (result.connected) {
    console.log('✅ Backend API is connected:', result.details)
  } else {
    console.error('❌ Backend API connection failed:', result.message)
    console.error('Error details:', result.error)
  }
  
  return result
}

