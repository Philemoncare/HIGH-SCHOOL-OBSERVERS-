// Advanced scroll management utilities

/**
 * Smoothly scroll to the top of the page
 * @param {string} behavior - 'smooth' or 'auto'
 */
export const scrollToTop = (behavior = 'smooth') => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior
  })
}

/**
 * Scroll to a specific element by ID
 * @param {string} elementId - The ID of the element to scroll to
 * @param {number} offset - Additional offset from the element
 * @param {string} behavior - 'smooth' or 'auto'
 */
export const scrollToElement = (elementId, offset = 0, behavior = 'smooth') => {
  const element = document.getElementById(elementId)
  if (element) {
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - offset
    
    window.scrollTo({
      top: offsetPosition,
      behavior
    })
  }
}

/**
 * Scroll to a specific element by selector
 * @param {string} selector - CSS selector for the element
 * @param {number} offset - Additional offset from the element
 * @param {string} behavior - 'smooth' or 'auto'
 */
export const scrollToSelector = (selector, offset = 0, behavior = 'smooth') => {
  const element = document.querySelector(selector)
  if (element) {
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - offset
    
    window.scrollTo({
      top: offsetPosition,
      behavior
    })
  }
}

/**
 * Get current scroll position
 * @returns {number} Current scroll Y position
 */
export const getScrollPosition = () => {
  return window.pageYOffset || document.documentElement.scrollTop
}

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - The element to check
 * @param {number} threshold - Threshold for considering element in view (0-1)
 * @returns {boolean} True if element is in viewport
 */
export const isElementInViewport = (element, threshold = 0.1) => {
  if (!element) return false
  
  const rect = element.getBoundingClientRect()
  const windowHeight = window.innerHeight || document.documentElement.clientHeight
  
  return (
    rect.top <= windowHeight * (1 - threshold) &&
    rect.bottom >= windowHeight * threshold
  )
}

/**
 * Scroll restoration for browser back/forward navigation
 * @param {string} key - Unique key for the scroll position
 */
export const saveScrollPosition = (key) => {
  const position = getScrollPosition()
  sessionStorage.setItem(`scroll_${key}`, position.toString())
}

/**
 * Restore scroll position
 * @param {string} key - Unique key for the scroll position
 * @param {string} behavior - 'smooth' or 'auto'
 */
export const restoreScrollPosition = (key, behavior = 'smooth') => {
  const savedPosition = sessionStorage.getItem(`scroll_${key}`)
  if (savedPosition) {
    const position = parseInt(savedPosition, 10)
    window.scrollTo({
      top: position,
      behavior
    })
  }
}

/**
 * Clear saved scroll position
 * @param {string} key - Unique key for the scroll position
 */
export const clearScrollPosition = (key) => {
  sessionStorage.removeItem(`scroll_${key}`)
}

/**
 * Debounced scroll handler
 * @param {Function} callback - Function to call on scroll
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced scroll handler
 */
export const createDebouncedScrollHandler = (callback, delay = 100) => {
  let timeoutId
  return () => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(callback, delay)
  }
}

/**
 * Throttled scroll handler
 * @param {Function} callback - Function to call on scroll
 * @param {number} limit - Minimum time between calls in milliseconds
 * @returns {Function} Throttled scroll handler
 */
export const createThrottledScrollHandler = (callback, limit = 100) => {
  let inThrottle
  return () => {
    if (!inThrottle) {
      callback()
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
} 