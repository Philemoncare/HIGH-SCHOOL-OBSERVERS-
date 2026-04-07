import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export const useScrollToTop = () => {
  const { pathname } = useLocation()
  const prevPathname = useRef(pathname)

  useEffect(() => {
    // Only scroll to top if the pathname has changed
    if (prevPathname.current !== pathname) {
      // Smooth scroll to top
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
      
      // Update the previous pathname
      prevPathname.current = pathname
    }
  }, [pathname])

  // Function to manually scroll to top
  const scrollToTop = (behavior = 'smooth') => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior
    })
  }

  // Function to scroll to a specific element
  const scrollToElement = (elementId, offset = 0) => {
    const element = document.getElementById(elementId)
    if (element) {
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  return { scrollToTop, scrollToElement }
} 