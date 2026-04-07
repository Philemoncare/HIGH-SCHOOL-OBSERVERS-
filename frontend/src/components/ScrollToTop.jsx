import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation()
  const prevLocation = useRef({ pathname, search, hash })
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setShowButton(window.scrollY > 300)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    // Check if location has actually changed
    const hasLocationChanged = 
      prevLocation.current.pathname !== pathname ||
      prevLocation.current.search !== search ||
      prevLocation.current.hash !== hash

    if (hasLocationChanged) {
      const scrollToTop = () => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(scrollToTop)
      })
      prevLocation.current = { pathname, search, hash }
    }
  }, [pathname, search, hash])

  useEffect(() => {
    const handlePopState = () => {
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
      }, 100)
    }
    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {showButton && (
        <button
          onClick={handleClick}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-[10000] rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all w-12 h-12 flex items-center justify-center"
          title="Back to top"
        >
          ↑
        </button>
      )}
    </>
  )
}

export default ScrollToTop 